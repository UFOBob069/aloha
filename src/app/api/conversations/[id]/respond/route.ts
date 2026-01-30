import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getConversationRequest, updateConversationRequestStatus } from '@/lib/firestore';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the conversation request
    const conversationRequest = await getConversationRequest(id);

    if (!conversationRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only the recipient can respond
    if (conversationRequest.toMemberId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (conversationRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been responded to' }, { status: 400 });
    }

    // Update the request status
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    await updateConversationRequestStatus(id, newStatus);

    // Redirect back to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Respond to conversation request error:', error);
    return NextResponse.json({ error: 'Failed to respond to request' }, { status: 500 });
  }
}
