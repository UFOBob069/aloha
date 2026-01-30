import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getMemberById } from '@/lib/auth';
import db from '@/lib/db';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import ConversationRequestButton from './ConversationRequestButton';
import ReportButton from '@/components/ReportButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const member = getMemberById(id);

  if (!member || !currentUser) {
    notFound();
  }

  // Check if there's an existing conversation request
  const existingRequest = db
    .prepare(
      `SELECT * FROM conversation_requests
       WHERE (from_member_id = ? AND to_member_id = ?)
          OR (from_member_id = ? AND to_member_id = ?)
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(currentUser.id, member.id, member.id, currentUser.id) as {
    id: string;
    status: string;
    from_member_id: string;
  } | undefined;

  // Get member's groups
  const memberGroups = db
    .prepare(
      `SELECT g.id, g.name, g.purpose
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.member_id = ?
       LIMIT 5`
    )
    .all(member.id) as Array<{ id: string; name: string; purpose: string }>;

  const isOwnProfile = currentUser.id === member.id;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/members" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Members
      </Link>

      {/* Profile Header */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-3xl flex-shrink-0">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              {member.location && <p className="text-gray-500 mt-1">{member.location}</p>}
              {member.bio && <p className="text-gray-700 mt-4 leading-relaxed">{member.bio}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <ConversationRequestButton
                  memberId={member.id}
                  memberName={member.name}
                  existingRequest={existingRequest}
                  currentUserId={currentUser.id}
                />
                <ReportButton memberId={member.id} memberName={member.name} />
              </div>
            </div>
          )}

          {isOwnProfile && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Can Help With */}
      {member.can_help_with && (
        <Card>
          <CardHeader>
            <CardTitle>I Can Help With</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{member.can_help_with}</p>
          </CardContent>
        </Card>
      )}

      {/* Looking For */}
      {member.looking_for && (
        <Card>
          <CardHeader>
            <CardTitle>I Am Looking For</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{member.looking_for}</p>
          </CardContent>
        </Card>
      )}

      {/* Groups */}
      {memberGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Groups {member.name.split(' ')[0]} is part of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memberGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="block p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{group.purpose}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
