/**
 * Public Availability API Route
 *
 * Purpose: Serve read-only calendar data for public sharing
 *
 * Features:
 * - GET endpoint returning blocked dates by instructor slug
 * - 5-minute ISR caching for performance
 * - Supabase database query for cross-device persistence
 * - Error handling for missing/inactive calendars
 * - JSON serialization of Map data structure
 *
 * @see specs/SPEC-V2.md Lines 104-120 for public sharing requirements
 * @see docs/IMPLEMENTATION-PLAN-V2.md Lines 82-122 for implementation spec
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { InstructorProfile, PublicCalendarData } from '@/types/instructor';

// Enable ISR with 5-minute revalidation
export const revalidate = 300;

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Create a server-side Supabase client for API routes
 * Uses environment variables directly (server-side safe)
 */
function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[API] Supabase not configured');
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Server-side: no session persistence
    },
  });
}

/**
 * GET /api/availability/[slug]
 *
 * Returns public calendar data for a given instructor slug.
 * Data includes instructor profile, blocked dates, and last update timestamp.
 *
 * Implementation:
 * - Queries Supabase by slug for cross-device persistence
 * - Falls back to empty calendar if instructor not found
 * - Uses the availability_with_profile view for efficient joins
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
    const supabase = getServerSupabaseClient();
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    if (!supabase) {
      console.error('[API] Supabase not configured - cannot serve public calendar');
      return NextResponse.json(
        { error: 'Calendar service unavailable' },
        { status: 503 }
      );
    }

    // Query instructor profile by slug
    console.log(`[API] Fetching calendar for slug: ${slug}`);
    const { data: profile, error: profileError } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (profileError || !profile) {
      console.log(`[API] No profile found for slug: ${slug}`, profileError);
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      );
    }

    // Check if calendar is public
    if (!profile.is_public) {
      console.log(`[API] Calendar not public for slug: ${slug}`);
      return NextResponse.json(
        { error: 'Calendar not available' },
        { status: 404 }
      );
    }

    // Fetch availability data by instructor_id
    const { data: availability, error: availError } = await supabase
      .from('instructor_availability')
      .select('availability_data, updated_at')
      .eq('instructor_id', profile.instructor_id)
      .single();

    // Build instructor profile for response
    const instructorProfile: InstructorProfile = {
      id: profile.id,
      slug: profile.slug,
      displayName: profile.display_name,
      email: profile.email || '',
      publicUrl: `${baseUrl}/calendar/${profile.slug}`,
      isPublic: profile.is_public,
    };

    // Convert availability data to blocked dates array
    let blockedDatesArray: Array<[string, any]> = [];
    let lastUpdated = new Date().toISOString();

    if (availability && availability.availability_data) {
      const availData = availability.availability_data as any;
      lastUpdated = availability.updated_at || availData.lastModified || lastUpdated;

      // Convert blockedDates object to array format expected by client
      if (availData.blockedDates) {
        blockedDatesArray = Object.entries(availData.blockedDates).map(
          ([dateKey, dateData]: [string, any]) => {
            // Handle v2 format with slots
            if (dateData && 'slots' in dateData) {
              return [dateKey, {
                date: dateKey,
                status: dateData.fullDayBlock ? 'full' : 'partial',
                eventName: dateData.eventName,
                slots: dateData.slots, // Keep slots for detailed view
              }];
            }
            // Handle v1 format (date, status, eventName)
            return [dateKey, dateData];
          }
        );
      }
    }

    const response: PublicCalendarData = {
      instructor: instructorProfile,
      blockedDates: blockedDatesArray,
      lastUpdated,
    };

    console.log(`[API] ✓ Returning calendar for ${profile.display_name} with ${blockedDatesArray.length} blocked dates`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error(`[API] Error fetching calendar for slug "${slug}":`, error);
    return NextResponse.json(
      { error: 'Calendar not found' },
      { status: 404 }
    );
  }
}
