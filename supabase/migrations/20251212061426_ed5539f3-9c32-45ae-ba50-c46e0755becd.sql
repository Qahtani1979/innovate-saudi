
-- Update get_user_permissions to also check user_roles table and map to roles table
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user BOOLEAN;
  result TEXT[];
BEGIN
  -- Check if admin via user_roles
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  ) INTO is_admin_user;
  
  IF is_admin_user THEN
    RETURN ARRAY['*']::TEXT[];
  END IF;
  
  -- Get all permissions from multiple sources
  SELECT COALESCE(array_agg(DISTINCT permission_code), ARRAY[]::TEXT[])
  INTO result
  FROM (
    -- Source 1: Permissions from functional roles via role_permissions join table
    SELECT p.code as permission_code
    FROM public.user_functional_roles ufr
    JOIN public.role_permissions rp ON ufr.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ufr.user_id = _user_id 
      AND ufr.is_active = true
      AND (ufr.expires_at IS NULL OR ufr.expires_at > now())
    
    UNION
    
    -- Source 2: Permissions stored directly in roles.permissions array
    SELECT unnest(r.permissions) as permission_code
    FROM public.user_functional_roles ufr
    JOIN public.roles r ON ufr.role_id = r.id
    WHERE ufr.user_id = _user_id 
      AND ufr.is_active = true
      AND (ufr.expires_at IS NULL OR ufr.expires_at > now())
      AND r.permissions IS NOT NULL
    
    UNION
    
    -- Source 3: Permissions from delegations
    SELECT unnest(dr.permission_types) as permission_code
    FROM public.delegation_rules dr
    JOIN public.user_profiles up ON up.user_id = _user_id
    WHERE dr.delegate_email = up.user_email
      AND dr.is_active = true
      AND dr.start_date <= now()
      AND dr.end_date >= now()
    
    UNION
    
    -- Source 4: Permissions from user_roles mapped to roles table by name pattern
    SELECT p.code as permission_code
    FROM public.user_roles ur
    JOIN public.roles r ON (
      -- Map app_role enum to roles table by name pattern
      (ur.role = 'municipality_staff' AND r.name = 'Municipality Staff') OR
      (ur.role = 'municipality_admin' AND r.name = 'Municipality Admin') OR
      (ur.role = 'municipality_coordinator' AND r.name = 'Municipality Coordinator') OR
      (ur.role = 'deputyship_admin' AND r.name = 'Deputyship Director') OR
      (ur.role = 'deputyship_staff' AND r.name = 'Deputyship Staff')
    )
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
    
    UNION
    
    -- Source 5: Direct permissions from roles.permissions array for user_roles
    SELECT unnest(r.permissions) as permission_code
    FROM public.user_roles ur
    JOIN public.roles r ON (
      (ur.role = 'municipality_staff' AND r.name = 'Municipality Staff') OR
      (ur.role = 'municipality_admin' AND r.name = 'Municipality Admin') OR
      (ur.role = 'municipality_coordinator' AND r.name = 'Municipality Coordinator') OR
      (ur.role = 'deputyship_admin' AND r.name = 'Deputyship Director') OR
      (ur.role = 'deputyship_staff' AND r.name = 'Deputyship Staff')
    )
    WHERE ur.user_id = _user_id
      AND r.permissions IS NOT NULL
  ) all_permissions
  WHERE permission_code IS NOT NULL;
  
  -- Check for wildcard permission
  IF '*' = ANY(result) THEN
    RETURN ARRAY['*']::TEXT[];
  END IF;
  
  RETURN result;
END;
$$;
