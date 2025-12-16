
-- =====================================================
-- PART 2: SUBSECTORS AND SERVICES
-- =====================================================

-- SUBSECTORS FOR DOMAIN 1: Strategic Enablement
INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'URBAN_POLICIES', 'Urban Policies', 'السياسات العمرانية', 'Urban planning policy development', 'تطوير سياسات التخطيط العمراني', 1
FROM public.sectors s WHERE s.code = 'URBAN_PLANNING';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'MASTER_PLANNING', 'Master Planning', 'التخطيط الرئيسي', 'Regional and city master plans', 'المخططات الرئيسية للمناطق والمدن', 2
FROM public.sectors s WHERE s.code = 'URBAN_PLANNING';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'PLANNING_STANDARDS', 'Planning Standards', 'معايير التخطيط', 'Urban design guidelines and manuals', 'إرشادات وأدلة التصميم العمراني', 3
FROM public.sectors s WHERE s.code = 'URBAN_PLANNING';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'ASSET_MANAGEMENT', 'Asset Management', 'إدارة الأصول', 'Municipal asset management', 'إدارة الأصول البلدية', 1
FROM public.sectors s WHERE s.code = 'MUNICIPAL_INVESTMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'PPP_PARTNERSHIPS', 'Partnerships', 'الشراكات', 'Public-private partnerships', 'الشراكات بين القطاعين العام والخاص', 2
FROM public.sectors s WHERE s.code = 'MUNICIPAL_INVESTMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'DIGITAL_PLATFORMS', 'Digital Platforms', 'المنصات الرقمية', 'Municipal digital platforms', 'المنصات الرقمية البلدية', 1
FROM public.sectors s WHERE s.code = 'DIGITAL_TRANSFORMATION';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'URBAN_DATA', 'Urban Data', 'البيانات العمرانية', 'Smart city data and IoT', 'بيانات المدن الذكية وإنترنت الأشياء', 1
FROM public.sectors s WHERE s.code = 'SMART_CITIES';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'HUMAN_CAPITAL', 'Human Capital', 'رأس المال البشري', 'Workforce training and development', 'تدريب وتطوير القوى العاملة', 1
FROM public.sectors s WHERE s.code = 'INSTITUTIONAL_EXCELLENCE';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'SERVICE_PRIVATIZATION', 'Service Privatization', 'خصخصة الخدمات', 'Transfer of services to private sector', 'نقل الخدمات للقطاع الخاص', 1
FROM public.sectors s WHERE s.code = 'PRIVATIZATION';

-- SUBSECTORS FOR DOMAIN 2: Municipal Services
INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'LAND_USE', 'Land Use', 'استخدام الأراضي', 'Land use regulation', 'تنظيم استخدام الأراضي', 1
FROM public.sectors s WHERE s.code = 'LAND_ADMINISTRATION';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'SURVEYING', 'Surveying', 'المساحة', 'Cadastral and survey services', 'خدمات السجل العقاري والمساحة', 1
FROM public.sectors s WHERE s.code = 'GEOSPATIAL_SERVICES';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'COMMERCIAL_LICENSING', 'Commercial Licensing', 'التراخيص التجارية', 'Business license issuance', 'إصدار التراخيص التجارية', 1
FROM public.sectors s WHERE s.code = 'LICENSING';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'CONSTRUCTION_PERMITS', 'Construction Permits', 'تصاريح البناء', 'Building permit issuance', 'إصدار تصاريح البناء', 2
FROM public.sectors s WHERE s.code = 'LICENSING';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'INSPECTIONS', 'Inspections', 'التفتيش', 'Compliance inspections', 'عمليات التفتيش على الامتثال', 1
FROM public.sectors s WHERE s.code = 'COMPLIANCE';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'HEALTH_SAFETY', 'Health Safety', 'السلامة الصحية', 'Health and safety certificates', 'شهادات الصحة والسلامة', 1
FROM public.sectors s WHERE s.code = 'PUBLIC_HEALTH';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'INFRASTRUCTURE_PROJECTS', 'Infrastructure Projects', 'مشاريع البنية التحتية', 'Roads and public spaces', 'الطرق والأماكن العامة', 1
FROM public.sectors s WHERE s.code = 'MUNICIPAL_PROJECTS';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'SERVICE_OPERATORS', 'Service Operators', 'مشغلو الخدمات', 'City service operator regulation', 'تنظيم مشغلي خدمات المدن', 1
FROM public.sectors s WHERE s.code = 'URBAN_OPERATIONS';

-- SUBSECTORS FOR DOMAIN 3: Housing & City Development
INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'ELIGIBILITY', 'Eligibility', 'الأهلية', 'Housing eligibility assessment', 'تقييم أهلية الإسكان', 1
FROM public.sectors s WHERE s.code = 'HOUSING_SUPPORT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'SUBSIDIZED_HOUSING', 'Subsidized Housing', 'الإسكان المدعوم', 'Units, land, and financing', 'الوحدات والأراضي والتمويل', 1
FROM public.sectors s WHERE s.code = 'HOUSING_PRODUCTS';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'HOUSING_PROJECTS', 'Housing Projects', 'مشاريع الإسكان', 'Residential development', 'التطوير السكني', 1
FROM public.sectors s WHERE s.code = 'REAL_ESTATE_DEVELOPMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'MARKET_ENABLEMENT', 'Market Enablement', 'تمكين السوق', 'Housing supply and demand', 'العرض والطلب السكني', 1
FROM public.sectors s WHERE s.code = 'REAL_ESTATE_REGULATION';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'SOCIAL_HOUSING', 'Social Housing', 'الإسكان الاجتماعي', 'Housing for most-in-need', 'الإسكان للأكثر احتياجاً', 1
FROM public.sectors s WHERE s.code = 'DEVELOPMENTAL_HOUSING';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'PARTICIPATION_PROGRAMS', 'Participation Programs', 'برامج المشاركة', 'Citizen engagement', 'إشراك المواطنين', 1
FROM public.sectors s WHERE s.code = 'COMMUNITY_ENGAGEMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'COMPLAINTS_FEEDBACK', 'Complaints & Feedback', 'الشكاوى والملاحظات', 'Customer care services', 'خدمات رعاية العملاء', 1
FROM public.sectors s WHERE s.code = 'CUSTOMER_EXPERIENCE';

-- SUBSECTORS FOR DOMAIN 4: Support Services
INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'BUDGETING', 'Budgeting', 'الميزانية', 'Budget planning and monitoring', 'تخطيط ومراقبة الميزانية', 1
FROM public.sectors s WHERE s.code = 'FINANCIAL_MANAGEMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'PAYMENTS', 'Payments', 'المدفوعات', 'Financial disbursement', 'الصرف المالي', 1
FROM public.sectors s WHERE s.code = 'FINANCIAL_OPERATIONS';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'CONTRACTING', 'Contracting', 'التعاقد', 'Tendering and contract awards', 'المناقصات وإرساء العقود', 1
FROM public.sectors s WHERE s.code = 'PROCUREMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'COST_REVIEW', 'Cost Review', 'مراجعة التكاليف', 'Spending optimization', 'تحسين الإنفاق', 1
FROM public.sectors s WHERE s.code = 'SPENDING_EFFICIENCY';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'FACILITY_SERVICES', 'Facility Services', 'خدمات المرافق', 'Facilities and logistics', 'المرافق والخدمات اللوجستية', 1
FROM public.sectors s WHERE s.code = 'INTERNAL_OPERATIONS';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'ARCHIVING', 'Archiving', 'الأرشفة', 'Document archiving', 'أرشفة الوثائق', 1
FROM public.sectors s WHERE s.code = 'RECORDS_MANAGEMENT';

-- SUBSECTORS FOR DOMAIN 5: Ministerial & Cross-Cutting
INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'STRATEGIC_DIRECTION', 'Strategic Direction', 'التوجيه الاستراتيجي', 'Ministerial oversight', 'الإشراف الوزاري', 1
FROM public.sectors s WHERE s.code = 'MINISTERIAL_GOVERNANCE';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'COORDINATION', 'Coordination', 'التنسيق', 'Executive coordination', 'التنسيق التنفيذي', 1
FROM public.sectors s WHERE s.code = 'EXECUTIVE_MANAGEMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'MEDIA_RELATIONS', 'Media Relations', 'العلاقات الإعلامية', 'Media management', 'إدارة الإعلام', 1
FROM public.sectors s WHERE s.code = 'COMMUNICATION_OUTREACH';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'INTERNAL_COMMUNICATION', 'Internal Communication', 'الاتصال الداخلي', 'Internal communications', 'الاتصالات الداخلية', 2
FROM public.sectors s WHERE s.code = 'COMMUNICATION_OUTREACH';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'REGULATIONS', 'Regulations', 'الأنظمة', 'Regulatory drafting', 'صياغة الأنظمة', 1
FROM public.sectors s WHERE s.code = 'LEGAL_REGULATORY';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'LEGAL_SERVICES', 'Legal Services', 'الخدمات القانونية', 'Legal advisory', 'الاستشارات القانونية', 2
FROM public.sectors s WHERE s.code = 'LEGAL_REGULATORY';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'KPIS', 'KPIs', 'مؤشرات الأداء', 'Performance measurement', 'قياس الأداء', 1
FROM public.sectors s WHERE s.code = 'PERFORMANCE_MANAGEMENT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'VALUE_TRACKING', 'Value Tracking', 'تتبع القيمة', 'Benefits realization tracking', 'تتبع تحقيق المنافع', 1
FROM public.sectors s WHERE s.code = 'BENEFITS_REALIZATION';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'INTERNAL_AUDIT', 'Internal Audit', 'المراجعة الداخلية', 'Internal audits', 'المراجعات الداخلية', 1
FROM public.sectors s WHERE s.code = 'AUDIT_COMPLIANCE';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'RISK_CONTROLS', 'Risk & Controls', 'المخاطر والرقابة', 'Control enforcement', 'إنفاذ الرقابة', 1
FROM public.sectors s WHERE s.code = 'CONTROL_FRAMEWORKS';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'URBAN_DATA_MGMT', 'Urban Data', 'البيانات العمرانية', 'Urban data management', 'إدارة البيانات العمرانية', 1
FROM public.sectors s WHERE s.code = 'DATA_ANALYTICS';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'ANALYTICS', 'Analytics', 'التحليلات', 'Decision intelligence', 'ذكاء القرار', 1
FROM public.sectors s WHERE s.code = 'DECISION_SUPPORT';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'COUNCILS_AFFAIRS', 'Councils Affairs', 'شؤون المجالس', 'Municipal councils support', 'دعم المجالس البلدية', 1
FROM public.sectors s WHERE s.code = 'MUNICIPAL_GOVERNANCE';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'INSTITUTIONAL_PARTNERSHIPS', 'Institutional Partnerships', 'الشراكات المؤسسية', 'Partnership management', 'إدارة الشراكات', 1
FROM public.sectors s WHERE s.code = 'PARTNERSHIPS';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'GLOBAL_RELATIONS', 'Global Relations', 'العلاقات الدولية', 'International cooperation', 'التعاون الدولي', 1
FROM public.sectors s WHERE s.code = 'INTERNATIONAL_COOPERATION';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'LOCAL_GOVERNANCE', 'Local Governance', 'الحوكمة المحلية', 'Municipal operations oversight', 'الإشراف على العمليات البلدية', 1
FROM public.sectors s WHERE s.code = 'REGIONAL_ADMINISTRATION';

INSERT INTO public.subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, display_order)
SELECT s.id, 'REPRESENTATION', 'Representation', 'التمثيل', 'Municipal representation', 'التمثيل البلدي', 1
FROM public.sectors s WHERE s.code = 'CIVIC_GOVERNANCE';

-- =====================================================
-- INSERT ALL SERVICES
-- =====================================================

-- Domain 1 Services
INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'URBAN_POLICY_DEV', 'Urban Planning Policy Development', 'تطوير سياسات التخطيط العمراني', 'Development and updating of national urban planning policies and frameworks', 'تطوير وتحديث سياسات وأطر التخطيط العمراني الوطنية'
FROM public.subsectors ss WHERE ss.code = 'URBAN_POLICIES';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'MASTER_PLAN_APPROVAL', 'Master Plan Approval', 'اعتماد المخطط الرئيسي', 'Review and approval of regional and city master plans', 'مراجعة واعتماد المخططات الرئيسية للمناطق والمدن'
FROM public.subsectors ss WHERE ss.code = 'MASTER_PLANNING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'URBAN_DESIGN_GUIDELINES', 'Urban Design Guidelines', 'إرشادات التصميم العمراني', 'Issuance of urban design and planning manuals', 'إصدار أدلة التصميم والتخطيط العمراني'
FROM public.subsectors ss WHERE ss.code = 'PLANNING_STANDARDS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'INVESTMENT_OPPORTUNITIES', 'Municipal Investment Opportunities', 'فرص الاستثمار البلدي', 'Identification and offering of municipal assets for investment', 'تحديد وعرض الأصول البلدية للاستثمار'
FROM public.subsectors ss WHERE ss.code = 'ASSET_MANAGEMENT';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'PPP_STRUCTURING', 'PPP Structuring', 'هيكلة الشراكات', 'Structuring public-private partnership models', 'هيكلة نماذج الشراكة بين القطاعين العام والخاص'
FROM public.subsectors ss WHERE ss.code = 'PPP_PARTNERSHIPS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'MUNICIPAL_DIGITAL_PLATFORMS', 'Municipal Digital Platforms', 'المنصات الرقمية البلدية', 'Development and operation of platforms such as Balady and Sakani', 'تطوير وتشغيل منصات مثل بلدي وسكني'
FROM public.subsectors ss WHERE ss.code = 'DIGITAL_PLATFORMS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'SMART_CITY_ENABLEMENT', 'Smart City Enablement', 'تمكين المدن الذكية', 'Enablement of IoT, analytics, and smart city solutions', 'تمكين إنترنت الأشياء والتحليلات وحلول المدن الذكية'
FROM public.subsectors ss WHERE ss.code = 'URBAN_DATA';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'CAPACITY_BUILDING', 'Capacity Building Programs', 'برامج بناء القدرات', 'Training and development programs for municipal workforce', 'برامج التدريب والتطوير للقوى العاملة البلدية'
FROM public.subsectors ss WHERE ss.code = 'HUMAN_CAPITAL';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'SERVICE_PRIVATIZATION_SVC', 'Municipal Service Privatization', 'خصخصة الخدمات البلدية', 'Transfer of municipal service operations to private sector under governance frameworks', 'نقل عمليات الخدمات البلدية للقطاع الخاص ضمن أطر الحوكمة'
FROM public.subsectors ss WHERE ss.code = 'SERVICE_PRIVATIZATION';

-- Domain 2 Services
INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'LAND_USE_REGULATION', 'Land Use Regulation', 'تنظيم استخدام الأراضي', 'Regulation and modification of land uses', 'تنظيم وتعديل استخدامات الأراضي'
FROM public.subsectors ss WHERE ss.code = 'LAND_USE';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'SURVEYING_SERVICES', 'Surveying Services', 'خدمات المساحة', 'Issuance of cadastral and survey maps', 'إصدار خرائط السجل العقاري والمساحة'
FROM public.subsectors ss WHERE ss.code = 'SURVEYING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'BUSINESS_LICENSE', 'Business License Issuance', 'إصدار الرخصة التجارية', 'Issuance and renewal of municipal business licenses', 'إصدار وتجديد التراخيص التجارية البلدية'
FROM public.subsectors ss WHERE ss.code = 'COMMERCIAL_LICENSING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'BUILDING_PERMIT', 'Building Permit Issuance', 'إصدار رخصة البناء', 'Issuance of construction and modification permits', 'إصدار تصاريح البناء والتعديل'
FROM public.subsectors ss WHERE ss.code = 'CONSTRUCTION_PERMITS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'COMPLIANCE_INSPECTIONS', 'Compliance Inspections', 'عمليات تفتيش الامتثال', 'Inspection and enforcement on licensed entities', 'التفتيش والإنفاذ على الجهات المرخصة'
FROM public.subsectors ss WHERE ss.code = 'INSPECTIONS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'HEALTH_CERTIFICATES', 'Health Certificates', 'الشهادات الصحية', 'Issuance of health and safety certificates', 'إصدار شهادات الصحة والسلامة'
FROM public.subsectors ss WHERE ss.code = 'HEALTH_SAFETY';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'PROJECT_EXECUTION', 'Municipal Project Execution', 'تنفيذ المشاريع البلدية', 'Execution of roads, public spaces, and municipal infrastructure', 'تنفيذ الطرق والأماكن العامة والبنية التحتية البلدية'
FROM public.subsectors ss WHERE ss.code = 'INFRASTRUCTURE_PROJECTS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'OPERATOR_REGULATION', 'Operator Regulation', 'تنظيم المشغلين', 'Regulation of city service operators (cleaning, O&M, etc.)', 'تنظيم مشغلي خدمات المدن (النظافة والتشغيل والصيانة وغيرها)'
FROM public.subsectors ss WHERE ss.code = 'SERVICE_OPERATORS';

-- Domain 3 Services
INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'ELIGIBILITY_ASSESSMENT', 'Housing Eligibility Assessment', 'تقييم أهلية الإسكان', 'Determination of housing support eligibility', 'تحديد أهلية الدعم السكني'
FROM public.subsectors ss WHERE ss.code = 'ELIGIBILITY';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'HOUSING_PRODUCTS_SVC', 'Housing Product Provision', 'توفير منتجات الإسكان', 'Provision of units, land, and financing products', 'توفير الوحدات والأراضي ومنتجات التمويل'
FROM public.subsectors ss WHERE ss.code = 'SUBSIDIZED_HOUSING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'HOUSING_PROJECT_DEV', 'Housing Project Development', 'تطوير مشاريع الإسكان', 'Development of residential communities and districts', 'تطوير المجتمعات والأحياء السكنية'
FROM public.subsectors ss WHERE ss.code = 'HOUSING_PROJECTS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'MARKET_REGULATION', 'Real Estate Market Regulation', 'تنظيم السوق العقاري', 'Regulation and enablement of housing supply and demand', 'تنظيم وتمكين العرض والطلب السكني'
FROM public.subsectors ss WHERE ss.code = 'MARKET_ENABLEMENT';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'DEVELOPMENTAL_HOUSING_SVC', 'Developmental Housing Programs', 'برامج الإسكان التنموي', 'Housing support for most-in-need segments', 'دعم الإسكان للفئات الأكثر احتياجاً'
FROM public.subsectors ss WHERE ss.code = 'SOCIAL_HOUSING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'COMMUNITY_PARTICIPATION_SVC', 'Community Participation Programs', 'برامج المشاركة المجتمعية', 'Engagement of citizens in urban and housing initiatives', 'إشراك المواطنين في مبادرات التخطيط العمراني والإسكان'
FROM public.subsectors ss WHERE ss.code = 'PARTICIPATION_PROGRAMS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'CUSTOMER_CARE', 'Customer Care Services', 'خدمات رعاية العملاء', 'Handling housing and municipal complaints and feedback', 'معالجة شكاوى وملاحظات الإسكان والبلديات'
FROM public.subsectors ss WHERE ss.code = 'COMPLAINTS_FEEDBACK';

-- Domain 4 Services
INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'BUDGET_PLANNING', 'Budget Planning & Monitoring', 'تخطيط ومراقبة الميزانية', 'Preparation and monitoring of ministry budgets', 'إعداد ومراقبة ميزانيات الوزارة'
FROM public.subsectors ss WHERE ss.code = 'BUDGETING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'FINANCIAL_DISBURSEMENT', 'Financial Disbursement', 'الصرف المالي', 'Execution of financial disbursements', 'تنفيذ المصروفات المالية'
FROM public.subsectors ss WHERE ss.code = 'PAYMENTS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'GOVERNMENT_PROCUREMENT', 'Government Procurement', 'المشتريات الحكومية', 'Tendering and contract award processes', 'عمليات المناقصات وإرساء العقود'
FROM public.subsectors ss WHERE ss.code = 'CONTRACTING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'SPENDING_REVIEW', 'Spending Efficiency Review', 'مراجعة كفاءة الإنفاق', 'Review and optimization of government spending', 'مراجعة وتحسين الإنفاق الحكومي'
FROM public.subsectors ss WHERE ss.code = 'COST_REVIEW';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'OPERATIONAL_SUPPORT', 'Operational Support Services', 'خدمات الدعم التشغيلي', 'Facilities, logistics, and internal support services', 'خدمات المرافق والخدمات اللوجستية والدعم الداخلي'
FROM public.subsectors ss WHERE ss.code = 'FACILITY_SERVICES';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'DOCUMENT_ARCHIVING', 'Document Archiving', 'أرشفة الوثائق', 'Preservation and management of official records', 'حفظ وإدارة السجلات الرسمية'
FROM public.subsectors ss WHERE ss.code = 'ARCHIVING';

-- Domain 5 Services
INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'MINISTERIAL_OVERSIGHT', 'Ministerial Oversight', 'الإشراف الوزاري', 'Overall strategic direction, supervision, and policy alignment of the Ministry', 'التوجيه الاستراتيجي العام والإشراف ومواءمة سياسات الوزارة'
FROM public.subsectors ss WHERE ss.code = 'STRATEGIC_DIRECTION';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'EXECUTIVE_COORDINATION', 'Executive Coordination', 'التنسيق التنفيذي', 'Coordination of priorities, initiatives, and executive follow-up', 'تنسيق الأولويات والمبادرات والمتابعة التنفيذية'
FROM public.subsectors ss WHERE ss.code = 'COORDINATION';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'MEDIA_MANAGEMENT', 'Media Management', 'إدارة الإعلام', 'Management of media relations and public communication', 'إدارة العلاقات الإعلامية والاتصال العام'
FROM public.subsectors ss WHERE ss.code = 'MEDIA_RELATIONS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'INTERNAL_COMMS', 'Internal Communications', 'الاتصالات الداخلية', 'Internal messaging and organizational alignment', 'الرسائل الداخلية والتوافق التنظيمي'
FROM public.subsectors ss WHERE ss.code = 'INTERNAL_COMMUNICATION';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'REGULATORY_DRAFTING', 'Regulatory Drafting', 'صياغة الأنظمة', 'Drafting and updating laws, bylaws, and regulations', 'صياغة وتحديث القوانين واللوائح والأنظمة'
FROM public.subsectors ss WHERE ss.code = 'REGULATIONS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'LEGAL_ADVISORY', 'Legal Advisory', 'الاستشارات القانونية', 'Legal consultation and representation', 'الاستشارات والتمثيل القانوني'
FROM public.subsectors ss WHERE ss.code = 'LEGAL_SERVICES';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'PERFORMANCE_MEASUREMENT', 'Performance Measurement', 'قياس الأداء', 'Definition and monitoring of strategic and operational KPIs', 'تحديد ومراقبة مؤشرات الأداء الاستراتيجية والتشغيلية'
FROM public.subsectors ss WHERE ss.code = 'KPIS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'BENEFITS_TRACKING', 'Benefits Realization Tracking', 'تتبع تحقيق المنافع', 'Tracking realization of strategic and economic benefits', 'تتبع تحقيق المنافع الاستراتيجية والاقتصادية'
FROM public.subsectors ss WHERE ss.code = 'VALUE_TRACKING';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'INTERNAL_AUDITS', 'Internal Audits', 'المراجعات الداخلية', 'Independent auditing of financial and operational activities', 'المراجعة المستقلة للأنشطة المالية والتشغيلية'
FROM public.subsectors ss WHERE ss.code = 'INTERNAL_AUDIT';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'CONTROL_ENFORCEMENT', 'Internal Control Enforcement', 'إنفاذ الرقابة الداخلية', 'Ensuring governance, risk management, and compliance', 'ضمان الحوكمة وإدارة المخاطر والامتثال'
FROM public.subsectors ss WHERE ss.code = 'RISK_CONTROLS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'URBAN_DATA_MANAGEMENT', 'Urban Data Management', 'إدارة البيانات العمرانية', 'Collection and management of urban data', 'جمع وإدارة البيانات العمرانية'
FROM public.subsectors ss WHERE ss.code = 'URBAN_DATA_MGMT';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'DECISION_INTELLIGENCE', 'Decision Intelligence', 'ذكاء القرار', 'Advanced analytics to support policy and planning decisions', 'التحليلات المتقدمة لدعم قرارات السياسات والتخطيط'
FROM public.subsectors ss WHERE ss.code = 'ANALYTICS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'COUNCILS_SUPPORT', 'Municipal Councils Support', 'دعم المجالس البلدية', 'Support, coordination, and governance of municipal councils', 'دعم وتنسيق وحوكمة المجالس البلدية'
FROM public.subsectors ss WHERE ss.code = 'COUNCILS_AFFAIRS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'PARTNERSHIP_MANAGEMENT', 'Partnership Management', 'إدارة الشراكات', 'Managing partnerships with public and private entities', 'إدارة الشراكات مع الجهات العامة والخاصة'
FROM public.subsectors ss WHERE ss.code = 'INSTITUTIONAL_PARTNERSHIPS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'INTL_COOPERATION', 'International Cooperation', 'التعاون الدولي', 'Engagement with international organizations and governments', 'التواصل مع المنظمات والحكومات الدولية'
FROM public.subsectors ss WHERE ss.code = 'GLOBAL_RELATIONS';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'MUNICIPAL_OVERSIGHT', 'Municipal Operations Oversight', 'الإشراف على العمليات البلدية', 'Oversight of municipalities at regional and governorate levels', 'الإشراف على البلديات على المستوى الإقليمي ومستوى المحافظات'
FROM public.subsectors ss WHERE ss.code = 'LOCAL_GOVERNANCE';

INSERT INTO public.services (subsector_id, code, name_en, name_ar, description_en, description_ar)
SELECT ss.id, 'MUNICIPAL_REPRESENTATION', 'Municipal Representation', 'التمثيل البلدي', 'Representation of citizens in municipal decision-making', 'تمثيل المواطنين في صنع القرار البلدي'
FROM public.subsectors ss WHERE ss.code = 'REPRESENTATION';
