
-- Add all missing permissions to the permissions table
-- These are used in roles but don't exist in the permissions table

INSERT INTO public.permissions (code, name, name_ar, entity_type, action, description, is_active) VALUES
-- Analytics & Dashboard
('analytics_view', 'View Analytics', 'عرض التحليلات', 'analytics', 'view', 'View analytics dashboards', true),
('analytics_view_all', 'View All Analytics', 'عرض جميع التحليلات', 'analytics', 'view_all', 'View all analytics across platform', true),
('analytics_view_own', 'View Own Analytics', 'عرض التحليلات الخاصة', 'analytics', 'view_own', 'View own analytics', true),
('analytics_advanced', 'Advanced Analytics', 'تحليلات متقدمة', 'analytics', 'advanced', 'Access advanced analytics features', true),
('dashboard_view', 'View Dashboard', 'عرض لوحة القيادة', 'dashboard', 'view', 'View dashboards', true),
('reports_view_all', 'View All Reports', 'عرض جميع التقارير', 'reports', 'view_all', 'View all reports', true),

-- Challenge permissions
('challenge_view', 'View Challenges', 'عرض التحديات', 'challenge', 'view', 'View challenges', true),
('challenge_edit', 'Edit Challenges', 'تعديل التحديات', 'challenge', 'edit', 'Edit challenges', true),
('challenge_review', 'Review Challenges', 'مراجعة التحديات', 'challenge', 'review', 'Review challenges', true),
('challenge_assign', 'Assign Challenges', 'تعيين التحديات', 'challenge', 'assign', 'Assign challenges', true),
('challenge_archive', 'Archive Challenges', 'أرشفة التحديات', 'challenge', 'archive', 'Archive challenges', true),
('challenge_submit', 'Submit Challenges', 'تقديم التحديات', 'challenge', 'submit', 'Submit challenges', true),
('challenge_view_own', 'View Own Challenges', 'عرض التحديات الخاصة', 'challenge', 'view_own', 'View own challenges', true),
('challenge_edit_own', 'Edit Own Challenges', 'تعديل التحديات الخاصة', 'challenge', 'edit_own', 'Edit own challenges', true),
('challenge_view_assigned', 'View Assigned Challenges', 'عرض التحديات المعينة', 'challenge', 'view_assigned', 'View assigned challenges', true),
('challenge_view_detail', 'View Challenge Details', 'عرض تفاصيل التحديات', 'challenge', 'view_detail', 'View challenge details', true),
('challenge_view_public', 'View Public Challenges', 'عرض التحديات العامة', 'challenge', 'view_public', 'View public challenges', true),
('challenge_assign_track', 'Assign Challenge Track', 'تعيين مسار التحدي', 'challenge', 'assign_track', 'Assign challenge to track', true),
('challenge_express_interest', 'Express Interest in Challenges', 'إبداء الاهتمام بالتحديات', 'challenge', 'express_interest', 'Express interest in challenges', true),
('challenge_manage_city', 'Manage City Challenges', 'إدارة تحديات المدينة', 'challenge', 'manage_city', 'Manage challenges for city', true),

-- Pilot permissions  
('pilot_view', 'View Pilots', 'عرض التجارب', 'pilot', 'view', 'View pilots', true),
('pilot_edit', 'Edit Pilots', 'تعديل التجارب', 'pilot', 'edit', 'Edit pilots', true),
('pilot_monitor', 'Monitor Pilots', 'مراقبة التجارب', 'pilot', 'monitor', 'Monitor pilot progress', true),
('pilot_support', 'Support Pilots', 'دعم التجارب', 'pilot', 'support', 'Support pilot execution', true),
('pilot_view_own', 'View Own Pilots', 'عرض التجارب الخاصة', 'pilot', 'view_own', 'View own pilots', true),
('pilot_view_assigned', 'View Assigned Pilots', 'عرض التجارب المعينة', 'pilot', 'view_assigned', 'View assigned pilots', true),
('pilot_view_detail', 'View Pilot Details', 'عرض تفاصيل التجارب', 'pilot', 'view_detail', 'View pilot details', true),
('pilot_manage', 'Manage Pilots', 'إدارة التجارب', 'pilot', 'manage', 'Manage pilots', true),
('pilot_manage_city', 'Manage City Pilots', 'إدارة تجارب المدينة', 'pilot', 'manage_city', 'Manage pilots for city', true),
('pilot_technical_review', 'Technical Pilot Review', 'مراجعة التجارب التقنية', 'pilot', 'technical_review', 'Technical review of pilots', true),
('pilot_view_sandbox', 'View Sandbox Pilots', 'عرض تجارب البيئة الاختبارية', 'pilot', 'view_sandbox', 'View sandbox pilots', true),

-- Solution permissions
('solution_view', 'View Solutions', 'عرض الحلول', 'solution', 'view', 'View solutions', true),
('solution_edit', 'Edit Solutions', 'تعديل الحلول', 'solution', 'edit', 'Edit solutions', true),
('solution_view_own', 'View Own Solutions', 'عرض الحلول الخاصة', 'solution', 'view_own', 'View own solutions', true),
('solution_edit_own', 'Edit Own Solutions', 'تعديل الحلول الخاصة', 'solution', 'edit_own', 'Edit own solutions', true),
('solution_submit', 'Submit Solutions', 'تقديم الحلول', 'solution', 'submit', 'Submit solutions', true),
('solution_view_detail', 'View Solution Details', 'عرض تفاصيل الحلول', 'solution', 'view_detail', 'View solution details', true),
('solution_verify', 'Verify Solutions', 'التحقق من الحلول', 'solution', 'verify', 'Verify solutions', true),

-- Program permissions
('program_view', 'View Programs', 'عرض البرامج', 'program', 'view', 'View programs', true),
('program_edit', 'Edit Programs', 'تعديل البرامج', 'program', 'edit', 'Edit programs', true),
('program_manage', 'Manage Programs', 'إدارة البرامج', 'program', 'manage', 'Manage programs', true),
('program_view_own', 'View Own Programs', 'عرض البرامج الخاصة', 'program', 'view_own', 'View own programs', true),

-- R&D permissions
('rd_view', 'View R&D', 'عرض البحث والتطوير', 'rd', 'view', 'View R&D projects', true),
('rd_edit', 'Edit R&D', 'تعديل البحث والتطوير', 'rd', 'edit', 'Edit R&D projects', true),
('rd_evaluate', 'Evaluate R&D', 'تقييم البحث والتطوير', 'rd', 'evaluate', 'Evaluate R&D', true),
('rd_proposal_view_assigned', 'View Assigned R&D Proposals', 'عرض مقترحات البحث المعينة', 'rd_proposal', 'view_assigned', 'View assigned R&D proposals', true),
('rd_proposal_view_all', 'View All R&D Proposals', 'عرض جميع مقترحات البحث', 'rd_proposal', 'view_all', 'View all R&D proposals', true),

-- Citizen permissions
('citizen_idea_submit', 'Submit Citizen Ideas', 'تقديم أفكار المواطنين', 'citizen', 'idea_submit', 'Submit citizen ideas', true),
('citizen_idea_vote', 'Vote on Citizen Ideas', 'التصويت على أفكار المواطنين', 'citizen', 'idea_vote', 'Vote on citizen ideas', true),
('citizen_idea_comment', 'Comment on Citizen Ideas', 'التعليق على أفكار المواطنين', 'citizen', 'idea_comment', 'Comment on citizen ideas', true),
('citizen_feedback_submit', 'Submit Citizen Feedback', 'تقديم ملاحظات المواطنين', 'citizen', 'feedback_submit', 'Submit citizen feedback', true),
('citizen_dashboard_view', 'View Citizen Dashboard', 'عرض لوحة المواطن', 'citizen', 'dashboard_view', 'View citizen dashboard', true),
('citizen_engagement_analytics', 'Citizen Engagement Analytics', 'تحليلات مشاركة المواطنين', 'citizen', 'engagement_analytics', 'View citizen engagement analytics', true),

-- Expert permissions
('expert_view_assignments', 'View Expert Assignments', 'عرض تعيينات الخبراء', 'expert', 'view_assignments', 'View expert assignments', true),
('expert_view_all', 'View All Experts', 'عرض جميع الخبراء', 'expert', 'view_all', 'View all experts', true),

-- Living Lab permissions
('livinglab_view', 'View Living Labs', 'عرض المختبرات الحية', 'livinglab', 'view', 'View living labs', true),
('livinglab_edit', 'Edit Living Labs', 'تعديل المختبرات الحية', 'livinglab', 'edit', 'Edit living labs', true),
('livinglab_manage', 'Manage Living Labs', 'إدارة المختبرات الحية', 'livinglab', 'manage', 'Manage living labs', true),
('livinglab_access', 'Access Living Labs', 'الوصول للمختبرات الحية', 'livinglab', 'access', 'Access living labs', true),

-- Sandbox permissions
('sandbox_view', 'View Sandboxes', 'عرض البيئات الاختبارية', 'sandbox', 'view', 'View sandboxes', true),
('sandbox_access', 'Access Sandboxes', 'الوصول للبيئات الاختبارية', 'sandbox', 'access', 'Access sandboxes', true),
('sandbox_edit', 'Edit Sandboxes', 'تعديل البيئات الاختبارية', 'sandbox', 'edit', 'Edit sandboxes', true),
('sandbox_monitor', 'Monitor Sandboxes', 'مراقبة البيئات الاختبارية', 'sandbox', 'monitor', 'Monitor sandboxes', true),
('sandbox_manage', 'Manage Sandboxes', 'إدارة البيئات الاختبارية', 'sandbox', 'manage', 'Manage sandboxes', true),

-- Admin permissions
('manage_users', 'Manage Users', 'إدارة المستخدمين', 'admin', 'manage_users', 'Manage platform users', true),
('manage_roles', 'Manage Roles', 'إدارة الأدوار', 'admin', 'manage_roles', 'Manage platform roles', true),
('manage_system_config', 'Manage System Config', 'إدارة إعدادات النظام', 'admin', 'manage_config', 'Manage system configuration', true),
('manage_integrations', 'Manage Integrations', 'إدارة التكاملات', 'admin', 'manage_integrations', 'Manage integrations', true),
('access_all_data', 'Access All Data', 'الوصول لجميع البيانات', 'admin', 'access_all', 'Access all platform data', true),
('system_config', 'System Configuration', 'تكوين النظام', 'admin', 'config', 'Configure system settings', true),
('user_manage', 'User Management', 'إدارة المستخدمين', 'admin', 'user_manage', 'Manage users', true),
('role_manage', 'Role Management', 'إدارة الأدوار', 'admin', 'role_manage', 'Manage roles', true),
('platform_settings', 'Platform Settings', 'إعدادات المنصة', 'admin', 'platform_settings', 'Manage platform settings', true),

-- Executive permissions
('view_all_dashboards', 'View All Dashboards', 'عرض جميع لوحات القيادة', 'executive', 'view_dashboards', 'View all dashboards', true),
('approve_strategic_initiatives', 'Approve Strategic Initiatives', 'اعتماد المبادرات الاستراتيجية', 'executive', 'approve_strategic', 'Approve strategic initiatives', true),
('access_executive_reports', 'Access Executive Reports', 'الوصول للتقارير التنفيذية', 'executive', 'access_reports', 'Access executive reports', true),
('view_national_analytics', 'View National Analytics', 'عرض التحليلات الوطنية', 'executive', 'view_national', 'View national-level analytics', true),
('strategic_approve', 'Strategic Approval', 'الموافقة الاستراتيجية', 'executive', 'strategic_approve', 'Strategic level approvals', true),
('budget_approve', 'Budget Approval', 'اعتماد الميزانية', 'executive', 'budget_approve', 'Approve budgets', true),
('mii_view', 'View MII', 'عرض مؤشر الابتكار', 'mii', 'view', 'View MII metrics', true),
('mii_edit', 'Edit MII', 'تعديل مؤشر الابتكار', 'mii', 'edit', 'Edit MII metrics', true),

-- Organization permissions
('org_view', 'View Organizations', 'عرض المنظمات', 'organization', 'view', 'View organizations', true),
('org_edit', 'Edit Organizations', 'تعديل المنظمات', 'organization', 'edit', 'Edit organizations', true),
('org_verify', 'Verify Organizations', 'التحقق من المنظمات', 'organization', 'verify', 'Verify organizations', true),

-- Data management
('data_view', 'View Data', 'عرض البيانات', 'data', 'view', 'View data', true),
('data_edit', 'Edit Data', 'تعديل البيانات', 'data', 'edit', 'Edit data', true),
('data_manage', 'Manage Data', 'إدارة البيانات', 'data', 'manage', 'Manage data', true),
('data_quality', 'Data Quality', 'جودة البيانات', 'data', 'quality', 'Manage data quality', true),
('data_report', 'Data Reports', 'تقارير البيانات', 'data', 'report', 'Generate data reports', true),
('bulk_import', 'Bulk Import', 'استيراد جماعي', 'data', 'bulk_import', 'Bulk import data', true),
('master_data', 'Master Data', 'البيانات الرئيسية', 'data', 'master', 'Manage master data', true),

-- Report permissions
('report_view', 'View Reports', 'عرض التقارير', 'report', 'view', 'View reports', true),
('report_create', 'Create Reports', 'إنشاء التقارير', 'report', 'create', 'Create reports', true),
('report_export', 'Export Reports', 'تصدير التقارير', 'report', 'export', 'Export reports', true),

-- User & Profile permissions
('user_view', 'View Users', 'عرض المستخدمين', 'user', 'view', 'View users', true),
('profile_edit', 'Edit Profile', 'تعديل الملف الشخصي', 'profile', 'edit', 'Edit own profile', true),
('profile_manage', 'Manage Profiles', 'إدارة الملفات الشخصية', 'profile', 'manage', 'Manage profiles', true),

-- Policy permissions
('view_all_policies', 'View All Policies', 'عرض جميع السياسات', 'policy', 'view_all', 'View all policies', true),
('create_policy', 'Create Policy', 'إنشاء سياسة', 'policy', 'create', 'Create policies', true),
('edit_own_policy', 'Edit Own Policy', 'تعديل السياسة الخاصة', 'policy', 'edit_own', 'Edit own policies', true),
('approve_ministry', 'Ministry Approval', 'موافقة الوزارة', 'policy', 'approve_ministry', 'Ministry level approval', true),
('approve_council', 'Council Approval', 'موافقة المجلس', 'policy', 'approve_council', 'Council level approval', true),
('publish_policy', 'Publish Policy', 'نشر السياسة', 'policy', 'publish', 'Publish policies', true),
('submit_for_review', 'Submit for Review', 'تقديم للمراجعة', 'policy', 'submit_review', 'Submit for review', true),
('vote_on_policy', 'Vote on Policy', 'التصويت على السياسة', 'policy', 'vote', 'Vote on policies', true),
('view_sensitive_data', 'View Sensitive Data', 'عرض البيانات الحساسة', 'policy', 'view_sensitive', 'View sensitive data', true),

-- Security & Audit
('security_manage', 'Manage Security', 'إدارة الأمان', 'security', 'manage', 'Manage security settings', true),
('security_audit', 'Security Audit', 'تدقيق الأمان', 'security', 'audit', 'Perform security audits', true),
('audit_access', 'Audit Access', 'الوصول للتدقيق', 'audit', 'access', 'Access audit logs', true),
('audit_view', 'View Audits', 'عرض التدقيق', 'audit', 'view', 'View audit records', true),
('compliance_review', 'Compliance Review', 'مراجعة الامتثال', 'compliance', 'review', 'Review compliance', true),
('compliance_monitor', 'Compliance Monitor', 'مراقبة الامتثال', 'compliance', 'monitor', 'Monitor compliance', true),
('policy_define', 'Define Policies', 'تحديد السياسات', 'security', 'policy_define', 'Define security policies', true),
('view_all_logs', 'View All Logs', 'عرض جميع السجلات', 'audit', 'view_all', 'View all logs', true),

-- Provider/Startup permissions
('provider_dashboard', 'Provider Dashboard', 'لوحة المزود', 'provider', 'dashboard', 'Access provider dashboard', true),
('provider_manage', 'Manage Provider', 'إدارة المزود', 'provider', 'manage', 'Manage provider settings', true),
('provider_submit', 'Provider Submit', 'تقديم المزود', 'provider', 'submit', 'Submit provider applications', true),
('provider_view', 'View Providers', 'عرض المزودين', 'provider', 'view', 'View providers', true),
('startup_accelerator_apply', 'Apply to Accelerator', 'التقديم للمسرعة', 'startup', 'accelerator_apply', 'Apply to accelerator', true),
('startup_cohort_view', 'View Startup Cohort', 'عرض دفعة الشركات الناشئة', 'startup', 'cohort_view', 'View startup cohort', true),
('cohort_manage', 'Manage Cohorts', 'إدارة الدفعات', 'startup', 'cohort_manage', 'Manage startup cohorts', true),
('cohort_assess', 'Assess Cohorts', 'تقييم الدفعات', 'startup', 'cohort_assess', 'Assess startup cohorts', true),
('funding_view', 'View Funding', 'عرض التمويل', 'funding', 'view', 'View funding information', true),
('proposal_submit', 'Submit Proposals', 'تقديم المقترحات', 'proposal', 'submit', 'Submit proposals', true),
('proposal_manage', 'Manage Proposals', 'إدارة المقترحات', 'proposal', 'manage', 'Manage proposals', true),
('proposal_view', 'View Proposals', 'عرض المقترحات', 'proposal', 'view', 'View proposals', true),
('demo_request', 'Request Demo', 'طلب عرض توضيحي', 'demo', 'request', 'Request solution demos', true),
('contract_view', 'View Contracts', 'عرض العقود', 'contract', 'view', 'View contracts', true),
('contract_sign', 'Sign Contracts', 'توقيع العقود', 'contract', 'sign', 'Sign contracts', true),

-- Communication
('announcement_create', 'Create Announcements', 'إنشاء الإعلانات', 'communication', 'announcement_create', 'Create announcements', true),
('announcement_edit', 'Edit Announcements', 'تعديل الإعلانات', 'communication', 'announcement_edit', 'Edit announcements', true),
('news_publish', 'Publish News', 'نشر الأخبار', 'communication', 'news_publish', 'Publish news', true),
('media_manage', 'Manage Media', 'إدارة الوسائط', 'communication', 'media_manage', 'Manage media files', true),
('comms_strategy', 'Communications Strategy', 'استراتيجية الاتصالات', 'communication', 'strategy', 'Manage comms strategy', true),

-- Content & Knowledge
('content_create', 'Create Content', 'إنشاء المحتوى', 'content', 'create', 'Create content', true),
('content_edit', 'Edit Content', 'تعديل المحتوى', 'content', 'edit', 'Edit content', true),
('content_moderate', 'Moderate Content', 'إدارة المحتوى', 'content', 'moderate', 'Moderate content', true),
('knowledge_create', 'Create Knowledge', 'إنشاء المعرفة', 'knowledge', 'create', 'Create knowledge articles', true),
('knowledge_edit', 'Edit Knowledge', 'تعديل المعرفة', 'knowledge', 'edit', 'Edit knowledge articles', true),
('comment_moderate', 'Moderate Comments', 'إدارة التعليقات', 'content', 'comment_moderate', 'Moderate comments', true),
('vote_fraud_manage', 'Manage Vote Fraud', 'إدارة الاحتيال في التصويت', 'content', 'vote_fraud', 'Manage vote fraud', true),
('case_study_publish', 'Publish Case Studies', 'نشر دراسات الحالة', 'content', 'case_study_publish', 'Publish case studies', true),

-- Financial
('budget_review', 'Review Budgets', 'مراجعة الميزانيات', 'financial', 'budget_review', 'Review budgets', true),
('financial_approve', 'Financial Approval', 'الموافقة المالية', 'financial', 'approve', 'Approve financial items', true),
('financial_view_all', 'View All Financials', 'عرض جميع الماليات', 'financial', 'view_all', 'View all financial data', true),
('cost_analysis', 'Cost Analysis', 'تحليل التكاليف', 'financial', 'cost_analysis', 'Perform cost analysis', true),
('budget_approve_city', 'Approve City Budget', 'اعتماد ميزانية المدينة', 'financial', 'budget_approve_city', 'Approve city budgets', true),
('disbursement_manage', 'Manage Disbursements', 'إدارة المدفوعات', 'financial', 'disbursement', 'Manage disbursements', true),
('expense_audit', 'Audit Expenses', 'تدقيق المصروفات', 'financial', 'expense_audit', 'Audit expenses', true),

-- Idea management
('idea_moderate', 'Moderate Ideas', 'إدارة الأفكار', 'idea', 'moderate', 'Moderate ideas', true),
('idea_respond', 'Respond to Ideas', 'الرد على الأفكار', 'idea', 'respond', 'Respond to ideas', true),
('idea_evaluate', 'Evaluate Ideas', 'تقييم الأفكار', 'idea', 'evaluate', 'Evaluate ideas', true),
('idea_convert', 'Convert Ideas', 'تحويل الأفكار', 'idea', 'convert', 'Convert ideas to challenges', true),

-- City management  
('city_analytics', 'City Analytics', 'تحليلات المدينة', 'city', 'analytics', 'View city analytics', true),
('city_view', 'View City', 'عرض المدينة', 'city', 'view', 'View city information', true),
('city_manage', 'Manage City', 'إدارة المدينة', 'city', 'manage', 'Manage city settings', true),

-- Strategy & Planning
('strategy_manage', 'Manage Strategy', 'إدارة الاستراتيجية', 'strategy', 'manage', 'Manage strategic planning', true),
('portfolio_view_all', 'View All Portfolios', 'عرض جميع المحافظ', 'strategy', 'portfolio_view', 'View all portfolios', true),
('approve_initiatives', 'Approve Initiatives', 'اعتماد المبادرات', 'strategy', 'approve_initiatives', 'Approve initiatives', true),
('plan_create', 'Create Plans', 'إنشاء الخطط', 'strategy', 'plan_create', 'Create strategic plans', true),

-- AI & Matching
('ai_configure', 'Configure AI', 'تكوين الذكاء الاصطناعي', 'ai', 'configure', 'Configure AI settings', true),
('matching_manage', 'Manage Matching', 'إدارة المطابقة', 'ai', 'matching', 'Manage matching algorithms', true),
('model_tune', 'Tune Models', 'ضبط النماذج', 'ai', 'tune', 'Tune AI models', true),
('matchmaker_manage', 'Manage Matchmaker', 'إدارة المطابق', 'ai', 'matchmaker', 'Manage matchmaker', true),

-- Tech & Infrastructure
('architecture_review', 'Architecture Review', 'مراجعة البنية', 'tech', 'architecture', 'Review architecture', true),
('deployment_validate', 'Validate Deployment', 'التحقق من النشر', 'tech', 'deployment', 'Validate deployments', true),
('tech_monitor', 'Tech Monitoring', 'مراقبة التقنية', 'tech', 'monitor', 'Monitor technical systems', true),
('tech_support', 'Tech Support', 'الدعم التقني', 'tech', 'support', 'Provide tech support', true),
('tech_advise', 'Tech Advising', 'الاستشارات التقنية', 'tech', 'advise', 'Provide tech advice', true),
('incident_manage', 'Manage Incidents', 'إدارة الحوادث', 'tech', 'incident', 'Manage incidents', true),

-- Lab & Equipment
('lab_access', 'Lab Access', 'الوصول للمختبر', 'lab', 'access', 'Access labs', true),
('lab_manage', 'Manage Labs', 'إدارة المختبرات', 'lab', 'manage', 'Manage labs', true),
('equipment_allocate', 'Allocate Equipment', 'تخصيص المعدات', 'lab', 'equipment', 'Allocate equipment', true),

-- Partnerships
('partnership_view', 'View Partnerships', 'عرض الشراكات', 'partnership', 'view', 'View partnerships', true),
('partnership_create', 'Create Partnerships', 'إنشاء الشراكات', 'partnership', 'create', 'Create partnerships', true),
('partnership_edit', 'Edit Partnerships', 'تعديل الشراكات', 'partnership', 'edit', 'Edit partnerships', true),

-- Legal & Compliance
('approve_legal_review', 'Approve Legal Review', 'اعتماد المراجعة القانونية', 'legal', 'approve', 'Approve legal reviews', true),
('exemption_approve', 'Approve Exemptions', 'اعتماد الاستثناءات', 'legal', 'exemption', 'Approve exemptions', true),

-- Misc
('call_create', 'Create Calls', 'إنشاء المكالمات', 'call', 'create', 'Create calls', true),
('application_review', 'Review Applications', 'مراجعة الطلبات', 'application', 'review', 'Review applications', true),
('booking_approve', 'Approve Bookings', 'اعتماد الحجوزات', 'booking', 'approve', 'Approve bookings', true),
('kpi_track', 'Track KPIs', 'تتبع مؤشرات الأداء', 'kpi', 'track', 'Track KPIs', true),
('conversion_monitor', 'Monitor Conversions', 'مراقبة التحويلات', 'monitoring', 'conversion', 'Monitor conversions', true),
('engagement_track', 'Track Engagement', 'تتبع المشاركة', 'monitoring', 'engagement', 'Track engagement', true),
('edit_implementation_data', 'Edit Implementation Data', 'تعديل بيانات التنفيذ', 'implementation', 'edit', 'Edit implementation data', true),
('analytics_view_programs', 'View Program Analytics', 'عرض تحليلات البرامج', 'analytics', 'view_programs', 'View program analytics', true)

ON CONFLICT (code) DO NOTHING;
