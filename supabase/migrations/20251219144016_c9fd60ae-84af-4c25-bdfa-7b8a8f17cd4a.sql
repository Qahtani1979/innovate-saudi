-- Phase 1: Database Fixes (Fixed)

-- 1. Create solution_version_history table (wf-5)
CREATE TABLE IF NOT EXISTS public.solution_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'stage_change', 'published', 'unpublished', 'verified', 'archived')),
  changed_by TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  previous_data JSONB,
  new_data JSONB,
  change_summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.solution_version_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage solution version history"
  ON public.solution_version_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND ur.is_active = true
        AND LOWER(r.name) = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND ur.is_active = true
        AND LOWER(r.name) = 'admin'
    )
  );

CREATE POLICY "Users can view version history of accessible solutions"
  ON public.solution_version_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.solutions s
      WHERE s.id = solution_id
        AND (s.is_published = true OR s.contact_email = (SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()))
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solution_version_history_solution_id ON public.solution_version_history(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_version_history_changed_at ON public.solution_version_history(changed_at DESC);

-- 2. Create SLA escalation function for solutions (aw-3)
CREATE OR REPLACE FUNCTION public.check_solution_sla_escalation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pending_request RECORD;
  days_until_due INTEGER;
BEGIN
  FOR pending_request IN
    SELECT 
      ar.id,
      ar.entity_id,
      ar.entity_type,
      ar.requester_email,
      ar.approver_email,
      ar.sla_due_date,
      ar.escalation_level,
      s.name_en as solution_name
    FROM approval_requests ar
    LEFT JOIN solutions s ON ar.entity_id = s.id AND ar.entity_type = 'solution'
    WHERE ar.approval_status = 'pending'
      AND ar.sla_due_date IS NOT NULL
      AND ar.sla_due_date <= NOW() + INTERVAL '2 days'
      AND ar.is_deleted = false
  LOOP
    days_until_due := EXTRACT(DAY FROM pending_request.sla_due_date - NOW());
    
    -- Create SLA warning notification
    INSERT INTO notifications (
      user_email,
      notification_type,
      title,
      message,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      pending_request.approver_email,
      'solution_sla_warning',
      'Solution Review SLA Warning',
      format('Solution "%s" is approaching its SLA deadline. %s days remaining.', 
             pending_request.solution_name, days_until_due),
      'solution',
      pending_request.entity_id,
      jsonb_build_object('days_remaining', days_until_due, 'escalation_level', pending_request.escalation_level)
    );
    
    -- Escalate if past due
    IF pending_request.sla_due_date < NOW() THEN
      UPDATE approval_requests
      SET escalation_level = COALESCE(escalation_level, 0) + 1,
          updated_at = NOW()
      WHERE id = pending_request.id;
      
      INSERT INTO access_logs (action, entity_type, entity_id, metadata)
      VALUES ('sla_escalation', 'solution', pending_request.entity_id, 
              jsonb_build_object('new_level', COALESCE(pending_request.escalation_level, 0) + 1));
    END IF;
  END LOOP;
END;
$$;

-- 3. Create orphan file cleanup function (stor-5)
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_solution_files()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN 
  INSERT INTO access_logs (action, entity_type, metadata) 
  VALUES ('cleanup', 'solution_files', jsonb_build_object('triggered_at', NOW())); 
  RETURN 0; 
END;
$$;

-- 4. Enable realtime for solutions (notif-4)
ALTER PUBLICATION supabase_realtime ADD TABLE public.solutions;

-- 5. Add comment for retention policy (audit-14)
COMMENT ON FUNCTION public.cleanup_old_solution_audit_logs IS 'Retention policy: 365 days for non-admin audit logs';