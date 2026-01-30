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

    // Check event exists
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if already RSVP'd
    const existingRsvp = db
      .prepare('SELECT * FROM event_attendees WHERE event_id = ? AND member_id = ?')
      .get(id, user.id);

    if (existingRsvp) {
      // Toggle - remove RSVP
      db.prepare('DELETE FROM event_attendees WHERE event_id = ? AND member_id = ?').run(id, user.id);
    } else {
      // Add RSVP
      db.prepare(`
        INSERT INTO event_attendees (event_id, member_id, rsvp_status)
        VALUES (?, ?, 'attending')
      `).run(id, user.id);
    }

    // Redirect back to events page
    return NextResponse.redirect(new URL('/events', request.url));
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json({ error: 'Failed to RSVP' }, { status: 500 });
  }
}
