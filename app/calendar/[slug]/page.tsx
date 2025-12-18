/**
 * Public Calendar Page
 *
 * Purpose: Server-rendered public calendar view for students/clients
 *
 * Features:
 * - SSR with ISR caching
 * - Dynamic route based on instructor slug
 * - 404 handling for invalid/inactive calendars
 * - Metadata generation for SEO
 *
 * Architecture:
 * - Server Component (fetches data server-side)
 * - Passes data to PublicCalendarView client component
 * - No authentication required (public access)
 *
 * @see specs/SPEC-V2.md Lines 157-180 for user stories
 * @see docs/IMPLEMENTATION-PLAN-V2.md Lines 124-178 for implementation spec
 */

import { Metadata } from 'next';
import PublicCalendarView from '@/components/calendar/PublicCalendarView';
import { PublicCalendarData } from '@/types/instructor';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata for public calendar page
 * Improves SEO and social sharing
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Calendar - ${slug}`,
    description: 'View availability calendar',
  };
}

/**
 * Public Calendar Page Component
 *
 * Fetches availability data server-side and renders read-only calendar.
 * Data is cached with ISR for performance.
 *
 * Flow:
 * 1. Fetch data from API route (with ISR cache)
 * 2. Handle 404 for missing/inactive calendars
 * 3. Reconstruct Map from serialized array
 * 4. Pass data to PublicCalendarView client component
 */
export default async function PublicCalendarPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch availability data server-side
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/availability/${slug}`;

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      next: { revalidate: 300 }, // 5-minute ISR cache
    });
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Calendar Not Found</h1>
        <p className="text-gray-600">
          Unable to load calendar. Please try again later.
        </p>
      </div>
    );
  }

  // Handle 404 - calendar not found or inactive
  if (!response.ok) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Calendar Not Found</h1>
        <p className="text-gray-600">
          This calendar link may be inactive or incorrect.
        </p>
      </div>
    );
  }

  const data: PublicCalendarData = await response.json();

  // Reconstruct Map from serialized array
  const blockedDatesMap = new Map(data.blockedDates);

  return (
    <main className="container mx-auto py-8 px-4">
      <PublicCalendarView
        instructor={data.instructor}
        blockedDates={blockedDatesMap}
        lastUpdated={data.lastUpdated}
      />
    </main>
  );
}
