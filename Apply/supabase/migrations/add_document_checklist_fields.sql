-- Add document checklist fields to applications table
-- Run this migration in your Supabase SQL Editor

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS sop_done BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cv_done BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS passport_done BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lor_done BOOLEAN DEFAULT false;

-- Add comment to document the fields
COMMENT ON COLUMN applications.sop_done IS 'Statement of Purpose document completed';
COMMENT ON COLUMN applications.cv_done IS 'CV/Resume document completed';
COMMENT ON COLUMN applications.passport_done IS 'Passport copy document completed';
COMMENT ON COLUMN applications.lor_done IS 'Letter of Recommendation document completed';

-- The notes column should already exist, but if not:
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes TEXT;
