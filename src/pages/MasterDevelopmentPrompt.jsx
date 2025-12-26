import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import {
  Brain,
  Code,
  FileCode,
  GitBranch,
  Workflow,
  Shield,
  Database,
  Network,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Copy,
  Eye,
  Layers,
  Zap,
  Target,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MasterDevelopmentPrompt() {
  const { language, isRTL, t } = useLanguage();
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success(t({ en: 'Copied to clipboard', ar: 'تم النسخ' }));
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const fullPrompt = `# MASTER DEVELOPMENT PROMPT FOR AI AGENT

## PLATFORM STATE & STANDARDS (from 20+ Coverage Reports)

### Platform Architecture Overview
- **312 code files** (pages + components + functions)
- **175+ pages** with 97% RBAC coverage
- **106 entities** with 600+ fields, ZERO schema gaps
- **50+ AI features** across all journeys
- **48 comprehensive roles** with granular permissions
- **7 specialized portals** with role-based access
- **17 core user journeys** at 85-100% completion
- **Bilingual support**: 85% coverage (AR/EN with RTL)

### GOLD STANDARD Reference Implementations

**Use these as templates for all development:**

1. **Challenge Entity** (100% COMPLETE - REFERENCE STANDARD)
   - 60+ fields across 12 categories
   - 27 tabs in ChallengeDetail (all features implemented)
   - 4-gate UnifiedWorkflowApprovalTab with dual AI (RequesterAI + ReviewerAI)
   - ChallengeActivityLog comprehensive timeline
   - 17 AI features (classification, scoring, matching, clustering, insights)
   - Expert evaluation system integrated (ExpertEvaluation entity)
   - Full citizen engagement (idea→challenge→resolution feedback loop)
   - All conversion paths complete (→Pilot, →R&D, →Policy, →Program, →Procurement)
   - Enhanced edit with auto-save, versioning, change tracking, preview mode
   
2. **Policy Entity** (100% COMPLETE - REFERENCE STANDARD)
   - PolicyRecommendation entity with full lifecycle
   - 4 gates: Legal Review, Public Consultation, Council Approval, Ministry Approval
   - All gates have self-check + reviewer checklists + AI assistance
   - PolicyWorkflowManager, PolicyImplementationTracker, PolicyAmendmentWizard
   - Arabic-first with auto-translation
   - Template library integration
   - Conflict detection AI
   
3. **Pilot Entity** (100% COMPLETE - PLATINUM STANDARD)
   - 70+ fields across 18 categories
   - 4-gate system matching Challenge completeness
   - PilotActivityLog merging SystemActivity + comments + approvals
   - Enhanced PilotEdit (auto-save, version tracking, change tracking, preview, 6 AI features)
   - Citizen engagement (PublicPilotTracker, CitizenPilotEnrollment, feedback)
   - All conversion workflows (→R&D, →Policy, →Procurement with AI generators)
   - Solution feedback loop automation (SolutionFeedbackLoop component)
   - Expert system integrated with multi-expert consensus

### PROVEN ARCHITECTURAL PATTERNS

**UnifiedWorkflowApprovalTab Pattern:**
- Single tab replacing separate Workflow + Approval tabs
- 4-gate system (submission, review, mid-stage, completion)
- Each gate has: self-check items (4+) + reviewer checklist (4-5+)
- Dual AI: RequesterAI assists with self-check, ReviewerAI assists with review
- ApprovalRequest entity tracks all approvals with SLA tracking
- InlineApprovalWizard in ApprovalCenter for quick processing
- Integration with SystemActivity for audit trail
- Files: components/approval/UnifiedWorkflowApprovalTab.jsx, ApprovalGateConfig.js

**Expert Evaluation Pattern:**
- ExpertProfile (40+ fields with embeddings)
- ExpertAssignment (assignment tracking with status workflow)
- ExpertEvaluation (8-dimension scorecard: feasibility, impact, innovation, cost, risk, alignment, quality, scalability)
- ExpertPanel (multi-expert consensus with voting)
- UnifiedEvaluationForm component (reusable across all entity types)
- EvaluationConsensusPanel (consensus calculation and display)
- ExpertMatchingEngine (AI semantic matching by sector/expertise)
- Supports 8 entity types: challenge, pilot, solution, rd_proposal, program_application, matchmaker_application, scaling_plan, citizen_idea

**Activity Log Pattern:**
- Comprehensive timeline merging SystemActivity + comments + approvals
- Visual icons and metadata display
- Grouped by date with expandable details
- Files: components/challenges/ChallengeActivityLog.jsx, components/pilots/PilotActivityLog.jsx

**Enhanced Edit Pattern:**
- Auto-save every 30s to localStorage
- 24h draft recovery on reload
- Field-level change tracking
- Change counter and summary display
- Preview mode with formatted display
- Version number increment on save
- SystemActivity integration
- Collaborative editing indicator
- Files: pages/ChallengeEdit.js, pages/PilotEdit.js

**Conversion Workflow Pattern:**
- AI-powered field auto-population from source entity
- Bilingual content generation
- Validation before creation
- Bidirectional linking (ChallengeRelation)
- SystemActivity logging
- Notifications to relevant parties
- Files: components/pilots/PilotToRDWorkflow.jsx, components/pilots/PilotToPolicyWorkflow.jsx, components/pilots/PilotToProcurementWorkflow.jsx

### CRITICAL GAPS & ANTI-PATTERNS (AVOID THESE)

**NEVER build features with these anti-patterns:**

1. **Weak Evaluator Workflows**
   - ❌ Generic admin approval without domain expertise
   - ✅ Use ExpertEvaluation entity + ExpertMatchingEngine + UnifiedEvaluationForm
   - ✅ Assign domain experts by sector with AI semantic matching
   - ✅ Require structured 8-dimension scorecard
   - ✅ Calculate multi-expert consensus

2. **Missing Closure Workflows**
   - ❌ Entities reach "completed" but have no output paths
   - ✅ Build conversion workflows for closure (Pilot→R&D, Pilot→Policy, Pilot→Procurement)
   - ✅ Use AI generators to automate conversion content creation
   - ✅ Track closure paths in coverage reports

3. **AI Components Not Integrated**
   - ❌ Building AI components but not adding them to page UX
   - ✅ Every AI feature needs UI integration point (button, panel, tab)
   - ✅ Add AI widgets to detail pages, not just in separate tools
   - ✅ Make AI contextual to current entity/page

4. **Passive Engagement Only**
   - ❌ AI matching without active engagement workflow
   - ✅ Add Express Interest buttons (ChallengeInterest entity)
   - ✅ Build proposal submission forms (ChallengeProposal entity)
   - ✅ Create conversion workflows (ProposalToPilotConverter)

5. **Broken Feedback Loops**
   - ❌ Users submit/participate but never receive updates
   - ✅ Build notification automation (autoNotificationTriggers)
   - ✅ Create tracking dashboards (CitizenDashboard, MyChallengeTracker)
   - ✅ Add closure notifications (CitizenClosureNotification)
   - ✅ Implement gamification (points, badges, leaderboards)

6. **No Publishing Workflow**
   - ❌ is_published flag exists but no workflow to set it
   - ✅ Create PublishingWorkflow component
   - ✅ Add publishing approval gate with criteria
   - ✅ Separate public vs confidential views

7. **Missing SLA Tracking**
   - ❌ Due dates in fields but no automation
   - ✅ Build slaAutomation function (auto-calculate, escalate)
   - ✅ Add escalation_level to entities
   - ✅ Create SLAMonitor component
   - ✅ Send leadership alerts on critical escalations

### IMPLEMENTATION PRIORITIES (from All Reports)

**P0 CRITICAL (Required for Platform Integrity):**
1. ✅ UnifiedWorkflowApprovalTab for ALL workflow entities
2. ✅ Expert evaluation system for ALL approval workflows
3. ✅ Activity logging for ALL major entities
4. ✅ Citizen feedback loops for ALL citizen touchpoints
5. ✅ Publishing workflows for ALL public-facing entities
6. ✅ SLA automation for ALL time-bound workflows
7. ✅ Conversion workflows for ALL closure paths
8. ✅ Enhanced edit (auto-save, versioning) for ALL editable entities

**P1 HIGH (Core Features):**
1. Bilingual form validation messages (currently 35+ forms English-only)
2. AI response bilingual enforcement (update 25+ AI prompts)
3. PDF Arabic font rendering (10+ export features)
4. Real-time monitoring infrastructure (WebSocket-based dashboards)
5. Financial module workflows (expense approval, reconciliation)
6. Contract management automation (e-signature, templates)

**P2 MEDIUM (Enhancements):**
1. RTL-aware chart components (Recharts wrapper)
2. Advanced analytics (correlation explorer, causal analysis)
3. International benchmarking automation
4. Multi-city coordination dashboards

### RBAC IMPLEMENTATION STANDARDS

**Application-Level Security (Platform Pattern):**
- NO database-level RLS policies (Platform uses app-level enforcement)
- Security enforced via permission checks in pages/components
- Field visibility via conditional rendering based on hasPermission()
- Query filtering based on user.assigned_roles and role.permissions
- Frontend: ProtectedPage + ProtectedAction + usePermissions hook
- Backend: API filtering before returning data

**7 Enforcement Levels:**
1. Page Access: ProtectedPage HOC
2. Section/Component: {hasPermission() && <Component />}
3. Action/Button: ProtectedAction wrapper
4. Link/Navigation: {hasPermission() && <Link />}
5. Field/Data: {hasPermission() && <Input />}
6. Row-Level: Platform.entities.filter({ municipality_id })
7. Tab Visibility: {hasPermission() && <TabsTrigger />}

**Permission Naming Convention:**
- {entity}\_view\_all (view all records)
- {entity}\_view\_own (view own/scoped records)
- {entity}\_create (create new records)
- {entity}\_edit (edit records)
- {entity}\_delete (soft delete)
- {entity}\_approve (approve/review)
- {entity}\_evaluate (expert evaluation)
- {entity}\_scale (scaling approval)
- expert\_evaluate (cross-entity expert permission)

### BILINGUAL & RTL REQUIREMENTS

**Entity Fields Pattern:**
- All content fields MUST have \_ar and \_en variants
- title\_ar + title\_en (REQUIRED)
- description\_ar + description\_en (REQUIRED)
- All text content in both languages

**UI Text Pattern:**
const { language, isRTL, t } = useLanguage();

All UI text:
<h1>{t({ en: 'Dashboard', ar: 'لوحة التحكم' })}</h1>

Buttons:
<Button>{t({ en: 'Submit', ar: 'إرسال' })}</Button>

Validation:
toast.error(t({ en: 'Failed', ar: 'فشل' }));

**RTL Layout Pattern:**
Container:
<div dir={isRTL ? 'rtl' : 'ltr'}>

Alignment:
className={isRTL ? 'text-right' : 'text-left'}

Icons:
<Search className={isRTL ? 'right-3' : 'left-3'} />

Padding:
className={isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}

Margins:
className={isRTL ? 'ml-4' : 'mr-4'}

Arrow flip:
<ChevronRight className={isRTL ? 'rotate-180' : ''} />

**Critical Bilingual Gaps to Fix:**
- ❌ Form validation messages (35+ forms English-only)
- ❌ AI responses (25+ AI components default English)
- ❌ Toast notifications (20+ components hard-coded English)
- ❌ PDF exports (Arabic font rendering broken)
- ❌ Chart labels (Recharts doesn't auto-flip for RTL)
- ❌ Backend error messages (40+ functions English-only)

### COMPLETE ENTITY CATALOG (106 Entities)

**CORE ENTITIES (13):**
1. User (built-in: email, full_name, role, assigned_roles[])
2. Municipality (name_ar/en, region, mii_score, active_challenges/pilots)
3. Challenge (code, title_ar/en, sector, priority, status, track, embedding, AI fields)
4. Solution (name_ar/en, provider_id, maturity_level, trl, embedding)
5. Pilot (code, title_ar/en, challenge_id, solution_id, stage, kpis[], embedding)
6. Program (code, name_ar/en, program_type, status, curriculum[], outcomes)
7. RDProject (code, title_ar/en, institution, trl_start/current, publications[])
8. RDCall (code, title_ar/en, budget_pool, research_themes[])
9. Sandbox (name_ar/en, zone, exemptions[], safety_protocols[])
10. LivingLab (name_ar/en, capabilities[], equipment[], is_accredited)
11. Organization (name_ar/en, org_type, is_partner, certifications[])
12. Provider (name_ar/en, provider_type, performance_score, solutions_count)
13. Partnership (partner_a/b_id, type, status, mou_url)
14. MatchmakerApplication (challenge_id, solution_id, match_score, stage)

**REFERENCE & TAXONOMY (8):**
1. Region (name_ar/en, code, population, coordinates)
2. City (region_id, name_ar/en, population, coordinates)
3. Sector (name_ar/en, code, icon, color)
4. Subsector (sector_id, name_ar/en, code)
5. Service (sector_id, name_ar/en, sla_targets)
6. KPIReference (code, name_ar/en, category, unit, calculation_method)
7. Tag (name_ar/en, type, color, usage_count)
8. MIIDimension (name_ar/en, weight, components[], formula)

**WORKFLOW & PROCESS (24):**
1. Contract (code, title_ar/en, parties, value, status, terms)
2. Budget (entity_type/id, allocated, spent, line_items[])
3. Milestone (entity_type/id, name, due_date, status, deliverables[])
4. Risk (entity_type/id, title, likelihood, impact, mitigation_plan)
5. Stakeholder (entity_type/id, name, type, influence_level)
6. Vendor (code, name_ar/en, type, performance_rating)
7. Invoice (number, vendor_id, amount, status, line_items[])
8. Event (code, title_ar/en, type, dates, capacity, registration_url)
9. Audit (code, type, entity_type/id, findings[], compliance_score)
10. PolicyDocument (code, title_ar/en, type, effective_date, document_url)
11. PolicyRecommendation (code, title_ar/en, workflow_stage, legal_review, consultation)
12. PilotApproval (pilot_id, type, status, approver, conditions[])
13. PilotIssue (pilot_id, severity, status, resolution)
14. PilotDocument (pilot_id, name, type, url, version)
15. RDProposal (rd_call_id, title, PI, budget_requested, status)
16. ProgramApplication (program_id, applicant_org_id, status, scores[])
17. SandboxApplication (sandbox_id, pilot_id, exemptions[], risk_assessment)
18. SandboxIncident (sandbox_id, type, severity, investigation_findings)
19. RegulatoryExemption (sandbox_id, type, regulation_ref, conditions[])
20. SandboxProjectMilestone (application_id, name, due_date, deliverables[])
21. SandboxCollaborator (sandbox_id, user_email, role, permissions[])
22. ExemptionAuditLog (exemption_id, action, performed_by, changes[])
23. SandboxMonitoringData (sandbox_id, metric, value, threshold, alerts)
24. MatchmakerEvaluationSession (application_id, evaluators[], scores, decision)
25. RoleRequest (user_email, requested_role_id, justification, status)
26. PilotExpense (pilot_id, amount, category, receipt_url, status)
27. LivingLabResourceBooking (lab_id, resource_type, start/end_time)
28. ChallengeActivity (challenge_id, type, description, metadata)

**RELATIONSHIPS & LINKS (17):**
1. ChallengeSolutionMatch (challenge_id, solution_id, match_score, reasoning)
2. ChallengeRelation (challenge_id, related_entity_type/id, relation_role)
3. ChallengeTag (challenge_id, tag_id, relevance_score, AI-assigned)
4. ChallengeKPILink (challenge_id, kpi_ref_id, baseline, target)
5. PilotKPI (pilot_id, name, baseline, target, current, status)
6. PilotKPIDatapoint (pilot_kpi_id, value, timestamp, data_source)
7. ScalingPlan (pilot_id, strategy, target_locations[], progress)
8. ScalingReadiness (pilot_id, readiness_score, criteria)
9. SolutionCase (solution_id, title, client, results, metrics)
10. LivingLabBooking (lab_id, project_type/id, dates, status)
11. UserFollow (follower_email, entity_type/id, notifications_enabled)
12. ProgramPilotLink (program_id, pilot_id, conversion_status)
13. TeamMember (team_id, user_email, role, contribution_score)
14. PilotCollaboration (pilot_id, cities[], lead_municipality, shared_learnings)
15. ProgramMentorship (program_id, mentor/mentee_email, sessions, outcomes)
16. OrganizationPartnership (org_a/b_id, type, deliverables[], performance)
17. StrategicPlanChallengeLink (plan_id, challenge_id, alignment_status)
18. ChallengeAttachment (challenge_id, file_name, url, type, extracted_data)
19. CitizenIdea (title, description, municipality_id, vote_count, ai_classification, embedding)
20. CitizenVote (idea_id, voter_identifier, fraud_score, is_verified)
21. CitizenFeedback (entity_type/id, feedback_text, sentiment)

**COMMUNICATIONS (11):**
1. Message (from/to_user_email, subject, body, read_date)
2. Notification (user_email, type, title, message, entity_type/id, is_read)
3. ChallengeComment (challenge_id, user_email, comment_text)
4. PilotComment (pilot_id, user_email, comment_text)
5. ProgramComment (program_id, user_email, comment_text)
6. SolutionComment (solution_id, user_email, comment_text, rating)
7. RDProjectComment (rd_project_id, user_email, comment_text)
8. RDCallComment (rd_call_id, user_email, comment_text, is_question)
9. RDProposalComment (rd_proposal_id, user_email, is_reviewer_feedback)
10. StakeholderFeedback (pilot_id, stakeholder_name, feedback_text, sentiment)
11. UserNotificationPreference (user_email, channel, frequency, categories)
12. IdeaComment (idea_id, user_email, comment_text, parent_comment_id)
13. PolicyComment (policy_id, user_email, comment_text, is_public)

**ANALYTICS & METRICS (6):**
1. MIIResult (municipality_id, overall_score, rank, dimension_scores, year)
2. UserActivity (user_email, action_type, entity_type/id, metadata)
3. SystemActivity (activity_type, severity, timestamp, metadata)
4. AccessLog (user_email, resource, action, ip_address, status_code)
5. UserSession (user_email, token, device_info, login_date, status)
6. PlatformInsight (text, category, related_entities[], priority)

**USER & ACCESS (11):**
1. UserProfile (user_email, bio_ar/en, avatar, skills[], expertise_areas[])
2. StartupProfile (user_email, company_name, stage, funding_history[], traction)
3. ResearcherProfile (user_email, institution_id, h_index, publications[], orcid)
4. ExpertProfile (user_email, expertise_areas[], certifications[], embedding)
5. ExpertAssignment (expert_email, entity_type/id, due_date, status)
6. ExpertEvaluation (expert_email, entity_type/id, 8 scores, recommendation)
7. ExpertPanel (panel_name, entity_type/id, members[], consensus_threshold)
8. UserInvitation (email, invited_by, role, status, token)
9. UserAchievement (user_email, achievement_id, earned_date, progress)
10. Achievement (name_ar/en, category, points, rarity, criteria)
11. DelegationRule (delegator/delegate_email, permissions[], dates, is_active)
12. Role (name, permissions[], is_expert_role, required_expertise_areas[])
13. Team (name, type, municipality_id, members[], permissions[])

**STRATEGY & PLANNING (2):**
1. StrategicPlan (code, name_ar/en, vision, initiatives[], kpis[], status)
2. Task (title, assigned_to/by, entity_type/id, priority, status, dependencies[])

**CITIZEN ENGAGEMENT (6):**
1. CitizenIdea (title, description, municipality_id, embedding, ai_pre_screening)
2. CitizenVote (idea_id, voter_identifier, fraud_score)
3. CitizenFeedback (entity_type/id, feedback_text, sentiment)
4. IdeaComment (idea_id, user_email, comment_text)
5. CitizenPoints (user_email, total_points, level, tier)
6. CitizenBadge (user_email, badge_type, earned_date)
7. CitizenNotification (user_email, notification_type, message, is_read)
8. CitizenPilotEnrollment (pilot_id, citizen_email, enrollment_type, consent)

**INNOVATION PROPOSALS (3):**
1. InnovationProposal (program_id, challenge_id, proposal_type, implementation_plan, ai_pre_screening)
2. ChallengeProposal (challenge_id, proposer_email, solution_id, technical_approach)
3. ChallengeInterest (challenge_id, interested_party_email, interest_type, message)

**KNOWLEDGE & CONTENT (5):**
1. KnowledgeDocument (title_ar/en, content_ar/en, category, related_entity, embedding)
2. CaseStudy (title_ar/en, pilot_id, solution_id, results, roi_achieved)
3. NewsArticle (title_ar/en, content_ar/en, category, author, is_published)
4. TrendEntry (sector_id, name_ar/en, data_points[], forecast)
5. GlobalTrend (name_ar/en, global_source, saudi_relevance, impact_forecast)

**SYSTEM (1):**
1. PlatformConfig (config_key, config_value, type, updated_by)

**APPROVAL & WORKFLOW ENGINE (2):**
1. ApprovalRequest (entity_type/id, gate_name, requester/reviewer, status, sla_due_date, escalation_level)
2. ApprovalGateConfig (stored in code: components/approval/ApprovalGateConfig.js)

### COMPLETE RBAC SYSTEM (Roles, Permissions, Personas)

**USER PERSONAS (8):**

1. **Executive Leadership**
   - Role: admin (system-wide)
   - Focus: National strategy, high-level approvals, MII tracking
   - Portals: ExecutiveDashboard, StrategyCockpit
   - Key permissions: All (wildcard *)

2. **GDISB Platform Admin**
   - Role: admin
   - Focus: Platform operations, user management, system configuration
   - Portals: AdminPortal, all management hubs
   - Key permissions: All (wildcard *)

3. **Municipality Manager**
   - Role: municipality_manager (custom role per municipality)
   - Focus: Local challenges, pilots, reporting, MII improvement
   - Portals: MunicipalityDashboard, MunicipalityProfile
   - Key permissions:
     - challenge_create, challenge_update, challenge_view_own
     - pilot_create, pilot_update, pilot_view_own
     - solution_view_all (read marketplace)
     - program_participate
     - rd_project_view_own
   - Data scope: municipality_id filtering (RLS)

4. **Startup / Solution Provider**
   - Role: startup_user
   - Focus: Solution discovery, challenge responses, pilot participation
   - Portals: StartupDashboard, OpportunityFeed
   - Key permissions:
     - solution_create, solution_update, solution_view_own
     - challenge_view_published (only published challenges)
     - challenge_propose_solution
     - pilot_view_own (only pilots using their solutions)
     - program_apply
     - matchmaker_apply
   - Data scope: created_by filtering

5. **Academia / Researcher**
   - Role: researcher_user
   - Focus: R&D proposals, publications, living lab access
   - Portals: AcademiaDashboard, RDProjects
   - Key permissions:
     - rd_proposal_create, rd_proposal_update, rd_proposal_view_own
     - rd_project_view_own, rd_project_update_own
     - challenge_view_published (for R&D context)
     - livinglab_book, livinglab_view_all
     - program_apply (research programs)
   - Data scope: created_by filtering

6. **Expert Evaluator**
   - Role: expert_evaluator (assigned via ExpertProfile)
   - Focus: Evaluation assignments, scoring, consensus panels
   - Portals: ExpertAssignmentQueue, EvaluationPanel
   - Key permissions:
     - expert_evaluate (special permission)
     - challenge_view_all (for evaluation context)
     - pilot_view_all (for evaluation context)
     - solution_view_all (for evaluation context)
     - rd_proposal_view_all (for evaluation context)
     - program_application_view_assigned
   - Data scope: ExpertAssignment.expert_email filtering

7. **Program Operator**
   - Role: program_operator (assigned to specific programs)
   - Focus: Cohort management, application review, session scheduling
   - Portals: ProgramOperatorPortal, ApplicationReviewHub
   - Key permissions:
     - program_view_own, program_update_own
     - program_application_review
     - program_participant_manage
     - program_session_schedule
   - Data scope: Program.created_by or Team.members[]

8. **Citizen / Public User**
   - Role: user (default, no special permissions)
   - Focus: Idea submission, voting, tracking, feedback
   - Portals: PublicPortal, PublicIdeasBoard, PublicPilotTracker
   - Key permissions:
     - citizen_idea_create
     - citizen_idea_vote
     - citizen_idea_comment
     - pilot_view_public (only is_published=true)
     - challenge_view_public (only is_published=true)
     - citizen_pilot_enroll
   - Data scope: Public visibility only

**ROLE ENTITY STRUCTURE:**

Example role definition:
{
  "name": "Municipality Manager - Riyadh",
  "description": "Manages innovation activities for Riyadh",
  "permissions": [
    "challenge_create", "challenge_update", "challenge_view_own",
    "pilot_create", "pilot_update", "pilot_view_own",
    "solution_view_all", "program_participate"
  ],
  "is_system_role": false,
  "is_expert_role": false,
  "is_custom": true,
  "parent_role_id": null,
  "can_be_requested": true,
  "approval_required": true
}

**PERMISSION CATALOG (60+ Permissions):**

**Challenge Permissions (9):**
- challenge_view_all (see all challenges regardless of municipality)
- challenge_view_own (see only own municipality's challenges)
- challenge_view_published (see only published challenges)
- challenge_create (create new challenges)
- challenge_update (update challenges)
- challenge_delete (soft delete)
- challenge_approve (review & approve workflow)
- challenge_publish (make public)
- challenge_propose_solution (startups respond to challenges)

**Pilot Permissions (11):**
- pilot_view_all
- pilot_view_own
- pilot_view_public (only is_published=true)
- pilot_create
- pilot_update
- pilot_delete
- pilot_approve (gate approvals)
- pilot_scale (initiate scaling)
- pilot_terminate
- pilot_pause_resume
- pilot_publish

**Solution Permissions (8):**
- solution_view_all
- solution_view_own
- solution_create
- solution_update
- solution_delete
- solution_approve (verification)
- solution_publish
- solution_rate_review

**R&D Permissions (10):**
- rd_call_view_all
- rd_call_create
- rd_call_publish
- rd_proposal_view_all
- rd_proposal_view_own
- rd_proposal_create
- rd_proposal_update
- rd_proposal_review (peer review)
- rd_project_view_own
- rd_project_update_own

**Program Permissions (8):**
- program_view_all
- program_view_own
- program_create
- program_update
- program_application_review
- program_participant_manage
- program_session_schedule
- program_apply

**Sandbox Permissions (6):**
- sandbox_view_all
- sandbox_create
- sandbox_update
- sandbox_approve (entry approval)
- sandbox_monitor
- sandbox_apply

**Living Lab Permissions (4):**
- livinglab_view_all
- livinglab_book
- livinglab_manage
- livinglab_accredit

**Expert Permissions (2):**
- expert_evaluate (core evaluation permission)
- expert_assign (assign experts to evaluations)

**Citizen Permissions (5):**
- citizen_idea_create
- citizen_idea_vote
- citizen_idea_comment
- citizen_pilot_enroll
- citizen_feedback_submit

**Policy Permissions (6):**
- policy_view_all
- policy_create
- policy_update
- policy_approve (council/ministry gates)
- policy_publish
- policy_comment

**Matchmaker Permissions (3):**
- matchmaker_apply
- matchmaker_evaluate
- matchmaker_approve

**Organization Permissions (4):**
- organization_view_all
- organization_create
- organization_update
- organization_verify

**User Management Permissions (5):**
- user_view_all
- user_invite
- user_role_assign
- user_role_request_approve
- user_impersonate

**PERMISSION INHERITANCE:**

1. **Admin Role (wildcard *)**
   - Has ALL permissions automatically
   - No need to list individual permissions

2. **Team-Based Permissions**
   - User.assigned_teams[] → Team.permissions[]
   - Teams provide shared access (e.g., "Riyadh Innovation Team")
   - Team permissions merge with role permissions

3. **Delegation Rules**
   - DelegationRule entity grants temporary permissions
   - Active delegations checked by date range
   - Permissions additive (delegate gains, delegator keeps)

4. **Expert Role Special Case**
   - Experts get expert_evaluate permission
   - Plus context permissions (view entities they evaluate)
   - Scoped by ExpertAssignment records

**PERMISSION CHECKING PATTERN:**

In usePermissions hook - getUserPermissions function:
- Check if user.role === 'admin', return ['*'] wildcard
- Otherwise collect permissions from:
  1. Role permissions (user.assigned_roles)
  2. Team permissions (user.assigned_teams, merged)
  3. Active delegation permissions
- Return Array.from(permissions Set)

**ROW-LEVEL SECURITY (RLS) PATTERNS:**

1. **Municipality Scoping**
   - Challenges: WHERE municipality_id IN (user's municipalities)
   - Pilots: WHERE municipality_id IN (user's municipalities)
   - Applied automatically in list() queries for non-admin

2. **Ownership Scoping**
   - Solutions: WHERE created_by = user.email
   - RDProposals: WHERE created_by = user.email OR PI.email = user.email
   - Applied for _view_own permissions

3. **Visibility Scoping**
   - Public views: WHERE is_published = true
   - Applied for _view_public permissions

4. **Expert Assignment Scoping**
   - ExpertEvaluation: WHERE expert_email = user.email
   - Via ExpertAssignment entity

**ROLE REQUEST WORKFLOW:**

1. User submits RoleRequest entity
2. Justification + required docs
3. Admin reviews in RoleRequestCenter
4. Approval creates User.assigned_roles[] entry
5. Auto-notification on decision

**PROTECTED PAGE PATTERNS:**

Page-level protection:
export default ProtectedPage(ChallengesPage, {
  requiredPermissions: ['challenge_view_all'],
  requireAdmin: false
});

Component-level protection:
<ProtectedAction requiredPermissions={['pilot_approve']}>
  <Button>Approve Pilot</Button>
</ProtectedAction>

Conditional rendering:
{hasPermission('challenge_create') && (
  <Button>Create Challenge</Button>
)}

**CRITICAL SECURITY RULES:**

1. ✅ User entity has built-in RLS (users see only themselves, admins see all)
2. ✅ Admins bypass all RLS checks (wildcard permission)
3. ✅ Expert permissions scoped to assignments only
4. ✅ Municipality users see ONLY their municipality data (unless admin)
5. ✅ Startups/researchers see only their own created content
6. ✅ Public users see only is_published=true content
7. ✅ All approval gates check hasPermission() before rendering
8. ✅ Backend functions validate user.role before service role elevation
9. ⚠️ RLS NOT enforced at database level (application-level only)
10. ⚠️ Field-level permissions NOT implemented (entity-level only)

**PERMISSION NAMING CONVENTION:**
- Format: {entity}_{action}
- Actions: view_all, view_own, view_public, create, update, delete, approve, publish
- Special: expert_evaluate, user_impersonate

### DATA MODEL STANDARDS

**Complete:** 106 entities with ZERO schema gaps
- 89 original entities fully enhanced (500+ fields added)
- 17 NEW entities created (Contract, Budget, Milestone, Risk, Stakeholder, etc.)
- All entities have soft delete (is\_deleted, deleted\_date, deleted\_by)
- 15 key entities have versioning (version\_number, previous\_version\_id)
- Geolocation added to all location-based entities
- SLA fields added to all workflow entities

**Entity Field Requirements:**

Core fields (built-in, automatic):
- id: auto-generated
- created_date: auto
- updated_date: auto
- created_by: auto (user.email)

Bilingual content (REQUIRED):
- title_ar: required
- title_en: required
- description_ar: required
- description_en: required

Soft delete (REQUIRED for all entities):
- is_deleted: false
- deleted_date: null
- deleted_by: null

Versioning (for key entities):
- version_number: 1
- previous_version_id: null

AI/Embeddings (where applicable):
- embedding: []
- embedding_model: "model-name"
- embedding_generated_date: "timestamp"

### TAB ARCHITECTURE STANDARDS

**27-Tab Detail Page Pattern (from Challenge GOLD STANDARD):**

Core Tabs (Always Include):
1. Workflow & Approvals (UnifiedWorkflowApprovalTab)
2. Overview (entity summary, key info)
3. Activity Log (comprehensive timeline)

Entity-Specific Tabs (Add as needed):
4. Problem/Design/Research (entity purpose)
5. Data & Evidence (supporting data)
6. KPIs (metrics tracking)
7. Stakeholders (involved parties)
8. AI Insights (AI-generated analysis)
9. Strategic Alignment (linked strategic plans)
10. Innovation Framing (HMW questions, What-If scenarios)
11. Network/Dependencies (related entities)
12. Financial (budget, expenses, ROI)
13. Team (team members, roles)
14. Timeline (milestones, Gantt)
15. Risks (risk register)
16. Compliance (regulatory status)
17. Testing Infrastructure (Sandbox/Lab if applicable)
18. Evaluation (expert evaluations, consensus)
19. Media (images, videos, gallery)
20. Policy (policy recommendations)
21. Programs (linked programs)
22. Knowledge (lessons learned, best practices)
23. Scaling (scaling plans, readiness)
24. External Intelligence (benchmarks, global insights)
25. Events (calendar, meetings)
26. Collaboration (multi-party coordination)
27. Discussion (comments, feedback)

**Tab Implementation Rules:**
- Use Tabs component with TabsList + TabsTrigger + TabsContent
- Add icons to all tab triggers (FileText, Database, BarChart3, etc.)
- Implement permission-based conditional rendering
- Preserve tab state in URL (?tab=kpis)
- Show loading skeletons while data fetches
- Make scrollable on mobile (overflow-x-auto)
- All labels bilingual via t() function

### WORKFLOW GATE STANDARDS (UnifiedWorkflowApprovalTab Pattern)

**4-Gate System Implementation:**

Gate 1 - Submission/Design Review:
- Self-check: 4 items (hypothesis clear, KPIs measurable, population defined, methodology appropriate)
- Reviewer checklist: 5 items (design quality, resources feasible, timeline realistic, risks mitigated, success criteria defined)
- RequesterAI: assists with self-check completion
- ReviewerAI: provides analysis and risk assessment
- SLA: 7 days with escalation
- Decisions: approved, requires_changes, rejected
- Next stage: approved → preparation/active

Gate 2 - Launch/Mid-Stage Review:
- Self-check: 4 items (team ready, budget approved, baseline data ready, compliance met)
- Reviewer checklist: 4 items (preparation complete, stakeholders ready, systems operational, safety protocols)
- AI assistance both sides
- SLA: 5-7 days
- Decisions: approved, needs_preparation, pause, pivot
- Next stage: active → monitoring

Gate 3 - Progress/Compliance Review:
- Self-check: 4 items (KPI data current, no critical issues, budget within limits, team performing)
- Reviewer checklist: 5 items (KPI progress >70%, budget variance <15%, no unmitigated risks, stakeholder feedback positive, pivot decision)
- AI monitoring and alerts
- SLA: 7 days
- Decisions: continue, pivot, pause, terminate
- Next stage: monitoring → evaluation

Gate 4 - Completion/Evaluation:
- Self-check: 4 items (all KPI data verified, final report drafted, lessons documented, budget reconciled)
- Reviewer checklist: 5 items (success criteria met, data quality validated, ROI calculated, scaling readiness assessed, lessons comprehensive)
- Multi-expert consensus via ExpertEvaluation entity
- SLA: 7 days
- Decisions: scale, iterate, pivot, terminate
- Next stage: completed → scaled/archived

**Implementation Files:**
- components/approval/UnifiedWorkflowApprovalTab.jsx
- components/approval/ApprovalGateConfig.js (gate definitions)
- components/approval/RequesterAI.jsx (self-check assistant)
- components/approval/ReviewerAI.jsx (review assistant)
- components/approval/InlineApprovalWizard.jsx (ApprovalCenter integration)
- entities/ApprovalRequest.json (tracking entity)

### CITIZEN ENGAGEMENT PATTERN (Complete Feedback Loop)

**Dual-Track Innovation Intake:**

Track 1 - Generic Public Ideas (CitizenIdea):
- Purpose: Informal citizen engagement, community voice
- Entry: PublicIdeaSubmission (simple form, no login required)
- AI: Pre-screening (clarity, feasibility, toxicity, sentiment, duplicate detection)
- Workflow: submitted → screening → evaluation → approved → conversion
- Engagement: Public voting (CitizenVote), commenting (IdeaComment), social sharing
- Feedback: CitizenDashboard, autoNotificationTriggers, CitizenNotification entity
- Recognition: CitizenPoints, CitizenBadge, CitizenLeaderboard
- Conversion: 5 paths (→Challenge, →Solution, →Pilot, →R&D, →Merge)

Track 2 - Structured Innovation Proposals (InnovationProposal):
- Purpose: Formal program/challenge responses with taxonomy
- Entry: ProgramIdeaSubmission, ChallengeIdeaResponse
- Fields: program_id, challenge_alignment_id, sector_id, implementation_plan, budget_estimate, team_composition
- AI: Pre-screening (completeness, budget reasonability, team adequacy, strategic alignment)
- Workflow: submission → screening → stakeholder_alignment → approved → conversion
- Evaluation: Expert evaluation via UnifiedEvaluationForm
- Conversion: →Pilot, →Challenge based on maturity

**Required Components:**
- PublicIdeaSubmission, PublicIdeasBoard, IdeaDetail
- CitizenDashboard (track my ideas, votes, points, badges)
- CitizenLeaderboard (top contributors)
- IdeaEvaluationQueue (expert evaluation)
- ProgramIdeaSubmission, ChallengeIdeaResponse
- InnovationProposalsManagement, InnovationProposalDetail
- IdeaToChallengeConverter, IdeaToSolutionConverter, IdeaToPilotConverter, IdeaToRDConverter
- MergeDuplicatesDialog, ResponseTemplates, SLATracker
- CommentThread, SocialShare
- pointsAutomation function, citizenNotifications function, miiCitizenIntegration function

### EXPERT EVALUATION SYSTEM (Universal Pattern)

**8-Dimension Scorecard (0-100 per dimension):**
1. feasibility_score
2. impact_score
3. innovation_score
4. cost_effectiveness_score
5. risk_score
6. strategic_alignment_score
7. technical_quality_score
8. scalability_score
9. overall_score (calculated average)

**Evaluation Workflow:**
1. Admin assigns expert via ExpertMatchingEngine (AI semantic matching)
2. ExpertAssignment entity created (status: pending)
3. Expert receives notification, views in ExpertAssignmentQueue
4. Expert accepts → status: active
5. Expert opens UnifiedEvaluationForm
6. Expert scores 8 dimensions + qualitative feedback
7. Expert selects recommendation (approve/reject/conditional/revise)
8. ExpertEvaluation entity created
9. If multiple experts: EvaluationConsensusPanel calculates consensus
10. checkConsensus function auto-updates entity status
11. evaluationNotifications alerts stakeholders

**Supported Entity Types:**
- challenge, pilot, solution, rd_proposal, program_application, matchmaker_application, scaling_plan, citizen_idea

**Required Entities:**
- ExpertProfile (40+ fields including expertise_areas, sector_specializations, certifications)
- ExpertAssignment (tracks who evaluates what)
- ExpertEvaluation (stores structured scores)
- ExpertPanel (multi-expert consensus)

**Required Pages:**
- ExpertRegistry (directory with filters)
- ExpertOnboarding (CV upload with AI extraction)
- ExpertAssignmentQueue (expert's work queue)
- ExpertMatchingEngine (AI-powered assignment)
- ExpertPerformanceDashboard (quality metrics)
- ExpertPanelManagement (panel creation)

**Integration Points:**
- ChallengeDetail → Experts tab
- PilotDetail → Experts tab
- SolutionDetail → Experts tab
- RDProposalDetail → Experts tab
- All review queues → UnifiedEvaluationForm

### CONVERSION SYSTEM MAP (Complete)

**FROM CHALLENGE (5 paths):**
1. Challenge → Pilot (SmartActionButton, PilotCreate pre-fill) ✅ 100%
2. Challenge → R&D Call (ChallengeToRDWizard, AI generator) ✅ 100%
3. Challenge → Policy (PolicyRecommendationManager, AI drafter) ✅ 100%
4. Challenge → Program (ChallengeToProgramWorkflow, cluster-based) ✅ 100%
5. Challenge → RFP (ChallengeRFPGenerator, AI RFP writer) ✅ 100%

**FROM PILOT (4 paths):**
1. Pilot → R&D Follow-up (PilotToRDWorkflow, AI research generator) ✅ 100%
2. Pilot → Policy (PilotToPolicyWorkflow, AI recommendation generator) ✅ 100%
3. Pilot → Procurement (PilotToProcurementWorkflow, AI RFP generator) ✅ 100%
4. Pilot → Scaling (ScalingWorkflow, readiness checker) ✅ 100%
5. Pilot → Solution Update (SolutionFeedbackLoop, AI analysis) ✅ 100%

**FROM CITIZEN IDEA (5 paths):**
1. Idea → Challenge (IdeaToChallengeConverter, AI structuring) ✅ 100%
2. Idea → Solution (IdeaToSolutionConverter, AI profiler) ✅ 100%
3. Idea → Pilot (IdeaToPilotConverter, AI designer) ✅ 100%
4. Idea → R&D (IdeaToRDConverter, AI research framer) ✅ 100%
5. Idea → Merge (MergeDuplicatesDialog, multi-attribution) ✅ 100%

**FROM INNOVATION PROPOSAL (2 paths):**
1. Proposal → Pilot (ProposalToPilotConverter, validation) ✅ 100%
2. Proposal → Challenge (if not linked, AI structuring) ✅ 100%

**FROM R&D PROJECT (2 paths):**
1. R&D → Pilot (RDToPilotTransition, AI transition) ✅ 100%
2. R&D → Solution (commercialization pathway) ⚠️ 40%

**Conversion Implementation Rules:**
- All conversions pre-fill from source entity
- AI enhances/completes missing fields (bilingual)
- Create bidirectional links (use ChallengeRelation entity)
- Log conversion in SystemActivity
- Trigger notifications to all parties
- Update source entity status (e.g., idea.status → 'converted_to_challenge')
- Validate required fields before creation

### AI FEATURE CATALOG (50+ Features)

**Matching & Discovery (9 features):**
1. Challenge-Solution Semantic Matcher (ChallengeSolutionMatching)
2. Challenge-R&D Call Matcher (ChallengeRDCallMatcher)
3. Solution-Challenge Reverse Matcher (SolutionChallengeMatcher)
4. Program-Challenge Matcher (ProgramChallengeMatcher)
5. Pilot-Scaling City Matcher (PilotScalingMatcher)
6. R&D-Pilot Matcher (RDProjectPilotMatcher)
7. Municipality Peer Matcher (MunicipalityPeerMatcher)
8. Living Lab-Project Matcher (LivingLabProjectMatcher)
9. Sandbox-Pilot Matcher (SandboxPilotMatcher)

**Prediction & Forecasting (8 features):**
1. Pilot Success Predictor (AISuccessPredictor)
2. Risk Forecasting Engine (AIRiskForecasting)
3. MII Score Forecaster (MIIForecastingEngine)
4. Trend Analysis & Prediction (AdvancedIdeasAnalytics)
5. Capacity Predictor (AICapacityPredictor)
6. Scaling Readiness Predictor (ScalingReadinessChecker)
7. Budget Overrun Predictor (FinancialTracker)
8. Challenge Impact Forecaster (ChallengeImpactSimulator)

**Insight Generation (10 features):**
1. Strategic Insights Generator (PlatformInsightsWidget)
2. Challenge Clustering & Analysis (ChallengeClustering)
3. Peer Comparison Analyzer (AIPeerComparison)
4. Anomaly Detector (AnomalyDetector)
5. Pipeline Health Analyzer (PipelineHealthDashboard AI)
6. Success Pattern Analyzer (PilotSuccessPatterns)
7. Failure Analysis Engine (FailureAnalysisDashboard)
8. Cross-Entity Recommender (CrossEntityRecommender)
9. Knowledge Graph Intelligence (KnowledgeGraph)
10. Real-Time Intelligence (RealTimeIntelligence)

**Content Generation (8 features):**
1. Executive Brief Generator (ExecutiveBriefGenerator)
2. Challenge Intake Wizard (AIChallengeIntakeWizard)
3. Proposal Assistant (AI in ProposalWizard)
4. R&D Call Generator (RDCallCreate AI)
5. Lesson Learned Capture (PilotRetrospectiveCapture)
6. Report Builder (CustomReportBuilder AI)
7. Email/Message Composer (AIMessageComposer)
8. Training Content Generator (AI in knowledge)

**Decision Support (7 features):**
1. Decision Simulator (DecisionSimulator)
2. Priority Recommender (PriorityRecommendations)
3. Approval Assistant (ReviewerAI in gates)
4. Resource Allocator (BudgetAllocationTool AI)
5. Risk-Benefit Analyzer (decision components)
6. Portfolio Rebalancer (PortfolioRebalancing)
7. Strategic Advisor Chatbot (StrategicAdvisorChat)

**Automation & Workflows (6 features):**
1. Auto-Notification Router (AINotificationRouter)
2. Smart Tagging (classification on entity creation)
3. Data Quality Checker (AIDataQualityChecker)
4. Duplicate Detector (DuplicateDetection)
5. Workflow Optimizer (AIWorkflowOptimizer)
6. Capacity Optimizer (scheduling algorithms)

**AI Implementation Standards:**

Request bilingual output from all AI integrations:
- Always include analysis_en and analysis_ar properties
- All recommendations should have title_en and title_ar
- Include confidence_score (0-100)
- Provide reasoning for all suggestions

I need to add all these comprehensive sections to the prompt. Let me continue with more sections.


1. Understand the feature context and its relationship to:
   * Entity Models (Pilot, Challenge, Solution, Municipality, Sandbox, Region, City, etc.)
   * Approval & Workflow Engines
   * KPI / Financial / Compliance / Evaluation Systems
   * Conversion Hubs, Scaling Hub, Procurement Hub, RD Hub, Policy Hub

2. Generate production-ready code:
   * Fully typed, optimized, and scalable
   * Written with modularity and maintainability as default
   * Matching architectural standards outlined below

## 1A. PLATFORM PAGE INVENTORY

### Master Portal Pages (7 Main Portals)

1. **Executive Portal**
   - ExecutiveDashboard (requireAdmin: true)
   - ExecutiveStrategicChallengeQueue (requireAdmin: true)
   - ExecutiveBriefGenerator (requireAdmin: true)

2. **Admin Portal**
   - AdminPortal (requireAdmin: true)
   - DataManagementHub (requireAdmin: true)
   - UserManagementHub (requireAdmin: true)
   - RBACDashboard (requireAdmin: true)
   - RolePermissionManager (requireAdmin: true)

3. **Municipality Portal**
   - MunicipalityDashboard (requiredPermissions: ['challenge_view_own', 'pilot_view_own'])
   - MunicipalityProfile (public or own municipality)
   - MyChallenges (requiredPermissions: ['challenge_view_own'])
   - MyPilots (requiredPermissions: ['pilot_view_own'])

4. **Startup Portal**
   - StartupDashboard (requiredPermissions: ['solution_view_own'])
   - OpportunityFeed (public or authenticated)
   - MyApplications (authenticated)

5. **Academia Portal**
   - AcademiaDashboard (requiredPermissions: ['rd_view_own'])
   - RDCalls (public or requiredPermissions: ['rd_view_all'])
   - RDProjects (requiredPermissions: ['rd_view_all'])

6. **Program Operator Portal**
   - ProgramOperatorPortal (requiredPermissions: ['program_manage'])
   - ApplicationReviewHub (requiredPermissions: ['program_manage'])

7. **Public Portal**
   - PublicPortal (public)
   - PublicIdeasBoard (public)
   - PublicPilotTracker (public)

### Core Entity Pages (CRUD Pattern)

Each follows: List → Create → Detail → Edit pattern

**Challenges**
- Challenges (requiredPermissions: ['challenge_view_all'])
- ChallengeCreate (requiredPermissions: ['challenge_create'])
- ChallengeDetail (requiredPermissions: ['challenge_view_all'] or 'challenge_view_own')
- ChallengeEdit (requiredPermissions: ['challenge_edit'])

**Pilots**
- Pilots (requiredPermissions: ['pilot_view_all'])
- PilotCreate (requiredPermissions: ['pilot_create'])
- PilotDetail (requiredPermissions: ['pilot_view_all'] or 'pilot_view_own')
- PilotEdit (requiredPermissions: ['pilot_edit'])

**Solutions**
- Solutions (requiredPermissions: ['solution_view_all'])
- SolutionCreate (requiredPermissions: ['solution_create'])
- SolutionDetail (public or requiredPermissions: ['solution_view_all'])
- SolutionEdit (requiredPermissions: ['solution_edit'])

**R&D**
- RDProjects (requiredPermissions: ['rd_view_all'])
- RDProjectCreate (requiredPermissions: ['rd_create'])
- RDProjectDetail (requiredPermissions: ['rd_view_all'])
- RDProjectEdit (requiredPermissions: ['rd_edit'])
- RDCalls (public or requiredPermissions: ['rd_view_all'])
- RDCallCreate (requireAdmin: true)

**Programs**
- Programs (public or requiredPermissions: ['program_view_all'])
- ProgramCreate (requireAdmin: true)
- ProgramDetail (public or requiredPermissions: ['program_view_all'])
- ProgramEdit (requiredPermissions: ['program_manage'])

**Organizations**
- Organizations (requiredPermissions: ['organization_view_all'])
- OrganizationCreate (requireAdmin: true)
- OrganizationDetail (public or requiredPermissions: ['organization_view_all'])
- OrganizationEdit (requireAdmin: true)

**Sandboxes & Living Labs**
- Sandboxes (requiredPermissions: ['sandbox_view_all'])
- SandboxCreate (requireAdmin: true)
- SandboxDetail (requiredPermissions: ['sandbox_view_all'])
- LivingLabs (requiredPermissions: ['livinglab_view_all'])
- LivingLabCreate (requireAdmin: true)

### Workflow & Approval Pages

- ApprovalCenter (requiredPermissions: ['challenge_approve', 'pilot_approve', 'solution_approve'])
- MyApprovals (authenticated)
- ChallengeReviewQueue (requiredPermissions: ['challenge_approve'])
- PilotEvaluations (requiredPermissions: ['pilot_approve', 'expert_evaluate'])
- EvaluationPanel (requiredPermissions: ['expert_evaluate'])
- ApplicationReviewHub (requiredPermissions: ['program_manage'])

### Hub & Orchestration Pages

- ConversionHub (requireAdmin: true)
- ScalingWorkflow (requiredPermissions: ['pilot_scale'])
- MatchmakerApplications (public or authenticated)
- RelationManagementHub (requireAdmin: true)
- PolicyHub (requiredPermissions: ['policy_view_all'])

### Analytics & Intelligence Pages

- PipelineHealthDashboard (requiredPermissions: ['challenge_view_all', 'pilot_view_all'])
- FlowVisualizer (requiredPermissions: ['challenge_view_all', 'pilot_view_all'])
- VelocityAnalytics (requireAdmin: true)
- SectorDashboard (requiredPermissions: ['challenge_view_all'])
- MII (public or authenticated)
- Trends (public or authenticated)
- KnowledgeGraph (requiredPermissions: ['challenge_view_all'])

### User & Identity Pages

- UserProfile (authenticated)
- Settings (authenticated)
- NotificationCenter (authenticated)
- MyWorkloadDashboard (authenticated)
- TaskManagement (authenticated)
- MyDeadlines (authenticated)
- MyPerformance (authenticated)

### Expert System Pages

- ExpertRegistry (requiredPermissions: ['expert_view_all'])
- ExpertOnboarding (authenticated)
- ExpertAssignmentQueue (requiredPermissions: ['expert_evaluate'])
- ExpertMatchingEngine (requireAdmin: true)
- ExpertPerformanceDashboard (requireAdmin: true)

### Citizen Engagement Pages

- PublicIdeaSubmission (public or authenticated)
- PublicIdeasBoard (public)
- IdeasManagement (requireAdmin: true)
- IdeasAnalytics (requireAdmin: true)
- IdeaEvaluationQueue (requireAdmin: true)
- CitizenDashboard (authenticated citizen)
- CitizenLeaderboard (public)

### Policy & Governance Pages

- PolicyHub (requiredPermissions: ['policy_view_all'])
- PolicyCreate (requireAdmin: true)
- PolicyDetail (public or requiredPermissions: ['policy_view_all'])
- PolicyEdit (requiredPermissions: ['policy_edit'])
- PolicyTemplateManager (requireAdmin: true)

### Geography & Taxonomy Pages

- RegionManagement (requireAdmin: true)
- CityManagement (requireAdmin: true)
- TaxonomyBuilder (requireAdmin: true)
- ServiceCatalog (requireAdmin: true)

### Strategic Planning Pages

- StrategyCockpit (requireAdmin: true)
- StrategicPlanBuilder (requireAdmin: true)
- OKRManagementSystem (requireAdmin: true)
- Portfolio (requiredPermissions: ['challenge_view_all', 'pilot_view_all'])

### Coverage & Validation Pages (Admin Only)

- MasterDevelopmentPrompt (requireAdmin: true)
- MenuRBACCoverageReport (requireAdmin: true)
- MenuCoverageReport (requireAdmin: true)
- WorkflowApprovalSystemCoverage (requireAdmin: true)
- ConversionsCoverageReport (requireAdmin: true)
- DetailPagesCoverageReport (requireAdmin: true)
- EditPagesCoverageReport (requireAdmin: true)
- CreateWizardsCoverageReport (requireAdmin: true)
- ValidationDashboard (requireAdmin: true)

## 2. File & Directory Standards

| Layer                           | Code Location                          |
| ------------------------------- | -------------------------------------- |
| UI pages & screens              | /pages/*, /components/pageBlocks/*     |
| Reusable UI components          | /components/ui/*                       |
| Platform workflows              | /components/workflows/*                |
| Approval engines                | /components/approval/*                 |
| Policy features                 | /components/policy/*                   |
| Pilot-related operations        | /components/pilots/*                   |
| Data access & API integration   | /api/PlatformClient.ts                   |
| Hooks & shared logic            | /hooks/*                               |
| Analytics & Insight engines     | /ai/*                                  |
| Reports & coverage dashboards   | /reporting/*                           |
| Menu & navigation configuration | /layout, /navigation/menu.ts           |

## 3. Development Rules

### Every new feature or update MUST:

✔ Follow component design system
✔ Use Card, Badge, Tabs, Button, Textarea only via imports
✔ All UI elements must support English + Arabic localisation
✔ All text must be wrapped using t({en:'', ar:''})

### Component Development Rules:

1. Ensure component imports are complete
2. All props must be typed with interfaces
3. Components must be self-contained
4. If a component interacts with backend → place logic inside useQuery, useMutation

## 4. Complete Workflow Catalog (All Entities)

### CHALLENGE WORKFLOWS (7):
1. **Challenge Submission** (draft → submitted)
   - ChallengeSubmissionWizard (3 steps: readiness checklist, AI brief, final notes)
   - Gate: challenge_submission with 4 self-check + 4 reviewer items
   - Location: ChallengeDetail "Submit for Review" button
   
2. **Challenge Review** (submitted → under_review → approved/rejected)
   - ChallengeReviewWorkflow (quality checklist, expert evaluations, decision)
   - Gate: challenge_review with 4 self-check + 5 reviewer items
   - Location: ChallengeReviewQueue, ApprovalCenter
   
3. **Treatment Planning** (approved → in_treatment)
   - ChallengeTreatmentPlan (track assignment, approach, milestones)
   - TrackAssignment (AI recommends track: pilot/r_and_d/program/procurement/policy)
   - Location: ChallengeDetail "Plan Treatment" button
   
4. **Challenge Resolution** (in_treatment → resolved)
   - ChallengeResolutionWorkflow (outcome, summary, impact, mandatory lessons)
   - LessonsLearnedEnforcer (min 1 lesson with category, text, recommendation)
   - Gate: challenge_resolution with 4 self-check + 5 reviewer items
   - Location: ChallengeDetail "Resolve" button
   
5. **Challenge Archiving** (any status → archived)
   - ChallengeArchiveWorkflow (reason required)
   - Location: ChallengeDetail "Archive" button
   
6. **Challenge → R&D Conversion**
   - ChallengeToRDWizard (AI generates research questions, methodology, outputs)
   - Location: ChallengeDetail R&D tab
   
7. **Challenge → Program Conversion**
   - ChallengeToProgramWorkflow (cluster challenges, AI generates program details)
   - Location: Challenges page "AI Clusters" view → select cluster → create program

### PILOT WORKFLOWS (10):
1. **Pilot Design & Submission** (design → approval_pending)
   - PilotSubmissionWizard (readiness checklist 75%+, AI submission brief)
   - Gate: pilot_design_review with 4 self-check + 5 reviewer items
   - Location: PilotDetail "Submit for Approval" button
   
2. **Pilot Approval** (approval_pending → approved/rejected)
   - UnifiedWorkflowApprovalTab integration with gate_name: pilot_design_review
   - ApprovalCenter with InlineApprovalWizard
   - Expert evaluation via ExpertMatchingEngine + UnifiedEvaluationForm
   - Multi-expert consensus via EvaluationConsensusPanel
   
3. **Pilot Preparation** (approved → preparation → active)
   - PilotPreparationChecklist (team onboarding, data collection, compliance)
   - Gate: pilot_launch_approval with 4 self-check + 4 reviewer items
   - Location: PilotDetail "Start Preparation" button
   
4. **Pilot Execution Monitoring** (active → monitoring)
   - Real-time KPI tracking (RealTimeKPIMonitor)
   - Issue logging (PilotIssue entity)
   - Milestone tracking (Milestone entity with approvals)
   - Stakeholder feedback collection (StakeholderFeedback)
   
5. **Pilot Mid-Review** (monitoring → continue/pivot/pause)
   - Gate: pilot_mid_review with 4 self-check + 5 reviewer items
   - UnifiedWorkflowApprovalTab with decisions: continue, pivot, pause, terminate
   - Location: Automatic at 50% timeline completion
   
6. **Pilot Pivot** (any active stage → iteration)
   - PilotPivotWorkflow (pivot type, rationale, proposed changes, AI impact analysis)
   - Location: PilotDetail "Request Pivot" button
   
7. **Pilot Evaluation** (active → evaluation → completed)
   - PilotEvaluationGate (AI-generated summary, manual input, recommendation)
   - Gate: pilot_completion_evaluation with 4 self-check + 5 reviewer items
   - Expert panel evaluation via ExpertEvaluation entity
   - Decisions: scale, iterate, pivot, terminate
   
8. **Pilot Termination** (any stage → terminated)
   - PilotTerminationWorkflow (reason, AI post-mortem, mandatory lessons)
   - Location: PilotDetail "Terminate" button
   
9. **Pilot → R&D Follow-up**
   - PilotToRDWorkflow (AI extracts research questions from results)
   - Location: PilotDetail "Next Steps" tab → "Create R&D Follow-up"
   
10. **Pilot → Policy Recommendation**
    - PilotToPolicyWorkflow (AI generates policy recommendation with rationale)
    - Location: PilotDetail "Next Steps" tab → "Generate Policy"
    
11. **Pilot → Procurement**
    - PilotToProcurementWorkflow (AI generates RFP from validation data)
    - Location: PilotDetail "Next Steps" tab → "Initiate Procurement"
    
12. **Pilot → Solution Feedback**
    - SolutionFeedbackLoop (AI analyzes results, generates improvements, emails provider)
    - Location: PilotDetail "Next Steps" tab (auto-visible if solution_id exists)

### POLICY WORKFLOWS (7):
1. **Policy Creation** (draft)
   - PolicyCreate wizard (2 steps: thoughts+context → structured form)
   - AI generates complete framework from free-form input
   - Auto-translation AR → EN
   - Template library integration
   
2. **Legal Review** (draft → legal_review)
   - PolicyLegalReviewGate (5 self-check + 5 reviewer items)
   - Self-check: citations complete, legal framework identified, stakeholders ready
   - Reviewer: legal citations verified, no conflicts, compliance checked
   - SLA: 14 days with escalation
   
3. **Public Consultation** (legal_review → public_consultation)
   - PolicyPublicConsultationManager (30-60 day period, feedback collection)
   - Self-check: public URL published, min 30 days, stakeholders notified
   - Reviewer: duration adequate, feedback collected, summary prepared
   - SLA: 60 days (no escalation)
   
4. **Council Approval** (public_consultation → council_approval)
   - PolicyCouncilApprovalGate (voting system, consensus tracking)
   - Self-check: briefing prepared, meeting scheduled, conditions addressed
   - Reviewer: briefing presented, vote recorded, minutes documented
   - SLA: 30 days with escalation
   
5. **Ministry Approval** (council_approval → ministry_approval)
   - PolicyMinistryApprovalGate (final approval, publication authorization)
   - Self-check: council approval obtained, conditions satisfied, materials ready
   - Reviewer: ministry briefing reviewed, national alignment verified, publication authorized
   - SLA: 21 days with escalation
   
6. **Policy Implementation** (published → implementation → active)
   - PolicyImplementationTracker (municipality adoption map, rollout progress)
   - PolicyAdoptionMap (shows which municipalities adopted)
   - PolicyImpactMetrics (tracks policy effectiveness)
   
7. **Policy Amendment** (active → amendment process)
   - PolicyAmendmentWizard (change proposal, approval flow)
   - PolicyEditHistory (version tracking)
   - PolicyConflictDetector (checks against existing policies)

### SOLUTION WORKFLOWS (5):
1. **Solution Submission** (draft → submitted)
   - SolutionCreate wizard (profile, tech specs, pricing, case studies)
   - AI profile enhancement
   - Location: StartupDashboard → "Add Solution"
   
2. **Solution Verification** (submitted → under_verification → verified)
   - SolutionVerification page (admin review queue)
   - UnifiedEvaluationForm with ExpertEvaluation (entity_type: solution)
   - Technical experts evaluate: TRL, security, scalability
   - Multi-expert consensus via EvaluationConsensusPanel
   
3. **Solution → Challenge Matching** (verified → matched)
   - ChallengeSolutionMatching page (AI semantic matching)
   - Match scores and reasoning
   - Approve/shortlist/reject actions
   
4. **Solution Deployment Tracking** (in pilots)
   - SolutionDeploymentTracker (tracks deployments across pilots)
   - DeploymentSuccessTracker (success rates per deployment)
   
5. **Solution Performance Review** (after pilots)
   - SolutionReviewCollector (municipality reviews)
   - Performance metrics updated

### R&D WORKFLOWS (8):
1. **R&D Call Creation** (draft → published → open)
   - RDCallCreate wizard
   - RDCallPublishWorkflow (approval before publishing)
   - AI generates call from challenge clusters
   
2. **R&D Proposal Submission** (draft → submitted)
   - ProposalWizard (research plan, methodology, budget, team)
   - ProposalEligibilityChecker (AI validates eligibility)
   - Mandatory: challenge_ids field (link to challenges)
   
3. **R&D Proposal Review** (submitted → under_review)
   - ProposalReviewWorkflow (peer review assignment)
   - UnifiedEvaluationForm with ExpertEvaluation (entity_type: rd_proposal)
   - ExpertPanel for multi-reviewer consensus
   - Academic merit scoring
   
4. **R&D Award Decision** (under_review → approved/rejected)
   - Award committee decision
   - Budget allocation
   - checkConsensus function auto-updates status
   
5. **R&D Project Kickoff** (approved → active)
   - RDProjectKickoffWorkflow (team formation, ethics approval)
   - Research ethics approval tracking (IRB)
   
6. **R&D Milestone Gates** (active → monitoring)
   - RDProjectMilestoneGate (periodic progress reviews)
   - TRL advancement tracking
   
7. **R&D Project Completion** (active → completed)
   - RDProjectCompletionWorkflow (outputs validation, impact assessment)
   - RDOutputValidation (verify deliverables)
   
8. **R&D → Pilot Transition** (completed → pilot)
   - RDToPilotTransition (AI converts research to pilot design)
   - TRL validation (must be ≥6)

### PROGRAM WORKFLOWS (7):
1. **Program Launch** (planning → applications_open)
   - ProgramLaunchWorkflow (approval gate, announcement)
   - Location: ProgramDetail "Launch Program"
   
2. **Application Screening** (submitted → screening)
   - ProgramApplicationScreening (eligibility check)
   - AIProposalScreening (AI pre-scores applications)
   
3. **Application Selection** (screening → accepted/rejected)
   - ProgramSelectionWorkflow (evaluation panel, scoring)
   - UnifiedEvaluationForm with ExpertEvaluation (entity_type: program_application)
   - Multi-evaluator consensus
   
4. **Cohort Management** (active program)
   - CohortManagement component (participant tracking)
   - SessionScheduler (session planning)
   - ProgramMentorMatching (AI mentor-participant matching)
   
5. **Mid-Program Review** (active → checkpoint)
   - ProgramMidReviewGate (progress assessment, pivot decisions)
   
6. **Program Completion** (active → completed)
   - ProgramCompletionWorkflow (graduation, certificates)
   - GraduationWorkflow (certificate generation)
   
7. **Program → Pilot Conversion** (completed → pilots)
   - Track via ProgramPilotLink entity
   - Conversion metrics in ProgramOutcomesAnalytics

### SANDBOX WORKFLOWS (6):
1. **Sandbox Application** (draft → submitted)
   - SandboxApplicationWizard (project description, exemptions needed)
   - AIRegulatoryGapAnalyzer (identifies regulatory barriers)
   
2. **Entry Approval** (submitted → approved)
   - Sandbox governance board review
   - Risk assessment
   - Safety protocol validation
   
3. **Infrastructure Readiness** (approved → ready)
   - SandboxInfrastructureReadinessGate (checklist)
   
4. **Sandbox Launch** (ready → active)
   - SandboxLaunchChecklist (final checks before go-live)
   
5. **Sandbox Monitoring** (active → monitoring)
   - Incident tracking (SandboxIncident entity)
   - Regulatory compliance monitoring (SandboxComplianceMonitor)
   - Performance analytics (SandboxPerformanceAnalytics)
   
6. **Sandbox Exit** (active → exited)
   - SandboxProjectExitWizard (exit criteria, final report)

### MATCHMAKER WORKFLOWS (4):
1. **Application Intake** (draft → submitted)
   - MatchmakerApplicationCreate wizard
   - Intake gate (completeness, file validation, duplicate check)
   
2. **Stakeholder Review** (submitted → screening)
   - StakeholderReviewGate (strategic alignment assessment)
   - Municipal stakeholder evaluation
   
3. **Executive Review** (screening → evaluation)
   - ExecutiveReviewGate (strategic value, partnership potential)
   
4. **Match Quality Assessment** (evaluation → matched)
   - MatchQualityGate (collaboration readiness)
   - EnhancedMatchingEngine (AI match success predictor)

### SCALING WORKFLOWS (5):
1. **Scaling Readiness Assessment**
   - ScalingReadinessChecker (validates pilot success, replicability)
   - AI readiness predictor
   
2. **Scaling Plan Creation** (completed pilot → planning)
   - ScalingPlanningWizard (target cities, budget, timeline)
   - BudgetApprovalGate (for scaling budget)
   
3. **Municipal Onboarding** (planning → execution)
   - MunicipalOnboardingWizard (per target city)
   - Capacity assessment
   
4. **Rollout Execution** (execution → monitoring)
   - ScalingExecutionDashboard (per-city tracking)
   - SuccessMonitoringDashboard (performance across cities)
   
5. **National Integration** (monitoring → completed)
   - NationalIntegrationGate (80%+ rollout threshold)
   - Institutionalization pathway

### CITIZEN ENGAGEMENT WORKFLOWS (7):
1. **Idea Submission** (citizen → submitted)
   - PublicIdeaSubmission (simple form, AI pre-screening)
   - AI: clarity_score, feasibility_score, toxicity_score, duplicate detection
   
2. **Idea Screening** (submitted → screening → under_evaluation)
   - ContentModerationAI (toxicity, spam detection)
   - AIIdeaClassifier (category, priority)
   - Auto-recommendation: approve/review_required/reject
   
3. **Idea Evaluation** (under_evaluation → approved/rejected)
   - IdeaEvaluationQueue (expert evaluation)
   - UnifiedEvaluationForm with 8-dimension scorecard
   - MultiEvaluatorConsensus (if multiple evaluators)
   
4. **Idea → Challenge Conversion**
   - IdeaToChallengeConverter (AI structures idea into formal challenge)
   - Citizen notified via CitizenClosureNotification
   
5. **Idea → Solution Conversion**
   - IdeaToSolutionConverter (AI extracts value proposition)
   
6. **Idea → Pilot Conversion**
   - IdeaToPilotConverter (AI generates pilot design)
   
7. **Idea → R&D Conversion**
   - IdeaToRDConverter (AI frames research questions)
   
8. **Idea Merge** (duplicates → merged)
   - MergeDuplicatesDialog (multi-submitter attribution)

### INNOVATION PROPOSAL WORKFLOWS (4):
1. **Proposal Submission** (program/challenge response)
   - ProgramIdeaSubmission (structured form with taxonomy)
   - ChallengeIdeaResponse (challenge-specific response)
   - AI pre-screening: completeness, budget reasonability, team adequacy
   
2. **Proposal Screening** (submitted → screening)
   - AIProposalScreening (eligibility, feasibility, strategic fit)
   - Self-check: 6 items
   - Reviewer: 6 items
   
3. **Stakeholder Alignment** (screening → alignment)
   - StakeholderAlignmentGate (municipality buy-in, resource commitment)
   - Self-check: 4 items
   - Reviewer: 4 items
   
4. **Proposal → Pilot Conversion** (approved → pilot)
   - ProposalToPilotConverter (validates all pilot fields present)

### EXPERT SYSTEM WORKFLOWS (5):
1. **Expert Onboarding** (application → verified)
   - ExpertOnboarding wizard (CV upload, AI extraction, profile completion)
   - Admin approval in ExpertDetail
   
2. **Expert Assignment** (entity needs evaluation)
   - ExpertMatchingEngine (AI semantic matching by sector/expertise)
   - ExpertAssignment entity created (status: pending)
   - Expert notified
   
3. **Expert Evaluation** (assigned → evaluated)
   - ExpertAssignmentQueue (expert's work queue)
   - UnifiedEvaluationForm (8-dimension scorecard)
   - ExpertEvaluation entity created
   
4. **Multi-Expert Consensus** (multiple evaluations → consensus)
   - EvaluationConsensusPanel (calculates agreement)
   - checkConsensus function auto-updates entity status
   - ExpertPanel entity tracks voting
   
5. **Expert Performance Review** (periodic)
   - ExpertPerformanceDashboard (quality metrics)
   - Response time, acceptance rate, consensus rate

### APPROVAL & GOVERNANCE WORKFLOWS (8):
1. **Budget Approval** (any entity with budget)
   - BudgetApprovalWorkflow (phases: design 20%, implementation 60%, evaluation 20%)
   - Thresholds: >100K SAR requires approval
   - Location: Integrated in entity workflows
   
2. **Milestone Approval** (ongoing projects)
   - MilestoneApprovalGate (deliverable review, evidence validation)
   - Location: Entity detail pages → Timeline tab
   
3. **Strategic Plan Approval** (strategic planning)
   - StrategicPlanApprovalGate (executive approval)
   - Location: StrategicPlanBuilder
   
4. **Budget Allocation Approval** (annual planning)
   - BudgetAllocationApprovalGate (portfolio-level budget)
   - Location: BudgetAllocationTool
   
5. **Initiative Launch Approval** (new strategic initiatives)
   - InitiativeLaunchGate (readiness verification)
   - Location: StrategicInitiativeTracker
   
6. **Portfolio Review** (quarterly)
   - PortfolioReviewGate (strategic alignment check)
   - Location: Portfolio page
   
7. **Contract Approval** (procurement)
   - Contract signing approval workflow
   - Location: ContractManagement
   
8. **Vendor Approval** (procurement)
   - Vendor verification workflow
   - Location: VendorRegistry

### KNOWLEDGE & CONTENT WORKFLOWS (3):
1. **Knowledge Document Publishing** (draft → published)
   - Content review and approval
   - SEO optimization
   - Auto-tagging
   
2. **Case Study Generation** (from completed pilots)
   - SolutionCaseStudyWizard (AI generates impact story)
   - Auto-publication option
   
3. **News Article Publishing** (draft → review → published)
   - Editorial workflow
   - Multi-language review

### AUTOMATION WORKFLOWS (5):
1. **SLA Automation** (background process)
   - slaAutomation function (auto-calculate due dates, escalate overdue)
   - Runs: daily
   - Updates: escalation_level (0/1/2), sends leadership alerts
   
2. **Embedding Generation** (background process)
   - generateEmbeddings function (768-dimension vectors)
   - Triggers: on entity create/update
   - Entities: Challenge, Solution, Pilot, RDProposal, KnowledgeDocument
   
3. **R&D Backwards Linking** (background process)
   - challengeRDBacklink function (syncs Challenge.linked_rd_ids)
   - Runs: hourly
   - Ensures bidirectional links
   
4. **Citizen Points Automation** (background process)
   - pointsAutomation function (awards points on events)
   - Events: idea submission (+10), vote received (+5), conversion (+50), resolution (+100)
   - Badge unlocking at thresholds
   
5. **Auto-Notification Triggers** (background process)
   - autoNotificationTriggers function (status change notifications)
   - citizenNotifications function (citizen-specific)
   - evaluationNotifications function (expert evaluations)

### CONVERSION WORKFLOWS (Complete Map):

**FROM CHALLENGE (5 paths):**
1. Challenge → Pilot (SmartActionButton + PilotCreate pre-fill)
2. Challenge → R&D (ChallengeToRDWizard)
3. Challenge → Policy (PolicyRecommendationManager)
4. Challenge → Program (ChallengeToProgramWorkflow)
5. Challenge → RFP (ChallengeRFPGenerator)

**FROM PILOT (5 paths):**
1. Pilot → R&D (PilotToRDWorkflow)
2. Pilot → Policy (PilotToPolicyWorkflow)
3. Pilot → Procurement (PilotToProcurementWorkflow)
4. Pilot → Scaling (ScalingWorkflow)
5. Pilot → Solution Update (SolutionFeedbackLoop)

**FROM CITIZEN IDEA (5 paths):**
1. Idea → Challenge (IdeaToChallengeConverter)
2. Idea → Solution (IdeaToSolutionConverter)
3. Idea → Pilot (IdeaToPilotConverter)
4. Idea → R&D (IdeaToRDConverter)
5. Idea → Merge (MergeDuplicatesDialog)

**FROM INNOVATION PROPOSAL (2 paths):**
1. Proposal → Pilot (ProposalToPilotConverter)
2. Proposal → Challenge (if needed)

**FROM R&D (2 paths):**
1. R&D → Pilot (RDToPilotTransition)
2. R&D → Solution (commercialization)

**Workflow Modification Rules:**
1. Update the workflow UI component
2. Update UnifiedWorkflowApprovalTab if gate-based
3. Update ApprovalGateConfig.js with gate definitions
4. Update ApprovalCenter integration
5. Update relevant coverage reports
6. Test approval flow end-to-end with different roles
7. Verify notification triggers
8. Check SystemActivity logging

## 5. Reporting & Change Coverage Enforcement

Every time AI modifies the system, it must update coverage documentation:

| Report                                | Purpose                                  |
| ------------------------------------- | ---------------------------------------- |
| ConversionsCoverageReport             | Tracks conversion flows & readiness      |
| DetailPagesCoverageReport             | Detail pages implementation status       |
| EditPagesCoverageReport               | Edit pages implementation status         |
| CreateWizardsCoverageReport           | Wizard coverage & AI assistance          |
| WorkflowApprovalSystemCoverage        | Workflow gates & approval tracking       |

## 6. AI Agent Update Protocol

When requested to add or modify features:

### Step-by-step execution:

1. Map feature scope
   - Identify components affected
   - Determine workflows impacted
   - List files requiring updates

2. Apply changes to components
   - Develop UI
   - Link to backend API
   - Apply translation patterns

3. Update Workflows & Logic

4. Regenerate Hub / Report files

5. Update menu navigation

6. Return structured output

### Required Outputs in Every Change:
- Files Modified
- Files Created
- Code Blocks (Full, not diff)
- Feature Behavior Summary
- Report Updates
- Next Optimisation Recommendations

## 7. The Agent MUST NEVER

❌ Leave imports incomplete
❌ Introduce components without localising text
❌ Modify without updating coverage reports
❌ Return diff-only responses
❌ Push changes without describing systemic impact

## 8. Entity Relationship Map

Key entities and their relationships:

Challenge → Solution (ChallengeSolutionMatch)
Challenge → Pilot (via challenge_id)
Challenge → RDCall (via challenge_ids array)
Challenge → PolicyRecommendation (via challenge_id)
Pilot → ScalingPlan (via pilot_id)
Pilot → Contract (procurement conversion)
RDProject → Pilot (research to pilot transition)
Program → ProgramApplication → Pilot (via conversion)
Organization → Solution (provider relationship)
Municipality → Challenge (ownership)
Expert → ExpertAssignment → ExpertEvaluation

## 9. Permission System Rules (RBAC)

### 9.1 Page-Level RBAC

All pages MUST use ProtectedPage HOC:

\`\`\`javascript
import ProtectedPage from '../components/permissions/ProtectedPage';

// Public page
export default ProtectedPage(MyPage, { requiredPermissions: [] });

// View page
export default ProtectedPage(MyPage, { requiredPermissions: ['entity_view_all'] });

// Create page
export default ProtectedPage(MyPage, { requiredPermissions: ['entity_create'] });

// Edit page (own records only)
export default ProtectedPage(MyPage, { requiredPermissions: ['entity_edit_own'] });

// Admin only
export default ProtectedPage(MyPage, { requireAdmin: true });

// Multiple permissions (ALL required)
export default ProtectedPage(MyPage, { 
  requiredPermissions: ['challenge_view_all', 'pilot_view_all'] 
});
\`\`\`

### 9.2 Component-Level RBAC

Use ProtectedAction for buttons/links:

\`\`\`javascript
import { ProtectedAction } from '@/components/permissions/ProtectedAction';

<ProtectedAction requiredPermissions={['challenge_create']}>
  <Button onClick={handleCreate}>Create Challenge</Button>
</ProtectedAction>
\`\`\`

### 9.3 Link-Level RBAC

Conditionally show menu items:

\`\`\`javascript
import { usePermissions } from '@/hooks/usePermissions';

const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();

// In navigation
{hasPermission('challenge_view_all') && (
  <Link to={createPageUrl('Challenges')}>Challenges</Link>
)}

{isAdmin && (
  <Link to={createPageUrl('AdminPortal')}>Admin</Link>
)}
\`\`\`

### 9.4 Field-Level Security

Hide/disable sensitive fields:

\`\`\`javascript
{hasPermission('financial_view_sensitive') && (
  <div>
    <Label>Budget</Label>
    <Input value={budget} onChange={setBudget} />
  </div>
)}
\`\`\`

### 9.5 Permission Categories

**Challenge Permissions:**
- challenge_view_all (view all challenges)
- challenge_view_own (view own municipality challenges)
- challenge_create (create challenges)
- challenge_edit (edit challenges)
- challenge_approve (approve/review challenges)
- challenge_delete (soft delete)

**Pilot Permissions:**
- pilot_view_all
- pilot_view_own
- pilot_create
- pilot_edit
- pilot_approve
- pilot_evaluate (expert evaluation)
- pilot_scale (scaling approval)

**Solution Permissions:**
- solution_view_all
- solution_view_own
- solution_create
- solution_edit
- solution_approve (verification)

**R&D Permissions:**
- rd_view_all
- rd_view_own
- rd_create
- rd_edit
- rd_approve

**Program Permissions:**
- program_view_all
- program_manage (operator)
- program_approve

**Organization Permissions:**
- organization_view_all
- organization_create
- organization_edit

**Expert Permissions:**
- expert_evaluate (submit evaluations)
- expert_view_all (view expert registry)
- expert_assign (assign experts to entities)

**Policy Permissions:**
- policy_view_all
- policy_create
- policy_edit
- policy_approve

**Financial Permissions:**
- financial_view_sensitive (view budgets)
- financial_approve_small (< 500K SAR)
- financial_approve_large (> 500K SAR)

**Admin Permissions:**
- All permissions via requireAdmin: true
- OR specific granular permissions

### 9.6 Data Row-Level Security (RLS)

Backend automatically filters:
- Municipalities see only their data (unless permission granted)
- Startups see only their solutions
- Researchers see only their R&D projects
- Experts see only assigned evaluations

Frontend MUST respect visibility rules:
\`\`\`javascript
// Get user's municipality
const user = await Platform.auth.me();
const municipality_id = user.municipality_id;

// Filter challenges for own municipality
const challenges = await Platform.entities.Challenge.filter({
  municipality_id: municipality_id
});
\`\`\`

### 9.7 Sensitive Data Components

These components handle sensitive data and MUST have permission checks:

- **Budget fields** (financial_view_sensitive)
- **Personal contact info** (admin or own record)
- **Evaluation scores** (expert or admin)
- **Strategic plans** (admin or municipality lead)
- **Approval notes** (approver or admin)
- **Citizen personal data** (admin only)

Mark sensitive fields:
\`\`\`javascript
<div className="sensitive-data">
  {hasPermission('financial_view_sensitive') && (
    <Input value={budget} disabled={!hasPermission('financial_edit')} />
  )}
</div>
\`\`\`

## 10. Bilingual Content Strategy (RTL/LTR)

All user-facing text MUST be bilingual with proper RTL/LTR handling.

### 10.1 Entity Fields (Database)

Store bilingual content in separate fields:
\`\`\`javascript
{
  title_ar: "تحسين جودة المياه",
  title_en: "Improving Water Quality",
  description_ar: "...",
  description_en: "...",
  tagline_ar: "...",
  tagline_en: "..."
}
\`\`\`

### 10.2 UI Text (React Components)

Use t() function from LanguageContext:
\`\`\`javascript
import { useLanguage } from '../components/LanguageContext';

const { language, isRTL, t } = useLanguage();

// Simple text
<h1>{t({ en: 'Dashboard', ar: 'لوحة التحكم' })}</h1>

// Form labels
<Label>{t({ en: 'Challenge Title', ar: 'عنوان التحدي' })}</Label>

// Buttons
<Button>{t({ en: 'Submit', ar: 'إرسال' })}</Button>

// Status badges
<Badge>{t({ en: 'Active', ar: 'نشط' })}</Badge>

// Error messages
toast.error(t({ en: 'Failed to save', ar: 'فشل الحفظ' }));
\`\`\`

### 10.3 RTL/LTR Layout

Apply direction dynamically:
\`\`\`javascript
<div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
  {/* Content automatically flows RTL in Arabic */}
</div>
\`\`\`

### 10.4 Text Alignment

Use conditional classes:
\`\`\`javascript
<p className={\`\${isRTL ? 'text-right' : 'text-left'}\`}>
  {content}
</p>
\`\`\`

### 10.5 Icon & Element Positioning

Flip icons and elements for RTL:
\`\`\`javascript
// Search icon position
<div className="relative">
  <Search className={\`absolute \${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2\`} />
  <input className={\`\${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}\`} />
</div>

// Chevron/Arrow direction
<ChevronRight className={\`\${isRTL ? 'rotate-180' : ''}\`} />
\`\`\`

### 10.6 Margin & Padding

Use start/end instead of left/right where possible:
\`\`\`javascript
// Good (auto-adapts)
className="ps-4 pe-2"  // padding-start, padding-end

// Avoid (fixed direction)
className="pl-4 pr-2"  // padding-left, padding-right
\`\`\`

Or use conditional:
\`\`\`javascript
className={\`\${isRTL ? 'ml-4' : 'mr-4'}\`}
\`\`\`

### 10.7 Forms & Inputs

All form fields support both languages - use dual inputs with proper direction attributes for AR/EN content.

### 10.8 Display Entity Content

Show content in user's current language - conditionally render AR or EN fields based on language state.

### 10.9 Language Toggle

Available in top bar:
\`\`\`javascript
<Button onClick={toggleLanguage} variant="ghost">
  <Globe className="h-5 w-5" />
  {language === 'ar' ? 'EN' : 'ع'}
</Button>
\`\`\`

### 10.10 Auto-Translation (AI)

For policy documents and official content:
\`\`\`javascript
// Arabic-first policy creation
const handleSave = async () => {
  const policyData = {
    content_ar: arabicContent,
    // AI translates to English
    content_en: await Platform.functions.invoke('translatePolicy', {
      text: arabicContent,
      from: 'ar',
      to: 'en'
    }).data.translation
  };
  
  await Platform.entities.PolicyRecommendation.create(policyData);
};
\`\`\`

### 10.11 Number & Date Formatting

Use locale-aware formatting:
\`\`\`javascript
// Numbers
const formattedNumber = new Intl.NumberFormat(
  language === 'ar' ? 'ar-SA' : 'en-US'
).format(1234567);

// Dates
const formattedDate = new Intl.DateTimeFormat(
  language === 'ar' ? 'ar-SA' : 'en-US',
  { year: 'numeric', month: 'long', day: 'numeric' }
).format(new Date());

// Or use date-fns with locale
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const formatted = format(new Date(), 'PPP', {
  locale: language === 'ar' ? ar : enUS
});
\`\`\`

### 10.12 Search & Filters

Support both languages in search:
\`\`\`javascript
// Semantic search across both fields
const results = await Platform.functions.invoke('semanticSearch', {
  query: searchQuery, // works in AR or EN
  fields: ['title_ar', 'title_en', 'description_ar', 'description_en']
});
\`\`\`

### 10.13 Validation Messages

All validation errors in both languages:
\`\`\`javascript
if (!title_ar || !title_en) {
  toast.error(t({ 
    en: 'Both Arabic and English titles are required', 
    ar: 'العنوان بالعربية والإنجليزية مطلوب' 
  }));
  return;
}
\`\`\`

### 10.14 Email Templates

All notification emails MUST be bilingual - structure with RTL Arabic section, HR divider, then LTR English section.

### 10.15 PDF Reports

Generate bilingual PDFs:
- Top section: Arabic (RTL)
- Bottom section: English (LTR)
- Headers and footers in both languages

## 11. AI Integration Points - WHERE, WHAT, INPUT, OUTPUT

AI MUST be embedded strategically across the platform. Below is the comprehensive map:

### 11.1 Challenge Pages

**ChallengeCreate / ChallengeEdit**
- Location: Form wizard, Step 2 (Problem Definition)
- Button: "✨ AI Enhance Problem Statement"
- Input: Raw problem description (AR or EN)
- Output: 
  * Refined problem statement (bilingual)
  * Suggested root causes
  * Recommended KPIs
  * Similar challenges from other cities
- Implementation: AIFormAssistant component
- Permission: challenge_create

**ChallengeDetail**
- Location: Tab "AI Insights"
- Button: "🧠 Generate Strategic Analysis"
- Input: Challenge object (title, description, data, KPIs)
- Output:
  * Strategic importance analysis
  * Recommended treatment tracks
  * Similar international case studies
  * Risk factors
- Implementation: Platform.integrations.Core.InvokeLLM
- Permission: challenge_view_all

**ChallengeDetail → Solutions Tab**
- Location: "Suggested Solutions" panel
- Auto-triggered on page load
- Input: Challenge embeddings + solution embeddings
- Output: Top 10 matched solutions with similarity scores
- Implementation: SemanticSearchPanel component
- Permission: challenge_view_all

**Challenge List**
- Location: Filters sidebar
- Button: "🔍 Semantic Search"
- Input: Natural language query (e.g., "traffic safety in schools")
- Output: Filtered challenge list by semantic relevance
- Implementation: SemanticSearch component
- Permission: challenge_view_all

### 11.2 Pilot Pages

**PilotCreate**
- Location: Wizard Step 3 (Design)
- Button: "✨ AI Pilot Designer"
- Input: Challenge details, solution details
- Output:
  * Suggested hypothesis
  * Recommended KPIs with targets
  * Timeline estimate
  * Risk assessment
  * Budget ballpark
- Implementation: InvokeLLM with structured JSON schema
- Permission: pilot_create

**PilotDetail → KPI Tab**
- Location: Below KPI table
- Button: "📊 AI KPI Analysis"
- Input: KPI datapoints history
- Output:
  * Trend analysis
  * Target achievement probability
  * Recommended corrective actions
- Implementation: AISuccessPredictor component
- Permission: pilot_view_all

**PilotDetail → Evaluation Tab**
- Location: Evaluation gate
- Button: "🤖 AI Pre-Evaluation"
- Input: Pilot progress data, KPIs, milestones
- Output:
  * Success probability score
  * Strengths & weaknesses summary
  * Recommendation (continue/pivot/terminate)
- Implementation: Platform.integrations.Core.InvokeLLM
- Permission: pilot_evaluate

**PilotMonitoringDashboard**
- Location: Right sidebar "AI Risk Alerts"
- Auto-triggered (real-time polling)
- Input: All active pilots KPI data
- Output: Flagged pilots at risk with reasons
- Implementation: AnomalyDetector component
- Permission: pilot_view_all

### 11.3 Solution Pages

**SolutionCreate / SolutionEdit**
- Location: Form section "AI Enhancement"
- Button: "✨ AI Profile Enhancer"
- Input: Basic solution description
- Output:
  * Enhanced description (compelling language)
  * Suggested tags and categories
  * Comparable solutions from knowledge base
- Implementation: AIProfileEnhancer component
- Permission: solution_create

**SolutionDetail**
- Location: Tab "AI Matching"
- Button: "🎯 Find Matching Challenges"
- Input: Solution embeddings
- Output: Top challenges this solution could address
- Implementation: SemanticSearchPanel
- Permission: solution_view_all

**Solutions List (Matchmaker)**
- Location: Challenge detail → Match Solutions
- Auto-triggered
- Input: Challenge ID + all verified solutions
- Output: Ranked solutions with match scores and reasoning
- Implementation: MatchingQueue AI engine
- Permission: challenge_view_all

### 11.4 R&D Pages

**RDCallCreate**
- Location: "Generate from Challenges" wizard
- Button: "📝 AI Draft R&D Call"
- Input: Selected challenges (array)
- Output:
  * Research questions (bilingual)
  * Suggested eligibility criteria
  * Expected outputs
  * Budget range
- Implementation: Platform.integrations.Core.InvokeLLM
- Permission: requireAdmin

**RDProjectDetail**
- Location: Tab "Commercialization"
- Button: "💡 AI Commercialization Assessment"
- Input: R&D outputs, publications, TRL level
- Output:
  * Commercialization potential score
  * Pilot transition readiness
  * Recommended next steps
- Implementation: InvokeLLM with scoring schema
- Permission: rd_view_all

### 11.5 Program Pages

**ProgramCreate**
- Location: Curriculum section
- Button: "📚 AI Curriculum Generator"
- Input: Program objectives, target participants
- Output: Week-by-week curriculum with topics and activities
- Implementation: AICurriculumGenerator component
- Permission: requireAdmin

**ApplicationReviewHub**
- Location: Each application card
- Button: "🤖 AI Screening"
- Input: Application data
- Output:
  * Eligibility check (pass/fail)
  * Strength & weakness summary
  * Recommended decision
- Implementation: AIProposalScorer component
- Permission: program_manage

### 11.6 Expert System

**ExpertMatchingEngine**
- Location: ChallengeDetail → Assign Expert
- Auto-triggered
- Input: Challenge keywords + expert profiles
- Output: Top 5 expert matches with expertise alignment scores
- Implementation: Semantic matching on embeddings
- Permission: expert_assign

**EvaluationPanel**
- Location: Evaluation form
- Button: "🧠 AI Evaluation Assistant"
- Input: Entity being evaluated + evaluation rubric
- Output:
  * Suggested scores with justifications
  * Identified strengths/weaknesses
- Implementation: InvokeLLM
- Permission: expert_evaluate

### 11.7 Policy Pages

**PolicyCreate**
- Location: Drafting section
- Button: "📜 AI Policy Drafter"
- Input: Challenge/pilot that triggered policy need
- Output:
  * Policy draft (Arabic first)
  * English translation
  * Implementation guidelines
- Implementation: Platform.functions.translatePolicy
- Permission: policy_create

**PolicyDetail**
- Location: Conflict detection panel
- Auto-triggered on save
- Input: New policy text + existing policy database
- Output: Flagged conflicts or redundancies
- Implementation: PolicyConflictDetector component
- Permission: policy_edit

### 11.8 Citizen Engagement

**IdeaEvaluationQueue**
- Location: Each idea card
- Button: "🤖 AI Pre-Screen"
- Input: Citizen idea text
- Output:
  * Classification (challenge/solution/feedback)
  * Sentiment analysis
  * Recommended action
- Implementation: AIIdeaClassifier component
- Permission: requireAdmin

**IdeasManagement → Merge Tool**
- Location: Bulk actions toolbar
- Button: "🔗 AI Detect Duplicates"
- Input: All ideas in selected set
- Output: Grouped duplicates with similarity scores
- Implementation: DuplicateDetection component
- Permission: requireAdmin

### 11.9 Strategic Planning

**StrategyCockpit**
- Location: Decision simulator widget
- Button: "🎲 AI What-If Analysis"
- Input: Strategic scenario parameters
- Output:
  * Forecasted outcomes
  * Risk assessment
  * Resource implications
- Implementation: DecisionSimulator component
- Permission: requireAdmin

**Portfolio**
- Location: Portfolio rebalancing panel
- Button: "⚖️ AI Portfolio Optimizer"
- Input: Current portfolio distribution + strategic goals
- Output:
  * Recommended portfolio adjustments
  * Justifications
- Implementation: PilotPortfolioOptimizer component
- Permission: requireAdmin

### 11.10 Analytics & Intelligence

**PipelineHealthDashboard**
- Location: Insights panel (right sidebar)
- Auto-triggered (daily refresh)
- Input: All pipeline data
- Output:
  * Bottleneck detection
  * Flow velocity insights
  * Recommendations for acceleration
- Implementation: Platform.integrations.Core.InvokeLLM
- Permission: requireAdmin

**MII (Municipal Innovation Index)**
- Location: Municipality detail
- Button: "📈 AI Improvement Planner"
- Input: Current MII scores, municipality profile
- Output:
  * Top 3 improvement recommendations
  * Action plan with timeline
- Implementation: MIIImprovementPlanner component
- Permission: authenticated

### 11.11 Global AI Assistant (All Pages)

- Location: Floating Action Button (FAB) bottom-right
- Always available, context-aware
- Input: Current page context + user query
- Output: Contextual responses (explain, summarize, suggest)
- Implementation: AIAssistant component
- Permission: authenticated

### 11.12 AI Input/Output Standards

**All AI features MUST:**
- Show loading spinner during processing
- Handle errors gracefully with retry option
- Support bilingual output (AR/EN)
- Log AI calls to SystemActivity for audit
- Cache responses where appropriate (1 hour TTL)
- Provide "Explain AI reasoning" tooltip
- Include feedback mechanism (👍👎)

**AI Response Format:**
\`\`\`javascript
const response = await Platform.integrations.Core.InvokeLLM({
  prompt: "...",
  response_json_schema: {
    type: "object",
    properties: {
      analysis_en: { type: "string" },
      analysis_ar: { type: "string" },
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title_en: { type: "string" },
            title_ar: { type: "string" },
            reasoning: { type: "string" }
          }
        }
      },
      confidence_score: { type: "number" }
    }
  }
});
\`\`\`

## 12. Workflow Gate Pattern

All workflow gates follow this structure:

1. Self-check component (requester fills)
2. Reviewer checklist (assigned reviewer completes)
3. AI assistance panel (optional but recommended)
4. Decision UI (approve/reject/conditional/info_requested)
5. Notification triggers (automated)
6. Status update in entity record
7. Activity log entry

Example gates:
- ChallengeSubmissionWizard
- PilotEvaluationGate
- BudgetApprovalGate
- PolicyLegalReviewGate
- SandboxApplicationGate

## 13. Coverage Report Integration

After ANY change to workflows, detail pages, wizards, or hubs:

1. Update relevant coverage report page
2. Recalculate completion percentages
3. Update gap analysis sections
4. Refresh implementation tracker
5. Update menu if new pages added

Coverage reports are CRITICAL for tracking platform maturity.

## 14. Hub Architecture Pattern

Platform has several "Hub" pages that aggregate functionality:

- DataManagementHub: CRUD for geography/taxonomy
- RelationManagementHub: AI matching + relation review
- ApprovalCenter: Unified approval queue
- ConversionHub: Cross-entity conversion opportunities
- PolicyHub: Policy lifecycle management
- MatchmakerHub: Provider-challenge matching

Hubs MUST:
- Pull data from multiple entities
- Provide bulk operations
- Include AI insights
- Support filtering and search
- Link to detail pages
- Require admin or specialized permissions

## 15. Detail Page Pattern

All detail pages follow this structure:

1. Hero section (title, status, key metrics)
2. Action buttons (edit, workflow triggers)
3. Tabbed content sections (Overview, Data, AI, Workflow, etc.)
4. Right sidebar (quick info, metadata)
5. Comment/discussion thread
6. Activity log
7. Related entities section
8. AI insights panel

Examples: ChallengeDetail, PilotDetail, SolutionDetail, RDProjectDetail

## 16. Conversion System

The platform supports multiple conversion paths:

| Source           | Target              | Location                      |
| ---------------- | ------------------- | ----------------------------- |
| CitizenIdea      | Challenge           | IdeaEvaluationQueue           |
| Challenge        | RDCall              | ChallengeDetail → R&D tab     |
| Challenge        | Pilot               | ChallengeDetail → Next Steps  |
| Challenge        | PolicyRec           | ChallengeDetail → Policy tab  |
| Pilot            | RDProject           | PilotDetail → Next Steps      |
| Pilot            | PolicyRec           | PilotDetail → Next Steps      |
| Pilot            | Contract            | PilotDetail → Procurement     |
| Pilot            | ScalingPlan         | ScalingWorkflow               |
| RDProject        | Pilot               | RDProjectDetail → Transition  |
| InnovationProp   | Pilot/Challenge     | InnovationProposalDetail      |

Conversions MUST:
- Pre-fill fields from source entity
- Use AI to enhance/complete missing fields
- Create bidirectional relations (ChallengeRelation entity)
- Log conversion in SystemActivity
- Trigger notifications to relevant parties

## 17. Financial & Budget Tracking

All pilots, programs, and R&D projects track budgets:

Required fields:
- budget (total allocated)
- budget_spent (actual)
- budget_released (approved/released)
- budget_breakdown (array of line items)
- budget_approvals (array of approval records)

Budget approval gates required for:
- Pilots > 500K SAR
- Programs > 1M SAR
- Scaling plans > 2M SAR
- R&D projects > 1M SAR

## 18. KPI System Integration

KPI tracking is core to pilot evaluation:

- KPIs linked via PilotKPI entity
- Data points stored in PilotKPIDatapoint
- Real-time dashboards fetch latest datapoints
- Targets vs actuals calculated on-the-fly
- AI alerts on target misses
- Auto-suggestions for corrective actions

## 19. Expert System Integration

Expert workflow:

1. Expert registration (ExpertOnboarding)
2. Profile verification (admin task)
3. Expert assignment (ExpertAssignment entity)
4. Evaluation submission (UnifiedEvaluationForm)
5. Consensus calculation (EvaluationConsensusPanel)
6. Expert performance tracking (ExpertPerformanceDashboard)

All entities support expert evaluation:
- Challenge, Pilot, RDProject, RDProposal, Program, Solution

## 20. Scaling & Deployment

Scaling workflow stages:

1. Pilot completes with "scale" recommendation
2. ScalingPlan created (ScalingPlanningWizard)
3. Budget approval gate
4. Municipality onboarding (per target city)
5. Deployment tracking (ScalingExecutionDashboard)
6. Success monitoring per city
7. National integration gate (80%+ rollout)

## 21. Testing & Validation

Before submitting any code, AI must mentally verify:

✅ All imports present
✅ No undefined variables
✅ Bilingual text wrapped in t()
✅ RBAC protection applied
✅ Related reports updated
✅ Menu links correct
✅ Workflow logic sound
✅ API calls use Platform client
✅ Loading states handled
✅ Error states handled

## 22. Notification & Activity Logging

All significant actions trigger:

1. Notification creation (Notification entity)
2. Activity log (SystemActivity entity)
3. Auto-notifications via autoNotificationTriggers function

Events requiring notifications:
- Workflow stage changes
- Assignment to expert/reviewer
- Approval/rejection decisions
- Deadline approaching (SLA)
- Budget threshold exceeded
- KPI target missed

## 23. System Architecture Layers

LAYER 1: PRESENTATION (React)
  - Pages, Components, Workflows, UI
           |
           v (uses)
           |
LAYER 2: APPLICATION (Hooks)
  - useQuery, useMutation, usePermissions
           |
           v (calls)
           |
LAYER 3: API (Platform)
  - entities, integrations, auth
           |
           v (persists to)
           |
LAYER 4: DATA (Entities)
  - Challenge, Pilot, Solution, etc.

## 24. Performance Optimization

- Use React.memo for expensive components
- Implement virtual scrolling for large lists (>100 items)
- Lazy load detail pages
- Debounce search inputs
- Cache AI responses where appropriate
- Use optimistic updates for mutations
- Prefetch related entities on detail pages

## 25. Error Handling Strategy

All API calls must handle:
- Network errors (show retry option)
- Permission denied (redirect to access denied page)
- Not found (show 404 with navigation)
- Validation errors (highlight fields)
- Server errors (show error boundary)

Use toast notifications for user feedback.
Log errors to SystemActivity for admin review.

---

## 26. Tab-Based Page Architecture

Most detail pages use Tabs for organization. Standard pattern:

### 26.1 Tab Structure Template

\`\`\`javascript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="overview" className="space-y-6">
  <TabsList>
    <TabsTrigger value="overview">
      <FileText className="h-4 w-4 mr-2" />
      {t({ en: 'Overview', ar: 'نظرة عامة' })}
    </TabsTrigger>
    <TabsTrigger value="data">
      <Database className="h-4 w-4 mr-2" />
      {t({ en: 'Data', ar: 'البيانات' })}
    </TabsTrigger>
    {/* More tabs */}
  </TabsList>

  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>

  <TabsContent value="data">
    {/* Data content */}
  </TabsContent>
</Tabs>
\`\`\`

### 26.2 Standard Tab Sets by Entity Type

**Challenge Detail Tabs:**
1. Overview (problem statement, current situation, desired outcome)
2. Data & Evidence (data_evidence array, attachments)
3. KPIs (linked KPIs via ChallengeKPILink)
4. Stakeholders (stakeholders array)
5. Solutions (matched solutions via ChallengeSolutionMatch)
6. Pilots (linked pilots)
7. R&D Projects (linked RDProjects)
8. Programs (linked programs)
9. Policy (linked PolicyRecommendations)
10. Innovation Framing (HMW questions, What-If scenarios)
11. AI Insights (AI-generated analysis)
12. Strategic Alignment (linked StrategicPlans)
13. Network (relations via ChallengeRelation)
14. Activity Log (ChallengeActivity)
15. Discussion (ChallengeComment)

**Pilot Detail Tabs:**
1. Overview (objective, hypothesis, methodology)
2. Workflow (UnifiedWorkflowApprovalTab)
3. KPIs (PilotKPI + PilotKPIDatapoint with charts)
4. Financial (budget, expenses, approvals)
5. Team (team array, stakeholders)
6. Timeline (milestones, Gantt view)
7. Risks (risks array with mitigation)
8. Compliance (regulatory compliance status)
9. Sandbox (if sandbox_id exists)
10. Data & Documents (PilotDocument)
11. Evaluation (ExpertEvaluation, gates)
12. AI Insights (AI predictions, recommendations)
13. Scaling (ScalingPlan if status='scale')
14. Media (gallery, videos)
15. Policy (linked policies)
16. Activity Log (activity stream)
17. Discussion (PilotComment)

**Solution Detail Tabs:**
1. Overview (description, features, value prop)
2. Technical Specs (technical_specifications)
3. Pricing (pricing model, details)
4. Deployments (deployments array)
5. Case Studies (case_studies array)
6. Reviews (ratings, reviews)
7. Certifications (certifications, compliance)
8. Challenges (matched challenges)
9. Pilots (where solution is used)
10. Media (gallery, demo, video)
11. Discussion (SolutionComment)

**RDProject Detail Tabs:**
1. Overview (abstract, methodology)
2. Team (PI, team_members, collaborators)
3. Timeline (milestones, Gantt)
4. Budget (funding, breakdown)
5. Outputs (publications, patents, datasets)
6. Pilot Transition (pilot opportunities)
7. Ethics & Compliance (IRB approval)
8. Collaboration (partnership agreements)
9. AI Insights (commercialization assessment)
10. Discussion (RDProjectComment)

**Program Detail Tabs:**
1. Overview (description, objectives)
2. Timeline (application/program dates)
3. Eligibility (criteria)
4. Benefits (benefits array)
5. Funding (if available)
6. Curriculum (week-by-week plan)
7. Mentors (mentors array)
8. Applications (ProgramApplication list)
9. Cohort (accepted participants)
10. Events (events array)
11. Outcomes (pilots generated, partnerships)
12. Media (gallery, videos)
13. Discussion (ProgramComment)

### 26.3 Tab Permissions

Conditionally render tabs based on permissions:

\`\`\`javascript
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    
    {hasPermission('financial_view_sensitive') && (
      <TabsTrigger value="financial">Financial</TabsTrigger>
    )}
    
    {hasAnyPermission(['pilot_approve', 'expert_evaluate']) && (
      <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
    )}
    
    {isAdmin && (
      <TabsTrigger value="admin">Admin</TabsTrigger>
    )}
  </TabsList>

  {/* Tab contents... */}
</Tabs>
\`\`\`

### 26.4 Tab State Management

Preserve tab state in URL for deep linking:

\`\`\`javascript
const [activeTab, setActiveTab] = useState(
  new URLSearchParams(window.location.search).get('tab') || 'overview'
);

const handleTabChange = (tab) => {
  setActiveTab(tab);
  // Update URL without reload
  const url = new URL(window.location);
  url.searchParams.set('tab', tab);
  window.history.pushState({}, '', url);
};

<Tabs value={activeTab} onValueChange={handleTabChange}>
  {/* Tabs... */}
</Tabs>
\`\`\`

### 26.5 Tab Loading States

Show skeleton loaders while data fetches:

\`\`\`javascript
<TabsContent value="kpis">
  {kpisLoading ? (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  ) : (
    <div>
      {/* KPI content */}
    </div>
  )}
</TabsContent>
\`\`\`

### 26.6 Tab Icons

Always include icons for visual clarity:

\`\`\`javascript
import { 
  FileText, Database, BarChart3, Users, Calendar,
  Shield, Sparkles, Network, MessageSquare, Activity
} from 'lucide-react';

<TabsTrigger value="overview">
  <FileText className="h-4 w-4 mr-2" />
  Overview
</TabsTrigger>
<TabsTrigger value="data">
  <Database className="h-4 w-4 mr-2" />
  Data
</TabsTrigger>
<TabsTrigger value="kpis">
  <BarChart3 className="h-4 w-4 mr-2" />
  KPIs
</TabsTrigger>
\`\`\`

### 26.7 Responsive Tabs

Make tabs scrollable on mobile:

\`\`\`javascript
<TabsList className="overflow-x-auto flex-nowrap">
  {/* Tabs... */}
</TabsList>
\`\`\`

---

## 27. Sensitive Data Handling

### 27.1 Sensitive Data Categories

**Financial Data:**
- Budget amounts (pilot, program, R&D)
- Actual spending (budget_spent)
- Vendor pricing
- Contract values
- Grant amounts

**Personal Information:**
- Citizen contact details (CitizenIdea)
- Expert personal profiles
- User phone numbers
- Home addresses

**Strategic Information:**
- Strategic plans (StrategicPlan)
- Confidential challenges (is_confidential)
- Executive decisions and notes
- Approval internal notes

**Evaluation Data:**
- Expert evaluation scores
- Reviewer comments (internal)
- Proposal rejection reasons
- Performance reviews

### 27.2 Masking Sensitive Fields

\`\`\`javascript
// Budget masking for non-financial users
{hasPermission('financial_view_sensitive') ? (
  <div>Budget: {formatCurrency(pilot.budget)} SAR</div>
) : (
  <div>Budget: Hidden (requires permission)</div>
)}

// Partial masking
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return \`\${name.slice(0, 2)}***@\${domain}\`;
};

{isAdmin ? (
  <div>Email: {user.email}</div>
) : (
  <div>Email: {maskEmail(user.email)}</div>
)}
\`\`\`

### 27.3 Audit Logging for Sensitive Access

Log whenever sensitive data is accessed:

\`\`\`javascript
const viewBudget = async () => {
  // Log the access
  await Platform.entities.AccessLog.create({
    user_email: currentUser.email,
    action: 'view_sensitive',
    entity_type: 'Pilot',
    entity_id: pilot.id,
    field: 'budget',
    timestamp: new Date().toISOString()
  });
  
  // Show data
  setShowBudget(true);
};
\`\`\`

### 27.4 Encrypted Storage

Backend automatically encrypts:
- Payment information
- Personal IDs
- Passwords/tokens

Frontend NEVER stores sensitive data in:
- localStorage
- sessionStorage
- Cookies (except auth token)

### 27.5 Data Export Restrictions

\`\`\`javascript
// Export with permission check
const handleExport = async () => {
  if (!hasPermission('data_export')) {
    toast.error(t({ 
      en: 'You do not have permission to export data', 
      ar: 'ليس لديك إذن لتصدير البيانات' 
    }));
    return;
  }
  
  // Scrub sensitive fields before export
  const sanitizedData = data.map(item => ({
    ...item,
    budget: hasPermission('financial_view_sensitive') ? item.budget : null,
    contact_email: hasPermission('view_pii') ? item.contact_email : null
  }));
  
  exportToCSV(sanitizedData);
};
\`\`\`

---

## 28. Security Best Practices

### 28.1 Input Validation

All user inputs MUST be validated:

\`\`\`javascript
// Frontend validation should check both AR and EN fields for completeness and length requirements.

const handleSubmit = async () => {
  const error = validateChallengeForm();
  if (error) {
    toast.error(error);
    return;
  }
  // Proceed with API call
};
\`\`\`

Backend also validates (never trust frontend alone).

### 28.2 XSS Prevention

Never use dangerouslySetInnerHTML unless absolutely necessary.
If needed, sanitize with DOMPurify:

\`\`\`javascript
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userContent) 
}} />
\`\`\`

Prefer ReactMarkdown for rich text:
\`\`\`javascript
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{userContent}</ReactMarkdown>
\`\`\`

### 28.3 CSRF Protection

All mutations use Platform client which handles CSRF automatically.

### 28.4 Rate Limiting

AI features and public forms have rate limits:
- Max 10 AI calls per minute per user
- Max 5 idea submissions per hour (public)
- Max 3 challenge creations per day (municipality)

Handle rate limit errors:
\`\`\`javascript
try {
  const response = await Platform.integrations.Core.InvokeLLM({...});
} catch (error) {
  if (error.status === 429) {
    toast.error(t({ 
      en: 'Too many requests. Please try again in a few minutes.', 
      ar: 'طلبات كثيرة جداً. حاول مرة أخرى بعد دقائق.' 
    }));
  }
}
\`\`\`

### 28.5 File Upload Security

Only specific file types allowed:
- Images: jpg, png, gif (max 10MB)
- Documents: pdf, docx, xlsx (max 50MB)
- Videos: mp4 (max 100MB)

Validate on upload:
\`\`\`javascript
const handleFileUpload = async (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    toast.error(t({ en: 'Invalid file type', ar: 'نوع ملف غير صالح' }));
    return;
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB
    toast.error(t({ en: 'File too large', ar: 'الملف كبير جداً' }));
    return;
  }
  
  // Upload
  const { file_url } = await Platform.integrations.Core.UploadFile({ file });
};
\`\`\`

### 28.6 SQL Injection Prevention

Backend uses parameterized queries. Frontend should never build raw queries.

### 28.7 Session Management

- Sessions expire after 24 hours of inactivity
- Logout on all tabs if user logs out in one tab
- Show "Session expired" message and redirect to login

### 28.8 Password Security

Password requirements (handled by Platform auth):
- Min 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Optional: 2FA for admin accounts

---

🔥 **THIS IS YOUR OPERATIONAL BIBLE**

Every feature development must reference this document.
Every code generation must comply with these standards.
Every update must consider systemic impact.

Build with discipline. Build with clarity. Build for scale.

---

## 29. Publishing & Visibility Patterns

**is_published Workflow (Consistent Pattern):**

Entities with public visibility: Challenge, Solution, Pilot, RDProject, Program, PolicyRecommendation

Required fields:
- is_published (boolean, default: false)
- is_confidential (boolean, default: false)
- publishing_approved_by (email)
- publishing_approved_date (timestamp)

**PublishingWorkflow Component:**
\`\`\`javascript
// Step 1: Review visibility settings
const [visibility, setVisibility] = useState({
  is_published: false,
  is_confidential: false,
  target_audience: []
});

// Step 2: AI recommendation
const aiRecommendation = await Platform.integrations.Core.InvokeLLM({
  prompt: "Should this {entity} be published publicly or kept confidential?",
  response_json_schema: {
    type: "object",
    properties: {
      recommendation: { type: "string", enum: ["publish", "confidential", "internal"] },
      reasoning_en: { type: "string" },
      reasoning_ar: { type: "string" }
    }
  }
});

// Step 3: Approval gate (if publishing sensitive content)
if (requiresApproval) {
  // Create ApprovalRequest
  await Platform.entities.ApprovalRequest.create({
    entity_type: 'Challenge',
    entity_id: challenge.id,
    gate_name: 'publishing_approval',
    requester_email: user.email,
    status: 'pending'
  });
}
\`\`\`

**Public vs Confidential Views:**
- Public: Filter WHERE is_published = true AND is_confidential = false
- Internal: Filter WHERE is_published = false OR is_confidential = true
- Redact sensitive fields (budget, contacts) in public views

---

## 30. SLA Tracking & Escalation Automation

**slaAutomation Function Pattern:**

\`\`\`javascript
// Auto-calculate SLA due dates by priority tier
const calculateSLADueDate = (entity) => {
  const sla_days = {
    tier_1: 7,   // Critical
    tier_2: 14,  // High
    tier_3: 21,  // Medium
    tier_4: 30   // Low
  };
  
  const daysToAdd = sla_days[entity.priority] || 21;
  const dueDate = new Date(entity.submission_date);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  
  return dueDate;
};

// Auto-escalate based on overdue status
const escalate = (entity) => {
  const today = new Date();
  const dueDate = new Date(entity.sla_due_date);
  const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  
  let escalation_level = 0;
  if (daysOverdue >= 14) escalation_level = 2; // CRITICAL
  else if (daysOverdue >= 7) escalation_level = 1; // WARNING
  
  if (escalation_level > entity.escalation_level) {
    // Update entity
    await Platform.entities.Challenge.update(entity.id, {
      escalation_level,
      escalation_date: today.toISOString()
    });
    
    // Notify leadership
    await Platform.integrations.Core.SendEmail({
      to: 'leadership@gdisb.gov.sa',
      subject: \`CRITICAL: Challenge \${entity.code} overdue by \${daysOverdue} days\`,
      body: \`Challenge: \${entity.title_en}\\nMunicipality: \${entity.municipality_id}\\nDays Overdue: \${daysOverdue}\\nEscalation: \${escalation_level === 2 ? 'CRITICAL' : 'WARNING'}\`
    });
  }
};
\`\`\`

**SLAMonitor Component:**
- Display sla_due_date with countdown
- Show escalation_level badges (WARNING/CRITICAL)
- Alert icons for overdue items
- Filter by escalation in ExecutiveStrategicChallengeQueue

---

## 31. Innovation Framing Standards

**Transform Problems into Opportunities:**

Every Challenge MUST have innovation_framing object:

\`\`\`javascript
innovation_framing: {
  hmw_questions: [
    { en: "How Might We reduce traffic without reducing mobility?", ar: "كيف يمكننا..." },
    { en: "How Might We make water more accessible in remote areas?", ar: "..." }
    // 5+ questions
  ],
  what_if_scenarios: [
    { en: "What if citizens could report issues via voice?", ar: "..." },
    { en: "What if we gamified recycling?", ar: "..." }
    // 5+ scenarios
  ],
  guiding_questions: {
    for_startups: [
      { en: "Can your tech solve this without infrastructure changes?", ar: "..." }
    ],
    for_researchers: [
      { en: "What's the scientific basis for this problem?", ar: "..." }
    ],
    technology_opportunities: [
      { en: "Could IoT sensors detect this problem early?", ar: "..." }
    ]
  }
}
\`\`\`

**InnovationFramingGenerator Component:**
- Input: Challenge problem_statement, current_situation, desired_outcome
- Output: 5+ HMW questions, 5+ What-If scenarios, guiding questions (all bilingual)
- Location: ChallengeCreate Step 3, ChallengeDetail Innovation tab
- AI prompt: "Transform this problem into innovation opportunities using HMW/What-If framework"

---

## 32. Strategic Alignment Validation

**StrategicAlignmentSelector Component:**

\`\`\`javascript
// Step 1: Load strategic plans
const strategicPlans = await Platform.entities.StrategicPlan.filter({
  municipality_id: challenge.municipality_id,
  status: 'active'
});

// Step 2: User selects objectives
const [selectedObjectives, setSelectedObjectives] = useState([]);

// Step 3: AI validates alignment
const alignmentValidation = await Platform.integrations.Core.InvokeLLM({
  prompt: "Validate alignment between challenge and strategic objectives",
  response_json_schema: {
    type: "object",
    properties: {
      alignment_score: { type: "number" }, // 0-100
      contribution_potential_en: { type: "string" },
      contribution_potential_ar: { type: "string" },
      gaps: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } }
    }
  }
});

// Step 4: Create links
await Promise.all(selectedObjectives.map(obj => 
  Platform.entities.StrategicPlanChallengeLink.create({
    strategic_plan_id: obj.plan_id,
    challenge_id: challenge.id,
    alignment_score: alignmentValidation.alignment_score,
    linkage_rationale: alignmentValidation.contribution_potential_en
  })
));
\`\`\`

---

## 33. Multi-Stage Evaluation Framework

**Stage-Specific Evaluation Criteria:**

Different stages need different evaluation criteria (not just universal 8 scores):

**Intake/Screening Stage:**
- completeness_check, data_quality_score, clarity_score, duplicate_check, urgency_level

**Eligibility Stage:**
- eligibility_check, alignment_with_call_score, formatting_compliance, credential_validity

**Readiness Stage:**
- infrastructure_readiness, organizational_readiness, resource_availability, safety_protocols

**Expert Review Stage:**
- 8 universal scores (feasibility, impact, innovation, cost, risk, alignment, quality, scalability)

**Decision Stage:**
- overall_ranking, recommended_track, award_decision, scaling_decision

**Monitoring Stage:**
- kpi_progress_rate, stakeholder_satisfaction, budget_variance, risk_level

**Implementation Pattern:**
\`\`\`javascript
// Expand ExpertEvaluation entity
{
  evaluation_stage: "intake" | "eligibility" | "readiness" | "review" | "decision" | "monitoring",
  stage_specific_criteria: {
    // JSON object with stage-appropriate fields
  },
  stage_order: 1 // sequence number
}

// Create EvaluationTemplate entity
{
  entity_type: "challenge",
  stage: "intake",
  criteria_definitions: [...],
  weights: {...}
}
\`\`\`

---

## 34. Testing Infrastructure Router

**Auto-Route Pilots to Sandbox/Lab:**

\`\`\`javascript
const determineTestingInfrastructure = async (pilot) => {
  const analysis = await Platform.integrations.Core.InvokeLLM({
    prompt: "Should this pilot use Sandbox (regulatory) or Living Lab (research)?",
    response_json_schema: {
      type: "object",
      properties: {
        recommendation: { type: "string", enum: ["sandbox", "livinglab", "both", "none"] },
        reasoning_en: { type: "string" },
        reasoning_ar: { type: "string" },
        risk_level: { type: "string" },
        regulatory_barriers: { type: "array" }
      }
    }
  });
  
  if (analysis.recommendation === "sandbox") {
    // Find available sandbox
    const sandboxes = await Platform.entities.Sandbox.filter({
      sector: pilot.sector,
      status: 'active',
      // capacity available
    });
    
    return { requires_sandbox: true, suggested_sandbox_id: sandboxes[0]?.id };
  }
  
  if (analysis.recommendation === "livinglab") {
    // Find appropriate lab
    const labs = await Platform.entities.LivingLab.filter({
      capabilities: { $in: [pilot.sector] },
      // availability check
    });
    
    return { requires_livinglab: true, suggested_lab_id: labs[0]?.id };
  }
};
\`\`\`

---

## 35. Knowledge Capture & Sharing

**Mandatory Lessons Learned:**

\`\`\`javascript
// ChallengeResolutionWorkflow
const [lessons, setLessons] = useState([]);
const canResolve = lessons.length >= 1 && lessons.every(l => 
  l.category && l.lesson && l.recommendation
);

// Validation enforcement
if (!canResolve) {
  return (
    <div className="border-2 border-red-300 bg-red-50 p-3 rounded">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <p className="text-red-900">At least 1 complete lesson required</p>
    </div>
  );
}

// On resolution
await Platform.entities.Challenge.update(challenge.id, {
  status: 'resolved',
  lessons_learned: lessons,
  resolution_date: new Date().toISOString()
});
\`\`\`

**CrossCitySolutionSharing Component:**
\`\`\`javascript
// When challenge resolved, suggest sharing
const suggestSharing = await Platform.integrations.Core.InvokeLLM({
  prompt: "Which other cities would benefit from this solution?",
  response_json_schema: {
    type: "object",
    properties: {
      recommended_cities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            city_id: { type: "string" },
            similarity_score: { type: "number" },
            reasoning_en: { type: "string" },
            reasoning_ar: { type: "string" }
          }
        }
      }
    }
  }
});

// Auto-email municipalities
for (const city of suggestSharing.recommended_cities) {
  await Platform.integrations.Core.SendEmail({
    to: city.contact_email,
    subject: "Solution available for similar challenge",
    body: \`Challenge: \${challenge.title_en}\\nSolution applied: \${solution.name_en}\\nResults: \${resolution.impact_achieved}\`
  });
}
\`\`\`

---

## 36. Performance & Analytics Standards

**Real-Time KPI Monitoring:**

\`\`\`javascript
// LiveKPIDashboard component
const { data: kpiData } = useQuery({
  queryKey: ['pilot-kpis', pilot.id],
  queryFn: async () => {
    const kpis = await Platform.entities.PilotKPI.filter({ pilot_id: pilot.id });
    return Promise.all(kpis.map(async kpi => {
      const datapoints = await Platform.entities.PilotKPIDatapoint.filter({
        pilot_kpi_id: kpi.id
      }, '-timestamp', 30); // last 30 datapoints
      
      return {
        ...kpi,
        datapoints,
        current_value: datapoints[0]?.value,
        trend: calculateTrend(datapoints),
        on_track: datapoints[0]?.value >= kpi.target * 0.7
      };
    }));
  },
  refetchInterval: 30000 // refresh every 30s
});
\`\`\`

**Performance Benchmarking:**

\`\`\`javascript
// PerformanceBenchmarking component
const benchmark = await Platform.integrations.Core.InvokeLLM({
  prompt: "Compare this pilot to similar pilots in peer municipalities",
  add_context_from_internet: true,
  response_json_schema: {
    type: "object",
    properties: {
      peer_comparison: {
        type: "object",
        properties: {
          better_than_peers: { type: "number" }, // percentage
          key_strengths: { type: "array" },
          improvement_areas: { type: "array" }
        }
      },
      international_benchmarks: { type: "array" },
      best_practices: { type: "array" }
    }
  }
});
\`\`\`

---

## 37. Financial Tracking Standards

**Budget Approval Workflow:**

\`\`\`javascript
// BudgetApprovalWorkflow component
const phases = {
  design: { percentage: 20, requires_approval: budget > 100000 },
  implementation: { percentage: 60, requires_approval: budget > 100000 },
  evaluation: { percentage: 20, requires_approval: false }
};

// Approval logic
if (phase.requires_approval) {
  const approval = await Platform.entities.ApprovalRequest.create({
    entity_type: 'Pilot',
    entity_id: pilot.id,
    gate_name: 'budget_approval',
    amount: phaseAmount,
    status: 'pending'
  });
}

// Track spending
await Platform.entities.PilotExpense.create({
  pilot_id: pilot.id,
  amount,
  category: 'equipment',
  receipt_url,
  status: 'submitted'
});

// Auto-alert on budget variance
if (pilot.budget_spent > pilot.budget * 1.15) {
  // 15% overrun
  await sendBudgetAlert(pilot);
}
\`\`\`

---

## 38. Cross-Entity Intelligence

**Relationship Intelligence:**

All entities can be linked via ChallengeRelation entity:
\`\`\`javascript
{
  challenge_id: "CH-123",
  related_entity_type: "pilot" | "solution" | "rd_project" | "program" | "challenge",
  related_entity_id: "PLT-456",
  relation_role: "solved_by" | "informed_by" | "derived_from" | "similar_to",
  strength: 0.85, // AI-calculated
  bidirectional: true
}
\`\`\`

**Knowledge Graph Integration:**
- All major entities have embedding vectors
- Semantic similarity search finds related entities
- AI explains relationship reasoning
- Visual network graph in Dependencies tab

---

## 39. Notification Automation Standards

**autoNotificationTriggers Function:**

Trigger notifications on:
1. Entity status changes (challenge submitted → reviewer notified)
2. Assignment events (expert assigned → expert notified)
3. Approval decisions (approved/rejected → requester notified)
4. SLA warnings (approaching deadline → owner notified)
5. Conversion events (idea→challenge → citizen notified)
6. Closure events (challenge resolved → citizen thanked)

\`\`\`javascript
// Backend function
const notificationRules = {
  'challenge_submitted': {
    recipients: ['reviewers with sector expertise'],
    template: 'challenge_review_needed'
  },
  'challenge_approved': {
    recipients: ['challenge_owner', 'created_by'],
    template: 'challenge_approved'
  },
  'challenge_resolved': {
    recipients: ['challenge_owner', 'citizen if idea-originated'],
    template: 'challenge_closure'
  }
};
\`\`\`

---

## 40. Complete User Journey Validation

**9 Core Personas (from Coverage Reports):**

1. **Citizen** → Idea submission → tracking → feedback → recognition (100%)
2. **Municipality User** → Challenge creation → pilot execution → results (100%)
3. **Challenge Owner** → Receive assignment → treatment planning → resolution (100%)
4. **Admin/Reviewer** → Review queue → evaluation → approval (100%)
5. **Domain Expert** → Assignment → evaluation → consensus (100%)
6. **Solution Provider** → Opportunity discovery → proposal → pilot participation (70%)
7. **Researcher** → R&D call → proposal → project → outputs (85%)
8. **Program Operator** → Program design → application review → cohort management (100%)
9. **Executive** → Strategic oversight → decision-making → impact monitoring (96%)

**Journey Validation Checklist:**
- Entry point exists and is discoverable
- Workflow stages all implemented
- Notifications at each stage
- AI assistance available where needed
- Data persisted correctly
- Permissions enforced
- Feedback loop closes (user receives outcome)
- Gamification/recognition (where applicable)

---

## 41. Component Reuse Standards

**Always check for existing components before creating new ones:**

**Evaluation Components:**
- UnifiedEvaluationForm (multi-entity evaluation)
- EvaluationConsensusPanel (consensus display)
- QuickEvaluationCard (evaluation summary)
- EvaluationHistory (timeline)

**Workflow Components:**
- UnifiedWorkflowApprovalTab (gate system)
- InlineApprovalWizard (quick approval)
- RequesterAI (self-check assistant)
- ReviewerAI (review assistant)

**File Components:**
- FileUploader (with image search)
- PDFExport (bilingual reports)
- ExportData (CSV/JSON export)

**AI Components:**
- AIFormAssistant (form completion)
- SemanticSearchPanel (embedding search)
- AIMessageComposer (message drafting)

**Activity Components:**
- ActivityFeed (cross-entity stream)
- CommentThread (discussions)
- NotificationCenter (alerts)

**Permission Components:**
- ProtectedPage (page-level)
- ProtectedAction (action-level)
- usePermissions (permission hook)

---

## 42. Data Migration & Bulk Operations

**BulkDataOperations Pattern:**
- Select entities via filters
- Preview changes before applying
- Validate all changes
- Execute in transaction
- Log all operations
- Rollback on error

\`\`\`javascript
const handleBulkUpdate = async (selectedIds, updates) => {
  // Preview
  const preview = selectedIds.map(id => ({
    id,
    current: entities.find(e => e.id === id),
    new: { ...entities.find(e => e.id === id), ...updates }
  }));
  
  // Confirm
  if (!await confirmBulkOperation(preview)) return;
  
  // Execute
  try {
    const results = await Promise.all(
      selectedIds.map(id => Platform.entities.Challenge.update(id, updates))
    );
    
    // Log
    await Platform.entities.SystemActivity.create({
      activity_type: 'bulk_update',
      entity_type: 'Challenge',
      entity_ids: selectedIds,
      updates,
      performed_by: user.email
    });
    
    toast.success(\`Updated \${results.length} challenges\`);
  } catch (error) {
    toast.error('Bulk operation failed - rolled back');
  }
};
\`\`\`

---

## 43. Embedding & Vector Search Standards

**Generate Embeddings on Entity Creation:**

\`\`\`javascript
// Auto-trigger after entity creation
const generateEmbeddings = async (entity_type, entity_id) => {
  const response = await Platform.functions.invoke('generateEmbeddings', {
    entity_type,
    entity_id
  });
  
  if (response.data.success) {
    // Embedding stored in entity.embedding field (768 dimensions)
    console.log('Embedding generated');
  }
};

// Semantic search using embeddings
const semanticSearch = async (query, entity_type) => {
  const results = await Platform.functions.invoke('semanticSearch', {
    query, // natural language
    entity_type,
    top_k: 10
  });
  
  return results.data.matches.map(m => ({
    entity: m.entity,
    similarity_score: m.similarity, // 0-100
    reasoning: m.reasoning // AI explains why it matched
  }));
};
\`\`\`

---

🔥 **THIS IS YOUR OPERATIONAL BIBLE - UPDATED WITH 20+ COVERAGE REPORTS**

Build with discipline. Build with clarity. Build for scale.`;

  const sections = [
    {
      id: 'responsibility',
      title: { en: '1. Primary Responsibility', ar: '1. المسؤولية الأساسية' },
      icon: Target,
      color: 'blue',
      content: `When developing or updating any part of the platform, the AI must:

1. Understand the feature context and its relationship to:
   • Entity Models (Pilot, Challenge, Solution, Municipality, etc.)
   • Approval & Workflow Engines
   • KPI / Financial / Compliance / Evaluation Systems
   • Conversion Hubs, Scaling Hub, Procurement Hub, RD Hub, Policy Hub

2. Generate production-ready code:
   • Fully typed, optimized, and scalable
   • Written with modularity and maintainability as default
   • Matching architectural standards`
    },
    {
      id: 'pageInventory',
      title: { en: '1A. Complete Page Inventory', ar: '1أ. قائمة الصفحات الكاملة' },
      icon: Database,
      color: 'teal',
      content: `MASTER PAGES (Portal Entry Points):
• ExecutiveDashboard (requireAdmin)
• AdminPortal (requireAdmin)
• MunicipalityDashboard (challenge_view_own)
• StartupDashboard (solution_view_own)
• AcademiaDashboard (rd_view_own)
• ProgramOperatorPortal (program_manage)
• PublicPortal (public)

SUPPORT PAGES - Home & Personal:
• Home (authenticated)
• PersonalizedDashboard (authenticated)
• MyWorkloadDashboard (authenticated)
• UserProfile (authenticated)
• Settings (authenticated)
• NotificationCenter (authenticated)
• TaskManagement (authenticated)

SUPPORT PAGES - Approvals & Workflow:
• ApprovalCenter (multi-permission)
• MyApprovals (authenticated)
• ChallengeReviewQueue (challenge_approve)
• EvaluationPanel (expert_evaluate)
• ApplicationReviewHub (program_manage)

SUPPORT PAGES - Analytics:
• PipelineHealthDashboard (multi-permission)
• FlowVisualizer (multi-permission)
• SectorDashboard (challenge_view_all)
• MII (public/authenticated)
• Trends (public/authenticated)

ALL ENTITY CRUD PAGES listed in Section 1A above.`
    },
    {
      id: 'architecture',
      title: { en: '2. File & Directory Standards', ar: '2. معايير الملفات والمجلدات' },
      icon: Layers,
      color: 'purple',
      content: `| Layer                         | Code Location                    |
|-------------------------------|----------------------------------|
| UI pages & screens            | /pages/*, /components/pageBlocks/|
| Reusable UI components        | /components/ui/*                 |
| Platform workflows            | /components/workflows/*          |
| Approval engines              | /components/approval/*           |
| Policy features               | /components/policy/*             |
| Pilot operations              | /components/pilots/*             |
| Data access & API             | /api/PlatformClient.ts             |
| Hooks & shared logic          | /hooks/*                         |
| Analytics & Insights          | /ai/*                            |
| Reports & coverage            | /reporting/*                     |
| Menu & navigation             | /layout, /navigation/menu.ts     |`
    },
    {
      id: 'rules',
      title: { en: '3. Development Rules', ar: '3. قواعد التطوير' },
      icon: CheckCircle2,
      color: 'green',
      content: `✔ Follow component design system
✔ Use Card, Badge, Tabs, Button via imports only
✔ All UI elements must support English + Arabic
✔ All text wrapped using t({en:'', ar:''})

Component Development Rules:
1. Ensure imports are complete
2. All props typed with interfaces
3. Components self-contained
4. Backend logic in useQuery/useMutation
5. Loading states handled
6. Error states handled
7. RBAC protection applied`
    },
    {
      id: 'workflows',
      title: { en: '4. Workflow & Approval Systems', ar: '4. أنظمة سير العمل والموافقات' },
      icon: Workflow,
      color: 'amber',
      content: `Workflow Modules:
• PilotSubmissionWizard
• PilotPreparationChecklist
• PilotEvaluationGate
• PilotPivotWorkflow
• PilotTerminationWorkflow
• BudgetApprovalWorkflow
• MilestoneApprovalGate

When modifying workflows:
1. Update the workflow UI component
2. Update UnifiedWorkflowApprovalTab
3. Update ApprovalCenter integration
4. Update coverage reports
5. Test approval flow end-to-end`
    },
    {
      id: 'coverage',
      title: { en: '5. Coverage Reporting', ar: '5. تقارير التغطية' },
      icon: BarChart3,
      color: 'teal',
      content: `Every system modification must update:

📊 ConversionsCoverageReport
   → Tracks conversion flows & readiness

📊 DetailPagesCoverageReport
   → Detail pages implementation status

📊 EditPagesCoverageReport
   → Edit pages implementation status

📊 CreateWizardsCoverageReport
   → Wizard coverage & AI assistance

📊 WorkflowApprovalSystemCoverage
   → Workflow gates & approval tracking

Updates to workflows or entity fields MUST trigger report regeneration.`
    },
    {
      id: 'protocol',
      title: { en: '6. Update Protocol', ar: '6. بروتوكول التحديث' },
      icon: GitBranch,
      color: 'indigo',
      content: `Step-by-step execution:

1️⃣ Map feature scope
   - Identify affected components
   - Determine impacted workflows
   - List files requiring updates

2️⃣ Apply component changes
   - Develop UI
   - Link to backend API
   - Apply translation patterns

3️⃣ Update Workflows & Logic

4️⃣ Regenerate Hub/Report files

5️⃣ Update menu navigation

6️⃣ Return structured output:
   • Files Modified
   • Files Created
   • Feature Summary
   • Report Updates
   • Next Steps`
    },
    {
      id: 'forbidden',
      title: { en: '7. Never Do This', ar: '7. لا تفعل هذا أبداً' },
      icon: AlertTriangle,
      color: 'red',
      content: `The Agent MUST NEVER:

❌ Leave imports incomplete
❌ Skip bilingual localisation
❌ Modify without updating reports
❌ Return diff-only code snippets
❌ Ignore systemic impact
❌ Break existing workflows
❌ Skip RBAC protection
❌ Hard-code text in components
❌ Create pages without menu links
❌ Add features without permissions
❌ Deploy without testing mentally`
    },
    {
      id: 'entities',
      title: { en: '8. Entity Relationships', ar: '8. علاقات الكيانات' },
      icon: Network,
      color: 'pink',
      content: `Key entity relationships:

Challenge → Solution (via ChallengeSolutionMatch)
Challenge → Pilot (via challenge_id)
Challenge → RDCall (via challenge_ids[])
Challenge → PolicyRec (via challenge_id)
Pilot → ScalingPlan (via pilot_id)
Pilot → Contract (procurement)
RDProject → Pilot (transition)
Program → Application → Pilot (conversion)
Organization → Solution (provider)
Municipality → Challenge (ownership)
Expert → Assignment → Evaluation

Always maintain referential integrity.
Use ChallengeRelation for flexible linking.`
    },
    {
      id: 'permissions',
      title: { en: '9. Permission System', ar: '9. نظام الصلاحيات' },
      icon: Shield,
      color: 'blue',
      content: `All pages use ProtectedPage HOC:

export default ProtectedPage(MyPage, {
  requiredPermissions: ['entity_view_all']
});

Permission patterns:
• Public: { requiredPermissions: [] }
• View: { requiredPermissions: ['entity_view_all'] }
• Create: { requiredPermissions: ['entity_create'] }
• Edit: { requiredPermissions: ['entity_edit'] }
• Admin: { requireAdmin: true }
• Multi: { requiredPermissions: ['perm1', 'perm2'] }

When adding features:
1. Determine access requirements
2. Define permission keys
3. Update RolePermissionManager
4. Test with different user roles`
    },
    {
      id: 'bilingual',
      title: { en: '10. Bilingual & RTL/LTR', ar: '10. ثنائي اللغة واتجاه النص' },
      icon: BookOpen,
      color: 'green',
      content: `BILINGUAL CONTENT RULES:

Entity Fields:
✓ title_ar + title_en
✓ description_ar + description_en
✓ All content fields in both languages

UI Text:
✓ Use t({en:'Text', ar:'النص'}) everywhere
✓ Buttons, labels, placeholders all bilingual
✓ Error/success messages bilingual
✓ Validation messages bilingual

RTL/LTR LAYOUT:

Container Direction:
<div dir={isRTL ? 'rtl' : 'ltr'}>

Text Alignment:
className={\`\${isRTL ? 'text-right' : 'text-left'}\`}

Icon Positioning:
<Search className={\`absolute \${isRTL ? 'right-3' : 'left-3'}\`} />

Input Padding:
className={\`\${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}\`}

Margins:
className={\`\${isRTL ? 'ml-4' : 'mr-4'}\`}

Arrow/Chevron Flip:
<ChevronRight className={isRTL ? 'rotate-180' : ''} />

Number/Date Formatting:
new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(num)

Forms - Dual Input:
<Input dir="rtl" placeholder="العنوان" />
<Input dir="ltr" placeholder="Title" />

Display Content:
Show entity fields based on current language selection.

Emails - Bilingual:
Arabic section (RTL) + HR + English section (LTR)`
    },
    {
      id: 'ai',
      title: { en: '11. AI Integration Map', ar: '11. خريطة تكامل الذكاء' },
      icon: Sparkles,
      color: 'purple',
      content: `AI Features by Page/Section:

CHALLENGE PAGES:
• ChallengeCreate → AI Enhance (input: raw text → output: refined bilingual)
• ChallengeDetail → AI Insights (input: challenge data → output: strategic analysis)
• ChallengeDetail → Solutions Tab → Auto-match (input: embeddings → output: ranked solutions)
• Challenge List → Semantic Search (input: NL query → output: filtered list)

PILOT PAGES:
• PilotCreate → AI Pilot Designer (input: challenge+solution → output: hypothesis, KPIs, timeline)
• PilotDetail → KPI Tab → AI Analysis (input: KPI data → output: trends, predictions)
• PilotDetail → Evaluation → AI Pre-Eval (input: progress → output: success probability)
• PilotMonitoring → AI Risk Alerts (input: all pilots → output: flagged risks)

SOLUTION PAGES:
• SolutionCreate → AI Enhancer (input: description → output: enhanced profile, tags)
• SolutionDetail → AI Matching (input: solution → output: relevant challenges)
• Solutions List → Matchmaker AI (input: challenge → output: ranked solutions)

R&D PAGES:
• RDCallCreate → AI Drafter (input: challenges → output: research questions, criteria)
• RDProjectDetail → Commercialization AI (input: outputs → output: potential score)

PROGRAM PAGES:
• ProgramCreate → Curriculum AI (input: objectives → output: weekly curriculum)
• ApplicationReviewHub → AI Screening (input: application → output: eligibility, recommendation)

EXPERT PAGES:
• ExpertMatchingEngine → Auto-match (input: challenge → output: top 5 experts)
• EvaluationPanel → AI Assistant (input: entity → output: suggested scores)

POLICY PAGES:
• PolicyCreate → AI Drafter (input: challenge/pilot → output: policy draft AR+EN)
• PolicyDetail → Conflict Detector (input: policy text → output: conflicts)

CITIZEN PAGES:
• IdeaEvaluation → AI Classifier (input: idea → output: type, sentiment, action)
• IdeasManagement → Duplicate Detector (input: ideas set → output: grouped duplicates)

STRATEGY PAGES:
• StrategyCockpit → What-If AI (input: scenario → output: forecasts)
• Portfolio → Optimizer AI (input: distribution → output: recommendations)

GLOBAL:
• AIAssistant (FAB) → Context-aware (input: page+query → output: help)
• All forms → AIFormAssistant (input: partial data → output: suggestions)

AI INPUT/OUTPUT STANDARDS:
✓ Always return bilingual (ar + en)
✓ Use JSON schemas for structured output
✓ Include confidence_score (0-100)
✓ Provide reasoning/explanation
✓ Handle errors gracefully
✓ Show loading states
✓ Cache responses (1 hour TTL)
✓ Log all AI calls to SystemActivity`
    },
    {
      id: 'gates',
      title: { en: '12. Workflow Gates', ar: '12. بوابات سير العمل' },
      icon: Zap,
      color: 'orange',
      content: `All gates follow this pattern:

1. Self-check (requester)
2. Reviewer checklist
3. AI assistance panel
4. Decision UI (approve/reject/conditional)
5. Notification triggers
6. Status update in entity
7. Activity log entry

Example gates:
• ChallengeSubmissionWizard
• PilotEvaluationGate
• BudgetApprovalGate
• PolicyLegalReviewGate
• SandboxApplicationGate
• MilestoneApprovalGate
• ComplianceGateChecklist

Gates integrate with ApprovalCenter.`
    },
    {
      id: 'tabs',
      title: { en: '26. Tab Architecture', ar: '26. بنية التبويبات' },
      icon: Layers,
      color: 'indigo',
      content: `STANDARD TAB SETS:

Challenge Detail (15 tabs):
Overview, Data & Evidence, KPIs, Stakeholders, Solutions, 
Pilots, R&D, Programs, Policy, Innovation Framing, 
AI Insights, Strategic Alignment, Network, Activity, Discussion

Pilot Detail (17 tabs):
Overview, Workflow, KPIs, Financial, Team, Timeline, 
Risks, Compliance, Sandbox, Data & Docs, Evaluation, 
AI Insights, Scaling, Media, Policy, Activity, Discussion

Solution Detail (11 tabs):
Overview, Technical Specs, Pricing, Deployments, 
Case Studies, Reviews, Certifications, Challenges, 
Pilots, Media, Discussion

R&D Detail (10 tabs):
Overview, Team, Timeline, Budget, Outputs, 
Pilot Transition, Ethics, Collaboration, AI Insights, Discussion

Program Detail (13 tabs):
Overview, Timeline, Eligibility, Benefits, Funding, 
Curriculum, Mentors, Applications, Cohort, Events, 
Outcomes, Media, Discussion

TAB PATTERNS:
✓ Icons on all triggers
✓ Conditional rendering by permission
✓ URL state preservation (?tab=kpis)
✓ Loading skeletons per tab
✓ Responsive (scrollable on mobile)
✓ Bilingual tab labels`
    },
    {
      id: 'security',
      title: { en: '28. Security & Sensitive Data', ar: '28. الأمان والبيانات الحساسة' },
      icon: Shield,
      color: 'red',
      content: `SENSITIVE DATA CATEGORIES:

Financial:
• Budget amounts → financial_view_sensitive
• Actual spending → financial_view_sensitive
• Contract values → financial_view_sensitive

Personal:
• Citizen contact details → admin only
• Expert profiles → expert_view_all
• User phone/address → admin or own record

Strategic:
• Strategic plans → admin or municipality lead
• Confidential challenges → challenge_view_confidential
• Executive notes → requireAdmin

Evaluation:
• Expert scores → expert or admin
• Reviewer comments → approver or admin
• Rejection reasons → admin

SECURITY PATTERNS:

Permission Check:
{hasPermission('financial_view_sensitive') && <Budget />}

Field Masking:
{isAdmin ? email : maskEmail(email)}

Audit Logging:
await Platform.entities.AccessLog.create({
  action: 'view_sensitive',
  field: 'budget'
});

Input Validation:
- Frontend: validate before submit
- Backend: validate again (never trust frontend)

File Upload:
- Max 50MB
- Allowed types only
- Virus scan (backend)

Rate Limiting:
- 10 AI calls/min
- 5 submissions/hour (public)

Session:
- 24h timeout
- Auto-logout across tabs`
    },
    {
      id: 'rbacLevels',
      title: { en: '9A. RBAC Multi-Level', ar: '9أ. RBAC متعدد المستويات' },
      icon: Shield,
      color: 'purple',
      content: `RBAC ENFORCEMENT LEVELS:

LEVEL 1 - Page Access:
export default ProtectedPage(MyPage, { requireAdmin: true });

LEVEL 2 - Section/Component:
{hasPermission('challenge_view_all') && <ChallengeSection />}

LEVEL 3 - Action/Button:
<ProtectedAction requiredPermissions={['challenge_create']}>
  <Button>Create</Button>
</ProtectedAction>

LEVEL 4 - Link/Navigation:
{hasPermission('pilot_view_all') && (
  <Link to={createPageUrl('Pilots')}>Pilots</Link>
)}

LEVEL 5 - Field/Data:
{hasPermission('financial_view_sensitive') && (
  <Input value={budget} />
)}

LEVEL 6 - Row-Level (Data Query):
const data = await Platform.entities.Challenge.filter({
  municipality_id: user.municipality_id  // RLS filter
});

LEVEL 7 - Tab Visibility:
{hasAnyPermission(['pilot_approve', 'expert_evaluate']) && (
  <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
)}

PERMISSION CHECKING:
const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();

// Check single
if (hasPermission('challenge_create')) { ... }

// Check multiple (ANY)
if (hasAnyPermission(['challenge_approve', 'pilot_approve'])) { ... }

// Check admin
if (isAdmin) { ... }

DYNAMIC MENU:
Filter menu items by permission in layout.js navigation sections`
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-white/40 mb-3">
            <Brain className="h-3 w-3 mr-1" />
            {t({ en: 'AI Development Agent', ar: 'وكيل تطوير الذكاء الاصطناعي' })}
          </Badge>
          <h1 className="text-5xl font-bold mb-4">
            {t({ en: 'Master Development Prompt', ar: 'موجه التطوير الرئيسي' })}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            {t({ 
              en: 'Complete instruction blueprint for AI-assisted platform development. Load this reference before any code generation or modification.',
              ar: 'مخطط تعليمات كامل لتطوير المنصة بمساعدة الذكاء الاصطناعي. قم بتحميل هذا المرجع قبل أي توليد أو تعديل للكود.'
            })}
          </p>
          <div className="flex items-center gap-3 mt-6">
            <Button 
              className="bg-white text-purple-600 hover:bg-white/90"
              onClick={() => copyToClipboard(fullPrompt, 'full')}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copiedSection === 'full' ? t({ en: 'Copied!', ar: 'تم النسخ!' }) : t({ en: 'Copy Full Prompt', ar: 'نسخ الموجه الكامل' })}
            </Button>
            <Badge variant="outline" className="bg-white/20 text-white border-white/40">
              {t({ en: '25 Development Principles', ar: '25 مبدأ تطوير' })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">28</p>
            <p className="text-xs text-slate-600">{t({ en: 'Principles', ar: 'مبادئ' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200">
          <CardContent className="pt-6 text-center">
            <FileCode className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-teal-600">150+</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pages', ar: 'صفحات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">30+</p>
            <p className="text-xs text-slate-600">{t({ en: 'AI Features', ar: 'ميزات ذكية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <Workflow className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">25+</p>
            <p className="text-xs text-slate-600">{t({ en: 'Workflows', ar: 'سير العمل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="pt-6 text-center">
            <Database className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">50+</p>
            <p className="text-xs text-slate-600">{t({ en: 'Entities', ar: 'كيانات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">7</p>
            <p className="text-xs text-slate-600">{t({ en: 'RBAC Levels', ar: 'مستويات RBAC' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">
            <BookOpen className="h-4 w-4 mr-2" />
            {t({ en: 'Sections', ar: 'الأقسام' })}
          </TabsTrigger>
          <TabsTrigger value="quickref">
            <Eye className="h-4 w-4 mr-2" />
            {t({ en: 'Quick Reference', ar: 'مرجع سريع' })}
          </TabsTrigger>
          <TabsTrigger value="fulltext">
            <FileText className="h-4 w-4 mr-2" />
            {t({ en: 'Full Text', ar: 'النص الكامل' })}
          </TabsTrigger>
        </TabsList>

        {/* Sections View */}
        <TabsContent value="sections" className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className={`border-2 border-${section.color}-200 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 bg-${section.color}-100 rounded-lg`}>
                        <Icon className={`h-5 w-5 text-${section.color}-600`} />
                      </div>
                      <span>{section.title[language]}</span>
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(section.content, section.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedSection === section.id ? '✓' : t({ en: 'Copy', ar: 'نسخ' })}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                    {section.content}
                  </pre>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Quick Reference */}
        <TabsContent value="quickref" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Key Conversion Paths', ar: 'مسارات التحويل الرئيسية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'CitizenIdea → Challenge',
                  'Challenge → RDCall',
                  'Challenge → Pilot',
                  'Challenge → Policy',
                  'Pilot → RDProject',
                  'Pilot → Policy',
                  'Pilot → Contract',
                  'Pilot → ScalingPlan',
                  'RDProject → Pilot',
                  'InnovationProposal → Pilot/Challenge'
                ].map((path, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
                    <Badge variant="outline" className="font-mono text-xs">{i + 1}</Badge>
                    <span className="text-slate-900">{path}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Permission Patterns', ar: 'أنماط الصلاحيات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Public Pages</p>
                  <code className="text-xs text-green-700">{'{ requiredPermissions: [] }'}</code>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">View Pages</p>
                  <code className="text-xs text-blue-700">{"{ requiredPermissions: ['entity_view_all'] }"}</code>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Create Pages</p>
                  <code className="text-xs text-purple-700">{"{ requiredPermissions: ['entity_create'] }"}</code>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Admin Only</p>
                  <code className="text-xs text-red-700">{'{ requireAdmin: true }'}</code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-green-600" />
                  {t({ en: 'Workflow Components', ar: 'مكونات سير العمل' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'PilotSubmissionWizard',
                  'PilotPreparationChecklist',
                  'PilotEvaluationGate',
                  'BudgetApprovalWorkflow',
                  'PolicyLegalReviewGate',
                  'SandboxApplicationGate'
                ].map((comp, i) => (
                  <div key={i} className="text-sm p-2 bg-green-50 rounded border border-green-200">
                    <code className="text-green-800">{comp}</code>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Coverage Reports', ar: 'تقارير التغطية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'ConversionsCoverageReport',
                  'DetailPagesCoverageReport',
                  'EditPagesCoverageReport',
                  'CreateWizardsCoverageReport',
                  'WorkflowApprovalSystemCoverage',
                  'MenuRBACCoverageReport'
                ].map((report, i) => (
                  <div key={i} className="text-sm p-2 bg-amber-50 rounded border border-amber-200">
                    <code className="text-amber-800">{report}</code>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {t({ en: 'AI Feature Locations', ar: 'مواقع ميزات الذكاء' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'Challenge → AI Enhance',
                  'Challenge → AI Insights',
                  'Challenge → Auto-Match Solutions',
                  'Pilot → AI Designer',
                  'Pilot → KPI Analysis',
                  'Pilot → Risk Alerts',
                  'Solution → AI Enhancer',
                  'R&D → AI Drafter',
                  'Program → Curriculum AI',
                  'Expert → Auto-Matching',
                  'Policy → AI Drafter',
                  'Ideas → AI Classifier',
                  'Strategy → What-If AI',
                  'Global → AI Assistant'
                ].map((ai, i) => (
                  <div key={i} className="text-xs p-2 bg-purple-50 rounded border border-purple-200 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    <span className="text-purple-800">{ai}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  {t({ en: 'RBAC Enforcement Levels', ar: 'مستويات تطبيق RBAC' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'Level 1: Page Access (ProtectedPage)',
                  'Level 2: Section/Component (conditional)',
                  'Level 3: Action/Button (ProtectedAction)',
                  'Level 4: Link/Navigation (conditional)',
                  'Level 5: Field/Data (permission check)',
                  'Level 6: Row-Level (query filter)',
                  'Level 7: Tab Visibility (conditional)'
                ].map((level, i) => (
                  <div key={i} className="text-xs p-2 bg-red-50 rounded border border-red-200">
                    <span className="text-red-900 font-mono">{level}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Full Text */}
        <TabsContent value="fulltext">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Complete Master Prompt', ar: 'الموجه الرئيسي الكامل' })}
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(fullPrompt, 'full')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedSection === 'full' ? '✓ Copied' : t({ en: 'Copy All', ar: 'نسخ الكل' })}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-green-400 p-6 rounded-lg overflow-x-auto">
                <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap">
                  {fullPrompt}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Architecture Diagram */}
      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-teal-600" />
            {t({ en: 'System Architecture Layers', ar: 'طبقات بنية النظام' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</div>
                <p className="font-semibold text-blue-900">{t({ en: 'PRESENTATION LAYER', ar: 'طبقة العرض' })}</p>
              </div>
              <p className="text-sm text-slate-700">Pages, Components, Workflows, UI</p>
            </div>
            
            <div className="flex justify-center">
              <div className="text-2xl text-slate-400">↓ uses</div>
            </div>

            <div className="p-4 bg-white border-2 border-purple-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</div>
                <p className="font-semibold text-purple-900">{t({ en: 'APPLICATION LAYER', ar: 'طبقة التطبيق' })}</p>
              </div>
              <p className="text-sm text-slate-700">useQuery, useMutation, usePermissions</p>
            </div>

            <div className="flex justify-center">
              <div className="text-2xl text-slate-400">↓ calls</div>
            </div>

            <div className="p-4 bg-white border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</div>
                <p className="font-semibold text-green-900">{t({ en: 'API LAYER', ar: 'طبقة API' })}</p>
              </div>
              <p className="text-sm text-slate-700">entities, integrations, auth (Platform)</p>
            </div>

            <div className="flex justify-center">
              <div className="text-2xl text-slate-400">↓ persists to</div>
            </div>

            <div className="p-4 bg-white border-2 border-teal-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">4</div>
                <p className="font-semibold text-teal-900">{t({ en: 'DATA LAYER', ar: 'طبقة البيانات' })}</p>
              </div>
              <p className="text-sm text-slate-700">Challenge, Pilot, Solution, Municipality, etc.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Rules */}
      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            {t({ en: '🚨 Critical Rules - NEVER VIOLATE', ar: '🚨 قواعد حرجة - لا تخالفها أبداً' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { text: 'Leave imports incomplete', icon: '❌' },
              { text: 'Skip bilingual localisation', icon: '❌' },
              { text: 'Modify without updating reports', icon: '❌' },
              { text: 'Return diff-only code', icon: '❌' },
              { text: 'Ignore systemic impact', icon: '❌' },
              { text: 'Break existing workflows', icon: '❌' },
              { text: 'Skip RBAC protection', icon: '❌' },
              { text: 'Hard-code text in UI', icon: '❌' },
              { text: 'Create pages without menu links', icon: '❌' },
              { text: 'Add features without permissions', icon: '❌' },
              { text: 'Deploy without mental testing', icon: '❌' }
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
                <span className="text-2xl">{rule.icon}</span>
                <span className="text-sm text-red-900 font-medium">{rule.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-5 w-5" />
            {t({ en: '✅ Best Practices - ALWAYS FOLLOW', ar: '✅ أفضل الممارسات - اتبع دائماً' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Use ProtectedPage for all pages',
              'Wrap all text in t() function',
              'Update coverage reports after changes',
              'Generate full usable code blocks',
              'Document systemic impact',
              'Maintain workflow integrity',
              'Follow bilingual content strategy',
              'Use Platform client for API calls',
              'Handle loading states',
              'Handle error states',
              'Test permission scenarios',
              'Link pages in menu navigation'
            ].map((practice, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-900">{practice}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t({ en: 'How to Use This Reference', ar: 'كيفية استخدام هذا المرجع' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-semibold mb-1">{t({ en: 'Before ANY Development', ar: 'قبل أي تطوير' })}</p>
                <p className="text-sm text-white/90">{t({ en: 'Load this prompt into your AI context', ar: 'قم بتحميل هذا الموجه في سياق الذكاء الاصطناعي' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-semibold mb-1">{t({ en: 'Reference Specific Sections', ar: 'رجع للأقسام المحددة' })}</p>
                <p className="text-sm text-white/90">{t({ en: 'Copy relevant sections for specific tasks', ar: 'انسخ الأقسام ذات الصلة للمهام المحددة' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-semibold mb-1">{t({ en: 'After Development', ar: 'بعد التطوير' })}</p>
                <p className="text-sm text-white/90">{t({ en: 'Verify compliance with all rules in section 7', ar: 'تحقق من الامتثال لجميع القواعد في القسم 7' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <p className="font-semibold mb-1">{t({ en: 'Update Reports', ar: 'تحديث التقارير' })}</p>
                <p className="text-sm text-white/90">{t({ en: 'Regenerate all affected coverage reports', ar: 'أعد إنشاء جميع تقارير التغطية المتأثرة' })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MasterDevelopmentPrompt, { requireAdmin: true });
