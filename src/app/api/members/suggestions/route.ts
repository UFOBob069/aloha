import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSuggestedMentors } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const suggestions = await getSuggestedMentors(user.id);

    // Convert timestamps to ISO strings for JSON serialization
    const serializedSuggestions = suggestions.map((m) => ({
      ...m,
      createdAt: m.createdAt.toDate().toISOString(),
      updatedAt: m.updatedAt.toDate().toISOString(),
    }));

    return NextResponse.json(serializedSuggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
