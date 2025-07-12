import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  isAuthenticated: boolean;
  lastActivity: number;
  sessionId: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'delica-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 30 * 60, // 30 minutes
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function createSession(sessionId: string) {
  const session = await getSession();
  session.isAuthenticated = true;
  session.lastActivity = Date.now();
  session.sessionId = sessionId;
  await session.save();
  return session;
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

export async function isSessionValid() {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.lastActivity) {
    return false;
  }
  
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  if (session.lastActivity < thirtyMinutesAgo) {
    await destroySession();
    return false;
  }
  
  // Update last activity
  session.lastActivity = Date.now();
  await session.save();
  
  return true;
}