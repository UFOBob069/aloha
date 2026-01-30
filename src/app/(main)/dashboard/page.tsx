import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get user's groups
  const userGroups = db
    .prepare(
      `SELECT g.*, COUNT(gm2.member_id) as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       LEFT JOIN group_members gm2 ON g.id = gm2.group_id
       WHERE gm.member_id = ?
       GROUP BY g.id
       ORDER BY gm.joined_at DESC
       LIMIT 3`
    )
    .all(user.id) as Array<{ id: string; name: string; purpose: string; member_count: number }>;

  // Get upcoming events
  const upcomingEvents = db
    .prepare(
      `SELECT e.*, g.name as group_name
       FROM events e
       LEFT JOIN groups g ON e.group_id = g.id
       WHERE e.event_date > datetime('now')
       ORDER BY e.event_date ASC
       LIMIT 3`
    )
    .all() as Array<{ id: string; title: string; event_date: string; group_name: string | null }>;

  // Get pending conversation requests
  const pendingRequests = db
    .prepare(
      `SELECT cr.*, m.name as from_name
       FROM conversation_requests cr
       JOIN members m ON cr.from_member_id = m.id
       WHERE cr.to_member_id = ? AND cr.status = 'pending'
       ORDER BY cr.created_at DESC
       LIMIT 5`
    )
    .all(user.id) as Array<{ id: string; from_name: string; message: string; created_at: string }>;

  // Get recent members
  const recentMembers = db
    .prepare(
      `SELECT id, name, bio, can_help_with
       FROM members
       WHERE id != ?
       ORDER BY created_at DESC
       LIMIT 4`
    )
    .all(user.id) as Array<{ id: string; name: string; bio: string | null; can_help_with: string | null }>;

  // Check if profile is incomplete
  const isProfileIncomplete = !user.bio || !user.can_help_with || !user.looking_for;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-gray-600">Here is what is happening in your community today.</p>
      </div>

      {/* Profile Completion Notice */}
      {isProfileIncomplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Complete Your Profile</h3>
              <p className="mt-1 text-amber-700">
                Help others get to know you by completing your profile. Share what you can help with and what you are
                looking for.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center mt-3 text-amber-800 font-medium hover:text-amber-900"
              >
                Complete Profile
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pending Conversation Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Requests</CardTitle>
            <CardDescription>People who would like to connect with you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{request.from_name}</p>
                    {request.message && <p className="text-sm text-gray-600 mt-1">&ldquo;{request.message}&rdquo;</p>}
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/conversations/${request.id}/respond`} method="POST">
                      <input type="hidden" name="action" value="accept" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                      >
                        Accept
                      </button>
                    </form>
                    <form action={`/api/conversations/${request.id}/respond`} method="POST">
                      <input type="hidden" name="action" value="decline" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Groups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Groups</CardTitle>
              <Link href="/groups" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {userGroups.length > 0 ? (
              <div className="space-y-3">
                {userGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="block p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{group.purpose}</p>
                    <p className="text-xs text-gray-500 mt-2">{group.member_count} members</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You have not joined any groups yet.</p>
                <Link
                  href="/groups"
                  className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
                >
                  Explore Groups
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Link href="/events" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events`}
                    className="block p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {event.group_name && <p className="text-sm text-gray-600 mt-1">{event.group_name}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No upcoming events scheduled.</p>
                <Link
                  href="/events"
                  className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
                >
                  Browse Events
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discover Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discover Members</CardTitle>
              <CardDescription>Connect with people in the community</CardDescription>
            </div>
            <Link href="/members" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentMembers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-lg mb-3">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  {member.can_help_with && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{member.can_help_with}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Be the first to invite others to the community!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/groups"
          className="p-6 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors group"
        >
          <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="font-semibold text-lg">Join a Group</h3>
          <p className="text-teal-100 text-sm mt-1">Find your community</p>
        </Link>

        <Link
          href="/members"
          className="p-6 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors group"
        >
          <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="font-semibold text-lg">Start a Conversation</h3>
          <p className="text-amber-100 text-sm mt-1">Connect one-on-one</p>
        </Link>

        <Link
          href="/events"
          className="p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors group"
        >
          <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="font-semibold text-lg">Attend an Event</h3>
          <p className="text-blue-100 text-sm mt-1">Join a gathering</p>
        </Link>
      </div>
    </div>
  );
}
