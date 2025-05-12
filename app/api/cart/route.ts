import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Cart from '@/app/models/Cart';
import { verifyAuth } from '@/lib/auth';

// GET /api/cart - Get the current user's cart
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find cart for user
    let cart = await Cart.findOne({ user: userId });
    
    // If no cart exists, return empty cart
    if (!cart) {
      return NextResponse.json({ items: [] });
    }
    
    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Error fetching cart:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Update the user's cart
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Parse the request body
    const { items } = await request.json();
    
    // Validate cart items
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }
    
    // Find or create cart for user
    let cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      // Update existing cart
      cart.items = items;
      await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        user: userId,
        items
      });
    }
    
    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Error updating cart:', error.message);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear the user's cart
export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find cart for user
    let cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      // Clear cart items
      cart.items = [];
      await cart.save();
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing cart:', error.message);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
} 