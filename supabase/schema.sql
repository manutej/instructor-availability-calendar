-- Calendar Availability Database Schema
--
-- Run this in your Supabase SQL Editor to create the required tables.
-- Includes Row Level Security (RLS) policies for multi-tenant access.
--
-- Version: 1.0
-- Created: 2025-12-23

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- INSTRUCTOR AVAILABILITY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS instructor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Instructor identifier (matches localStorage instructorId)
  instructor_id TEXT NOT NULL UNIQUE,

  -- Full availability data as JSONB (v2 format with serialized slots)
  -- Structure: { version, instructorId, lastModified, blockedDates: {...} }
  availability_data JSONB NOT NULL DEFAULT '{}',

  -- Data format version for migrations
  version INT DEFAULT 2,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast instructor lookups
CREATE INDEX IF NOT EXISTS idx_availability_instructor
  ON instructor_availability(instructor_id);

-- ============================================================================
-- INSTRUCTOR PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS instructor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Instructor identifier (matches availability table)
  instructor_id TEXT NOT NULL UNIQUE,

  -- URL-safe slug for public calendar link
  slug TEXT NOT NULL UNIQUE,

  -- Display name shown on public calendar
  display_name TEXT NOT NULL,

  -- Optional email for notifications
  email TEXT,

  -- Whether calendar is publicly visible
  is_public BOOLEAN DEFAULT false,

  -- Timezone for date calculations (IANA format)
  timezone TEXT DEFAULT 'America/New_York',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for slug lookups (public calendar URLs)
CREATE INDEX IF NOT EXISTS idx_profiles_slug
  ON instructor_profiles(slug);

-- Index for public calendars
CREATE INDEX IF NOT EXISTS idx_profiles_public
  ON instructor_profiles(is_public) WHERE is_public = true;

-- ============================================================================
-- BATCH IMPORT HISTORY (for tracking bulk operations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  instructor_id TEXT NOT NULL REFERENCES instructor_profiles(instructor_id) ON DELETE CASCADE,

  -- Import metadata
  import_type TEXT NOT NULL CHECK (import_type IN ('json', 'batch', 'sync')),
  records_count INT NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,

  -- Import data snapshot (for rollback)
  previous_data JSONB,
  imported_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for instructor import history
CREATE INDEX IF NOT EXISTS idx_import_history_instructor
  ON import_history(instructor_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- For MVP: Allow all operations (no auth required)
-- In production: Replace with proper auth policies

-- Availability: Anyone can read/write (MVP - no auth)
CREATE POLICY "availability_all_access" ON instructor_availability
  FOR ALL USING (true) WITH CHECK (true);

-- Profiles: Anyone can read public, owner can write
CREATE POLICY "profiles_read_public" ON instructor_profiles
  FOR SELECT USING (is_public = true OR true); -- MVP: allow all reads

CREATE POLICY "profiles_write_all" ON instructor_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_all" ON instructor_profiles
  FOR UPDATE USING (true) WITH CHECK (true);

-- Import history: Anyone can access (MVP)
CREATE POLICY "import_history_all" ON import_history
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to availability table
DROP TRIGGER IF EXISTS update_availability_updated_at ON instructor_availability;
CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON instructor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON instructor_profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON instructor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPFUL VIEWS
-- ============================================================================

-- View for getting availability with profile info
CREATE OR REPLACE VIEW availability_with_profile AS
SELECT
  a.id,
  a.instructor_id,
  a.availability_data,
  a.version,
  a.updated_at as availability_updated_at,
  p.display_name,
  p.slug,
  p.is_public,
  p.timezone
FROM instructor_availability a
LEFT JOIN instructor_profiles p ON a.instructor_id = p.instructor_id;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample data for testing:
/*
INSERT INTO instructor_profiles (instructor_id, slug, display_name, is_public)
VALUES ('default', 'demo-instructor', 'Demo Instructor', true)
ON CONFLICT (instructor_id) DO NOTHING;

INSERT INTO instructor_availability (instructor_id, availability_data, version)
VALUES (
  'default',
  '{
    "version": 2,
    "instructorId": "default",
    "lastModified": "2025-12-23T00:00:00Z",
    "blockedDates": {}
  }'::jsonb,
  2
)
ON CONFLICT (instructor_id) DO NOTHING;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify schema was created correctly:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM instructor_availability LIMIT 5;
-- SELECT * FROM instructor_profiles LIMIT 5;
