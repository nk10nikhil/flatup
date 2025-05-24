'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Eye,
  Heart,
  Share2,
  ChevronDown,
  X,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { formatPrice, FLAT_TYPES, INDIAN_STATES } from '@/lib/utils';

export default function Browse() {
  const searchParams = useSearchParams();
  const [flats, setFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    listerType: '',
    sort: 'createdAt',
    order: 'desc',
  });

  useEffect(() => {
    fetchFlats();
  }, [filters, pagination.page]);

  const fetchFlats = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const response = await fetch(`/api/flats?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setFlats(data.flats || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch flats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      listerType: '',
      sort: 'createdAt',
      order: 'desc',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Browse Properties</h1>
            <p className="text-muted-foreground">
              Discover your perfect home from thousands of verified listings
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by city, area, or property type..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City</label>
                    <select
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="input"
                    >
                      <option value="">All Cities</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Property Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="input"
                    >
                      <option value="">All Types</option>
                      {FLAT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min price"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max price"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Lister Type</label>
                    <select
                      value={filters.listerType}
                      onChange={(e) => handleFilterChange('listerType', e.target.value)}
                      className="input"
                    >
                      <option value="">All Listers</option>
                      <option value="owner">Owner</option>
                      <option value="broker">Broker</option>
                      <option value="room_sharer">Room Sharer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                    <select
                      value={`${filters.sort}-${filters.order}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        handleFilterChange('sort', sort);
                        handleFilterChange('order', order);
                      }}
                      className="input"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="views-desc">Most Popular</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={clearFilters} className="btn-outline w-full">
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {pagination.total} properties found
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-0 overflow-hidden animate-pulse">
                    <div className="aspect-video bg-muted"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : flats.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
              }>
                {flats.map((flat: any) => (
                  <div key={flat._id} className={`card p-0 overflow-hidden hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <div className={`bg-muted relative ${
                      viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-video'
                    }`}>
                      {flat.images?.[0] && (
                        <img
                          src={flat.images[0]}
                          alt={flat.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                          {flat.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button className="p-2 bg-background/90 rounded-full hover:bg-background">
                          <Heart className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-background/90 rounded-full hover:bg-background">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-background/90 text-foreground px-2 py-1 rounded text-sm flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {flat.views || 0}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{flat.title}</h3>
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm line-clamp-1">
                          {flat.location?.address}, {flat.location?.city}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {flat.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(flat.price)}/mo
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
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md ${
                        pagination.page === page
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
