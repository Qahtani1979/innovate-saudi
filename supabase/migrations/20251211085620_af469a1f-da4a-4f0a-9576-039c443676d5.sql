-- Insert deputyship roles into roles table
INSERT INTO public.roles (name, name_ar, description, description_ar, is_system_role, can_be_requested, approval_required, is_active)
VALUES 
  ('Deputyship Director', 'مدير الوكالة', 'Director-level authority for national deputyship with full sector access', 'صلاحية على مستوى المدير للوكالة الوطنية مع وصول كامل للقطاع', true, false, true, true),
  ('Deputyship Manager', 'مدير عمليات الوكالة', 'Manages deputyship operations across all municipalities in their sector', 'إدارة عمليات الوكالة عبر جميع البلديات في قطاعهم', true, true, true, true),
  ('Deputyship Staff', 'موظف الوكالة', 'Staff member supporting national deputyship initiatives', 'موظف يدعم مبادرات الوكالة الوطنية', true, true, true, true),
  ('Deputyship Analyst', 'محلل الوكالة', 'Analyzes sector-wide data and trends for deputyship', 'يحلل البيانات والاتجاهات على مستوى القطاع للوكالة', true, true, true, true)
ON CONFLICT (name) DO NOTHING;

-- Insert visibility-related permissions
INSERT INTO public.permissions (code, name, name_ar, description, description_ar, entity_type, action, is_active)
VALUES 
  -- Visibility permissions
  ('visibility_all_municipalities', 'View All Municipalities Data', 'عرض بيانات جميع البلديات', 'Access data from all municipalities regardless of assignment', 'الوصول إلى بيانات جميع البلديات', 'visibility', 'view', true),
  ('visibility_all_sectors', 'View All Sectors Data', 'عرض بيانات جميع القطاعات', 'Access data from all sectors regardless of assignment', 'الوصول إلى بيانات جميع القطاعات', 'visibility', 'view', true),
  ('visibility_national', 'View National Level Data', 'عرض البيانات على المستوى الوطني', 'Access national-level aggregated data and reports', 'الوصول إلى البيانات المجمعة على المستوى الوطني', 'visibility', 'view', true),
  ('visibility_cross_region', 'View Cross-Region Data', 'عرض البيانات عبر المناطق', 'Access data across multiple regions', 'الوصول إلى البيانات عبر مناطق متعددة', 'visibility', 'view', true),
  
  -- Scope override permissions
  ('scope_override_municipality', 'Override Municipality Scope', 'تجاوز نطاق البلدية', 'Can access other municipalities data when needed', 'يمكن الوصول إلى بيانات البلديات الأخرى عند الحاجة', 'scope', 'override', true),
  ('scope_override_sector', 'Override Sector Scope', 'تجاوز نطاق القطاع', 'Can access other sectors data when needed', 'يمكن الوصول إلى بيانات القطاعات الأخرى عند الحاجة', 'scope', 'override', true),
  
  -- National deputyship specific permissions
  ('deputyship_sector_manage', 'Manage Sector Strategy', 'إدارة استراتيجية القطاع', 'Define and manage sector-wide strategies', 'تحديد وإدارة استراتيجيات على مستوى القطاع', 'deputyship', 'manage', true),
  ('deputyship_policy_create', 'Create Sector Policies', 'إنشاء سياسات القطاع', 'Create policies that apply to all municipalities in sector', 'إنشاء سياسات تنطبق على جميع البلديات في القطاع', 'deputyship', 'create', true),
  ('deputyship_benchmark', 'Benchmark Municipalities', 'مقارنة البلديات', 'Compare and benchmark municipalities in sector', 'مقارنة ومعايرة البلديات في القطاع', 'deputyship', 'view', true),
  ('deputyship_guidance_publish', 'Publish National Guidance', 'نشر التوجيهات الوطنية', 'Publish guidance visible to all municipalities', 'نشر توجيهات مرئية لجميع البلديات', 'deputyship', 'publish', true)
ON CONFLICT (code) DO NOTHING;

-- Assign full visibility permissions to executive and ministry roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('Executive Leader', 'Executive Leadership', 'Ministry Representative', 'GDISB Strategy Lead')
AND p.code IN ('visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national', 'visibility_cross_region')
ON CONFLICT DO NOTHING;

-- Assign deputyship permissions to deputyship roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('Deputyship Director', 'Deputyship Manager')
AND p.code IN ('deputyship_sector_manage', 'deputyship_policy_create', 'deputyship_benchmark', 'deputyship_guidance_publish', 'visibility_all_municipalities')
ON CONFLICT DO NOTHING;