// Simple script to test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('MongoDB URI:', process.env.MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('Connection test passed!');
      process.exit(0);
    } else {
      console.log('Connection test failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 