/**
 * Time Slot Constants for Calendar Availability System
 *
 * Defines 16 hourly time slots from 6am to 10pm (10pm is 22:00, last slot is 21:00-22:00)
 * Organized into three periods: Morning, Afternoon, Evening
 */

export const MORNING_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00'
] as const;

export const AFTERNOON_SLOTS = [
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
] as const;

export const EVENING_SLOTS = [
  '18:00',
  '19:00',
  '20:00',
  '21:00'
] as const;

export const ALL_SLOTS = [
  ...MORNING_SLOTS,
  ...AFTERNOON_SLOTS,
  ...EVENING_SLOTS
] as const;

/**
 * Time period mapping for query filtering
 */
export const TIME_PERIODS = {
  morning: MORNING_SLOTS,
  afternoon: AFTERNOON_SLOTS,
  evening: EVENING_SLOTS,
  any: ALL_SLOTS
} as const;

/**
 * Human-readable time period labels
 */
export const TIME_PERIOD_LABELS = {
  morning: 'Morning (6am - 12pm)',
  afternoon: 'Afternoon (12pm - 6pm)',
  evening: 'Evening (6pm - 10pm)',
  any: 'Any Time'
} as const;

/**
 * Type definitions for time slots
 */
export type TimeSlot = typeof ALL_SLOTS[number];
export type TimePeriod = keyof typeof TIME_PERIODS;

/**
 * Utility function to get period label for a time slot
 */
export function getTimePeriodForSlot(slot: TimeSlot): TimePeriod {
  if (MORNING_SLOTS.includes(slot as any)) return 'morning';
  if (AFTERNOON_SLOTS.includes(slot as any)) return 'afternoon';
  if (EVENING_SLOTS.includes(slot as any)) return 'evening';
  return 'any';
}

/**
 * Utility function to format time slot for display
 * '09:00' → '9:00 AM'
 * '14:00' → '2:00 PM'
 */
export function formatTimeSlot(slot: TimeSlot): string {
  const hour = parseInt(slot.split(':')[0]);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${displayHour}:00 ${period}`;
}

/**
 * Utility function to check if a slot is within business hours
 * Business hours: 9am - 5pm
 */
export function isBusinessHours(slot: TimeSlot): boolean {
  const hour = parseInt(slot.split(':')[0]);
  return hour >= 9 && hour < 17;
}

/**
 * Get next available slot after given time
 */
export function getNextSlot(slot: TimeSlot): TimeSlot | null {
  const currentIndex = ALL_SLOTS.indexOf(slot);
  if (currentIndex === -1 || currentIndex === ALL_SLOTS.length - 1) {
    return null;
  }
  return ALL_SLOTS[currentIndex + 1];
}

/**
 * Get previous slot before given time
 */
export function getPreviousSlot(slot: TimeSlot): TimeSlot | null {
  const currentIndex = ALL_SLOTS.indexOf(slot);
  if (currentIndex <= 0) {
    return null;
  }
  return ALL_SLOTS[currentIndex - 1];
}
