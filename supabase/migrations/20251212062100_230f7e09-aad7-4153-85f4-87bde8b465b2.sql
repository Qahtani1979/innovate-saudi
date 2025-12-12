
-- Update Municipality Staff role to include program and solution view permissions
UPDATE roles 
SET permissions = ARRAY['challenge_create', 'challenge_view_own', 'challenge_view', 'pilot_view_own', 'pilot_view', 'pilot_support', 'program_view', 'solution_view', 'dashboard_view']
WHERE name = 'Municipality Staff';
