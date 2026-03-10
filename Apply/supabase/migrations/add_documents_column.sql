-- Add documents column to applications table for storing document metadata
-- Run this migration in your Supabase SQL Editor

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS documents TEXT;

-- Add comment to document the field
COMMENT ON COLUMN applications.documents IS 'JSON array of uploaded document metadata';

-- Create storage bucket for application documents
-- Note: This needs to be done via Supabase Dashboard or the initializeStorageBucket() function
-- Bucket name: application-documents
-- Settings: Private, 10MB file size limit
