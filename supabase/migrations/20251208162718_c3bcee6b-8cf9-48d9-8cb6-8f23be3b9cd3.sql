-- Create regions table
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  population INTEGER,
  coordinates JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sectors table
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  code TEXT UNIQUE,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subsectors table
CREATE TABLE IF NOT EXISTS public.subsectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES public.sectors(id),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  code TEXT,
  description_en TEXT,
  description_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES public.sectors(id),
  subsector_id UUID REFERENCES public.subsectors(id),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  code TEXT,
  description_en TEXT,
  description_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create citizen_ideas table
CREATE TABLE IF NOT EXISTS public.citizen_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  status TEXT DEFAULT 'pending',
  votes_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create living_labs table
CREATE TABLE IF NOT EXISTS public.living_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  region_id UUID REFERENCES public.regions(id),
  domain TEXT,
  status TEXT DEFAULT 'active',
  location TEXT,
  coordinates JSONB,
  facilities JSONB,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sandboxes table
CREATE TABLE IF NOT EXISTS public.sandboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  living_lab_id UUID REFERENCES public.living_labs(id),
  domain TEXT,
  status TEXT DEFAULT 'active',
  regulatory_framework JSONB,
  exemptions_granted TEXT[],
  capacity INTEGER,
  current_projects INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create challenge_solution_matches table
CREATE TABLE IF NOT EXISTS public.challenge_solution_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id),
  solution_id UUID REFERENCES public.solutions(id),
  match_score NUMERIC,
  match_type TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  matched_by UUID,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, solution_id)
);

-- Create system_activities table
CREATE TABLE IF NOT EXISTS public.system_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  user_id UUID,
  user_email TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create challenge_activities table
CREATE TABLE IF NOT EXISTS public.challenge_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id),
  activity_type TEXT NOT NULL,
  description TEXT,
  user_id UUID,
  user_email TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  assigned_to UUID,
  assigned_to_email TEXT,
  entity_type TEXT,
  entity_id UUID,
  task_type TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date DATE,
  completed_date TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create rd_calls table
CREATE TABLE IF NOT EXISTS public.rd_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  status TEXT DEFAULT 'draft',
  call_type TEXT,
  focus_areas TEXT[],
  sector_id UUID REFERENCES public.sectors(id),
  budget_total NUMERIC,
  budget_currency TEXT DEFAULT 'SAR',
  application_deadline DATE,
  start_date DATE,
  end_date DATE,
  eligibility_criteria JSONB,
  evaluation_criteria JSONB,
  timeline JSONB,
  challenge_ids UUID[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create rd_proposals table
CREATE TABLE IF NOT EXISTS public.rd_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rd_call_id UUID REFERENCES public.rd_calls(id),
  rd_project_id UUID REFERENCES public.rd_projects(id),
  submitter_id UUID,
  submitter_email TEXT,
  institution_name TEXT,
  status TEXT DEFAULT 'submitted',
  score NUMERIC,
  evaluation_notes TEXT,
  reviewers JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create expert_evaluations table
CREATE TABLE IF NOT EXISTS public.expert_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  evaluator_id UUID,
  evaluator_email TEXT,
  evaluator_name TEXT,
  score NUMERIC,
  criteria_scores JSONB,
  recommendation TEXT,
  comments TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pilot_kpis table
CREATE TABLE IF NOT EXISTS public.pilot_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID REFERENCES public.pilots(id),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  unit TEXT,
  baseline NUMERIC,
  target NUMERIC,
  current_value NUMERIC,
  measurement_frequency TEXT,
  data_source TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pilot_kpi_datapoints table
CREATE TABLE IF NOT EXISTS public.pilot_kpi_datapoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES public.pilot_kpis(id),
  pilot_id UUID REFERENCES public.pilots(id),
  value NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  user_email TEXT UNIQUE,
  full_name TEXT,
  full_name_ar TEXT,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  organization_id UUID,
  municipality_id UUID REFERENCES public.municipalities(id),
  bio TEXT,
  skills TEXT[],
  interests TEXT[],
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB,
  onboarding_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create regulatory_exemptions table
CREATE TABLE IF NOT EXISTS public.regulatory_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  regulation_reference TEXT,
  exemption_type TEXT,
  sector_id UUID REFERENCES public.sectors(id),
  applicable_entity_types TEXT[],
  conditions JSONB,
  status TEXT DEFAULT 'active',
  valid_from DATE,
  valid_until DATE,
  approval_authority TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sandbox_applications table
CREATE TABLE IF NOT EXISTS public.sandbox_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sandbox_id UUID REFERENCES public.sandboxes(id),
  applicant_id UUID,
  applicant_email TEXT,
  organization_name TEXT,
  project_title TEXT,
  project_description TEXT,
  requested_exemptions TEXT[],
  duration_months INTEGER,
  status TEXT DEFAULT 'submitted',
  review_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  type TEXT,
  description_en TEXT,
  description_ar TEXT,
  sector_id UUID REFERENCES public.sectors(id),
  website TEXT,
  logo_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city_id UUID REFERENCES public.cities(id),
  region_id UUID REFERENCES public.regions(id),
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create strategic_plans table
CREATE TABLE IF NOT EXISTS public.strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  start_year INTEGER,
  end_year INTEGER,
  vision_en TEXT,
  vision_ar TEXT,
  pillars JSONB,
  objectives JSONB,
  kpis JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  event_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  location_ar TEXT,
  virtual_link TEXT,
  is_virtual BOOLEAN DEFAULT false,
  municipality_id UUID REFERENCES public.municipalities(id),
  program_id UUID REFERENCES public.programs(id),
  max_participants INTEGER,
  registration_deadline TIMESTAMPTZ,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create knowledge_documents table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  document_type TEXT,
  category TEXT,
  sector_id UUID REFERENCES public.sectors(id),
  file_url TEXT,
  file_type TEXT,
  author TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.living_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_solution_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rd_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rd_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_kpi_datapoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandbox_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access on reference tables
CREATE POLICY "Anyone can view regions" ON public.regions FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view subsectors" ON public.subsectors FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view living labs" ON public.living_labs FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view sandboxes" ON public.sandboxes FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view regulatory exemptions" ON public.regulatory_exemptions FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published knowledge docs" ON public.knowledge_documents FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view strategic plans" ON public.strategic_plans FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view organizations" ON public.organizations FOR SELECT USING (is_active = true);

-- Admin policies for management
CREATE POLICY "Admins can manage regions" ON public.regions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage sectors" ON public.sectors FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage subsectors" ON public.subsectors FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage living labs" ON public.living_labs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage sandboxes" ON public.sandboxes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage challenge matches" ON public.challenge_solution_matches FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage system activities" ON public.system_activities FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage challenge activities" ON public.challenge_activities FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage rd calls" ON public.rd_calls FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage rd proposals" ON public.rd_proposals FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage expert evaluations" ON public.expert_evaluations FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage pilot kpis" ON public.pilot_kpis FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage pilot kpi datapoints" ON public.pilot_kpi_datapoints FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage regulatory exemptions" ON public.regulatory_exemptions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage sandbox applications" ON public.sandbox_applications FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage strategic plans" ON public.strategic_plans FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage knowledge docs" ON public.knowledge_documents FOR ALL USING (is_admin(auth.uid()));

-- User-specific policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid()::text = user_id::text OR auth.email() = user_email);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_id::text OR auth.email() = user_email);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id OR auth.email() = user_email);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id OR auth.email() = user_email);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.email() = user_email);
CREATE POLICY "Admins can manage profiles" ON public.user_profiles FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = assigned_to OR auth.email() = assigned_to_email OR is_admin(auth.uid()));
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = assigned_to OR auth.email() = assigned_to_email OR is_admin(auth.uid()));

-- Citizen ideas policies
CREATE POLICY "Anyone can view published citizen ideas" ON public.citizen_ideas FOR SELECT USING (is_published = true OR status = 'approved');
CREATE POLICY "Users can create citizen ideas" ON public.citizen_ideas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own citizen ideas" ON public.citizen_ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage citizen ideas" ON public.citizen_ideas FOR ALL USING (is_admin(auth.uid()));

-- Published content policies
CREATE POLICY "Anyone can view published rd calls" ON public.rd_calls FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view challenge solution matches" ON public.challenge_solution_matches FOR SELECT USING (true);

-- Add updated_at triggers to all new tables
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subsectors_updated_at BEFORE UPDATE ON public.subsectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_citizen_ideas_updated_at BEFORE UPDATE ON public.citizen_ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_living_labs_updated_at BEFORE UPDATE ON public.living_labs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sandboxes_updated_at BEFORE UPDATE ON public.sandboxes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenge_solution_matches_updated_at BEFORE UPDATE ON public.challenge_solution_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rd_calls_updated_at BEFORE UPDATE ON public.rd_calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rd_proposals_updated_at BEFORE UPDATE ON public.rd_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expert_evaluations_updated_at BEFORE UPDATE ON public.expert_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pilot_kpis_updated_at BEFORE UPDATE ON public.pilot_kpis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_regulatory_exemptions_updated_at BEFORE UPDATE ON public.regulatory_exemptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sandbox_applications_updated_at BEFORE UPDATE ON public.sandbox_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_strategic_plans_updated_at BEFORE UPDATE ON public.strategic_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_documents_updated_at BEFORE UPDATE ON public.knowledge_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();