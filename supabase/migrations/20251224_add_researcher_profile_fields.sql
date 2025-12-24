-- Add missing fields to researcher_profiles table
ALTER TABLE public.researcher_profiles
ADD COLUMN IF NOT EXISTS full_name_en text,
ADD COLUMN IF NOT EXISTS full_name_ar text,
ADD COLUMN IF NOT EXISTS bio_en text,
ADD COLUMN IF NOT EXISTS bio_ar text,
ADD COLUMN IF NOT EXISTS institution text,
ADD COLUMN IF NOT EXISTS academic_title text,
ADD COLUMN IF NOT EXISTS expertise_keywords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS collaboration_interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'platform';

-- Add comment to explain visibility values
COMMENT ON COLUMN public.researcher_profiles.visibility IS 'Visibility setting: public, platform, or private';
