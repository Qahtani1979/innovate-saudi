-- Fix Function Search Path Mutable security warning
-- Set search_path on all public functions that don't have it set

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- check_ai_rate_limit - already has search_path if exists, just ensure it's set
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_ai_rate_limit' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.check_ai_rate_limit SET search_path = public';
  END IF;
END
$$;

-- has_permission
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_permission' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.has_permission SET search_path = public';
  END IF;
END
$$;

-- has_role
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_role' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.has_role SET search_path = public';
  END IF;
END
$$;

-- is_admin
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.is_admin SET search_path = public';
  END IF;
END
$$;

-- get_user_permissions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_permissions' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_user_permissions SET search_path = public';
  END IF;
END
$$;

-- get_user_functional_roles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_functional_roles' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_user_functional_roles SET search_path = public';
  END IF;
END
$$;

-- get_user_visibility_scope
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_visibility_scope' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_user_visibility_scope SET search_path = public';
  END IF;
END
$$;

-- can_view_entity
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_view_entity' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.can_view_entity SET search_path = public';
  END IF;
END
$$;

-- can_delete_media
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_delete_media' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.can_delete_media SET search_path = public';
  END IF;
END
$$;

-- create_default_notification_preferences
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_default_notification_preferences' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.create_default_notification_preferences SET search_path = public';
  END IF;
END
$$;

-- delete_media_with_cascade
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_media_with_cascade' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.delete_media_with_cascade SET search_path = public';
  END IF;
END
$$;

-- get_media_usage_count
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_media_usage_count' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_media_usage_count SET search_path = public';
  END IF;
END
$$;

-- increment_media_download
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_media_download' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.increment_media_download SET search_path = public';
  END IF;
END
$$;

-- increment_media_view
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_media_view' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.increment_media_view SET search_path = public';
  END IF;
END
$$;

-- increment_template_usage
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_template_usage' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.increment_template_usage SET search_path = public';
  END IF;
END
$$;

-- is_national_entity
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_national_entity' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.is_national_entity SET search_path = public';
  END IF;
END
$$;

-- rate_template
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rate_template' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.rate_template SET search_path = public';
  END IF;
END
$$;

-- sync_municipality_mii
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'sync_municipality_mii' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.sync_municipality_mii SET search_path = public';
  END IF;
END
$$;

-- update_demand_queue_updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_demand_queue_updated_at' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_demand_queue_updated_at SET search_path = public';
  END IF;
END
$$;

-- update_email_templates_updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_email_templates_updated_at' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_email_templates_updated_at SET search_path = public';
  END IF;
END
$$;

-- update_profile_last_update
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_profile_last_update' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_profile_last_update SET search_path = public';
  END IF;
END
$$;

-- trigger functions for MII
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_mii_recalculation_on_challenge' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.trigger_mii_recalculation_on_challenge SET search_path = public';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_mii_recalculation_on_partnership' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.trigger_mii_recalculation_on_partnership SET search_path = public';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_mii_recalculation_on_pilot' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.trigger_mii_recalculation_on_pilot SET search_path = public';
  END IF;
END
$$;