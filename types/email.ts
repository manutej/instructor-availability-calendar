/**
 * Email Generation Type Definitions
 *
 * Types for email template generation, date verification, and calendar attachments (v2.0 feature).
 * Includes critical date verification to prevent day-of-week errors in emails.
 *
 * @module types/email
 * @see specs/SPEC-V2.md Lines 332-358 for v2.0 email models
 * @see docs/PUBLIC-SHARING-EMAIL-GUIDE.md for date verification requirements
 */

/**
 * Date with verified day-of-week matching
 *
 * CRITICAL: Prevents errors like "Monday, Jan 5, 2026" when Jan 5 is actually Tuesday.
 * All dates MUST be verified through `verifyDate()` utility before inclusion in emails.
 *
 * @see lib/utils/date-verification.ts for verification implementation
 * @example
 * ```typescript
 * import { verifyDate } from '@/lib/utils/date-verification';
 *
 * // ✅ CORRECT: Always use verification
 * const verified: VerifiedDate = verifyDate(new Date('2026-01-05'));
 * console.log(verified.formatted); // "Monday, January 5, 2026" ✓
 *
 * // ❌ WRONG: Never construct manually
 * const wrong = `Tuesday, January 5, 2026`; // ERROR if Jan 5 is Monday!
 * ```
 */
export interface VerifiedDate {
  /**
   * Date object being verified
   *
   * Must be a valid Date instance. Invalid dates throw error.
   */
  date: Date;

  /**
   * Full day name in English
   *
   * Computed from date using `getDay()` and indexed into
   * day names array: ['Sunday', 'Monday', ..., 'Saturday']
   *
   * @example "Monday", "Tuesday", "Wednesday"
   */
  dayOfWeek: string;

  /**
   * Human-readable date string with verified day-of-week
   *
   * Generated using date-fns `format(date, 'EEEE, MMMM d, yyyy')`
   * which guarantees day-of-week accuracy.
   *
   * This is the ONLY format that should appear in emails.
   *
   * @example "Monday, January 5, 2026", "Tuesday, February 29, 2028"
   */
  formatted: string;

  /**
   * Verification status flag
   *
   * Always true if returned successfully.
   * Function throws error for invalid dates rather than returning false.
   */
  isVerified: boolean;

  /**
   * Original incorrect input string (if auto-corrected)
   *
   * Used for logging/debugging when system detects and fixes
   * day-of-week mismatch.
   *
   * @example "Tuesday, January 5, 2026" when actual day is Monday
   */
  correctedFrom?: string;
}

/**
 * Email template data for availability response
 *
 * Complete data structure for generating professional email responses
 * with instructor availability. Includes verified dates, custom messaging,
 * and calendar link.
 *
 * @see emails/availability-email.tsx for template implementation
 * @example
 * ```typescript
 * const templateData: EmailTemplateData = {
 *   instructorName: 'Dr. John Smith',
 *   availableDates: [
 *     {
 *       date: new Date('2026-01-05'),
 *       dayOfWeek: 'Monday',
 *       formatted: 'Monday, January 5, 2026',
 *       isVerified: true
 *     },
 *     {
 *       date: new Date('2026-01-08'),
 *       dayOfWeek: 'Thursday',
 *       formatted: 'Thursday, January 8, 2026',
 *       isVerified: true
 *     }
 *   ],
 *   dateRange: {
 *     start: new Date('2026-01-01'),
 *     end: new Date('2026-01-31')
 *   },
 *   calendarLink: 'https://yoursite.com/calendar/john-instructor',
 *   customMessage: 'Looking forward to working with you!'
 * };
 * ```
 */
export interface EmailTemplateData {
  /**
   * Instructor display name
   *
   * Shown in email subject and greeting.
   *
   * @example "Dr. John Smith", "Prof. Jane Doe"
   */
  instructorName: string;

  /**
   * List of available dates with verified day-of-week
   *
   * ALL dates must be verified through `verifyDate()` utility.
   * Typically next 10-20 available dates within specified range.
   *
   * Sorted chronologically (earliest first).
   */
  availableDates: VerifiedDate[];

  /**
   * Date range used to find available dates
   *
   * Provides context for recipient on search window.
   * Typically "next 30 days" or "January 2026".
   */
  dateRange: {
    /** Start of search range */
    start: Date;

    /** End of search range */
    end: Date;
  };

  /**
   * Public calendar URL for recipient reference
   *
   * Included in email footer for full availability view.
   *
   * @example "https://yoursite.com/calendar/john-instructor"
   */
  calendarLink: string;

  /**
   * Optional custom message from instructor
   *
   * Inserted at top of email body, before date list.
   * Can be used for personalization, context, or instructions.
   *
   * @example "Thank you for your interest in my course. Here are my available office hours:"
   */
  customMessage?: string;
}

/**
 * iCalendar (.ics) event for email attachment
 *
 * Represents a single calendar event in ICS format.
 * Multiple events combined to create .ics file attachment for email.
 *
 * @see lib/utils/ics-generator.ts for file generation
 * @example
 * ```typescript
 * const icsEvent: ICSEvent = {
 *   summary: 'Available - Dr. John Smith',
 *   start: new Date('2026-01-05T10:00:00'),
 *   end: new Date('2026-01-05T11:00:00'),
 *   status: 'TENTATIVE',
 *   description: 'Instructor available for booking. Contact john@example.com to confirm.'
 * };
 * ```
 */
export interface ICSEvent {
  /**
   * Event title/summary in calendar
   *
   * Format: "Available - [Instructor Name]"
   *
   * @example "Available - Dr. John Smith"
   */
  summary: string;

  /**
   * Event start date/time
   *
   * For all-day availability, use 9:00 AM as default.
   * For specific time slots, use actual booking time.
   */
  start: Date;

  /**
   * Event end date/time
   *
   * For all-day availability, use 5:00 PM as default (8-hour window).
   * For specific time slots, use actual booking duration.
   */
  end: Date;

  /**
   * Event status in calendar
   *
   * MUST be 'TENTATIVE' for availability (not confirmed booking).
   * Recipient can accept to confirm or delete if not booking.
   */
  status: 'TENTATIVE';

  /**
   * Event description/notes
   *
   * Includes:
   * - Instructor contact info
   * - Booking instructions
   * - Calendar link
   *
   * @example "Instructor available for booking. Contact john@example.com to confirm. View full calendar: https://yoursite.com/calendar/john-instructor"
   */
  description: string;
}

/**
 * Email generation API response
 *
 * Complete output from email generation endpoint.
 * Includes HTML, plain text, and .ics attachment content.
 *
 * @internal
 * @see app/api/email/generate/route.ts
 * @example
 * ```typescript
 * const response: EmailGenerationResponse = {
 *   html: '<html>...</html>',
 *   text: 'Available Dates - Dr. John Smith\n\n...',
 *   ics: 'BEGIN:VCALENDAR\nVERSION:2.0\n...',
 *   availableDates: [
 *     'Monday, January 5, 2026',
 *     'Thursday, January 8, 2026'
 *   ]
 * };
 * ```
 */
export interface EmailGenerationResponse {
  /** HTML email body (react-email rendered) */
  html: string;

  /** Plain text email body (fallback) */
  text: string;

  /**
   * iCalendar (.ics) file content
   *
   * Complete .ics file as string. Client can:
   * - Download as .ics file
   * - Attach to email
   * - Preview in UI
   */
  ics: string;

  /**
   * List of formatted available dates for preview
   *
   * Displayed in UI before sending email.
   * Shows what recipient will see.
   */
  availableDates: string[];
}
