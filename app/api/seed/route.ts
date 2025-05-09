import { NextResponse } from 'next/server';
import { seedDatabase, isDatabaseSeeded } from '@/app/lib/dbSeeder';

// This route should be protected in production
export async function GET() {
  try {
    // Check environment to prevent accidental seeding in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: false, 
        message: 'Seeding is not allowed in production environment'
      }, { status: 403 });
    }
    
    // Check if database is already seeded
    const seedStatus = await isDatabaseSeeded();
    
    if (seedStatus.isSeeded) {
      return NextResponse.json({ 
        success: false, 
        message: 'Database is already seeded',
        stats: {
          categories: seedStatus.categoryCount,
          products: seedStatus.productCount
        }
      });
    }
    
    // Seed database
    const result = await seedDatabase();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database seeded successfully'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Error seeding database',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in seed API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 