import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId | string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user']
    },
    items: [
      {
        productId: {
          type: String,
          required: [true, 'Cart item must have a product ID']
        },
        name: {
          type: String,
          required: [true, 'Cart item must have a name']
        },
        price: {
          type: Number,
          required: [true, 'Cart item must have a price']
        },
        image: {
          type: String,
          required: [true, 'Cart item must have an image']
        },
        quantity: {
          type: Number,
          required: [true, 'Cart item must have a quantity'],
          min: [1, 'Quantity must be at least 1']
        }
      }
    ]
  },
  { timestamps: true }
);

// Create the Cart model or use the existing one (for hot reloading)
const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart; 