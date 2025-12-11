-- Add sector_id and focus_sectors to municipalities table
ALTER TABLE public.municipalities 
ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id),
ADD COLUMN IF NOT EXISTS focus_sectors uuid[] DEFAULT '{}';

-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'deputyship_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'deputyship_staff';

-- Create helper function: Check if municipality is national
CREATE OR REPLACE FUNCTION public.is_national_entity(p_municipality_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM municipalities m
    JOIN regions r ON m.region_id = r.id
    WHERE m.id = p_municipality_id AND r.code = 'NATIONAL'
  );
$$;

-- Create helper function: Get user's visibility scope
CREATE OR REPLACE FUNCTION public.get_user_visibility_scope(p_user_id uuid)
RETURNS TABLE (
  scope_type text,
  municipality_id uuid,
  sector_ids uuid[],
  is_national boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE WHEN r.code = 'NATIONAL' THEN 'sectoral' ELSE 'geographic' END as scope_type,
    ur.municipality_id,
    COALESCE(m.focus_sectors, ARRAY[m.sector_id]::uuid[]) as sector_ids,
    (r.code = 'NATIONAL') as is_national
  FROM user_roles ur
  LEFT JOIN municipalities m ON ur.municipality_id = m.id
  LEFT JOIN regions r ON m.region_id = r.id
  WHERE ur.user_id = p_user_id
  AND ur.municipality_id IS NOT NULL
  LIMIT 1;
$$;

-- Create helper function: Check if user can view entity based on visibility rules
CREATE OR REPLACE FUNCTION public.can_view_entity(
  p_user_id uuid,
  p_entity_municipality_id uuid,
  p_entity_sector_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scope record;
  v_is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN true;
  END IF;
  
  -- Get user's visibility scope
  SELECT * INTO v_scope FROM get_user_visibility_scope(p_user_id);
  
  IF v_scope IS NULL THEN
    RETURN false;
  END IF;
  
  -- If user is national (deputyship), check sector match
  IF v_scope.is_national THEN
    RETURN p_entity_sector_id = ANY(v_scope.sector_ids);
  END IF;
  
  -- If user is geographic (municipality), check own + national
  -- Check if entity is from user's municipality
  IF p_entity_municipality_id = v_scope.municipality_id THEN
    RETURN true;
  END IF;
  
  -- Check if entity is from a national entity
  RETURN is_national_entity(p_entity_municipality_id);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_national_entity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_visibility_scope(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_entity(uuid, uuid, uuid) TO authenticated;