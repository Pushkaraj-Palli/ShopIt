import mongoose from 'mongoose';

// Check if we have a MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the mongoose connection cache type
type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
};

// Declare the global mongoose cache
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Mongoose> | null } | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

// Helper function to safely log MongoDB URI (hides username/password)
function getSafeMongoDbUri(uri: string): string {
  try {
    const url = new URL(uri);
    // Replace username and password with asterisks
    if (url.username) url.username = '********';
    if (url.password) url.password = '********';
    return url.toString();
  } catch (error) {
    // If URI cannot be parsed, return a generic message
    return 'MongoDB URI (credentials hidden)';
  }
}

async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    // Log a safe version of the URI that hides credentials
    console.log('Connecting to MongoDB:', getSafeMongoDbUri(process.env.MONGODB_URI!));
    
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  try {
    const mongoose = await cached.promise;
    cached.conn = mongoose.connection;
    console.log('MongoDB connection established. Database name:', mongoose.connection.name);
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 