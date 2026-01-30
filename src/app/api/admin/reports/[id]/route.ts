import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getReport, updateReportStatus } from '@/lib/firestore';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (!['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the report
    const report = await getReport(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update the report status
    const newStatus = action === 'resolve' ? 'resolved' : 'dismissed';
    await updateReportStatus(id, newStatus, user.id);

    // Redirect back to admin page
    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    console.error('Handle report error:', error);
    return NextResponse.json({ error: 'Failed to handle report' }, { status: 500 });
  }
}
