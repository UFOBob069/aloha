import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import {
  getMemberById,
  createConversationRequest,
  getExistingConversationRequest,
  getPendingConversationRequests,
} from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { toMemberId, message } = await request.json();

    // Validate target member exists
    const targetMember = await getMemberById(toMemberId);
    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check for existing pending request
    const existingRequest = await getExistingConversationRequest(user.id, toMemberId);
    if (existingRequest && existingRequest.status === 'pending') {
      return NextResponse.json({ error: 'You already have a pending request with this member' }, { status: 400 });
    }

    // Create conversation request
    const id = uuidv4();
    await createConversationRequest({
      id,
      fromMemberId: user.id,
      toMemberId,
      message: message || undefined,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create conversation request error:', error);
    return NextResponse.json({ error: 'Failed to create conversation request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get pending conversation requests for the current user
    const requests = await getPendingConversationRequests(user.id);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get conversation requests error:', error);
    return NextResponse.json({ error: 'Failed to get conversation requests' }, { status: 500 });
  }
}
