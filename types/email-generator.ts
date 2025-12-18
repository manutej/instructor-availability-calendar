/**
 * Email Generator Type Definitions
 *
 * Types for AI-powered intelligent email availability generator with
 * natural language query support and hourly time slot granularity.
 *
 * @module types/email-generator
 * @see docs/EMAIL-GENERATOR-SPEC.md for complete feature specification
 */

import type { TimeSlot, TimePeriod } from '@/lib/time-slots';

// ============================================================================
// Enhanced Data Model (v2)
// ============================================================================

/**
 * Version 2 time slot status with hourly granularity
 *
 * Replaces v1 AM/PM boolean system with 16 hourly slots (6am-10pm).
 * Backward compatible - can derive AM/PM from slot data.
 *
 * @example
 * ```typescript
 * const status: TimeSlotStatus = {
 *   slots: new Map([
 *     ['09:00', true],  // 9am blocked
 *     ['10:00', true],  // 10am blocked
 *     ['14:00', false]  // 2pm available
 *   ]),
 *   fullDayBlock: false,
 *   eventName: 'Morning Workshop'
 * };
 * ```
 */
export interface TimeSlotStatus {
  /**
   * Map of time slots to blocked status
   *
   * Key: Time slot string ('06:00', '07:00', etc.)
   * Value: true if blocked, false if available
   *
   * Using Map for O(1) lookup during query execution.
   */
  slots: Map<TimeSlot, boolean>;

  /**
   * Whether entire day is blocked (optimization flag)
   *
   * When true, can skip checking individual slots.
   * When false, check slots map for partial blocking.
   */
  fullDayBlock?: boolean;

  /** Optional event name/description for blocked time */
  eventName?: string;
}

/**
 * Enhanced availability data with version support
 *
 * Supports both v1 (BlockedDate with AM/PM) and v2 (TimeSlotStatus) formats.
 * Auto-migration happens on first load.
 *
 * @example
 * ```typescript
 * // v2 format
 * const data: AvailabilityDataV2 = {
 *   version: 2,
 *   blockedDates: {
 *     '2026-01-15': {
 *       slots: new Map([['09:00', true]]),
 *       eventName: 'Meeting'
 *     }
 *   },
 *   instructorId: 'john-doe'
 * };
 * ```
 */
export interface AvailabilityDataV2 {
  /** Data version (1 = AM/PM, 2 = hourly slots) */
  version: 1 | 2;

  /**
   * Map of blocked dates/times keyed by ISO date string
   *
   * Value can be either v1 BlockedDate or v2 TimeSlotStatus.
   * Type checking via isV2Status() helper.
   */
  blockedDates: {
    [date: string]: import('./calendar').BlockedDate | TimeSlotStatus;
  };

  /** Instructor identifier for data ownership */
  instructorId: string;

  /** ISO timestamp of last data modification */
  lastModified?: string;
}

// ============================================================================
// Query System Types
// ============================================================================

/**
 * Natural language query intent classification
 *
 * Determines how the query engine processes calendar data:
 * - find_days: Return fully available dates (no blocked slots)
 * - find_slots: Return specific available time slots
 * - suggest_times: Return ranked meeting suggestions
 */
export type QueryIntent = 'find_days' | 'find_slots' | 'suggest_times';

/**
 * Duration granularity for availability queries
 *
 * - 1hour: Individual hourly slots (09:00, 10:00, etc.)
 * - half-day: Morning or afternoon blocks (6 hours each)
 * - full-day: Entire day (all 16 slots)
 */
export type SlotDuration = '1hour' | 'half-day' | 'full-day';

/**
 * Structured availability query object
 *
 * Parsed from natural language input by Claude API.
 * Executed by AvailabilityQueryEngine against calendar data.
 *
 * @example
 * ```typescript
 * // "Available mornings next week"
 * const query: AvailabilityQuery = {
 *   intent: 'find_slots',
 *   dateRange: {
 *     start: new Date('2026-01-06'),
 *     end: new Date('2026-01-12')
 *   },
 *   timePreference: 'morning',
 *   slotDuration: '1hour',
 *   count: 10
 * };
 * ```
 */
export interface AvailabilityQuery {
  /** Query intent classification */
  intent: QueryIntent;

  /**
   * Date range to search within
   *
   * Maximum range: 90 days (enforced by query engine)
   */
  dateRange: {
    start: Date;
    end: Date;
  };

  /**
   * Preferred time of day filter
   *
   * - morning: 6am-12pm
   * - afternoon: 12pm-6pm
   * - evening: 6pm-10pm
   * - any: All time slots
   */
  timePreference?: TimePeriod;

  /**
   * Required slot duration/granularity
   *
   * Determines whether to look for full days, half days, or hourly slots.
   */
  slotDuration?: SlotDuration;

  /**
   * Maximum number of results to return
   *
   * Used for "suggest top 5 times" type queries.
   * If omitted, returns all matching results.
   */
  count?: number;
}

/**
 * Time slot result item
 *
 * Represents a specific available hour on a specific date.
 * Returned by find_slots queries.
 *
 * @example
 * ```typescript
 * const slot: TimeSlotResult = {
 *   date: new Date('2026-01-15'),
 *   time: '09:00',
 *   period: 'morning'
 * };
 * ```
 */
export interface TimeSlotResult {
  /** Date of available slot */
  date: Date;

  /** Time of available slot ('06:00', '07:00', etc.) */
  time: TimeSlot;

  /** Time period classification */
  period: TimePeriod;
}

/**
 * Meeting suggestion with score and reasoning
 *
 * Returned by suggest_times queries with intelligent ranking.
 * Ranked by contiguous availability (more consecutive hours = higher score).
 *
 * @example
 * ```typescript
 * const suggestion: MeetingSuggestion = {
 *   date: new Date('2026-01-15'),
 *   time: '09:00',
 *   period: 'morning',
 *   score: 0.8,
 *   reason: '8 consecutive hours available'
 * };
 * ```
 */
export interface MeetingSuggestion extends TimeSlotResult {
  /**
   * Suggestion quality score (0-1)
   *
   * Based on:
   * - Contiguous availability (preferred)
   * - Time of day preference match
   * - Recency (sooner dates ranked higher)
   */
  score: number;

  /** Human-readable reason for this suggestion */
  reason: string;
}

/**
 * Query execution result
 *
 * Contains matching dates/slots based on query intent,
 * plus alternative suggestions if no results found.
 *
 * @example
 * ```typescript
 * const result: QueryResult = {
 *   intent: 'find_slots',
 *   items: [
 *     { date: new Date('2026-01-15'), time: '09:00', period: 'morning' }
 *   ],
 *   query: { ... },  // Original query
 *   suggestions: []   // Empty if results found
 * };
 * ```
 */
export interface QueryResult {
  /** Query intent (echoed from input) */
  intent: QueryIntent;

  /**
   * Matching results (type depends on intent)
   *
   * - find_days → Date[]
   * - find_slots → TimeSlotResult[]
   * - suggest_times → MeetingSuggestion[]
   */
  items: Date[] | TimeSlotResult[] | MeetingSuggestion[];

  /** Original query for reference */
  query: AvailabilityQuery;

  /**
   * Alternative suggestions if no results found
   *
   * E.g., "Try afternoons instead" or "Try a different date range"
   */
  suggestions?: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Success response from parse-query API
 *
 * Contains structured AvailabilityQuery parsed from natural language.
 *
 * @see app/api/availability/parse-query/route.ts
 */
export interface ParseQueryResponse {
  success: true;
  query: AvailabilityQuery;
  warning?: string;  // Set if fallback parser was used
}

/**
 * Error response from parse-query API
 */
export interface ParseQueryError {
  success: false;
  error: string;
}

/**
 * Success response from execute-query API
 *
 * Contains query results and echoed query for debugging.
 *
 * @see app/api/availability/execute-query/route.ts
 */
export interface ExecuteQueryResponse {
  success: true;
  results: QueryResult;
  query: AvailabilityQuery;
}

/**
 * Error response from execute-query API
 */
export interface ExecuteQueryError {
  success: false;
  error: string;
}

// ============================================================================
// Email Generation Types
// ============================================================================

/**
 * Email generation request
 *
 * Contains query results and email metadata.
 */
export interface EmailGenerationRequest {
  /** Query results to include in email */
  results: QueryResult;

  /** Recipient email address */
  recipient: string;

  /** Instructor name for email signature */
  instructorName: string;

  /** Optional custom message to include */
  customMessage?: string;

  /** Whether to attach .ics calendar file */
  includeICS?: boolean;
}

/**
 * Email generation success response
 */
export interface EmailGenerationResponse {
  success: true;
  emailSent: boolean;
  icsGenerated: boolean;
}

/**
 * Email generation error response
 */
export interface EmailGenerationError {
  success: false;
  error: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a status is v2 format (TimeSlotStatus)
 *
 * Handles both Map instances (in-memory) and array format (from JSON).
 *
 * @param status - BlockedDate or TimeSlotStatus
 * @returns true if TimeSlotStatus format
 *
 * @example
 * ```typescript
 * const data = loadCalendarData();
 * const status = data.blockedDates['2026-01-15'];
 *
 * if (isV2Status(status)) {
 *   // status.slots available
 *   const blocked = status.slots.get('09:00');
 * } else {
 *   // status.status available ('full' | 'am' | 'pm')
 *   const blocked = status.status === 'full';
 * }
 * ```
 */
export function isV2Status(
  status: import('./calendar').BlockedDate | TimeSlotStatus
): status is TimeSlotStatus {
  return (
    'slots' in status &&
    (status.slots instanceof Map || Array.isArray((status as any).slots))
  );
}

/**
 * Type guard to check if query results are dates
 *
 * @param result - QueryResult to check
 * @returns true if items are Date[]
 */
export function isDatesResult(result: QueryResult): result is QueryResult & { items: Date[] } {
  return result.intent === 'find_days';
}

/**
 * Type guard to check if query results are time slots
 *
 * @param result - QueryResult to check
 * @returns true if items are TimeSlotResult[]
 */
export function isSlotsResult(result: QueryResult): result is QueryResult & { items: TimeSlotResult[] } {
  return result.intent === 'find_slots';
}

/**
 * Type guard to check if query results are suggestions
 *
 * @param result - QueryResult to check
 * @returns true if items are MeetingSuggestion[]
 */
export function isSuggestionsResult(result: QueryResult): result is QueryResult & { items: MeetingSuggestion[] } {
  return result.intent === 'suggest_times';
}
