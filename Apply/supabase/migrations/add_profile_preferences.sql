-- Add preference fields to profiles table for settings page
-- Run this migration in your Supabase SQL Editor

-- Profile & Account fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
ADD COLUMN IF NOT EXISTS target_country TEXT;

-- AI Advisor preferences
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS advisor_tone TEXT DEFAULT 'Professional & Formal',
ADD COLUMN IF NOT EXISTS response_length TEXT DEFAULT 'Balanced',
ADD COLUMN IF NOT EXISTS focus_areas TEXT DEFAULT 'All Areas',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';

-- Application preferences
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_country TEXT,
ADD COLUMN IF NOT EXISTS degree_level TEXT DEFAULT 'Masters (MSc / MA)',
ADD COLUMN IF NOT EXISTS field_of_study TEXT,
ADD COLUMN IF NOT EXISTS budget_range TEXT;

-- Add comments to document the fields
COMMENT ON COLUMN profiles.name IS 'User full name';
COMMENT ON COLUMN profiles.country_of_origin IS 'User country of origin';
COMMENT ON COLUMN profiles.target_country IS 'Target country for study';
COMMENT ON COLUMN profiles.advisor_tone IS 'AI advisor tone preference';
COMMENT ON COLUMN profiles.response_length IS 'AI response length preference';
COMMENT ON COLUMN profiles.focus_areas IS 'AI focus areas preference';
COMMENT ON COLUMN profiles.language IS 'Preferred language';
COMMENT ON COLUMN profiles.preferred_country IS 'Preferred country for applications';
COMMENT ON COLUMN profiles.degree_level IS 'Preferred degree level';
COMMENT ON COLUMN profiles.field_of_study IS 'Field of study';
COMMENT ON COLUMN profiles.budget_range IS 'Annual budget range';
