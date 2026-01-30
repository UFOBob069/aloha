import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getAllMembers } from '@/lib/firestore';
import Card from '@/components/Card';
import MemberSearch from '@/components/MemberSearch';

export default async function MembersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Get all members except current user
  const allMembers = await getAllMembers();
  const members = allMembers
    .filter((m) => m.id !== currentUser.id)
    .map((m) => ({
      id: m.id,
      name: m.name,
      location: m.location,
      bio: m.bio,
      canHelpWith: m.canHelpWith,
      lookingFor: m.lookingFor,
    }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Members</h1>
          <p className="mt-1 text-gray-600">
            Connect with people who share your interests or can help you on your journey.
          </p>
        </div>
        <div className="sm:w-64">
          <MemberSearch />
        </div>
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

                {member.canHelpWith && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Can Help With</p>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{member.canHelpWith}</p>
                  </div>
                )}

                {member.lookingFor && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Looking For</p>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{member.lookingFor}</p>
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
