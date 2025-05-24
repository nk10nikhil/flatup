import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Flat from '@/models/Flat';
import InterestInquiry from '@/models/InterestInquiry';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const listerType = searchParams.get('listerType');

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      } else if (status === 'featured') {
        filter.isFeatured = true;
      }
    }

    if (city && city !== 'all') {
      filter['location.city'] = city;
    }

    if (listerType && listerType !== 'all') {
      filter.listerType = listerType;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Get flats with pagination
    const flats = await Flat.find(filter)
      .populate('lister', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Flat.countDocuments(filter);

    // Get inquiry counts for each flat
    const flatsWithStats = await Promise.all(
      flats.map(async (flat) => {
        const inquiryCount = await InterestInquiry.countDocuments({ flat: flat._id });
        return {
          ...flat,
          inquiryCount,
        };
      })
    );

    return NextResponse.json({
      flats: flatsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get flats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flats' },
      { status: 500 }
    );
  }
}
