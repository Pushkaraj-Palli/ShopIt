import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { verifyAuth } from '@/app/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET;
const refreshPathSchema = z.string().regex(/^\/(seller|admin)(\/|$)/).optional();

function clearSessionCookie(response: NextResponse) {
  response.cookies.set('shopit_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId || !JWT_SECRET) {
    return clearSessionCookie(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const requestedPath = request.nextUrl.searchParams.get('next') ?? undefined;
  const parsedPath = refreshPathSchema.safeParse(requestedPath);
  if (!parsedPath.success) return NextResponse.json({ error: 'Invalid redirect path' }, { status: 400 });

  try {
    await connectToDatabase();
    const user = await User.findById(userId).select('name email role status');
    if (!user || user.status !== 'active') {
      return clearSessionCookie(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    if (parsedPath.data && parsedPath.data.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/?access=denied', request.url));
    }
    if (parsedPath.data && parsedPath.data.startsWith('/seller') && !['retailer', 'admin'].includes(user.role)) {
      return NextResponse.redirect(new URL('/?access=denied', request.url));
    }

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    if (parsedPath.data) {
      const response = NextResponse.redirect(new URL(parsedPath.data, request.url));
      response.headers.set('Cache-Control', 'no-store');
      response.cookies.set('shopit_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    const response = NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    response.headers.set('Cache-Control', 'no-store');
    response.cookies.set('shopit_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error('Session refresh failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not refresh session' }, { status: 500 });
  }
}
