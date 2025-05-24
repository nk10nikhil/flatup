import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  _id: string;
  date: Date;
  totalUsers: number;
  totalFlats: number;
  totalRevenue: number;
  newSignups: number;
  newFlats: number;
  pageViews: number;
  flatViews: number;
  inquiries: number;
  usersByRole: {
    broker: number;
    owner: number;
    room_sharer: number;
  };
  subscriptionsByStatus: {
    active: number;
    expired: number;
    pending: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  totalUsers: {
    type: Number,
    default: 0,
  },
  totalFlats: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  newSignups: {
    type: Number,
    default: 0,
  },
  newFlats: {
    type: Number,
    default: 0,
  },
  pageViews: {
    type: Number,
    default: 0,
  },
  flatViews: {
    type: Number,
    default: 0,
  },
  inquiries: {
    type: Number,
    default: 0,
  },
  usersByRole: {
    broker: { type: Number, default: 0 },
    owner: { type: Number, default: 0 },
    room_sharer: { type: Number, default: 0 },
  },
  subscriptionsByStatus: {
    active: { type: Number, default: 0 },
    expired: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Indexes
AnalyticsSchema.index({ date: -1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
