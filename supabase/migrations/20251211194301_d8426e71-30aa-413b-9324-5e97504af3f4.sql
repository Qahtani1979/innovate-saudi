-- Add all missing roles to align with roles table
-- Deputyship roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'deputyship_analyst';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'deputyship_director';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'deputyship_manager';

-- Municipality roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'municipality_director';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'municipality_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'municipality_viewer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'municipality_innovation_officer';

-- GDISB roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gdisb_data_analyst';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gdisb_operations_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gdisb_strategy_lead';

-- Admin roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'platform_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'system_administrator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'security_administrator';

-- Manager roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'pilot_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'challenge_lead';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'challenge_reviewer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'policy_officer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'partnership_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'risk_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'budget_officer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'data_manager';

-- Content roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'content_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'content_moderator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'communication_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'communications_lead';

-- Program roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'program_director';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'program_evaluator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'program_operator';

-- Research roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'research_lead';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'research_evaluator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'rd_manager';

-- Solution roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'solution_provider';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'solution_evaluator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'solution_verifier';

-- Living Lab roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'living_lab_director';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'living_lab_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'sandbox_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'sandbox_operator';

-- Other functional roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ai_analyst';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'report_analyst';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'domain_expert';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'idea_moderator';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'implementation_officer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'council_member';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ministry_representative';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'matchmaker_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'team_lead';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'technical_lead';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'citizen_engagement_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'executive_leadership';