import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import {
  createDiscussionPost,
  getGroupDiscussions,
  isGroupMember,
  createActivity,
} from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Check if user is a member of the group
    const isMember = await isGroupMember(groupId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'You must be a member of this group to view discussions' }, { status: 403 });
    }

    const discussions = await getGroupDiscussions(groupId);
    return NextResponse.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, title, content } = await request.json();

    if (!groupId || !title || !content) {
      return NextResponse.json({ error: 'Group ID, title, and content are required' }, { status: 400 });
    }

    // Check if user is a member of the group
    const isMember = await isGroupMember(groupId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'You must be a member of this group to post' }, { status: 403 });
    }

    const post = await createDiscussionPost({
      id: uuidv4(),
      groupId,
      authorId: user.id,
      title,
      content,
    });

    // Create activity
    await createActivity({
      id: uuidv4(),
      type: 'discussion_started',
      actorId: user.id,
      targetId: groupId,
      targetType: 'group',
      metadata: { postTitle: title },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
