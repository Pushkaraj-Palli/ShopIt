import { NextRequest, NextResponse } from 'next/server';

type SessionPayload = { id?: string; role?: string; exp?: number };

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function readSession(token: string): Promise<SessionPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader)));
    if (header.alg !== 'HS256') return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload))) as SessionPayload;
    if (!payload.id || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/account/login' || pathname === '/account/register' || pathname === '/login' || pathname === '/register') return NextResponse.next();
  const isRetailerArea = pathname === '/seller' || pathname.startsWith('/seller/');
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCustomerArea = pathname === '/checkout' || pathname.startsWith('/checkout/') || pathname === '/account' || pathname.startsWith('/account/') || pathname === '/become-a-seller';
  if (!isRetailerArea && !isAdminArea && !isCustomerArea) return NextResponse.next();

  const token = request.cookies.get('shopit_session')?.value;
  const session = token ? await readSession(token) : null;
  const loginUrl = new URL('/account/login', request.url);
  loginUrl.searchParams.set('next', pathname);

  if (!session) return NextResponse.redirect(loginUrl);
  if ((isAdminArea && session.role !== 'admin') || (isRetailerArea && !['retailer', 'admin'].includes(session.role ?? ''))) {
    const refreshUrl = new URL('/api/auth/session', request.url);
    refreshUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(refreshUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/seller/:path*', '/admin/:path*', '/account/:path*', '/checkout/:path*', '/become-a-seller'],
};
