
-- Create only missing permissions
INSERT INTO permissions (name, code, description, entity_type, action, is_active)
SELECT v.name, v.code, v.description, v.entity_type, v.action, true
FROM (VALUES
  ('View Budget', 'budget_view', 'View budget information', 'budget', 'view'),
  ('Manage Budget', 'budget_manage', 'Manage and allocate budgets', 'budget', 'manage'),
  ('Manage Team', 'team_manage', 'Manage team members and roles', 'team', 'manage'),
  ('View Reports', 'reports_view', 'View and generate reports', 'reports', 'view'),
  ('Manage Settings', 'settings_manage', 'Manage system settings', 'settings', 'manage')
) AS v(name, code, description, entity_type, action)
WHERE NOT EXISTS (SELECT 1 FROM permissions p WHERE p.code = v.code);

-- Municipality Admin: Full access (15 permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'fe2a73cb-ee08-4047-8112-fe609aa08239'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_edit', 'pilot_support',
  'budget_view', 'budget_manage', 'analytics_view', 'team_manage',
  'solution_view', 'reports_view', 'settings_manage'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = 'fe2a73cb-ee08-4047-8112-fe609aa08239'::uuid AND rp.permission_id = p.id
);

-- Municipality Director: Strategic oversight (14 permissions, no settings)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'c65e922d-c420-4ac4-a2d5-717d3a5f0a4d'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_edit', 'pilot_support',
  'budget_view', 'budget_manage', 'analytics_view', 'team_manage',
  'solution_view', 'reports_view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = 'c65e922d-c420-4ac4-a2d5-717d3a5f0a4d'::uuid AND rp.permission_id = p.id
);

-- Municipality Manager: Operational (12 permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '41bd6c65-b3d6-4f78-8840-f06f00521df1'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_edit', 'pilot_support',
  'budget_view', 'analytics_view', 'solution_view', 'reports_view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '41bd6c65-b3d6-4f78-8840-f06f00521df1'::uuid AND rp.permission_id = p.id
);

-- Municipality Innovation Officer (10 permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '04fb8b55-fbd8-4fdf-be5d-3261a2484fda'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_support',
  'analytics_view', 'solution_view', 'reports_view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '04fb8b55-fbd8-4fdf-be5d-3261a2484fda'::uuid AND rp.permission_id = p.id
);

-- Municipality Coordinator (9 permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '22ccab4c-a54e-4efe-abdb-fab4ed58669b'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'challenge_view', 'challenge_create',
  'pilot_view', 'pilot_create', 'pilot_support',
  'analytics_view', 'solution_view', 'reports_view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '22ccab4c-a54e-4efe-abdb-fab4ed58669b'::uuid AND rp.permission_id = p.id
);

-- Municipality Staff (6 permissions, view + support)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '3f2aadc1-3ce6-48cd-9baa-c866666337a1'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'challenge_view', 'pilot_view', 'pilot_support',
  'solution_view', 'reports_view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '3f2aadc1-3ce6-48cd-9baa-c866666337a1'::uuid AND rp.permission_id = p.id
);

-- Municipality Viewer (5 permissions, read-only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '7f756e14-5724-49a9-8cb9-658b71521363'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'challenge_view', 'pilot_view', 'solution_view', 'reports_view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '7f756e14-5724-49a9-8cb9-658b71521363'::uuid AND rp.permission_id = p.id
);
