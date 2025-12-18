import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import DashboardNav from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚠️ AUTHENTICATION TEMPORARILY DISABLED FOR UI/UX TESTING
  // TODO: Re-enable after implementing bcrypt + NextAuth.js
  // See: /docs/META-REVIEW-REPORT.md for security roadmap

  // Authentication check disabled - allow all access
  // const authenticated = await isAuthenticated();
  // if (!authenticated) {
  //   redirect('/login?redirect=/dashboard');
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
