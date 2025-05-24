'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  Calendar,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    activeListings: 0,
  });
  const [recentListings, setRecentListings] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has active subscription
    if (!session.user.role || !['broker', 'owner', 'room_sharer'].includes(session.user.role)) {
      router.push('/payment');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's listings
      const listingsResponse = await fetch('/api/flats?lister=' + session?.user?.id);
      const listingsData = await listingsResponse.json();
      
      // Fetch user's inquiries
      const inquiriesResponse = await fetch('/api/inquiries');
      const inquiriesData = await inquiriesResponse.json();

      if (listingsResponse.ok) {
        const listings = listingsData.flats || [];
        setRecentListings(listings.slice(0, 5));
        
        // Calculate stats
        const totalViews = listings.reduce((sum: number, listing: any) => sum + (listing.views || 0), 0);
        const activeListings = listings.filter((listing: any) => listing.isActive).length;
        
        setStats({
          totalListings: listings.length,
          totalViews,
          totalInquiries: inquiriesData.inquiries?.length || 0,
          activeListings,
        });
      }

      if (inquiriesResponse.ok) {
        setRecentInquiries(inquiriesData.inquiries?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  if (!session) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {session.user.name}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your listings today.
            </p>
          </div>
          <Link href="/dashboard/create-listing" className="btn-primary mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Listings */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Listings</h2>
              <Link href="/dashboard/listings" className="text-primary hover:text-primary/80 text-sm">
                View all
              </Link>
            </div>
            
            {recentListings.length > 0 ? (
              <div className="space-y-4">
                {recentListings.map((listing: any) => (
                  <div key={listing._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                      {listing.images?.[0] && (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{listing.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{listing.location?.city}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-medium text-primary">
                          {formatPrice(listing.price)}/mo
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {listing.views || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No listings yet</p>
                <Link href="/dashboard/create-listing" className="btn-primary mt-4">
                  Create Your First Listing
                </Link>
              </div>
            )}
          </div>

          {/* Recent Inquiries */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Inquiries</h2>
              <Link href="/dashboard/inquiries" className="text-primary hover:text-primary/80 text-sm">
                View all
              </Link>
            </div>
            
            {recentInquiries.length > 0 ? (
              <div className="space-y-4">
                {recentInquiries.map((inquiry: any) => (
                  <div key={inquiry._id} className="p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{inquiry.visitorName}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(inquiry.createdAt))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {inquiry.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        For: {inquiry.flat?.title}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        inquiry.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : inquiry.status === 'contacted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No inquiries yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Inquiries will appear here when people are interested in your listings
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/create-listing" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <Plus className="h-5 w-5" />
              <span>New Listing</span>
            </Link>
            <Link href="/dashboard/analytics" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <TrendingUp className="h-5 w-5" />
              <span>View Analytics</span>
            </Link>
            <Link href="/dashboard/inquiries" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <MessageSquare className="h-5 w-5" />
              <span>Manage Inquiries</span>
            </Link>
            <Link href="/dashboard/subscription" className="btn-outline flex items-center justify-center space-x-2 p-4">
              <Calendar className="h-5 w-5" />
              <span>Subscription</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
