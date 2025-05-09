import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: string;
  description: string;
  featured: boolean;
  subCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a category slug'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide a category image URL'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    subCategories: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reload
export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema); 