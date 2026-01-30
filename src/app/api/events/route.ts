import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { getCurrentUser } from '@/lib/auth';
import { createEvent, addEventAttendee, getGroupMembers, toTimestamp } from '@/lib/firestore';

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
      const groupMembers = await getGroupMembers(groupId);
      const membership = groupMembers.find((m) => m.memberId === user.id);

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

    await createEvent({
      id,
      title,
      description: description || undefined,
      eventDate: toTimestamp(new Date(eventDate)),
      eventType: eventType || 'online',
      meetingLink: meetingLink || undefined,
      location: location || undefined,
      groupId: groupId || undefined,
      createdBy: user.id,
    });

    // Auto-RSVP the creator
    await addEventAttendee(id, user.id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
