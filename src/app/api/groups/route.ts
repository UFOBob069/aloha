import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

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
    db.prepare(`
      INSERT INTO groups (id, name, purpose, description, cadence, max_size, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, purpose, description || null, cadence || null, maxSize || 20, user.id);

    // Add creator as facilitator
    db.prepare(`
      INSERT INTO group_members (group_id, member_id, role)
      VALUES (?, ?, 'facilitator')
    `).run(id, user.id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const groups = db
      .prepare(
        `SELECT g.*, COUNT(gm.member_id) as member_count
         FROM groups g
         LEFT JOIN group_members gm ON g.id = gm.group_id
         GROUP BY g.id
         ORDER BY member_count DESC, g.created_at DESC`
      )
      .all();

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ error: 'Failed to get groups' }, { status: 500 });
  }
}
