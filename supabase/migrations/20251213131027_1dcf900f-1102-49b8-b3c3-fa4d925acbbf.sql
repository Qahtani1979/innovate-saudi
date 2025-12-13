-- Create missing event and program permissions
INSERT INTO permissions (code, name, name_ar, entity_type, action, is_active) VALUES
  ('event_view', 'View Events', 'عرض الفعاليات', 'event', 'view', true),
  ('event_register', 'Register for Events', 'التسجيل في الفعاليات', 'event', 'register', true),
  ('program_participate', 'Participate in Programs', 'المشاركة في البرامج', 'program', 'participate', true),
  ('program_apply', 'Apply to Programs', 'التقديم للبرامج', 'program', 'apply', true)
ON CONFLICT (code) DO NOTHING;

-- Get the new permission IDs and assign to personas
-- CITIZEN permissions for programs/events
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'fa3d30af-9f44-45d9-9e1c-884025af2f8f', id FROM permissions 
WHERE code IN ('event_view', 'event_register', 'program_view', 'program_apply')
ON CONFLICT DO NOTHING;

-- PROVIDER permissions for programs/events
INSERT INTO role_permissions (role_id, permission_id)
SELECT '13c30bfb-424f-44cb-927e-92cd8ca26206', id FROM permissions 
WHERE code IN ('event_view', 'event_register', 'program_view', 'program_apply', 'program_participate')
ON CONFLICT DO NOTHING;

-- EXPERT permissions for programs/events
INSERT INTO role_permissions (role_id, permission_id)
SELECT '023eaaf4-cbf6-4319-a3c7-f915ced4e5f9', id FROM permissions 
WHERE code IN ('event_view', 'event_register', 'program_view')
ON CONFLICT DO NOTHING;

-- RESEARCHER permissions for programs/events
INSERT INTO role_permissions (role_id, permission_id)
SELECT '65e786ab-84e0-4a13-8586-c9de0518c3e8', id FROM permissions 
WHERE code IN ('event_view', 'event_register', 'program_view', 'program_apply')
ON CONFLICT DO NOTHING;

-- USER role (basic) - can view events and programs
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0a0c20c-c19c-4e05-810a-29a848172bfc', id FROM permissions 
WHERE code IN ('event_view', 'program_view')
ON CONFLICT DO NOTHING;

-- VIEWER role - can view events only (read-only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '3e8c9221-e4b1-44c3-8057-36ef2aa8046d', id FROM permissions 
WHERE code IN ('event_view')
ON CONFLICT DO NOTHING;