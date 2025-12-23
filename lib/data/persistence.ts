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

    // CRITICAL: Convert Maps to arrays before JSON serialization
    // Maps serialize to {} in JSON, causing data loss
    const serializedAvailability = availability
      ? this.prepareForSerialization(availability)
      : null;

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      availability: serializedAvailability,
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
 * Supabase adapter for production database persistence
 *
 * Implements PersistenceAdapter interface with Supabase backend.
 * Provides cloud sync, multi-device access, and batch operations.
 */
class SupabaseAdapter implements PersistenceAdapter {
  private instructorId: string;
  private localAdapter: LocalStorageAdapter;

  constructor(instructorId: string = 'default') {
    this.instructorId = instructorId;
    this.localAdapter = new LocalStorageAdapter();
  }

  private async getClient() {
    const { getSupabaseClientSafe } = await import('../supabase/client');
    return getSupabaseClientSafe();
  }

  /**
   * Save availability to Supabase with localStorage fallback
   */
  async saveAvailability(data: AvailabilityData | AvailabilityDataV2): Promise<void> {
    // Always save to localStorage first (optimistic update)
    await this.localAdapter.saveAvailability(data);

    const supabase = await this.getClient();
    if (!supabase) {
      console.warn('Supabase not configured, saved to localStorage only');
      return;
    }

    try {
      const v2Data = migrationService.migrate(data);
      const serializable = this.prepareForSerialization(v2Data);

      const { error } = await supabase
        .from('instructor_availability')
        .upsert({
          instructor_id: this.instructorId,
          availability_data: serializable,
          version: 2,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'instructor_id',
        });

      if (error) {
        console.error('Supabase save error:', error);
        // Data is still in localStorage, so operation succeeds partially
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      // Fail silently - localStorage has the data
    }
  }

  /**
   * Load availability from Supabase with localStorage fallback
   */
  async loadAvailability(): Promise<AvailabilityDataV2 | null> {
    const supabase = await this.getClient();

    if (!supabase) {
      // Fallback to localStorage
      return this.localAdapter.loadAvailability();
    }

    try {
      const { data, error } = await supabase
        .from('instructor_availability')
        .select('availability_data, version')
        .eq('instructor_id', this.instructorId)
        .single();

      if (error || !data) {
        // No data in Supabase, try localStorage
        return this.localAdapter.loadAvailability();
      }

      // Deserialize and migrate
      const deserialized = this.deserializeFromStorage(data.availability_data);
      return migrationService.migrate(deserialized);
    } catch (error) {
      console.error('Supabase load error:', error);
      return this.localAdapter.loadAvailability();
    }
  }

  async loadAvailabilityV1(): Promise<AvailabilityData | null> {
    // v1 format only in localStorage (legacy)
    return this.localAdapter.loadAvailabilityV1();
  }

  async saveProfile(profile: InstructorProfile): Promise<void> {
    // Save to localStorage first
    await this.localAdapter.saveProfile(profile);

    const supabase = await this.getClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('instructor_profiles')
        .upsert({
          instructor_id: this.instructorId,
          slug: profile.slug,
          display_name: profile.displayName,
          email: profile.email || null,
          is_public: profile.isPublic,
          timezone: 'America/New_York',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'instructor_id',
        });

      if (error) {
        console.error('Supabase profile save error:', error);
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
    }
  }

  async loadProfile(): Promise<InstructorProfile | null> {
    const supabase = await this.getClient();

    if (!supabase) {
      return this.localAdapter.loadProfile();
    }

    try {
      const { data, error } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('instructor_id', this.instructorId)
        .single();

      if (error || !data) {
        return this.localAdapter.loadProfile();
      }

      return {
        id: data.id,
        slug: data.slug,
        displayName: data.display_name,
        email: data.email || '',
        isPublic: data.is_public,
        publicUrl: `/calendar/${data.slug}`,
      };
    } catch (error) {
      console.error('Supabase profile load error:', error);
      return this.localAdapter.loadProfile();
    }
  }

  async exportData(): Promise<string> {
    // Use localStorage adapter's export (already works with Map serialization fix)
    return this.localAdapter.exportData();
  }

  async importData(jsonData: string): Promise<void> {
    // Import to localStorage first
    await this.localAdapter.importData(jsonData);

    // Then sync to Supabase
    const availability = await this.localAdapter.loadAvailability();
    const profile = await this.localAdapter.loadProfile();

    if (availability) {
      await this.saveAvailability(availability);
    }
    if (profile) {
      await this.saveProfile(profile);
    }
  }

  /**
   * Batch import multiple blocked dates at once
   *
   * Accepts JSON with array of blocked dates for bulk operations.
   * More efficient than individual saves.
   */
  async batchImport(blockedDates: Array<{
    date: string;
    status: 'full' | 'am' | 'pm';
    eventName?: string;
  }>): Promise<{ success: number; failed: number }> {
    const availability = await this.loadAvailability() || {
      version: 2,
      instructorId: this.instructorId,
      blockedDates: {},
    };

    let success = 0;
    let failed = 0;

    for (const bd of blockedDates) {
      try {
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(bd.date)) {
          failed++;
          continue;
        }

        // Add to availability data (v1 format will be migrated)
        availability.blockedDates[bd.date] = {
          date: bd.date,
          status: bd.status,
          eventName: bd.eventName,
        };
        success++;
      } catch {
        failed++;
      }
    }

    // Save the combined data
    await this.saveAvailability(availability as AvailabilityDataV2);

    return { success, failed };
  }

  async clearAll(): Promise<void> {
    // Clear localStorage
    await this.localAdapter.clearAll();

    // Clear Supabase
    const supabase = await this.getClient();
    if (!supabase) return;

    try {
      await supabase
        .from('instructor_availability')
        .delete()
        .eq('instructor_id', this.instructorId);

      await supabase
        .from('instructor_profiles')
        .delete()
        .eq('instructor_id', this.instructorId);
    } catch (error) {
      console.error('Supabase clear error:', error);
    }
  }

  /**
   * Sync localStorage data to Supabase
   *
   * Useful for initial migration from localStorage-only to Supabase.
   */
  async syncToCloud(): Promise<{ synced: boolean; error?: string }> {
    const supabase = await this.getClient();
    if (!supabase) {
      return { synced: false, error: 'Supabase not configured' };
    }

    try {
      const availability = await this.localAdapter.loadAvailability();
      const profile = await this.localAdapter.loadProfile();

      if (availability) {
        await this.saveAvailability(availability);
      }
      if (profile) {
        await this.saveProfile(profile);
      }

      return { synced: true };
    } catch (error) {
      return {
        synced: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Reuse serialization helpers from LocalStorageAdapter
  private prepareForSerialization(data: AvailabilityDataV2): any {
    const serializable: any = {
      version: data.version,
      instructorId: data.instructorId,
      lastModified: data.lastModified || new Date().toISOString(),
      blockedDates: {}
    };

    for (const [date, status] of Object.entries(data.blockedDates)) {
      if (!Object.prototype.hasOwnProperty.call(data.blockedDates, date)) continue;

      if ('slots' in status && status.slots instanceof Map) {
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

  private deserializeFromStorage(data: any): any {
    if (!data || !data.blockedDates) return data;

    const deserialized = { ...data };

    for (const [date, status] of Object.entries(data.blockedDates)) {
      if (!Object.prototype.hasOwnProperty.call(data.blockedDates, date)) continue;

      if (status && typeof status === 'object' && 'slots' in status) {
        const statusObj = status as any;
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
}

// Keep DatabaseAdapter as alias for backward compatibility
const DatabaseAdapter = SupabaseAdapter;

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

  /**
   * Batch import multiple blocked dates at once
   *
   * Accepts array of blocked dates for bulk operations.
   * Only available when using Supabase adapter.
   *
   * @example
   * ```typescript
   * await persistence.batchImport([
   *   { date: '2025-12-25', status: 'full', eventName: 'Christmas' },
   *   { date: '2025-12-26', status: 'am', eventName: 'Boxing Day Morning' },
   *   { date: '2025-12-31', status: 'pm' }
   * ]);
   * ```
   */
  batchImport: async (blockedDates: Array<{
    date: string;
    status: 'full' | 'am' | 'pm';
    eventName?: string;
  }>): Promise<{ success: number; failed: number }> => {
    const adapter = getPersistenceAdapter();
    if (adapter instanceof SupabaseAdapter) {
      return adapter.batchImport(blockedDates);
    }
    // Fallback for localStorage adapter
    const localAdapter = adapter as LocalStorageAdapter;
    const availability = await localAdapter.loadAvailability() || {
      version: 2,
      instructorId: 'default',
      blockedDates: {},
    };

    let success = 0;
    let failed = 0;

    for (const bd of blockedDates) {
      try {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(bd.date)) {
          failed++;
          continue;
        }
        availability.blockedDates[bd.date] = {
          date: bd.date,
          status: bd.status,
          eventName: bd.eventName,
        };
        success++;
      } catch {
        failed++;
      }
    }

    await localAdapter.saveAvailability(availability as AvailabilityDataV2);
    return { success, failed };
  },

  /**
   * Sync localStorage data to Supabase cloud
   *
   * Only available when Supabase is configured.
   */
  syncToCloud: async (): Promise<{ synced: boolean; error?: string }> => {
    const adapter = getPersistenceAdapter();
    if (adapter instanceof SupabaseAdapter) {
      return adapter.syncToCloud();
    }
    return { synced: false, error: 'Cloud sync requires Supabase configuration' };
  },

  /**
   * Check if using Supabase (cloud) or localStorage (local)
   */
  isCloudEnabled: (): boolean => {
    return process.env.NEXT_PUBLIC_USE_DATABASE === 'true';
  },
};
