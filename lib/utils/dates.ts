// lib/utils/dates.ts
import {
  format,
  formatISO,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  subDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
  getDay,
} from 'date-fns';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
}

// ============================================================================
// CALENDAR GRID GENERATION
// ============================================================================

/**
 * Generate complete 42-day calendar grid for month view
 * @param date - Any date within the target month
 * @returns Array of 42 dates (6 weeks × 7 days)
 */
export function generateCalendarGrid(date: Date): Date[] {
  // CRITICAL FIX: Normalize to start of day in local timezone
  const normalizedDate = startOfDay(date);

  const monthStart = startOfDay(startOfMonth(normalizedDate));
  const monthEnd = startOfDay(endOfMonth(normalizedDate));

  const gridStart = startOfDay(startOfWeek(monthStart, { weekStartsOn: 0 }));
  const gridEnd = startOfDay(endOfWeek(monthEnd, { weekStartsOn: 0 }));

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd }).map(d => startOfDay(d));

  // Ensure exactly 42 days for consistent grid
  while (days.length < 42) {
    days.push(startOfDay(addDays(days[days.length - 1], 1)));
  }

  return days.slice(0, 42);
}

/**
 * Generate enriched calendar grid with metadata
 */
export function generateEnrichedCalendarGrid(
  date: Date
): CalendarDay[] {
  const normalizedDate = startOfDay(date);
  const grid = generateCalendarGrid(normalizedDate);

  return grid.map((gridDate) => ({
    date: gridDate, // Already normalized by generateCalendarGrid
    isCurrentMonth: isSameMonth(gridDate, normalizedDate),
    isToday: isToday(gridDate),
    dayOfWeek: getDay(gridDate),
  }));
}

/**
 * Group calendar days into weeks (7 days each)
 */
export function groupIntoWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

/**
 * Group enriched calendar days into weeks
 */
export function groupEnrichedIntoWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

// ============================================================================
// DATE COMPARISON
// ============================================================================

/**
 * Check if date is in the current month being viewed
 */
export function isCurrentMonth(date: Date, referenceMonth: Date): boolean {
  return isSameMonth(date, referenceMonth);
}

/**
 * Check if date is today
 */
export function isDateToday(date: Date): boolean {
  return isToday(date);
}

/**
 * Check if two dates are the same day (ignores time)
 */
export function areSameDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Check if date1 is before date2 (day comparison only)
 */
export function isBeforeDay(date1: Date, date2: Date): boolean {
  return isBefore(startOfDay(date1), startOfDay(date2));
}

/**
 * Check if date1 is after date2 (day comparison only)
 */
export function isAfterDay(date1: Date, date2: Date): boolean {
  return isAfter(startOfDay(date1), startOfDay(date2));
}

/**
 * Check if date is within range (inclusive)
 */
export function isInRange(
  date: Date,
  start: Date,
  end: Date
): boolean {
  const dayDate = startOfDay(date);
  const dayStart = startOfDay(start);
  const dayEnd = startOfDay(end);

  return (
    (isEqual(dayDate, dayStart) || isAfter(dayDate, dayStart)) &&
    (isEqual(dayDate, dayEnd) || isBefore(dayDate, dayEnd))
  );
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date for storage (ISO 8601 date string: YYYY-MM-DD)
 * Use this for database storage and API communication
 */
export function toISODateString(date: Date): string {
  return formatISO(date, { representation: 'date' });
}

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export function toDisplayString(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Format date for full display (e.g., "Monday, January 15, 2024")
 */
export function toFullDisplayString(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

/**
 * Format month header (e.g., "January 2024")
 */
export function toMonthYearString(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Format day of week (e.g., "Mon", "Tue")
 */
export function toDayOfWeekShort(date: Date): string {
  return format(date, 'EEE');
}

/**
 * Format day of month (e.g., "15")
 */
export function toDayOfMonth(date: Date): string {
  return format(date, 'd');
}

/**
 * Parse ISO date string to Date object
 */
export function fromISODateString(dateString: string): Date {
  return parseISO(dateString);
}

// ============================================================================
// MONTH NAVIGATION
// ============================================================================

/**
 * Get previous month
 */
export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

/**
 * Get next month
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

/**
 * Go to specific month/year
 */
export function goToMonth(month: number, year: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get today (reset to start of day)
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Navigate to previous day
 */
export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

/**
 * Navigate to next day
 */
export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

/**
 * Navigate to previous week (same day, 7 days earlier)
 */
export function getPreviousWeek(date: Date): Date {
  return subDays(date, 7);
}

/**
 * Navigate to next week (same day, 7 days later)
 */
export function getNextWeek(date: Date): Date {
  return addDays(date, 7);
}

/**
 * Navigate to start of week
 */
export function getStartOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 0 });
}

/**
 * Navigate to end of week
 */
export function getEndOfWeek(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 0 });
}

// ============================================================================
// DATE RANGE UTILITIES
// ============================================================================

/**
 * Generate array of dates for drag selection
 */
export function generateDateRange(start: Date, end: Date): Date[] {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);

  // Swap if end is before start
  const actualStart = isBefore(startDay, endDay) ? startDay : endDay;
  const actualEnd = isBefore(startDay, endDay) ? endDay : startDay;

  return eachDayOfInterval({ start: actualStart, end: actualEnd });
}

/**
 * Get all dates in current month
 */
export function getDatesInMonth(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
}
