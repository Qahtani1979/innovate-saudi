
-- Create missing permissions
INSERT INTO permissions (name, code, description, entity_type, action, is_active)
SELECT v.name, v.code, v.description, v.entity_type, v.action, true
FROM (VALUES
  ('View Programs', 'program_view', 'View programs and initiatives', 'program', 'view'),
  ('View Living Labs', 'living_lab_view', 'View living lab projects', 'living_lab', 'view'),
  ('View Knowledge Hub', 'knowledge_view', 'Access knowledge hub resources', 'knowledge', 'view')
) AS v(name, code, description, entity_type, action)
WHERE NOT EXISTS (SELECT 1 FROM permissions p WHERE p.code = v.code);

-- Municipality Admin: Add all new permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'fe2a73cb-ee08-4047-8112-fe609aa08239'::uuid, p.id
FROM permissions p
WHERE p.code IN ('program_view', 'living_lab_view', 'knowledge_view', 'approval_view', 'citizen_idea_view', 'contract_view', 'proposal_view')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = 'fe2a73cb-ee08-4047-8112-fe609aa08239'::uuid AND rp.permission_id = p.id
);

-- Municipality Director: Add program, living lab, knowledge
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'c65e922d-c420-4ac4-a2d5-717d3a5f0a4d'::uuid, p.id
FROM permissions p
WHERE p.code IN ('program_view', 'living_lab_view', 'knowledge_view', 'settings_manage')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = 'c65e922d-c420-4ac4-a2d5-717d3a5f0a4d'::uuid AND rp.permission_id = p.id
);

-- Municipality Manager: Add program, living lab, knowledge, proposals, approvals, citizen ideas, contracts
INSERT INTO role_permissions (role_id, permission_id)
SELECT '41bd6c65-b3d6-4f78-8840-f06f00521df1'::uuid, p.id
FROM permissions p
WHERE p.code IN ('program_view', 'living_lab_view', 'knowledge_view', 'proposal_view', 'approval_view', 'citizen_idea_view', 'contract_view', 'team_manage')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '41bd6c65-b3d6-4f78-8840-f06f00521df1'::uuid AND rp.permission_id = p.id
);

-- Municipality Innovation Officer: Add program, living lab, knowledge, proposals, citizen ideas
INSERT INTO role_permissions (role_id, permission_id)
SELECT '04fb8b55-fbd8-4fdf-be5d-3261a2484fda'::uuid, p.id
FROM permissions p
WHERE p.code IN ('program_view', 'living_lab_view', 'knowledge_view', 'proposal_view', 'citizen_idea_view', 'budget_view')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '04fb8b55-fbd8-4fdf-be5d-3261a2484fda'::uuid AND rp.permission_id = p.id
);

-- Municipality Coordinator: Add program, living lab, knowledge
INSERT INTO role_permissions (role_id, permission_id)
SELECT '22ccab4c-a54e-4efe-abdb-fab4ed58669b'::uuid, p.id
FROM permissions p
WHERE p.code IN ('program_view', 'living_lab_view', 'knowledge_view')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '22ccab4c-a54e-4efe-abdb-fab4ed58669b'::uuid AND rp.permission_id = p.id
);

-- Municipality Staff: Add program, living lab, knowledge
INSERT INTO role_permissions (role_id, permission_id)
SELECT '3f2aadc1-3ce6-48cd-9baa-c866666337a1'::uuid, p.id
FROM permissions p
WHERE p.code IN ('program_view', 'living_lab_view', 'knowledge_view', 'analytics_view')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '3f2aadc1-3ce6-48cd-9baa-c866666337a1'::uuid AND rp.permission_id = p.id
);

-- Municipality Viewer: Add program, living lab, knowledge
INSERT INTO role_permissions (role_id, permission_id)
SELECT '7f756e14-5724-49a9-8cb9-658b71521363'::uuid, p.id
FROM permissions p
WHERE p.code IN ('program_view', 'living_lab_view', 'knowledge_view', 'analytics_view')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp 
  WHERE rp.role_id = '7f756e14-5724-49a9-8cb9-658b71521363'::uuid AND rp.permission_id = p.id
);
