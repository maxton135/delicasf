import { NextResponse } from 'next/server';
import { isSessionValid } from './session';
import bcrypt from 'bcrypt';

export function withAdminAuth<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T) => {
    try {
      const valid = await isSessionValid();
      if (!valid) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      return handler(...args);
    } catch (error) {
      console.error('Admin auth error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPassword = process.env.ADMIN_PASSWORD || 'delica2024';
  
  if (adminPasswordHash) {
    // Use hashed password if available
    try {
      return await bcrypt.compare(password, adminPasswordHash);
    } catch (error) {
      console.error('Error comparing hashed password:', error);
      return false;
    }
  } else {
    // Fallback to plain text comparison for backward compatibility
    // This should be removed once ADMIN_PASSWORD_HASH is set
    console.warn('Using plain text password comparison. Please set ADMIN_PASSWORD_HASH environment variable.');
    return password === adminPassword;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = authAttempts.get(ip);
  
  if (!attempt) {
    authAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset counter after 15 minutes
  const fifteenMinutesAgo = now - (15 * 60 * 1000);
  if (attempt.lastAttempt < fifteenMinutesAgo) {
    authAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Allow max 5 attempts per 15 minutes
  if (attempt.count >= 5) {
    return false;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  authAttempts.set(ip, attempt);
  return true;
}

export function logAuthAttempt(ip: string, success: boolean, userAgent?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ip,
    success,
    userAgent: userAgent || 'unknown',
    event: 'admin_auth_attempt'
  };
  
  // In production, you might want to send this to a logging service
  console.log('Admin auth attempt:', JSON.stringify(logEntry));
}