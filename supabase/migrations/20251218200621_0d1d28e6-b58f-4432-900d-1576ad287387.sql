-- Fix: Comprehensive enum to role_id mapping for ALL 81 enum values
CREATE OR REPLACE FUNCTION public.map_enum_to_role_id(_enum_role text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id FROM public.roles r
  WHERE 
    -- Core roles
    (_enum_role = 'admin' AND r.name = 'Admin') OR
    (_enum_role = 'super_admin' AND r.name = 'Admin') OR
    (_enum_role = 'user' AND r.name = 'Citizen') OR
    (_enum_role = 'citizen' AND r.name = 'Citizen') OR
    (_enum_role = 'viewer' AND r.name = 'Viewer') OR
    
    -- Municipality roles
    (_enum_role = 'municipality_staff' AND r.name = 'Municipality Staff') OR
    (_enum_role = 'municipality_admin' AND r.name = 'Municipality Admin') OR
    (_enum_role = 'municipality_coordinator' AND r.name = 'Municipality Coordinator') OR
    (_enum_role = 'municipality_director' AND r.name = 'Municipality Director') OR
    (_enum_role = 'municipality_manager' AND r.name = 'Municipality Manager') OR
    (_enum_role = 'municipality_viewer' AND r.name = 'Municipality Viewer') OR
    (_enum_role = 'municipality_innovation_officer' AND r.name = 'Municipality Innovation Officer') OR
    
    -- Deputyship roles
    (_enum_role = 'deputyship_admin' AND r.name = 'Deputyship Director') OR
    (_enum_role = 'deputyship_staff' AND r.name = 'Deputyship Staff') OR
    (_enum_role = 'deputyship_analyst' AND r.name = 'Deputyship Analyst') OR
    (_enum_role = 'deputyship_director' AND r.name = 'Deputyship Director') OR
    (_enum_role = 'deputyship_manager' AND r.name = 'Deputyship Manager') OR
    
    -- Provider roles
    (_enum_role = 'provider' AND r.name = 'Provider') OR
    (_enum_role = 'provider_admin' AND r.name = 'Provider Admin') OR
    (_enum_role = 'provider_staff' AND r.name = 'Provider Staff') OR
    (_enum_role = 'solution_provider' AND r.name = 'Solution Provider') OR
    (_enum_role = 'solution_evaluator' AND r.name = 'Solution Evaluator') OR
    (_enum_role = 'solution_verifier' AND r.name = 'Solution Verifier') OR
    
    -- Research roles
    (_enum_role = 'researcher' AND r.name = 'Researcher') OR
    (_enum_role = 'research_lead' AND r.name = 'Research Lead') OR
    (_enum_role = 'research_evaluator' AND r.name = 'Research Evaluator') OR
    (_enum_role = 'rd_manager' AND r.name = 'R&D Manager') OR
    
    -- Executive roles
    (_enum_role = 'executive' AND r.name = 'Executive') OR
    (_enum_role = 'executive_leader' AND r.name = 'Executive Leader') OR
    (_enum_role = 'executive_director' AND r.name = 'Executive Director') OR
    (_enum_role = 'executive_leadership' AND r.name = 'Executive Leadership') OR
    
    -- GDIBS/GDISB roles
    (_enum_role = 'gdibs_internal' AND r.name = 'GDIBS Internal') OR
    (_enum_role = 'gdibs_analyst' AND r.name = 'GDIBS Analyst') OR
    (_enum_role = 'gdibs_coordinator' AND r.name = 'GDIBS Coordinator') OR
    (_enum_role = 'gdisb_data_analyst' AND r.name = 'GDISB Data Analyst') OR
    (_enum_role = 'gdisb_operations_manager' AND r.name = 'GDISB Operations Manager') OR
    (_enum_role = 'gdisb_strategy_lead' AND r.name = 'GDISB Strategy Lead') OR
    
    -- Platform roles
    (_enum_role = 'platform_admin' AND r.name = 'Platform Admin') OR
    (_enum_role = 'system_administrator' AND r.name = 'System Administrator') OR
    (_enum_role = 'security_administrator' AND r.name = 'Security Administrator') OR
    
    -- Program roles
    (_enum_role = 'program_manager' AND r.name = 'Program Manager') OR
    (_enum_role = 'program_director' AND r.name = 'Program Director') OR
    (_enum_role = 'program_evaluator' AND r.name = 'Program Evaluator') OR
    (_enum_role = 'program_operator' AND r.name = 'Program Operator') OR
    
    -- Challenge/Pilot roles
    (_enum_role = 'pilot_manager' AND r.name = 'Pilot Manager') OR
    (_enum_role = 'challenge_lead' AND r.name = 'Challenge Lead') OR
    (_enum_role = 'challenge_reviewer' AND r.name = 'Challenge Reviewer') OR
    
    -- Living Lab roles
    (_enum_role = 'living_lab_admin' AND r.name = 'Living Lab Admin') OR
    (_enum_role = 'living_lab_director' AND r.name = 'Living Lab Director') OR
    (_enum_role = 'living_lab_manager' AND r.name = 'Living Lab Manager') OR
    
    -- Sandbox roles
    (_enum_role = 'sandbox_manager' AND r.name = 'Sandbox Manager') OR
    (_enum_role = 'sandbox_operator' AND r.name = 'Sandbox Operator') OR
    
    -- Expert/Evaluator roles
    (_enum_role = 'expert' AND r.name = 'Expert') OR
    (_enum_role = 'domain_expert' AND r.name = 'Domain Expert') OR
    (_enum_role = 'evaluator' AND r.name = 'Evaluator') OR
    
    -- Content/Communication roles
    (_enum_role = 'moderator' AND r.name = 'Moderator') OR
    (_enum_role = 'content_manager' AND r.name = 'Content Manager') OR
    (_enum_role = 'content_moderator' AND r.name = 'Content Moderator') OR
    (_enum_role = 'communication_manager' AND r.name = 'Communication Manager') OR
    (_enum_role = 'communications_lead' AND r.name = 'Communications Lead') OR
    (_enum_role = 'idea_moderator' AND r.name = 'Idea Moderator') OR
    
    -- Finance/Legal/Audit roles
    (_enum_role = 'auditor' AND r.name = 'Auditor') OR
    (_enum_role = 'budget_officer' AND r.name = 'Budget Officer') OR
    (_enum_role = 'financial_controller' AND r.name = 'Financial Controller') OR
    (_enum_role = 'legal_officer' AND r.name = 'Legal Officer') OR
    (_enum_role = 'risk_manager' AND r.name = 'Risk Manager') OR
    
    -- Data/Analytics roles
    (_enum_role = 'data_analyst' AND r.name = 'Data Analyst') OR
    (_enum_role = 'data_manager' AND r.name = 'Data Manager') OR
    (_enum_role = 'ai_analyst' AND r.name = 'AI Analyst') OR
    (_enum_role = 'report_analyst' AND r.name = 'Report Analyst') OR
    
    -- Other specialized roles
    (_enum_role = 'investor' AND r.name = 'Investor') OR
    (_enum_role = 'accelerator' AND r.name = 'Accelerator') OR
    (_enum_role = 'ministry' AND r.name = 'Ministry') OR
    (_enum_role = 'ministry_representative' AND r.name = 'Ministry Representative') OR
    (_enum_role = 'knowledge_manager' AND r.name = 'Knowledge Manager') OR
    (_enum_role = 'policy_officer' AND r.name = 'Policy Officer') OR
    (_enum_role = 'partnership_manager' AND r.name = 'Partnership Manager') OR
    (_enum_role = 'implementation_officer' AND r.name = 'Implementation Officer') OR
    (_enum_role = 'council_member' AND r.name = 'Council Member') OR
    (_enum_role = 'matchmaker_manager' AND r.name = 'Matchmaker Manager') OR
    (_enum_role = 'team_lead' AND r.name = 'Team Lead') OR
    (_enum_role = 'technical_lead' AND r.name = 'Technical Lead') OR
    (_enum_role = 'citizen_engagement_manager' AND r.name = 'Citizen Engagement Manager') OR
    (_enum_role = 'strategy_officer' AND r.name = 'Strategy Officer')
  LIMIT 1
$$;

-- Ensure missing roles exist in roles table
INSERT INTO public.roles (name, description, is_active)
VALUES 
  ('Viewer', 'Read-only access user', true),
  ('System Administrator', 'System-level administrator', true),
  ('Security Administrator', 'Security and access control administrator', true),
  ('Solution Provider', 'Provider of solutions', true),
  ('Solution Evaluator', 'Evaluates submitted solutions', true),
  ('Solution Verifier', 'Verifies solution implementations', true),
  ('Sandbox Manager', 'Manages sandbox environments', true),
  ('Sandbox Operator', 'Operates sandbox environments', true),
  ('Risk Manager', 'Manages risk assessments', true),
  ('Team Lead', 'Team leadership role', true),
  ('Technical Lead', 'Technical team lead', true),
  ('Strategy Officer', 'Strategic planning officer', true)
ON CONFLICT DO NOTHING;