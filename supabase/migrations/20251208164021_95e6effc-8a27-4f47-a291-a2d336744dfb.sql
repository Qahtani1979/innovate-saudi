-- Create more missing tables from Base44 entities (batch 3)

-- team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id),
  user_id UUID,
  user_email TEXT,
  role TEXT,
  joined_date DATE,
  left_date DATE,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- pilot_collaborations table
CREATE TABLE IF NOT EXISTS public.pilot_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID REFERENCES public.pilots(id),
  organization_id UUID REFERENCES public.organizations(id),
  collaboration_type TEXT,
  role TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  contribution TEXT,
  contact_email TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- organization_partnerships table
CREATE TABLE IF NOT EXISTS public.organization_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  partner_organization_id UUID REFERENCES public.organizations(id),
  partnership_type TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  agreement_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- expert_profiles table
CREATE TABLE IF NOT EXISTS public.expert_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  organization TEXT,
  bio_ar TEXT,
  bio_en TEXT,
  expertise_areas TEXT[],
  sectors TEXT[],
  education JSONB,
  experience JSONB,
  publications JSONB,
  certifications JSONB,
  languages TEXT[],
  linkedin_url TEXT,
  photo_url TEXT,
  availability_status TEXT DEFAULT 'available',
  rating NUMERIC,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- expert_assignments table
CREATE TABLE IF NOT EXISTS public.expert_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID REFERENCES public.expert_profiles(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  assignment_type TEXT,
  assigned_by TEXT,
  assigned_date TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned',
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- challenge_proposals table
CREATE TABLE IF NOT EXISTS public.challenge_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id),
  provider_id UUID REFERENCES public.providers(id),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  proposed_solution TEXT,
  timeline TEXT,
  budget_estimate NUMERIC,
  team_description TEXT,
  attachments TEXT[],
  status TEXT DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  score NUMERIC,
  feedback TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- policy_recommendations table
CREATE TABLE IF NOT EXISTS public.policy_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  source_entity_type TEXT,
  source_entity_id UUID,
  recommendation_type TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'proposed',
  proposed_by TEXT,
  proposed_date TIMESTAMPTZ DEFAULT now(),
  approved_by TEXT,
  approved_date TIMESTAMPTZ,
  implementation_status TEXT,
  impact_assessment TEXT,
  supporting_evidence JSONB,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- challenge_interests table
CREATE TABLE IF NOT EXISTS public.challenge_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id),
  user_id UUID,
  user_email TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  interest_type TEXT DEFAULT 'follow',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- citizen_points table
CREATE TABLE IF NOT EXISTS public.citizen_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_activity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- citizen_badges table
CREATE TABLE IF NOT EXISTS public.citizen_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  badge_type TEXT NOT NULL,
  badge_name TEXT,
  earned_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- innovation_proposals table
CREATE TABLE IF NOT EXISTS public.innovation_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  proposal_type TEXT,
  submitter_id UUID,
  submitter_email TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  sector_id UUID REFERENCES public.sectors(id),
  target_challenges TEXT[],
  proposed_solution TEXT,
  expected_impact TEXT,
  timeline TEXT,
  budget_estimate NUMERIC,
  team_info JSONB,
  attachments TEXT[],
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  score NUMERIC,
  feedback TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_proposals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage team_members" ON public.team_members FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage pilot_collaborations" ON public.pilot_collaborations FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage org_partnerships" ON public.organization_partnerships FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage expert_profiles" ON public.expert_profiles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view expert_profiles" ON public.expert_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage expert_assignments" ON public.expert_assignments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage challenge_proposals" ON public.challenge_proposals FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage policy_recommendations" ON public.policy_recommendations FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published policy_recs" ON public.policy_recommendations FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage challenge_interests" ON public.challenge_interests FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can manage own interests" ON public.challenge_interests FOR ALL USING (auth.email() = user_email);
CREATE POLICY "Admins can manage citizen_points" ON public.citizen_points FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own points" ON public.citizen_points FOR SELECT USING (auth.email() = user_email);
CREATE POLICY "Admins can manage citizen_badges" ON public.citizen_badges FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own badges" ON public.citizen_badges FOR SELECT USING (auth.email() = user_email);
CREATE POLICY "Admins can manage innovation_proposals" ON public.innovation_proposals FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can manage own proposals" ON public.innovation_proposals FOR ALL USING (auth.email() = submitter_email);

-- Create updated_at triggers
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilot_collaborations_updated_at BEFORE UPDATE ON public.pilot_collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_partnerships_updated_at BEFORE UPDATE ON public.organization_partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expert_profiles_updated_at BEFORE UPDATE ON public.expert_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expert_assignments_updated_at BEFORE UPDATE ON public.expert_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_proposals_updated_at BEFORE UPDATE ON public.challenge_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_recommendations_updated_at BEFORE UPDATE ON public.policy_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citizen_points_updated_at BEFORE UPDATE ON public.citizen_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_innovation_proposals_updated_at BEFORE UPDATE ON public.innovation_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();