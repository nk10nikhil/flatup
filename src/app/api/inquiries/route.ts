import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import InterestInquiry from '@/models/InterestInquiry';
import Flat from '@/models/Flat';
import User from '@/models/User';
import { sendInquiryNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { flatId, visitorName, visitorEmail, visitorPhone, message } = await request.json();

    // Validate input
    if (!flatId || !visitorName || !visitorEmail || !visitorPhone || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if flat exists
    const flat = await Flat.findById(flatId).populate('lister', 'name email');
    if (!flat) {
      return NextResponse.json(
        { error: 'Flat not found' },
        { status: 404 }
      );
    }

    // Create inquiry
    const inquiry = await InterestInquiry.create({
      flat: flatId,
      visitorName,
      visitorEmail,
      visitorPhone,
      message,
    });

    // Send notification email to lister
    try {
      await sendInquiryNotificationEmail(
        flat.lister.email,
        flat.lister.name,
        flat.title,
        visitorName,
        visitorEmail,
        visitorPhone,
        message
      );
    } catch (emailError) {
      console.error('Failed to send inquiry notification email:', emailError);
    }

    return NextResponse.json(
      {
        message: 'Inquiry sent successfully',
        inquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to send inquiry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Get user's flats
    const userFlats = await Flat.find({ lister: session.user.id }).select('_id');
    const flatIds = userFlats.map(flat => flat._id);

    // Build filter
    const filter: any = { flat: { $in: flatIds } };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    // Get inquiries
    const inquiries = await InterestInquiry.find(filter)
      .populate('flat', 'title images location price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await InterestInquiry.countDocuments(filter);

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
