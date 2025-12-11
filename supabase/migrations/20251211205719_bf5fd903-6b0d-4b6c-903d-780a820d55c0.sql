-- Assign pilot_create permission to appropriate roles
-- Permission ID: 43a7a093-e233-476b-a477-78c697262ce4

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, '43a7a093-e233-476b-a477-78c697262ce4'::uuid
FROM roles r
WHERE r.name IN (
  -- Municipality Persona (primary pilot creators)
  'Municipality Admin',
  'Municipality Manager',
  'Municipality Director',
  'Municipality Innovation Officer',
  'Municipality Coordinator',
  
  -- Deputyship/National Level (oversight & strategic pilots)
  'Deputyship Director',
  'Deputyship Manager',
  'Deputyship Admin',
  
  -- Program Operators (program-linked pilots)
  'Program Director',
  'Program Manager',
  'Program Operator',
  
  -- Living Labs (experimental pilots)
  'Living Lab Director',
  'Living Lab Manager',
  'Living Lab Admin',
  
  -- Research/R&D (research pilots)
  'R&D Manager',
  'Research Lead',
  
  -- Platform Admins (full access)
  'Admin',
  'Platform Admin',
  'Platform Administrator',
  
  -- Pilot Manager (dedicated role)
  'Pilot Manager'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;