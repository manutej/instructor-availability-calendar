/**
 * Public Availability API Route
 *
 * Purpose: Serve read-only calendar data for public sharing
 *
 * Features:
 * - GET endpoint returning blocked dates by instructor slug
 * - 5-minute ISR caching for performance
 * - Error handling for missing/inactive calendars
 * - JSON serialization of Map data structure
 *
 * @see specs/SPEC-V2.md Lines 104-120 for public sharing requirements
 * @see docs/IMPLEMENTATION-PLAN-V2.md Lines 82-122 for implementation spec
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadBlockedDates } from '@/lib/utils/storage';
import { InstructorProfile, PublicCalendarData } from '@/types/instructor';

// Enable ISR with 5-minute revalidation
export const revalidate = 300;

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/availability/[slug]
 *
 * Returns public calendar data for a given instructor slug.
 * Data includes instructor profile, blocked dates, and last update timestamp.
 *
 * MVP Implementation:
 * - Loads from localStorage (server-side fallback returns empty data)
 * - Single hardcoded instructor profile
 * - Future: Database query by slug
 *
 * @returns PublicCalendarData JSON response
 * @status 200 - Calendar found
 * @status 404 - Calendar not found or inactive
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<PublicCalendarData | { error: string }>> {
  const { slug } = await params;

  try {
    // MVP: Load blocked dates from localStorage
    // Note: SSR environment returns empty Map, client-side will have actual data
    const blockedDates = loadBlockedDates();

    // MVP: Hardcoded instructor profile
    // Future: Database query: SELECT * FROM instructors WHERE slug = $1 AND isPublic = true
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const instructorProfile: InstructorProfile = {
      id: 'instructor-1',
      slug: slug,
      displayName: 'Instructor',  // TODO: Load from database/settings
      email: 'instructor@example.com',  // TODO: Load from database/settings
      publicUrl: `${baseUrl}/calendar/${slug}`,
      isPublic: true,
    };

    // Check if calendar is public (future: database check)
    if (!instructorProfile.isPublic) {
      return NextResponse.json(
        { error: 'Calendar not available' },
        { status: 404 }
      );
    }

    // Convert Map to array for JSON serialization
    const blockedDatesArray = Array.from(blockedDates.entries()).map(
      ([dateKey, blockedDate]) => [dateKey, blockedDate] as [string, typeof blockedDate]
    );

    const response: PublicCalendarData = {
      instructor: instructorProfile,
      blockedDates: blockedDatesArray,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error(`Error fetching calendar for slug "${slug}":`, error);
    return NextResponse.json(
      { error: 'Calendar not found' },
      { status: 404 }
    );
  }
}
