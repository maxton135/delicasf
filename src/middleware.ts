import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store
const rateLimit = new Map<string, { count: number; lastReset: number }>();

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function checkRateLimit(ip: string, path: string, maxRequests: number, windowMs: number): boolean {
  const key = getRateLimitKey(ip, path);
  const now = Date.now();
  const windowStart = now - windowMs;
  
  let record = rateLimit.get(key);
  
  if (!record || record.lastReset < windowStart) {
    rateLimit.set(key, { count: 1, lastReset: now });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  rateLimit.set(key, record);
  return true;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://connect.squareup.com https://connect.squareupsandbox.com https://web.squarecdn.com; font-src 'self' data:; frame-src 'self' https://connect.squareup.com https://connect.squareupsandbox.com;"
  );
  
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  // Rate limiting for admin authentication
  if (request.nextUrl.pathname === '/api/admin/auth') {
    if (!checkRateLimit(ip, '/api/admin/auth', 5, 15 * 60 * 1000)) { // 5 requests per 15 minutes
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  // Rate limiting for admin APIs
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    if (!checkRateLimit(ip, '/api/admin', 100, 60 * 1000)) { // 100 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  // General API rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip, '/api', 200, 60 * 1000)) { // 200 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};