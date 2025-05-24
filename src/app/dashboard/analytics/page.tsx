'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  TrendingUp,
  Eye,
  MessageSquare,
  Building2,
  Calendar,
  Users,
  MapPin,
  Star,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export default function Analytics() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalInquiries: 0,
    totalListings: 0,
    averageViews: 0,
    topPerformingListing: null,
    recentActivity: [],
    viewsThisMonth: 0,
    inquiriesThisMonth: 0,
    conversionRate: 0,
    popularCities: [],
    monthlyData: [],
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics();
    }
  }, [session, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's listings
      const listingsResponse = await fetch(`/api/flats?lister=${session?.user?.id}`);
      const listingsData = await listingsResponse.json();
      
      // Fetch user's inquiries
      const inquiriesResponse = await fetch('/api/inquiries');
      const inquiriesData = await inquiriesResponse.json();

      if (listingsResponse.ok) {
        const listings = listingsData.flats || [];
        const inquiries = inquiriesData.inquiries || [];
        
        // Calculate analytics
        const totalViews = listings.reduce((sum: number, listing: any) => sum + (listing.views || 0), 0);
        const totalInquiries = inquiries.length;
        const totalListings = listings.length;
        const averageViews = totalListings > 0 ? Math.round(totalViews / totalListings) : 0;
        
        // Find top performing listing
        const topPerformingListing = listings.reduce((top: any, current: any) => {
          return (current.views || 0) > (top?.views || 0) ? current : top;
        }, null);

        // Calculate monthly data (mock data for demonstration)
        const monthlyData = [
          { month: 'Jan', views: Math.floor(totalViews * 0.1), inquiries: Math.floor(totalInquiries * 0.1) },
          { month: 'Feb', views: Math.floor(totalViews * 0.15), inquiries: Math.floor(totalInquiries * 0.15) },
          { month: 'Mar', views: Math.floor(totalViews * 0.2), inquiries: Math.floor(totalInquiries * 0.2) },
          { month: 'Apr', views: Math.floor(totalViews * 0.25), inquiries: Math.floor(totalInquiries * 0.25) },
          { month: 'May', views: Math.floor(totalViews * 0.3), inquiries: Math.floor(totalInquiries * 0.3) },
          { month: 'Jun', views: totalViews, inquiries: totalInquiries },
        ];

        // Popular cities
        const cityCount = listings.reduce((acc: any, listing: any) => {
          const city = listing.location?.city || 'Unknown';
          acc[city] = (acc[city] || 0) + (listing.views || 0);
          return acc;
        }, {});

        const popularCities = Object.entries(cityCount)
          .map(([city, views]) => ({ city, views }))
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 5);

        // Recent activity (mock data)
        const recentActivity = [
          { type: 'view', listing: listings[0]?.title || 'Property', time: new Date(), count: 5 },
          { type: 'inquiry', listing: listings[1]?.title || 'Property', time: new Date(Date.now() - 3600000), count: 1 },
          { type: 'view', listing: listings[2]?.title || 'Property', time: new Date(Date.now() - 7200000), count: 3 },
        ].filter(activity => activity.listing !== 'Property');

        setAnalytics({
          totalViews,
          totalInquiries,
          totalListings,
          averageViews,
          topPerformingListing,
          recentActivity,
          viewsThisMonth: Math.floor(totalViews * 0.3),
          inquiriesThisMonth: Math.floor(totalInquiries * 0.3),
          conversionRate: totalViews > 0 ? Math.round((totalInquiries / totalViews) * 100) : 0,
          popularCities,
          monthlyData,
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Total Inquiries',
      value: analytics.totalInquiries.toLocaleString(),
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Active Listings',
      value: analytics.totalListings.toLocaleString(),
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+2',
      changeType: 'increase',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+0.5%',
      changeType: 'increase',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track your listing performance and insights
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input mt-4 sm:mt-0"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.changeType === 'increase' ? (
                      <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Listing */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Performing Listing</h2>
            {analytics.topPerformingListing ? (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                  {analytics.topPerformingListing.images?.[0] && (
                    <img
                      src={analytics.topPerformingListing.images[0]}
                      alt={analytics.topPerformingListing.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{analytics.topPerformingListing.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{analytics.topPerformingListing.location?.city}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-primary">
                      {formatPrice(analytics.topPerformingListing.price)}/mo
                    </span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{analytics.topPerformingListing.views || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No listings available</p>
            )}
          </div>

          {/* Popular Cities */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Popular Cities</h2>
            <div className="space-y-3">
              {analytics.popularCities.length > 0 ? (
                analytics.popularCities.map((city: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{city.city}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{city.views} views</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Performance</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.monthlyData.map((data: any, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-1">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{
                      height: `${Math.max((data.views / Math.max(...analytics.monthlyData.map((d: any) => d.views))) * 200, 10)}px`,
                    }}
                  />
                  <div
                    className="w-full bg-secondary rounded-t"
                    style={{
                      height: `${Math.max((data.inquiries / Math.max(...analytics.monthlyData.map((d: any) => d.inquiries))) * 100, 5)}px`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded mr-2" />
              <span className="text-sm text-muted-foreground">Views</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-secondary rounded mr-2" />
              <span className="text-sm text-muted-foreground">Inquiries</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'view' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'view' ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.count} new {activity.type}{activity.count > 1 ? 's' : ''} on "{activity.listing}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent activity</p>
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Improve Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Add high-quality photos and detailed descriptions to increase views.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Boost Inquiries</h3>
              <p className="text-sm text-muted-foreground">
                Respond quickly to inquiries and keep your contact information updated.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Feature Your Listing</h3>
              <p className="text-sm text-muted-foreground">
                Featured listings get 3x more views than regular listings.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <h3 className="font-medium text-foreground mb-2">Update Regularly</h3>
              <p className="text-sm text-muted-foreground">
                Keep your listings fresh by updating details and photos regularly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
