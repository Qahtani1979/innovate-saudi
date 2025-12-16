-- =============================================
-- UNIFIED MOMAH SECTORS & SUBSECTORS
-- Ministry of Municipal and Rural Affairs and Housing
-- =============================================

-- First, update existing sectors with better codes and add missing ones
-- Using UPSERT pattern to avoid duplicates

-- Update existing sector codes to be more descriptive
UPDATE sectors SET code = 'URBAN_PLANNING', name_en = 'Urban Planning & Development', name_ar = 'التخطيط والتطوير العمراني', description_en = 'City planning, zoning, land use, and urban development', description_ar = 'تخطيط المدن وتقسيم المناطق واستخدام الأراضي والتطوير العمراني' WHERE code = 'URBAN';
UPDATE sectors SET code = 'INFRASTRUCTURE', name_en = 'Infrastructure & Utilities', name_ar = 'البنية التحتية والمرافق', description_en = 'Roads, utilities, water networks, and electricity infrastructure', description_ar = 'الطرق والمرافق وشبكات المياه والبنية التحتية للكهرباء' WHERE code = 'INFRA';
UPDATE sectors SET code = 'ENVIRONMENT', name_en = 'Environment & Sustainability', name_ar = 'البيئة والاستدامة', description_en = 'Environmental protection, green initiatives, and sustainability', description_ar = 'حماية البيئة والمبادرات الخضراء والاستدامة' WHERE code = 'ENV';
UPDATE sectors SET code = 'TRANSPORTATION', name_en = 'Transportation & Mobility', name_ar = 'النقل والتنقل', description_en = 'Public transportation, traffic management, and mobility solutions', description_ar = 'النقل العام وإدارة المرور وحلول التنقل' WHERE code = 'TRANS';
UPDATE sectors SET code = 'DIGITAL_SERVICES', name_en = 'Digital Services & Technology', name_ar = 'الخدمات الرقمية والتقنية', description_en = 'E-government, digital transformation, and technology services', description_ar = 'الحكومة الإلكترونية والتحول الرقمي والخدمات التقنية' WHERE code = 'DIGITAL';
UPDATE sectors SET code = 'SMART_CITIES', name_en = 'Smart Cities', name_ar = 'المدن الذكية', description_en = 'Smart city technologies, IoT, and connected infrastructure', description_ar = 'تقنيات المدن الذكية وإنترنت الأشياء والبنية التحتية المتصلة' WHERE code = 'SMART_CITY';
UPDATE sectors SET code = 'PUBLIC_SAFETY', name_en = 'Public Safety & Security', name_ar = 'السلامة والأمن العام', description_en = 'Emergency services, public safety, and security systems', description_ar = 'خدمات الطوارئ والسلامة العامة وأنظمة الأمن' WHERE code = 'SAFETY';
UPDATE sectors SET code = 'WATER_RESOURCES', name_en = 'Water Resources', name_ar = 'الموارد المائية', description_en = 'Water management, conservation, and distribution', description_ar = 'إدارة المياه والحفاظ عليها وتوزيعها' WHERE code = 'WATER';
UPDATE sectors SET code = 'WASTE_MANAGEMENT', name_en = 'Waste Management', name_ar = 'إدارة النفايات', description_en = 'Waste handling, recycling, and disposal', description_ar = 'معالجة النفايات وإعادة التدوير والتخلص منها' WHERE code = 'WASTE';

-- Insert missing sectors (MOMAH strategic sectors)
INSERT INTO sectors (code, name_en, name_ar, description_en, description_ar, icon, is_active)
VALUES 
  ('CITIZEN_SERVICES', 'Citizen Services', 'خدمات المواطنين', 'Municipal services, permits, and citizen engagement', 'الخدمات البلدية والتصاريح والمشاركة المجتمعية', 'Users', true),
  ('RURAL_DEVELOPMENT', 'Rural Development', 'التنمية الريفية', 'Rural area development and village infrastructure', 'تطوير المناطق الريفية والبنية التحتية للقرى', 'TreePine', true),
  ('PUBLIC_SPACES', 'Public Spaces & Parks', 'الأماكن العامة والحدائق', 'Parks, recreational areas, and public facilities', 'الحدائق والمناطق الترفيهية والمرافق العامة', 'ParkingSquare', true),
  ('HERITAGE', 'Heritage & Culture', 'التراث والثقافة', 'Heritage preservation, cultural sites, and tourism', 'الحفاظ على التراث والمواقع الثقافية والسياحة', 'Landmark', true),
  ('ECONOMIC_DEVELOPMENT', 'Economic Development', 'التنمية الاقتصادية', 'Local economy, business enablement, and investment', 'الاقتصاد المحلي وتمكين الأعمال والاستثمار', 'TrendingUp', true),
  ('HEALTH_WELLBEING', 'Health & Wellbeing', 'الصحة والرفاهية', 'Public health initiatives and quality of life', 'مبادرات الصحة العامة وجودة الحياة', 'Heart', true)
ON CONFLICT (code) DO UPDATE SET 
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  is_active = true;

-- =============================================
-- SUBSECTORS - Detailed breakdown by sector
-- =============================================

-- Get sector IDs and insert subsectors
INSERT INTO subsectors (sector_id, code, name_en, name_ar, description_en, description_ar, is_active)
SELECT s.id, sub.code, sub.name_en, sub.name_ar, sub.description_en, sub.description_ar, true
FROM sectors s
CROSS JOIN (VALUES
  -- Urban Planning subsectors
  ('URBAN_PLANNING', 'LAND_USE', 'Land Use Planning', 'تخطيط استخدام الأراضي', 'Zoning and land use regulations', 'تنظيم المناطق واستخدام الأراضي'),
  ('URBAN_PLANNING', 'BUILDING_PERMITS', 'Building Permits', 'تصاريح البناء', 'Construction permits and approvals', 'تصاريح البناء والموافقات'),
  ('URBAN_PLANNING', 'URBAN_DESIGN', 'Urban Design', 'التصميم الحضري', 'City aesthetics and public realm design', 'جماليات المدينة وتصميم الفضاء العام'),
  
  -- Housing subsectors
  ('HOUSING', 'AFFORDABLE_HOUSING', 'Affordable Housing', 'الإسكان الميسر', 'Low-cost housing programs', 'برامج الإسكان منخفض التكلفة'),
  ('HOUSING', 'REAL_ESTATE', 'Real Estate Development', 'التطوير العقاري', 'Property development and management', 'تطوير وإدارة العقارات'),
  ('HOUSING', 'HOUSING_FINANCE', 'Housing Finance', 'تمويل الإسكان', 'Mortgage and housing loans', 'الرهن العقاري وقروض الإسكان'),
  
  -- Infrastructure subsectors
  ('INFRASTRUCTURE', 'ROADS', 'Roads & Highways', 'الطرق والطرق السريعة', 'Road construction and maintenance', 'إنشاء وصيانة الطرق'),
  ('INFRASTRUCTURE', 'BRIDGES', 'Bridges & Tunnels', 'الجسور والأنفاق', 'Bridge and tunnel infrastructure', 'البنية التحتية للجسور والأنفاق'),
  ('INFRASTRUCTURE', 'DRAINAGE', 'Drainage Systems', 'أنظمة الصرف', 'Stormwater and drainage management', 'إدارة مياه الأمطار والصرف'),
  
  -- Transportation subsectors
  ('TRANSPORTATION', 'PUBLIC_TRANSIT', 'Public Transit', 'النقل العام', 'Buses, metro, and public transport', 'الحافلات والمترو والنقل العام'),
  ('TRANSPORTATION', 'TRAFFIC_MGMT', 'Traffic Management', 'إدارة المرور', 'Traffic signals and flow optimization', 'إشارات المرور وتحسين التدفق'),
  ('TRANSPORTATION', 'PARKING', 'Parking Management', 'إدارة المواقف', 'Parking facilities and systems', 'مرافق وأنظمة المواقف'),
  
  -- Environment subsectors
  ('ENVIRONMENT', 'AIR_QUALITY', 'Air Quality', 'جودة الهواء', 'Air pollution monitoring and control', 'مراقبة ومكافحة تلوث الهواء'),
  ('ENVIRONMENT', 'GREEN_SPACES', 'Green Spaces', 'المساحات الخضراء', 'Urban forestry and green areas', 'الغابات الحضرية والمناطق الخضراء'),
  ('ENVIRONMENT', 'CLIMATE_ACTION', 'Climate Action', 'العمل المناخي', 'Climate change mitigation', 'التخفيف من تغير المناخ'),
  
  -- Digital Services subsectors
  ('DIGITAL_SERVICES', 'EGOV_PORTAL', 'E-Government Portal', 'بوابة الحكومة الإلكترونية', 'Online government services', 'الخدمات الحكومية عبر الإنترنت'),
  ('DIGITAL_SERVICES', 'MOBILE_APPS', 'Mobile Applications', 'التطبيقات المحمولة', 'Government mobile apps', 'التطبيقات الحكومية للهواتف'),
  ('DIGITAL_SERVICES', 'DATA_ANALYTICS', 'Data Analytics', 'تحليل البيانات', 'Municipal data and analytics', 'بيانات وتحليلات البلدية'),
  
  -- Smart Cities subsectors
  ('SMART_CITIES', 'IOT_SENSORS', 'IoT & Sensors', 'إنترنت الأشياء والمستشعرات', 'Connected sensors and devices', 'الأجهزة والمستشعرات المتصلة'),
  ('SMART_CITIES', 'SMART_LIGHTING', 'Smart Lighting', 'الإضاءة الذكية', 'Intelligent street lighting', 'إضاءة الشوارع الذكية'),
  ('SMART_CITIES', 'COMMAND_CENTER', 'Command Center', 'مركز القيادة', 'City operations center', 'مركز عمليات المدينة'),
  
  -- Water Resources subsectors
  ('WATER_RESOURCES', 'WATER_SUPPLY', 'Water Supply', 'إمدادات المياه', 'Water distribution networks', 'شبكات توزيع المياه'),
  ('WATER_RESOURCES', 'WASTEWATER', 'Wastewater Treatment', 'معالجة مياه الصرف', 'Sewage treatment plants', 'محطات معالجة مياه الصرف'),
  ('WATER_RESOURCES', 'CONSERVATION', 'Water Conservation', 'ترشيد المياه', 'Water saving initiatives', 'مبادرات توفير المياه'),
  
  -- Waste Management subsectors
  ('WASTE_MANAGEMENT', 'COLLECTION', 'Waste Collection', 'جمع النفايات', 'Garbage collection services', 'خدمات جمع النفايات'),
  ('WASTE_MANAGEMENT', 'RECYCLING', 'Recycling', 'إعادة التدوير', 'Recycling programs and facilities', 'برامج ومرافق إعادة التدوير'),
  ('WASTE_MANAGEMENT', 'DISPOSAL', 'Waste Disposal', 'التخلص من النفايات', 'Landfills and disposal sites', 'مكبات ومواقع التخلص'),
  
  -- Citizen Services subsectors
  ('CITIZEN_SERVICES', 'PERMITS_LICENSES', 'Permits & Licenses', 'التصاريح والرخص', 'Business and activity permits', 'تصاريح الأعمال والأنشطة'),
  ('CITIZEN_SERVICES', 'COMPLAINTS', 'Complaints & Requests', 'الشكاوى والطلبات', 'Citizen feedback management', 'إدارة ملاحظات المواطنين'),
  ('CITIZEN_SERVICES', 'INFO_SERVICES', 'Information Services', 'خدمات المعلومات', 'Public information and guidance', 'المعلومات العامة والتوجيه'),
  
  -- Public Safety subsectors
  ('PUBLIC_SAFETY', 'CIVIL_DEFENSE', 'Civil Defense', 'الدفاع المدني', 'Emergency response and disasters', 'الاستجابة للطوارئ والكوارث'),
  ('PUBLIC_SAFETY', 'FOOD_SAFETY', 'Food Safety', 'سلامة الغذاء', 'Food inspection and hygiene', 'تفتيش الأغذية والنظافة'),
  ('PUBLIC_SAFETY', 'BUILDING_SAFETY', 'Building Safety', 'سلامة المباني', 'Structural safety inspections', 'فحوصات السلامة الإنشائية')
) AS sub(sector_code, code, name_en, name_ar, description_en, description_ar)
WHERE s.code = sub.sector_code
ON CONFLICT DO NOTHING;