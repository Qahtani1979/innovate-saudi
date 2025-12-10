-- =============================================
-- RBAC SYSTEM FIX: Complete Migration
-- =============================================

-- 1. Create user_functional_roles junction table
CREATE TABLE IF NOT EXISTS public.user_functional_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- 2. Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_functional_roles_user_id ON public.user_functional_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_functional_roles_role_id ON public.user_functional_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- 4. Enable RLS
ALTER TABLE public.user_functional_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for user_functional_roles
CREATE POLICY "Users can view their own role assignments"
  ON public.user_functional_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage role assignments"
  ON public.user_functional_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- 6. RLS Policies for role_permissions
CREATE POLICY "Anyone can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (public.is_admin(auth.uid()));

-- 7. Create has_permission function (security definer) using plpgsql
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user BOOLEAN;
  has_role_perm BOOLEAN;
  has_delegation BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  ) INTO is_admin_user;
  
  IF is_admin_user THEN
    RETURN true;
  END IF;
  
  -- Check via junction tables
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_functional_roles ufr
    JOIN public.role_permissions rp ON ufr.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ufr.user_id = _user_id 
      AND ufr.is_active = true
      AND (ufr.expires_at IS NULL OR ufr.expires_at > now())
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
$$;

-- 8. Create get_user_permissions function using plpgsql
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user BOOLEAN;
  result TEXT[];
BEGIN
  -- Check if admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  ) INTO is_admin_user;
  
  IF is_admin_user THEN
    RETURN ARRAY['*']::TEXT[];
  END IF;
  
  -- Get all permissions
  SELECT COALESCE(array_agg(DISTINCT permission_code), ARRAY[]::TEXT[])
  INTO result
  FROM (
    -- Permissions from functional roles
    SELECT p.code as permission_code
    FROM public.user_functional_roles ufr
    JOIN public.role_permissions rp ON ufr.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ufr.user_id = _user_id 
      AND ufr.is_active = true
      AND (ufr.expires_at IS NULL OR ufr.expires_at > now())
    
    UNION
    
    -- Permissions from delegations
    SELECT unnest(dr.permission_types) as permission_code
    FROM public.delegation_rules dr
    JOIN public.user_profiles up ON up.user_id = _user_id
    WHERE dr.delegate_email = up.user_email
      AND dr.is_active = true
      AND dr.start_date <= now()
      AND dr.end_date >= now()
  ) all_permissions;
  
  RETURN result;
END;
$$;

-- 9. Create get_user_functional_roles function
CREATE OR REPLACE FUNCTION public.get_user_functional_roles(_user_id UUID)
RETURNS TABLE(role_id UUID, role_name TEXT, role_description TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.description
  FROM public.user_functional_roles ufr
  JOIN public.roles r ON ufr.role_id = r.id
  WHERE ufr.user_id = _user_id 
    AND ufr.is_active = true
    AND (ufr.expires_at IS NULL OR ufr.expires_at > now());
END;
$$;