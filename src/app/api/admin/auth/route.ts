import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, checkRateLimit, logAuthAttempt } from '@/lib/adminAuth';
import { createSession } from '@/lib/session';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent');
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      logAuthAttempt(clientIP, false, userAgent);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Verify password
    const isValid = await verifyAdminPassword(password);
    
    if (isValid) {
      // Create session
      const sessionId = randomBytes(32).toString('hex');
      await createSession(sessionId);
      
      logAuthAttempt(clientIP, true, userAgent);
      return NextResponse.json({ success: true });
    } else {
      logAuthAttempt(clientIP, false, userAgent);
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}