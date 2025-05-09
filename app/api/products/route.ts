import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import mongoose from 'mongoose';
import Product from '@/app/models/Product';

export async function GET(request: Request) {
  try {
    console.log('API: GET /api/products - Start');
    
    // Connect to the database
    await connectToDatabase();
    console.log('API: Connected to MongoDB');
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Simple query - just fetch limited number of products
    const dbProducts = await Product.find().limit(limit);
    
    // Transform MongoDB documents to the expected format
    const products = dbProducts.map(product => {
      const productObj = product.toObject();
      return {
        id: productObj._id.toString(),
        _id: productObj._id.toString(), // Keep _id for backward compatibility
        name: productObj.name,
        price: productObj.price,
        category: productObj.category,
        categorySlug: productObj.categorySlug,
        subCategory: productObj.subCategory,
        rating: productObj.rating,
        image: productObj.image,
        description: productObj.description,
      };
    });
    
    console.log(`API: Found ${products.length} products`);
    
    return NextResponse.json({ 
      success: true, 
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('API Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', error: (error instanceof Error) ? error.message : String(error) },
      { status: 500 }
    );
  }
} 