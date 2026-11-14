import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days
const registerSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(128),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Please provide a valid name, email, and password' }, { status: 400 });
    const { name, email, password } = parsed.data;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json({ error: 'Authentication is not configured' }, { status: 500 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password // Password will be hashed by mongoose pre-save hook
    });
    
    // Generate JWT token. The role comes from the saved user, never the request.
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Return success response with token
    // Don't include password in the response
    const response = NextResponse.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
    response.cookies.set('shopit_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
    
  } catch (error: any) {
    console.error('Registration error:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' }, 
      { status: 500 }
    );
  }
} 
