import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connect to the database
    const connection = await connectToDatabase();
    
    // Get DB information
    const dbInfo = {
      success: true,
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: Object.keys(mongoose.connection.collections)
    };
    
    return NextResponse.json(dbInfo);
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { success: false, message: 'Connection test failed', error: (error as Error).message },
      { status: 500 }
    );
  }
} 