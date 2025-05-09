import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

// Do not use dynamic = 'force-dynamic' with static exports
// export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('API: GET /api/products - Start');
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('API: Connected to MongoDB');
    
    // Get search query from URL using new URL() to avoid static generation issues
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    
    console.log(`API: Searching for "${searchQuery}"`);
    
    // Build the query
    const query: any = {};
    
    // Add search filter if present
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Fetch products from MongoDB with the search filter
    const products = await Product.find(query).limit(50);
    console.log(`API: Found ${products.length} products matching "${searchQuery}"`);
    
    // Transform MongoDB documents to the format expected by our components
    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      return {
        id: productObj._id.toString(),
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
    
    return NextResponse.json({ 
      products: formattedProducts,
      count: formattedProducts.length
    });
    
  } catch (error) {
    // Sanitize the error before logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Don't include stack traces or full error objects in the logs
    console.error('API Error fetching products:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 