import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Please provide a valid email and password' }, { status: 400 });
    const { email, password } = parsed.data;
    
    // Find user by email
    // We need to explicitly select the password field since it's excluded by default
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'This account is unavailable' }, { status: 403 });
    }
    
    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json({ error: 'Authentication is not configured' }, { status: 500 });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Return success response with token
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
    console.error('Login error:', error.message);
    
    return NextResponse.json(
      { error: 'Failed to authenticate user' }, 
      { status: 500 }
    );
  }
} 
