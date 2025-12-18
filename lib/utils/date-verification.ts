// lib/utils/date-verification.ts
import {
  format,
  getDay,
  isValid,
  parseISO,
  isLeapYear,
  getDaysInMonth,
} from 'date-fns';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VerifiedDate {
  date: Date;
  dayOfWeek: string; // "Monday"
  formatted: string; // "Monday, January 5, 2026"
  isVerified: boolean;
  correctedFrom?: string;
}

export interface DateVerificationResult {
  valid: boolean;
  date: Date | null;
  dayName: string | null;
  expectedDayName: string | null;
  error?: string;
  corrected?: string; // Corrected string if day was wrong
}

export interface DateValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

type DayName = (typeof DAY_NAMES)[number];

// ============================================================================
// DATE VERIFICATION
// ============================================================================

/**
 * Verify that a date string matches the expected day of week
 * CRITICAL: Prevents errors like "Monday, Jan 5, 2026" when it's actually Tuesday
 *
 * @example
 * const verified = verifyDate(new Date('2026-01-05'));
 * console.log(verified.formatted); // "Monday, January 5, 2026" 
 */
export function verifyDate(dateInput: Date | string): VerifiedDate {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

  if (!isValid(date)) {
    throw new Error(`Invalid date: ${dateInput}`);
  }

  const dayIndex = getDay(date); // 0 = Sunday, 1 = Monday, ...
  const actualDayName = DAY_NAMES[dayIndex];
  const formatted = format(date, 'EEEE, MMMM d, yyyy');

  return {
    date,
    dayOfWeek: actualDayName,
    formatted, // Uses date-fns format - ALWAYS correct
    isVerified: true,
  };
}

/**
 * Verify that a day name matches the actual day of week for a date
 *
 * @example
 * verifyDayOfWeek(new Date('2026-01-05'), 'Monday') // Returns true (Jan 5, 2026 IS Monday)
 * verifyDayOfWeek(new Date('2026-01-05'), 'Tuesday') // Returns false
 */
export function verifyDayOfWeek(date: Date, expectedDay: DayName): boolean {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  const actualDayIndex = getDay(date);
  const actualDayName = DAY_NAMES[actualDayIndex];

  return actualDayName === expectedDay;
}

/**
 * Get the correct day name for a date
 *
 * @example
 * getCorrectDayName(new Date('2026-01-05')) // Returns 'Monday'
 */
export function getCorrectDayName(date: Date): DayName {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  const dayIndex = getDay(date);
  return DAY_NAMES[dayIndex];
}

/**
 * Verify a date string matches expected format and day of week
 *
 * @example
 * const result = verifyDateString('Monday, January 5, 2026');
 * // Returns: { valid: true, date: Date, dayName: 'Monday', corrected: null }
 */
export function verifyDateString(
  dateString: string,
  formatString: string = 'EEEE, MMMM d, yyyy'
): DateVerificationResult {
  try {
    // Extract day name from string
    const dayNameMatch = dateString.match(
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/
    );
    const providedDayName = dayNameMatch ? dayNameMatch[1] : null;

    if (!providedDayName) {
      return {
        valid: false,
        date: null,
        dayName: null,
        expectedDayName: null,
        error: 'No day name found in date string',
      };
    }

    // Parse the date portion (remove day name for parsing)
    const datePortion = dateString.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s*/, '');
    const parsedDate = parseISO(datePortion.split(',').reverse().join('-').replace(/\s/g, ''));

    // Check if date is valid
    if (!isValid(parsedDate)) {
      return {
        valid: false,
        date: null,
        dayName: providedDayName,
        expectedDayName: null,
        error: 'Invalid date format',
      };
    }

    // Get actual day name
    const actualDayName = getCorrectDayName(parsedDate);

    // Verify match
    if (providedDayName !== actualDayName) {
      // Generate corrected string
      const corrected = dateString.replace(providedDayName, actualDayName);

      return {
        valid: false,
        date: parsedDate,
        dayName: providedDayName,
        expectedDayName: actualDayName,
        error: `Day mismatch: "${providedDayName}" should be "${actualDayName}"`,
        corrected,
      };
    }

    return {
      valid: true,
      date: parsedDate,
      dayName: providedDayName,
      expectedDayName: actualDayName,
    };
  } catch (error) {
    return {
      valid: false,
      date: null,
      dayName: null,
      expectedDayName: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format date with verified day-of-week
 * Guarantees the day name matches the date
 *
 * @example
 * formatDateVerified(new Date('2026-01-05'))
 * // Returns 'Monday, January 5, 2026'
 */
export function formatDateVerified(
  date: Date,
  formatString: string = 'EEEE, MMMM d, yyyy'
): string {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  // format() from date-fns automatically uses correct day name
  return format(date, formatString);
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Validate a date for year 2026+ with leap year handling
 */
export function validateFutureDate(date: Date): DateValidationResult {
  const errors: string[] = [];

  if (!isValid(date)) {
    errors.push('Invalid date');
    return { valid: false, errors };
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();

  // Check year is 2026 or later
  if (year < 2026) {
    errors.push(`Year ${year} is before 2026`);
  }

  // Check leap year for February 29
  if (month === 2 && day === 29 && !isLeapYear(date)) {
    errors.push(`${year} is not a leap year, Feb 29 is invalid`);
  }

  // Check day is valid for month
  const daysInMonth = getDaysInMonth(date);
  if (day > daysInMonth) {
    errors.push(
      `Day ${day} is invalid for month ${month} (max: ${daysInMonth})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// AVAILABILITY UTILITIES
// ============================================================================

/**
 * Get next available dates from blocked dates map
 *
 * @param blockedDates - Map of blocked dates (key: YYYY-MM-DD)
 * @param startDate - Starting date to search from
 * @param count - Number of available dates to return (default: 10)
 * @returns Array of verified available dates
 */
export function getAvailableDates(
  blockedDates: Map<string, any>,
  startDate: Date,
  count: number = 10
): VerifiedDate[] {
  const available: VerifiedDate[] = [];
  let currentDate = new Date(startDate);
  const maxDays = count * 3; // Safety limit

  for (let i = 0; i < maxDays && available.length < count; i++) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');

    if (!blockedDates.has(dateKey)) {
      available.push(verifyDate(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return available;
}

/**
 * Example usage in email generation
 */
export function generateEmailDateList(
  dates: Date[]
): Array<{
  formatted: string;
  verified: boolean;
  date: Date;
}> {
  return dates
    .map((date) => {
      const formatted = formatDateVerified(date, 'EEEE, MMMM d, yyyy');
      const validation = validateFutureDate(date);

      return {
        formatted,
        verified: validation.valid,
        date,
      };
    })
    .filter((item) => item.verified); // Only return valid dates
}
