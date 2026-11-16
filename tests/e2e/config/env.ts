import path from 'path';
import dotenv from 'dotenv';

// Load test environment variables if present
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

function resolveTestMongoUri(): string {
  if (process.env.MONGODB_URI_TEST) {
    return process.env.MONGODB_URI_TEST;
  }
  const baseUri = process.env.MONGODB_URI;
  if (baseUri) {
    if (baseUri.includes('.mongodb.net/?')) {
      return baseUri.replace('.mongodb.net/?', '.mongodb.net/test?');
    }
    if (baseUri.includes('.mongodb.net/')) {
      return baseUri;
    }
    return baseUri;
  }
  return 'mongodb://127.0.0.1:27017/shopit_test';
}

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'http://127.0.0.1:3000',
  MONGODB_URI: resolveTestMongoUri(),
  JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-shopit-e2e-suite-at-least-32-chars',
  HEADLESS: process.env.HEADLESS !== 'false',
  DEFAULT_TIMEOUT: parseInt(process.env.E2E_TIMEOUT || '10000', 10),
  USERS: {
    admin: {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin' as const,
    },
    customer: {
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'Password123!',
      role: 'customer' as const,
    },
    retailerA: {
      name: 'Retailer A Store',
      email: 'retailerA@test.com',
      password: 'Password123!',
      role: 'retailer' as const,
    },
    retailerB: {
      name: 'Retailer B Store',
      email: 'retailerB@test.com',
      password: 'Password123!',
      role: 'retailer' as const,
    },
    pending: {
      name: 'Pending Seller',
      email: 'pending@test.com',
      password: 'Password123!',
      role: 'customer' as const,
    },
  },
};
