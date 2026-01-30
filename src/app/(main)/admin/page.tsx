import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
  getAllMembers,
  getAllGroups,
  getUpcomingEvents,
  getPendingReports,
  getMemberById,
  getGroupById,
} from '@/lib/firestore';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';

interface Stats {
  totalMembers: number;
  totalGroups: number;
  totalEvents: number;
  pendingReports: number;
}

interface ReportDisplay {
  id: string;
  reporterName: string;
  reportedMemberName?: string;
  reportedGroupName?: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface MemberDisplay {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get stats
  const allMembers = await getAllMembers();
  const allGroups = await getAllGroups();
  const upcomingEvents = await getUpcomingEvents(100);
  const pendingReportsRaw = await getPendingReports();

  const stats: Stats = {
    totalMembers: allMembers.length,
    totalGroups: allGroups.length,
    totalEvents: upcomingEvents.length,
    pendingReports: pendingReportsRaw.length,
  };

  // Get pending reports with details
  const reports: ReportDisplay[] = await Promise.all(
    pendingReportsRaw.slice(0, 10).map(async (report) => {
      const reporter = await getMemberById(report.reporterId);
      const reportedMember = report.reportedMemberId
        ? await getMemberById(report.reportedMemberId)
        : null;
      const reportedGroup = report.reportedGroupId
        ? await getGroupById(report.reportedGroupId)
        : null;

      return {
        id: report.id,
        reporterName: reporter?.name || 'Unknown',
        reportedMemberName: reportedMember?.name,
        reportedGroupName: reportedGroup?.name,
        reason: report.reason,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt.toDate().toISOString(),
      };
    })
  );

  // Get recent members
  const recentMembers: MemberDisplay[] = allMembers.slice(0, 10).map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    createdAt: member.createdAt.toDate().toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage the community and moderate content.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-500">Total Members</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalMembers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-500">Active Groups</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalGroups}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
          </CardContent>
        </Card>
        <Card className={stats.pendingReports > 0 ? 'border-amber-200 bg-amber-50' : ''}>
          <CardContent>
            <p className="text-sm font-medium text-gray-500">Pending Reports</p>
            <p className={`text-3xl font-bold mt-1 ${stats.pendingReports > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {stats.pendingReports}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/groups/new"
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Create Group</h3>
          <p className="text-sm text-gray-600 mt-1">Add a new community group</p>
        </Link>
        <Link
          href="/events/new"
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Create Event</h3>
          <p className="text-sm text-gray-600 mt-1">Schedule a new gathering</p>
        </Link>
        <Link
          href="/admin/members"
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Manage Members</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage all members</p>
        </Link>
      </div>

      {/* Pending Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
            <CardDescription>Review and moderate reported content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {report.reportedMemberName
                          ? `Member: ${report.reportedMemberName}`
                          : `Group: ${report.reportedGroupName}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Reported by {report.reporterName} for: {report.reason}
                      </p>
                      {report.description && <p className="text-sm text-gray-600 mt-1">{report.description}</p>}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={`/api/admin/reports/${report.id}`} method="POST">
                        <input type="hidden" name="action" value="resolve" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                        >
                          Resolve
                        </button>
                      </form>
                      <form action={`/api/admin/reports/${report.id}`} method="POST">
                        <input type="hidden" name="action" value="dismiss" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100"
                        >
                          Dismiss
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Members</CardTitle>
              <CardDescription>Newest community members</CardDescription>
            </div>
            <Link href="/admin/members" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link href={`/members/${member.id}`} className="font-medium text-gray-900 hover:text-teal-600">
                        {member.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{member.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          member.role === 'admin'
                            ? 'bg-amber-100 text-amber-700'
                            : member.role === 'facilitator'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {new Date(member.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
