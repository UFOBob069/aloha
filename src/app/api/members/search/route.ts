import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { searchMembers, getMembersByFilters } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const location = searchParams.get('location');
    const canHelpWith = searchParams.get('canHelpWith');
    const lookingFor = searchParams.get('lookingFor');

    let members;

    if (query) {
      members = await searchMembers(query);
    } else if (location || canHelpWith || lookingFor) {
      members = await getMembersByFilters({
        location: location || undefined,
        canHelpWith: canHelpWith || undefined,
        lookingFor: lookingFor || undefined,
      });
    } else {
      return NextResponse.json({ error: 'Search query or filters required' }, { status: 400 });
    }

    // Exclude current user from results
    members = members.filter((m) => m.id !== user.id);

    // Convert timestamps to ISO strings for JSON serialization
    const serializedMembers = members.map((m) => ({
      ...m,
      createdAt: m.createdAt.toDate().toISOString(),
      updatedAt: m.updatedAt.toDate().toISOString(),
    }));

    return NextResponse.json(serializedMembers);
  } catch (error) {
    console.error('Error searching members:', error);
    return NextResponse.json({ error: 'Failed to search members' }, { status: 500 });
  }
}
