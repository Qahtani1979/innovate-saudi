-- =============================================
-- RBAC SIMPLIFICATION - PHASE 2: DUAL-MODE FUNCTIONS
-- =============================================
-- Update get_user_permissions and has_permission to use role_id path
-- while maintaining backward compatibility with enum path

-- Step 1: Update get_user_permissions to prefer role_id path
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
  -- Check admin via role_id (PRIMARY PATH)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
      AND ur.is_active = true
      AND LOWER(r.name) = 'admin'
  ) INTO is_admin_user;
  
  -- Fallback: Also check old enum path for backward compat
  IF NOT is_admin_user THEN
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id 
        AND role = 'admin'
        AND is_active = true
    ) INTO is_admin_user;
  END IF;
  
  IF is_admin_user THEN
    RETURN ARRAY['*']::TEXT[];
  END IF;
  
  -- Get permissions via role_id path (PRIMARY)
  SELECT COALESCE(array_agg(DISTINCT p.code), ARRAY[]::TEXT[])
  INTO result
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
    AND ur.role_id IS NOT NULL;
  
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

-- Step 2: Update has_permission to prefer role_id path
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
  -- Check admin via role_id (PRIMARY PATH)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
      AND ur.is_active = true
      AND LOWER(r.name) = 'admin'
  ) INTO is_admin_user;
  
  -- Fallback: Check old enum path
  IF NOT is_admin_user THEN
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id 
        AND role = 'admin'
        AND is_active = true
    ) INTO is_admin_user;
  END IF;
  
  IF is_admin_user THEN
    RETURN true;
  END IF;
  
  -- Check via role_id → role_permissions (PRIMARY PATH)
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