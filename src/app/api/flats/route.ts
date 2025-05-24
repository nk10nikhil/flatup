import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Flat from '@/models/Flat';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const listerType = searchParams.get('listerType');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build filter object
    const filter: any = { isActive: true };

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (listerType) {
      filter.listerType = listerType;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Get flats with pagination
    const flats = await Flat.find(filter)
      .populate('lister', 'name email phone image')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Flat.countDocuments(filter);

    return NextResponse.json({
      flats,
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user has active subscription
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.subscription?.status || user.subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required to create listings' },
        { status: 403 }
      );
    }

    const flatData = await request.json();

    // Validate required fields
    const requiredFields = [
      'title',
      'description',
      'price',
      'location',
      'type',
      'availableRooms',
      'totalRooms',
      'images',
      'availableFrom',
    ];

    for (const field of requiredFields) {
      if (!flatData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create flat
    const flat = await Flat.create({
      ...flatData,
      lister: user._id,
      listerType: user.role,
    });

    // Populate lister info
    await flat.populate('lister', 'name email phone image');

    return NextResponse.json(
      {
        message: 'Flat created successfully',
        flat,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create flat error:', error);
    return NextResponse.json(
      { error: 'Failed to create flat' },
      { status: 500 }
    );
  }
}
