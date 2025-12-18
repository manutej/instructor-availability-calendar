/**
 * Availability Query Engine
 *
 * Core query execution engine for the intelligent email availability generator.
 * Executes structured queries against calendar data to find available times.
 *
 * @module lib/query-engine
 * @see docs/EMAIL-GENERATOR-SPEC.md for complete query system specification
 */

import type {
  AvailabilityDataV2,
  AvailabilityQuery,
  QueryResult,
  TimeSlotResult,
  MeetingSuggestion,
  QueryIntent,
  SlotDuration,
} from '@/types/email-generator';
import type { TimeSlot, TimePeriod } from '@/lib/time-slots';
import { TIME_PERIODS, ALL_SLOTS } from '@/lib/time-slots';
import { isV2Status } from '@/types/email-generator';

/**
 * Maximum allowed date range for queries (90 days)
 *
 * Prevents performance issues and excessive memory usage.
 */
const MAX_DATE_RANGE_DAYS = 90;

/**
 * Availability Query Engine
 *
 * Executes structured availability queries against calendar data.
 * Supports three query intents:
 * - find_days: Return fully available dates
 * - find_slots: Return specific available time slots
 * - suggest_times: Return ranked meeting suggestions
 *
 * @example
 * ```typescript
 * const engine = new AvailabilityQueryEngine(calendarData);
 *
 * // Find fully available days in January
 * const query: AvailabilityQuery = {
 *   intent: 'find_days',
 *   dateRange: {
 *     start: new Date('2026-01-01'),
 *     end: new Date('2026-01-31')
 *   }
 * };
 *
 * const result = engine.execute(query);
 * // result.items is Date[] of fully available dates
 * ```
 */
export class AvailabilityQueryEngine {
  private data: AvailabilityDataV2;

  /**
   * Create a new query engine instance
   *
   * @param data - Calendar data in v2 format (hourly slots)
   */
  constructor(data: AvailabilityDataV2) {
    this.data = data;
  }

  /**
   * Execute an availability query
   *
   * Main entry point for query execution. Routes to appropriate
   * handler based on query intent.
   *
   * @param query - Structured availability query
   * @returns Query results with matching items and optional suggestions
   * @throws Error if date range exceeds maximum or is invalid
   *
   * @example
   * ```typescript
   * const result = engine.execute({
   *   intent: 'find_slots',
   *   dateRange: { start: new Date('2026-01-01'), end: new Date('2026-01-07') },
   *   timePreference: 'morning',
   *   count: 5
   * });
   * ```
   */
  execute(query: AvailabilityQuery): QueryResult {
    // Validate date range
    this.validateDateRange(query.dateRange);

    // Route to appropriate handler based on intent
    switch (query.intent) {
      case 'find_days':
        return this.findAvailableDays(query);
      case 'find_slots':
        return this.findAvailableSlots(query);
      case 'suggest_times':
        return this.suggestMeetingTimes(query);
      default:
        throw new Error(`Unknown query intent: ${query.intent}`);
    }
  }

  /**
   * Find fully available days in the date range
   *
   * Returns dates where ALL time slots are available (none blocked).
   * Used for "available days next week" type queries.
   *
   * @param query - Query with find_days intent
   * @returns QueryResult with Date[] items
   *
   * @example
   * ```typescript
   * // Find all fully available days in January
   * const result = engine.findAvailableDays({
   *   intent: 'find_days',
   *   dateRange: { start: new Date('2026-01-01'), end: new Date('2026-01-31') }
   * });
   * // result.items = [Date('2026-01-05'), Date('2026-01-12'), ...]
   * ```
   */
  private findAvailableDays(query: AvailabilityQuery): QueryResult {
    const availableDates: Date[] = [];
    const { start, end } = query.dateRange;

    // Iterate through each date in range
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = this.formatDate(currentDate);
      const status = this.data.blockedDates[dateStr];

      // If date not in blockedDates, it's fully available
      if (!status) {
        availableDates.push(new Date(currentDate));
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Check if v2 format (hourly slots)
      if (isV2Status(status)) {
        // Check if any slots are blocked
        const hasBlockedSlots = Array.from(status.slots.values()).some(blocked => blocked === true);

        // If no slots blocked, date is fully available
        if (!hasBlockedSlots) {
          availableDates.push(new Date(currentDate));
        }
      }
      // v1 format - skip dates with any blocking
      // (v1 dates in blockedDates are at least partially blocked)

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Apply count limit if specified
    const limitedDates = query.count ? availableDates.slice(0, query.count) : availableDates;

    return {
      intent: 'find_days',
      items: limitedDates,
      query,
      suggestions: limitedDates.length === 0 ? this.generateSuggestions(query, availableDates) : undefined
    };
  }

  /**
   * Find available time slots in the date range
   *
   * Returns specific hourly slots that are available, optionally filtered
   * by time of day preference (morning/afternoon/evening).
   *
   * @param query - Query with find_slots intent
   * @returns QueryResult with TimeSlotResult[] items
   *
   * @example
   * ```typescript
   * // Find morning slots next week
   * const result = engine.findAvailableSlots({
   *   intent: 'find_slots',
   *   dateRange: { start: new Date('2026-01-06'), end: new Date('2026-01-12') },
   *   timePreference: 'morning',
   *   slotDuration: '1hour',
   *   count: 10
   * });
   * // result.items = [{ date: Date, time: '09:00', period: 'morning' }, ...]
   * ```
   */
  private findAvailableSlots(query: AvailabilityQuery): QueryResult {
    const availableSlots: TimeSlotResult[] = [];
    const { start, end } = query.dateRange;
    const timePreference = query.timePreference || 'any';

    // Get slots to check based on time preference
    const slotsToCheck = TIME_PERIODS[timePreference];

    // Iterate through each date in range
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = this.formatDate(currentDate);
      const status = this.data.blockedDates[dateStr];

      // If date not in blockedDates, all slots are available
      if (!status) {
        for (const slot of slotsToCheck) {
          availableSlots.push({
            date: new Date(currentDate),
            time: slot,
            period: this.getTimePeriod(slot)
          });
        }
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Check v2 format (hourly slots)
      if (isV2Status(status)) {
        // Check each slot in the time preference
        for (const slot of slotsToCheck) {
          const isBlocked = status.slots.get(slot as TimeSlot);

          // If slot not in map or explicitly false, it's available
          if (!isBlocked) {
            availableSlots.push({
              date: new Date(currentDate),
              time: slot,
              period: this.getTimePeriod(slot)
            });
          }
        }
      }
      // v1 format - use deriveAMPM() for backward compatibility
      else {
        // v1 dates in blockedDates have some blocking, skip them
        // (We could add v1 compatibility here if needed)
      }

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Apply slot duration filtering if needed
    const filteredSlots = this.filterBySlotDuration(availableSlots, query.slotDuration);

    // Apply count limit if specified
    const limitedSlots = query.count ? filteredSlots.slice(0, query.count) : filteredSlots;

    return {
      intent: 'find_slots',
      items: limitedSlots,
      query,
      suggestions: limitedSlots.length === 0 ? this.generateSuggestions(query, availableSlots) : undefined
    };
  }

  /**
   * Suggest ranked meeting times based on availability
   *
   * Returns intelligent meeting suggestions ranked by:
   * - Contiguous availability (more consecutive hours = higher score)
   * - Time preference match
   * - Recency (sooner dates ranked higher)
   *
   * @param query - Query with suggest_times intent
   * @returns QueryResult with MeetingSuggestion[] items (ranked by score)
   *
   * @example
   * ```typescript
   * // Get top 3 meeting suggestions
   * const result = engine.suggestMeetingTimes({
   *   intent: 'suggest_times',
   *   dateRange: { start: new Date('2026-01-01'), end: new Date('2026-01-31') },
   *   timePreference: 'afternoon',
   *   slotDuration: '1hour',
   *   count: 3
   * });
   * // result.items = [
   * //   { date: Date, time: '14:00', period: 'afternoon', score: 0.95, reason: '8 hours consecutive' },
   * //   { date: Date, time: '15:00', period: 'afternoon', score: 0.90, reason: '6 hours consecutive' },
   * //   ...
   * // ]
   * ```
   */
  private suggestMeetingTimes(query: AvailabilityQuery): QueryResult {
    // First, get all available slots
    const slotsQuery: AvailabilityQuery = {
      ...query,
      intent: 'find_slots'
    };
    const slotsResult = this.findAvailableSlots(slotsQuery);
    const availableSlots = slotsResult.items as TimeSlotResult[];

    // Score each slot based on contiguous availability
    const suggestions: MeetingSuggestion[] = availableSlots.map(slot => {
      const { score, reason } = this.scoreSlot(slot, query);

      return {
        ...slot,
        score,
        reason
      };
    });

    // Sort by score (highest first), then by date (soonest first)
    suggestions.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.date.getTime() - b.date.getTime();
    });

    // Apply count limit if specified
    const limitedSuggestions = query.count ? suggestions.slice(0, query.count) : suggestions;

    return {
      intent: 'suggest_times',
      items: limitedSuggestions,
      query,
      suggestions: limitedSuggestions.length === 0 ? this.generateSuggestions(query, availableSlots) : undefined
    };
  }

  /**
   * Score a time slot based on contiguous availability
   *
   * Higher scores for:
   * - More consecutive available hours after this slot
   * - Matches time preference
   * - Sooner dates
   *
   * @param slot - Time slot to score
   * @param query - Original query for preference matching
   * @returns Score (0-1) and human-readable reason
   */
  private scoreSlot(slot: TimeSlotResult, query: AvailabilityQuery): { score: number; reason: string } {
    const dateStr = this.formatDate(slot.date);
    const status = this.data.blockedDates[dateStr];

    // Count consecutive available hours after this slot
    let consecutiveHours = 1;  // Start with current slot
    const slotIndex = ALL_SLOTS.indexOf(slot.time as TimeSlot);

    if (slotIndex !== -1 && isV2Status(status)) {
      // Check each subsequent slot
      for (let i = slotIndex + 1; i < ALL_SLOTS.length; i++) {
        const nextSlot = ALL_SLOTS[i];
        const isBlocked = status.slots.get(nextSlot);

        if (isBlocked) {
          break;  // Hit a blocked slot
        }
        consecutiveHours++;
      }
    } else if (!status) {
      // Entire day available
      consecutiveHours = ALL_SLOTS.length - slotIndex;
    }

    // Calculate base score from consecutive hours (max 16 hours)
    const baseScore = Math.min(consecutiveHours / 16, 1.0);

    // Bonus for matching time preference (if specified)
    const preferenceBonus = query.timePreference && slot.period === query.timePreference ? 0.1 : 0;

    // Small bonus for recency (sooner = better)
    const daysFromStart = Math.floor((slot.date.getTime() - query.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const maxDays = Math.floor((query.dateRange.end.getTime() - query.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const recencyBonus = maxDays > 0 ? (1 - daysFromStart / maxDays) * 0.1 : 0;

    const finalScore = Math.min(baseScore + preferenceBonus + recencyBonus, 1.0);

    // Generate human-readable reason
    let reason = `${consecutiveHours} consecutive hour${consecutiveHours > 1 ? 's' : ''} available`;
    if (query.timePreference && slot.period === query.timePreference) {
      reason += `, matches ${query.timePreference} preference`;
    }

    return { score: finalScore, reason };
  }

  /**
   * Filter slots by required duration
   *
   * For half-day or full-day queries, only return slots that have
   * sufficient consecutive availability.
   *
   * @param slots - Available slots to filter
   * @param duration - Required slot duration (undefined = 1hour)
   * @returns Filtered slots meeting duration requirement
   */
  private filterBySlotDuration(slots: TimeSlotResult[], duration?: SlotDuration): TimeSlotResult[] {
    if (!duration || duration === '1hour') {
      return slots;  // No filtering needed for 1-hour slots
    }

    const requiredHours = duration === 'half-day' ? 6 : 16;  // half-day = 6h, full-day = 16h

    return slots.filter(slot => {
      const dateStr = this.formatDate(slot.date);
      const status = this.data.blockedDates[dateStr];

      // Count consecutive available hours starting from this slot
      let consecutiveHours = 1;
      const slotIndex = ALL_SLOTS.indexOf(slot.time as TimeSlot);

      if (slotIndex !== -1) {
        if (isV2Status(status)) {
          // Check each subsequent slot
          for (let i = slotIndex + 1; i < ALL_SLOTS.length && consecutiveHours < requiredHours; i++) {
            const nextSlot = ALL_SLOTS[i];
            const isBlocked = status.slots.get(nextSlot);

            if (isBlocked) {
              break;
            }
            consecutiveHours++;
          }
        } else if (!status) {
          // Entire day available
          consecutiveHours = ALL_SLOTS.length - slotIndex;
        }
      }

      return consecutiveHours >= requiredHours;
    });
  }

  /**
   * Generate helpful suggestions when no results found
   *
   * Analyzes why the query failed and suggests alternatives:
   * - Try different time preference
   * - Expand date range
   * - Reduce duration requirement
   *
   * @param query - Original query that returned no results
   * @param allSlots - All available slots (before filtering)
   * @returns Array of suggestion strings
   */
  private generateSuggestions(query: AvailabilityQuery, allSlots: TimeSlotResult[] | Date[]): string[] {
    const suggestions: string[] = [];

    // If no slots available at all, suggest expanding date range
    if (allSlots.length === 0) {
      suggestions.push('Try expanding your date range - no availability found in the current period');
      return suggestions;
    }

    // If we had slots but filtering removed them
    if (query.timePreference && query.timePreference !== 'any') {
      suggestions.push(`Try removing the ${query.timePreference} time preference - availability exists at other times`);
    }

    if (query.slotDuration === 'half-day' || query.slotDuration === 'full-day') {
      suggestions.push('Try 1-hour slots instead - longer blocks may not be available');
    }

    if (query.count && allSlots.length > 0) {
      suggestions.push(`${allSlots.length} slots found, but limited to ${query.count} results - remove count limit to see all`);
    }

    return suggestions;
  }

  /**
   * Validate date range is within allowed limits
   *
   * @param dateRange - Date range to validate
   * @throws Error if range is invalid or exceeds maximum
   */
  private validateDateRange(dateRange: { start: Date; end: Date }): void {
    const { start, end } = dateRange;

    // Check dates are valid
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw new Error('Invalid date range: start and end must be Date objects');
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date range: dates are not valid');
    }

    // Check end is after start
    if (end < start) {
      throw new Error('Invalid date range: end date must be after start date');
    }

    // Check range doesn't exceed maximum
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      throw new Error(
        `Date range too large: ${daysDiff} days exceeds maximum of ${MAX_DATE_RANGE_DAYS} days`
      );
    }
  }

  /**
   * Format date as ISO date string (YYYY-MM-DD)
   *
   * @param date - Date to format
   * @returns ISO date string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get time period classification for a time slot
   *
   * @param slot - Time slot to classify
   * @returns Time period (morning/afternoon/evening)
   */
  private getTimePeriod(slot: string): TimePeriod {
    const hour = parseInt(slot.split(':')[0]);

    if (hour >= 6 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 18) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  }

  /**
   * Update calendar data
   *
   * Allows refreshing the query engine with updated calendar data
   * without creating a new instance.
   *
   * @param data - New calendar data in v2 format
   */
  updateData(data: AvailabilityDataV2): void {
    this.data = data;
  }
}

/**
 * Create a new query engine instance
 *
 * Factory function for creating query engines with calendar data.
 *
 * @param data - Calendar data in v2 format
 * @returns New query engine instance
 *
 * @example
 * ```typescript
 * import { createQueryEngine } from '@/lib/query-engine';
 *
 * const engine = createQueryEngine(calendarData);
 * const result = engine.execute(query);
 * ```
 */
export function createQueryEngine(data: AvailabilityDataV2): AvailabilityQueryEngine {
  return new AvailabilityQueryEngine(data);
}
