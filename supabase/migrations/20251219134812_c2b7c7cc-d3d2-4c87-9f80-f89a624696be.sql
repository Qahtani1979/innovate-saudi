-- Fix search_path warnings and add email templates

-- Fix validate_pilot_stage_transition search_path
CREATE OR REPLACE FUNCTION public.validate_pilot_stage_transition()
RETURNS TRIGGER LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public
AS $$
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

-- Fix calculate_pilot_approval_sla search_path
CREATE OR REPLACE FUNCTION public.calculate_pilot_approval_sla()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.entity_type = 'pilot' AND NEW.sla_due_date IS NULL THEN 
    NEW.sla_due_date := NOW() + INTERVAL '14 days'; 
  END IF;
  RETURN NEW;
END;
$$;

-- Insert pilot email templates using correct column names
INSERT INTO email_templates (template_key, category, name_en, name_ar, subject_en, subject_ar, body_en, body_ar, is_html, is_active)
VALUES 
  ('pilot_submitted', 'pilots', 'Pilot Submitted', 'تم تقديم التجربة', 'Pilot Submitted: {{pilot_title}}', 'تم تقديم التجربة: {{pilot_title}}', 'Your pilot "{{pilot_title}}" has been submitted for review.', 'تم تقديم تجربتك "{{pilot_title}}" للمراجعة.', true, true),
  ('pilot_approved', 'pilots', 'Pilot Approved', 'تمت الموافقة على التجربة', 'Pilot Approved: {{pilot_title}}', 'تمت الموافقة: {{pilot_title}}', 'Your pilot "{{pilot_title}}" has been approved.', 'تمت الموافقة على تجربتك "{{pilot_title}}".', true, true),
  ('pilot_rejected', 'pilots', 'Pilot Rejected', 'تم رفض التجربة', 'Pilot Rejected: {{pilot_title}}', 'تم رفض التجربة: {{pilot_title}}', 'Your pilot "{{pilot_title}}" was not approved. Reason: {{rejection_reason}}', 'لم تتم الموافقة على تجربتك "{{pilot_title}}". السبب: {{rejection_reason}}', true, true),
  ('pilot_sla_warning', 'pilots', 'Pilot SLA Warning', 'تحذير SLA للتجربة', 'Pilot SLA Warning: {{pilot_title}}', 'تحذير SLA: {{pilot_title}}', 'Pilot "{{pilot_title}}" is approaching its review deadline.', 'تقترب التجربة "{{pilot_title}}" من الموعد النهائي للمراجعة.', true, true),
  ('pilot_approval_needed', 'pilots', 'Pilot Approval Needed', 'مطلوب موافقة على التجربة', 'Pilot Approval Needed: {{pilot_title}}', 'مطلوب موافقة: {{pilot_title}}', 'A pilot "{{pilot_title}}" requires your review and approval.', 'تحتاج تجربة "{{pilot_title}}" إلى مراجعتك وموافقتك.', true, true)
ON CONFLICT (template_key) DO UPDATE SET 
  subject_en = EXCLUDED.subject_en, 
  body_en = EXCLUDED.body_en,
  is_active = EXCLUDED.is_active;