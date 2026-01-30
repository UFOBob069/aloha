import { getIronSession, SessionOptions, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  isLoggedIn: boolean;
  role?: 'member' | 'admin' | 'facilitator';
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'aloha-rising-default-secret-key-change-in-production-32chars',
  cookieName: 'aloha-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }

  return session;
}
