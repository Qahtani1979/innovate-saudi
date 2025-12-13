
-- Create email_campaigns table for marketing and bulk emails
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  
  -- Audience targeting
  audience_type VARCHAR(50) NOT NULL DEFAULT 'custom', -- all, role, municipality, sector, custom
  audience_filter JSONB, -- { roles: [], municipalities: [], sectors: [], custom_emails: [] }
  
  -- Execution stats
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  
  -- Status and scheduling
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, scheduled, sending, paused, completed, cancelled
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Variables for template
  campaign_variables JSONB,
  
  -- Tracking
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create campaign_recipients table for tracking individual sends
CREATE TABLE public.campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email_log_id UUID REFERENCES public.email_logs(id),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, skipped
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email_queue table for queued/scheduled emails
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key VARCHAR(255),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID,
  variables JSONB,
  language VARCHAR(10) DEFAULT 'en',
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Processing
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, sent, failed
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Source tracking
  source_type VARCHAR(50), -- trigger, campaign, manual
  source_id UUID,
  entity_type VARCHAR(100),
  entity_id UUID,
  triggered_by VARCHAR(255),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Policies for email_campaigns
CREATE POLICY "Admins can manage email_campaigns" ON public.email_campaigns
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users with permission can view campaigns" ON public.email_campaigns
  FOR SELECT USING (has_permission(auth.uid(), 'manage:email_templates'));

-- Policies for campaign_recipients
CREATE POLICY "Admins can manage campaign_recipients" ON public.campaign_recipients
  FOR ALL USING (is_admin(auth.uid()));

-- Policies for email_queue
CREATE POLICY "Admins can manage email_queue" ON public.email_queue
  FOR ALL USING (is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at);
CREATE INDEX idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_status ON public.campaign_recipients(status);
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled_for ON public.email_queue(scheduled_for);
CREATE INDEX idx_email_queue_priority ON public.email_queue(priority);

-- Trigger for updated_at
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger configuration table for unified email triggers
CREATE TABLE public.email_trigger_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_key VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'challenge.approved'
  template_key VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Recipient detection rules
  recipient_query JSONB, -- SQL-like query to find recipients
  recipient_field VARCHAR(255), -- Field path to get recipient email
  additional_recipients_field VARCHAR(255), -- Field for CC recipients
  
  -- Variable mapping
  variable_mapping JSONB, -- Map entity fields to template variables
  
  -- Options
  respect_preferences BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  delay_seconds INTEGER DEFAULT 0, -- Delay before sending
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_trigger_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trigger_config" ON public.email_trigger_config
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active trigger_config" ON public.email_trigger_config
  FOR SELECT USING (is_active = true);

-- Seed initial trigger configurations
INSERT INTO public.email_trigger_config (trigger_key, template_key, recipient_field, variable_mapping) VALUES
  ('auth.signup', 'welcome_new_user', 'email', '{"userName": "full_name", "actionUrl": "dashboard_url"}'),
  ('auth.password_reset', 'password_reset', 'email', '{"userName": "full_name", "resetLink": "reset_url"}'),
  ('challenge.submitted', 'challenge_submitted', 'created_by', '{"userName": "submitter_name", "challengeTitle": "title_en", "challengeCode": "code"}'),
  ('challenge.approved', 'challenge_approved', 'challenge_owner_email', '{"userName": "owner_name", "challengeTitle": "title_en", "challengeCode": "code"}'),
  ('challenge.rejected', 'challenge_rejected', 'challenge_owner_email', '{"userName": "owner_name", "challengeTitle": "title_en", "rejectionReason": "rejection_reason"}'),
  ('pilot.created', 'pilot_created', 'pilot_manager_email', '{"userName": "manager_name", "pilotTitle": "title_en", "pilotCode": "code"}'),
  ('pilot.status_changed', 'pilot_status_change', 'pilot_manager_email', '{"userName": "manager_name", "pilotTitle": "title_en", "newStatus": "status"}'),
  ('solution.verified', 'solution_verified', 'contact_email', '{"userName": "contact_name", "solutionTitle": "title_en"}'),
  ('evaluation.assigned', 'evaluation_assigned', 'evaluator_email', '{"userName": "evaluator_name", "entityTitle": "entity_title", "deadline": "due_date"}'),
  ('role.approved', 'role_request_approved', 'requester_email', '{"userName": "requester_name", "roleName": "role_name"}'),
  ('role.rejected', 'role_request_rejected', 'requester_email', '{"userName": "requester_name", "roleName": "role_name", "rejectionReason": "rejection_reason"}'),
  ('task.assigned', 'task_assigned', 'assigned_to_email', '{"userName": "assignee_name", "taskTitle": "title", "dueDate": "due_date"}'),
  ('contract.expiring', 'contract_expiring', 'contract_parties', '{"contractTitle": "title_en", "expiryDate": "end_date"}'),
  ('event.reminder', 'event_reminder', 'attendee_email', '{"eventTitle": "title_en", "eventDate": "start_date", "eventLocation": "location"}');
