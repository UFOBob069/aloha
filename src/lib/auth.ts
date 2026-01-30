import { cookies } from 'next/headers';
import { adminAuth as getAdminAuth } from './firebase-admin';
import { getMemberById } from './firestore';
import type { Member } from './firestore';

// Helper to get the Auth instance
const adminAuth = () => getAdminAuth();

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRY_DAYS = 14;

// Verify the session cookie and get the current user
export async function getCurrentUser(): Promise<Member | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth().verifySessionCookie(sessionCookie, true);

    // Get the member from Firestore
    const member = await getMemberById(decodedClaims.uid);
    return member;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Create a session cookie from an ID token
export async function createSessionCookie(idToken: string): Promise<string> {
  const expiresIn = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // in milliseconds
  const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn });
  return sessionCookie;
}

// Verify an ID token and get user info
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

// Check if a user is an admin
export function isAdmin(member: Member | null): boolean {
  return member?.role === 'admin';
}

// Check if a user is a facilitator
export function isFacilitator(member: Member | null): boolean {
  return member?.role === 'facilitator' || member?.role === 'admin';
}
