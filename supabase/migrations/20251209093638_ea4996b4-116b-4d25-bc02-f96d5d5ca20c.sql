-- Add mobile_number field to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS mobile_number text,
ADD COLUMN IF NOT EXISTS mobile_country_code text DEFAULT '+966';