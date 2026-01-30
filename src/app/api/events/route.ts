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

    // Only admins can create standalone events
    // Facilitators can create events for their groups (handled by checking group membership)
    const { title, description, eventDate, eventType, meetingLink, location, groupId } = await request.json();

    if (!title || !eventDate) {
      return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 });
    }

    // If groupId is provided, check if user is facilitator of that group
    if (groupId) {
      const membership = db
        .prepare('SELECT role FROM group_members WHERE group_id = ? AND member_id = ?')
        .get(groupId, user.id) as { role: string } | undefined;

      if (!membership && user.role !== 'admin') {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
      }

      if (membership?.role !== 'facilitator' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Only facilitators can create group events' }, { status: 403 });
      }
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create standalone events' }, { status: 403 });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO events (id, title, description, event_date, event_type, meeting_link, location, group_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      description || null,
      eventDate,
      eventType || 'online',
      meetingLink || null,
      location || null,
      groupId || null,
      user.id
    );

    // Auto-RSVP the creator
    db.prepare(`
      INSERT INTO event_attendees (event_id, member_id, rsvp_status)
      VALUES (?, ?, 'attending')
    `).run(id, user.id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
