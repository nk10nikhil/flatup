import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: 'broker' | 'owner' | 'room_sharer' | 'superadmin';
  phone?: string;
  bio?: string;
  isActive: boolean;
  subscription: {
    plan: 'broker' | 'owner' | 'room_sharer' | null;
    status: 'active' | 'expired' | 'pending' | null;
    startDate?: Date;
    endDate?: Date;
    paymentId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false, // Don't include password in queries by default
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['broker', 'owner', 'room_sharer', 'superadmin'],
    default: 'owner',
  },
  phone: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscription: {
    plan: {
      type: String,
      enum: ['broker', 'owner', 'room_sharer'],
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'pending'],
      default: null,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    paymentId: {
      type: String,
    },
  },
}, {
  timestamps: true,
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'subscription.status': 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
