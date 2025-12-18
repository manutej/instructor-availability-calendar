/**
 * ICS Calendar File Generator
 *
 * Generates .ics (iCalendar) files for email attachments.
 * Recipients can import these files into:
 * - Google Calendar
 * - Apple Calendar
 * - Outlook
 * - Any RFC 5545 compliant calendar app
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */
import { createEvents } from 'ics';
/**
 * Generate .ics calendar file content
 *
 * Recipients can import to Google/Apple/Outlook calendars.
 * Each available date becomes a separate "TENTATIVE" event.
 *
 * @param options - Instructor info and available dates
 * @returns ICS file content as string (RFC 5545 compliant)
 *
 * @example
 * ```typescript
 * const icsContent = generateICS({
 *   instructorName: "Dr. Smith",
 *   instructorEmail: "smith@example.com",
 *   availableDates: [
 *     {
 *       date: new Date('2026-01-05'),
 *       dayOfWeek: 'Monday',
 *       formatted: 'Monday, January 5, 2026',
 *       isVerified: true
 *     }
 *   ]
 * });
 *
 * // Result: Valid .ics file content
 * // Status: TENTATIVE (not confirmed booking)
 * ```
 */
export function generateICS({ instructorName, instructorEmail, availableDates }) {
    // Convert VerifiedDate[] to EventAttributes[] for ics library
    const events = availableDates.map(({ date }) => {
        // Extract date components for ics library format
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // ics uses 1-12, not 0-11
        const day = date.getDate();
        return {
            // Start date as [year, month, day]
            start: [year, month, day],
            // Default 1-hour duration (can be customized later)
            duration: { hours: 1 },
            // Event title
            title: `Available - ${instructorName}`,
            // Description visible in calendar
            description: 'Instructor available for booking',
            // TENTATIVE status (not a confirmed booking)
            // Other options: CONFIRMED, CANCELLED
            status: 'TENTATIVE',
            // Organizer information
            organizer: { name: instructorName, email: instructorEmail },
            // Categories for filtering
            categories: ['Availability']
        };
    });
    // Generate ICS file using ics library
    const { error, value } = createEvents(events);
    if (error) {
        throw new Error(`Failed to create ICS: ${error.message || error}`);
    }
    return value || '';
}
/**
 * Trigger browser download of .ics file
 *
 * Creates a Blob URL and programmatically clicks a download link.
 * The URL is properly cleaned up after download.
 *
 * @param content - ICS file content from generateICS()
 * @param filename - Download filename (default: 'availability.ics')
 *
 * @example
 * ```typescript
 * const icsContent = generateICS({ ... });
 * downloadICS(icsContent, 'instructor-availability.ics');
 * // Browser downloads file immediately
 * ```
 */
export function downloadICS(content, filename = 'availability.ics') {
    // Create Blob with correct MIME type for calendar files
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    // Create temporary download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    // Trigger download
    link.click();
    // Clean up Blob URL to prevent memory leaks
    URL.revokeObjectURL(link.href);
}
/**
 * Get ICS content as a downloadable Blob
 *
 * Alternative to downloadICS() if you need the Blob for other purposes
 * (e.g., attaching to email via API)
 *
 * @param content - ICS file content
 * @returns Blob object ready for download or API attachment
 */
export function getICSBlob(content) {
    return new Blob([content], { type: 'text/calendar;charset=utf-8' });
}
/**
 * Example usage:
 *
 * ```typescript
 * import { generateICS, downloadICS } from '@/lib/utils/ics-generator';
 * import { verifyDate } from '@/lib/utils/date-verification';
 *
 * // 1. Verify dates (ensures day-of-week is correct)
 * const verifiedDates = [
 *   verifyDate(new Date('2026-01-05')),
 *   verifyDate(new Date('2026-01-12')),
 *   verifyDate(new Date('2026-01-19'))
 * ];
 *
 * // 2. Generate ICS content
 * const icsContent = generateICS({
 *   instructorName: 'Dr. Smith',
 *   instructorEmail: 'smith@example.com',
 *   availableDates: verifiedDates
 * });
 *
 * // 3. Download file
 * downloadICS(icsContent);
 *
 * // Or attach to email:
 * const icsBlob = getICSBlob(icsContent);
 * // Send via email API with attachment
 * ```
 */
