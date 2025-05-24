import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Flat from '@/models/Flat';
import InterestInquiry from '@/models/InterestInquiry';
import Subscription from '@/models/Subscription';

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

    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalFlats = await Flat.countDocuments();
    const totalInquiries = await InterestInquiry.countDocuments();
    const activeFlats = await Flat.countDocuments({ isActive: true });

    // Get total views
    const viewsResult = await Flat.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult[0]?.totalViews || 0;

    // Get user registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get listings by month (last 6 months)
    const listingsByMonth = await Flat.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get flats by type
    const flatsByType = await Flat.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top cities by listings
    const topCities = await Flat.aggregate([
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activity (last 10 users and flats)
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentFlats = await Flat.find()
      .select('title location.city price listerType createdAt')
      .populate('lister', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get inquiries by status
    const inquiriesByStatus = await InterestInquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate revenue (mock calculation based on user roles)
    const revenueByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    let totalRevenue = 0;
    revenueByRole.forEach(role => {
      if (role._id === 'broker') totalRevenue += role.count * 1000;
      else if (role._id === 'owner') totalRevenue += role.count * 800;
      else if (role._id === 'room_sharer') totalRevenue += role.count * 500;
    });

    // Get new signups today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newSignupsToday = await User.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get expiring subscriptions (mock - in 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // This would be calculated from actual subscription data
    const expiringSubscriptions = Math.floor(totalUsers * 0.05); // Mock 5% expiring

    return NextResponse.json({
      overview: {
        totalUsers,
        totalFlats,
        totalViews,
        totalInquiries,
        activeFlats,
        totalRevenue,
        newSignupsToday,
        expiringSubscriptions,
      },
      charts: {
        userRegistrations,
        listingsByMonth,
        usersByRole,
        flatsByType,
        inquiriesByStatus,
      },
      topCities,
      recentActivity: {
        users: recentUsers,
        flats: recentFlats,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
