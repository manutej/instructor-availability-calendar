/**
 * PublicCalendarView Component
 *
 * Purpose: Public-facing read-only calendar for students/clients
 *
 * Features:
 * - Header with instructor name and last updated timestamp
 * - Read-only calendar grid (no editing)
 * - Legend showing available/blocked color codes
 * - "Contact to Book" CTA button
 * - Mobile-responsive design
 *
 * Architecture:
 * - Client component wrapping CalendarView with editable={false}
 * - Receives data from server-side page component
 * - No direct state management (read-only display)
 *
 * @see specs/SPEC-V2.md Lines 110-120 for public calendar requirements
 * @see docs/IMPLEMENTATION-PLAN-V2.md Lines 180-247 for implementation spec
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InstructorProfile } from '@/types/instructor';
import { BlockedDate } from '@/types/calendar';
import CalendarView from './CalendarView';
import { AvailabilityProvider } from '@/contexts/AvailabilityContext';

interface PublicCalendarViewProps {
  instructor: InstructorProfile;
  blockedDates: Map<string, BlockedDate>;
  lastUpdated: string;
}

/**
 * PublicCalendarView
 *
 * Displays a read-only calendar for public viewing.
 * Includes instructor information, calendar grid, legend, and CTA.
 *
 * Flow:
 * 1. Wrap in AvailabilityProvider with read-only blockedDates
 * 2. Display instructor header with name and last updated
 * 3. Render CalendarView with editable={false}
 * 4. Show legend explaining color codes
 * 5. Display "Contact to Book" CTA
 */
export default function PublicCalendarView({
  instructor,
  blockedDates,
  lastUpdated,
}: PublicCalendarViewProps) {
  // Format last updated timestamp
  const formattedLastUpdated = new Date(lastUpdated).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 text-center">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {instructor.displayName}'s Availability
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {formattedLastUpdated}
        </p>
      </Card>

      {/* Calendar - Wrapped in AvailabilityProvider for read-only access */}
      <AvailabilityProvider initialBlockedDates={blockedDates} readOnly>
        <CalendarView editable={false} />
      </AvailabilityProvider>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Legend:
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Blocked (Full Day)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-b from-red-500 from-50% to-white dark:to-slate-800 to-50% rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Morning Blocked
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-t from-red-500 from-50% to-white dark:to-slate-800 to-50% rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Afternoon Blocked
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="p-6 text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Ready to book a session?
        </p>
        <a href={`mailto:${instructor.email}`}>
          <Button size="lg" className="font-semibold">
            Contact to Book
          </Button>
        </a>
      </Card>
    </div>
  );
}
