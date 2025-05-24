'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  MapPin,
  User,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { formatRelativeTime, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Inquiries() {
  const { data: session } = useSession();
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchInquiries();
    }
  }, [session]);

  useEffect(() => {
    filterInquiries();
  }, [inquiries, searchQuery, statusFilter]);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inquiries');
      const data = await response.json();

      if (response.ok) {
        setInquiries(data.inquiries || []);
      } else {
        toast.error('Failed to fetch inquiries');
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      toast.error('Failed to fetch inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const filterInquiries = () => {
    let filtered = [...inquiries];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(inquiry =>
        inquiry.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.flat?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredInquiries(filtered);
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Inquiry status updated');
        setInquiries(prev =>
          prev.map(inquiry =>
            inquiry._id === inquiryId
              ? { ...inquiry, status: newStatus }
              : inquiry
          )
        );
        if (selectedInquiry?._id === inquiryId) {
          setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error('Failed to update inquiry status');
      }
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'contacted':
        return <MessageSquare className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
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

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
          <p className="text-muted-foreground">
            Manage inquiries from potential tenants
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contacted</p>
                <p className="text-2xl font-bold text-foreground">{stats.contacted}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold text-foreground">{stats.closed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inquiries..."
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Inquiries List */}
        {filteredInquiries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInquiries.map((inquiry: any) => (
              <div key={inquiry._id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{inquiry.visitorName}</h3>
                      <p className="text-sm text-muted-foreground">{inquiry.visitorEmail}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                    {getStatusIcon(inquiry.status)}
                    <span className="ml-1 capitalize">{inquiry.status}</span>
                  </span>
                </div>

                {/* Property Info */}
                {inquiry.flat && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0">
                        {inquiry.flat.images?.[0] && (
                          <img
                            src={inquiry.flat.images[0]}
                            alt={inquiry.flat.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{inquiry.flat.title}</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{inquiry.flat.location?.city}</span>
                        </div>
                        <p className="text-xs font-medium text-primary">
                          {formatPrice(inquiry.flat.price)}/mo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="mb-4">
                  <p className="text-sm text-foreground line-clamp-3">{inquiry.message}</p>
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{inquiry.visitorPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatRelativeTime(new Date(inquiry.createdAt))}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <a
                      href={`tel:${inquiry.visitorPhone}`}
                      className="btn-outline text-xs px-3 py-1 flex items-center space-x-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`mailto:${inquiry.visitorEmail}`}
                      className="btn-outline text-xs px-3 py-1 flex items-center space-x-1"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </a>
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="btn-outline text-xs px-3 py-1 flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </div>
                  
                  {inquiry.status === 'pending' && (
                    <button
                      onClick={() => updateInquiryStatus(inquiry._id, 'contacted')}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      Mark Contacted
                    </button>
                  )}
                  
                  {inquiry.status === 'contacted' && (
                    <button
                      onClick={() => updateInquiryStatus(inquiry._id, 'closed')}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      Mark Closed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No inquiries found' : 'No inquiries yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Inquiries from potential tenants will appear here'
              }
            </p>
          </div>
        )}

        {/* Inquiry Detail Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Inquiry Details</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-2 hover:bg-accent rounded-md"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Visitor Info */}
              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-3">Visitor Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="font-medium">{selectedInquiry.visitorName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{selectedInquiry.visitorEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{selectedInquiry.visitorPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{formatRelativeTime(new Date(selectedInquiry.createdAt))}</span>
                  </div>
                </div>
              </div>

              {/* Property Info */}
              {selectedInquiry.flat && (
                <div className="mb-6">
                  <h4 className="font-medium text-foreground mb-3">Property</h4>
                  <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                      {selectedInquiry.flat.images?.[0] && (
                        <img
                          src={selectedInquiry.flat.images[0]}
                          alt={selectedInquiry.flat.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground">{selectedInquiry.flat.title}</h5>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{selectedInquiry.flat.location?.city}</span>
                      </div>
                      <p className="text-sm font-medium text-primary">
                        {formatPrice(selectedInquiry.flat.price)}/mo
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-3">Message</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInquiry.status)}`}>
                    {getStatusIcon(selectedInquiry.status)}
                    <span className="ml-1 capitalize">{selectedInquiry.status}</span>
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {selectedInquiry.status === 'pending' && (
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry._id, 'contacted')}
                      className="btn-primary text-sm"
                    >
                      Mark as Contacted
                    </button>
                  )}
                  {selectedInquiry.status === 'contacted' && (
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry._id, 'closed')}
                      className="btn-primary text-sm"
                    >
                      Mark as Closed
                    </button>
                  )}
                  <a
                    href={`tel:${selectedInquiry.visitorPhone}`}
                    className="btn-outline text-sm"
                  >
                    Call Now
                  </a>
                  <a
                    href={`mailto:${selectedInquiry.visitorEmail}`}
                    className="btn-outline text-sm"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
