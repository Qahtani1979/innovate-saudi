
-- =============================================
-- PHASE 4.1-4.2: REMOVE ENUM FALLBACKS FROM DB FUNCTIONS
-- =============================================

-- Step 4.1: Simplify get_user_permissions (remove enum fallback)
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_admin_user BOOLEAN;
  result TEXT[];
BEGIN
  -- Check admin via role_id only (Phase 4: enum fallback removed)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
      AND ur.is_active = true
      AND LOWER(r.name) = 'admin'
  ) INTO is_admin_user;
  
  IF is_admin_user THEN
    RETURN ARRAY['*']::TEXT[];
  END IF;
  
  -- Get permissions via role_id path only
  SELECT COALESCE(array_agg(DISTINCT p.code), ARRAY[]::TEXT[])
  INTO result
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
    AND ur.is_active = true;
  
  -- Also check delegations
  SELECT COALESCE(result, ARRAY[]::TEXT[]) || COALESCE(array_agg(DISTINCT perm), ARRAY[]::TEXT[])
  INTO result
  FROM public.delegation_rules dr
  JOIN public.user_profiles up ON up.user_id = _user_id
  CROSS JOIN LATERAL unnest(dr.permission_types) AS perm
  WHERE dr.delegate_email = up.user_email
    AND dr.is_active = true
    AND dr.start_date <= now()
    AND dr.end_date >= now();
  
  RETURN COALESCE(result, ARRAY[]::TEXT[]);
END;
$function$;

-- Step 4.2: Simplify has_permission (remove enum fallback)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_admin_user BOOLEAN;
  has_role_perm BOOLEAN;
  has_delegation BOOLEAN;
BEGIN
  -- Check admin via role_id only (Phase 4: enum fallback removed)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
      AND ur.is_active = true
      AND LOWER(r.name) = 'admin'
  ) INTO is_admin_user;
  
  IF is_admin_user THEN
    RETURN true;
  END IF;
  
  -- Check via role_id → role_permissions only
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id 
      AND ur.is_active = true
      AND p.code = _permission_code
  ) INTO has_role_perm;
  
  IF has_role_perm THEN
    RETURN true;
  END IF;
  
  -- Check via delegation rules
  SELECT EXISTS (
    SELECT 1
    FROM public.delegation_rules dr
    JOIN public.user_profiles up ON up.user_id = _user_id
    WHERE dr.delegate_email = up.user_email
      AND dr.is_active = true
      AND dr.start_date <= now()
      AND dr.end_date >= now()
      AND _permission_code = ANY(dr.permission_types)
  ) INTO has_delegation;
  
  RETURN has_delegation;
END;
$function$;

-- Add documentation
COMMENT ON FUNCTION public.get_user_permissions IS 'Phase 4: Uses role_id path only. Enum fallback removed.';
COMMENT ON FUNCTION public.has_permission IS 'Phase 4: Uses role_id path only. Enum fallback removed.';
