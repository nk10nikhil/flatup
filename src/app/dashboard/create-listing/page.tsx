'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FLAT_TYPES, INDIAN_STATES, AMENITIES } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CreateListing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    type: 'PG' as any,
    availableRooms: 1,
    totalRooms: 1,
    amenities: [] as string[],
    images: [] as string[],
    features: {
      wifi: false,
      ac: false,
      parking: false,
      furnished: false,
      petFriendly: false,
      coupleAllowed: false,
      balcony: false,
      gym: false,
      swimming: false,
      security: false,
    },
    availableFrom: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('features.')) {
        const featureField = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          features: {
            ...prev.features,
            [featureField]: checked,
          },
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'flats');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          return data.url;
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.images.length === 0) {
        toast.error('Please upload at least one image');
        return;
      }

      if (!formData.location.address || !formData.location.city || !formData.location.state || !formData.location.pincode) {
        toast.error('Please fill in complete address details');
        return;
      }

      const response = await fetch('/api/flats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Listing created successfully!');
        router.push('/dashboard/listings');
      } else {
        toast.error(data.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create New Listing</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create your property listing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., Spacious 2BHK in Bandra West"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input w-full resize-none"
                  placeholder="Describe your property, its features, and what makes it special..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Property Type *
                </label>
                <select
                  title='rt'
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  {FLAT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Available Rooms *
                </label>
                <input
                  title='er'
                  type="number"
                  name="availableRooms"
                  required
                  min="1"
                  value={formData.availableRooms}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Total Rooms *
                </label>
                <input
                  title='er'
                  type="number"
                  name="totalRooms"
                  required
                  min="1"
                  value={formData.totalRooms}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Available From *
                </label>
                <input
                  title='df'
                  type="date"
                  name="availableFrom"
                  required
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                  className="input w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  required
                  value={formData.location.address}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Building name, street, area"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  required
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State *
                </label>
                <select
                  title='w'
                  name="location.state"
                  required
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="location.pincode"
                  required
                  pattern="[0-9]{6}"
                  value={formData.location.pincode}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(formData.features).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`features.${key}`}
                    checked={value}
                    onChange={handleInputChange}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`p-3 rounded-lg border text-sm transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Property Images *</h2>
            
            <div className="mb-6">
              <label className="block w-full">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, WebP up to 5MB each. Upload multiple images.
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      title='sw'
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingImages}
              className="btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
