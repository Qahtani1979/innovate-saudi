
-- =============================================
-- PHASE 4.5: CONVERT ROLE COLUMN AND DROP ENUM
-- =============================================

-- Step 1: Convert role column from enum to TEXT
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE TEXT USING role::TEXT;

-- Step 2: Make role column nullable (it's now deprecated)
ALTER TABLE public.user_roles 
ALTER COLUMN role DROP NOT NULL;

-- Step 3: Add new unique constraint on (user_id, role_id)
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_role_id_key 
ON public.user_roles (user_id, role_id);

-- Step 4: Add deprecation comment
COMMENT ON COLUMN public.user_roles.role IS 
  'DEPRECATED: Legacy enum column converted to TEXT. Use role_id instead.';

-- Step 5: Drop the legacy has_role function that uses enum
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Step 6: Drop the app_role enum type
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Step 7: Drop user_functional_roles table (function now uses user_roles join)
DROP TABLE IF EXISTS public.user_functional_roles CASCADE;
