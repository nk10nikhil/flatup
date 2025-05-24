import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Flat from '@/models/Flat';
import InterestInquiry from '@/models/InterestInquiry';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(params.id).select('-password').lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's listings
    const listings = await Flat.find({ lister: params.id }).lean();
    
    // Get user's inquiries (for their listings)
    const inquiries = await InterestInquiry.find({
      flat: { $in: listings.map(l => l._id) }
    }).populate('flat', 'title').lean();

    // Calculate stats
    const stats = {
      totalListings: listings.length,
      activeListings: listings.filter(l => l.isActive).length,
      totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
      totalInquiries: inquiries.length,
      pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
    };

    return NextResponse.json({
      user: {
        ...user,
        stats,
        listings: listings.slice(0, 5), // Recent 5 listings
        inquiries: inquiries.slice(0, 5), // Recent 5 inquiries
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const updateData = await request.json();
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user's listings
    await Flat.deleteMany({ lister: params.id });
    
    // Delete inquiries for user's listings
    const userListings = await Flat.find({ lister: params.id }).select('_id');
    await InterestInquiry.deleteMany({
      flat: { $in: userListings.map(l => l._id) }
    });

    // Delete the user
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
