import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import {
  createDiscussionPost,
  getDiscussionReplies,
  getDiscussionPost,
  isGroupMember,
  incrementReplyCount,
} from '@/lib/firestore';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const replies = await getDiscussionReplies(id);
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get the parent post
    const parentPost = await getDiscussionPost(id);
    if (!parentPost) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Check if user is a member of the group
    const isMember = await isGroupMember(parentPost.groupId, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'You must be a member of this group to reply' }, { status: 403 });
    }

    const reply = await createDiscussionPost({
      id: uuidv4(),
      groupId: parentPost.groupId,
      authorId: user.id,
      title: '',
      content,
      parentId: id,
    });

    // Increment reply count on parent
    await incrementReplyCount(id);

    return NextResponse.json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
