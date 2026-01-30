import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
  getAllGroups,
  getGroupMemberCount,
  getMemberGroups,
} from '@/lib/firestore';
import Card from '@/components/Card';

interface GroupDisplay {
  id: string;
  name: string;
  purpose: string;
  description?: string;
  cadence?: string;
  maxSize: number;
  memberCount: number;
  isMember: boolean;
}

export default async function GroupsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Get all groups with member count
  const allGroups = await getAllGroups();
  const userMemberships = await getMemberGroups(currentUser.id);
  const userGroupIds = new Set(userMemberships.map((gm) => gm.groupId));

  const groups: GroupDisplay[] = await Promise.all(
    allGroups.map(async (group) => {
      const memberCount = await getGroupMemberCount(group.id);
      return {
        id: group.id,
        name: group.name,
        purpose: group.purpose,
        description: group.description,
        cadence: group.cadence,
        maxSize: group.maxSize,
        memberCount,
        isMember: userGroupIds.has(group.id),
      };
    })
  );

  // Sort by member count descending
  groups.sort((a, b) => b.memberCount - a.memberCount);

  // Separate user's groups from other groups
  const myGroups = groups.filter((g) => g.isMember);
  const otherGroups = groups.filter((g) => !g.isMember);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Groups</h1>
          <p className="mt-1 text-gray-600">Find your place in small, purpose-driven groups.</p>
        </div>
        <Link
          href="/groups/new"
          className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          Create Group
        </Link>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Groups</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <GroupCard key={group.id} group={group} isMember />
            ))}
          </div>
        </div>
      )}

      {/* Discover Groups */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {myGroups.length > 0 ? 'Discover More Groups' : 'Discover Groups'}
        </h2>
        {otherGroups.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {myGroups.length > 0
                ? 'You have joined all available groups!'
                : 'No groups available yet. Check back soon!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group, isMember = false }: { group: GroupDisplay; isMember?: boolean }) {
  const spotsLeft = group.maxSize - group.memberCount;

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="h-full hover:border-teal-200 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
          {isMember && (
            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">Member</span>
          )}
        </div>

        <p className="mt-2 text-gray-600 text-sm line-clamp-2">{group.purpose}</p>

        {group.cadence && (
          <div className="mt-3 flex items-center text-sm text-gray-500">
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

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
          </div>
          {!isMember && spotsLeft > 0 && (
            <span className="text-sm text-amber-600">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
          )}
          {!isMember && spotsLeft <= 0 && <span className="text-sm text-red-600">Full</span>}
        </div>
      </Card>
    </Link>
  );
}
