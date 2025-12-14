-- Add strategy_officer to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'strategy_officer';

-- Create Strategy Officer role in roles table with strategy permissions
INSERT INTO public.roles (name, description, permissions, is_active)
VALUES (
  'Strategy Officer',
  'Strategic planning officers who create and manage organizational strategies',
  ARRAY['strategy_manage', 'strategy_view', 'strategy_cascade', 'strategy_approve', 'plan_create', 'analytics_view_all', 'dashboard_view'],
  true
)
ON CONFLICT (name) DO UPDATE SET
  permissions = ARRAY['strategy_manage', 'strategy_view', 'strategy_cascade', 'strategy_approve', 'plan_create', 'analytics_view_all', 'dashboard_view'],
  description = 'Strategic planning officers who create and manage organizational strategies';

-- Add strategy_view permission to roles that should have view access
UPDATE public.roles
SET permissions = array_append(permissions, 'strategy_view')
WHERE name IN (
  'Executive', 
  'Executive Leader', 
  'Executive Director',
  'Executive Leadership',
  'Deputyship Director',
  'Deputyship Manager',
  'Deputyship Analyst',
  'Municipality Admin',
  'Municipality Manager',
  'Municipality Director',
  'Program Director',
  'Program Manager',
  'Data Analyst'
)
AND NOT ('strategy_view' = ANY(permissions));

-- Add strategy_manage to GDISB Strategy Lead if not present
UPDATE public.roles
SET permissions = array_append(permissions, 'strategy_cascade')
WHERE name = 'GDISB Strategy Lead'
AND NOT ('strategy_cascade' = ANY(permissions));