-- Add missing permissions that are used in code but don't exist in database
INSERT INTO permissions (code, name, name_ar, description) VALUES
  ('contract_approve', 'Approve Contracts', 'الموافقة على العقود', 'Approve contracts'),
  ('vendor_approve', 'Approve Vendors', 'الموافقة على الموردين', 'Approve vendors'),
  ('invoice_approve', 'Approve Invoices', 'الموافقة على الفواتير', 'Approve invoices'),
  ('invoice_view_all', 'View All Invoices', 'عرض جميع الفواتير', 'View all invoices'),
  ('risk_view_all', 'View All Risks', 'عرض جميع المخاطر', 'View all risks'),
  ('audit_view_all', 'View All Audits', 'عرض جميع التدقيقات', 'View all audits'),
  ('rd_proposal_approve', 'Approve R&D Proposals', 'الموافقة على مقترحات البحث', 'Approve R&D proposals'),
  ('matchmaker_approve', 'Approve Matchmaker', 'الموافقة على التطابقات', 'Approve matchmaker matches'),
  ('platform_admin', 'Platform Admin', 'مسؤول المنصة', 'Platform administration'),
  ('rd_view_portfolio', 'View R&D Portfolio', 'عرض محفظة البحث', 'View R&D portfolio'),
  ('rd_project_edit', 'Edit R&D Projects', 'تحرير مشاريع البحث', 'Edit R&D projects'),
  ('scaling_plan_view', 'View Scaling Plans', 'عرض خطط التوسع', 'View scaling plans'),
  ('communications_manage', 'Manage Communications', 'إدارة الاتصالات', 'Manage communications'),
  ('executive_view', 'View Executive Dashboard', 'عرض التنفيذي', 'View executive dashboard'),
  ('team_view_all', 'View All Teams', 'عرض جميع الفرق', 'View all teams'),
  ('case_study_create', 'Create Case Studies', 'إنشاء دراسة حالة', 'Create case studies'),
  ('idea_view_all', 'View All Ideas', 'عرض جميع الأفكار', 'View all ideas'),
  ('partnership_view_all', 'View All Partnerships', 'عرض جميع الشراكات', 'View all partnerships'),
  ('portfolio_view', 'View Portfolio', 'عرض المحفظة', 'View portfolio'),
  ('stakeholder_view_all', 'View All Stakeholders', 'عرض جميع أصحاب المصلحة', 'View all stakeholders'),
  ('org_view_all', 'View All Organizations', 'عرض جميع المنظمات', 'View all organizations'),
  ('manage_content', 'Manage Content', 'إدارة المحتوى', 'Manage content'),
  ('email_templates_manage', 'Manage Email Templates', 'إدارة قوالب البريد', 'Manage email templates'),
  ('expert_manage_panel', 'Manage Expert Panels', 'إدارة لجان الخبراء', 'Manage expert panels'),
  ('expert_manage', 'Manage Experts', 'إدارة الخبراء', 'Manage experts'),
  ('expert_view', 'View Experts', 'عرض الخبراء', 'View experts'),
  ('expert_register', 'Register as Expert', 'تسجيل الخبراء', 'Register as expert'),
  ('pilot_scale_approve', 'Approve Pilot Scaling', 'الموافقة على توسيع التجارب', 'Approve pilot scaling'),
  ('collaboration_manage', 'Manage Collaboration', 'إدارة التعاون', 'Manage collaboration'),
  ('collaboration_view', 'View Collaboration', 'عرض التعاون', 'View collaboration'),
  ('mentorship_manage', 'Manage Mentorship', 'إدارة الإرشاد', 'Manage mentorship'),
  ('mentorship_view', 'View Mentorship', 'عرض الإرشاد', 'View mentorship'),
  ('scaling_plan_create', 'Create Scaling Plans', 'إنشاء خطط التوسع', 'Create scaling plans'),
  ('scaling_plan_edit', 'Edit Scaling Plans', 'تحرير خطط التوسع', 'Edit scaling plans'),
  ('scaling_plan_manage', 'Manage Scaling Plans', 'إدارة خطط التوسع', 'Manage scaling plans'),
  ('create_pilot', 'Create Pilot', 'إنشاء تجربة', 'Create new pilots')
ON CONFLICT (code) DO NOTHING;

-- Assign appropriate permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin' 
  AND p.code IN (
    'contract_approve', 'vendor_approve', 'invoice_approve', 'invoice_view_all',
    'risk_view_all', 'audit_view_all', 'rd_proposal_approve', 'matchmaker_approve',
    'platform_admin', 'rd_view_portfolio', 'rd_project_edit', 'scaling_plan_view',
    'communications_manage', 'executive_view', 'team_view_all', 'case_study_create',
    'idea_view_all', 'partnership_view_all', 'portfolio_view', 'stakeholder_view_all',
    'org_view_all', 'manage_content', 'email_templates_manage', 'expert_manage_panel',
    'expert_manage', 'expert_view', 'expert_register', 'pilot_scale_approve',
    'collaboration_manage', 'collaboration_view', 'mentorship_manage', 'mentorship_view',
    'scaling_plan_create', 'scaling_plan_edit', 'scaling_plan_manage', 'create_pilot'
  )
ON CONFLICT DO NOTHING;

-- Assign view permissions to Municipality Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Municipality Admin' 
  AND p.code IN (
    'invoice_view_all', 'risk_view_all', 'audit_view_all', 'rd_view_portfolio',
    'scaling_plan_view', 'team_view_all', 'idea_view_all', 'partnership_view_all',
    'portfolio_view', 'stakeholder_view_all', 'org_view_all', 'expert_view',
    'collaboration_view', 'mentorship_view', 'create_pilot'
  )
ON CONFLICT DO NOTHING;

-- Assign permissions to Deputyship Director
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Deputyship Director' 
  AND p.code IN (
    'executive_view', 'invoice_view_all', 'risk_view_all', 'audit_view_all',
    'rd_view_portfolio', 'scaling_plan_view', 'team_view_all', 'idea_view_all',
    'partnership_view_all', 'portfolio_view', 'stakeholder_view_all', 'org_view_all',
    'expert_view', 'collaboration_view', 'mentorship_view', 'rd_proposal_approve',
    'matchmaker_approve', 'pilot_scale_approve', 'contract_approve', 'create_pilot'
  )
ON CONFLICT DO NOTHING;

-- Assign view permissions to Executive Leadership
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Executive Leadership' 
  AND p.code IN (
    'executive_view', 'portfolio_view', 'risk_view_all', 'audit_view_all',
    'team_view_all', 'stakeholder_view_all', 'org_view_all'
  )
ON CONFLICT DO NOTHING;