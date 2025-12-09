-- Add missing fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id),
ADD COLUMN IF NOT EXISTS work_phone TEXT,
ADD COLUMN IF NOT EXISTS extracted_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create municipality_staff_profiles table
CREATE TABLE IF NOT EXISTS public.municipality_staff_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  department TEXT,
  job_title TEXT,
  employee_id TEXT,
  years_of_experience INTEGER,
  specializations TEXT[],
  certifications JSONB DEFAULT '[]'::jsonb,
  cv_url TEXT,
  extracted_cv_data JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create citizen_profiles table
CREATE TABLE IF NOT EXISTS public.citizen_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  city_id UUID REFERENCES public.cities(id),
  region_id UUID REFERENCES public.regions(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  neighborhood TEXT,
  interests TEXT[],
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  participation_areas TEXT[],
  accessibility_needs TEXT,
  language_preference TEXT DEFAULT 'en',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.municipality_staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for municipality_staff_profiles
CREATE POLICY "Users can view own municipality_staff_profile" 
ON public.municipality_staff_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own municipality_staff_profile" 
ON public.municipality_staff_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own municipality_staff_profile" 
ON public.municipality_staff_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage municipality_staff_profiles" 
ON public.municipality_staff_profiles 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS policies for citizen_profiles
CREATE POLICY "Users can view own citizen_profile" 
ON public.citizen_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own citizen_profile" 
ON public.citizen_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own citizen_profile" 
ON public.citizen_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage citizen_profiles" 
ON public.citizen_profiles 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_municipality_staff_profiles_user_id ON public.municipality_staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_municipality_staff_profiles_municipality_id ON public.municipality_staff_profiles(municipality_id);
CREATE INDEX IF NOT EXISTS idx_citizen_profiles_user_id ON public.citizen_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_citizen_profiles_city_id ON public.citizen_profiles(city_id);

-- Update trigger for updated_at
CREATE TRIGGER update_municipality_staff_profiles_updated_at
BEFORE UPDATE ON public.municipality_staff_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citizen_profiles_updated_at
BEFORE UPDATE ON public.citizen_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();