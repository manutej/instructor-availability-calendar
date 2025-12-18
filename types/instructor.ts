/**
 * Instructor Profile Type Definitions
 *
 * Types for instructor profiles and public calendar sharing (v2.0 feature).
 * Supports shareable URLs, custom branding, and public/private calendar modes.
 *
 * @module types/instructor
 * @see specs/SPEC-V2.md Lines 315-330 for v2.0 data models
 */

/**
 * Instructor profile for public calendar sharing
 *
 * Represents an instructor with a unique shareable calendar URL.
 * Used for both private dashboard access and public read-only calendar display.
 *
 * @see app/calendar/[slug]/page.tsx for public calendar implementation
 * @example
 * ```typescript
 * const profile: InstructorProfile = {
 *   id: 'usr_123abc',
 *   slug: 'john-instructor',
 *   displayName: 'Dr. John Smith',
 *   email: 'john@example.com',
 *   publicUrl: 'https://yoursite.com/calendar/john-instructor',
 *   isPublic: true,
 *   theme: {
 *     primaryColor: '#3b82f6',
 *     logo: 'https://example.com/logo.png'
 *   }
 * };
 * ```
 */
export interface InstructorProfile {
  /**
   * Unique instructor identifier
   *
   * Generated on profile creation. Used for database lookups
   * and internal references.
   */
  id: string;

  /**
   * URL-safe identifier for public calendar
   *
   * Must be unique across all instructors.
   * Used in shareable URL: `/calendar/[slug]`
   *
   * Rules:
   * - Lowercase alphanumeric + hyphens only
   * - No spaces or special characters
   * - 3-50 characters
   *
   * @example "john-instructor", "dr-smith-physics"
   */
  slug: string;

  /**
   * Human-readable display name
   *
   * Shown in public calendar header and email templates.
   * Can include titles, credentials, etc.
   *
   * @example "Dr. John Smith", "Prof. Jane Doe, PhD"
   */
  displayName: string;

  /**
   * Instructor contact email
   *
   * Used for:
   * - Email generation templates
   * - "Contact to Book" CTA on public calendar
   * - Future authentication (Phase 2)
   */
  email: string;

  /**
   * Auto-generated public calendar URL
   *
   * Constructed from base URL + slug.
   * Updated automatically when slug changes.
   *
   * @example "https://yoursite.com/calendar/john-instructor"
   */
  publicUrl: string;

  /**
   * Whether public calendar is accessible
   *
   * When false, public route returns 404 or "unavailable" message.
   * Allows instructor to temporarily disable sharing without deleting profile.
   */
  isPublic: boolean;

  /**
   * Optional branding customization (v2.1 feature)
   *
   * Allows instructor to customize public calendar appearance.
   * Not required for MVP.
   */
  theme?: {
    /**
     * Primary brand color (hex format)
     *
     * Applied to:
     * - Available date highlights
     * - CTA buttons
     * - Header accents
     *
     * @example "#3b82f6" (blue), "#10b981" (green)
     */
    primaryColor?: string;

    /**
     * Logo image URL
     *
     * Displayed in public calendar header.
     * Should be square format, 200x200px or larger.
     *
     * @example "https://example.com/logo.png"
     */
    logo?: string;
  };
}

/**
 * Public calendar metadata response
 *
 * Returned by `/api/availability/[slug]` endpoint.
 * Contains instructor info, blocked dates, and sync timestamp.
 *
 * @internal
 * @see app/api/availability/[slug]/route.ts
 * @example
 * ```typescript
 * const response: PublicCalendarData = {
 *   instructor: {
 *     id: 'usr_123',
 *     slug: 'john-instructor',
 *     displayName: 'Dr. John Smith',
 *     email: 'john@example.com',
 *     publicUrl: 'https://yoursite.com/calendar/john-instructor',
 *     isPublic: true
 *   },
 *   blockedDates: [
 *     ['2026-01-15', { date: '2026-01-15', status: 'full' }]
 *   ],
 *   lastUpdated: '2026-01-14T10:00:00Z'
 * };
 * ```
 */
export interface PublicCalendarData {
  /** Instructor profile information */
  instructor: InstructorProfile;

  /**
   * Blocked dates as array of key-value pairs
   *
   * Converted from Map for JSON serialization.
   * Client reconstructs Map on receiving response.
   */
  blockedDates: Array<[string, { date: string; status: 'full' | 'am' | 'pm' }]>;

  /** ISO timestamp of last calendar update */
  lastUpdated: string;
}
