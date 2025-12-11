
-- Update high-level roles to include visibility permissions in their permissions array
-- These roles should have full visibility across all municipalities and sectors

-- Executive Leader - full visibility
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national', 'visibility_cross_region']
)
WHERE name = 'Executive Leader' 
AND NOT (permissions @> ARRAY['visibility_all_municipalities']);

-- Executive Leadership - full visibility
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national', 'visibility_cross_region']
)
WHERE name = 'Executive Leadership'
AND NOT (COALESCE(permissions, ARRAY[]::text[]) @> ARRAY['visibility_all_municipalities']);

-- Ministry Representative - full visibility
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national', 'visibility_cross_region']
)
WHERE name = 'Ministry Representative'
AND NOT (COALESCE(permissions, ARRAY[]::text[]) @> ARRAY['visibility_all_municipalities']);

-- GDISB Strategy Lead - full visibility (this is the Innovation Department)
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national', 'visibility_cross_region', 'deputyship_sector_manage', 'deputyship_policy_create', 'deputyship_benchmark', 'deputyship_guidance_publish']
)
WHERE name = 'GDISB Strategy Lead'
AND NOT (COALESCE(permissions, ARRAY[]::text[]) @> ARRAY['visibility_all_municipalities']);

-- Deputyship Director - full visibility + deputyship permissions
UPDATE public.roles 
SET permissions = ARRAY[
  'visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national', 'visibility_cross_region',
  'deputyship_sector_manage', 'deputyship_policy_create', 'deputyship_benchmark', 'deputyship_guidance_publish',
  'scope_override_municipality', 'scope_override_sector',
  'challenge_view_all', 'pilot_view_all', 'program_view_all', 'solution_view_all',
  'dashboard_view', 'analytics_view_all', 'reports_view_all'
]
WHERE name = 'Deputyship Director';

-- Deputyship Manager - sector-wide visibility
UPDATE public.roles 
SET permissions = ARRAY[
  'visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national',
  'deputyship_sector_manage', 'deputyship_benchmark',
  'challenge_view_all', 'pilot_view_all', 'program_view_all',
  'dashboard_view', 'analytics_view_all'
]
WHERE name = 'Deputyship Manager';

-- Deputyship Staff - sector visibility
UPDATE public.roles 
SET permissions = ARRAY[
  'visibility_all_municipalities', 'visibility_national',
  'deputyship_benchmark',
  'challenge_view_all', 'pilot_view_all', 'program_view_all',
  'dashboard_view'
]
WHERE name = 'Deputyship Staff';

-- Deputyship Analyst - read-only sector visibility
UPDATE public.roles 
SET permissions = ARRAY[
  'visibility_all_municipalities', 'visibility_all_sectors', 'visibility_national',
  'deputyship_benchmark',
  'challenge_view_all', 'pilot_view_all', 'program_view_all',
  'dashboard_view', 'analytics_view_all', 'reports_view_all'
]
WHERE name = 'Deputyship Analyst';

-- Also update Platform Admin role (should already have '*' but ensure it)
UPDATE public.roles 
SET permissions = ARRAY['*']
WHERE name = 'Platform Admin';
