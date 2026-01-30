import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import Card from '@/components/Card';

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  meeting_link: string | null;
  location: string | null;
  group_id: string | null;
  group_name: string | null;
  creator_name: string;
  attendee_count: number;
  is_attending: number;
}

export default async function EventsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Get all upcoming events
  const events = db
    .prepare(
      `SELECT e.*,
              g.name as group_name,
              m.name as creator_name,
              COUNT(DISTINCT ea.member_id) as attendee_count,
              EXISTS(SELECT 1 FROM event_attendees WHERE event_id = e.id AND member_id = ?) as is_attending
       FROM events e
       LEFT JOIN groups g ON e.group_id = g.id
       JOIN members m ON e.created_by = m.id
       LEFT JOIN event_attendees ea ON e.id = ea.event_id
       WHERE e.event_date > datetime('now')
       GROUP BY e.id
       ORDER BY e.event_date ASC`
    )
    .all(currentUser.id) as EventRow[];

  // Get past events
  const pastEvents = db
    .prepare(
      `SELECT e.*,
              g.name as group_name,
              m.name as creator_name,
              COUNT(DISTINCT ea.member_id) as attendee_count
       FROM events e
       LEFT JOIN groups g ON e.group_id = g.id
       JOIN members m ON e.created_by = m.id
       LEFT JOIN event_attendees ea ON e.id = ea.event_id
       WHERE e.event_date <= datetime('now')
       GROUP BY e.id
       ORDER BY e.event_date DESC
       LIMIT 10`
    )
    .all() as EventRow[];

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & Gatherings</h1>
          <p className="mt-1 text-gray-600">Join group calls, local meetups, and community gatherings.</p>
        </div>
        {isAdmin && (
          <Link
            href="/events/new"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Create Event
          </Link>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={currentUser.id} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">No upcoming events scheduled.</p>
            <p className="text-gray-500 mt-2">Check back soon for new gatherings!</p>
          </Card>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Events</h2>
          <div className="space-y-4 opacity-75">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={currentUser.id} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  currentUserId,
  isPast = false,
}: {
  event: EventRow;
  currentUserId: string;
  isPast?: boolean;
}) {
  const eventDate = new Date(event.event_date);

  return (
    <Card className={isPast ? '' : 'hover:border-teal-200 transition-colors'}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Date Badge */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-teal-100 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-teal-600 uppercase">
              {eventDate.toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-2xl font-bold text-teal-700">{eventDate.getDate()}</span>
          </div>
        </div>

        {/* Event Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
              {event.group_name && (
                <Link href={`/groups/${event.group_id}`} className="text-sm text-teal-600 hover:underline">
                  {event.group_name}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              {event.event_type === 'online' ? (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Online</span>
              ) : (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  In Person
                </span>
              )}
            </div>
          </div>

          {event.description && <p className="text-gray-600 mt-2 text-sm">{event.description}</p>}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            {event.location && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {event.location}
              </div>
            )}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {event.attendee_count} attending
            </div>
          </div>

          {/* Actions */}
          {!isPast && (
            <div className="mt-4 flex items-center gap-3">
              {event.is_attending ? (
                <span className="inline-flex items-center px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Attending
                </span>
              ) : (
                <form action={`/api/events/${event.id}/rsvp`} method="POST">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    RSVP
                  </button>
                </form>
              )}
              {event.meeting_link && (
                <a
                  href={event.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-teal-600 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors"
                >
                  Join Meeting
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
