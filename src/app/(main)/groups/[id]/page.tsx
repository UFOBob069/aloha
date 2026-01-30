import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import JoinGroupButton from './JoinGroupButton';

interface Props {
  params: Promise<{ id: string }>;
}

interface GroupRow {
  id: string;
  name: string;
  purpose: string;
  description: string | null;
  cadence: string | null;
  max_size: number;
  created_by: string;
  creator_name: string;
}

interface MemberRow {
  id: string;
  name: string;
  role: string;
  joined_at: string;
}

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  meeting_link: string | null;
}

export default async function GroupPage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Get group details
  const group = db
    .prepare(
      `SELECT g.*, m.name as creator_name
       FROM groups g
       JOIN members m ON g.created_by = m.id
       WHERE g.id = ?`
    )
    .get(id) as GroupRow | undefined;

  if (!group) {
    notFound();
  }

  // Get group members
  const members = db
    .prepare(
      `SELECT m.id, m.name, gm.role, gm.joined_at
       FROM group_members gm
       JOIN members m ON gm.member_id = m.id
       WHERE gm.group_id = ?
       ORDER BY gm.role = 'facilitator' DESC, gm.joined_at ASC`
    )
    .all(id) as MemberRow[];

  // Check if current user is a member
  const isMember = members.some((m) => m.id === currentUser.id);
  const isAdminOrFacilitator =
    currentUser.role === 'admin' || members.some((m) => m.id === currentUser.id && m.role === 'facilitator');

  // Get upcoming events for this group
  const upcomingEvents = db
    .prepare(
      `SELECT * FROM events
       WHERE group_id = ? AND event_date > datetime('now')
       ORDER BY event_date ASC
       LIMIT 5`
    )
    .all(id) as EventRow[];

  const spotsLeft = group.max_size - members.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/groups" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Groups
      </Link>

      {/* Group Header */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600 mt-2">{group.purpose}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                {group.cadence && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {group.cadence}
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
                  {members.length} / {group.max_size} members
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {isMember ? (
                <span className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Member
                </span>
              ) : spotsLeft > 0 ? (
                <JoinGroupButton groupId={group.id} />
              ) : (
                <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                  Group Full
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {group.description && (
        <Card>
          <CardHeader>
            <CardTitle>About This Group</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{group.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? 's' : ''} in this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
              >
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{member.name}</p>
                  {member.role === 'facilitator' && (
                    <p className="text-xs text-amber-600 font-medium">Facilitator</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      {(isMember || isAdminOrFacilitator) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Group gatherings and meetings</CardDescription>
              </div>
              {isAdminOrFacilitator && (
                <Link
                  href={`/events/new?groupId=${group.id}`}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Create Event
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {event.meeting_link && (
                        <a
                          href={event.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No upcoming events scheduled.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
