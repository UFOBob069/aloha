import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Navigation from '@/components/Navigation';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={{
          id: user.id,
          name: user.name,
          role: user.role,
        }}
      />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
