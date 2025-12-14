-- Add strategy permissions to the permissions table
INSERT INTO permissions (name, code, description, entity_type, action, is_active)
SELECT v.name, v.code, v.description, v.entity_type, v.action, true
FROM (VALUES
  ('View Strategy', 'strategy_view', 'Access strategic plans and strategy hub', 'strategy', 'view'),
  ('Manage Strategy', 'strategy_manage', 'Create, edit, and manage strategic plans', 'strategy', 'manage'),
  ('Approve Strategy', 'strategy_approve', 'Approve strategic plans and governance actions', 'strategy', 'approve'),
  ('Generate Strategy Cascade', 'strategy_cascade', 'Use strategy cascade generators', 'strategy', 'cascade')
) AS v(name, code, description, entity_type, action)
WHERE NOT EXISTS (SELECT 1 FROM permissions p WHERE p.code = v.code);

-- Grant strategy_view to Executive roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('Super Admin', 'GDISB Admin', 'GDISB Executive', 'Municipality Director', 'Municipality Manager', 'Municipality Admin')
AND p.code = 'strategy_view'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Grant strategy_manage to Management roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('Super Admin', 'GDISB Admin', 'GDISB Executive', 'Municipality Director')
AND p.code = 'strategy_manage'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Grant strategy_approve to Executive roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('Super Admin', 'GDISB Admin', 'GDISB Executive')
AND p.code = 'strategy_approve'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Grant strategy_cascade to all strategy viewers
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('Super Admin', 'GDISB Admin', 'GDISB Executive', 'Municipality Director', 'Municipality Manager')
AND p.code = 'strategy_cascade'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);