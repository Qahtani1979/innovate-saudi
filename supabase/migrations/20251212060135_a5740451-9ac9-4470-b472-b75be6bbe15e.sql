
-- First, clear all existing permissions for municipality roles to reset them
DELETE FROM role_permissions WHERE role_id IN (
  'fe2a73cb-ee08-4047-8112-fe609aa08239', -- Municipality Admin
  'c65e922d-c420-4ac4-a2d5-717d3a5f0a4d', -- Municipality Director
  '41bd6c65-b3d6-4f78-8840-f06f00521df1', -- Municipality Manager
  '04fb8b55-fbd8-4fdf-be5d-3261a2484fda', -- Municipality Innovation Officer
  '22ccab4c-a54e-4efe-abdb-fab4ed58669b', -- Municipality Coordinator
  '3f2aadc1-3ce6-48cd-9baa-c866666337a1', -- Municipality Staff
  '7f756e14-5724-49a9-8cb9-658b71521363'  -- Municipality Viewer
);

-- Municipality Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'fe2a73cb-ee08-4047-8112-fe609aa08239'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'analytics_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_edit', 'pilot_support', 'program_view', 'living_lab_view',
  'proposal_view', 'solution_view', 'approval_view', 'citizen_idea_view', 'knowledge_view',
  'contract_view', 'budget_view', 'budget_manage', 'reports_view', 'team_manage', 'settings_manage'
);

-- Municipality Director: All except settings_manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'c65e922d-c420-4ac4-a2d5-717d3a5f0a4d'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'analytics_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_edit', 'pilot_support', 'program_view', 'living_lab_view',
  'proposal_view', 'solution_view', 'approval_view', 'citizen_idea_view', 'knowledge_view',
  'contract_view', 'budget_view', 'budget_manage', 'reports_view', 'team_manage'
);

-- Municipality Manager: All except settings_manage, budget_manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT '41bd6c65-b3d6-4f78-8840-f06f00521df1'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'analytics_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_edit', 'pilot_support', 'program_view', 'living_lab_view',
  'proposal_view', 'solution_view', 'approval_view', 'citizen_idea_view', 'knowledge_view',
  'contract_view', 'budget_view', 'reports_view', 'team_manage'
);

-- Municipality Innovation Officer: No approval_view, contract_view, pilot_edit, budget_manage, team_manage, settings_manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT '04fb8b55-fbd8-4fdf-be5d-3261a2484fda'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'analytics_view', 'challenge_view', 'challenge_create', 'challenge_edit',
  'pilot_view', 'pilot_create', 'pilot_support', 'program_view', 'living_lab_view',
  'proposal_view', 'solution_view', 'citizen_idea_view', 'knowledge_view',
  'budget_view', 'reports_view'
);

-- Municipality Coordinator: No challenge_edit, pilot_edit, budget_view, budget_manage, team_manage, settings_manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT '22ccab4c-a54e-4efe-abdb-fab4ed58669b'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'analytics_view', 'challenge_view', 'challenge_create',
  'pilot_view', 'pilot_create', 'pilot_support', 'program_view', 'living_lab_view',
  'proposal_view', 'solution_view', 'approval_view', 'citizen_idea_view', 'knowledge_view',
  'contract_view', 'reports_view'
);

-- Municipality Staff: No challenge_create, challenge_edit, pilot_create, pilot_edit, approval_view, contract_view, budget_view, budget_manage, analytics_view, reports_view, team_manage, settings_manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT '3f2aadc1-3ce6-48cd-9baa-c866666337a1'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'dashboard_view', 'analytics_view', 'challenge_view',
  'pilot_view', 'pilot_support', 'program_view', 'living_lab_view',
  'proposal_view', 'solution_view', 'citizen_idea_view', 'knowledge_view'
);

-- Municipality Viewer: View-only, no dashboard_view per the table
INSERT INTO role_permissions (role_id, permission_id)
SELECT '7f756e14-5724-49a9-8cb9-658b71521363'::uuid, p.id
FROM permissions p
WHERE p.code IN (
  'analytics_view', 'challenge_view', 'pilot_view', 'program_view', 'living_lab_view',
  'solution_view', 'knowledge_view'
);
