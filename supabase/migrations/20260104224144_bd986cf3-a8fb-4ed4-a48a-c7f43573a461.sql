-- Assign pilot_view_all to Admin, Executive Leadership, and Program Director roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE p.code = 'pilot_view_all'
AND r.name_ar IN ('مدير', 'القيادة التنفيذية', 'مدير البرامج')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign pilot_view_own to Municipality Staff and Municipality Admin roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE p.code = 'pilot_view_own'
AND r.name_ar IN ('موظف البلدية', 'مدير البلدية', 'منسق البلدية', 'مسؤول الابتكار البلدي')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Also assign pilot_view to all roles that should see pilots
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE p.code = 'pilot_view'
AND r.name_ar IN ('مدير', 'القيادة التنفيذية', 'مدير البرامج', 'موظف البلدية', 'مدير البلدية', 'منسق البلدية', 'مسؤول الابتكار البلدي', 'مشاهد البلدية', 'خبير', 'باحث')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign pilot_edit and pilot_delete to admin and program directors
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE p.code IN ('pilot_edit', 'pilot_delete')
AND r.name_ar IN ('مدير', 'مدير البرامج')
ON CONFLICT (role_id, permission_id) DO NOTHING;