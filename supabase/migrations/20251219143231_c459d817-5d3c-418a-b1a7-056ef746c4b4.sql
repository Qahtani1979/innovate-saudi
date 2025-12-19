
-- =====================================================
-- SOLUTIONS SYSTEM - COMPLETE FIX MIGRATION
-- Fixes: rls-3, rls-4, db-4, fn-3, fn-4, wf-2, audit-1/2/3/6/10/11
-- =====================================================

-- PHASE 1: RLS POLICY FIXES (CRITICAL)
-- =====================================================

-- Drop existing policies without WITH CHECK
DROP POLICY IF EXISTS "Admins can manage all solutions" ON solutions;
DROP POLICY IF EXISTS "Providers can manage own solutions" ON solutions;

-- Recreate admin policy with WITH CHECK
CREATE POLICY "Admins can manage all solutions" ON solutions
FOR ALL USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Recreate provider policy with WITH CHECK
CREATE POLICY "Providers can manage own solutions" ON solutions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND LOWER(r.name) = 'provider'
    AND ur.organization_id = solutions.provider_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND LOWER(r.name) = 'provider'
    AND ur.organization_id = solutions.provider_id
  )
);

-- PHASE 2: PERFORMANCE INDEXES (HIGH)
-- =====================================================

-- Index for workflow_stage filtering
CREATE INDEX IF NOT EXISTS idx_solutions_workflow_stage 
ON solutions(workflow_stage);

-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_solutions_created_at 
ON solutions(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_solutions_published_stage 
ON solutions(is_published, workflow_stage) 
WHERE is_deleted = false;

-- PHASE 3: TRIGGERS & AUDIT FUNCTIONS (HIGH)
-- =====================================================

-- Attach updated_at trigger to solutions table
DROP TRIGGER IF EXISTS update_solutions_updated_at ON solutions;
CREATE TRIGGER update_solutions_updated_at
BEFORE UPDATE ON solutions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create audit logging function for solutions
CREATE OR REPLACE FUNCTION log_solution_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE 
  stage_changed boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO access_logs (action, entity_type, entity_id, new_values, user_email, metadata)
    VALUES ('create', 'solution', NEW.id, to_jsonb(NEW), NEW.created_by, 
      jsonb_build_object('name', NEW.name_en, 'stage', NEW.workflow_stage));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    stage_changed := OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage;
    INSERT INTO access_logs (action, entity_type, entity_id, old_values, new_values, user_email, metadata)
    VALUES (
      CASE WHEN stage_changed THEN 'stage_change' ELSE 'update' END,
      'solution', NEW.id, to_jsonb(OLD), to_jsonb(NEW), 
      COALESCE(NEW.created_by, OLD.created_by),
      jsonb_build_object(
        'name', NEW.name_en, 
        'stage_changed', stage_changed, 
        'old_stage', OLD.workflow_stage, 
        'new_stage', NEW.workflow_stage
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO access_logs (action, entity_type, entity_id, old_values, user_email, metadata)
    VALUES ('delete', 'solution', OLD.id, to_jsonb(OLD), OLD.created_by, 
      jsonb_build_object('name', OLD.name_en, 'stage', OLD.workflow_stage));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach audit trigger to solutions table
DROP TRIGGER IF EXISTS log_solution_changes_trigger ON solutions;
CREATE TRIGGER log_solution_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON solutions
FOR EACH ROW EXECUTE FUNCTION log_solution_changes();

-- PHASE 4: WORKFLOW VALIDATION (HIGH)
-- =====================================================

-- Create workflow stage transition validation function
CREATE OR REPLACE FUNCTION validate_solution_stage_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  valid_transitions jsonb := '{
    "draft": ["submitted", "cancelled"],
    "submitted": ["under_review", "draft", "cancelled"],
    "under_review": ["approved", "rejected", "submitted"],
    "approved": ["published", "under_review"],
    "rejected": ["draft", "archived"],
    "published": ["archived", "approved"],
    "archived": [],
    "cancelled": ["draft", "archived"]
  }'::jsonb;
BEGIN
  IF OLD.workflow_stage IS NOT DISTINCT FROM NEW.workflow_stage THEN 
    RETURN NEW; 
  END IF;
  
  IF NOT ((valid_transitions -> COALESCE(OLD.workflow_stage, 'draft')) ? NEW.workflow_stage) THEN
    RAISE EXCEPTION 'Invalid solution stage transition from "%" to "%"', 
      COALESCE(OLD.workflow_stage, 'draft'), NEW.workflow_stage;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach workflow validation trigger
DROP TRIGGER IF EXISTS validate_solution_stage_transition_trigger ON solutions;
CREATE TRIGGER validate_solution_stage_transition_trigger
BEFORE UPDATE ON solutions
FOR EACH ROW EXECUTE FUNCTION validate_solution_stage_transition();

-- PHASE 5: UTILITY FUNCTIONS (MEDIUM)
-- =====================================================

-- Export logging function
CREATE OR REPLACE FUNCTION log_solution_export(
  p_export_type text, 
  p_filters jsonb, 
  p_user_email text, 
  p_record_count integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN 
  INSERT INTO access_logs (action, entity_type, metadata, user_email) 
  VALUES ('export', 'solution', 
    jsonb_build_object(
      'export_type', p_export_type, 
      'filters', p_filters, 
      'record_count', p_record_count
    ), p_user_email); 
END;
$$;

-- Bulk operation logging function
CREATE OR REPLACE FUNCTION log_solution_bulk_operation(
  p_operation text, 
  p_entity_ids uuid[], 
  p_user_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN 
  INSERT INTO access_logs (action, entity_type, metadata, user_email) 
  VALUES ('bulk_' || p_operation, 'solution', 
    jsonb_build_object(
      'entity_ids', p_entity_ids, 
      'count', array_length(p_entity_ids, 1)
    ), p_user_email); 
END;
$$;

-- Cleanup function for solution audit logs
CREATE OR REPLACE FUNCTION cleanup_old_solution_audit_logs(retention_days integer DEFAULT 365)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM access_logs 
  WHERE entity_type = 'solution' 
  AND created_at < NOW() - (retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
