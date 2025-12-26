-- Create more missing tables from legacy entities (batch 2)

-- mii_dimensions table
CREATE TABLE IF NOT EXISTS public.mii_dimensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  weight NUMERIC,
  indicators JSONB,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- user_activities table (distinct from system_activities)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  requirements JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  achievement_id UUID REFERENCES public.achievements(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- user_notification_preferences table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  notification_types JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- news_articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  summary_ar TEXT,
  summary_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[],
  image_url TEXT,
  source_url TEXT,
  publish_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- citizen_votes table
CREATE TABLE IF NOT EXISTS public.citizen_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  vote_type TEXT DEFAULT 'upvote',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- role_requests table
CREATE TABLE IF NOT EXISTS public.role_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT NOT NULL,
  requested_role TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  justification TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_date TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  deliverables JSONB,
  dependencies TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- risks table
CREATE TABLE IF NOT EXISTS public.risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  probability TEXT DEFAULT 'medium',
  impact TEXT DEFAULT 'medium',
  risk_score NUMERIC,
  mitigation_strategy TEXT,
  contingency_plan TEXT,
  owner_email TEXT,
  status TEXT DEFAULT 'identified',
  review_date DATE,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- stakeholders table
CREATE TABLE IF NOT EXISTS public.stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  organization TEXT,
  email TEXT,
  phone TEXT,
  influence_level TEXT DEFAULT 'medium',
  interest_level TEXT DEFAULT 'medium',
  engagement_strategy TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  description TEXT,
  vendor_type TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  website TEXT,
  registration_number TEXT,
  tax_number TEXT,
  bank_details JSONB,
  certifications JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mii_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage mii_dimensions" ON public.mii_dimensions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view mii_dimensions" ON public.mii_dimensions FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage user_activities" ON public.user_activities FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage user_achievements" ON public.user_achievements FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Admins can manage notification_prefs" ON public.user_notification_preferences FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can manage own notification_prefs" ON public.user_notification_preferences FOR ALL USING (auth.email() = user_email);

CREATE POLICY "Admins can manage news_articles" ON public.news_articles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published news" ON public.news_articles FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage citizen_votes" ON public.citizen_votes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can vote" ON public.citizen_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view own votes" ON public.citizen_votes FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Admins can manage role_requests" ON public.role_requests FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can submit role_requests" ON public.role_requests FOR INSERT WITH CHECK (auth.email() = user_email);
CREATE POLICY "Users can view own role_requests" ON public.role_requests FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Admins can manage milestones" ON public.milestones FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage risks" ON public.risks FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage stakeholders" ON public.stakeholders FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage vendors" ON public.vendors FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view vendors" ON public.vendors FOR SELECT USING (is_active = true);

-- Create updated_at triggers
CREATE TRIGGER update_mii_dimensions_updated_at BEFORE UPDATE ON public.mii_dimensions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON public.user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_requests_updated_at BEFORE UPDATE ON public.role_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON public.stakeholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();