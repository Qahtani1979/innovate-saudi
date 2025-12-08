-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'municipality_staff', 'provider', 'researcher', 'citizen', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  municipality_id UUID, -- For municipality_staff to restrict to specific municipality
  organization_id UUID, -- For providers linked to specific org
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- MUNICIPALITY TABLE
-- ============================================
CREATE TABLE public.municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  region TEXT NOT NULL,
  region_id UUID,
  city_type TEXT CHECK (city_type IN ('metropolitan', 'major', 'medium', 'small')),
  population INTEGER,
  coordinates JSONB, -- {latitude, longitude}
  logo_url TEXT,
  image_url TEXT,
  banner_url TEXT,
  gallery_urls TEXT[],
  mii_score NUMERIC(5,2) CHECK (mii_score >= 0 AND mii_score <= 100),
  mii_rank INTEGER,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  active_challenges INTEGER DEFAULT 0,
  active_pilots INTEGER DEFAULT 0,
  completed_pilots INTEGER DEFAULT 0,
  strategic_plan_id UUID,
  is_verified BOOLEAN DEFAULT false,
  verification_date DATE,
  is_active BOOLEAN DEFAULT true,
  deactivation_date DATE,
  deactivation_reason TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_date TIMESTAMPTZ,
  deleted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CHALLENGE TABLE
-- ============================================
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  tagline_ar TEXT,
  tagline_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  problem_statement_ar TEXT,
  problem_statement_en TEXT,
  current_situation_ar TEXT,
  current_situation_en TEXT,
  desired_outcome_ar TEXT,
  desired_outcome_en TEXT,
  innovation_framing JSONB, -- hmw_questions, what_if_scenarios, guiding_questions
  embedding FLOAT8[],
  embedding_model TEXT,
  embedding_generated_date TIMESTAMPTZ,
  root_cause_ar TEXT,
  root_cause_en TEXT,
  root_causes TEXT[],
  theme TEXT,
  keywords TEXT[],
  challenge_type TEXT CHECK (challenge_type IN ('service_quality', 'infrastructure', 'efficiency', 'innovation', 'safety', 'environmental', 'digital_transformation', 'other')),
  category TEXT,
  challenge_owner TEXT,
  challenge_owner_email TEXT,
  reviewer TEXT,
  ministry_service TEXT,
  responsible_agency TEXT,
  department TEXT,
  source TEXT,
  strategic_goal TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  processing_date DATE,
  related_questions_count INTEGER DEFAULT 0,
  municipality_id UUID REFERENCES public.municipalities(id),
  city_id UUID,
  region_id UUID,
  coordinates JSONB,
  sector TEXT CHECK (sector IN ('urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety', 'economic_development', 'social_services', 'other')),
  sector_id UUID,
  sub_sector TEXT,
  subsector_id UUID,
  service_id UUID,
  affected_services TEXT[],
  priority TEXT CHECK (priority IN ('tier_1', 'tier_2', 'tier_3', 'tier_4')) DEFAULT 'tier_3',
  severity_score NUMERIC(5,2),
  impact_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  status TEXT CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'in_treatment', 'resolved', 'archived')) DEFAULT 'draft',
  tracks TEXT[],
  affected_population_size INTEGER,
  budget_estimate NUMERIC(15,2),
  timeline_estimate TEXT,
  constraints JSONB,
  is_confidential BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  publishing_approved_by TEXT,
  publishing_approved_date TIMESTAMPTZ,
  strategic_plan_ids TEXT[],
  escalation_level INTEGER DEFAULT 0,
  escalation_date TIMESTAMPTZ,
  sla_due_date DATE,
  citizen_votes_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  affected_population JSONB,
  kpis JSONB,
  stakeholders JSONB,
  data_evidence JSONB,
  ai_summary TEXT,
  ai_suggestions JSONB,
  treatment_plan JSONB,
  lessons_learned JSONB,
  linked_pilot_ids TEXT[],
  linked_rd_ids TEXT[],
  linked_program_ids TEXT[],
  image_url TEXT,
  gallery_urls TEXT[],
  tags TEXT[],
  is_archived BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  submission_date DATE,
  review_assigned_to TEXT,
  review_date DATE,
  approval_date DATE,
  resolution_date DATE,
  archive_date DATE,
  citizen_origin_idea_id UUID,
  is_deleted BOOLEAN DEFAULT false,
  deleted_date TIMESTAMPTZ,
  deleted_by UUID,
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SOLUTION TABLE
-- ============================================
CREATE TABLE public.solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  tagline_ar TEXT,
  tagline_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  embedding FLOAT8[],
  embedding_model TEXT,
  embedding_generated_date TIMESTAMPTZ,
  workflow_stage TEXT CHECK (workflow_stage IN ('draft', 'verification_pending', 'under_review', 'verified', 'rejected', 'published')) DEFAULT 'draft',
  verification_status TEXT CHECK (verification_status IN ('pending', 'in_progress', 'approved', 'rejected', 'revision_requested')) DEFAULT 'pending',
  reviewer_assigned_to TEXT,
  sla_due_date TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,
  submission_date TIMESTAMPTZ,
  verification_date TIMESTAMPTZ,
  publishing_date TIMESTAMPTZ,
  provider_id UUID,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('startup', 'sme', 'corporate', 'university', 'research_center', 'government', 'ngo')),
  source_program_id UUID,
  source_rd_project_id UUID,
  source_idea_id UUID,
  sectors TEXT[],
  categories TEXT[],
  maturity_level TEXT CHECK (maturity_level IN ('concept', 'prototype', 'pilot_ready', 'market_ready', 'proven')),
  trl INTEGER CHECK (trl >= 1 AND trl <= 9),
  trl_assessment JSONB,
  features TEXT[],
  value_proposition TEXT,
  use_cases JSONB,
  technical_specifications JSONB,
  integration_requirements TEXT[],
  pricing_model TEXT,
  pricing_details JSONB,
  deployment_options TEXT[],
  implementation_timeline TEXT,
  support_services JSONB,
  certifications JSONB,
  compliance_certifications JSONB,
  awards JSONB,
  deployments JSONB,
  deployment_count INTEGER DEFAULT 0,
  last_deployed_date DATE,
  deployment_success_rate NUMERIC(5,2),
  success_rate NUMERIC(5,2),
  case_studies JSONB,
  partnerships JSONB,
  contract_template_url TEXT,
  support_contact_email TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  demo_url TEXT,
  demo_video_url TEXT,
  video_url TEXT,
  documentation_url TEXT,
  api_documentation_url TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  brochure_url TEXT,
  ratings JSONB,
  average_rating NUMERIC(3,2),
  total_reviews INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  is_published BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_date TIMESTAMPTZ,
  deleted_by UUID,
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID,
  challenges_discovered TEXT[],
  interests_expressed_count INTEGER DEFAULT 0,
  demos_requested_count INTEGER DEFAULT 0,
  proposals_submitted_count INTEGER DEFAULT 0,
  pilots_won_count INTEGER DEFAULT 0,
  achievement_badges TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PILOT TABLE
-- ============================================
CREATE TABLE public.pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  tagline_ar TEXT,
  tagline_en TEXT,
  challenge_id UUID REFERENCES public.challenges(id) NOT NULL,
  solution_id UUID REFERENCES public.solutions(id),
  municipality_id UUID REFERENCES public.municipalities(id) NOT NULL,
  city_id UUID,
  region_id UUID,
  living_lab_id UUID,
  sandbox_id UUID,
  matchmaker_application_id UUID,
  source_program_id UUID,
  source_rd_project_id UUID,
  sector TEXT NOT NULL CHECK (sector IN ('urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety', 'economic_development', 'social_services', 'other')),
  sub_sector TEXT,
  description_ar TEXT,
  description_en TEXT,
  objective_ar TEXT,
  objective_en TEXT,
  hypothesis TEXT,
  methodology TEXT,
  scope TEXT,
  target_population JSONB,
  stage TEXT CHECK (stage IN ('design', 'approval_pending', 'approved', 'preparation', 'active', 'monitoring', 'evaluation', 'completed', 'scaled', 'terminated', 'on_hold')) DEFAULT 'design',
  timeline JSONB,
  duration_weeks INTEGER,
  trl_start INTEGER CHECK (trl_start >= 1 AND trl_start <= 9),
  trl_current INTEGER CHECK (trl_current >= 1 AND trl_current <= 9),
  trl_target INTEGER CHECK (trl_target >= 1 AND trl_target <= 9),
  budget NUMERIC(15,2),
  budget_currency TEXT DEFAULT 'SAR',
  budget_spent NUMERIC(15,2) DEFAULT 0,
  budget_released NUMERIC(15,2) DEFAULT 0,
  budget_approvals JSONB,
  budget_breakdown JSONB,
  resource_allocation JSONB,
  safety_incidents_count INTEGER DEFAULT 0,
  kpis JSONB,
  team JSONB,
  stakeholders JSONB,
  risks JSONB,
  milestones JSONB,
  public_engagement JSONB,
  media_coverage JSONB,
  pivot_count INTEGER DEFAULT 0,
  pivot_history JSONB,
  gate_approval_history JSONB,
  success_probability NUMERIC(5,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  ai_insights TEXT,
  recommendation TEXT CHECK (recommendation IN ('scale', 'iterate', 'pivot', 'terminate', 'pending')),
  scaling_plan JSONB,
  image_url TEXT,
  gallery_urls TEXT[],
  video_url TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_flagship BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_date TIMESTAMPTZ,
  deleted_by UUID,
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROGRAM TABLE
-- ============================================
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  tagline_ar TEXT,
  tagline_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  program_type TEXT CHECK (program_type IN ('accelerator', 'incubator', 'hackathon', 'challenge', 'fellowship', 'training', 'matchmaker', 'sandbox_wave', 'other')),
  workflow_stage TEXT CHECK (workflow_stage IN ('planning', 'design_complete', 'launch_approval_pending', 'applications_open', 'selection_in_progress', 'active', 'mid_review_pending', 'completion_review_pending', 'completed', 'archived')) DEFAULT 'planning',
  operator_organization_id UUID,
  partner_organizations TEXT[],
  sector_id UUID,
  subsector_id UUID,
  service_focus_ids TEXT[],
  focus_areas TEXT[],
  objectives_ar TEXT,
  objectives_en TEXT,
  strategic_pillar_id UUID,
  strategic_objective_ids TEXT[],
  strategic_plan_ids TEXT[],
  strategic_priority_level TEXT CHECK (strategic_priority_level IN ('tier_1', 'tier_2', 'tier_3', 'tier_4')),
  mii_dimension_targets TEXT[],
  strategic_kpi_contributions JSONB,
  challenge_theme_alignment TEXT[],
  taxonomy_weights JSONB,
  challenge_clusters_inspiration TEXT[],
  idea_themes_inspiration TEXT[],
  solution_types_targeted TEXT[],
  graduate_solutions_produced TEXT[],
  graduate_pilots_launched TEXT[],
  partner_organizations_strategic JSONB,
  municipal_capacity_impact JSONB,
  challenge_submissions_generated INTEGER DEFAULT 0,
  partnership_agreements_formed INTEGER DEFAULT 0,
  eligibility_criteria TEXT[],
  target_participants JSONB,
  municipality_targets TEXT[],
  region_targets TEXT[],
  city_targets TEXT[],
  timeline JSONB,
  budget NUMERIC(15,2),
  budget_currency TEXT DEFAULT 'SAR',
  budget_breakdown JSONB,
  funding_sources JSONB,
  benefits JSONB,
  mentors JSONB,
  curriculum JSONB,
  kpis JSONB,
  success_metrics JSONB,
  current_cohort INTEGER,
  total_cohorts INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  graduates_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  application_url TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  video_url TEXT,
  brochure_url TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_date TIMESTAMPTZ,
  deleted_by UUID,
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RD_PROJECT TABLE
-- ============================================
CREATE TABLE public.rd_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  tagline_ar TEXT,
  tagline_en TEXT,
  abstract_ar TEXT,
  abstract_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  embedding FLOAT8[],
  embedding_model TEXT,
  embedding_generated_date TIMESTAMPTZ,
  research_type TEXT CHECK (research_type IN ('basic', 'applied', 'experimental', 'development')),
  methodology TEXT,
  research_questions TEXT[],
  hypotheses TEXT[],
  workflow_stage TEXT CHECK (workflow_stage IN ('proposal', 'under_review', 'approved', 'in_progress', 'mid_review', 'final_review', 'completed', 'commercializing', 'archived')) DEFAULT 'proposal',
  principal_investigator_id UUID,
  principal_investigator_name TEXT,
  principal_investigator_email TEXT,
  institution_id UUID,
  institution_name TEXT,
  co_investigators JSONB,
  research_team JSONB,
  partner_institutions JSONB,
  challenge_ids TEXT[],
  sector_id UUID,
  subsector_id UUID,
  service_ids TEXT[],
  research_area TEXT,
  keywords TEXT[],
  trl_start INTEGER CHECK (trl_start >= 1 AND trl_start <= 9),
  trl_current INTEGER CHECK (trl_current >= 1 AND trl_current <= 9),
  trl_target INTEGER CHECK (trl_target >= 1 AND trl_target <= 9),
  timeline JSONB,
  start_date DATE,
  end_date DATE,
  duration_months INTEGER,
  budget_requested NUMERIC(15,2),
  budget_approved NUMERIC(15,2),
  budget_spent NUMERIC(15,2) DEFAULT 0,
  budget_currency TEXT DEFAULT 'SAR',
  budget_breakdown JSONB,
  funding_source_id UUID,
  funding_sources JSONB,
  rd_call_id UUID,
  milestones JSONB,
  deliverables JSONB,
  kpis JSONB,
  progress_updates JSONB,
  risks JSONB,
  ethics_approval JSONB,
  data_management_plan TEXT,
  publications JSONB,
  patents JSONB,
  datasets JSONB,
  prototypes JSONB,
  commercialization_potential JSONB,
  industry_partnerships JSONB,
  pilot_opportunities TEXT[],
  solution_id UUID,
  expected_outcomes_ar TEXT,
  expected_outcomes_en TEXT,
  actual_outcomes TEXT,
  impact_assessment JSONB,
  lessons_learned JSONB,
  image_url TEXT,
  gallery_urls TEXT[],
  video_url TEXT,
  documents JSONB,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_confidential BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_date TIMESTAMPTZ,
  deleted_by UUID,
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rd_projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Municipality policies
CREATE POLICY "Anyone can view active municipalities" ON public.municipalities
  FOR SELECT USING (is_active = true AND is_deleted = false);

CREATE POLICY "Admins can manage municipalities" ON public.municipalities
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Municipality staff can update own municipality" ON public.municipalities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'municipality_staff'
      AND municipality_id = municipalities.id
    )
  );

-- Challenge policies
CREATE POLICY "Anyone can view published challenges" ON public.challenges
  FOR SELECT USING (is_published = true AND is_deleted = false);

CREATE POLICY "Admins can manage all challenges" ON public.challenges
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Municipality staff can manage own challenges" ON public.challenges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'municipality_staff'
      AND municipality_id = challenges.municipality_id
    )
  );

-- Solution policies
CREATE POLICY "Anyone can view published solutions" ON public.solutions
  FOR SELECT USING (is_published = true AND is_deleted = false);

CREATE POLICY "Admins can manage all solutions" ON public.solutions
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Providers can manage own solutions" ON public.solutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'provider'
      AND ur.organization_id = solutions.provider_id
    )
  );

-- Pilot policies
CREATE POLICY "Anyone can view published pilots" ON public.pilots
  FOR SELECT USING (is_published = true AND is_deleted = false);

CREATE POLICY "Admins can manage all pilots" ON public.pilots
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Municipality staff can manage own pilots" ON public.pilots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'municipality_staff'
      AND municipality_id = pilots.municipality_id
    )
  );

-- Program policies
CREATE POLICY "Anyone can view published programs" ON public.programs
  FOR SELECT USING (is_published = true AND is_deleted = false);

CREATE POLICY "Admins can manage all programs" ON public.programs
  FOR ALL USING (public.is_admin(auth.uid()));

-- R&D Project policies
CREATE POLICY "Anyone can view published rd_projects" ON public.rd_projects
  FOR SELECT USING (is_published = true AND is_deleted = false AND is_confidential = false);

CREATE POLICY "Admins can manage all rd_projects" ON public.rd_projects
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Researchers can manage own projects" ON public.rd_projects
  FOR ALL USING (
    principal_investigator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'researcher'
    )
  );

-- ============================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_municipalities_updated_at BEFORE UPDATE ON public.municipalities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solutions_updated_at BEFORE UPDATE ON public.solutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pilots_updated_at BEFORE UPDATE ON public.pilots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rd_projects_updated_at BEFORE UPDATE ON public.rd_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_challenges_municipality ON public.challenges(municipality_id);
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenges_sector ON public.challenges(sector);
CREATE INDEX idx_pilots_challenge ON public.pilots(challenge_id);
CREATE INDEX idx_pilots_solution ON public.pilots(solution_id);
CREATE INDEX idx_pilots_municipality ON public.pilots(municipality_id);
CREATE INDEX idx_solutions_provider ON public.solutions(provider_id);
CREATE INDEX idx_rd_projects_institution ON public.rd_projects(institution_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);