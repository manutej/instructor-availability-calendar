/**
 * CalendarView Component
 *
 * Complete calendar view integrating toolbar and grid with modern glassmorphism design.
 * Main component for both private (editable) and public (read-only) calendars.
 *
 * @module components/calendar/CalendarView
 * @see docs/IMPLEMENTATION-PLAN-V2.md Task 2.6 for specification
 * @see docs/UI-IMPROVEMENT-SPEC.md Lines 163-208 for glassmorphism design
 *
 * Design Features:
 * - Ambient gradient background (depth)
 * - Glassmorphic card with backdrop blur
 * - Soft shadows for elevation
 * - Responsive padding (mobile-first)
 * - Legend component for visual state guide
 *
 * Props:
 * - editable (optional): Enable/disable interactions (default: true)
 *
 * Usage:
 * ```tsx
 * // Private calendar (instructor)
 * <CalendarView />
 *
 * // Public calendar (read-only)
 * <CalendarView editable={false} />
 * ```
 */

'use client';

import { useCalendar } from '@/hooks/useCalendar';
import { useAvailability } from '@/contexts/AvailabilityContext';
import CalendarToolbar from './CalendarToolbar';
import CalendarGrid from './CalendarGrid';
import Legend from './Legend';
import { cn } from '@/lib/utils';
import { glassmorphicCard, borderRadius } from '@/lib/design-tokens';

interface CalendarViewProps {
  editable?: boolean;
}

export default function CalendarView({ editable = true }: CalendarViewProps) {
  const {
    currentMonth,
    calendarWeeks,
    goToNextMonth,
    goToPreviousMonth,
    goToToday
  } = useCalendar();

  const {
    refreshGoogleCalendar,
    isLoading,
    isSaving,
    lastSaved
  } = useAvailability();

  return (
    <div className="relative">
      {/* Ambient background gradient for depth */}
      <div
        className={cn(
          'absolute inset-0 -z-10',
          'bg-gradient-to-br from-blue-50 via-white to-purple-50',
          borderRadius['3xl']
        )}
      />

      {/* Main calendar card with glassmorphism */}
      <div
        className={cn(
          'relative overflow-hidden',
          glassmorphicCard,
          borderRadius['2xl'],
          'p-4 sm:p-6 lg:p-8'
        )}
      >
        <CalendarToolbar
          currentMonth={currentMonth}
          onPrevMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          onRefresh={editable ? refreshGoogleCalendar : undefined}
          isLoading={isLoading}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />

        <CalendarGrid
          calendarWeeks={calendarWeeks}
          currentMonth={currentMonth}
          editable={editable}
        />

        <Legend />
      </div>
    </div>
  );
}
