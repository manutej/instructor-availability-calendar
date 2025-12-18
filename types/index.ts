/**
 * Calendar Availability System - Type Definitions
 *
 * Central export point for all TypeScript types used across the application.
 * Organized by domain: calendar, instructor, email.
 *
 * @module types
 * @see specs/SPEC-V2.md for complete data model specifications
 * @see specs/TECHNICAL-PLAN.md Lines 119-157 for core type definitions
 *
 * @example
 * ```typescript
 * // Import specific types
 * import { BlockedDate, GoogleEvent } from '@/types';
 *
 * // Or import namespace
 * import * as Types from '@/types';
 * const date: Types.BlockedDate = { ... };
 * ```
 */

// ============================================================================
// Calendar Types
// ============================================================================

/**
 * Core calendar types for availability management
 * @see types/calendar.ts for detailed documentation
 */
export type {
  BlockedDate,
  GoogleEvent,
  CalendarState,
  CalendarDay,
  StorageSchema,
  AvailabilityData,
} from './calendar';

// ============================================================================
// Instructor Types
// ============================================================================

/**
 * Instructor profile types for public calendar sharing (v2.0)
 * @see types/instructor.ts for detailed documentation
 */
export type {
  InstructorProfile,
  PublicCalendarData,
} from './instructor';

// ============================================================================
// Email Types
// ============================================================================

/**
 * Email generation and date verification types (v2.0)
 * @see types/email.ts for detailed documentation
 */
export type {
  VerifiedDate,
  EmailTemplateData,
  ICSEvent,
  EmailGenerationResponse,
} from './email';

// ============================================================================
// Email Generator Types (AI-Powered Availability Queries)
// ============================================================================

/**
 * Intelligent email generator types with natural language query support
 * @see types/email-generator.ts for detailed documentation
 * @see docs/EMAIL-GENERATOR-SPEC.md for feature specification
 */
export type {
  // Enhanced data model
  TimeSlotStatus,
  AvailabilityDataV2,

  // Query system
  QueryIntent,
  SlotDuration,
  AvailabilityQuery,
  TimeSlotResult,
  MeetingSuggestion,
  QueryResult,

  // API responses
  ParseQueryResponse,
  ParseQueryError,
  ExecuteQueryResponse,
  ExecuteQueryError,
  EmailGenerationRequest,
  EmailGenerationResponse as EmailGenerationResponseV2,
  EmailGenerationError,
} from './email-generator';

/**
 * Type guards for email generator types
 */
export {
  isV2Status,
  isDatesResult,
  isSlotsResult,
  isSuggestionsResult,
} from './email-generator';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a date is blocked
 *
 * @param date - ISO date string to check
 * @param blockedDates - Map of blocked dates
 * @returns true if date is blocked (any status)
 *
 * @example
 * ```typescript
 * import { isDateBlocked } from '@/types';
 *
 * const blocked = new Map([
 *   ['2026-01-15', { date: '2026-01-15', status: 'full' }]
 * ]);
 *
 * isDateBlocked('2026-01-15', blocked); // true
 * isDateBlocked('2026-01-16', blocked); // false
 * ```
 */
export function isDateBlocked(
  date: string,
  blockedDates: Map<string, import('./calendar').BlockedDate>
): boolean {
  return blockedDates.has(date);
}

/**
 * Type guard to check if a date is fully blocked (not partial AM/PM)
 *
 * @param date - ISO date string to check
 * @param blockedDates - Map of blocked dates
 * @returns true if date is fully blocked
 *
 * @example
 * ```typescript
 * import { isDateFullyBlocked } from '@/types';
 *
 * const blocked = new Map([
 *   ['2026-01-15', { date: '2026-01-15', status: 'full' }],
 *   ['2026-01-16', { date: '2026-01-16', status: 'am' }]
 * ]);
 *
 * isDateFullyBlocked('2026-01-15', blocked); // true
 * isDateFullyBlocked('2026-01-16', blocked); // false (only AM)
 * ```
 */
export function isDateFullyBlocked(
  date: string,
  blockedDates: Map<string, import('./calendar').BlockedDate>
): boolean {
  const blocked = blockedDates.get(date);
  return blocked?.status === 'full';
}

/**
 * Type guard to check if a date has AM blocked
 *
 * @param date - ISO date string to check
 * @param blockedDates - Map of blocked dates
 * @returns true if AM is blocked (either 'full' or 'am')
 */
export function isAMBlocked(
  date: string,
  blockedDates: Map<string, import('./calendar').BlockedDate>
): boolean {
  const blocked = blockedDates.get(date);
  return blocked?.status === 'full' || blocked?.status === 'am';
}

/**
 * Type guard to check if a date has PM blocked
 *
 * @param date - ISO date string to check
 * @param blockedDates - Map of blocked dates
 * @returns true if PM is blocked (either 'full' or 'pm')
 */
export function isPMBlocked(
  date: string,
  blockedDates: Map<string, import('./calendar').BlockedDate>
): boolean {
  const blocked = blockedDates.get(date);
  return blocked?.status === 'full' || blocked?.status === 'pm';
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Utility type for partial updates to calendar state
 *
 * Allows updating subset of CalendarState properties.
 *
 * @example
 * ```typescript
 * import { CalendarStateUpdate } from '@/types';
 *
 * const update: CalendarStateUpdate = {
 *   isLoading: true
 * };
 * ```
 */
export type CalendarStateUpdate = Partial<import('./calendar').CalendarState>;

/**
 * Utility type for instructor profile creation (omits auto-generated fields)
 *
 * Used in profile creation forms where id and publicUrl
 * are generated server-side.
 *
 * @example
 * ```typescript
 * import { InstructorProfileInput } from '@/types';
 *
 * const input: InstructorProfileInput = {
 *   slug: 'john-instructor',
 *   displayName: 'Dr. John Smith',
 *   email: 'john@example.com',
 *   isPublic: true
 * };
 * ```
 */
export type InstructorProfileInput = Omit<
  import('./instructor').InstructorProfile,
  'id' | 'publicUrl'
>;

/**
 * Utility type for email template customization (omits auto-generated fields)
 *
 * Used in email generation forms where availableDates are
 * computed from blocked dates.
 *
 * @example
 * ```typescript
 * import { EmailTemplateInput } from '@/types';
 *
 * const input: EmailTemplateInput = {
 *   instructorName: 'Dr. John Smith',
 *   dateRange: {
 *     start: new Date('2026-01-01'),
 *     end: new Date('2026-01-31')
 *   },
 *   calendarLink: 'https://yoursite.com/calendar/john-instructor',
 *   customMessage: 'Looking forward to working with you!'
 * };
 * ```
 */
export type EmailTemplateInput = Omit<
  import('./email').EmailTemplateData,
  'availableDates'
>;
