import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import { createGroup, getAllGroups, addMemberToGroup, getGroupMemberCount } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only admins and facilitators can create groups
    if (user.role !== 'admin' && user.role !== 'facilitator') {
      return NextResponse.json({ error: 'Not authorized to create groups' }, { status: 403 });
    }

    const { name, purpose, description, cadence, maxSize } = await request.json();

    if (!name || !purpose) {
      return NextResponse.json({ error: 'Name and purpose are required' }, { status: 400 });
    }

    const id = uuidv4();

    // Create the group
    await createGroup({
      id,
      name,
      purpose,
      description: description || undefined,
      cadence: cadence || undefined,
      maxSize: maxSize || 20,
      createdBy: user.id,
    });

    // Add creator as facilitator
    await addMemberToGroup(id, user.id, 'facilitator');

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const groups = await getAllGroups();

    // Get member count for each group
    const groupsWithCount = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await getGroupMemberCount(group.id);
        return {
          ...group,
          memberCount,
        };
      })
    );

    // Sort by member count descending
    groupsWithCount.sort((a, b) => b.memberCount - a.memberCount);

    return NextResponse.json(groupsWithCount);
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ error: 'Failed to get groups' }, { status: 500 });
  }
}
