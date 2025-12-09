-- Add new profile fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS full_name_en text,
ADD COLUMN IF NOT EXISTS job_title_en text,
ADD COLUMN IF NOT EXISTS job_title_ar text,
ADD COLUMN IF NOT EXISTS department_en text,
ADD COLUMN IF NOT EXISTS department_ar text,
ADD COLUMN IF NOT EXISTS organization_en text,
ADD COLUMN IF NOT EXISTS organization_ar text,
ADD COLUMN IF NOT EXISTS national_id text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS degree text,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS location_region text,
ADD COLUMN IF NOT EXISTS years_experience integer DEFAULT 0;

-- Add bilingual fields to roles table
ALTER TABLE public.roles
ADD COLUMN IF NOT EXISTS name_ar text,
ADD COLUMN IF NOT EXISTS description_ar text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add new roles to app_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'expert' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'expert';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'investor' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'investor';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ministry' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'ministry';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'moderator' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'moderator';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'user';
  END IF;
END$$;

-- Create permissions table if not exists
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text,
  description text,
  description_ar text,
  entity_type text,
  action text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;

-- RLS policies for permissions
CREATE POLICY "Anyone can view permissions"
ON public.permissions FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage permissions"
ON public.permissions FOR ALL
USING (is_admin(auth.uid()));