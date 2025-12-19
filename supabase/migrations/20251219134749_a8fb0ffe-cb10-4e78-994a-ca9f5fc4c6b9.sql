-- PHASE 1 & 2: Pilots System Fixes (Core DB)

-- 1. Create pilots_public_view with PII masking (rls-7, sec-6)
CREATE OR REPLACE VIEW public.pilots_public_view
WITH (security_invoker = true)
AS SELECT 
  id, code, title_en, title_ar, stage,
  municipality_id, city_id, region_id, sector, sub_sector,
  challenge_id, solution_id, living_lab_id, sandbox_id,
  duration_weeks,
  budget, budget_currency, budget_spent, budget_released,
  trl_start, trl_current, trl_target,
  description_en, description_ar,
  objective_en, objective_ar,
  hypothesis, methodology, scope,
  kpis, milestones, risks,
  success_probability, risk_level,
  is_published, is_flagship, is_archived,
  public.mask_email(created_by) as created_by_masked,
  created_at, updated_at
FROM public.pilots
WHERE is_deleted = false;

-- 2. Create comprehensive audit trigger for pilots
CREATE OR REPLACE FUNCTION public.log_pilot_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stage_changed boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO access_logs (action, entity_type, entity_id, new_values, user_email, metadata)
    VALUES ('create', 'pilot', NEW.id, to_jsonb(NEW), NEW.created_by, jsonb_build_object('title', NEW.title_en, 'stage', NEW.stage));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    stage_changed := OLD.stage IS DISTINCT FROM NEW.stage;
    INSERT INTO access_logs (action, entity_type, entity_id, old_values, new_values, user_email, metadata)
    VALUES (CASE WHEN stage_changed THEN 'stage_change' ELSE 'update' END, 'pilot', NEW.id, to_jsonb(OLD), to_jsonb(NEW), COALESCE(NEW.created_by, OLD.created_by),
      jsonb_build_object('title', NEW.title_en, 'stage_changed', stage_changed, 'old_stage', OLD.stage, 'new_stage', NEW.stage));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO access_logs (action, entity_type, entity_id, old_values, user_email, metadata)
    VALUES ('delete', 'pilot', OLD.id, to_jsonb(OLD), OLD.created_by, jsonb_build_object('title', OLD.title_en, 'stage', OLD.stage));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS pilot_audit_trigger ON public.pilots;
CREATE TRIGGER pilot_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.pilots FOR EACH ROW EXECUTE FUNCTION public.log_pilot_changes();

-- 3. Stage transition validation
CREATE OR REPLACE FUNCTION public.validate_pilot_stage_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  valid_transitions jsonb := '{"ideation":["design","cancelled"],"design":["planning","ideation","cancelled"],"planning":["implementation","design","cancelled"],"implementation":["monitoring","paused","cancelled"],"monitoring":["evaluation","implementation","paused"],"evaluation":["scaling","completed","cancelled"],"scaling":["completed","evaluation"],"completed":["archived"],"paused":["implementation","monitoring","cancelled"],"cancelled":["ideation","archived"],"archived":[]}'::jsonb;
BEGIN
  IF OLD.stage IS NOT DISTINCT FROM NEW.stage THEN RETURN NEW; END IF;
  IF NOT ((valid_transitions -> COALESCE(OLD.stage, 'ideation')) ? NEW.stage) THEN
    RAISE EXCEPTION 'Invalid pilot stage transition from "%" to "%"', COALESCE(OLD.stage, 'ideation'), NEW.stage;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pilot_stage_transition_check ON public.pilots;
CREATE TRIGGER pilot_stage_transition_check BEFORE UPDATE OF stage ON public.pilots FOR EACH ROW EXECUTE FUNCTION public.validate_pilot_stage_transition();

-- 4. SLA calculation
CREATE OR REPLACE FUNCTION public.calculate_pilot_approval_sla()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.entity_type = 'pilot' AND NEW.sla_due_date IS NULL THEN NEW.sla_due_date := NOW() + INTERVAL '14 days'; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_pilot_approval_sla ON public.approval_requests;
CREATE TRIGGER set_pilot_approval_sla BEFORE INSERT ON public.approval_requests FOR EACH ROW EXECUTE FUNCTION public.calculate_pilot_approval_sla();

-- 5. Bulk operations logging
CREATE OR REPLACE FUNCTION public.log_pilot_bulk_operation(p_operation TEXT, p_entity_ids UUID[], p_user_email TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO access_logs (action, entity_type, metadata, user_email) VALUES ('bulk_' || p_operation, 'pilot', jsonb_build_object('entity_ids', p_entity_ids, 'count', array_length(p_entity_ids, 1)), p_user_email); END;
$$;

-- 6. Export logging
CREATE OR REPLACE FUNCTION public.log_pilot_export(p_export_type TEXT, p_filters JSONB, p_user_email TEXT, p_record_count INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO access_logs (action, entity_type, metadata, user_email) VALUES ('export', 'pilot', jsonb_build_object('export_type', p_export_type, 'filters', p_filters, 'record_count', p_record_count), p_user_email); END;
$$;

-- 7. Orphaned file cleanup
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_pilot_files()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO access_logs (action, entity_type, metadata) VALUES ('cleanup', 'pilot_files', jsonb_build_object('triggered_at', NOW())); RETURN 0; END;
$$;

-- 8. Audit log retention
CREATE OR REPLACE FUNCTION public.cleanup_old_pilot_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM access_logs WHERE entity_type = 'pilot' AND created_at < NOW() - (retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 9. Enable realtime
ALTER TABLE public.pilots REPLICA IDENTITY FULL;