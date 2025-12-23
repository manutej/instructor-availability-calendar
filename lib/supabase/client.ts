/**
 * Supabase Client Configuration
 *
 * Provides browser and server-side Supabase clients for database operations.
 * Uses environment variables for secure configuration.
 *
 * @module lib/supabase/client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client (singleton)
 *
 * Uses anon key for client-side operations.
 * Row Level Security (RLS) enforced on all tables.
 */
let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    // Server-side: create fresh client each time
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  // Browser-side: reuse singleton
  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
}

/**
 * Check if Supabase is configured
 *
 * Returns false if environment variables are not set.
 * Allows graceful fallback to localStorage.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get Supabase client or null if not configured
 *
 * Safe function that returns null instead of throwing.
 */
export function getSupabaseClientSafe(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return getSupabaseClient();
}
