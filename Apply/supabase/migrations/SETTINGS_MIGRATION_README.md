# Settings Page Migration Guide

## Overview
This migration adds preference fields to the `profiles` table to support the dynamic Settings page functionality.

## Migration File
- `add_profile_preferences.sql`

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `add_profile_preferences.sql`
5. Click **Run** to execute the migration

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

## Fields Added

### Profile & Account
- `name` (TEXT) - User's full name
- `country_of_origin` (TEXT) - User's country of origin
- `target_country` (TEXT) - Target country for study

### AI Advisor Preferences
- `advisor_tone` (TEXT) - AI advisor tone (default: 'Professional & Formal')
- `response_length` (TEXT) - AI response length (default: 'Balanced')
- `focus_areas` (TEXT) - AI focus areas (default: 'All Areas')
- `language` (TEXT) - Preferred language (default: 'English')

### Application Preferences
- `preferred_country` (TEXT) - Preferred country for applications
- `degree_level` (TEXT) - Preferred degree level (default: 'Masters (MSc / MA)')
- `field_of_study` (TEXT) - Field of study
- `budget_range` (TEXT) - Annual budget range

## Verification

After running the migration, verify the columns were added:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

## Settings Page Features

Once the migration is applied, the Settings page will:
- Load real user data from the `profiles` table
- Allow users to update their profile information
- Save AI advisor preferences
- Save application preferences
- Display real user email (read-only)
- Show user's first initial in avatar

## Notes
- Email field is read-only (managed by Supabase Auth)
- All preference fields are optional (nullable)
- Default values are provided for AI preferences
- Changes are saved immediately to Supabase
