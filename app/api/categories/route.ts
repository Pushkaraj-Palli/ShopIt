import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Category from '@/app/models/Category';

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Fetch all categories
    const categories = await Category.find({}).sort({ featured: -1, name: 1 });
    
    return NextResponse.json({ 
      success: true, 
      count: categories.length,
      data: categories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 