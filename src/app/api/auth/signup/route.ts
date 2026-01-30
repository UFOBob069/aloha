import { NextRequest, NextResponse } from 'next/server';
import { createMember, getMemberByEmail } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, location, whatBringsYou } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if user exists
    const existingMember = getMemberByEmail(email);
    if (existingMember) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Create member
    const member = createMember({
      email,
      password,
      name,
      location,
      whatBringsYou,
    });

    // Create session
    const session = await getSession();
    session.userId = member.id;
    session.isLoggedIn = true;
    session.role = member.role;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: member.id,
        name: member.name,
        email: member.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
