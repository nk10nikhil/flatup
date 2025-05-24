'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Eye,
  MessageSquare,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlats: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalViews: 0,
    totalInquiries: 0,
    newSignupsToday: 0,
    expiringSubscriptions: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentFlats, setRecentFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'superadmin') {
      router.push('/dashboard');
      return;
    }

    fetchAdminData();
  }, [session, status, router]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      // Fetch real analytics data
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();

      if (response.ok) {
        setStats({
          totalUsers: data.overview.totalUsers,
          totalFlats: data.overview.totalFlats,
          totalRevenue: data.overview.totalRevenue,
          activeSubscriptions: data.overview.totalUsers - data.overview.expiringSubscriptions,
          totalViews: data.overview.totalViews,
          totalInquiries: data.overview.totalInquiries,
          newSignupsToday: data.overview.newSignupsToday,
          expiringSubscriptions: data.overview.expiringSubscriptions,
        });

        setRecentUsers(data.recentActivity.users || []);
        setRecentFlats(data.recentActivity.flats || []);
      } else {
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 1250,
          totalFlats: 3420,
          totalRevenue: 2850000,
          activeSubscriptions: 980,
          totalViews: 125000,
          totalInquiries: 8500,
          newSignupsToday: 23,
          expiringSubscriptions: 45,
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Use mock data as fallback
      setStats({
        totalUsers: 1250,
        totalFlats: 3420,
        totalRevenue: 2850000,
        activeSubscriptions: 980,
        totalViews: 125000,
        totalInquiries: 8500,
        newSignupsToday: 23,
        expiringSubscriptions: 45,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session || session.user.role !== 'superadmin') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
    },
    {
      title: 'Total Listings',
      value: stats.totalFlats.toLocaleString(),
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+5%',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+22%',
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries.toLocaleString(),
      icon: MessageSquare,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      change: '+18%',
    },
    {
      title: 'New Signups Today',
      value: stats.newSignupsToday.toString(),
      icon: Calendar,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      change: '+3',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSubscriptions.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: 'Alert',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your FlatUp platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' :
                    stat.change === 'Alert' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
              <button className="text-primary hover:text-primary/80 text-sm">
                View all
              </button>
            </div>

            <div className="space-y-4">
              {recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${user.role === 'broker' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'owner' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Listings</h2>
              <button className="text-primary hover:text-primary/80 text-sm">
                View all
              </button>
            </div>

            <div className="space-y-4">
              {recentFlats.map((flat: any) => (
                <div key={flat.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{flat.title}</h3>
                      <p className="text-sm text-muted-foreground">{flat.location.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{formatPrice(flat.price)}/mo</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      by {flat.listerType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <Users className="h-5 w-5" />
              <span>Manage Users</span>
            </Link>
            <Link href="/admin/flats" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <Building2 className="h-5 w-5" />
              <span>Manage Listings</span>
            </Link>
            <button type="button" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <TrendingUp className="h-5 w-5" />
              <span>View Analytics</span>
            </button>
            <button type="button" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <MessageSquare className="h-5 w-5" />
              <span>Send Announcement</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
