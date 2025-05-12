import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Environment variable validation
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined');
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';

/**
 * Verify user authentication from request
 * @param request NextRequest object
 * @returns userId if authenticated, null if not
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    return decoded.id;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
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