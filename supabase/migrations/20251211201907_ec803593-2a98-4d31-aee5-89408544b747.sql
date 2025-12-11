-- Add missing permissions to the permissions table
INSERT INTO public.permissions (code, name, description, entity_type, action)
VALUES 
  ('proposal_view', 'View Proposals', 'View challenge proposals', 'proposal', 'view'),
  ('approval_view', 'View Approvals', 'View approval requests', 'approval', 'view'),
  ('citizen_idea_view', 'View Citizen Ideas', 'View citizen submitted ideas', 'citizen_idea', 'view'),
  ('contract_view', 'View Contracts', 'View contracts', 'contract', 'view'),
  ('dashboard_view', 'View Dashboard', 'Access to dashboard', 'dashboard', 'view')
ON CONFLICT (code) DO NOTHING;

-- Add dashboard_view to Director
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'Municipality Director' AND p.code = 'dashboard_view'
ON CONFLICT DO NOTHING;

-- Add proposal_view to Coordinator, Staff, Director
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name IN ('Municipality Coordinator', 'Municipality Staff', 'Municipality Director') 
  AND p.code = 'proposal_view'
ON CONFLICT DO NOTHING;

-- Add approval_view to Coordinator, Director
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name IN ('Municipality Coordinator', 'Municipality Director') 
  AND p.code = 'approval_view'
ON CONFLICT DO NOTHING;

-- Add citizen_idea_view to Coordinator, Staff, Director
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name IN ('Municipality Coordinator', 'Municipality Staff', 'Municipality Director') 
  AND p.code = 'citizen_idea_view'
ON CONFLICT DO NOTHING;

-- Add contract_view to Coordinator, Director
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name IN ('Municipality Coordinator', 'Municipality Director') 
  AND p.code = 'contract_view'
ON CONFLICT DO NOTHING;