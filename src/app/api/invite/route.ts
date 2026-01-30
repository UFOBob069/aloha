import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateInviteCode, getInvitedMembers } from '@/lib/firestore';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create invite code for this user
    const inviteCode = await getOrCreateInviteCode(user.id);

    // Get list of members this user has invited
    const invitedMembers = await getInvitedMembers(user.id);

    return NextResponse.json({
      inviteCode,
      inviteCount: invitedMembers.length,
      invitedMembers: invitedMembers.map((m) => ({
        id: m.id,
        name: m.name,
        joinedAt: m.createdAt.toDate().toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting invite info:', error);
    return NextResponse.json({ error: 'Failed to get invite information' }, { status: 500 });
  }
}
