import mongoose, { Document, Schema } from 'mongoose';

export type ProductStatus = 'draft' | 'pending_review' | 'active' | 'archived' | 'rejected';

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  options: Record<string, string>;
  price: number;
  stockQty: number;
  lowStockThreshold: number;
  image?: string;
}

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
  hasVariants: boolean;
  variants: IProductVariant[];
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
    hasVariants: { type: Boolean, default: false, required: true },
    variants: {
      type: [new Schema<IProductVariant>({
        sku: { type: String, required: true, trim: true, maxlength: 80 },
        options: { type: Schema.Types.Mixed, required: true },
        price: { type: Number, required: true, min: 1, validate: Number.isInteger },
        stockQty: { type: Number, required: true, min: 0, validate: Number.isInteger },
        lowStockThreshold: { type: Number, default: 5, min: 0, validate: Number.isInteger },
        image: { type: String, trim: true, maxlength: 1000 },
      }, { _id: true })],
      default: [],
    },
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
