import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import InterestInquiry from '@/models/InterestInquiry';
import Flat from '@/models/Flat';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { status } = await request.json();

    // Validate status
    if (!['pending', 'contacted', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find the inquiry and check if the user owns the flat
    const inquiry = await InterestInquiry.findById(params.id).populate('flat');
    
    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // Check if the user owns the flat that this inquiry is for
    if (inquiry.flat.lister.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the inquiry status
    const updatedInquiry = await InterestInquiry.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).populate('flat', 'title images location price');

    return NextResponse.json({
      message: 'Inquiry status updated successfully',
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
