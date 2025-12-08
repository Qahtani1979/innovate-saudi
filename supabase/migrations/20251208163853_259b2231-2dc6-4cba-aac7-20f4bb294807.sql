-- Create missing tables from Base44 entities

-- kpi_references table
CREATE TABLE IF NOT EXISTS public.kpi_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category TEXT,
  measurement_type TEXT,
  unit TEXT,
  sector_id UUID REFERENCES public.sectors(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT NOT NULL,
  tag_type TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- pilot_approvals table
CREATE TABLE IF NOT EXISTS public.pilot_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID REFERENCES public.pilots(id),
  approval_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approver_email TEXT NOT NULL,
  approval_date TIMESTAMPTZ,
  comments TEXT,
  conditions TEXT[],
  sla_due_date TIMESTAMPTZ,
  escalation_triggered BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- pilot_issues table
CREATE TABLE IF NOT EXISTS public.pilot_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID REFERENCES public.pilots(id),
  issue_title TEXT NOT NULL,
  issue_description TEXT,
  issue_category TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  raised_by TEXT,
  assigned_to TEXT,
  resolution TEXT,
  resolved_date TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- pilot_documents table
CREATE TABLE IF NOT EXISTS public.pilot_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID REFERENCES public.pilots(id),
  document_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT,
  is_public BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- trend_entries table
CREATE TABLE IF NOT EXISTS public.trend_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_type TEXT,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  sector_id UUID REFERENCES public.sectors(id),
  source TEXT,
  source_url TEXT,
  relevance_score NUMERIC,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- mii_results table
CREATE TABLE IF NOT EXISTS public.mii_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipality_id UUID REFERENCES public.municipalities(id),
  assessment_year INTEGER NOT NULL,
  overall_score NUMERIC,
  dimension_scores JSONB,
  rank INTEGER,
  previous_rank INTEGER,
  assessment_date DATE,
  assessor_notes TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- global_trends table
CREATE TABLE IF NOT EXISTS public.global_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  trend_type TEXT,
  source TEXT,
  source_url TEXT,
  image_url TEXT,
  relevance_to_saudi TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- case_studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  entity_type TEXT,
  entity_id UUID,
  municipality_id UUID REFERENCES public.municipalities(id),
  sector_id UUID REFERENCES public.sectors(id),
  challenge_description TEXT,
  solution_description TEXT,
  implementation_details TEXT,
  results_achieved TEXT,
  lessons_learned TEXT,
  metrics JSONB,
  image_url TEXT,
  gallery_urls TEXT[],
  video_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- platform_insights table
CREATE TABLE IF NOT EXISTS public.platform_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  period_start DATE,
  period_end DATE,
  generated_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kpi_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mii_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage kpi_references" ON public.kpi_references FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view kpi_references" ON public.kpi_references FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pilot_approvals" ON public.pilot_approvals FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage pilot_issues" ON public.pilot_issues FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage pilot_documents" ON public.pilot_documents FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view public pilot_documents" ON public.pilot_documents FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage trend_entries" ON public.trend_entries FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published trends" ON public.trend_entries FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage mii_results" ON public.mii_results FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published mii_results" ON public.mii_results FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage global_trends" ON public.global_trends FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published global_trends" ON public.global_trends FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage case_studies" ON public.case_studies FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published case_studies" ON public.case_studies FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage platform_insights" ON public.platform_insights FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view published insights" ON public.platform_insights FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.email() = sender_email OR auth.email() = recipient_email);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.email() = sender_email);

-- Create updated_at triggers
CREATE TRIGGER update_kpi_references_updated_at BEFORE UPDATE ON public.kpi_references FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilot_approvals_updated_at BEFORE UPDATE ON public.pilot_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilot_issues_updated_at BEFORE UPDATE ON public.pilot_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trend_entries_updated_at BEFORE UPDATE ON public.trend_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mii_results_updated_at BEFORE UPDATE ON public.mii_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_trends_updated_at BEFORE UPDATE ON public.global_trends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();