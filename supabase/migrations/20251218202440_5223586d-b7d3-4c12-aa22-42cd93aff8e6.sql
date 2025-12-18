
-- =============================================
-- PHASE 3: RBAC CUTOVER MIGRATION
-- =============================================

-- Step 3.1: Make role_id NOT NULL
-- Pre-condition verified: 100% coverage (2/2 records have role_id)
ALTER TABLE public.user_roles 
ALTER COLUMN role_id SET NOT NULL;

-- Add documentation comment
COMMENT ON COLUMN public.user_roles.role_id IS 
  'FK to roles table - PRIMARY source of role assignment. Made NOT NULL in Phase 3 cutover.';

-- Step 3.3: Update get_user_functional_roles to use user_roles + roles join
-- This replaces the dependency on user_functional_roles table
CREATE OR REPLACE FUNCTION public.get_user_functional_roles(_user_id uuid)
RETURNS TABLE(role_id uuid, role_name text, role_description text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.description
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = _user_id 
    AND ur.is_active = true;
END;
$function$;

-- Step 3.4: Remove redundant permissions array from roles table
-- All permissions now come from role_permissions junction table
ALTER TABLE public.roles DROP COLUMN IF EXISTS permissions;

-- Add documentation comment
COMMENT ON TABLE public.role_permissions IS 
  'Junction table - single source of truth for role→permission mapping. Phase 3 cutover complete.';

-- Update has_role_by_name to handle case insensitivity better
CREATE OR REPLACE FUNCTION public.has_role_by_name(_user_id uuid, _role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
      AND LOWER(r.name) = LOWER(_role_name)
      AND ur.is_active = true
  )
$$;

-- Create index for better performance on role name lookups
CREATE INDEX IF NOT EXISTS idx_roles_name_lower ON public.roles (LOWER(name));
