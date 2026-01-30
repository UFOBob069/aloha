import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser, getMemberById } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { toMemberId, message } = await request.json();

    // Validate target member exists
    const targetMember = getMemberById(toMemberId);
    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check for existing pending request
    const existingRequest = db
      .prepare(
        `SELECT * FROM conversation_requests
         WHERE from_member_id = ? AND to_member_id = ? AND status = 'pending'`
      )
      .get(user.id, toMemberId);

    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending request with this member' }, { status: 400 });
    }

    // Create conversation request
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO conversation_requests (id, from_member_id, to_member_id, message, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    stmt.run(id, user.id, toMemberId, message || null);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create conversation request error:', error);
    return NextResponse.json({ error: 'Failed to create conversation request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get conversation requests for the current user
    const requests = db
      .prepare(
        `SELECT cr.*,
                m_from.name as from_name, m_from.bio as from_bio,
                m_to.name as to_name, m_to.bio as to_bio
         FROM conversation_requests cr
         JOIN members m_from ON cr.from_member_id = m_from.id
         JOIN members m_to ON cr.to_member_id = m_to.id
         WHERE cr.from_member_id = ? OR cr.to_member_id = ?
         ORDER BY cr.created_at DESC`
      )
      .all(user.id, user.id);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get conversation requests error:', error);
    return NextResponse.json({ error: 'Failed to get conversation requests' }, { status: 500 });
  }
}
