/**
 * Calendar Type Definitions
 *
 * Core types for calendar availability system including blocked dates,
 * Google Calendar events, application state, and calendar day rendering.
 *
 * @module types/calendar
 * @see specs/TECHNICAL-PLAN.md Lines 119-157 for data model specifications
 */

/**
 * Represents a date blocked by the instructor
 *
 * Stored in ISO date format (YYYY-MM-DD) for consistency across
 * localStorage, API responses, and calendar rendering.
 *
 * @example
 * ```typescript
 * const blockedDate: BlockedDate = {
 *   date: '2026-01-15',
 *   status: 'full',
 *   eventName: 'Team Meeting'
 * };
 * ```
 */
export interface BlockedDate {
  /** ISO date string in YYYY-MM-DD format */
  date: string;

  /** Blocking status: full day, morning only, or afternoon only */
  status: 'full' | 'am' | 'pm';

  /** Optional event name/description for this blocked date */
  eventName?: string;
}

/**
 * Google Calendar event fetched via MCP integration
 *
 * Represents a calendar event from Google Calendar API,
 * transformed to internal format for calendar display.
 *
 * @example
 * ```typescript
 * const event: GoogleEvent = {
 *   id: 'evt_123',
 *   title: 'Team Meeting',
 *   start: new Date('2026-01-15T10:00:00'),
 *   end: new Date('2026-01-15T11:00:00'),
 *   isAllDay: false
 * };
 * ```
 */
export interface GoogleEvent {
  /** Unique event identifier from Google Calendar */
  id: string;

  /** Event title/summary */
  title: string;

  /** Event start date/time */
  start: Date;

  /** Event end date/time */
  end: Date;

  /** Whether event is marked as all-day in Google Calendar */
  isAllDay: boolean;
}

/**
 * Application-wide calendar state
 *
 * Managed via React Context and synchronized with localStorage.
 * Supports month navigation, blocked dates, and Google Calendar sync.
 *
 * @see contexts/AvailabilityContext.tsx for state management
 * @example
 * ```typescript
 * const state: CalendarState = {
 *   currentMonth: new Date('2026-01-01'),
 *   blockedDates: new Map([
 *     ['2026-01-15', { date: '2026-01-15', status: 'full' }]
 *   ]),
 *   googleEvents: [],
 *   isLoading: false
 * };
 * ```
 */
export interface CalendarState {
  /** Currently displayed month (first day of month) */
  currentMonth: Date;

  /**
   * Map of blocked dates keyed by ISO date string (YYYY-MM-DD)
   *
   * Using Map for O(1) lookup during calendar rendering.
   * Converted to/from array for localStorage persistence.
   */
  blockedDates: Map<string, BlockedDate>;

  /** Google Calendar events for display alongside blocked dates */
  googleEvents: GoogleEvent[];

  /** Loading state during Google Calendar sync */
  isLoading: boolean;
}

/**
 * Computed properties for a single calendar day cell
 *
 * Generated during calendar grid rendering with all necessary
 * state for display and interaction logic.
 *
 * @see components/calendar/DayCell.tsx for rendering implementation
 * @example
 * ```typescript
 * const day: CalendarDay = {
 *   date: new Date('2026-01-15'),
 *   isToday: false,
 *   isCurrentMonth: true,
 *   dayOfMonth: 15,
 *   blockStatus: 'blocked',
 *   googleEvents: []
 * };
 * ```
 */
export interface CalendarDay {
  /** Full date object for this calendar day */
  date: Date;

  /** Whether this day is today (for visual highlighting) */
  isToday: boolean;

  /**
   * Whether this day belongs to the currently displayed month
   *
   * False for days from previous/next month shown to fill grid.
   * Used to apply dimmed styling to out-of-month dates.
   */
  isCurrentMonth: boolean;

  /** Day of month number (1-31) for display */
  dayOfMonth: number;

  /**
   * Computed availability status for this day
   *
   * Determines background color and interaction behavior:
   * - 'available': White background, clickable
   * - 'blocked': Red background, full day
   * - 'am-blocked': Red gradient top half
   * - 'pm-blocked': Red gradient bottom half
   */
  blockStatus: 'available' | 'blocked' | 'am-blocked' | 'pm-blocked';

  /**
   * Google Calendar events occurring on this day
   *
   * Displayed as small dots indicator below date number.
   * Empty array if no events.
   */
  googleEvents: GoogleEvent[];
}

/**
 * localStorage schema for calendar data persistence
 *
 * Versioned schema to support future data migrations.
 * All dates stored as ISO strings for JSON compatibility.
 *
 * @internal
 * @see lib/utils/storage.ts for persistence implementation
 * @example
 * ```typescript
 * const storage: StorageSchema = {
 *   version: 1,
 *   blockedDates: [
 *     { date: '2026-01-15', status: 'full' }
 *   ],
 *   lastSync: '2026-01-14T10:00:00Z',
 *   preferences: {
 *     defaultView: 'month',
 *     workingHours: { start: 9, end: 17 }
 *   }
 * };
 * ```
 */
export interface StorageSchema {
  /**
   * Schema version for migrations
   *
   * Increment when making breaking changes to storage format.
   * Migration logic should handle conversion from old versions.
   */
  version: number;

  /** Array of blocked dates (converted from Map for JSON storage) */
  blockedDates: BlockedDate[];

  /** ISO timestamp of last Google Calendar sync */
  lastSync: string;

  /** User preferences for calendar display */
  preferences: {
    /** Default calendar view mode (month only in MVP) */
    defaultView: 'month' | 'week';

    /** Working hours in 24-hour format (0-23) */
    workingHours: {
      /** Start hour (e.g., 9 for 9:00 AM) */
      start: number;

      /** End hour (e.g., 17 for 5:00 PM) */
      end: number;
    };
  };
}

/**
 * Availability data for export/import and persistence
 *
 * Simplified data structure for data backup and migration.
 * Contains only essential calendar state without derived properties.
 *
 * @see lib/data/persistence.ts for usage
 * @example
 * ```typescript
 * const data: AvailabilityData = {
 *   blockedDates: [
 *     { date: '2026-01-15', status: 'full', eventName: 'Meeting' }
 *   ],
 *   lastSync: '2026-01-14T10:00:00Z'
 * };
 * ```
 */
export interface AvailabilityData {
  /** Array of blocked dates */
  blockedDates: BlockedDate[];

  /** ISO timestamp of last Google Calendar sync */
  lastSync?: string;
}
