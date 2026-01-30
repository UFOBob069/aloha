import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import Card from '@/components/Card';

interface MemberRow {
  id: string;
  name: string;
  location: string | null;
  bio: string | null;
  can_help_with: string | null;
  looking_for: string | null;
}

export default async function MembersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Get all members except current user
  const members = db
    .prepare(
      `SELECT id, name, location, bio, can_help_with, looking_for
       FROM members
       WHERE id != ?
       ORDER BY created_at DESC`
    )
    .all(currentUser.id) as MemberRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Community Members</h1>
        <p className="mt-1 text-gray-600">
          Connect with people who share your interests or can help you on your journey.
        </p>
      </div>

      {members.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Link key={member.id} href={`/members/${member.id}`}>
              <Card className="h-full hover:border-teal-200 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-xl flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                    {member.location && <p className="text-sm text-gray-500 mt-0.5">{member.location}</p>}
                  </div>
                </div>

                {member.bio && <p className="mt-4 text-gray-600 text-sm line-clamp-2">{member.bio}</p>}

                {member.can_help_with && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Can Help With</p>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{member.can_help_with}</p>
                  </div>
                )}

                {member.looking_for && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Looking For</p>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{member.looking_for}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-teal-600 text-sm font-medium">View Profile &rarr;</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-600 text-lg">You are the first member!</p>
          <p className="text-gray-500 mt-2">Invite others to join the community.</p>
        </Card>
      )}
    </div>
  );
}
