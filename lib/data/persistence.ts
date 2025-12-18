/**
 * Data Persistence Abstraction Layer
 *
 * MVP: localStorage + JSON export/import
 * Future: PostgreSQL database with same interface
 *
 * V2: Auto-migration from v1 (AM/PM) to v2 (hourly slots) format
 */

import type { AvailabilityData, InstructorProfile } from '@/types';
import type { AvailabilityDataV2 } from '@/types/email-generator';
import { migrationService } from '../migration-service';

export interface PersistenceAdapter {
  // Availability data (v2 with auto-migration)
  saveAvailability(data: AvailabilityData | AvailabilityDataV2): Promise<void>;
  loadAvailability(): Promise<AvailabilityDataV2 | null>;

  // Legacy v1 support (for backward compatibility)
  loadAvailabilityV1(): Promise<AvailabilityData | null>;

  // Instructor profile
  saveProfile(profile: InstructorProfile): Promise<void>;
  loadProfile(): Promise<InstructorProfile | null>;

  // Export/Import
  exportData(): Promise<string>; // JSON string
  importData(jsonData: string): Promise<void>;

  // Clear all data
  clearAll(): Promise<void>;
}

/**
 * LocalStorage adapter for MVP with v2 auto-migration
 */
class LocalStorageAdapter implements PersistenceAdapter {
  private readonly AVAILABILITY_KEY = 'cal_availability_data';
  private readonly PROFILE_KEY = 'cal_instructor_profile';

  /**
   * Save availability data (always saves as v2)
   */
  async saveAvailability(data: AvailabilityData | AvailabilityDataV2): Promise<void> {
    if (typeof window === 'undefined') return;

    // Ensure data is in v2 format before saving
    const v2Data = migrationService.migrate(data);

    // Convert Map to array for JSON serialization
    const serializable = this.prepareForSerialization(v2Data);

    localStorage.setItem(this.AVAILABILITY_KEY, JSON.stringify(serializable));
  }

  /**
   * Load availability data with auto-migration to v2
   */
  async loadAvailability(): Promise<AvailabilityDataV2 | null> {
    if (typeof window === 'undefined') return null;

    const rawData = localStorage.getItem(this.AVAILABILITY_KEY);
    if (!rawData) return null;

    try {
      const parsed = JSON.parse(rawData);

      // Deserialize Maps
      const deserialized = this.deserializeFromStorage(parsed);

      // Auto-migrate to v2
      const v2Data = migrationService.migrate(deserialized);

      // Validate migrated data structure (optional validation - logs errors but doesn't block)
      try {
        const { AvailabilityDataV2Schema, safeValidate } = await import('../validation/schemas');
        const validation = safeValidate(AvailabilityDataV2Schema, v2Data);
        if (!validation.success) {
          console.warn('Loaded data has validation issues:', validation.error);
          // Continue anyway - data may be fixable or partially usable
        }
      } catch (validationError) {
        console.warn('Could not validate loaded data:', validationError);
      }

      // Save migrated version back to storage (one-time migration)
      if (parsed.version !== 2) {
        await this.saveAvailability(v2Data);
      }

      return v2Data;
    } catch (error) {
      console.error('Error loading availability data:', error);
      return null;
    }
  }

  /**
   * Load availability data in original v1 format (no migration)
   */
  async loadAvailabilityV1(): Promise<AvailabilityData | null> {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(this.AVAILABILITY_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Prepare v2 data for JSON serialization
   * Converts Map objects to arrays
   */
  private prepareForSerialization(data: AvailabilityDataV2): any {
    const serializable: any = {
      version: data.version,
      instructorId: data.instructorId,
      lastModified: data.lastModified,
      blockedDates: {}
    };

    for (const [date, status] of Object.entries(data.blockedDates)) {
      // Prototype pollution protection
      if (!Object.prototype.hasOwnProperty.call(data.blockedDates, date)) continue;

      if ('slots' in status && status.slots instanceof Map) {
        // Convert Map to array of [key, value] pairs
        serializable.blockedDates[date] = {
          slots: Array.from(status.slots.entries()),
          fullDayBlock: status.fullDayBlock,
          eventName: status.eventName
        };
      } else {
        serializable.blockedDates[date] = status;
      }
    }

    return serializable;
  }

  /**
   * Deserialize data from storage
   * Converts arrays back to Map objects
   */
  private deserializeFromStorage(data: any): any {
    if (!data || !data.blockedDates) return data;

    const deserialized = { ...data };

    for (const [date, status] of Object.entries(data.blockedDates)) {
      // Prototype pollution protection
      if (!Object.prototype.hasOwnProperty.call(data.blockedDates, date)) continue;

      if (status && typeof status === 'object' && 'slots' in status) {
        const statusObj = status as any;
        // Convert array back to Map
        if (Array.isArray(statusObj.slots)) {
          deserialized.blockedDates[date] = {
            slots: new Map(statusObj.slots),
            fullDayBlock: statusObj.fullDayBlock,
            eventName: statusObj.eventName
          };
        }
      }
    }

    return deserialized;
  }

  async saveProfile(profile: InstructorProfile): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  async loadProfile(): Promise<InstructorProfile | null> {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(this.PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  }

  async exportData(): Promise<string> {
    if (typeof window === 'undefined') return '{}';

    const availability = await this.loadAvailability();
    const profile = await this.loadProfile();

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      availability,
      profile,
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const data = JSON.parse(jsonData);

      // Validate import data structure
      const { ExportDataSchema, safeValidate } = await import('../validation/schemas');
      const validation = safeValidate(ExportDataSchema, data);

      if (!validation.success) {
        throw new Error(`Invalid import data: ${validation.error}`);
      }

      const validData = validation.data;

      if (validData.availability) {
        await this.saveAvailability(validData.availability as unknown as AvailabilityData | AvailabilityDataV2);
      }

      if (validData.profile) {
        await this.saveProfile(validData.profile as unknown as InstructorProfile);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Import failed: ${error.message}`);
      }
      throw new Error('Invalid import data format');
    }
  }

  async clearAll(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.AVAILABILITY_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
  }
}

/**
 * Database adapter for future production use
 * Implements same interface for seamless migration
 */
class DatabaseAdapter implements PersistenceAdapter {
  async saveAvailability(data: AvailabilityData | AvailabilityDataV2): Promise<void> {
    // TODO: Implement PostgreSQL save with v2 support
    // const v2Data = migrationService.migrate(data);
    // await db.availability.upsert({ where: { instructorId }, data: v2Data })
    throw new Error('Database adapter not implemented yet');
  }

  async loadAvailability(): Promise<AvailabilityDataV2 | null> {
    // TODO: Implement PostgreSQL load with auto-migration
    // const data = await db.availability.findFirst({ where: { instructorId } })
    // return migrationService.migrate(data);
    throw new Error('Database adapter not implemented yet');
  }

  async loadAvailabilityV1(): Promise<AvailabilityData | null> {
    // TODO: Implement PostgreSQL load without migration
    throw new Error('Database adapter not implemented yet');
  }

  async saveProfile(profile: InstructorProfile): Promise<void> {
    // TODO: Implement PostgreSQL save
    throw new Error('Database adapter not implemented yet');
  }

  async loadProfile(): Promise<InstructorProfile | null> {
    // TODO: Implement PostgreSQL load
    throw new Error('Database adapter not implemented yet');
  }

  async exportData(): Promise<string> {
    // TODO: Export from database
    throw new Error('Database adapter not implemented yet');
  }

  async importData(jsonData: string): Promise<void> {
    // TODO: Import to database
    throw new Error('Database adapter not implemented yet');
  }

  async clearAll(): Promise<void> {
    // TODO: Clear database records
    throw new Error('Database adapter not implemented yet');
  }
}

/**
 * Factory function to get the appropriate adapter
 * MVP: Always returns LocalStorage
 * Future: Check env var to return Database adapter
 */
export function getPersistenceAdapter(): PersistenceAdapter {
  const useDatabase = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

  if (useDatabase) {
    return new DatabaseAdapter();
  }

  return new LocalStorageAdapter();
}

/**
 * Convenience functions using the default adapter
 * V2: Returns AvailabilityDataV2 with auto-migration
 */
export const persistence = {
  /**
   * Save availability data (automatically converts to v2)
   */
  saveAvailability: async (data: AvailabilityData | AvailabilityDataV2) => {
    const adapter = getPersistenceAdapter();
    return adapter.saveAvailability(data);
  },

  /**
   * Load availability data (auto-migrates to v2)
   * @returns AvailabilityDataV2 with hourly time slots
   */
  loadAvailability: async (): Promise<AvailabilityDataV2 | null> => {
    const adapter = getPersistenceAdapter();
    return adapter.loadAvailability();
  },

  /**
   * Load availability data in v1 format (no migration)
   * @deprecated Use loadAvailability() for v2 format
   */
  loadAvailabilityV1: async (): Promise<AvailabilityData | null> => {
    const adapter = getPersistenceAdapter();
    return adapter.loadAvailabilityV1();
  },

  saveProfile: async (profile: InstructorProfile) => {
    const adapter = getPersistenceAdapter();
    return adapter.saveProfile(profile);
  },

  loadProfile: async () => {
    const adapter = getPersistenceAdapter();
    return adapter.loadProfile();
  },

  exportData: async () => {
    const adapter = getPersistenceAdapter();
    return adapter.exportData();
  },

  importData: async (jsonData: string) => {
    const adapter = getPersistenceAdapter();
    return adapter.importData(jsonData);
  },

  clearAll: async () => {
    const adapter = getPersistenceAdapter();
    return adapter.clearAll();
  },
};
