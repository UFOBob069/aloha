import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

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
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id) as
      | { id: string; max_size: number }
      | undefined;

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if already a member
    const existingMembership = db
      .prepare('SELECT * FROM group_members WHERE group_id = ? AND member_id = ?')
      .get(id, user.id);

    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 });
    }

    // Check group capacity
    const memberCount = db
      .prepare('SELECT COUNT(*) as count FROM group_members WHERE group_id = ?')
      .get(id) as { count: number };

    if (memberCount.count >= group.max_size) {
      return NextResponse.json({ error: 'Group is full' }, { status: 400 });
    }

    // Add member to group
    db.prepare(`
      INSERT INTO group_members (group_id, member_id, role)
      VALUES (?, ?, 'member')
    `).run(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}
