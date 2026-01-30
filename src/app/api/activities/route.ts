import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecentActivities, getMemberById, getGroupById } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const activities = await getRecentActivities(limit);

    // Enrich activities with actor and target names
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const actor = await getMemberById(activity.actorId);
        let targetName = null;

        if (activity.targetType === 'group' && activity.targetId) {
          const group = await getGroupById(activity.targetId);
          targetName = group?.name;
        } else if (activity.targetType === 'member' && activity.targetId) {
          const member = await getMemberById(activity.targetId);
          targetName = member?.name;
        }

        return {
          ...activity,
          actorName: actor?.name || 'Unknown',
          actorPhotoURL: actor?.photoURL,
          targetName,
          createdAt: activity.createdAt.toDate().toISOString(),
        };
      })
    );

    return NextResponse.json(enrichedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
