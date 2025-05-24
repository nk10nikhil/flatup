'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Eye,
  Edit,
  Trash2,
  Plus,
  MapPin,
  Calendar,
  MoreVertical,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  StarOff,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MyListings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchListings();
    }
  }, [session]);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, statusFilter]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/flats?lister=${session?.user?.id}`);
      const data = await response.json();

      if (response.ok) {
        setListings(data.flats || []);
      } else {
        toast.error('Failed to fetch listings');
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to fetch listings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(listing => {
        if (statusFilter === 'active') return listing.isActive;
        if (statusFilter === 'inactive') return !listing.isActive;
        if (statusFilter === 'featured') return listing.isFeatured;
        return true;
      });
    }

    setFilteredListings(filtered);
  };

  const handleDelete = async (listingId: string) => {
    try {
      const response = await fetch(`/api/flats/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Listing deleted successfully');
        setListings(prev => prev.filter(listing => listing._id !== listingId));
        setShowDeleteModal(null);
      } else {
        toast.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const toggleFeatured = async (listingId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/flats/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Listing ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
        setListings(prev =>
          prev.map(listing =>
            listing._id === listingId
              ? { ...listing, isFeatured: !currentStatus }
              : listing
          )
        );
      } else {
        toast.error('Failed to update listing');
      }
    } catch (error) {
      console.error('Failed to update listing:', error);
      toast.error('Failed to update listing');
    }
  };

  const toggleActive = async (listingId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/flats/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Listing ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setListings(prev =>
          prev.map(listing =>
            listing._id === listingId
              ? { ...listing, isActive: !currentStatus }
              : listing
          )
        );
      } else {
        toast.error('Failed to update listing');
      }
    } catch (error) {
      console.error('Failed to update listing:', error);
      toast.error('Failed to update listing');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your property listings and track their performance
            </p>
          </div>
          <Link href="/dashboard/create-listing" className="btn-primary mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Listings</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold text-foreground">{listings.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">
                  {listings.reduce((sum, listing) => sum + (listing.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-foreground">
                  {listings.filter(listing => listing.isFeatured).length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {listings.filter(listing => listing.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredListings.map((listing: any) => (
              <div key={listing._id} className={`card p-0 overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                <div className={`relative ${
                  viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'
                }`}>
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Status badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {listing.isFeatured && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      listing.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions dropdown */}
                  <div className="absolute top-2 right-2">
                    <div className="relative group">
                      <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <Link
                          href={`/flat/${listing._id}`}
                          className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                        <Link
                          href={`/dashboard/edit-listing/${listing._id}`}
                          className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleFeatured(listing._id, listing.isFeatured)}
                          className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                        >
                          {listing.isFeatured ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Unfeature
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Feature
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleActive(listing._id, listing.isActive)}
                          className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                        >
                          {listing.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(listing._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-accent"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{listing.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm line-clamp-1">
                      {listing.location?.city}, {listing.location?.state}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(listing.price)}/mo
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {listing.views || 0} views
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Created {formatRelativeTime(new Date(listing.createdAt))}</span>
                    <span className="capitalize">{listing.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No listings found' : 'No listings yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first listing to get started'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/dashboard/create-listing" className="btn-primary">
                Create Your First Listing
              </Link>
            )}
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">Delete Listing</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this listing? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="btn bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
