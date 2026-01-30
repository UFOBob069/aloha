import { NextRequest, NextResponse } from 'next/server';
import { getMemberByInviteCode } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No invite code provided' }, { status: 400 });
    }

    const inviter = await getMemberByInviteCode(code);

    if (!inviter) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      inviterId: inviter.id,
      inviterName: inviter.name,
    });
  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json({ error: 'Failed to validate invite code' }, { status: 500 });
  }
}
