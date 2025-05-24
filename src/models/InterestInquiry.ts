import mongoose, { Document, Schema } from 'mongoose';

export interface IInterestInquiry extends Document {
  _id: string;
  flat: mongoose.Types.ObjectId;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const InterestInquirySchema = new Schema<IInterestInquiry>({
  flat: {
    type: Schema.Types.ObjectId,
    ref: 'Flat',
    required: true,
  },
  visitorName: {
    type: String,
    required: true,
    trim: true,
  },
  visitorEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  visitorPhone: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'closed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Indexes
InterestInquirySchema.index({ flat: 1 });
InterestInquirySchema.index({ status: 1 });
InterestInquirySchema.index({ createdAt: -1 });

export default mongoose.models.InterestInquiry || mongoose.model<IInterestInquiry>('InterestInquiry', InterestInquirySchema);
