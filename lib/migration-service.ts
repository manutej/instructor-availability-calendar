/**
 * Data Migration Service
 *
 * Handles automatic migration from v1 (AM/PM) to v2 (hourly slots) data format.
 * Ensures backward compatibility and zero data loss during upgrade.
 *
 * @module lib/migration-service
 * @see docs/EMAIL-GENERATOR-SPEC.md for migration strategy details
 */

import type { BlockedDate } from '@/types/calendar';
import type { TimeSlotStatus, AvailabilityDataV2 } from '@/types/email-generator';
import { MORNING_SLOTS, AFTERNOON_SLOTS, EVENING_SLOTS } from './time-slots';

/**
 * v1 availability data format (legacy)
 *
 * Used for type checking during migration.
 * After migration, all data is stored in v2 format.
 */
interface AvailabilityDataV1 {
  version?: 1;  // May be missing in very old data
  blockedDates: BlockedDate[];
  instructorId?: string;
}

/**
 * Data Migration Service
 *
 * Provides bidirectional conversion between v1 and v2 data formats.
 * Singleton service accessed via exported `migrationService` instance.
 *
 * @example
 * ```typescript
 * import { migrationService } from '@/lib/migration-service';
 *
 * // Auto-detect and migrate
 * const data = loadFromStorage();
 * const migrated = migrationService.migrate(data);
 *
 * // Manual v1 → v2 migration
 * const v2Data = migrationService.migrateToV2(v1Data);
 *
 * // Backward compatibility (v2 → v1 AM/PM)
 * const ampm = migrationService.deriveAMPM(v2Status);
 * ```
 */
export class DataMigrationService {
  /**
   * Auto-detect version and migrate to v2 if needed
   *
   * Safe to call multiple times - already-migrated data passes through unchanged.
   *
   * @param data - Data in unknown format (v1 or v2)
   * @returns Data in v2 format
   *
   * @example
   * ```typescript
   * const loaded = JSON.parse(localStorage.getItem('cal_data'));
   * const current = migrationService.migrate(loaded);
   * // current is guaranteed to be v2 format
   * ```
   */
  migrate(data: any): AvailabilityDataV2 {
    if (!data) {
      // Return empty v2 data structure
      return {
        version: 2,
        blockedDates: {},
        instructorId: 'default'
      };
    }

    // Already v2 format - but may need Map deserialization from JSON
    if (data.version === 2) {
      return this.ensureMapsDeserialized(data);
    }

    // v1 format (or missing version)
    return this.migrateToV2(data);
  }

  /**
   * Ensure Map objects are properly deserialized from JSON arrays
   *
   * When loading from localStorage, Map objects are serialized as arrays.
   * This method reconstructs Map instances from array format.
   *
   * @param data - v2 data that may have arrays instead of Maps
   * @returns v2 data with proper Map instances
   *
   * @example
   * ```typescript
   * // After JSON.parse(), slots is an array: [['09:00', true], ...]
   * const data = JSON.parse(localStorage.getItem('data'));
   * // After ensureMapsDeserialized(), slots is a Map
   * const fixed = migrationService.ensureMapsDeserialized(data);
   * ```
   */
  private ensureMapsDeserialized(data: any): AvailabilityDataV2 {
    const result: AvailabilityDataV2 = {
      version: data.version,
      instructorId: data.instructorId,
      lastModified: data.lastModified,
      blockedDates: {}
    };

    for (const [date, status] of Object.entries(data.blockedDates || {})) {
      // Prototype pollution protection
      if (!Object.prototype.hasOwnProperty.call(data.blockedDates, date)) continue;

      if (status && typeof status === 'object' && 'slots' in status) {
        const statusObj = status as any;

        // If slots is already a Map, keep it
        if (statusObj.slots instanceof Map) {
          result.blockedDates[date] = status as TimeSlotStatus;
        }
        // If slots is an array (from JSON), convert to Map
        else if (Array.isArray(statusObj.slots)) {
          result.blockedDates[date] = {
            slots: new Map(statusObj.slots),
            fullDayBlock: statusObj.fullDayBlock,
            eventName: statusObj.eventName
          };
        }
        // Invalid format - skip this entry
        else {
          console.warn(`Invalid slots format for ${date}, skipping`);
        }
      } else {
        // v1 format mixed in - keep as-is
        result.blockedDates[date] = status;
      }
    }

    return result;
  }

  /**
   * Migrate v1 data to v2 format
   *
   * Converts AM/PM booleans to hourly time slots:
   * - AM blocked → blocks MORNING_SLOTS (06:00-11:00)
   * - PM blocked → blocks AFTERNOON_SLOTS + EVENING_SLOTS (12:00-21:00)
   *
   * @param v1Data - Data in v1 format
   * @returns Data in v2 format
   *
   * @example
   * ```typescript
   * const v1 = {
   *   version: 1,
   *   blockedDates: [
   *     { date: '2026-01-15', status: 'full', eventName: 'Meeting' }
   *   ]
   * };
   *
   * const v2 = migrationService.migrateToV2(v1);
   * // v2.blockedDates['2026-01-15'].slots has all 16 slots marked blocked
   * ```
   */
  migrateToV2(v1Data: AvailabilityDataV1 | any): AvailabilityDataV2 {
    const v2Data: AvailabilityDataV2 = {
      version: 2,
      blockedDates: {},
      instructorId: v1Data.instructorId || 'default',
      lastModified: new Date().toISOString()
    };

    // Handle array-based v1 format
    let blockedDatesArray: any[];
    if (Array.isArray(v1Data.blockedDates)) {
      blockedDatesArray = v1Data.blockedDates;
    } else {
      // Use Object.entries with prototype pollution protection
      blockedDatesArray = [];
      for (const [key, value] of Object.entries(v1Data.blockedDates || {})) {
        if (Object.prototype.hasOwnProperty.call(v1Data.blockedDates, key)) {
          blockedDatesArray.push(value);
        }
      }
    }

    for (const blockStatus of blockedDatesArray) {
      if (this.isV1Format(blockStatus)) {
        const slots = new Map<string, boolean>();

        // Convert status to time slots
        if (blockStatus.status === 'full') {
          // Full day blocked → block all 16 slots
          MORNING_SLOTS.forEach(slot => slots.set(slot, true));
          AFTERNOON_SLOTS.forEach(slot => slots.set(slot, true));
          EVENING_SLOTS.forEach(slot => slots.set(slot, true));
        } else if (blockStatus.status === 'am') {
          // AM blocked → block morning slots only
          MORNING_SLOTS.forEach(slot => slots.set(slot, true));
        } else if (blockStatus.status === 'pm') {
          // PM blocked → block afternoon + evening slots
          AFTERNOON_SLOTS.forEach(slot => slots.set(slot, true));
          EVENING_SLOTS.forEach(slot => slots.set(slot, true));
        }

        // Create v2 status
        v2Data.blockedDates[blockStatus.date] = {
          slots,
          fullDayBlock: blockStatus.status === 'full',
          eventName: blockStatus.eventName
        };
      } else {
        // Already v2 format (mixed data) - preserve as-is
        v2Data.blockedDates[blockStatus.date] = blockStatus;
      }
    }

    return v2Data;
  }

  /**
   * Derive AM/PM status from v2 time slots (backward compatibility)
   *
   * Allows existing components to work with v2 data without modification.
   * Returns AM/PM blocked status based on slot availability.
   *
   * @param status - v2 TimeSlotStatus
   * @returns Object with AM and PM boolean flags
   *
   * @example
   * ```typescript
   * const v2Status: TimeSlotStatus = {
   *   slots: new Map([
   *     ['09:00', true],  // Morning blocked
   *     ['10:00', true]
   *   ]),
   *   fullDayBlock: false
   * };
   *
   * const { AM, PM } = migrationService.deriveAMPM(v2Status);
   * // AM = true (some morning slots blocked)
   * // PM = false (no afternoon/evening slots blocked)
   * ```
   */
  deriveAMPM(status: TimeSlotStatus): { AM: boolean; PM: boolean } {
    // Check if ANY morning slots are blocked
    const morningBlocked = MORNING_SLOTS.some(slot =>
      status.slots.get(slot as any) === true
    );

    // Check if ANY afternoon or evening slots are blocked
    const afternoonBlocked = AFTERNOON_SLOTS.some(slot =>
      status.slots.get(slot as any) === true
    );

    const eveningBlocked = EVENING_SLOTS.some(slot =>
      status.slots.get(slot as any) === true
    );

    return {
      AM: morningBlocked,
      PM: afternoonBlocked || eveningBlocked
    };
  }

  /**
   * Convert v2 data back to v1 format (for export/backup)
   *
   * Useful for creating v1-compatible backups or exporting to systems
   * that don't support hourly slots.
   *
   * @param v2Data - Data in v2 format
   * @returns Data in v1 format
   *
   * @example
   * ```typescript
   * const v2 = { version: 2, blockedDates: { ... } };
   * const v1 = migrationService.convertToV1(v2);
   * // Can be used with old systems
   * ```
   */
  convertToV1(v2Data: AvailabilityDataV2): AvailabilityDataV1 {
    const blockedDates: BlockedDate[] = [];

    for (const [date, status] of Object.entries(v2Data.blockedDates)) {
      // Prototype pollution protection
      if (!Object.prototype.hasOwnProperty.call(v2Data.blockedDates, date)) continue;

      if (this.isV2Format(status)) {
        const { AM, PM } = this.deriveAMPM(status);

        // Determine status string
        let statusValue: 'full' | 'am' | 'pm';
        if (status.fullDayBlock || (AM && PM)) {
          statusValue = 'full';
        } else if (AM) {
          statusValue = 'am';
        } else if (PM) {
          statusValue = 'pm';
        } else {
          // No slots blocked - skip this date
          continue;
        }

        blockedDates.push({
          date,
          status: statusValue,
          eventName: status.eventName
        });
      } else {
        // Already v1 format
        blockedDates.push(status);
      }
    }

    return {
      version: 1,
      blockedDates,
      instructorId: v2Data.instructorId
    };
  }

  /**
   * Check if data is in v1 format
   *
   * @param data - Data to check
   * @returns true if v1 format
   */
  isV1Format(data: any): data is BlockedDate {
    return (
      data &&
      typeof data === 'object' &&
      'date' in data &&
      'status' in data &&
      typeof data.status === 'string'
    );
  }

  /**
   * Check if data is in v2 format
   *
   * Handles both Map instances (in-memory) and array format (from JSON).
   *
   * @param data - Data to check
   * @returns true if v2 format
   */
  isV2Format(data: any): data is TimeSlotStatus {
    return (
      data &&
      typeof data === 'object' &&
      'slots' in data &&
      (data.slots instanceof Map || Array.isArray(data.slots))
    );
  }

  /**
   * Validate migrated data integrity
   *
   * Ensures migration didn't lose any blocked dates or event names.
   *
   * @param original - Original v1 data
   * @param migrated - Migrated v2 data
   * @returns Validation result with errors if any
   *
   * @example
   * ```typescript
   * const result = migrationService.validateMigration(v1, v2);
   * if (!result.valid) {
   *   console.error('Migration errors:', result.errors);
   * }
   * ```
   */
  validateMigration(
    original: AvailabilityDataV1,
    migrated: AvailabilityDataV2
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Count blocked dates
    const originalCount = original.blockedDates.length;
    const migratedCount = Object.keys(migrated.blockedDates).length;

    if (originalCount !== migratedCount) {
      errors.push(
        `Date count mismatch: ${originalCount} original, ${migratedCount} migrated`
      );
    }

    // Check each original date exists in migrated data
    for (const blockedDate of original.blockedDates) {
      if (!migrated.blockedDates[blockedDate.date]) {
        errors.push(`Missing date in migration: ${blockedDate.date}`);
      }

      // Check event name preserved
      const migratedStatus = migrated.blockedDates[blockedDate.date];
      if (migratedStatus && 'eventName' in migratedStatus) {
        if (migratedStatus.eventName !== blockedDate.eventName) {
          errors.push(
            `Event name mismatch for ${blockedDate.date}: ` +
            `"${blockedDate.eventName}" → "${migratedStatus.eventName}"`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get migration statistics
   *
   * @param data - Data to analyze
   * @returns Migration statistics
   */
  getMigrationStats(data: any): {
    version: 1 | 2;
    totalDates: number;
    fullDayBlocks: number;
    partialBlocks: number;
    totalBlockedSlots: number;
  } {
    if (!data || !data.blockedDates) {
      return {
        version: 2,
        totalDates: 0,
        fullDayBlocks: 0,
        partialBlocks: 0,
        totalBlockedSlots: 0
      };
    }

    const version = data.version || 1;
    const dates = Array.isArray(data.blockedDates)
      ? data.blockedDates
      : Object.values(data.blockedDates);

    let fullDayBlocks = 0;
    let partialBlocks = 0;
    let totalBlockedSlots = 0;

    for (const status of dates) {
      if (this.isV1Format(status)) {
        if (status.status === 'full') {
          fullDayBlocks++;
          totalBlockedSlots += 16;  // All 16 slots
        } else {
          partialBlocks++;
          totalBlockedSlots += status.status === 'am' ? 6 : 10;
        }
      } else if (this.isV2Format(status)) {
        const blockedCount = Array.from(status.slots.values()).filter(Boolean).length;
        totalBlockedSlots += blockedCount;

        if (status.fullDayBlock || blockedCount === 16) {
          fullDayBlocks++;
        } else if (blockedCount > 0) {
          partialBlocks++;
        }
      }
    }

    return {
      version: version as 1 | 2,
      totalDates: dates.length,
      fullDayBlocks,
      partialBlocks,
      totalBlockedSlots
    };
  }
}

/**
 * Singleton migration service instance
 *
 * @example
 * ```typescript
 * import { migrationService } from '@/lib/migration-service';
 *
 * // Use anywhere in the application
 * const migrated = migrationService.migrate(data);
 * ```
 */
export const migrationService = new DataMigrationService();
