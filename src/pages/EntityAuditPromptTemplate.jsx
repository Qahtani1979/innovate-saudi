import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Copy, CheckCircle2, Target, Database, FileText, Users, Brain, Zap } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EntityAuditPromptTemplate() {
  const { t, isRTL } = useLanguage();
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // MASTER AUDIT PROMPT TEMPLATE - Change only {ENTITY_NAME}
  const auditPromptTemplate = `# COMPREHENSIVE AUDIT PROMPT FOR {ENTITY_NAME}

## INSTRUCTIONS
Replace {ENTITY_NAME} with the actual entity name (e.g., Challenge, Pilot, Solution, Program, RDProject, Sandbox, LivingLab, MatchmakerApplication, ScalingPlan, PolicyRecommendation, Organization, CitizenIdea, InnovationProposal, etc.)

---

## PHASE 1: ENTITY SCHEMA VALIDATION ✅

**Task:** Verify {ENTITY_NAME} entity schema completeness against all coverage reports and trackers.

**Check Against:**
1. **DataModelDocumentation** page
2. **EntitiesWorkflowTracker** page (89 entities tracking)
3. **EntityRecordsLifecycleTracker** page (data health)
4. **{ENTITY_NAME}CoverageReport** page (if exists)

**Validation Checklist:**

### 1.1 Core Fields (MANDATORY)
- [ ] Built-in fields present: id, created_date, updated_date, created_by
- [ ] Bilingual content: title_ar, title_en, description_ar, description_en (if content entity)
- [ ] Code/unique identifier field present (e.g., code, {entity}_code)
- [ ] Status/stage field present with full lifecycle enum
- [ ] Soft delete: is_deleted, deleted_date, deleted_by
- [ ] Versioning (if key entity): version_number, previous_version_id

### 1.2 Taxonomy Linkage (REQUIRED FOR CORE ENTITIES)
- [ ] sector_id or sector field
- [ ] subsector_id or sub_sector field  
- [ ] service_id or affected_services field
- [ ] municipality_id field (if location-specific)
- [ ] region_id and city_id fields (if geographic)

### 1.3 Strategic Alignment (REQUIRED FOR INNOVATION ENTITIES)
- [ ] strategic_pillar_id field
- [ ] strategic_plan_ids array
- [ ] strategic_objective_ids array
- [ ] strategic_priority_level field (tier_1/tier_2/tier_3/tier_4)
- [ ] challenge_alignment_id or linked_challenge_ids (if applicable)

### 1.4 Workflow & SLA Fields (REQUIRED FOR WORKFLOW ENTITIES)
- [ ] workflow_stage or status field with proper lifecycle enum
- [ ] sla_due_date field
- [ ] escalation_level field (0/1/2)
- [ ] escalation_date field
- [ ] reviewer or assigned_to field
- [ ] review_date, approval_date, submission_date fields

### 1.5 Visibility & Publishing (REQUIRED FOR PUBLIC ENTITIES)
- [ ] is_published field (for public showcase)
- [ ] is_confidential or is_internal field (for sensitive data)
- [ ] publishing_approved_by field
- [ ] publishing_approved_date field
- [ ] is_featured field (for highlighted content)

### 1.6 AI & Embeddings (REQUIRED FOR MATCHING ENTITIES)
- [ ] embedding array field (768 dimensions for vector search)
- [ ] embedding_model field (tracks model version)
- [ ] embedding_generated_date field
- [ ] ai_pre_screening or ai_analysis object (AI metadata)
- [ ] similarity_score or match_score fields (if matching entity)

### 1.7 Engagement & Analytics (RECOMMENDED)
- [ ] view_count field
- [ ] vote_count or like_count (if applicable)
- [ ] comment_count field
- [ ] attachment_count or related_count
- [ ] tags array field
- [ ] keywords array field

### 1.8 Team & Collaboration (IF APPLICABLE)
- [ ] team array or team_members array
- [ ] stakeholders array
- [ ] owner_email or challenge_owner_email
- [ ] collaborators array (if multi-party)

### 1.9 Financial & Budget (IF APPLICABLE)
- [ ] budget field
- [ ] budget_spent field
- [ ] budget_released field
- [ ] budget_breakdown array
- [ ] budget_approvals array
- [ ] currency field (default SAR)

### 1.10 KPIs & Metrics (IF APPLICABLE)
- [ ] kpis array
- [ ] success_metrics array
- [ ] baseline_value, target_value, current_value fields
- [ ] impact_score or severity_score

### 1.11 Media & Files (IF APPLICABLE)
- [ ] image_url, banner_url, logo_url
- [ ] gallery_urls array
- [ ] video_url, demo_url, demo_video_url
- [ ] brochure_url, document_url
- [ ] attachments array or attachment_urls

**ACTION:** List ALL missing fields from {ENTITY_NAME} entity and prioritize (P0/P1/P2).

---

## PHASE 2: PAGE & COMPONENT VALIDATION ✅

**Task:** Verify all pages/components for {ENTITY_NAME} exist and are complete.

**Check Against:**
1. **{ENTITY_NAME}CoverageReport** (Section 2: Pages & Screens)
2. **CreateWizardsCoverageReport** page
3. **DetailPagesCoverageReport** page
4. **EditPagesCoverageReport** page
5. **MenuCoverageReport** page (verify in navigation)

**Required Pages Checklist:**

### 2.1 List Page
- [ ] **{ENTITY_NAME}s** page exists (plural)
- [ ] Grid/List/Kanban view toggles
- [ ] Advanced filters (sector, status, municipality, date range, etc.)
- [ ] Search functionality (keyword + AI semantic search)
- [ ] Sort options (date, priority, score, alphabetical)
- [ ] Bulk actions toolbar (select, update, delete, export)
- [ ] Export functionality (CSV, Excel, PDF)
- [ ] Pagination or infinite scroll
- [ ] AI features: clustering, priority sorting, recommendations
- [ ] Empty state with helpful actions
- [ ] Loading skeletons
- [ ] RBAC: ProtectedPage with view permissions
- [ ] Bilingual: All labels via t() function
- [ ] RTL: Proper layout direction

### 2.2 Create Page/Wizard
- [ ] **{ENTITY_NAME}Create** page exists
- [ ] Multi-step wizard (3-6 steps) OR single-page form
- [ ] Step 1: Basic info (code, title, description bilingual)
- [ ] Step 2: Classification (sector, taxonomy, strategic linkage)
- [ ] Step 3: Details (specific to entity - team, budget, timeline, etc.)
- [ ] Step 4: Media & Files (uploads, attachments)
- [ ] Step 5: Review & Submit (preview, validation, submit)
- [ ] AI enhancement button in each step
- [ ] Draft auto-save to localStorage (every 30s)
- [ ] Draft recovery on reload (<24h old)
- [ ] Field validation (bilingual error messages)
- [ ] Required field indicators
- [ ] Progress indicator (step X of Y)
- [ ] Navigation: Next/Back/Save Draft buttons
- [ ] Final submit creates entity + triggers workflows
- [ ] RBAC: ProtectedPage with create permission
- [ ] Bilingual: All fields have _ar and _en inputs
- [ ] RTL: Forms work in both directions

### 2.3 Detail Page
- [ ] **{ENTITY_NAME}Detail** page exists
- [ ] Hero section: Title, status badge, key metrics, action buttons
- [ ] Tabs component with 10-15 tabs minimum
- [ ] **Tab 1 - Overview:** Entity summary, description, objectives
- [ ] **Tab 2 - Workflow & Approvals:** UnifiedWorkflowApprovalTab integration
- [ ] **Tab 3 - Data & Evidence:** Supporting data, attachments, files
- [ ] **Tab 4 - KPIs/Metrics:** Performance tracking (if applicable)
- [ ] **Tab 5 - Team/Stakeholders:** People involved
- [ ] **Tab 6 - Financial:** Budget, expenses, ROI (if applicable)
- [ ] **Tab 7 - Timeline:** Milestones, Gantt view
- [ ] **Tab 8 - Risks:** Risk register (if applicable)
- [ ] **Tab 9 - Strategic Alignment:** Linked strategic plans
- [ ] **Tab 10 - Related Entities:** Network (challenges, pilots, solutions, R&D, etc.)
- [ ] **Tab 11 - Conversions:** Conversion workflows (show input/output paths)
- [ ] **Tab 12 - AI Insights:** AI-generated analysis and recommendations
- [ ] **Tab 13 - Expert Evaluations:** ExpertEvaluation records (if applicable)
- [ ] **Tab 14 - Media & Gallery:** Images, videos, documents
- [ ] **Tab 15 - Activity Log:** {ENTITY_NAME}ActivityLog component (merge SystemActivity + comments + approvals)
- [ ] **Tab 16 - Discussion:** Comments thread
- [ ] Action buttons: Edit, Clone, Archive, Export, Share
- [ ] AI features integrated: Success predictor, recommendations, insights
- [ ] Conditional tab rendering based on permissions
- [ ] Tab state preserved in URL (?tab=kpis)
- [ ] RBAC: Permission checks for sensitive tabs
- [ ] Bilingual: All tab labels and content
- [ ] RTL: Tabs scroll correctly

### 2.4 Edit Page
- [ ] **{ENTITY_NAME}Edit** page exists
- [ ] Full form with all entity fields (bilingual)
- [ ] Auto-save every 30s to localStorage
- [ ] Draft recovery on reload
- [ ] Field-level change tracking with counter
- [ ] Unsaved changes warning on navigate away
- [ ] Preview mode toggle (formatted view)
- [ ] Version number increment on save
- [ ] Change summary in SystemActivity log
- [ ] Validation before save (bilingual errors)
- [ ] AI enhancement buttons per section
- [ ] Cancel with confirmation (if changes)
- [ ] Save button with loading state
- [ ] Toast notifications (success/error)
- [ ] RBAC: ProtectedPage with edit permission
- [ ] Bilingual: Dual inputs for all content fields
- [ ] RTL: Form layout adapts

### 2.5 Additional Pages (IF APPLICABLE)
- [ ] **{ENTITY_NAME}ReviewQueue** - For approval workflows
- [ ] **{ENTITY_NAME}Analytics** - Analytics dashboard
- [ ] **{ENTITY_NAME}Comparison** - Side-by-side comparison
- [ ] **My{ENTITY_NAME}s** - Personal filtered view
- [ ] **Public{ENTITY_NAME}Tracker** - Public showcase (if public entity)

**Components Checklist:**

### 2.6 Activity Log Component
- [ ] **{ENTITY_NAME}ActivityLog.jsx** component exists
- [ ] Fetches SystemActivity where entity_type={ENTITY_NAME}
- [ ] Fetches {ENTITY_NAME}Comment records
- [ ] Fetches ApprovalRequest records for this entity
- [ ] Merges into unified timeline
- [ ] Visual icons for action types (created, updated, approved, commented)
- [ ] Grouped by date with expandable cards
- [ ] Shows user name, timestamp, action description
- [ ] Metadata display for each action
- [ ] Bilingual activity descriptions
- [ ] RTL-aware layout

### 2.7 Workflow Tab Component (IF WORKFLOW ENTITY)
- [ ] **{ENTITY_NAME}WorkflowTab.jsx** component exists OR
- [ ] UnifiedWorkflowApprovalTab integrated directly in detail page
- [ ] Shows current workflow_stage with visual progress
- [ ] Displays 4 gates (submission, mid-stage, review, completion)
- [ ] Each gate shows: self-check items (4+), reviewer checklist (4-5+)
- [ ] RequesterAI and ReviewerAI integrated per gate
- [ ] Gate approval actions (approve, reject, request changes)
- [ ] SLA countdown timer per gate
- [ ] Escalation badges for overdue
- [ ] Approval history timeline
- [ ] Links to ApprovalCenter for pending approvals

**ACTION:** List ALL missing pages and components for {ENTITY_NAME}.

---

## PHASE 3: WORKFLOW & LIFECYCLE VALIDATION ✅

**Task:** Verify {ENTITY_NAME} workflows are complete and properly gated.

**Check Against:**
1. **EntitiesWorkflowTracker** page (workflow implementation status)
2. **WorkflowApprovalSystemCoverage** page (37 gates across 14 entities)
3. **GateMaturityMatrix** page (gate definitions)
4. **StagesCriteriaCoverageReport** page (stage-specific criteria)
5. **{ENTITY_NAME}CoverageReport** (Section 3: Workflows)

**Workflow Validation Checklist:**

### 3.1 Lifecycle Stages
- [ ] Full lifecycle enum defined in entity schema
- [ ] All stages documented in EntitiesWorkflowTracker
- [ ] Stage transitions mapped (draft→submitted→review→approved→active→completed)
- [ ] Stage-specific permissions defined (who can move to next stage)
- [ ] Stage change triggers notifications
- [ ] Stage change logged to SystemActivity

### 3.2 Approval Gates (4-GATE SYSTEM)
- [ ] **Gate 1 - Submission/Design Review**
  - [ ] Configured in ApprovalGateConfig.js
  - [ ] Self-check: 4 items (requester fills)
  - [ ] Reviewer checklist: 4-5 items (reviewer validates)
  - [ ] RequesterAI prompt defined (helps with self-check)
  - [ ] ReviewerAI prompt defined (assists review)
  - [ ] SLA defined (e.g., 7 days)
  - [ ] Decisions: approved, requires_changes, rejected
  - [ ] Next stage mapping defined

- [ ] **Gate 2 - Launch/Mid-Stage Review**
  - [ ] Gate configured in ApprovalGateConfig.js
  - [ ] Self-check + reviewer checklist
  - [ ] AI assistance both sides
  - [ ] SLA defined
  - [ ] Decisions defined
  - [ ] Stage transition logic

- [ ] **Gate 3 - Progress/Compliance Review**
  - [ ] Gate configured
  - [ ] Monitoring criteria defined
  - [ ] AI anomaly detection integrated
  - [ ] Escalation rules
  - [ ] Pivot/continue/pause decisions

- [ ] **Gate 4 - Completion/Evaluation**
  - [ ] Gate configured
  - [ ] Success criteria validation
  - [ ] Multi-expert evaluation (ExpertEvaluation entity)
  - [ ] Consensus calculation (if multiple evaluators)
  - [ ] Final recommendations: scale, iterate, pivot, terminate
  - [ ] Lessons learned REQUIRED

### 3.3 Workflow Integration
- [ ] {ENTITY_NAME}Detail has UnifiedWorkflowApprovalTab
- [ ] ApprovalCenter has {ENTITY_NAME} tab
- [ ] InlineApprovalWizard configured for {ENTITY_NAME}
- [ ] All gates linked to ApprovalRequest entity
- [ ] Workflow stage shown in list view (badge)
- [ ] SLA countdown visible in lists and detail
- [ ] Escalation badges shown (WARNING/CRITICAL)

### 3.4 SLA & Escalation Automation
- [ ] slaAutomation function includes {ENTITY_NAME}
- [ ] Auto-calculate sla_due_date on submission
- [ ] Auto-escalate after X days overdue
- [ ] Leadership alerts on CRITICAL escalation
- [ ] SLA tracking in ExecutiveStrategicChallengeQueue (if tier_1)

**ACTION:** List ALL missing workflow components for {ENTITY_NAME}.

---

## PHASE 4: USER JOURNEY VALIDATION ✅

**Task:** Verify all user personas can complete their journeys with {ENTITY_NAME}.

**Check Against:**
1. **UserJourneyValidation** page (17 journeys)
2. **{ENTITY_NAME}CoverageReport** (Section 4: User Journeys)
3. **ParallelUniverseTracker** page (ecosystem integration)

**Personas to Validate:**

### 4.1 Creator Persona (Who creates {ENTITY_NAME})
Example journey steps to validate:
- [ ] Step 1: Access create page (permission check)
- [ ] Step 2: Start wizard (guided creation)
- [ ] Step 3: AI assists with content (enhancement button)
- [ ] Step 4: Upload files/attachments (if applicable)
- [ ] Step 5: Preview before submit
- [ ] Step 6: Submit for review (gate 1 triggered)
- [ ] Step 7: Receive confirmation notification
- [ ] Step 8: Track status in My{ENTITY_NAME}s
- [ ] Step 9: Receive approval/rejection notification
- [ ] Step 10: Entity visible in {ENTITY_NAME}s list

### 4.2 Reviewer/Approver Persona
- [ ] Step 1: Receive assignment notification
- [ ] Step 2: See in ApprovalCenter {ENTITY_NAME} tab
- [ ] Step 3: Open {ENTITY_NAME}Detail
- [ ] Step 4: Review workflow tab, see self-check completed
- [ ] Step 5: ReviewerAI provides analysis
- [ ] Step 6: Complete reviewer checklist
- [ ] Step 7: Make decision (approve/reject/request changes)
- [ ] Step 8: Requester notified of decision
- [ ] Step 9: Entity stage updated automatically

### 4.3 Owner/Manager Persona (Manages active {ENTITY_NAME})
- [ ] Step 1: View My{ENTITY_NAME}s dashboard
- [ ] Step 2: Select entity to manage
- [ ] Step 3: Edit entity details (auto-save, version tracking)
- [ ] Step 4: Upload files, add KPIs, manage team
- [ ] Step 5: Track progress via Activity Log
- [ ] Step 6: Receive SLA warnings (if applicable)
- [ ] Step 7: Respond to approval requests
- [ ] Step 8: Complete workflows (gate submissions)
- [ ] Step 9: Close entity (resolution/completion)
- [ ] Step 10: Trigger conversions (to other entities)

### 4.4 Expert Evaluator Persona (IF EVALUATION ENTITY)
- [ ] Step 1: Receive ExpertAssignment
- [ ] Step 2: See in ExpertAssignmentQueue
- [ ] Step 3: Accept assignment
- [ ] Step 4: Open {ENTITY_NAME}Detail
- [ ] Step 5: Access Experts tab or Evaluation gate
- [ ] Step 6: Complete UnifiedEvaluationForm (8-dimension scorecard)
- [ ] Step 7: Submit evaluation (ExpertEvaluation created)
- [ ] Step 8: Consensus calculated (if multi-evaluator)
- [ ] Step 9: Entity status updated based on evaluation
- [ ] Step 10: Feedback sent to requester

### 4.5 Public/Citizen Persona (IF PUBLIC ENTITY)
- [ ] Step 1: Access Public{ENTITY_NAME}Tracker (no auth)
- [ ] Step 2: Browse published entities (is_published=true only)
- [ ] Step 3: Search and filter public content
- [ ] Step 4: View {ENTITY_NAME}Detail (public fields only)
- [ ] Step 5: Express interest or vote (if applicable)
- [ ] Step 6: Submit feedback (CitizenFeedback entity)
- [ ] Step 7: Track own submissions (CitizenDashboard)
- [ ] Step 8: Receive closure notifications

**ACTION:** Identify ALL broken or incomplete user journeys for {ENTITY_NAME}.

---

## PHASE 5: AI FEATURES VALIDATION ✅

**Task:** Verify all AI features for {ENTITY_NAME} are implemented and integrated.

**Check Against:**
1. **AIFeaturesDocumentation** page (50+ AI features catalog)
2. **{ENTITY_NAME}CoverageReport** (Section 5: AI & ML Features)
3. **ParallelUniverseTracker** (AI integration status)

**AI Features Checklist:**

### 5.1 Creation AI (In Create/Edit Pages)
- [ ] AI content enhancement button
- [ ] AI auto-complete for missing fields
- [ ] AI bilingual content generation (EN→AR, AR→EN)
- [ ] AI classification/categorization
- [ ] AI tag suggestions
- [ ] AI validation and error detection
- [ ] AI field recommendations based on entity type

### 5.2 Matching AI (In Detail Page or Matching Engine)
- [ ] AI semantic matching to related entities
- [ ] Match score calculation (0-100)
- [ ] Match reasoning explanation (bilingual)
- [ ] AI recommendations displayed (top 5-10 matches)
- [ ] Match results actionable (create link, conversion, proposal)

### 5.3 Prediction AI (In Detail Page AI Insights Tab)
- [ ] AI success predictor (if workflow entity)
- [ ] AI risk assessment
- [ ] AI timeline/budget predictions
- [ ] AI outcome forecasting
- [ ] Confidence scores displayed (0-100)

### 5.4 Analysis AI (In Detail Page or Analytics)
- [ ] AI insights panel/tab in detail page
- [ ] AI generates summary, recommendations
- [ ] AI identifies patterns and anomalies
- [ ] AI peer comparison analysis
- [ ] AI impact assessment

### 5.5 Automation AI (Background Functions)
- [ ] AI auto-categorization on creation
- [ ] AI embedding generation (generateEmbeddings function)
- [ ] AI duplicate detection
- [ ] AI SLA monitoring and alerts
- [ ] AI notification routing

### 5.6 Workflow AI (In Approval Gates)
- [ ] RequesterAI in all gates (self-check assistant)
- [ ] ReviewerAI in all gates (review assistant)
- [ ] AI suggests approval decisions
- [ ] AI flags risks in gate reviews

**ACTION:** List ALL AI features that exist as components but are NOT integrated into {ENTITY_NAME} workflows.

---

## PHASE 6: CONVERSION PATHS VALIDATION ✅

**Task:** Verify {ENTITY_NAME} conversion paths (INPUT and OUTPUT).

**Check Against:**
1. **ConversionsCoverageReport** page (all conversion workflows)
2. **{ENTITY_NAME}CoverageReport** (Section 6: Conversion Paths)
3. **ConversionHub** page (verify {ENTITY_NAME} conversions)

**Conversion Validation:**

### 6.1 INPUT Conversions (What creates {ENTITY_NAME})
Identify all entities that can convert TO {ENTITY_NAME}:

Example (for Challenge):
- [ ] CitizenIdea → Challenge (IdeaToChallengeConverter)
- [ ] InnovationProposal → Challenge (if not linked)
- [ ] Pilot → Challenge (failed pilots create new challenges)

**For {ENTITY_NAME}, check:**
- [ ] All input conversion paths documented
- [ ] Conversion components exist
- [ ] AI auto-populates fields from source entity
- [ ] Bidirectional links created (use ChallengeRelation entity)
- [ ] Conversion logged in SystemActivity
- [ ] Source entity status updated (e.g., converted_to_{entity})
- [ ] Notifications sent to all parties

### 6.2 OUTPUT Conversions (What {ENTITY_NAME} converts to)
Identify all entities {ENTITY_NAME} can convert TO:

Example (for Challenge):
- [ ] Challenge → Pilot (Smart action button)
- [ ] Challenge → RDCall (ChallengeToRDWizard)
- [ ] Challenge → PolicyRecommendation (PolicyRecommendationManager)
- [ ] Challenge → Program (ChallengeToProgramWorkflow)

**For {ENTITY_NAME}, check:**
- [ ] All output conversion paths documented
- [ ] Conversion buttons/wizards exist in detail page
- [ ] AI generators create converted entity content (bilingual)
- [ ] Conversion workflow validates required fields
- [ ] Links maintained in both entities
- [ ] Conversion tracked in {ENTITY_NAME}Detail Conversions tab

**ACTION:** List ALL missing conversion workflows for {ENTITY_NAME}.

---

## PHASE 7: EXPERT EVALUATION VALIDATION ✅

**Task:** Verify {ENTITY_NAME} has proper expert evaluation system.

**Check Against:**
1. **ExpertCoverageReport** page (expert system completeness)
2. **EvaluationSystemDeepDive** page (evaluation framework)
3. **ExpertMatchingEngine** page (assignment system)

**Expert System Checklist:**

### 7.1 Expert Evaluation Configuration
- [ ] {ENTITY_NAME} included in UnifiedEvaluationForm entityType options
- [ ] 8-dimension scorecard configured for {ENTITY_NAME}:
  - [ ] feasibility_score (0-100)
  - [ ] impact_score (0-100)
  - [ ] innovation_score (0-100)
  - [ ] cost_effectiveness_score (0-100)
  - [ ] risk_score (0-100)
  - [ ] strategic_alignment_score (0-100)
  - [ ] technical_quality_score (0-100)
  - [ ] scalability_score (0-100)
- [ ] overall_score calculation (average of 8 dimensions)
- [ ] Recommendation field (approve/reject/conditional/revise)

### 7.2 Expert Assignment
- [ ] ExpertMatchingEngine can assign experts for {ENTITY_NAME}
- [ ] Sector-based matching works (matches by entity sector + expert specialization)
- [ ] ExpertAssignment records created for {ENTITY_NAME}
- [ ] Expert receives notification of assignment
- [ ] Due date and priority set on assignment

### 7.3 Expert Evaluation Workflow
- [ ] {ENTITY_NAME}Detail has Experts tab OR evaluation section
- [ ] Shows assigned experts
- [ ] Displays ExpertEvaluation records
- [ ] UnifiedEvaluationForm accessible from tab
- [ ] Expert can submit evaluation
- [ ] Evaluations visible to admins and entity owner

### 7.4 Multi-Expert Consensus
- [ ] EvaluationConsensusPanel displays consensus for {ENTITY_NAME}
- [ ] Consensus calculation works (average scores, agreement %)
- [ ] checkConsensus function updates entity status
- [ ] ExpertPanel entity used (if panel evaluation)

### 7.5 Expert Queue Integration
- [ ] {ENTITY_NAME} assignments visible in ExpertAssignmentQueue
- [ ] Expert can filter by entity type
- [ ] Quick evaluate action available
- [ ] Links to {ENTITY_NAME}Detail work

**ACTION:** Verify if {ENTITY_NAME} NEEDS expert evaluation or if simple admin approval is sufficient.

---

## PHASE 8: RBAC & SECURITY VALIDATION ✅

**Task:** Verify {ENTITY_NAME} has complete permission model and security.

**Check Against:**
1. **RBACCoverageReport** page
2. **RBACImplementationTracker** page  
3. **RBACAuditReport** page
4. **{ENTITY_NAME}CoverageReport** (Section 8: RBAC)

**RBAC Validation Checklist:**

### 8.1 Permission Definitions
- [ ] {entity}_view_all permission exists
- [ ] {entity}_view_own permission exists (if scoped entity)
- [ ] {entity}_view_public permission exists (if public entity)
- [ ] {entity}_create permission exists
- [ ] {entity}_update or {entity}_edit permission exists
- [ ] {entity}_delete permission exists
- [ ] {entity}_approve permission exists (if workflow entity)
- [ ] {entity}_publish permission exists (if publishing workflow)
- [ ] {entity}_evaluate permission OR expert_evaluate (if evaluation entity)
- [ ] {entity}_scale permission (if scaling entity like Pilot)

### 8.2 Role Assignments
Document which roles have which permissions:
- [ ] Admin: All permissions (wildcard *)
- [ ] Municipality roles: Own municipality scope
- [ ] Startup roles: Own solutions/proposals
- [ ] Researcher roles: Own R&D projects
- [ ] Expert roles: Assigned evaluations only
- [ ] Public roles: View published only

### 8.3 Page Protection
- [ ] {ENTITY_NAME}s list: ProtectedPage with requiredPermissions
- [ ] {ENTITY_NAME}Create: ProtectedPage with create permission
- [ ] {ENTITY_NAME}Detail: ProtectedPage with view permission
- [ ] {ENTITY_NAME}Edit: ProtectedPage with edit permission
- [ ] Review queues: ProtectedPage with approve permission

### 8.4 Row-Level Security (RLS)
- [ ] Municipality scoping: Users see own municipality {ENTITY_NAME}s
- [ ] Ownership scoping: Users see own created {ENTITY_NAME}s (created_by filter)
- [ ] Visibility scoping: Public users see is_published=true only
- [ ] Expert scoping: Experts see assigned evaluations only
- [ ] Team scoping: Team members see team {ENTITY_NAME}s

### 8.5 Field-Level Security
- [ ] Sensitive fields hidden from non-admins (budget, internal_notes, contact_emails)
- [ ] Conditional field rendering based on hasPermission()
- [ ] Budget fields require financial_view_sensitive permission
- [ ] Evaluation scores require expert_evaluate or admin
- [ ] Personal data (emails, phones) require admin or own record

### 8.6 Action-Level Security
- [ ] Edit button: ProtectedAction with edit permission
- [ ] Delete button: ProtectedAction with delete permission
- [ ] Approve button: ProtectedAction with approve permission
- [ ] Publish button: ProtectedAction with publish permission
- [ ] All workflow transitions permission-gated

**ACTION:** List ALL security gaps for {ENTITY_NAME}.

---

## PHASE 9: INTEGRATION VALIDATION ✅

**Task:** Verify {ENTITY_NAME} integrates properly with all related entities and systems.

**Check Against:**
1. **{ENTITY_NAME}CoverageReport** (Section 9: Integration Points)
2. **ParallelUniverseTracker** page (cross-entity integration)
3. **EntityRecordsLifecycleTracker** page (data relationships)

**Integration Checklist:**

### 9.1 Entity Relationships
List all entities {ENTITY_NAME} relates to:
- [ ] One-to-Many: Parent entity → {ENTITY_NAME} array
- [ ] Many-to-One: {ENTITY_NAME} → Parent entity via FK
- [ ] Many-to-Many: Junction table or array fields
- [ ] Polymorphic: Generic entity_type/entity_id pattern
- [ ] Verify all foreign keys functional
- [ ] Verify no orphaned records (broken FKs)

### 9.2 Comment System Integration
- [ ] {ENTITY_NAME}Comment entity exists
- [ ] Comment component in {ENTITY_NAME}Detail
- [ ] Comments counted in comment_count field
- [ ] Comment notifications working
- [ ] Mentions (@user) working in comments

### 9.3 Attachment System Integration
- [ ] {ENTITY_NAME}Attachment entity OR attachments array
- [ ] File upload working (FileUploader component)
- [ ] Supported file types: images, PDFs, documents
- [ ] File preview/download working
- [ ] AI data extraction from files (if applicable)

### 9.4 Activity Logging Integration
- [ ] {ENTITY_NAME}Activity entity OR SystemActivity integration
- [ ] All CRUD operations logged
- [ ] Stage changes logged
- [ ] Approval decisions logged
- [ ] {ENTITY_NAME}ActivityLog component merges all logs

### 9.5 Notification Integration
- [ ] Status changes trigger notifications
- [ ] Approvals trigger notifications
- [ ] Comments trigger notifications (mentions)
- [ ] SLA escalations trigger leadership alerts
- [ ] autoNotificationTriggers function includes {ENTITY_NAME}

### 9.6 Tag System Integration
- [ ] {ENTITY_NAME}Tag entity OR tags array field
- [ ] AIContentAutoTagger works on {ENTITY_NAME}
- [ ] Tags displayed in list and detail views
- [ ] Tag filter in list page

### 9.7 KPI System Integration (IF APPLICABLE)
- [ ] {ENTITY_NAME}KPI or {ENTITY_NAME}KPILink entity
- [ ] KPI tracking in detail page KPIs tab
- [ ] KPI datapoints over time
- [ ] AI KPI anomaly detection
- [ ] KPI visualization (charts, trends)

### 9.8 Strategic Plan Integration
- [ ] StrategicPlan{ENTITY_NAME}Link entity OR strategic_plan_ids array
- [ ] Strategic alignment shown in detail page
- [ ] Strategic priority scoring (tier_1/2/3/4)
- [ ] Linked in StrategyCockpit and strategic dashboards

**ACTION:** List ALL missing integrations for {ENTITY_NAME}.

---

## PHASE 10: VALIDATION AGAINST TRACKERS 🔍

**Cross-Reference ALL Trackers:**

### 10.1 ComprehensiveReportAudit
- [ ] {ENTITY_NAME}CoverageReport listed with status and completeness %
- [ ] All 9 standard sections scored
- [ ] Status: ✅ COMPLETE or ⚠️ NEEDS SECTIONS

### 10.2 GapsImplementationTracker
- [ ] Check if {ENTITY_NAME} has any open gaps listed
- [ ] Verify gap priority (P0/P1/P2)
- [ ] Confirm gap status (completed/in_progress/not_started)

### 10.3 EntitiesWorkflowTracker
- [ ] {ENTITY_NAME} listed in correct category (Core/Reference/Workflow/etc.)
- [ ] Lifecycle stages complete
- [ ] Workflows implemented count accurate
- [ ] CRUD operations documented
- [ ] AI features count accurate
- [ ] Coverage % matches reality
- [ ] Pages and components lists complete
- [ ] Gaps list accurate

### 10.4 EntityRecordsLifecycleTracker
- [ ] {ENTITY_NAME} records counted correctly
- [ ] Lifecycle distribution analyzed
- [ ] Data completeness % calculated
- [ ] Conversion rates tracked
- [ ] Bottleneck detection working

### 10.5 UserJourneyValidation
- [ ] {ENTITY_NAME} included in relevant journeys
- [ ] Journey coverage % accurate
- [ ] All personas documented
- [ ] Journey gaps identified

### 10.6 RBACImplementationTracker
- [ ] All {ENTITY_NAME} pages have RBAC protection
- [ ] Permissions defined in permission catalog
- [ ] Roles assigned correctly
- [ ] Coverage % accurate

### 10.7 ParallelUniverseTracker
- [ ] {ENTITY_NAME} integrated into relevant "universes"
- [ ] Isolation symptoms identified
- [ ] Integration gaps documented
- [ ] Required workflows listed

### 10.8 MasterGapsList
- [ ] All {ENTITY_NAME} gaps consolidated
- [ ] Priority assigned (P0/P1/P2/P3)
- [ ] Status tracked (completed/in_progress/planned)
- [ ] Implementation plan exists

**ACTION:** Update ALL tracker pages with {ENTITY_NAME} current status.

---

## PHASE 11: BILINGUAL & RTL VALIDATION 🌐

**Task:** Verify {ENTITY_NAME} has complete bilingual support.

**Check Against:**
1. **BilingualRTLAudit** page
2. **BilingualCoverageReports** page
3. All {ENTITY_NAME} pages manually

**Bilingual Checklist:**

### 11.1 Entity Fields
- [ ] All content fields have _ar and _en variants
- [ ] title_ar + title_en both REQUIRED
- [ ] description_ar + description_en both REQUIRED
- [ ] All text content fields bilingual

### 11.2 UI Text
- [ ] All page titles wrapped in t({en:'', ar:''})
- [ ] All button labels bilingual
- [ ] All form labels bilingual
- [ ] All placeholder text bilingual
- [ ] All validation messages bilingual
- [ ] All toast notifications bilingual
- [ ] All error messages bilingual
- [ ] All empty states bilingual

### 11.3 RTL Layout
- [ ] Container has dir={isRTL ? 'rtl' : 'ltr'}
- [ ] Text alignment: className={\`\${isRTL ? 'text-right' : 'text-left'}\`}
- [ ] Icon positioning: className={\`\${isRTL ? 'right-3' : 'left-3'}\`}
- [ ] Input padding: className={\`\${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}\`}
- [ ] Margins: className={\`\${isRTL ? 'ml-4' : 'mr-4'}\`}
- [ ] Arrows flip: <ChevronRight className={isRTL ? 'rotate-180' : ''} />
- [ ] Forms have dual inputs with dir="rtl" and dir="ltr"
- [ ] Tables and lists adapt to RTL
- [ ] Charts and graphs work in RTL (may need special handling)

### 11.4 AI Bilingual Output
- [ ] All AI features return bilingual content
- [ ] AI responses have _en and _ar properties
- [ ] AI prompts request bilingual output explicitly
- [ ] AI-generated content validates both languages present

**ACTION:** List ALL bilingual/RTL gaps for {ENTITY_NAME}.

---

## PHASE 12: CRITICAL GAPS FROM COVERAGE REPORTS 🚨

**Task:** Validate {ENTITY_NAME} against ALL critical gaps identified in coverage reports.

**Universal P0 Gaps (Check if applicable to {ENTITY_NAME}):**

### 12.1 Visibility & Publishing Workflows
- [ ] Does {ENTITY_NAME} need is_published field? (Challenge, Solution, Pilot, RDProject, StartupProfile do)
- [ ] Does {ENTITY_NAME} need is_confidential field?
- [ ] Is publishing workflow implemented?
- [ ] Is publishing approval gate configured?
- [ ] Can users distinguish public vs private {ENTITY_NAME}s?

### 12.2 Program Classification (IF ENTITY = Program)
- [ ] program_type field exists with full enum
- [ ] is_public field exists (public vs internal programs)
- [ ] All program types: internal/academia/ventures/research_centers/public/G2G/G2B/G2C/innovation_campaign/hackathon/accelerator

### 12.3 Testing Infrastructure Linkage (IF ENTITY = Pilot)
- [ ] Sandbox allocation: Is it automatic or manual?
- [ ] LivingLab allocation: Is it automatic or manual?
- [ ] Auto-routing based on risk/regulatory profile?
- [ ] Testing infrastructure fields present in entity?

### 12.4 Entity Distinction (IF ENTITY = CitizenIdea or InnovationProposal)
- [ ] CitizenIdea = Generic engagement (informal, voting)
- [ ] InnovationProposal = Structured submissions (taxonomy, strategic linkage)
- [ ] Are these properly distinguished in data model?
- [ ] Are conversion workflows correct?

### 12.5 Closure/Output Workflows
Does {ENTITY_NAME} have closure workflows when completed?
- [ ] Scaling → BAU/Policy/Standards institutionalization
- [ ] R&D → Solution commercialization
- [ ] R&D → Knowledge/Policy workflows
- [ ] Pilot → R&D/Policy/Procurement workflows
- [ ] Sandbox → Policy feedback loop
- [ ] Program → Solution graduation workflow

### 12.6 Evaluation Rigor
- [ ] Does {ENTITY_NAME} use ExpertEvaluation entity (structured scorecard)?
- [ ] Or just simple admin approval? (WEAK)
- [ ] Are domain experts assigned by sector?
- [ ] Is there multi-evaluator consensus?
- [ ] Are evaluation criteria documented?

### 12.7 Startup Opportunity Focus (IF ENTITY = Solution, Pilot, MatchmakerApplication)
- [ ] Opportunity pipeline tracking (NOT revenue/funding)
- [ ] challenges_pursued → proposals_submitted → pilots_won → municipal_clients
- [ ] Deployment success tracking
- [ ] Municipal client expansion tracking

**ACTION:** Identify ALL critical gaps applicable to {ENTITY_NAME} and prioritize.

---

## PHASE 13: FINAL VALIDATION REPORT 📊

**Generate Final Audit Report:**

### Summary Scorecard:
1. **Entity Schema:** ___/10 (field completeness)
2. **Pages & Components:** ___/10 (UI completeness)
3. **Workflows & Gates:** ___/10 (approval system)
4. **User Journeys:** ___/10 (persona completion)
5. **AI Features:** ___/10 (AI integration)
6. **Conversions:** ___/10 (input/output paths)
7. **Expert Evaluation:** ___/10 (evaluation rigor)
8. **RBAC & Security:** ___/10 (permission model)
9. **Integration:** ___/10 (cross-entity connections)
10. **Bilingual/RTL:** ___/10 (internationalization)

**OVERALL {ENTITY_NAME} SCORE:** ___/100

### Critical Issues (P0):
List all P0 gaps that block production readiness

### High Priority (P1):
List all P1 gaps that impact user experience

### Medium Priority (P2):
List all P2 enhancements for better quality

### Low Priority (P3):
List all P3 nice-to-have features

### Recommended Implementation Order:
1. Fix P0 gaps first (blocking issues)
2. Fix P1 gaps (UX issues)
3. Enhance P2 gaps (quality)
4. Consider P3 gaps (future)

---

## EXAMPLE USAGE:

**For Challenge Entity:**
Replace {ENTITY_NAME} with "Challenge" throughout this prompt.

**For Pilot Entity:**
Replace {ENTITY_NAME} with "Pilot" throughout this prompt.

**For Solution Entity:**
Replace {ENTITY_NAME} with "Solution" throughout this prompt.

---

## QUICK REFERENCE: ALL ENTITIES TO AUDIT

**Core Entities (13):** User, Municipality, Challenge, Solution, Pilot, Program, RDProject, RDCall, Sandbox, LivingLab, Organization, Provider, Partnership, MatchmakerApplication

**Reference Data (8):** Region, City, Sector, Subsector, KPIReference, Tag, Service, MIIDimension

**Relationships (10):** ChallengeSolutionMatch, ChallengeRelation, ChallengeTag, ChallengeKPILink, PilotKPI, PilotKPIDatapoint, ScalingPlan, ScalingReadiness, SolutionCase, LivingLabBooking

**Workflow (17):** PilotApproval, PilotIssue, PilotDocument, RDProposal, ProgramApplication, SandboxApplication, SandboxIncident, RegulatoryExemption, SandboxProjectMilestone, SandboxCollaborator, ExemptionAuditLog, SandboxMonitoringData, MatchmakerEvaluationSession, RoleRequest, PilotExpense, LivingLabResourceBooking, ChallengeActivity

**Content (10):** KnowledgeDocument, CaseStudy, NewsArticle, TrendEntry, GlobalTrend, PlatformInsight, ChallengeAttachment, CitizenIdea, CitizenVote, CitizenFeedback

**Communications (11):** Message, Notification, ChallengeComment, PilotComment, ProgramComment, SolutionComment, RDProjectComment, RDCallComment, RDProposalComment, StakeholderFeedback, UserNotificationPreference

**Analytics (6):** MIIResult, UserActivity, SystemActivity, AccessLog, UserSession, PlatformInsight

**User Access (11):** UserProfile, StartupProfile, ResearcherProfile, ExpertProfile, ExpertAssignment, ExpertEvaluation, ExpertPanel, UserInvitation, UserAchievement, Achievement, DelegationRule, Role, Team

**Strategy (2):** StrategicPlan, Task

**System (1):** PlatformConfig

**Policy & Evaluation (5):** PolicyRecommendation, PolicyTemplate, ApprovalRequest, EvaluationTemplate, PolicyComment

**Citizen Engagement (6):** CitizenIdea, CitizenVote, CitizenFeedback, IdeaComment, CitizenPoints, CitizenBadge, CitizenNotification, CitizenPilotEnrollment

**Innovation Proposals (2):** InnovationProposal, ChallengeProposal, ChallengeInterest

**Solution Ecosystem (3):** DemoRequest, SolutionInterest, SolutionReview

**Startup System (2):** StartupVerification, ProviderAward

**Sandbox System (1):** SandboxCertification

**Municipality Services (1):** ServicePerformance

**Citizen Participation (1):** CitizenDataCollection

**Living Labs (1):** LabSolutionCertification

**Organization System (2):** OrganizationVerification, OrganizationPerformanceReview

**Taxonomy (1):** TaxonomyVersion

**Sandbox Exit (1):** SandboxExitEvaluation

**TOTAL: 106 ENTITIES**

---

## FINAL CHECKLIST BEFORE MARKING COMPLETE ✅

- [ ] All 13 phases validated
- [ ] All gaps documented with priority
- [ ] All missing components listed
- [ ] Implementation plan created
- [ ] Effort estimated (hours/days)
- [ ] Dependencies identified
- [ ] Blockers documented
- [ ] Test criteria defined
- [ ] Coverage report updated
- [ ] All trackers updated

**READY FOR IMPLEMENTATION:** YES/NO

---

**🎯 BOTTOM LINE:**
This prompt ensures {ENTITY_NAME} achieves PLATINUM STANDARD (100%) like Challenge, Pilot, and Solution modules.`;

  const quickPrompt = `Audit {ENTITY_NAME} entity:
1. Check entity schema (DataModelDocumentation)
2. Verify pages exist: {ENTITY_NAME}s, Create, Detail, Edit
3. Validate workflows: 4 gates configured, UnifiedWorkflowApprovalTab integrated
4. Check AI features: Creation AI, Matching AI, Prediction AI, Analysis AI
5. Verify conversions: All input/output paths working
6. Expert evaluation: 8-dimension scorecard, ExpertAssignment
7. RBAC: All permissions defined, pages protected, RLS working
8. Integration: All related entities linked, comments, attachments, activity log
9. Bilingual: All text in t(), all fields _ar/_en, RTL layout
10. Critical gaps: Visibility workflow, taxonomy linkage, closure workflows

Score: ___/100
P0 gaps: ___
P1 gaps: ___
Ready: YES/NO`;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t({ en: '🎯 Entity Audit Prompt Template', ar: '🎯 قالب موجه تدقيق الكيان' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Comprehensive audit checklist - just replace {ENTITY_NAME} with any entity', ar: 'قائمة تدقيق شاملة - استبدل {ENTITY_NAME} بأي كيان' })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">13</p>
            <p className="text-xs text-slate-600">{t({ en: 'Audit Phases', ar: 'مراحل التدقيق' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">150+</p>
            <p className="text-xs text-slate-600">{t({ en: 'Checkpoints', ar: 'نقاط فحص' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">106</p>
            <p className="text-xs text-slate-600">{t({ en: 'Entities', ar: 'كيانات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">8</p>
            <p className="text-xs text-slate-600">{t({ en: 'Trackers', ar: 'متتبعات' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Zap className="h-6 w-6" />
              {t({ en: '⚡ Quick Prompt (30 seconds)', ar: '⚡ موجه سريع (30 ثانية)' })}
            </CardTitle>
            <Button onClick={() => copyToClipboard(quickPrompt, 'quick')}>
              <Copy className="h-4 w-4 mr-2" />
              {copiedSection === 'quick' ? '✓ Copied' : t({ en: 'Copy', ar: 'نسخ' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
            {quickPrompt}
          </pre>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="h-6 w-6" />
              {t({ en: '📋 Complete Audit Prompt (13 Phases)', ar: '📋 موجه التدقيق الكامل (13 مرحلة)' })}
            </CardTitle>
            <Button onClick={() => copyToClipboard(auditPromptTemplate, 'full')}>
              <Copy className="h-4 w-4 mr-2" />
              {copiedSection === 'full' ? '✓ Copied' : t({ en: 'Copy', ar: 'نسخ' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre-wrap">
            {auditPromptTemplate}
          </pre>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Brain className="h-6 w-6" />
            {t({ en: '🔍 How to Use This Prompt', ar: '🔍 كيفية استخدام هذا الموجه' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">1</div>
              <div>
                <p className="font-semibold text-purple-900">Copy the prompt</p>
                <p className="text-sm text-slate-700">Use Quick Prompt for fast audit or Complete Prompt for thorough analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">2</div>
              <div>
                <p className="font-semibold text-purple-900">Replace {'{ENTITY_NAME}'} with actual entity</p>
                <p className="text-sm text-slate-700">Example: Replace with "Challenge", "Pilot", "Solution", "Program", etc.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">3</div>
              <div>
                <p className="font-semibold text-purple-900">Run audit with AI assistant</p>
                <p className="text-sm text-slate-700">Paste into AI chat (ChatGPT, Claude, etc.)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">4</div>
              <div>
                <p className="font-semibold text-purple-900">Review findings and create gaps list</p>
                <p className="text-sm text-slate-700">AI will identify all missing components, gaps, and improvements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">5</div>
              <div>
                <p className="font-semibold text-purple-900">Implement P0 gaps immediately</p>
                <p className="text-sm text-slate-700">Fix critical blockers before moving to next entity</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-purple-300">
            <p className="font-bold text-purple-900 mb-2">📝 Example Replacement:</p>
            <div className="space-y-2 text-sm">
              <p className="text-slate-700">
                <span className="font-mono bg-red-100 px-2 py-1 rounded">Audit {'{ENTITY_NAME}'} entity</span>
                <span className="mx-2">→</span>
                <span className="font-mono bg-green-100 px-2 py-1 rounded">Audit Challenge entity</span>
              </p>
              <p className="text-slate-700">
                <span className="font-mono bg-red-100 px-2 py-1 rounded">{'{ENTITY_NAME}'}Detail page</span>
                <span className="mx-2">→</span>
                <span className="font-mono bg-green-100 px-2 py-1 rounded">ChallengeDetail page</span>
              </p>
              <p className="text-slate-700">
                <span className="font-mono bg-red-100 px-2 py-1 rounded">{'{ENTITY_NAME}'}ActivityLog</span>
                <span className="mx-2">→</span>
                <span className="font-mono bg-green-100 px-2 py-1 rounded">ChallengeActivityLog</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Users className="h-6 w-6" />
            {t({ en: '📋 Audit Order Recommendation', ar: '📋 ترتيب التدقيق الموصى به' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border-l-4 border-red-600">
              <p className="font-bold text-red-900 mb-2">Priority 1: Core Pipeline Entities (6)</p>
              <div className="flex flex-wrap gap-2">
                {['Challenge', 'Solution', 'Pilot', 'ScalingPlan', 'MatchmakerApplication', 'PolicyRecommendation'].map(e => (
                  <Badge key={e} className="bg-red-100 text-red-700">{e}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-orange-600">
              <p className="font-bold text-orange-900 mb-2">Priority 2: Programs & R&D (4)</p>
              <div className="flex flex-wrap gap-2">
                {['Program', 'RDProject', 'RDCall', 'RDProposal'].map(e => (
                  <Badge key={e} className="bg-orange-100 text-orange-700">{e}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-yellow-600">
              <p className="font-bold text-yellow-900 mb-2">Priority 3: Testing Infrastructure (3)</p>
              <div className="flex flex-wrap gap-2">
                {['Sandbox', 'LivingLab', 'SandboxApplication'].map(e => (
                  <Badge key={e} className="bg-yellow-100 text-yellow-700">{e}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-blue-600">
              <p className="font-bold text-blue-900 mb-2">Priority 4: Citizen Engagement (3)</p>
              <div className="flex flex-wrap gap-2">
                {['CitizenIdea', 'InnovationProposal', 'ChallengeProposal'].map(e => (
                  <Badge key={e} className="bg-blue-100 text-blue-700">{e}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-green-600">
              <p className="font-bold text-green-900 mb-2">Priority 5: Organizations & Identity (4)</p>
              <div className="flex flex-wrap gap-2">
                {['Organization', 'Municipality', 'UserProfile', 'StartupProfile'].map(e => (
                  <Badge key={e} className="bg-green-100 text-green-700">{e}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-purple-600">
              <p className="font-bold text-purple-900 mb-2">Priority 6: Remaining Entities (86)</p>
              <p className="text-sm text-slate-700">Audit all reference, workflow, content, communication, analytics entities</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-4 border-blue-400 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-6 pb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t({ en: '🎯 Your Workflow', ar: '🎯 سير عملك' })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                <p className="font-bold mb-2">1. Copy Prompt</p>
                <p className="text-xs opacity-90">Quick or Complete</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                <p className="font-bold mb-2">2. Replace Name</p>
                <p className="text-xs opacity-90">{'{ENTITY_NAME}'} → Challenge</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                <p className="font-bold mb-2">3. Run Audit</p>
                <p className="text-xs opacity-90">AI analyzes entity</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                <p className="font-bold mb-2">4. Fix P0 Gaps</p>
                <p className="text-xs opacity-90">Critical issues first</p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                <p className="font-bold mb-2">5. Next Entity</p>
                <p className="text-xs opacity-90">Repeat for all 106</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(EntityAuditPromptTemplate, { requireAdmin: true });
