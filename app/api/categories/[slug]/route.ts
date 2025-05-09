import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Category from '@/app/models/Category';
import Product from '@/app/models/Product';

interface RouteParams {
  params: {
    slug: string;
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Get the slug from the params
    const { slug } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the category
    const category = await Category.findOne({ slug });
    
    if (!category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Category not found' 
      }, { status: 404 });
    }
    
    // Find products for this category
    const products = await Product.find({ categorySlug: slug });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        category,
        products: {
          count: products.length,
          items: products
        }
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 