import mongoose, { Schema, Document } from 'mongoose';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId | string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist must belong to a user']
    },
    items: [
      {
        productId: {
          type: String,
          required: [true, 'Wishlist item must have a product ID']
        },
        name: {
          type: String,
          required: [true, 'Wishlist item must have a name']
        },
        price: {
          type: Number,
          required: [true, 'Wishlist item must have a price']
        },
        image: {
          type: String,
          required: [true, 'Wishlist item must have an image']
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Create the Wishlist model or use the existing one (for hot reloading)
const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist; 