-- =====================================================
-- PHASE 1-2 GAP FIX: Add missing columns to user_profiles
-- =====================================================

-- Add missing onboarding tracking columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS selected_persona TEXT,
ADD COLUMN IF NOT EXISTS persona_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES public.regions(id);

-- Add index for faster lookups on onboarding status
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_step ON public.user_profiles(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_user_profiles_selected_persona ON public.user_profiles(selected_persona);
CREATE INDEX IF NOT EXISTS idx_user_profiles_persona_onboarding ON public.user_profiles(persona_onboarding_completed);

-- =====================================================
-- Create storage buckets for file uploads
-- =====================================================

-- Create cv-uploads bucket for CVs/resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-uploads', 
  'cv-uploads', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage RLS Policies for cv-uploads bucket
-- =====================================================

-- Users can upload their own CVs
CREATE POLICY "Users can upload own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cv-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can view their own CVs
CREATE POLICY "Users can view own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cv-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can update their own CVs
CREATE POLICY "Users can update own CVs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cv-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can delete their own CVs
CREATE POLICY "Users can delete own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cv-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- Storage RLS Policies for avatars bucket
-- =====================================================

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- Add comments for documentation
-- =====================================================
COMMENT ON COLUMN public.user_profiles.onboarding_step IS 'Current step in main onboarding wizard (1-6)';
COMMENT ON COLUMN public.user_profiles.selected_persona IS 'Persona selected in Step 4: citizen, researcher, expert, provider, municipality_staff, viewer';
COMMENT ON COLUMN public.user_profiles.persona_onboarding_completed IS 'Whether specialized persona onboarding (Stage 2) is completed';
COMMENT ON COLUMN public.user_profiles.region_id IS 'Reference to regions table for user location';