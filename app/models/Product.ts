import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
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

// Check if the model is already defined to prevent overwriting during hot reload
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema); 