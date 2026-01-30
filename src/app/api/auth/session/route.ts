import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionCookie, verifyIdToken } from '@/lib/auth';
import { getMemberById, createMember, toTimestamp } from '@/lib/firestore';

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRY_DAYS = 14;

// Create a session from Firebase ID token
export async function POST(request: NextRequest) {
  try {
    const { idToken, isNewUser, displayName, photoURL, location, whatBringsYou } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await verifyIdToken(idToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
    }

    const { uid, email, name, picture } = decodedToken;

    // Check if member exists in Firestore
    let member = await getMemberById(uid);

    if (!member) {
      // Create new member
      member = await createMember({
        id: uid,
        email: email || '',
        name: displayName || name || email?.split('@')[0] || 'Anonymous',
        location: location,
        whatBringsYou: whatBringsYou,
        photoURL: photoURL || picture,
        role: 'member',
      });
    } else if (isNewUser) {
      // This shouldn't happen, but handle it gracefully
      console.warn('User marked as new but already exists:', uid);
    }

    // Create session cookie
    const sessionCookie = await createSessionCookie(idToken);

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// Delete session (logout)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
