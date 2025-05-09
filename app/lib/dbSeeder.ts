import connectToDatabase from './mongodb';
import Category from '../models/Category';
import Product from '../models/Product';
import { categories, products } from './data';

/**
 * Seeds the database with initial data
 * Only run this when you want to reset and repopulate the database
 */
export async function seedDatabase() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Delete all existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    // Insert categories
    console.log('Seeding categories...');
    await Category.insertMany(categories);
    
    // Insert products
    console.log('Seeding products...');
    await Product.insertMany(products);
    
    console.log('Database seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
}

/**
 * Checks if the database has been seeded
 */
export async function isDatabaseSeeded() {
  try {
    await connectToDatabase();
    
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    
    return {
      isSeeded: categoryCount > 0 && productCount > 0,
      categoryCount,
      productCount
    };
  } catch (error) {
    console.error('Error checking database seed status:', error);
    return { isSeeded: false, error };
  }
} 