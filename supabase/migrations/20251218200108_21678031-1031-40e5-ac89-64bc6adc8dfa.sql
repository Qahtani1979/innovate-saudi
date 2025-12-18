-- =============================================
-- RBAC SIMPLIFICATION - PHASE 1: PREPARATION
-- =============================================
-- This migration adds role_id FK to user_roles while keeping existing enum
-- All existing functionality continues to work unchanged

-- Step 1: Add role_id column to user_roles (nullable initially for backward compat)
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Step 2: Create index for performance on the new column
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- Step 3: Create new helper function - check role by ID
CREATE OR REPLACE FUNCTION public.has_role_by_id(_user_id uuid, _role_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role_id = _role_id AND is_active = true
  )
$$;

-- Step 4: Create new helper function - check role by name (for transition)
CREATE OR REPLACE FUNCTION public.has_role_by_name(_user_id uuid, _role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
      AND LOWER(r.name) = LOWER(_role_name)
      AND ur.is_active = true
  )
$$;

-- Step 5: Create function to get role_id from role name
CREATE OR REPLACE FUNCTION public.get_role_id_by_name(_role_name text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.roles 
  WHERE LOWER(name) = LOWER(_role_name)
  LIMIT 1
$$;

-- Step 6: Ensure all needed roles exist in roles table
INSERT INTO public.roles (name, description, is_active)
VALUES 
  ('Admin', 'System administrator with full access', true),
  ('Municipality Staff', 'Staff member of a municipality', true),
  ('Municipality Admin', 'Administrator of a municipality', true),
  ('Municipality Coordinator', 'Coordinator for municipality operations', true),
  ('Deputyship Director', 'Director at deputyship level', true),
  ('Deputyship Staff', 'Staff member at deputyship', true),
  ('Provider Admin', 'Administrator of a solution provider', true),
  ('Provider Staff', 'Staff member of a solution provider', true),
  ('Citizen', 'Regular citizen user', true),
  ('Researcher', 'Research institution member', true),
  ('Investor', 'Investment entity member', true),
  ('Accelerator', 'Accelerator/incubator member', true)
ON CONFLICT DO NOTHING;

-- Step 7: Create mapping function for enum to role_id (used in data migration)
CREATE OR REPLACE FUNCTION public.map_enum_to_role_id(_enum_role text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id FROM public.roles r
  WHERE 
    (_enum_role = 'admin' AND r.name = 'Admin') OR
    (_enum_role = 'municipality_staff' AND r.name = 'Municipality Staff') OR
    (_enum_role = 'municipality_admin' AND r.name = 'Municipality Admin') OR
    (_enum_role = 'municipality_coordinator' AND r.name = 'Municipality Coordinator') OR
    (_enum_role = 'deputyship_admin' AND r.name = 'Deputyship Director') OR
    (_enum_role = 'deputyship_staff' AND r.name = 'Deputyship Staff') OR
    (_enum_role = 'provider_admin' AND r.name = 'Provider Admin') OR
    (_enum_role = 'provider_staff' AND r.name = 'Provider Staff') OR
    (_enum_role = 'citizen' AND r.name = 'Citizen') OR
    (_enum_role = 'researcher' AND r.name = 'Researcher') OR
    (_enum_role = 'investor' AND r.name = 'Investor') OR
    (_enum_role = 'accelerator' AND r.name = 'Accelerator')
  LIMIT 1
$$;