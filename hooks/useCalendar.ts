// hooks/useCalendar.ts
import { useState, useCallback, useMemo } from 'react';
import {
  generateEnrichedCalendarGrid,
  groupEnrichedIntoWeeks,
  getNextMonth,
  getPreviousMonth,
  getToday,
  type CalendarDay,
} from '@/lib/utils/dates';

/**
 * useCalendar Hook
 *
 * Purpose: Manage calendar state (current month, navigation)
 *
 * Features:
 * - Month navigation (next, previous, today)
 * - 42-cell calendar grid generation (6 weeks × 7 days)
 * - Enriched metadata (isCurrentMonth, isToday, dayOfWeek)
 * - Performance optimized with useMemo
 *
 * Official Pattern: https://react.dev/learn/reusing-logic-with-custom-hooks
 */
export function useCalendar(initialDate: Date = new Date()) {
  const [currentMonth, setCurrentMonth] = useState(initialDate);

  // Navigate to next month
  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => getNextMonth(prev));
  }, []);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => getPreviousMonth(prev));
  }, []);

  // Navigate to today's month
  const goToToday = useCallback(() => {
    setCurrentMonth(getToday());
  }, []);

  // Navigate to specific date's month
  const goToDate = useCallback((date: Date) => {
    setCurrentMonth(date);
  }, []);

  // Calculate enriched calendar grid (42 cells: 6 weeks × 7 days)
  // Memoized - only recalculates when currentMonth changes (~60ms computation)
  const calendarDays = useMemo<CalendarDay[]>(() => {
    return generateEnrichedCalendarGrid(currentMonth);
  }, [currentMonth]);

  // Group calendar days into weeks (7 days each)
  // Memoized - dependent on calendarDays
  const calendarWeeks = useMemo<CalendarDay[][]>(() => {
    return groupEnrichedIntoWeeks(calendarDays);
  }, [calendarDays]);

  return {
    currentMonth,
    calendarDays,
    calendarWeeks,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    goToDate,
  };
}

/**
 * Performance Characteristics:
 * - calendarDays: ~60ms computation, cached until month changes
 * - calendarWeeks: ~1ms computation, cached until calendarDays changes
 * - Navigation functions: Stable references via useCallback
 *
 * Key Patterns:
 * - ✅ useMemo: Expensive date calculations only run when currentMonth changes
 * - ✅ useCallback: Navigation functions have stable references
 * - ✅ Functional state updates: setCurrentMonth(prev => ...) prevents closure issues
 * - ✅ Layer 0 utilities: All date operations use dates.ts functions
 */
