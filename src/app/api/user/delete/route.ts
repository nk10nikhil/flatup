import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Flat from '@/models/Flat';
import InterestInquiry from '@/models/InterestInquiry';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = session.user.id;

    // Delete user's listings
    await Flat.deleteMany({ lister: userId });
    
    // Delete inquiries for user's listings
    const userListings = await Flat.find({ lister: userId }).select('_id');
    await InterestInquiry.deleteMany({
      flat: { $in: userListings.map(l => l._id) }
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
