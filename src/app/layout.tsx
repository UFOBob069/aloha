import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
  title: 'Aloha Rising - Find Purpose Through Connection',
  description:
    'A trusted digital community where people find purpose through connection, contribution, and mentorship. Join us to stay connected, useful, and engaged.',
  keywords: ['community', 'mentorship', 'connection', 'purpose', 'retirement', 'wisdom', 'belonging'],
  openGraph: {
    title: 'Aloha Rising - Find Purpose Through Connection',
    description: 'A trusted digital community where people find purpose through connection, contribution, and mentorship.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
          <AuthProvider>{children}</AuthProvider>
        </body>
    </html>
  );
}
