import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { hasRole, type UserRole } from '@/lib/auth/permissions';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type RoleGuardResult =
  | { user: AuthenticatedUser; error: null }
  | { user: null; error: 'unauthorized' | 'forbidden' };

export function authorizationErrorResponse(error: 'unauthorized' | 'forbidden') {
  return NextResponse.json(
    { error: error === 'unauthorized' ? 'Unauthorized' : 'Forbidden' },
    { status: error === 'unauthorized' ? 401 : 403 },
  );
}

/**
 * Verify user authentication from request
 * @param request NextRequest object
 * @returns userId if authenticated, null if not
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    if (!JWT_SECRET) return null;
    const token = getRequestToken(request);
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

function getRequestToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7) || null;
  return request.cookies.get('shopit_session')?.value ?? null;
}

/** Loads the current role from MongoDB so stale JWT claims cannot grant access. */
export async function requireRole(
  request: NextRequest,
  allowedRoles: readonly UserRole[],
): Promise<RoleGuardResult> {
  const userId = await verifyAuth(request);
  if (!userId) return { user: null, error: 'unauthorized' };

  try {
    await connectToDatabase();
    const user = await User.findById(userId).select('name email role status');
    if (!user || user.status !== 'active') return { user: null, error: 'unauthorized' };
    if (!hasRole(user.role, allowedRoles)) return { user: null, error: 'forbidden' };

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      error: null,
    };
  } catch (error) {
    console.error('Role authorization lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    return { user: null, error: 'unauthorized' };
  }
}

/**
 * Get user ID from cookies (client-side)
 * @returns userId if found in localStorage, null if not
 */
export function getUserIdFromLocalStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    return userData.id || null;
  } catch (error) {
    console.error('Error getting user ID from localStorage:', error);
    return null;
  }
} 
