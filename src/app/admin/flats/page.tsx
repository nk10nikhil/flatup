'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff,
  MapPin,
  User,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatPrice, formatRelativeTime, FLAT_TYPES, INDIAN_STATES } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminFlats() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [flats, setFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [listerTypeFilter, setListerTypeFilter] = useState('all');
  const [selectedFlat, setSelectedFlat] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

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

    fetchFlats();
  }, [session, status, router, pagination.page, searchQuery, typeFilter, statusFilter, cityFilter, listerTypeFilter]);

  const fetchFlats = async () => {
    try {
      setIsLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(cityFilter !== 'all' && { city: cityFilter }),
        ...(listerTypeFilter !== 'all' && { listerType: listerTypeFilter }),
      });

      const response = await fetch(`/api/admin/flats?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setFlats(data.flats || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
        }));
      } else {
        toast.error('Failed to fetch flats');
      }
    } catch (error) {
      console.error('Failed to fetch flats:', error);
      toast.error('Failed to fetch flats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlat = async (flatId: string) => {
    try {
      const response = await fetch(`/api/flats/${flatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Flat deleted successfully');
        setFlats(prev => prev.filter(flat => flat._id !== flatId));
        setShowDeleteModal(null);
      } else {
        toast.error('Failed to delete flat');
      }
    } catch (error) {
      console.error('Failed to delete flat:', error);
      toast.error('Failed to delete flat');
    }
  };

  const toggleFeatured = async (flatId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/flats/${flatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Flat ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
        setFlats(prev =>
          prev.map(flat =>
            flat._id === flatId
              ? { ...flat, isFeatured: !currentStatus }
              : flat
          )
        );
      } else {
        toast.error('Failed to update flat');
      }
    } catch (error) {
      console.error('Failed to update flat:', error);
      toast.error('Failed to update flat');
    }
  };

  const toggleActive = async (flatId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/flats/${flatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Flat ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setFlats(prev =>
          prev.map(flat =>
            flat._id === flatId
              ? { ...flat, isActive: !currentStatus }
              : flat
          )
        );
      } else {
        toast.error('Failed to update flat');
      }
    } catch (error) {
      console.error('Failed to update flat:', error);
      toast.error('Failed to update flat');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flat Management</h1>
          <p className="text-muted-foreground">
            Manage all property listings on the platform
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search flats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              {FLAT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Cities</option>
              {INDIAN_STATES.slice(0, 10).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={listerTypeFilter}
              onChange={(e) => setListerTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Listers</option>
              <option value="owner">Owner</option>
              <option value="broker">Broker</option>
              <option value="room_sharer">Room Sharer</option>
            </select>
          </div>
        </div>

        {/* Flats Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Property</th>
                  <th className="text-left p-4 font-medium text-foreground">Lister</th>
                  <th className="text-left p-4 font-medium text-foreground">Price</th>
                  <th className="text-left p-4 font-medium text-foreground">Views</th>
                  <th className="text-left p-4 font-medium text-foreground">Inquiries</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flats.map((flat: any) => (
                  <tr key={flat._id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0">
                          {flat.images?.[0] ? (
                            <img
                              src={flat.images[0]}
                              alt={flat.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground m-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{flat.title}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{flat.location?.city}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{flat.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{flat.lister?.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{flat.listerType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">
                        {formatPrice(flat.price)}/mo
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">
                        {flat.views || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">
                        {flat.inquiryCount || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          flat.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {flat.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {flat.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/flat/${flat._id}`}
                          className="p-2 hover:bg-accent rounded-md"
                          title="View Flat"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => toggleFeatured(flat._id, flat.isFeatured)}
                          className="p-2 hover:bg-accent rounded-md"
                          title={flat.isFeatured ? 'Unfeature' : 'Feature'}
                        >
                          {flat.isFeatured ? (
                            <StarOff className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleActive(flat._id, flat.isActive)}
                          className={`p-2 hover:bg-accent rounded-md ${
                            flat.isActive ? 'text-red-600' : 'text-green-600'
                          }`}
                          title={flat.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {flat.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(flat._id)}
                          className="p-2 hover:bg-accent rounded-md text-destructive"
                          title="Delete Flat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {flats.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No flats found</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No flats have been listed yet'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
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
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
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
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">Delete Flat</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this flat listing? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteFlat(showDeleteModal)}
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
