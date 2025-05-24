import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  plan: 'broker' | 'owner' | 'room_sharer';
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  paymentId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['broker', 'owner', 'room_sharer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ endDate: 1 });
SubscriptionSchema.index({ paymentId: 1 });

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
