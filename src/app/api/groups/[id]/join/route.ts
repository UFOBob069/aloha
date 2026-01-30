import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getGroupById, isGroupMember, getGroupMemberCount, addMemberToGroup } from '@/lib/firestore';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get group info
    const group = await getGroupById(id);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if already a member
    const isMember = await isGroupMember(id, user.id);
    if (isMember) {
      return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 });
    }

    // Check group capacity
    const memberCount = await getGroupMemberCount(id);
    if (memberCount >= group.maxSize) {
      return NextResponse.json({ error: 'Group is full' }, { status: 400 });
    }

    // Add member to group
    await addMemberToGroup(id, user.id, 'member');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}
