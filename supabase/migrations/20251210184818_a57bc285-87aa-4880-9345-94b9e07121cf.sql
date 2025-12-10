-- Create lookup tables for departments and specializations
CREATE TABLE public.lookup_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  code TEXT UNIQUE,
  parent_id UUID REFERENCES public.lookup_departments(id),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.lookup_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  code TEXT UNIQUE,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Custom entries submitted by users (pending review)
CREATE TABLE public.custom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('department', 'specialization')),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  submitted_by_email TEXT NOT NULL,
  submitted_by_user_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
  merged_into_id UUID,
  review_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-approval rules per persona type
CREATE TABLE public.auto_approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_type TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('email_domain', 'organization', 'institution', 'always', 'never')),
  rule_value TEXT,
  role_to_assign TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  municipality_id UUID REFERENCES public.municipalities(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(persona_type, rule_type, rule_value, municipality_id)
);

-- Enable RLS
ALTER TABLE public.lookup_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_approval_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies - lookups are public read
CREATE POLICY "Lookup departments are viewable by everyone" ON public.lookup_departments FOR SELECT USING (true);
CREATE POLICY "Lookup specializations are viewable by everyone" ON public.lookup_specializations FOR SELECT USING (true);

-- Custom entries - users can insert their own, admins can manage
CREATE POLICY "Users can submit custom entries" ON public.custom_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own custom entries" ON public.custom_entries FOR SELECT USING (submitted_by_email = current_setting('request.jwt.claims', true)::json->>'email' OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can update custom entries" ON public.custom_entries FOR UPDATE USING (public.is_admin(auth.uid()));

-- Auto-approval rules - admins only for write, service role for read
CREATE POLICY "Auto-approval rules viewable by all" ON public.auto_approval_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage auto-approval rules" ON public.auto_approval_rules FOR ALL USING (public.is_admin(auth.uid()));

-- Insert default departments for MoMAH
INSERT INTO public.lookup_departments (name_en, name_ar, code, display_order) VALUES
('Urban Planning & Development', 'التخطيط والتطوير العمراني', 'URBAN_PLAN', 1),
('Municipal Services', 'الخدمات البلدية', 'MUNI_SVC', 2),
('Environmental Affairs', 'الشؤون البيئية', 'ENV_AFF', 3),
('Infrastructure & Public Works', 'البنية التحتية والأشغال العامة', 'INFRA', 4),
('Digital Transformation', 'التحول الرقمي', 'DIGITAL', 5),
('Innovation & Quality', 'الابتكار والجودة', 'INNOV', 6),
('Finance & Budget', 'المالية والميزانية', 'FINANCE', 7),
('Human Resources', 'الموارد البشرية', 'HR', 8),
('Legal Affairs', 'الشؤون القانونية', 'LEGAL', 9),
('Public Relations & Media', 'العلاقات العامة والإعلام', 'PR_MEDIA', 10),
('Procurement & Contracts', 'المشتريات والعقود', 'PROCURE', 11),
('Project Management Office', 'مكتب إدارة المشاريع', 'PMO', 12),
('Geographic Information Systems', 'نظم المعلومات الجغرافية', 'GIS', 13),
('Building Permits & Inspection', 'رخص البناء والتفتيش', 'PERMITS', 14),
('Transportation & Traffic', 'النقل والمرور', 'TRANSPORT', 15),
('Parks & Recreation', 'الحدائق والترفيه', 'PARKS', 16),
('Waste Management', 'إدارة النفايات', 'WASTE', 17),
('Water & Sanitation', 'المياه والصرف الصحي', 'WATER', 18),
('Investment & Economic Development', 'الاستثمار والتنمية الاقتصادية', 'INVEST', 19),
('Smart City Initiatives', 'مبادرات المدينة الذكية', 'SMART_CITY', 20),
('Other', 'أخرى', 'OTHER', 99);

-- Insert default specializations
INSERT INTO public.lookup_specializations (name_en, name_ar, code, category, display_order) VALUES
('Project Management', 'إدارة المشاريع', 'PROJ_MGMT', 'management', 1),
('Strategic Planning', 'التخطيط الاستراتيجي', 'STRAT_PLAN', 'management', 2),
('Policy Development', 'تطوير السياسات', 'POLICY', 'management', 3),
('Budget & Financial Analysis', 'تحليل الميزانية والمالية', 'FIN_ANALYSIS', 'finance', 4),
('Procurement & Vendor Management', 'المشتريات وإدارة الموردين', 'PROCURE_MGMT', 'operations', 5),
('Data Analysis & Business Intelligence', 'تحليل البيانات وذكاء الأعمال', 'DATA_BI', 'technical', 6),
('Software Development', 'تطوير البرمجيات', 'SW_DEV', 'technical', 7),
('GIS & Spatial Analysis', 'نظم المعلومات الجغرافية والتحليل المكاني', 'GIS_SPATIAL', 'technical', 8),
('Urban & Regional Planning', 'التخطيط العمراني والإقليمي', 'URBAN_REG', 'planning', 9),
('Environmental Impact Assessment', 'تقييم الأثر البيئي', 'ENV_IMPACT', 'environmental', 10),
('Civil Engineering', 'الهندسة المدنية', 'CIVIL_ENG', 'engineering', 11),
('Architecture', 'العمارة', 'ARCH', 'engineering', 12),
('Public Administration', 'الإدارة العامة', 'PUB_ADMIN', 'management', 13),
('Community Engagement', 'التفاعل المجتمعي', 'COMM_ENGAGE', 'social', 14),
('Communication & PR', 'التواصل والعلاقات العامة', 'COMM_PR', 'social', 15),
('Quality Assurance', 'ضمان الجودة', 'QA', 'operations', 16),
('Risk Management', 'إدارة المخاطر', 'RISK_MGMT', 'management', 17),
('Innovation Management', 'إدارة الابتكار', 'INNOV_MGMT', 'management', 18),
('Legal & Compliance', 'الشؤون القانونية والامتثال', 'LEGAL_COMP', 'legal', 19),
('Training & Development', 'التدريب والتطوير', 'TRAIN_DEV', 'hr', 20);

-- Insert default auto-approval rules
INSERT INTO public.auto_approval_rules (persona_type, rule_type, rule_value, role_to_assign, priority) VALUES
('citizen', 'always', NULL, 'citizen', 1),
('viewer', 'always', NULL, 'viewer', 1);