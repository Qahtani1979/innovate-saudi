-- Add missing columns to user_profiles to match legacy UserProfile schema
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS bio_en text,
  ADD COLUMN IF NOT EXISTS bio_ar text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_ar text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS expertise_areas text[],
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Riyadh',
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS social_links jsonb,
  ADD COLUMN IF NOT EXISTS contact_preferences jsonb,
  ADD COLUMN IF NOT EXISTS visibility_settings jsonb,
  ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_profile_update timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS achievement_badges jsonb,
  ADD COLUMN IF NOT EXISTS contribution_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Migrate existing bio column to bio_en
UPDATE public.user_profiles SET bio_en = bio WHERE bio IS NOT NULL AND bio_en IS NULL;

-- Migrate existing job_title to title_en  
UPDATE public.user_profiles SET title_en = job_title WHERE job_title IS NOT NULL AND title_en IS NULL;

-- Migrate existing phone to keep consistency
ALTER TABLE public.user_profiles RENAME COLUMN phone TO phone_number;

-- Create trigger for auto-updating last_profile_update
CREATE OR REPLACE FUNCTION public.update_profile_last_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_profile_update = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_user_profiles_last_update ON public.user_profiles;
CREATE TRIGGER update_user_profiles_last_update
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_last_update();

-- Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.user_profiles;

CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id OR auth.email() = user_email);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id OR auth.email() = user_email);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.email() = user_email);

CREATE POLICY "Admins can manage user_profiles" 
ON public.user_profiles FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view public profiles" 
ON public.user_profiles FOR SELECT 
USING (is_public = true);