/**
 * Supabase Database Types
 *
 * TypeScript types for Supabase tables and queries.
 * Auto-generated structure matching our PostgreSQL schema.
 *
 * @module lib/supabase/types
 */

export interface Database {
  public: {
    Tables: {
      instructor_availability: {
        Row: {
          id: string;
          instructor_id: string;
          availability_data: AvailabilityJsonData;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          availability_data: AvailabilityJsonData;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          instructor_id?: string;
          availability_data?: AvailabilityJsonData;
          version?: number;
          updated_at?: string;
        };
      };
      instructor_profiles: {
        Row: {
          id: string;
          instructor_id: string;
          slug: string;
          display_name: string;
          email: string | null;
          is_public: boolean;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          slug: string;
          display_name: string;
          email?: string | null;
          is_public?: boolean;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          instructor_id?: string;
          slug?: string;
          display_name?: string;
          email?: string | null;
          is_public?: boolean;
          timezone?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}

/**
 * JSON structure stored in availability_data column
 *
 * Matches v2 format with serialized slots (arrays instead of Maps).
 */
export interface AvailabilityJsonData {
  version: number;
  instructorId: string;
  lastModified?: string;
  blockedDates: {
    [date: string]: BlockedDateJson | TimeSlotStatusJson;
  };
}

/**
 * v1 blocked date format (legacy, still supported)
 */
export interface BlockedDateJson {
  date: string;
  status: 'full' | 'am' | 'pm';
  eventName?: string;
}

/**
 * v2 time slot format with slots as array (for JSON storage)
 */
export interface TimeSlotStatusJson {
  slots: Array<[string, boolean]>; // Serialized from Map
  fullDayBlock?: boolean;
  eventName?: string;
}
