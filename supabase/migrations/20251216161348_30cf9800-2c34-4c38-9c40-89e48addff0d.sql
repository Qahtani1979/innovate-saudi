
-- Create lookup tables for strategy planning reference data

-- Strategic Themes
CREATE TABLE public.lookup_strategic_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Emerging Technologies
CREATE TABLE public.lookup_technologies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  category TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vision 2030 Programs
CREATE TABLE public.lookup_vision_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  official_url TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Stakeholder Types
CREATE TABLE public.lookup_stakeholder_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Risk Categories
CREATE TABLE public.lookup_risk_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Governance Roles
CREATE TABLE public.lookup_governance_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lookup_strategic_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_vision_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_stakeholder_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_governance_roles ENABLE ROW LEVEL SECURITY;

-- Public read policies (reference data)
CREATE POLICY "Anyone can view strategic themes" ON public.lookup_strategic_themes FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view technologies" ON public.lookup_technologies FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view vision programs" ON public.lookup_vision_programs FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view stakeholder types" ON public.lookup_stakeholder_types FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view risk categories" ON public.lookup_risk_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view governance roles" ON public.lookup_governance_roles FOR SELECT USING (is_active = true);

-- Admin management policies
CREATE POLICY "Admins can manage strategic themes" ON public.lookup_strategic_themes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage technologies" ON public.lookup_technologies FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage vision programs" ON public.lookup_vision_programs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage stakeholder types" ON public.lookup_stakeholder_types FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage risk categories" ON public.lookup_risk_categories FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage governance roles" ON public.lookup_governance_roles FOR ALL USING (is_admin(auth.uid()));

-- Populate Strategic Themes
INSERT INTO public.lookup_strategic_themes (code, name_en, name_ar, display_order) VALUES
('DIGITAL_TRANSFORMATION', 'Digital Transformation', 'التحول الرقمي', 1),
('SUSTAINABILITY', 'Sustainability & Green', 'الاستدامة والبيئة', 2),
('CITIZEN_EXPERIENCE', 'Citizen Experience', 'تجربة المواطن', 3),
('INNOVATION', 'Innovation & R&D', 'الابتكار والبحث', 4),
('GOVERNANCE', 'Governance & Compliance', 'الحوكمة والامتثال', 5),
('ECONOMIC_ENABLEMENT', 'Economic Enablement', 'التمكين الاقتصادي', 6),
('QUALITY_OF_LIFE', 'Quality of Life', 'جودة الحياة', 7),
('OPERATIONAL_EXCELLENCE', 'Operational Excellence', 'التميز التشغيلي', 8);

-- Populate Emerging Technologies
INSERT INTO public.lookup_technologies (code, name_en, name_ar, category, display_order) VALUES
('AI_ML', 'AI & Machine Learning', 'الذكاء الاصطناعي', 'AI', 1),
('IOT', 'Internet of Things', 'إنترنت الأشياء', 'Connectivity', 2),
('BLOCKCHAIN', 'Blockchain', 'البلوكتشين', 'Data', 3),
('DIGITAL_TWINS', 'Digital Twins', 'التوائم الرقمية', 'Simulation', 4),
('DRONES', 'Drones & UAVs', 'الطائرات المسيرة', 'Robotics', 5),
('5G_6G', '5G/6G Networks', 'شبكات الجيل الخامس', 'Connectivity', 6),
('ROBOTICS', 'Robotics & Automation', 'الروبوتات والأتمتة', 'Robotics', 7),
('AR_VR', 'AR/VR/XR', 'الواقع المعزز والافتراضي', 'Immersive', 8),
('BIM', 'BIM & GIS', 'نمذجة معلومات البناء', 'Design', 9),
('CLEANTECH', 'CleanTech', 'التقنيات النظيفة', 'Sustainability', 10);

-- Populate Vision 2030 Programs
INSERT INTO public.lookup_vision_programs (code, name_en, name_ar, display_order) VALUES
('QUALITY_OF_LIFE', 'Quality of Life Program', 'برنامج جودة الحياة', 1),
('HOUSING', 'Housing Program (Sakani)', 'برنامج الإسكان (سكني)', 2),
('NTP', 'National Transformation Program', 'برنامج التحول الوطني', 3),
('THRIVING_CITIES', 'Thriving Cities', 'المدن المزدهرة', 4),
('FISCAL_BALANCE', 'Fiscal Balance Program', 'برنامج التوازن المالي', 5),
('PRIVATIZATION', 'Privatization Program', 'برنامج التخصيص', 6),
('DARP', 'Digital Government', 'الحكومة الرقمية', 7);

-- Populate Stakeholder Types
INSERT INTO public.lookup_stakeholder_types (code, name_en, name_ar, display_order) VALUES
('INTERNAL', 'Internal', 'داخلي', 1),
('GOVERNMENT', 'Government Entity', 'جهة حكومية', 2),
('PRIVATE', 'Private Sector', 'القطاع الخاص', 3),
('CITIZEN', 'Citizens', 'المواطنون', 4),
('VENDOR', 'Vendors/Suppliers', 'الموردون', 5),
('NGO', 'NGO/Non-profit', 'منظمات غير ربحية', 6),
('ACADEMIA', 'Academia/Research', 'الأكاديميا والبحث', 7),
('MEDIA', 'Media', 'الإعلام', 8);

-- Populate Risk Categories
INSERT INTO public.lookup_risk_categories (code, name_en, name_ar, display_order) VALUES
('STRATEGIC', 'Strategic', 'استراتيجي', 1),
('OPERATIONAL', 'Operational', 'تشغيلي', 2),
('FINANCIAL', 'Financial', 'مالي', 3),
('REGULATORY', 'Regulatory/Compliance', 'تنظيمي/امتثال', 4),
('TECHNOLOGY', 'Technology', 'تقني', 5),
('REPUTATIONAL', 'Reputational', 'سمعة', 6),
('POLITICAL', 'Political', 'سياسي', 7),
('ENVIRONMENTAL', 'Environmental', 'بيئي', 8);

-- Populate Governance Roles
INSERT INTO public.lookup_governance_roles (code, name_en, name_ar, display_order) VALUES
('STEERING_COMMITTEE', 'Steering Committee', 'اللجنة التوجيهية', 1),
('EXECUTIVE_SPONSOR', 'Executive Sponsor', 'الراعي التنفيذي', 2),
('PROGRAM_MANAGER', 'Program Manager', 'مدير البرنامج', 3),
('WORKSTREAM_LEAD', 'Workstream Lead', 'قائد مسار العمل', 4),
('PMO', 'PMO', 'مكتب إدارة المشاريع', 5),
('QUALITY_ASSURANCE', 'Quality Assurance', 'ضمان الجودة', 6),
('CHANGE_BOARD', 'Change Control Board', 'لجنة التحكم بالتغيير', 7);

-- Add display_order to regions table if missing
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update regions display order
UPDATE public.regions SET display_order = 1 WHERE code = 'NATIONAL';
UPDATE public.regions SET display_order = 2 WHERE code = 'RYD';
UPDATE public.regions SET display_order = 3 WHERE code = 'MKH';
UPDATE public.regions SET display_order = 4 WHERE code = 'MDN';
UPDATE public.regions SET display_order = 5 WHERE code = 'EST';
UPDATE public.regions SET display_order = 6 WHERE code = 'ASR';
UPDATE public.regions SET display_order = 7 WHERE code = 'TBK';
UPDATE public.regions SET display_order = 8 WHERE code = 'HAL';
UPDATE public.regions SET display_order = 9 WHERE code = 'NTB';
UPDATE public.regions SET display_order = 10 WHERE code = 'JZN';
UPDATE public.regions SET display_order = 11 WHERE code = 'NJR';
UPDATE public.regions SET display_order = 12 WHERE code = 'BAH';
UPDATE public.regions SET display_order = 13 WHERE code = 'JOF';
UPDATE public.regions SET display_order = 14 WHERE code = 'QSM';
