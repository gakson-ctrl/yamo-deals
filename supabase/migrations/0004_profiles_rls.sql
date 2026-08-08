-- ============================================================
-- YaMo Deals — Migration 0004: Profiles RLS
-- Enables row-level security on the profiles table and adds
-- the policies that were missing from migration 0002.
-- Apply with: supabase db push
-- ============================================================

-- Enable RLS (idempotent — safe to run twice)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can insert their own profile row (id must match auth.uid())
CREATE POLICY IF NOT EXISTS "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read their own profile
CREATE POLICY IF NOT EXISTS "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);
