import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, updateMember } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      can_help_with: user.can_help_with,
      looking_for: user.looking_for,
      role: user.role,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();

    updateMember(user.id, {
      name: data.name,
      location: data.location,
      bio: data.bio,
      can_help_with: data.can_help_with,
      looking_for: data.looking_for,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
