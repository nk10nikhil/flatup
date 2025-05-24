'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, MapPin, Star, TrendingUp, Users, Building2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredFlats, setFeaturedFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedFlats();
  }, []);

  const fetchFeaturedFlats = async () => {
    try {
      setIsLoading(true);
      // Fetch featured flats from the API
      const response = await fetch('/api/flats?limit=6&sort=views&order=desc');
      const data = await response.json();

      if (response.ok && data.flats) {
        setFeaturedFlats(data.flats);
      } else {
        // Fallback to mock data if API fails
        const mockFeaturedFlats = [
          {
            _id: '1',
            title: 'Modern 2BHK in Bandra',
            location: { city: 'Mumbai', address: 'Bandra West' },
            price: 45000,
            type: '2BHK',
            images: ['/api/placeholder/400/300'],
            listerType: 'owner',
            views: 120,
          },
          {
            _id: '2',
            title: 'Spacious PG in Koramangala',
            location: { city: 'Bangalore', address: 'Koramangala' },
            price: 15000,
            type: 'PG',
            images: ['/api/placeholder/400/300'],
            listerType: 'broker',
            views: 89,
          },
          {
            _id: '3',
            title: 'Luxury 3BHK in Gurgaon',
            location: { city: 'Gurgaon', address: 'Cyber City' },
            price: 65000,
            type: '3BHK',
            images: ['/api/placeholder/400/300'],
            listerType: 'owner',
            views: 156,
          },
        ];
        setFeaturedFlats(mockFeaturedFlats);
      }
    } catch (error) {
      console.error('Failed to fetch featured flats:', error);
      // Use mock data as fallback
      const mockFeaturedFlats = [
        {
          _id: '1',
          title: 'Modern 2BHK in Bandra',
          location: { city: 'Mumbai', address: 'Bandra West' },
          price: 45000,
          type: '2BHK',
          images: ['/api/placeholder/400/300'],
          listerType: 'owner',
          views: 120,
        },
        {
          _id: '2',
          title: 'Spacious PG in Koramangala',
          location: { city: 'Bangalore', address: 'Koramangala' },
          price: 15000,
          type: 'PG',
          images: ['/api/placeholder/400/300'],
          listerType: 'broker',
          views: 89,
        },
        {
          _id: '3',
          title: 'Luxury 3BHK in Gurgaon',
          location: { city: 'Gurgaon', address: 'Cyber City' },
          price: 65000,
          type: '3BHK',
          images: ['/api/placeholder/400/300'],
          listerType: 'owner',
          views: 156,
        },
      ];
      setFeaturedFlats(mockFeaturedFlats);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find Your Perfect
              <span className="text-primary"> Home</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with property owners, brokers, and room sharers. Discover thousands of verified flat listings across India.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-background rounded-lg border border-border shadow-lg">
                <div className="flex-1 flex items-center space-x-2 px-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by city, area, or property type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Search Flats
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-muted-foreground">Happy Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Cities Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flats */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Properties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover handpicked properties from verified owners and trusted brokers
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card p-0 overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredFlats.map((flat: any) => (
                <div key={flat._id} className="card p-0 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    {flat.images?.[0] ? (
                      <img
                        src={flat.images[0]}
                        alt={flat.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                        {flat.type}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-background/90 text-foreground px-2 py-1 rounded text-sm">
                        {flat.views || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{flat.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{flat.location?.address}, {flat.location?.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        ₹{flat.price?.toLocaleString()}/mo
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        by {flat.listerType}
                      </div>
                    </div>
                    <Link
                      href={`/flat/${flat._id}`}
                      className="btn-outline w-full mt-4"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && featuredFlats.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No properties available</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to list your property on FlatUp!
              </p>
              <Link href="/auth/signup" className="btn-primary">
                List Your Property
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/browse" className="btn-primary">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How FlatUp Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to find your perfect home or list your property
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search & Filter</h3>
              <p className="text-muted-foreground">
                Browse thousands of verified listings with advanced filters for location, price, and amenities.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Directly</h3>
              <p className="text-muted-foreground">
                Contact property owners, brokers, or room sharers directly without any middleman.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Move In</h3>
              <p className="text-muted-foreground">
                Schedule visits, negotiate terms, and move into your perfect home with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to List Your Property?
            </h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of property owners and brokers who trust FlatUp to connect with quality tenants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn bg-background text-foreground hover:bg-background/90">
                Start Listing Today
              </Link>
              <Link href="/pricing" className="btn border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
