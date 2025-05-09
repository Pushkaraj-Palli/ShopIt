import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

interface RouteParams {
  params: {
    id: string;
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Get the id from the params
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the product
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching product',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 