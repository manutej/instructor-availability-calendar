import { BlockedDate } from '@/types/calendar';

const STORAGE_KEY = 'cal_availability_v1';

export interface StorageSchema {
  version: number;
  blockedDates: BlockedDate[];
  lastSync: string;
}

/**
 * Load blocked dates from localStorage
 * Safe for SSR (checks typeof window)
 */
export function loadBlockedDates(): Map<string, BlockedDate> {
  if (typeof window === 'undefined') return new Map();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();

    const parsed: StorageSchema = JSON.parse(stored);

    // Convert array to Map
    return new Map(parsed.blockedDates.map(bd => [bd.date, bd]));
  } catch (error) {
    console.error('Failed to load blocked dates:', error);
    return new Map();
  }
}

/**
 * Save blocked dates to localStorage
 * Includes automatic versioning
 */
export function saveBlockedDates(dates: Map<string, BlockedDate>): void {
  if (typeof window === 'undefined') return;

  try {
    const schema: StorageSchema = {
      version: 1,
      blockedDates: Array.from(dates.values()),
      lastSync: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
  } catch (error) {
    console.error('Failed to save blocked dates:', error);
  }
}

/**
 * Clear all stored data
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
