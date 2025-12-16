
-- =====================================================
-- MoMAH FULL ORGANIZATIONAL TAXONOMY MIGRATION
-- Domain → Deputyship → Sector → Subsector → Service
-- =====================================================

-- 1. CREATE DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CREATE DEPUTYSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.deputyships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ADD DEPUTYSHIP_ID TO SECTORS
ALTER TABLE public.sectors 
ADD COLUMN IF NOT EXISTS deputyship_id UUID REFERENCES public.deputyships(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 4. ADD DISPLAY_ORDER TO SUBSECTORS
ALTER TABLE public.subsectors
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 5. ENABLE RLS ON NEW TABLES
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deputyships ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR DOMAINS
CREATE POLICY "Anyone can view active domains" ON public.domains
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage domains" ON public.domains
  FOR ALL USING (is_admin(auth.uid()));

-- 7. RLS POLICIES FOR DEPUTYSHIPS
CREATE POLICY "Anyone can view active deputyships" ON public.deputyships
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage deputyships" ON public.deputyships
  FOR ALL USING (is_admin(auth.uid()));

-- 8. CLEAR EXISTING TAXONOMY DATA
DELETE FROM public.services;
DELETE FROM public.subsectors;
DELETE FROM public.sectors;

-- =====================================================
-- INSERT DOMAINS (5 Domains)
-- =====================================================
INSERT INTO public.domains (code, name_en, name_ar, description_en, description_ar, icon, display_order) VALUES
('STRATEGIC_ENABLEMENT', 'Strategic Enablement & Privatization', 'التمكين الاستراتيجي والخصخصة', 'Strategic planning, digital transformation, and privatization initiatives', 'التخطيط الاستراتيجي والتحول الرقمي ومبادرات الخصخصة', 'Target', 1),
('MUNICIPAL_SERVICES', 'Municipal Services & Infrastructure', 'الخدمات البلدية والبنية التحتية', 'Land administration, licensing, compliance, and municipal projects', 'إدارة الأراضي والتراخيص والامتثال والمشاريع البلدية', 'Building2', 2),
('HOUSING_DEVELOPMENT', 'Housing & City Development', 'الإسكان وتنمية المدن', 'Housing support, real estate development, and community engagement', 'دعم الإسكان والتطوير العقاري والمشاركة المجتمعية', 'Home', 3),
('SUPPORT_SERVICES', 'Support Services', 'الخدمات المساندة', 'Finance, procurement, internal operations, and records management', 'المالية والمشتريات والعمليات الداخلية وإدارة السجلات', 'Settings', 4),
('MINISTERIAL_CROSSCUTTING', 'Ministerial & Cross-Cutting Functions', 'مكتب الوزير والوظائف المركزية المشتركة', 'Governance, oversight, coordination, performance, and ecosystem management', 'الحوكمة والرقابة والتنسيق والأداء وإدارة المنظومة', 'Crown', 5);

-- =====================================================
-- INSERT DEPUTYSHIPS (17 Deputyships)
-- =====================================================
INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'URBAN_PLANNING_DEP', 'Urban Planning Deputyship', 'وكالة التخطيط العمراني', 'Urban planning policies, master planning, and planning standards', 'سياسات التخطيط العمراني والمخططات الرئيسية ومعايير التخطيط', 1
FROM public.domains d WHERE d.code = 'STRATEGIC_ENABLEMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'INVESTMENT_REVENUE_DEP', 'Investment & Revenue Deputyship', 'وكالة الاستثمار والإيرادات', 'Municipal investment opportunities and public-private partnerships', 'فرص الاستثمار البلدي والشراكات بين القطاعين العام والخاص', 2
FROM public.domains d WHERE d.code = 'STRATEGIC_ENABLEMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'DIGITAL_SMARTCITIES_DEP', 'Digital Transformation & Smart Cities Deputyship', 'وكالة التحول الرقمي والمدن الذكية', 'Digital platforms, smart city enablement, and IoT solutions', 'المنصات الرقمية وتمكين المدن الذكية وحلول إنترنت الأشياء', 3
FROM public.domains d WHERE d.code = 'STRATEGIC_ENABLEMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'HUMAN_CAPABILITY_DEP', 'Human Capability & Institutional Excellence Deputyship', 'وكالة القدرات البشرية والتميز المؤسسي', 'Capacity building and workforce development', 'بناء القدرات وتطوير القوى العاملة', 4
FROM public.domains d WHERE d.code = 'STRATEGIC_ENABLEMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'PRIVATIZATION_CENTER', 'Privatization Center', 'مركز الخصخصة', 'Municipal service privatization under governance frameworks', 'خصخصة الخدمات البلدية ضمن أطر الحوكمة', 5
FROM public.domains d WHERE d.code = 'STRATEGIC_ENABLEMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'LANDS_SURVEY_DEP', 'Lands & Survey Deputyship', 'وكالة الأراضي والمساحة', 'Land administration and geospatial services', 'إدارة الأراضي والخدمات الجيومكانية', 1
FROM public.domains d WHERE d.code = 'MUNICIPAL_SERVICES';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'LICENSING_COMPLIANCE_DEP', 'Licensing & Compliance Deputyship', 'وكالة التراخيص والامتثال', 'Business licensing, building permits, and compliance inspections', 'تراخيص الأعمال وتصاريح البناء وعمليات التفتيش', 2
FROM public.domains d WHERE d.code = 'MUNICIPAL_SERVICES';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'PROJECTS_HEALTH_DEP', 'Projects & Public Health Deputyship', 'وكالة المشاريع والصحة العامة', 'Public health services and municipal infrastructure projects', 'خدمات الصحة العامة ومشاريع البنية التحتية البلدية', 3
FROM public.domains d WHERE d.code = 'MUNICIPAL_SERVICES';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'CITY_OPERATORS_DEP', 'City Operators Regulation Deputyship', 'وكالة تنظيم مشغلي المدن', 'Regulation of city service operators', 'تنظيم مشغلي خدمات المدن', 4
FROM public.domains d WHERE d.code = 'MUNICIPAL_SERVICES';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'HOUSING_SUPPORT_DEP', 'Housing Support Deputyship', 'وكالة دعم الإسكان', 'Housing eligibility and housing products', 'أهلية الإسكان ومنتجات الإسكان', 1
FROM public.domains d WHERE d.code = 'HOUSING_DEVELOPMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'REALESTATE_DEV_DEP', 'Real Estate Development Deputyship', 'وكالة التطوير العقاري', 'Housing project development and real estate regulation', 'تطوير مشاريع الإسكان وتنظيم العقارات', 2
FROM public.domains d WHERE d.code = 'HOUSING_DEVELOPMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'DEVELOPMENTAL_HOUSING_DEP', 'Developmental Housing Deputyship', 'وكالة الإسكان التنموي', 'Social housing for most-in-need segments', 'الإسكان الاجتماعي للفئات الأكثر احتياجاً', 3
FROM public.domains d WHERE d.code = 'HOUSING_DEVELOPMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'COMMUNITY_PARTICIPATION_DEP', 'Community Participation Deputyship', 'وكالة المشاركة المجتمعية', 'Citizen engagement in urban and housing initiatives', 'إشراك المواطنين في مبادرات التخطيط العمراني والإسكان', 4
FROM public.domains d WHERE d.code = 'HOUSING_DEVELOPMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'CUSTOMER_EXPERIENCE_DEP', 'Customer Experience Deputyship', 'وكالة تجربة العميل', 'Housing and municipal complaints and feedback', 'شكاوى وملاحظات الإسكان والبلديات', 5
FROM public.domains d WHERE d.code = 'HOUSING_DEVELOPMENT';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'FINANCE_BUDGET_DEP', 'Finance & Budget Deputyship', 'وكالة المالية والميزانية', 'Budget planning, monitoring, and financial disbursement', 'تخطيط ومراقبة الميزانية والصرف المالي', 1
FROM public.domains d WHERE d.code = 'SUPPORT_SERVICES';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'PROCUREMENT_EFFICIENCY_DEP', 'Procurement & Spending Efficiency Deputyship', 'وكالة المشتريات وكفاءة الإنفاق', 'Government procurement and spending optimization', 'المشتريات الحكومية وتحسين الإنفاق', 2
FROM public.domains d WHERE d.code = 'SUPPORT_SERVICES';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'SUPPORT_OPERATIONS_DEP', 'Support Services Operations Deputyship', 'وكالة عمليات الخدمات المساندة', 'Facilities, logistics, and internal support services', 'المرافق والخدمات اللوجستية والدعم الداخلي', 3
FROM public.domains d WHERE d.code = 'SUPPORT_SERVICES';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'DOCUMENTS_ARCHIVES_CENTER', 'Documents & Archives Center', 'مركز الوثائق والمحفوظات', 'Preservation and management of official records', 'حفظ وإدارة السجلات الرسمية', 4
FROM public.domains d WHERE d.code = 'SUPPORT_SERVICES';

-- Domain 5: Ministerial & Cross-Cutting Functions Deputyships
INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'MINISTER_OFFICE', 'Minister''s Office', 'مكتب الوزير', 'Strategic direction, supervision, and policy alignment', 'التوجيه الاستراتيجي والإشراف ومواءمة السياسات', 1
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'EXECUTIVE_OFFICE', 'Executive Office', 'المكتب التنفيذي', 'Coordination of priorities, initiatives, and executive follow-up', 'تنسيق الأولويات والمبادرات والمتابعة التنفيذية', 2
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'MEDIA_COMMUNICATION_DEPT', 'Media & Corporate Communication Dept.', 'إدارة الإعلام والاتصال المؤسسي', 'Media relations and public communication', 'العلاقات الإعلامية والاتصال العام', 3
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'LEGAL_REGULATORY_DEP', 'Regulations, Legislation & Legal Affairs Deputyship', 'وكالة الأنظمة والتشريعات والشؤون القانونية', 'Drafting regulations and legal consultation', 'صياغة الأنظمة والاستشارات القانونية', 4
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'PERFORMANCE_BENEFITS_CENTER', 'Performance & Benefits Realization Center', 'مركز الأداء وتحقيق المنافع', 'KPI monitoring and benefits tracking', 'مراقبة مؤشرات الأداء وتتبع المنافع', 5
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'INTERNAL_AUDIT_DEP', 'Internal Audit & Controls Deputyship', 'وكالة المراجعة الداخلية والرقابة', 'Internal auditing and control enforcement', 'المراجعة الداخلية وإنفاذ الرقابة', 6
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'DATA_DECISION_CENTER', 'Urban & Housing Data & Decision Support Center', 'مركز البيانات العمرانية والإسكانية ودعم القرار', 'Urban data management and decision intelligence', 'إدارة البيانات العمرانية وذكاء القرار', 7
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'MUNICIPAL_COUNCILS_SECRETARIAT', 'General Secretariat for Municipal Councils Affairs', 'الأمانة العامة لشؤون المجالس البلدية', 'Support and coordination of municipal councils', 'دعم وتنسيق المجالس البلدية', 8
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'PARTNERSHIPS_INTL_DEPT', 'Corporate Partnerships & International Cooperation Dept.', 'إدارة الشراكات المؤسسية والتعاون الدولي', 'Partnerships with public/private entities and international cooperation', 'الشراكات مع الجهات العامة والخاصة والتعاون الدولي', 9
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'REGIONAL_SECRETARIATS', 'Regional Secretariats (Amanat)', 'الأمانات الإقليمية', 'Oversight of municipalities at regional and governorate levels', 'الإشراف على البلديات على المستوى الإقليمي ومستوى المحافظات', 10
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

INSERT INTO public.deputyships (domain_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT d.id, 'MUNICIPAL_COUNCILS', 'Municipal Councils', 'المجالس البلدية', 'Representation of citizens in municipal decision-making', 'تمثيل المواطنين في صنع القرار البلدي', 11
FROM public.domains d WHERE d.code = 'MINISTERIAL_CROSSCUTTING';

-- =====================================================
-- INSERT SECTORS (Linked to Deputyships)
-- =====================================================

-- Domain 1: Strategic Enablement & Privatization
INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'URBAN_PLANNING', 'Urban Planning', 'التخطيط العمراني', 'Urban planning policies and master planning', 'سياسات التخطيط العمراني والمخططات الرئيسية', 'Building2', 1
FROM public.deputyships dep WHERE dep.code = 'URBAN_PLANNING_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'MUNICIPAL_INVESTMENT', 'Municipal Investment', 'الاستثمار البلدي', 'Asset management and partnerships', 'إدارة الأصول والشراكات', 'TrendingUp', 2
FROM public.deputyships dep WHERE dep.code = 'INVESTMENT_REVENUE_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'DIGITAL_TRANSFORMATION', 'Digital Transformation', 'التحول الرقمي', 'Digital platforms like Balady and Sakani', 'المنصات الرقمية مثل بلدي وسكني', 'Laptop', 3
FROM public.deputyships dep WHERE dep.code = 'DIGITAL_SMARTCITIES_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'SMART_CITIES', 'Smart Cities', 'المدن الذكية', 'IoT, analytics, and smart city solutions', 'إنترنت الأشياء والتحليلات وحلول المدن الذكية', 'Cpu', 4
FROM public.deputyships dep WHERE dep.code = 'DIGITAL_SMARTCITIES_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'INSTITUTIONAL_EXCELLENCE', 'Institutional Excellence', 'التميز المؤسسي', 'Human capital and capacity building', 'رأس المال البشري وبناء القدرات', 'Award', 5
FROM public.deputyships dep WHERE dep.code = 'HUMAN_CAPABILITY_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'PRIVATIZATION', 'Privatization', 'الخصخصة', 'Municipal service privatization', 'خصخصة الخدمات البلدية', 'Briefcase', 6
FROM public.deputyships dep WHERE dep.code = 'PRIVATIZATION_CENTER';

-- Domain 2: Municipal Services & Infrastructure
INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'LAND_ADMINISTRATION', 'Land Administration', 'إدارة الأراضي', 'Land use regulation', 'تنظيم استخدام الأراضي', 'Map', 1
FROM public.deputyships dep WHERE dep.code = 'LANDS_SURVEY_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'GEOSPATIAL_SERVICES', 'Geospatial Services', 'الخدمات الجيومكانية', 'Surveying and cadastral services', 'خدمات المساحة والسجل العقاري', 'Globe', 2
FROM public.deputyships dep WHERE dep.code = 'LANDS_SURVEY_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'LICENSING', 'Licensing', 'التراخيص', 'Commercial and construction licensing', 'التراخيص التجارية وتراخيص البناء', 'FileCheck', 3
FROM public.deputyships dep WHERE dep.code = 'LICENSING_COMPLIANCE_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'COMPLIANCE', 'Compliance', 'الامتثال', 'Inspection and enforcement', 'التفتيش والإنفاذ', 'Shield', 4
FROM public.deputyships dep WHERE dep.code = 'LICENSING_COMPLIANCE_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'PUBLIC_HEALTH', 'Public Health', 'الصحة العامة', 'Health and safety services', 'خدمات الصحة والسلامة', 'Heart', 5
FROM public.deputyships dep WHERE dep.code = 'PROJECTS_HEALTH_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'MUNICIPAL_PROJECTS', 'Municipal Projects', 'المشاريع البلدية', 'Roads, public spaces, and infrastructure', 'الطرق والأماكن العامة والبنية التحتية', 'Wrench', 6
FROM public.deputyships dep WHERE dep.code = 'PROJECTS_HEALTH_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'URBAN_OPERATIONS', 'Urban Operations', 'العمليات الحضرية', 'City service operator regulation', 'تنظيم مشغلي خدمات المدن', 'Settings', 7
FROM public.deputyships dep WHERE dep.code = 'CITY_OPERATORS_DEP';

-- Domain 3: Housing & City Development
INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'HOUSING_SUPPORT', 'Housing Support', 'دعم الإسكان', 'Housing eligibility assessment', 'تقييم أهلية الإسكان', 'Home', 1
FROM public.deputyships dep WHERE dep.code = 'HOUSING_SUPPORT_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'HOUSING_PRODUCTS', 'Housing Products', 'منتجات الإسكان', 'Units, land, and financing products', 'الوحدات والأراضي ومنتجات التمويل', 'Package', 2
FROM public.deputyships dep WHERE dep.code = 'HOUSING_SUPPORT_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'REAL_ESTATE_DEVELOPMENT', 'Real Estate Development', 'التطوير العقاري', 'Housing project development', 'تطوير مشاريع الإسكان', 'Building', 3
FROM public.deputyships dep WHERE dep.code = 'REALESTATE_DEV_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'REAL_ESTATE_REGULATION', 'Real Estate Regulation', 'تنظيم العقارات', 'Housing supply and demand regulation', 'تنظيم العرض والطلب السكني', 'Scale', 4
FROM public.deputyships dep WHERE dep.code = 'REALESTATE_DEV_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'DEVELOPMENTAL_HOUSING', 'Developmental Housing', 'الإسكان التنموي', 'Social housing for most-in-need', 'الإسكان الاجتماعي للأكثر احتياجاً', 'Users', 5
FROM public.deputyships dep WHERE dep.code = 'DEVELOPMENTAL_HOUSING_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'COMMUNITY_ENGAGEMENT', 'Community Engagement', 'المشاركة المجتمعية', 'Citizen participation programs', 'برامج مشاركة المواطنين', 'MessageSquare', 6
FROM public.deputyships dep WHERE dep.code = 'COMMUNITY_PARTICIPATION_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'CUSTOMER_EXPERIENCE', 'Customer Experience', 'تجربة العميل', 'Complaints and feedback handling', 'معالجة الشكاوى والملاحظات', 'Smile', 7
FROM public.deputyships dep WHERE dep.code = 'CUSTOMER_EXPERIENCE_DEP';

-- Domain 4: Support Services
INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'FINANCIAL_MANAGEMENT', 'Financial Management', 'الإدارة المالية', 'Budget planning and monitoring', 'تخطيط ومراقبة الميزانية', 'DollarSign', 1
FROM public.deputyships dep WHERE dep.code = 'FINANCE_BUDGET_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'FINANCIAL_OPERATIONS', 'Financial Operations', 'العمليات المالية', 'Financial disbursements', 'الصرف المالي', 'CreditCard', 2
FROM public.deputyships dep WHERE dep.code = 'FINANCE_BUDGET_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'PROCUREMENT', 'Procurement', 'المشتريات', 'Tendering and contracting', 'المناقصات والتعاقد', 'ShoppingCart', 3
FROM public.deputyships dep WHERE dep.code = 'PROCUREMENT_EFFICIENCY_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'SPENDING_EFFICIENCY', 'Spending Efficiency', 'كفاءة الإنفاق', 'Spending optimization', 'تحسين الإنفاق', 'PieChart', 4
FROM public.deputyships dep WHERE dep.code = 'PROCUREMENT_EFFICIENCY_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'INTERNAL_OPERATIONS', 'Internal Operations', 'العمليات الداخلية', 'Facilities and logistics', 'المرافق والخدمات اللوجستية', 'Box', 5
FROM public.deputyships dep WHERE dep.code = 'SUPPORT_OPERATIONS_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'RECORDS_MANAGEMENT', 'Records Management', 'إدارة السجلات', 'Document archiving', 'أرشفة الوثائق', 'Archive', 6
FROM public.deputyships dep WHERE dep.code = 'DOCUMENTS_ARCHIVES_CENTER';

-- Domain 5: Ministerial & Cross-Cutting Functions
INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'MINISTERIAL_GOVERNANCE', 'Ministerial Governance', 'الحوكمة الوزارية', 'Strategic direction and oversight', 'التوجيه الاستراتيجي والإشراف', 'Crown', 1
FROM public.deputyships dep WHERE dep.code = 'MINISTER_OFFICE';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'EXECUTIVE_MANAGEMENT', 'Executive Management', 'الإدارة التنفيذية', 'Executive coordination', 'التنسيق التنفيذي', 'Briefcase', 2
FROM public.deputyships dep WHERE dep.code = 'EXECUTIVE_OFFICE';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'COMMUNICATION_OUTREACH', 'Communication & Outreach', 'الاتصال والتواصل', 'Media and internal communications', 'الإعلام والاتصالات الداخلية', 'Megaphone', 3
FROM public.deputyships dep WHERE dep.code = 'MEDIA_COMMUNICATION_DEPT';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'LEGAL_REGULATORY', 'Legal & Regulatory Affairs', 'الشؤون القانونية والتنظيمية', 'Regulations and legal services', 'الأنظمة والخدمات القانونية', 'Gavel', 4
FROM public.deputyships dep WHERE dep.code = 'LEGAL_REGULATORY_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'PERFORMANCE_MANAGEMENT', 'Performance Management', 'إدارة الأداء', 'KPIs and performance measurement', 'مؤشرات الأداء وقياس الأداء', 'Target', 5
FROM public.deputyships dep WHERE dep.code = 'PERFORMANCE_BENEFITS_CENTER';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'BENEFITS_REALIZATION', 'Benefits Realization', 'تحقيق المنافع', 'Value and benefits tracking', 'تتبع القيمة والمنافع', 'TrendingUp', 6
FROM public.deputyships dep WHERE dep.code = 'PERFORMANCE_BENEFITS_CENTER';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'AUDIT_COMPLIANCE', 'Audit & Compliance', 'المراجعة والامتثال', 'Internal auditing', 'المراجعة الداخلية', 'ClipboardCheck', 7
FROM public.deputyships dep WHERE dep.code = 'INTERNAL_AUDIT_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'CONTROL_FRAMEWORKS', 'Control Frameworks', 'أطر الرقابة', 'Risk and control management', 'إدارة المخاطر والرقابة', 'Lock', 8
FROM public.deputyships dep WHERE dep.code = 'INTERNAL_AUDIT_DEP';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'DATA_ANALYTICS', 'Data & Analytics', 'البيانات والتحليلات', 'Urban data management', 'إدارة البيانات العمرانية', 'Database', 9
FROM public.deputyships dep WHERE dep.code = 'DATA_DECISION_CENTER';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'DECISION_SUPPORT', 'Decision Support', 'دعم القرار', 'Advanced analytics for decisions', 'التحليلات المتقدمة للقرارات', 'Lightbulb', 10
FROM public.deputyships dep WHERE dep.code = 'DATA_DECISION_CENTER';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'MUNICIPAL_GOVERNANCE', 'Municipal Governance', 'الحوكمة البلدية', 'Municipal councils support', 'دعم المجالس البلدية', 'Users', 11
FROM public.deputyships dep WHERE dep.code = 'MUNICIPAL_COUNCILS_SECRETARIAT';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'PARTNERSHIPS', 'Partnerships', 'الشراكات', 'Institutional partnerships', 'الشراكات المؤسسية', 'Handshake', 12
FROM public.deputyships dep WHERE dep.code = 'PARTNERSHIPS_INTL_DEPT';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'INTERNATIONAL_COOPERATION', 'International Cooperation', 'التعاون الدولي', 'Global relations', 'العلاقات الدولية', 'Globe', 13
FROM public.deputyships dep WHERE dep.code = 'PARTNERSHIPS_INTL_DEPT';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'REGIONAL_ADMINISTRATION', 'Regional Administration', 'الإدارة الإقليمية', 'Local governance oversight', 'الإشراف على الحوكمة المحلية', 'MapPin', 14
FROM public.deputyships dep WHERE dep.code = 'REGIONAL_SECRETARIATS';

INSERT INTO public.sectors (deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order)
SELECT dep.id, 'CIVIC_GOVERNANCE', 'Civic Governance', 'الحوكمة المدنية', 'Citizen representation', 'تمثيل المواطنين', 'Vote', 15
FROM public.deputyships dep WHERE dep.code = 'MUNICIPAL_COUNCILS';
