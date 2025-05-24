import mongoose, { Document, Schema } from 'mongoose';

export interface IFlat extends Document {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  type: '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'PG' | 'Studio';
  availableRooms: number;
  totalRooms: number;
  amenities: string[];
  images: string[];
  features: {
    wifi: boolean;
    ac: boolean;
    parking: boolean;
    furnished: boolean;
    petFriendly: boolean;
    coupleAllowed: boolean;
    balcony: boolean;
    gym: boolean;
    swimming: boolean;
    security: boolean;
  };
  availableFrom: Date;
  lister: mongoose.Types.ObjectId;
  listerType: 'broker' | 'owner' | 'room_sharer';
  views: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlatSchema = new Schema<IFlat>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  type: {
    type: String,
    enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'PG', 'Studio'],
    required: true,
  },
  availableRooms: {
    type: Number,
    required: true,
    min: 1,
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1,
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String,
    required: true,
  }],
  features: {
    wifi: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    coupleAllowed: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    swimming: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
  },
  availableFrom: {
    type: Date,
    required: true,
  },
  lister: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listerType: {
    type: String,
    enum: ['broker', 'owner', 'room_sharer'],
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
FlatSchema.index({ 'location.city': 1 });
FlatSchema.index({ type: 1 });
FlatSchema.index({ price: 1 });
FlatSchema.index({ lister: 1 });
FlatSchema.index({ isActive: 1 });
FlatSchema.index({ isFeatured: 1 });
FlatSchema.index({ createdAt: -1 });

export default mongoose.models.Flat || mongoose.model<IFlat>('Flat', FlatSchema);
