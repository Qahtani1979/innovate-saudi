-- =====================================================
-- CRITICAL FIX #1: Audit Log Immutability (audit-13)
-- =====================================================

-- Add is_admin_action column for tracking admin actions (audit-15)
ALTER TABLE public.access_logs 
ADD COLUMN IF NOT EXISTS is_admin_action BOOLEAN DEFAULT false;

-- Add old_values and new_values columns for change tracking (audit-3)
ALTER TABLE public.access_logs 
ADD COLUMN IF NOT EXISTS old_values JSONB DEFAULT NULL;

ALTER TABLE public.access_logs 
ADD COLUMN IF NOT EXISTS new_values JSONB DEFAULT NULL;

-- Create function to prevent audit log deletions
CREATE OR REPLACE FUNCTION public.prevent_audit_log_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be deleted for compliance reasons';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to prevent deletions
DROP TRIGGER IF EXISTS protect_audit_logs_delete ON public.access_logs;
CREATE TRIGGER protect_audit_logs_delete
  BEFORE DELETE ON public.access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_deletion();

-- Create function to prevent audit log updates
CREATE OR REPLACE FUNCTION public.prevent_audit_log_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be modified for compliance reasons';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to prevent updates
DROP TRIGGER IF EXISTS protect_audit_logs_update ON public.access_logs;
CREATE TRIGGER protect_audit_logs_update
  BEFORE UPDATE ON public.access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_update();

-- =====================================================
-- CRITICAL FIX #2: Permission/Role Change Logging (audit-9)
-- =====================================================

-- Function to log challenge permission changes
CREATE OR REPLACE FUNCTION public.log_challenge_permission_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log ownership changes
  IF OLD.challenge_owner_email IS DISTINCT FROM NEW.challenge_owner_email THEN
    INSERT INTO public.access_logs (
      user_id, user_email, action, entity_type, entity_id, metadata, is_admin_action
    ) VALUES (
      auth.uid(),
      COALESCE((SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()), 'system'),
      'permission_change',
      'challenge',
      NEW.id,
      jsonb_build_object(
        'change_type', 'ownership_transfer',
        'old_owner', OLD.challenge_owner_email,
        'new_owner', NEW.challenge_owner_email,
        'challenge_title', NEW.title_en
      ),
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() 
          AND ur.is_active = true
          AND LOWER(r.name) = 'admin'
      )
    );
  END IF;
  
  -- Log reviewer assignment changes
  IF OLD.review_assigned_to IS DISTINCT FROM NEW.review_assigned_to THEN
    INSERT INTO public.access_logs (
      user_id, user_email, action, entity_type, entity_id, metadata, is_admin_action
    ) VALUES (
      auth.uid(),
      COALESCE((SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()), 'system'),
      'permission_change',
      'challenge',
      NEW.id,
      jsonb_build_object(
        'change_type', 'reviewer_assignment',
        'old_reviewer', OLD.review_assigned_to,
        'new_reviewer', NEW.review_assigned_to
      ),
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() 
          AND ur.is_active = true
          AND LOWER(r.name) = 'admin'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach permission audit trigger to challenges
DROP TRIGGER IF EXISTS challenge_permission_audit ON public.challenges;
CREATE TRIGGER challenge_permission_audit
  AFTER UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.log_challenge_permission_changes();

-- =====================================================
-- HIGH FIX: Challenge Change Logging with Diff (audit-3)
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_challenge_changes_with_diff()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB := '{}';
  old_values JSONB := '{}';
  new_values JSONB := '{}';
  tracked_fields TEXT[] := ARRAY[
    'title_en', 'title_ar', 'status', 'priority', 
    'sector_id', 'municipality_id', 'is_published',
    'description_en', 'description_ar', 'category'
  ];
  field TEXT;
BEGIN
  FOREACH field IN ARRAY tracked_fields LOOP
    IF to_jsonb(OLD) -> field IS DISTINCT FROM to_jsonb(NEW) -> field THEN
      old_values := old_values || jsonb_build_object(field, to_jsonb(OLD) -> field);
      new_values := new_values || jsonb_build_object(field, to_jsonb(NEW) -> field);
      changes := changes || jsonb_build_object(
        field, jsonb_build_object(
          'old', to_jsonb(OLD) -> field,
          'new', to_jsonb(NEW) -> field
        )
      );
    END IF;
  END LOOP;

  IF changes != '{}' THEN
    INSERT INTO public.access_logs (
      user_id, user_email, action, entity_type, entity_id, 
      metadata, old_values, new_values, is_admin_action
    ) VALUES (
      auth.uid(),
      COALESCE((SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()), 'system'),
      'update',
      'challenge',
      NEW.id,
      jsonb_build_object(
        'changes', changes,
        'updated_at', NEW.updated_at
      ),
      old_values,
      new_values,
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() 
          AND ur.is_active = true
          AND LOWER(r.name) = 'admin'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach change tracking trigger
DROP TRIGGER IF EXISTS challenge_change_audit ON public.challenges;
CREATE TRIGGER challenge_change_audit
  AFTER UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.log_challenge_changes_with_diff();

-- =====================================================
-- HIGH FIX: Auto-flag Admin Actions (audit-15)
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_admin_action_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    NEW.is_admin_action := EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = NEW.user_id 
        AND ur.is_active = true
        AND LOWER(r.name) = 'admin'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS auto_flag_admin_actions ON public.access_logs;
CREATE TRIGGER auto_flag_admin_actions
  BEFORE INSERT ON public.access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_action_flag();

-- =====================================================
-- HIGH FIX: Email Masking Function (sec-2)
-- =====================================================

CREATE OR REPLACE FUNCTION public.mask_email(email TEXT)
RETURNS TEXT AS $$
BEGIN
  IF email IS NULL THEN RETURN NULL; END IF;
  RETURN CONCAT(
    LEFT(SPLIT_PART(email, '@', 1), 2),
    '***@',
    SPLIT_PART(email, '@', 2)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public;

-- Create index for admin action queries
CREATE INDEX IF NOT EXISTS idx_access_logs_admin_actions 
ON public.access_logs(is_admin_action) WHERE is_admin_action = true;

-- Create index for entity type queries
CREATE INDEX IF NOT EXISTS idx_access_logs_entity_type 
ON public.access_logs(entity_type, entity_id);

-- Create index for action queries
CREATE INDEX IF NOT EXISTS idx_access_logs_action 
ON public.access_logs(action);