import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';
import User from '../../../app/models/User';
import Product from '../../../app/models/Product';

export async function ensureDbConnected() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(ENV.MONGODB_URI);
  }
}

export async function createThrowawayUser(role: 'customer' | 'retailer' | 'admin' = 'customer') {
  await ensureDbConnected();
  const timestamp = Date.now();
  const email = `testuser_${timestamp}@test.com`;
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: `User ${timestamp}`,
    email,
    password: hashedPassword,
    role,
    status: 'active',
    emailVerified: true,
  });

  return {
    id: user._id.toString(),
    email,
    password,
    role,
  };
}

export async function getProductById(id: string) {
  await ensureDbConnected();
  return await Product.findById(id);
}

export async function deleteThrowawayUser(email: string) {
  await ensureDbConnected();
  await User.deleteOne({ email });
}
