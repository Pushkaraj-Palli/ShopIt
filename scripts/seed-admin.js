const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function readAdminConfig() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be configured.');
  if (!name || name.length > 50) throw new Error('ADMIN_NAME must contain 1 to 50 characters.');
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }
  if (!password || password.length < 12 || password.length > 128) {
    throw new Error('ADMIN_PASSWORD must contain 12 to 128 characters.');
  }

  return { name, email, password };
}

async function seedAdmin() {
  const { name, email, password } = readAdminConfig();
  await mongoose.connect(process.env.MONGODB_URI);

  const users = mongoose.connection.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });

  const now = new Date();
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    await users.updateOne(
      { _id: existingUser._id },
      { $set: { role: 'admin', status: 'active', emailVerified: true, updatedAt: now } },
    );
    console.log(`Granted admin access to the existing account ${email}. Its password was not changed.`);
    return;
  }

  await users.insertOne({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: 'admin',
    status: 'active',
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Created the initial admin account ${email}.`);
}

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
