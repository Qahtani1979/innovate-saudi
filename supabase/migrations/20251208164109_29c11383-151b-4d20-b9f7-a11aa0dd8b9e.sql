-- Create remaining missing tables from legacy entities (batch 4)

-- citizen_pilot_enrollments table
CREATE TABLE IF NOT EXISTS public.citizen_pilot_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID REFERENCES public.pilots(id),
  user_id UUID,
  user_email TEXT,
  enrollment_type TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'enrolled',
  feedback TEXT,
  rating INTEGER,
  participation_notes TEXT,
  withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- demo_requests table
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES public.solutions(id),
  requester_name TEXT,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  organization_name TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  preferred_date DATE,
  preferred_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  feedback TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- solution_interests table
CREATE TABLE IF NOT EXISTS public.solution_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES public.solutions(id),
  user_id UUID,
  user_email TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  interest_type TEXT DEFAULT 'inquiry',
  message TEXT,
  status TEXT DEFAULT 'new',
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- solution_reviews table
CREATE TABLE IF NOT EXISTS public.solution_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES public.solutions(id),
  reviewer_id UUID,
  reviewer_email TEXT,
  reviewer_name TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  rating INTEGER,
  title TEXT,
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  use_case TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- evaluation_templates table
CREATE TABLE IF NOT EXISTS public.evaluation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  entity_type TEXT,
  criteria JSONB,
  scoring_method TEXT,
  max_score NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- startup_verifications table
CREATE TABLE IF NOT EXISTS public.startup_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  verification_type TEXT,
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  documents JSONB,
  verification_status TEXT DEFAULT 'pending',
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- startup_profiles table
CREATE TABLE IF NOT EXISTS public.startup_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  founding_date DATE,
  founders JSONB,
  team_size INTEGER,
  funding_stage TEXT,
  total_funding NUMERIC,
  investors JSONB,
  business_model TEXT,
  target_market TEXT,
  competitive_advantages TEXT,
  traction_metrics JSONB,
  pitch_deck_url TEXT,
  demo_video_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- researcher_profiles table
CREATE TABLE IF NOT EXISTS public.researcher_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  name_ar TEXT,
  name_en TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  department TEXT,
  research_areas TEXT[],
  publications JSONB,
  patents JSONB,
  h_index INTEGER,
  citation_count INTEGER,
  orcid_id TEXT,
  google_scholar_url TEXT,
  researchgate_url TEXT,
  photo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- citizen_feedback table
CREATE TABLE IF NOT EXISTS public.citizen_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID,
  user_email TEXT,
  feedback_type TEXT,
  rating INTEGER,
  feedback_text TEXT,
  category TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted',
  response TEXT,
  responded_by TEXT,
  responded_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- access_logs table
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  session_token TEXT,
  device_info JSONB,
  ip_address TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- platform_configs table
CREATE TABLE IF NOT EXISTS public.platform_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- approval_requests table
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  requester_email TEXT NOT NULL,
  requester_notes TEXT,
  approver_email TEXT,
  approval_status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  sla_due_date TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,
  metadata JSONB,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.citizen_pilot_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage citizen_pilot_enrollments" ON public.citizen_pilot_enrollments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can manage own enrollments" ON public.citizen_pilot_enrollments FOR ALL USING (auth.email() = user_email);

CREATE POLICY "Admins can manage demo_requests" ON public.demo_requests FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can submit demo_requests" ON public.demo_requests FOR INSERT WITH CHECK (auth.email() = requester_email);
CREATE POLICY "Users can view own demo_requests" ON public.demo_requests FOR SELECT USING (auth.email() = requester_email);

CREATE POLICY "Admins can manage solution_interests" ON public.solution_interests FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can manage own interests" ON public.solution_interests FOR ALL USING (auth.email() = user_email);

CREATE POLICY "Admins can manage solution_reviews" ON public.solution_reviews FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published reviews" ON public.solution_reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Users can manage own reviews" ON public.solution_reviews FOR ALL USING (auth.email() = reviewer_email);

CREATE POLICY "Admins can manage evaluation_templates" ON public.evaluation_templates FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view templates" ON public.evaluation_templates FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage startup_verifications" ON public.startup_verifications FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage startup_profiles" ON public.startup_profiles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published startup_profiles" ON public.startup_profiles FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage researcher_profiles" ON public.researcher_profiles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view researcher_profiles" ON public.researcher_profiles FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage citizen_feedback" ON public.citizen_feedback FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can submit feedback" ON public.citizen_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view published feedback" ON public.citizen_feedback FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage access_logs" ON public.access_logs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage user_sessions" ON public.user_sessions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage platform_configs" ON public.platform_configs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage approval_requests" ON public.approval_requests FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own approval_requests" ON public.approval_requests FOR SELECT USING (auth.email() = requester_email);

-- Create updated_at triggers
CREATE TRIGGER update_demo_requests_updated_at BEFORE UPDATE ON public.demo_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solution_reviews_updated_at BEFORE UPDATE ON public.solution_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluation_templates_updated_at BEFORE UPDATE ON public.evaluation_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_startup_verifications_updated_at BEFORE UPDATE ON public.startup_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_startup_profiles_updated_at BEFORE UPDATE ON public.startup_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_researcher_profiles_updated_at BEFORE UPDATE ON public.researcher_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_configs_updated_at BEFORE UPDATE ON public.platform_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON public.approval_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();