-- Gap aw-3: SLA Escalation scheduled function
CREATE OR REPLACE FUNCTION public.check_pilot_sla_escalation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_request RECORD;
  days_until_due INTEGER;
  escalation_threshold INTEGER := 2; -- Days before due to escalate
BEGIN
  -- Find approval requests approaching SLA deadline
  FOR pending_request IN
    SELECT 
      ar.id,
      ar.entity_id,
      ar.entity_type,
      ar.requester_email,
      ar.approver_email,
      ar.sla_due_date,
      ar.escalation_level,
      p.title_en as pilot_title
    FROM approval_requests ar
    LEFT JOIN pilots p ON ar.entity_id = p.id AND ar.entity_type = 'pilot'
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
      'pilot_sla_warning',
      'Pilot Review SLA Warning',
      format('Pilot "%s" is approaching its SLA deadline. %s days remaining.', 
             pending_request.pilot_title, days_until_due),
      'pilot',
      pending_request.entity_id,
      jsonb_build_object('days_remaining', days_until_due, 'escalation_level', pending_request.escalation_level)
    );
    
    -- Escalate if past due
    IF pending_request.sla_due_date < NOW() THEN
      UPDATE approval_requests
      SET escalation_level = COALESCE(escalation_level, 0) + 1,
          updated_at = NOW()
      WHERE id = pending_request.id;
      
      -- Log escalation
      INSERT INTO access_logs (action, entity_type, entity_id, metadata)
      VALUES ('sla_escalation', 'pilot', pending_request.entity_id, 
              jsonb_build_object('new_level', COALESCE(pending_request.escalation_level, 0) + 1));
    END IF;
  END LOOP;
END;
$$;

-- Gap stor-5: Schedule cleanup function (placeholder - requires pg_cron extension)
-- Note: Actual scheduling requires pg_cron which is not available in all environments
-- This creates the function that can be called manually or via external scheduler
CREATE OR REPLACE FUNCTION public.schedule_pilot_cleanup_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Run orphaned file cleanup
  PERFORM cleanup_orphaned_pilot_files();
  
  -- Run audit log retention
  PERFORM cleanup_old_pilot_audit_logs();
  
  -- Log cleanup execution
  INSERT INTO access_logs (action, entity_type, metadata)
  VALUES ('scheduled_cleanup', 'system', jsonb_build_object('executed_at', NOW()));
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_pilot_sla_escalation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_pilot_cleanup_jobs() TO authenticated;