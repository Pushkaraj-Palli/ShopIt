import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

interface RouteParams {
  params: {
    id: string;
  }
}

// Define configuration for the route
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get the product ID from params
    const { id } = params;
    
    // Find the product by ID
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Transform MongoDB document to expected format
    const productObj = product.toObject();
    const formattedProduct = {
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
    
    return NextResponse.json({ 
      success: true, 
      data: formattedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product', error: (error as Error).message },
      { status: 500 }
    );
  }
} 