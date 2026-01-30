import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import { getMemberById, getGroupById, createReport } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { reportedMemberId, reportedGroupId, reason, description } = await request.json();

    // Validate that either a member or group is being reported
    if (!reportedMemberId && !reportedGroupId) {
      return NextResponse.json({ error: 'Must report either a member or a group' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Validate the reported entity exists
    if (reportedMemberId) {
      const member = await getMemberById(reportedMemberId);
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
    }

    if (reportedGroupId) {
      const group = await getGroupById(reportedGroupId);
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
    }

    const id = uuidv4();

    await createReport({
      id,
      reporterId: user.id,
      reportedMemberId: reportedMemberId || undefined,
      reportedGroupId: reportedGroupId || undefined,
      reason,
      description: description || undefined,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
