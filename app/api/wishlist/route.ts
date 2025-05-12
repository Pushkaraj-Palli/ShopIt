import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Wishlist from '@/app/models/Wishlist';
import { verifyAuth } from '@/lib/auth';

// GET /api/wishlist - Get the current user's wishlist
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId });
    
    // If no wishlist exists, return empty items
    if (!wishlist) {
      return NextResponse.json({ items: [] });
    }
    
    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Error fetching wishlist:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add an item to wishlist
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Parse the request body
    const product = await request.json();
    
    // Validate product data
    if (!product || !product.id || !product.name || !product.price || !product.image) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      );
    }
    
    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      // Create new wishlist
      wishlist = await Wishlist.create({
        user: userId,
        items: []
      });
    }
    
    // Check if product is already in wishlist
    const existingItem = wishlist.items.find(
      (item: any) => item.productId === product.id
    );
    
    if (existingItem) {
      return NextResponse.json({ 
        message: 'Product already in wishlist',
        wishlist
      });
    }
    
    // Add item to wishlist
    wishlist.items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      addedAt: new Date()
    });
    
    await wishlist.save();
    
    return NextResponse.json({
      message: 'Product added to wishlist',
      wishlist
    });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error.message);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist/:productId - Remove an item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the product ID from the URL
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }
    
    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(
      (item: any) => item.productId !== productId
    );
    
    await wishlist.save();
    
    return NextResponse.json({
      message: 'Product removed from wishlist',
      wishlist
    });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error.message);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
} 