-- 0007_profile_addresses.sql
-- Adds saved_addresses JSONB column to profiles for customer address book

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS saved_addresses JSONB NOT NULL DEFAULT '[]'::jsonb;
