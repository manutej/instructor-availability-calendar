/**
 * CalendarGrid Component
 *
 * Purpose: Accessible calendar grid with comprehensive keyboard navigation
 *
 * Features:
 * - 7-column grid with day headers (Sun-Sat)
 * - 42 DayCell components (6 weeks × 7 days)
 * - Full keyboard navigation (arrows, Home/End, Enter/Space)
 * - Roving tabIndex pattern for keyboard focus management
 * - ARIA grid pattern with proper roles and labels
 * - Screen reader instructions
 * - Responsive gap sizing and container constraints
 * - Stagger animations on mount (framer-motion)
 *
 * Keyboard Navigation:
 * - ArrowUp/Down: Navigate weeks (±7 days)
 * - ArrowLeft/Right: Navigate days (±1 day)
 * - Home/End: Jump to start/end of current week
 * - Enter/Space: Select focused date
 * - All keys preventDefault() to avoid page scroll
 *
 * ARIA Pattern:
 * - Container: role="application" with aria-label
 * - Grid: role="grid" with aria-labelledby
 * - Rows: role="row" (using className="contents")
 * - Headers: role="columnheader"
 * - Screen reader instructions (sr-only)
 *
 * Design Features:
 * - Container: w-full p-4 sm:p-6 md:max-w-2xl md:mx-auto md:p-6 lg:max-w-4xl lg:p-8
 * - Grid: grid-cols-7 gap-1 md:gap-2
 * - Day headers: text-xs font-medium uppercase tracking-wider
 * - Roving tabIndex: only focused cell has tabIndex={0}
 *
 * @see docs/IMPLEMENTATION-PLAN-V2.md Lines 168-247 for specification
 * @see docs/UI-IMPROVEMENT-SPEC.md Lines 210-276 for design patterns
 */

'use client';

import { useCallback, useEffect, useRef, useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, subDays } from 'date-fns';
import DayCell from './DayCell';
import { type CalendarDay } from '@/lib/utils/dates';
import { staggerVariants, cellVariants } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  calendarWeeks: CalendarDay[][];
  currentMonth: Date;
  editable?: boolean;
}

export default function CalendarGrid({
  calendarWeeks,
  currentMonth,
  editable = true
}: CalendarGridProps) {
  // Flatten calendar weeks into single array for keyboard navigation
  const allDays = calendarWeeks.flat();

  // Focused date index for roving tabIndex pattern
  const [focusedDateIndex, setFocusedDateIndex] = useState<number>(0);

  // Refs for each cell to programmatically focus
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Grid ref for ARIA labeling
  const gridRef = useRef<HTMLDivElement>(null);

  // Day names header
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate unique ID for aria-labelledby
  const monthYearId = `month-year-label-${format(currentMonth, 'yyyy-MM')}`;

  // Initialize focus to today or first current month date
  useEffect(() => {
    const todayIndex = allDays.findIndex(day => day.isToday);
    const firstCurrentMonthIndex = allDays.findIndex(day => day.isCurrentMonth);

    if (todayIndex !== -1) {
      setFocusedDateIndex(todayIndex);
    } else if (firstCurrentMonthIndex !== -1) {
      setFocusedDateIndex(firstCurrentMonthIndex);
    }
  }, [currentMonth]); // Reset when month changes

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>, currentIndex: number) => {
    let newIndex = currentIndex;
    let handled = false;

    switch (event.key) {
      case 'ArrowUp':
        // Move 7 days up (previous week)
        newIndex = Math.max(0, currentIndex - 7);
        handled = true;
        break;

      case 'ArrowDown':
        // Move 7 days down (next week)
        newIndex = Math.min(allDays.length - 1, currentIndex + 7);
        handled = true;
        break;

      case 'ArrowLeft':
        // Move 1 day left (previous day)
        newIndex = Math.max(0, currentIndex - 1);
        handled = true;
        break;

      case 'ArrowRight':
        // Move 1 day right (next day)
        newIndex = Math.min(allDays.length - 1, currentIndex + 1);
        handled = true;
        break;

      case 'Home':
        // Jump to start of current week (Sunday)
        const weekStartIndex = Math.floor(currentIndex / 7) * 7;
        newIndex = weekStartIndex;
        handled = true;
        break;

      case 'End':
        // Jump to end of current week (Saturday)
        const weekEndIndex = Math.floor(currentIndex / 7) * 7 + 6;
        newIndex = Math.min(weekEndIndex, allDays.length - 1);
        handled = true;
        break;

      case 'Enter':
      case ' ':
        // Trigger click on focused date (handled by DayCell)
        // DayCell will manage the selection via its onClick handler
        cellRefs.current[currentIndex]?.click();
        handled = true;
        break;

      default:
        // Let other keys pass through
        break;
    }

    if (handled) {
      event.preventDefault(); // Prevent page scroll
      event.stopPropagation();

      // Update focused index
      if (newIndex !== currentIndex) {
        setFocusedDateIndex(newIndex);

        // Programmatically focus the new cell
        cellRefs.current[newIndex]?.focus();
      }
    }
  }, [allDays.length]);

  return (
    <div
      role="application"
      aria-label="Calendar availability selector"
      className={cn(
        // Responsive container with constraints
        'w-full',
        'p-4 sm:p-6',
        'md:max-w-2xl md:mx-auto md:p-6',
        'lg:max-w-4xl lg:p-8'
      )}
    >
      {/* Screen reader instructions */}
      <div className="sr-only" id="calendar-instructions">
        Use arrow keys to navigate between dates. Press Enter or Space to select a date.
        Home and End keys move to the start and end of the current week.
      </div>

      {/* Hidden month/year label for aria-labelledby */}
      <h2 id={monthYearId} className="sr-only">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>

      {/* Day headers */}
      <div
        className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 mb-3"
        role="row"
      >
        {DAY_NAMES.map(day => (
          <div
            key={day}
            role="columnheader"
            className={cn(
              /* Typography */
              'text-xs',
              'sm:text-sm',
              'font-medium',
              'uppercase',
              'tracking-wider',
              'text-gray-600',

              /* Alignment */
              'text-center',

              /* Padding */
              'pb-2',

              /* Border bottom */
              'border-b border-gray-200/50'
            )}
            aria-label={day}
          >
            <abbr title={day} className="no-underline">
              {day.substring(0, 3)}
            </abbr>
          </div>
        ))}
      </div>

      {/* Calendar grid with ARIA grid pattern */}
      <motion.div
        ref={gridRef}
        role="grid"
        aria-labelledby={monthYearId}
        aria-describedby="calendar-instructions"
        className={cn(
          /* Grid layout */
          "grid grid-cols-7",

          /* Gap - Progressive */
          "gap-1",         /* 4px mobile */
          "sm:gap-2",      /* 8px tablet */
          "md:gap-3",      /* 12px desktop */

          /* Padding around grid */
          "p-4 sm:p-6 md:p-8",

          /* Background - Subtle gradient */
          "bg-gradient-to-br from-gray-50/30 via-white to-slate-50/30",

          /* Border radius */
          "rounded-2xl",

          /* Outer shadow */
          "shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        )}
        variants={staggerVariants}
        initial="hidden"
        animate="show"
        key={currentMonth.toISOString()} // Re-animate on month change
      >
        {calendarWeeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="contents">
            {week.map((day, dayIndex) => {
              const flatIndex = weekIndex * 7 + dayIndex;
              const isFocused = flatIndex === focusedDateIndex;

              return (
                <motion.div
                  key={day.date.toISOString()}
                  ref={(el) => {
                    cellRefs.current[flatIndex] = el;
                  }}
                  role="gridcell"
                  variants={cellVariants}
                  tabIndex={isFocused ? 0 : -1} // Roving tabIndex
                  onKeyDown={(e) => handleKeyDown(e, flatIndex)}
                  onFocus={() => setFocusedDateIndex(flatIndex)}
                  className="focus:outline-none" // Remove browser focus outline (handled by DayCell)
                  aria-label={`${format(day.date, 'EEEE, MMMM d, yyyy')}${day.isToday ? ', today' : ''}${!day.isCurrentMonth ? ', not in current month' : ''}`}
                >
                  <DayCell
                    day={day}
                    editable={editable}
                  />
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
