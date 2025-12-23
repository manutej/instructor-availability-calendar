/**
 * Supabase Module Exports
 *
 * Re-exports all Supabase utilities for convenient importing.
 *
 * @example
 * import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
 */

export {
  getSupabaseClient,
  getSupabaseClientSafe,
  isSupabaseConfigured,
} from './client';

export type {
  Database,
  AvailabilityJsonData,
  BlockedDateJson,
  TimeSlotStatusJson,
} from './types';
