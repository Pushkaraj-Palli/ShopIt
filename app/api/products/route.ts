import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // default sort by creation date
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // default descending
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build the query
    const query: any = {};
    
    if (category) {
      query.categorySlug = category;
    }
    
    if (subcategory) {
      query.subCategory = subcategory;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total products matching the query
    const totalProducts = await Product.countDocuments(query);
    
    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Fetch products with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({ 
      success: true, 
      count: products.length,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 