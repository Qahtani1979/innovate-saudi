
-- Assign all unassigned permissions to Admin role (Admin should have all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  '9f75cd11-cb06-43ac-a0a2-42d2bc721f17'::uuid as role_id,
  p.id as permission_id
FROM permissions p
WHERE p.id NOT IN (SELECT DISTINCT permission_id FROM role_permissions WHERE role_id = '9f75cd11-cb06-43ac-a0a2-42d2bc721f17')
  AND p.is_active = true
ON CONFLICT DO NOTHING;

-- Assign challenge permissions to Challenge Reviewer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Challenge Reviewer'
  AND p.code IN ('challenge_review', 'challenge_approve', 'challenge_view_all', 'challenge_view_detail', 'challenge_view_assigned')
ON CONFLICT DO NOTHING;

-- Assign challenge permissions to Challenge Lead role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Challenge Lead'
  AND p.code IN ('challenge_create', 'challenge_edit', 'challenge_view_all', 'challenge_assign', 'challenge_archive', 'challenge_submit', 'challenge_update', 'challenge_view_detail')
ON CONFLICT DO NOTHING;

-- Assign citizen permissions to Citizen role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Citizen'
  AND p.code IN ('citizen_feedback_submit', 'challenge_view_public', 'challenge_express_interest', 'demo_request', 'idea_evaluate')
ON CONFLICT DO NOTHING;

-- Assign expert permissions to Expert role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Expert'
  AND p.code IN ('expert_view_all', 'challenge_view_detail', 'solution_view_detail', 'pilot_view', 'proposal_evaluate', 'rd_project_view')
ON CONFLICT DO NOTHING;

-- Assign domain expert permissions to Domain Expert role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Domain Expert'
  AND p.code IN ('expert_view_all', 'challenge_view_detail', 'solution_view_detail', 'pilot_view', 'proposal_evaluate', 'rd_project_view', 'idea_evaluate')
ON CONFLICT DO NOTHING;

-- Assign evaluator permissions to Evaluator role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Evaluator'
  AND p.code IN ('proposal_evaluate', 'solution_evaluate', 'pilot_view', 'challenge_view_detail', 'application_review')
ON CONFLICT DO NOTHING;

-- Assign researcher permissions to Researcher role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Researcher'
  AND p.code IN ('rd_project_view', 'rd_proposal_create', 'rd_project_create', 'knowledge_create', 'knowledge_edit', 'challenge_view_public', 'solution_view_public')
ON CONFLICT DO NOTHING;

-- Assign provider permissions to Provider role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Provider'
  AND p.code IN ('solution_create', 'solution_edit_own', 'solution_submit', 'proposal_create', 'proposal_edit_own', 'challenge_view_public', 'challenge_express_interest', 'contract_sign', 'demo_request')
ON CONFLICT DO NOTHING;

-- Assign solution provider permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Solution Provider'
  AND p.code IN ('solution_create', 'solution_edit_own', 'solution_submit', 'solution_view_own', 'proposal_create', 'proposal_edit_own')
ON CONFLICT DO NOTHING;

-- Assign municipality staff permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Municipality Staff'
  AND p.code IN ('challenge_view_own', 'challenge_edit_own', 'challenge_submit', 'pilot_view_own', 'analytics_view_own', 'data_view', 'kpi_track')
ON CONFLICT DO NOTHING;

-- Assign municipality admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Municipality Admin'
  AND p.code IN (
    'challenge_view_all', 'challenge_create', 'challenge_edit', 'challenge_approve', 'challenge_assign',
    'pilot_view_all', 'pilot_edit', 'pilot_approve',
    'solution_view_all', 'solution_approve',
    'budget_manage', 'budget_view', 'budget_review',
    'analytics_view_all', 'analytics_view_own',
    'data_manage', 'data_view', 'data_export',
    'team_manage', 'user_manage',
    'event_create', 'event_edit', 'event_manage',
    'kpi_track', 'city_view', 'city_analytics'
  )
ON CONFLICT DO NOTHING;

-- Assign municipality director permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Municipality Director'
  AND p.code IN (
    'challenge_view_all', 'challenge_create', 'challenge_edit', 'challenge_approve', 'challenge_assign', 'challenge_archive',
    'pilot_view_all', 'pilot_edit', 'pilot_approve', 'pilot_scale',
    'solution_view_all', 'solution_approve',
    'budget_manage', 'budget_view', 'budget_review', 'budget_approve',
    'analytics_view_all', 'analytics_advanced',
    'data_manage', 'data_view', 'data_export',
    'team_manage', 'strategic_approve',
    'event_create', 'event_edit', 'event_manage', 'event_approve',
    'kpi_track', 'city_manage', 'city_view', 'city_analytics'
  )
ON CONFLICT DO NOTHING;

-- Assign deputyship director permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Deputyship Director'
  AND p.code IN (
    'challenge_view_all', 'challenge_approve', 'challenge_assign',
    'pilot_view_all', 'pilot_approve', 'pilot_scale',
    'solution_view_all', 'solution_approve',
    'budget_approve', 'budget_view',
    'analytics_view_all', 'analytics_advanced', 'analytics_view_programs',
    'data_view', 'data_export', 'data_report',
    'access_executive_reports', 'view_national_analytics', 'view_all_dashboards',
    'strategic_approve', 'approve_strategic_initiatives',
    'compliance_monitor', 'compliance_review',
    'policy_create', 'policy_approve', 'policy_publish'
  )
ON CONFLICT DO NOTHING;

-- Assign deputyship manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Deputyship Manager'
  AND p.code IN (
    'challenge_view_all', 'challenge_review',
    'pilot_view_all', 'pilot_review',
    'solution_view_all',
    'budget_view', 'budget_review',
    'analytics_view_all', 'analytics_view_programs',
    'data_view', 'data_report',
    'policy_create', 'policy_edit'
  )
ON CONFLICT DO NOTHING;

-- Assign executive leadership permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Executive Leadership'
  AND p.code IN (
    'access_executive_reports', 'view_all_dashboards', 'view_national_analytics',
    'strategic_approve', 'approve_strategic_initiatives', 'budget_approve',
    'analytics_view_all', 'analytics_advanced',
    'compliance_monitor'
  )
ON CONFLICT DO NOTHING;

-- Assign pilot manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Pilot Manager'
  AND p.code IN (
    'pilot_create', 'pilot_edit', 'pilot_view_all', 'pilot_view_own',
    'pilot_approve', 'pilot_review', 'pilot_scale',
    'kpi_track', 'milestone_manage', 'risk_manage',
    'analytics_view_own'
  )
ON CONFLICT DO NOTHING;

-- Assign program manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Program Manager'
  AND p.code IN (
    'program_create', 'program_edit', 'program_view_all', 'program_manage',
    'pilot_view_all', 'pilot_create',
    'analytics_view_programs', 'analytics_view_own',
    'kpi_track', 'milestone_manage',
    'team_manage'
  )
ON CONFLICT DO NOTHING;

-- Assign data analyst permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Data Analyst'
  AND p.code IN (
    'analytics_view_all', 'analytics_advanced', 'analytics_view_programs',
    'data_view', 'data_export', 'data_report',
    'kpi_track'
  )
ON CONFLICT DO NOTHING;

-- Assign content manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Content Manager'
  AND p.code IN (
    'content_create', 'content_edit', 'content_moderate',
    'case_study_publish', 'news_publish',
    'media_manage', 'announcement_create', 'announcement_edit',
    'knowledge_create', 'knowledge_edit'
  )
ON CONFLICT DO NOTHING;

-- Assign moderator permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Moderator'
  AND p.code IN (
    'content_moderate', 'comment_moderate', 'idea_moderate',
    'vote_fraud_manage', 'idea_respond'
  )
ON CONFLICT DO NOTHING;

-- Assign communication manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Communication Manager'
  AND p.code IN (
    'announcement_create', 'announcement_edit',
    'news_publish', 'media_manage', 'comms_strategy',
    'event_create', 'event_edit'
  )
ON CONFLICT DO NOTHING;

-- Assign auditor permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Auditor'
  AND p.code IN (
    'audit_view', 'audit_access', 'view_all_logs',
    'compliance_monitor', 'compliance_review',
    'expense_audit', 'financial_view_all'
  )
ON CONFLICT DO NOTHING;

-- Assign budget officer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Budget Officer'
  AND p.code IN (
    'budget_view', 'budget_review', 'budget_manage',
    'financial_view_all', 'cost_analysis',
    'disbursement_manage', 'expense_audit'
  )
ON CONFLICT DO NOTHING;

-- Assign living lab manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Living Lab Manager'
  AND p.code IN (
    'livinglab_create', 'livinglab_edit', 'livinglab_manage', 'livinglab_access',
    'lab_manage', 'lab_access', 'equipment_allocate',
    'booking_approve', 'pilot_create'
  )
ON CONFLICT DO NOTHING;

-- Assign sandbox manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Sandbox Manager'
  AND p.code IN (
    'sandbox_create', 'sandbox_edit', 'sandbox_manage', 'sandbox_view',
    'exemption_approve', 'pilot_create'
  )
ON CONFLICT DO NOTHING;

-- Assign R&D manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'R&D Manager'
  AND p.code IN (
    'rd_project_create', 'rd_project_edit', 'rd_project_view',
    'rd_proposal_create', 'rd_proposal_review',
    'call_create', 'funding_view',
    'knowledge_create', 'knowledge_edit'
  )
ON CONFLICT DO NOTHING;

-- Assign investor permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Investor'
  AND p.code IN (
    'solution_view_public', 'pilot_view', 'funding_view',
    'analytics_view_own', 'demo_request'
  )
ON CONFLICT DO NOTHING;

-- Assign citizen engagement manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Citizen Engagement Manager'
  AND p.code IN (
    'citizen_engagement_analytics', 'idea_moderate', 'idea_respond', 'idea_convert',
    'event_create', 'event_edit', 'event_manage',
    'content_create', 'announcement_create'
  )
ON CONFLICT DO NOTHING;
