// Platform systems configuration - all 48 systems for validation

export const PLATFORM_SYSTEMS = [
  // Core Innovation Hubs (6)
  { id: 'challenges', name: { en: 'Challenges Hub', ar: 'مركز التحديات' }, tables: ['challenges', 'challenge_proposals', 'challenge_interests', 'challenge_activities', 'challenge_attachments', 'challenge_solution_matches'] },
  { id: 'pilots', name: { en: 'Pilots Hub', ar: 'مركز التجارب' }, tables: ['pilots', 'pilot_approvals', 'pilot_collaborations', 'pilot_documents', 'pilot_expenses', 'pilot_issues', 'pilot_kpis', 'pilot_kpi_datapoints'] },
  { id: 'solutions', name: { en: 'Solutions Hub', ar: 'مركز الحلول' }, tables: ['solutions', 'solution_cases', 'solution_interests', 'solution_reviews', 'solution_version_history'] },
  { id: 'programs', name: { en: 'Programs Hub', ar: 'مركز البرامج' }, tables: ['programs', 'program_applications', 'program_mentorships', 'program_pilot_links'] },
  { id: 'living-labs', name: { en: 'Living Labs', ar: 'المختبرات الحية' }, tables: ['living_labs', 'living_lab_bookings', 'living_lab_resource_bookings'] },
  { id: 'sandboxes', name: { en: 'Regulatory Sandboxes', ar: 'البيئات التجريبية' }, tables: ['sandboxes', 'sandbox_applications', 'sandbox_collaborators', 'sandbox_incidents', 'sandbox_monitoring_data', 'sandbox_project_milestones'] },
  
  // R&D & Research (2)
  { id: 'rd-projects', name: { en: 'R&D Projects', ar: 'مشاريع البحث والتطوير' }, tables: ['rd_projects', 'rd_calls', 'rd_proposals', 'researcher_profiles'] },
  { id: 'ideas', name: { en: 'Innovation Proposals', ar: 'مقترحات الابتكار' }, tables: ['innovation_proposals', 'idea_comments'] },
  
  // Entities & Geography (4)
  { id: 'organizations', name: { en: 'Organizations', ar: 'المنظمات' }, tables: ['organizations', 'providers', 'organization_partnerships'] },
  { id: 'municipalities', name: { en: 'Municipalities', ar: 'البلديات' }, tables: ['municipalities', 'cities', 'regions', 'municipality_staff_profiles', 'deputyships'] },
  { id: 'ministries', name: { en: 'Ministries', ar: 'الوزارات' }, tables: ['ministries', 'services', 'domains'] },
  { id: 'sectors', name: { en: 'Sectors & Taxonomy', ar: 'القطاعات والتصنيف' }, tables: ['sectors', 'sector_strategies'] },
  
  // Users & Access Control (2)
  { id: 'users-access', name: { en: 'Users & Access', ar: 'المستخدمين والوصول' }, tables: ['user_profiles', 'user_roles', 'roles', 'permissions', 'role_permissions', 'role_requests', 'delegation_rules', 'auto_approval_rules'] },
  { id: 'citizen-engagement', name: { en: 'Citizen Engagement', ar: 'مشاركة المواطنين' }, tables: ['citizen_ideas', 'citizen_feedback', 'citizen_votes', 'citizen_profiles', 'citizen_badges', 'citizen_points', 'citizen_notifications', 'citizen_pilot_enrollments'] },
  
  // Experts & Evaluations (2)
  { id: 'experts', name: { en: 'Experts Hub', ar: 'مركز الخبراء' }, tables: ['expert_profiles', 'expert_panels', 'expert_assignments', 'expert_evaluations', 'custom_expertise_areas'] },
  { id: 'evaluations', name: { en: 'Evaluations', ar: 'التقييمات' }, tables: ['evaluation_templates', 'matchmaker_evaluation_sessions'] },
  
  // Knowledge & Content (4)
  { id: 'knowledge', name: { en: 'Knowledge Base', ar: 'قاعدة المعرفة' }, tables: ['knowledge_documents', 'case_studies', 'impact_stories'] },
  { id: 'events', name: { en: 'Events', ar: 'الفعاليات' }, tables: ['events', 'event_registrations'] },
  { id: 'news', name: { en: 'News & Content', ar: 'الأخبار والمحتوى' }, tables: ['news_articles'] },
  { id: 'policies', name: { en: 'Policies', ar: 'السياسات' }, tables: ['policy_documents', 'policy_recommendations', 'policy_comments', 'policy_templates', 'regulatory_exemptions', 'exemption_audit_logs'] },
  
  // Communications & Notifications (2)
  { id: 'communications', name: { en: 'Communications', ar: 'الاتصالات' }, tables: ['email_templates', 'email_logs', 'email_campaigns', 'campaign_recipients', 'email_queue', 'email_digest_queue', 'email_settings', 'email_trigger_config', 'communication_plans', 'communication_analytics', 'communication_notifications'] },
  { id: 'notifications', name: { en: 'Notifications', ar: 'الإشعارات' }, tables: ['notifications', 'messages'] },
  
  // Workflow & Approvals (1)
  { id: 'approvals', name: { en: 'Approvals', ar: 'الموافقات' }, tables: ['approval_requests', 'committee_decisions'] },
  
  // Finance (2)
  { id: 'budgets', name: { en: 'Budgets', ar: 'الميزانيات' }, tables: ['budgets'] },
  { id: 'contracts', name: { en: 'Contracts & Invoices', ar: 'العقود والفواتير' }, tables: ['contracts', 'invoices'] },
  
  // Partnerships & Matching (2)
  { id: 'partnerships', name: { en: 'Partnerships', ar: 'الشراكات' }, tables: ['partnerships'] },
  { id: 'matchmaker', name: { en: 'Matchmaker', ar: 'التوفيق' }, tables: ['matchmaker_applications', 'demand_queue'] },
  
  // Strategic Planning (2)
  { id: 'strategic-plans', name: { en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' }, tables: ['strategic_plans', 'action_plans', 'action_items', 'milestones', 'risks', 'stakeholders', 'stakeholder_analyses', 'stakeholder_feedback', 'environmental_factors', 'national_strategy_alignments', 'global_trends', 'kpi_references'] },
  { id: 'scaling', name: { en: 'Scaling & Growth', ar: 'التوسع والنمو' }, tables: ['scaling_plans', 'scaling_readiness'] },
  
  // MII & Analytics (2)
  { id: 'mii', name: { en: 'MII Dashboard', ar: 'لوحة MII' }, tables: ['mii_results', 'mii_dimensions'] },
  { id: 'analytics', name: { en: 'Platform Analytics', ar: 'تحليلات المنصة' }, tables: ['platform_insights', 'onboarding_events', 'coverage_snapshots'] },
  
  // Audit & Logs (1)
  { id: 'audits', name: { en: 'Audits & Logs', ar: 'التدقيق والسجلات' }, tables: ['audits', 'access_logs', 'incident_reports'] },
  
  // Media & Files (1)
  { id: 'media', name: { en: 'Media Library', ar: 'مكتبة الوسائط' }, tables: ['media_files', 'media_folders', 'media_usage', 'media_usages', 'media_versions'] },
  
  // AI & Experiments (2)
  { id: 'ai-features', name: { en: 'AI Features', ar: 'ميزات الذكاء الاصطناعي' }, tables: ['ai_conversations', 'ai_messages', 'ai_usage_tracking', 'ai_rate_limits', 'ai_analysis_cache', 'generation_history'] },
  { id: 'ab-testing', name: { en: 'A/B Testing', ar: 'اختبار A/B' }, tables: ['ab_experiments', 'ab_assignments', 'ab_conversions'] },
  
  // Social & Engagement (1)
  { id: 'social', name: { en: 'Social Features', ar: 'الميزات الاجتماعية' }, tables: ['follows', 'bookmarks', 'comments', 'achievements'] },
  
  // Lookups & Config (2)
  { id: 'lookups', name: { en: 'Lookup Tables', ar: 'جداول البحث' }, tables: ['lookup_departments', 'lookup_governance_roles', 'lookup_risk_categories', 'lookup_specializations', 'lookup_stakeholder_types', 'lookup_strategic_themes', 'lookup_technologies', 'lookup_vision_programs'] },
  { id: 'platform-config', name: { en: 'Platform Config', ar: 'إعدادات المنصة' }, tables: ['platform_configs', 'custom_entries', 'progressive_profiling_prompts', 'demo_requests'] },
  
  // Personas & Dashboards (4)
  { id: 'admin-portal', name: { en: 'Admin Portal', ar: 'بوابة المسؤول' }, tables: ['user_profiles', 'user_roles', 'system_validations'] },
  { id: 'provider-dashboard', name: { en: 'Provider Dashboard', ar: 'لوحة المزود' }, tables: ['providers', 'solutions', 'challenge_proposals'] },
  { id: 'startup-dashboard', name: { en: 'Startup Dashboard', ar: 'لوحة الشركات الناشئة' }, tables: ['organizations', 'program_applications'] },
  { id: 'academia-dashboard', name: { en: 'Academia Dashboard', ar: 'لوحة الأكاديميين' }, tables: ['researcher_profiles', 'rd_proposals'] },
  
  // NEW: Onboarding & Authentication (2)
  { id: 'onboarding', name: { en: 'Onboarding System', ar: 'نظام التسجيل' }, tables: ['user_profiles', 'onboarding_events', 'progressive_profiling_prompts'] },
  { id: 'authentication', name: { en: 'Authentication', ar: 'المصادقة' }, tables: ['user_profiles', 'user_roles'] },
  
  // NEW: Profile & Settings (2)
  { id: 'profile', name: { en: 'Profile Management', ar: 'إدارة الملف الشخصي' }, tables: ['user_profiles', 'citizen_profiles', 'expert_profiles', 'researcher_profiles', 'municipality_staff_profiles'] },
  { id: 'settings', name: { en: 'User Settings', ar: 'إعدادات المستخدم' }, tables: ['user_profiles', 'email_settings', 'notification_preferences'] },
  
  // NEW: Dashboard Aggregations (1)
  { id: 'dashboards', name: { en: 'Dashboard System', ar: 'نظام لوحات المعلومات' }, tables: ['platform_insights', 'mii_results', 'coverage_snapshots'] },
  
  // NEW: Search & Discovery (1)
  { id: 'search', name: { en: 'Search & Discovery', ar: 'البحث والاكتشاف' }, tables: ['challenges', 'solutions', 'pilots', 'programs', 'events', 'knowledge_documents'] },
  
  // NEW: Public Portal (1)
  { id: 'public-portal', name: { en: 'Public Portal', ar: 'البوابة العامة' }, tables: ['challenges', 'solutions', 'events', 'news_articles', 'case_studies'] },
  
  // NEW: Mentorship System (1)
  { id: 'mentorship', name: { en: 'Mentorship System', ar: 'نظام الإرشاد' }, tables: ['program_mentorships', 'expert_profiles', 'expert_assignments'] },
  
  // NEW: Reporting & Export (1)
  { id: 'reporting', name: { en: 'Reporting & Export', ar: 'التقارير والتصدير' }, tables: ['platform_insights', 'mii_results', 'audits'] },
  
  // NEW: Import System (1)
  { id: 'import-export', name: { en: 'Import/Export', ar: 'الاستيراد والتصدير' }, tables: ['media_files', 'knowledge_documents'] },
];
