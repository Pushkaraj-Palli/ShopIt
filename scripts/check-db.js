require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    console.log('Database:', mongoose.connection.name);
    
    // Check products
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log(`Products in database: ${products.length}`);
    if (products.length > 0) {
      console.log('First product:');
      console.log(JSON.stringify(products[0], null, 2));
    }
    
    // Check categories
    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log(`Categories in database: ${categories.length}`);
    if (categories.length > 0) {
      console.log('First category:');
      console.log(JSON.stringify(categories[0], null, 2));
    }
    
    // Close connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the function
checkDatabase(); 