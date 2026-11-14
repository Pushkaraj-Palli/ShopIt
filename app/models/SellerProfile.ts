import mongoose, { Document, Schema } from 'mongoose';

export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface ISellerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  storeName: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  taxId?: string;
  status: SellerApplicationStatus;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SellerProfileSchema = new Schema<ISellerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    contactPhone: { type: String, required: true, trim: true, maxlength: 30 },
    businessAddress: { type: String, required: true, trim: true, maxlength: 400 },
    taxId: { type: String, trim: true, maxlength: 40 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      required: true,
      index: true,
    },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.SellerProfile ||
  mongoose.model<ISellerProfile>('SellerProfile', SellerProfileSchema);
