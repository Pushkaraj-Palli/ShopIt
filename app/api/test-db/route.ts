import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';

export async function GET() {
  try {
    // Try to connect to the database
    const connection = await connectToDatabase();
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Connected to MongoDB successfully',
      details: {
        connectionState: connection.readyState, // 1 = connected
        host: connection.host,
        db: connection.name
      }
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error connecting to database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 