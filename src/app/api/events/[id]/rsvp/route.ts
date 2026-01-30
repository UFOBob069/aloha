import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getEventById, isEventAttendee, addEventAttendee, removeEventAttendee } from '@/lib/firestore';

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
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if already RSVP'd
    const isAttending = await isEventAttendee(id, user.id);

    if (isAttending) {
      // Toggle - remove RSVP
      await removeEventAttendee(id, user.id);
    } else {
      // Add RSVP
      await addEventAttendee(id, user.id);
    }

    // Redirect back to events page
    return NextResponse.redirect(new URL('/events', request.url));
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json({ error: 'Failed to RSVP' }, { status: 500 });
  }
}
