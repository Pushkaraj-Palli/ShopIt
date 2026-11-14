import mongoose, { Document, Schema } from 'mongoose';

export type ProductStatus = 'draft' | 'pending_review' | 'active' | 'archived' | 'rejected';

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId | null;
  name: string;
  price: number;
  basePrice?: number;
  compareAtPrice?: number;
  currency: string;
  sku?: string;
  brand?: string;
  tags: string[];
  images: string[];
  status: ProductStatus;
  stockQty: number | null;
  trackInventory: boolean;
  lowStockThreshold?: number;
  allowBackorders: boolean;
  attributes?: Record<string, unknown>;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  category: string;
  categorySlug: string;
  subCategory: string;
  rating: number;
  image: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      maxlength: [10, 'Price cannot exceed 10 characters'],
      default: 0.0,
    },
    // Money fields are stored in paise. `price` remains the rupee value used
    // by the current storefront until its clients are migrated.
    basePrice: { type: Number, min: 0, validate: Number.isInteger },
    compareAtPrice: { type: Number, min: 0, validate: Number.isInteger },
    currency: { type: String, default: 'INR', required: true },
    sku: { type: String, trim: true, maxlength: 80 },
    brand: { type: String, trim: true, maxlength: 100 },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'active', 'archived', 'rejected'],
      default: 'pending_review',
      required: true,
      index: true,
    },
    stockQty: { type: Number, min: 0, default: null, validate: Number.isInteger },
    trackInventory: { type: Boolean, default: false, required: true },
    lowStockThreshold: { type: Number, min: 0, validate: Number.isInteger },
    allowBackorders: { type: Boolean, default: false, required: true },
    attributes: { type: Schema.Types.Mixed },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    categorySlug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image URL'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
  },
  { timestamps: true }
);

ProductSchema.index({ sellerId: 1, status: 1 });
ProductSchema.index({ status: 1, categorySlug: 1, price: 1 });

// Check if the model is already defined to prevent overwriting during hot reload
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
