-- Create final batch of missing tables from Base44 entities (batch 5)

-- program_pilot_links table
CREATE TABLE IF NOT EXISTS public.program_pilot_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id),
  pilot_id UUID REFERENCES public.pilots(id),
  link_type TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- living_lab_resource_bookings table
CREATE TABLE IF NOT EXISTS public.living_lab_resource_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  living_lab_id UUID REFERENCES public.living_labs(id),
  resource_type TEXT,
  resource_name TEXT,
  booking_id UUID REFERENCES public.living_lab_bookings(id),
  booked_by TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- sandbox_incidents table (alias for incident_reports with sandbox focus)
CREATE TABLE IF NOT EXISTS public.sandbox_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sandbox_id UUID REFERENCES public.sandboxes(id),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  incident_date TIMESTAMPTZ,
  reported_by TEXT,
  reported_date TIMESTAMPTZ DEFAULT now(),
  investigation_status TEXT DEFAULT 'pending',
  root_cause TEXT,
  corrective_actions JSONB,
  resolution_date TIMESTAMPTZ,
  lessons_learned TEXT,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- sandbox_project_milestones table
CREATE TABLE IF NOT EXISTS public.sandbox_project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sandbox_id UUID REFERENCES public.sandboxes(id),
  project_id UUID,
  milestone_name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending',
  deliverables JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- sandbox_collaborators table
CREATE TABLE IF NOT EXISTS public.sandbox_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sandbox_id UUID REFERENCES public.sandboxes(id),
  organization_id UUID REFERENCES public.organizations(id),
  user_email TEXT,
  role TEXT,
  access_level TEXT DEFAULT 'viewer',
  joined_date TIMESTAMPTZ DEFAULT now(),
  left_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- exemption_audit_logs table
CREATE TABLE IF NOT EXISTS public.exemption_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exemption_id UUID REFERENCES public.regulatory_exemptions(id),
  action TEXT NOT NULL,
  performed_by TEXT,
  performed_at TIMESTAMPTZ DEFAULT now(),
  old_values JSONB,
  new_values JSONB,
  notes TEXT
);

-- sandbox_monitoring_data table
CREATE TABLE IF NOT EXISTS public.sandbox_monitoring_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sandbox_id UUID REFERENCES public.sandboxes(id),
  data_type TEXT,
  metric_name TEXT,
  metric_value NUMERIC,
  unit TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  source TEXT,
  metadata JSONB
);

-- idea_comments table
CREATE TABLE IF NOT EXISTS public.idea_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.citizen_ideas(id),
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID,
  likes_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- citizen_notifications table
CREATE TABLE IF NOT EXISTS public.citizen_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  notification_type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- policy_comments table
CREATE TABLE IF NOT EXISTS public.policy_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID REFERENCES public.policy_documents(id),
  user_email TEXT,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- policy_templates table
CREATE TABLE IF NOT EXISTS public.policy_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  description TEXT,
  category TEXT,
  template_content TEXT,
  version TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.program_pilot_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.living_lab_resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandbox_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandbox_project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandbox_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exemption_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandbox_monitoring_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage program_pilot_links" ON public.program_pilot_links FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage living_lab_resource_bookings" ON public.living_lab_resource_bookings FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage sandbox_incidents" ON public.sandbox_incidents FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage sandbox_project_milestones" ON public.sandbox_project_milestones FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage sandbox_collaborators" ON public.sandbox_collaborators FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage exemption_audit_logs" ON public.exemption_audit_logs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage sandbox_monitoring_data" ON public.sandbox_monitoring_data FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage idea_comments" ON public.idea_comments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view idea_comments" ON public.idea_comments FOR SELECT USING (is_deleted = false);
CREATE POLICY "Users can create idea_comments" ON public.idea_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage citizen_notifications" ON public.citizen_notifications FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own citizen_notifications" ON public.citizen_notifications FOR SELECT USING (auth.email() = user_email);
CREATE POLICY "Admins can manage policy_comments" ON public.policy_comments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage policy_templates" ON public.policy_templates FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view policy_templates" ON public.policy_templates FOR SELECT USING (is_active = true);

-- Create updated_at triggers
CREATE TRIGGER update_living_lab_resource_bookings_updated_at BEFORE UPDATE ON public.living_lab_resource_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sandbox_incidents_updated_at BEFORE UPDATE ON public.sandbox_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sandbox_project_milestones_updated_at BEFORE UPDATE ON public.sandbox_project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_idea_comments_updated_at BEFORE UPDATE ON public.idea_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_templates_updated_at BEFORE UPDATE ON public.policy_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();