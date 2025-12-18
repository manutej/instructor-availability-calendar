import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard (will trigger login if not authenticated)
  redirect('/dashboard');
}
