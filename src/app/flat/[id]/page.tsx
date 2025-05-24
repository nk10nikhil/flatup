'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Eye,
  Calendar,
  Home,
  Users,
  Phone,
  Mail,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FlatDetail() {
  const params = useParams();
  const [flat, setFlat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    message: '',
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchFlat();
    }
  }, [params.id]);

  const fetchFlat = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/flats/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setFlat(data.flat);
      } else {
        toast.error('Flat not found');
      }
    } catch (error) {
      console.error('Failed to fetch flat:', error);
      toast.error('Failed to load flat details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flatId: params.id,
          ...inquiryForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Inquiry sent successfully!');
        setShowInquiryForm(false);
        setInquiryForm({
          visitorName: '',
          visitorEmail: '',
          visitorPhone: '',
          message: '',
        });
      } else {
        toast.error(data.error || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      toast.error('Failed to send inquiry');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const nextImage = () => {
    if (flat?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % flat.images.length);
    }
  };

  const prevImage = () => {
    if (flat?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + flat.images.length) % flat.images.length);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="aspect-video bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!flat) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Flat not found</h1>
            <Link href="/browse" className="btn-primary">
              Browse Other Properties
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/browse" className="text-primary hover:text-primary/80">
            ← Back to Browse
          </Link>
        </nav>

        {/* Image Gallery */}
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          {flat.images && flat.images.length > 0 ? (
            <>
              <img
                src={flat.images[currentImageIndex]}
                alt={flat.title}
                className="w-full h-full object-cover"
              />
              {flat.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {flat.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Home className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
              <Heart className="h-5 w-5" />
            </button>
            <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-foreground">{flat.title}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{flat.views || 0} views</span>
                  </div>
                </div>
                
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{flat.location?.address}, {flat.location?.city}, {flat.location?.state} - {flat.location?.pincode}</span>
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    <span>{flat.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{flat.availableRooms} of {flat.totalRooms} rooms available</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Available from {formatDate(new Date(flat.availableFrom))}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{flat.description}</p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(flat.features || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      {value ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm capitalize ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
                
                {flat.amenities && flat.amenities.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-foreground mb-2">Additional Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {flat.amenities.map((amenity: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Map placeholder */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Location</h2>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Map integration coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price and Contact */}
            <div className="card p-6">
              <div className="text-3xl font-bold text-primary mb-4">
                {formatPrice(flat.price)}/month
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Listed by</h3>
                  <div className="flex items-center space-x-3">
                    {flat.lister?.image ? (
                      <img
                        src={flat.lister.image}
                        alt={flat.lister.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{flat.lister?.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{flat.listerType}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowInquiryForm(true)}
                  className="btn-primary w-full"
                >
                  Show Interest
                </button>
                
                {flat.lister?.phone && (
                  <a
                    href={`tel:${flat.lister.phone}`}
                    className="btn-outline w-full flex items-center justify-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Now</span>
                  </a>
                )}
                
                {flat.lister?.email && (
                  <a
                    href={`mailto:${flat.lister.email}`}
                    className="btn-outline w-full flex items-center justify-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send Email</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="card p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-medium">{flat.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Rooms</span>
                  <span className="font-medium">{flat.availableRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Rooms</span>
                  <span className="font-medium">{flat.totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available From</span>
                  <span className="font-medium">{formatDate(new Date(flat.availableFrom))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed On</span>
                  <span className="font-medium">{formatDate(new Date(flat.createdAt))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Modal */}
        {showInquiryForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Send Inquiry</h3>
                <button
                  onClick={() => setShowInquiryForm(false)}
                  className="p-2 hover:bg-accent rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.visitorName}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, visitorName: e.target.value }))}
                    className="input w-full"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.visitorEmail}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, visitorEmail: e.target.value }))}
                    className="input w-full"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryForm.visitorPhone}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, visitorPhone: e.target.value }))}
                    className="input w-full"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    className="input w-full resize-none"
                    placeholder="Tell the owner about your requirements..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="btn-primary flex-1"
                  >
                    {isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
