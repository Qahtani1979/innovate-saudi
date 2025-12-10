# Edge Functions Documentation

This document provides a comprehensive overview of all edge functions in the Saudi Innovates platform, their purposes, parameters, and where they are used.

---

## Table of Contents

1. [AI & Machine Learning Functions](#ai--machine-learning-functions)
2. [Notification Functions](#notification-functions)
3. [Approval Workflow Functions](#approval-workflow-functions)
4. [Automation Functions](#automation-functions)
5. [Scoring & Analytics Functions](#scoring--analytics-functions)
6. [Security & RBAC Functions](#security--rbac-functions)
7. [Utility Functions](#utility-functions)

---

## AI & Machine Learning Functions

### 1. `generateEmbeddings`
**File:** `functions/generateEmbeddings.ts`  
**JWT Required:** No  
**Purpose:** Generates vector embeddings for entities using Google's text-embedding-004 model for semantic search.

**Parameters:**
```typescript
{
  entity_name: string; // 'Challenge' | 'Solution' | 'KnowledgeDocument' | 'CitizenIdea' | 'Organization' | 'Pilot' | 'RDProject'
  entity_ids?: string[]; // Specific IDs to process
  mode?: 'all' | 'missing'; // Process all or only entities without embeddings
}
```

**Returns:**
```typescript
{
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  results: Array<{ id: string; success: boolean; dimensions?: number; error?: string }>;
}
```

**Used In:**
- `src/pages/PolicyCreate.jsx` - Auto-generate embeddings after policy creation
- `src/pages/KnowledgeDocumentEdit.jsx` - Generate embeddings after document update
- `src/pages/OrganizationCreate.jsx` - Embed new organizations
- `src/components/solutions/SolutionCreateWizard.jsx` - Embed new solutions

---

### 2. `semanticSearch`
**File:** `functions/semanticSearch.ts`  
**JWT Required:** No  
**Purpose:** Performs semantic similarity search across entities using vector embeddings.

**Parameters:**
```typescript
{
  query: string; // Search query text
  entity_name: string; // 'Challenge' | 'Solution' | 'KnowledgeDocument' | 'CitizenIdea' | 'Organization'
  limit?: number; // Max results (default: 10)
  threshold?: number; // Minimum similarity score (default: 0.7)
}
```

**Returns:**
```typescript
{
  success: boolean;
  query: string;
  entity_name: string;
  results: Array<{ ...entity, similarity_score: number }>;
  total_candidates: number;
  matches_found: number;
}
```

**Used In:**
- `src/components/solutions/SolutionCreateWizard.jsx` - Find matching challenges
- `src/components/solutions/CompetitiveAnalysisTab.jsx` - Find similar solutions

---

### 3. `translatePolicy`
**File:** `functions/translatePolicy.ts`  
**JWT Required:** No  
**Purpose:** Translates Arabic policy documents to formal English using AI while preserving legal terminology.

**Parameters:**
```typescript
{
  arabic_fields: {
    title_ar?: string;
    recommendation_text_ar?: string;
    implementation_steps?: Array<{ ar: string }>;
    success_metrics?: Array<{ metric_ar: string; target: string; unit: string }>;
    stakeholder_involvement_ar?: string;
  }
}
```

**Returns:**
```typescript
{
  title_en: string;
  recommendation_text_en: string;
  implementation_steps: Array<{ ar: string; en: string }>;
  success_metrics: Array<{ metric_ar: string; metric_en: string; target: string; unit: string }>;
  stakeholder_involvement_en: string;
  translation_metadata: { last_translated: string; translation_version: number };
}
```

**Used In:**
- `src/pages/PolicyCreate.jsx` - Translate new policies
- `src/pages/PolicyEdit.jsx` - Translate updated policies
- `src/components/challenges/PolicyWorkflow.jsx` - Inline translation

---

### 4. `autoGenerateSuccessStory`
**File:** `functions/autoGenerateSuccessStory.ts`  
**JWT Required:** No  
**Purpose:** Uses AI to generate bilingual (EN/AR) case studies for successfully completed pilots.

**Parameters:**
```typescript
{
  pilot_id: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  case_study_id: string;
  message: string;
}
```

**Used In:** Called programmatically when pilots reach 'completed' or 'scaled' stage.

---

### 5. `publicationsAutoTracker`
**File:** `functions/publicationsAutoTracker.ts`  
**JWT Required:** No  
**Purpose:** Uses AI with internet context to find and track academic publications by R&D project researchers.

**Parameters:**
```typescript
{
  rdProjectId: string;
  researcherNames: string[];
}
```

**Returns:**
```typescript
{
  success: boolean;
  rdProjectId: string;
  newPublicationsFound: number;
  duplicatesSkipped: number;
  totalPublications: number;
}
```

**Used In:** Admin dashboard for R&D project management.

---

### 6. Strategy Generator Functions

#### `strategyLabResearchGenerator`
**File:** `functions/strategyLabResearchGenerator.ts`  
**JWT Required:** No  
**Purpose:** AI generates living lab research priorities based on strategic plans.

#### `strategyProgramThemeGenerator`
**File:** `functions/strategyProgramThemeGenerator.ts`  
**JWT Required:** No  
**Purpose:** AI generates innovation program campaign themes from strategic plans.

#### `strategyRDCallGenerator`
**File:** `functions/strategyRDCallGenerator.ts`  
**JWT Required:** No  
**Purpose:** AI generates R&D call focus areas based on strategic gaps.

#### `strategySandboxPlanner`
**File:** `functions/strategySandboxPlanner.ts`  
**JWT Required:** No  
**Purpose:** AI identifies sectors needing regulatory sandbox infrastructure.

**Common Parameters:**
```typescript
{
  strategicPlanId: string;
}
```

**Used In:** Strategic planning workflow pages.

---

### 7. `weeklyIdeasReport`
**File:** `functions/weeklyIdeasReport.ts`  
**JWT Required:** No  
**Purpose:** Generates AI insights from weekly citizen ideas and emails report to admins.

**Parameters:** None (runs as scheduled job)

**Returns:**
```typescript
{
  success: boolean;
  ideas_analyzed: number;
  emails_sent: number;
}
```

---

## Notification Functions

### 1. `citizenNotifications`
**File:** `functions/citizenNotifications.ts`  
**JWT Required:** No  
**Purpose:** Sends notifications to citizens about idea status changes (submitted, under review, approved, converted, resolved).

**Parameters:**
```typescript
{
  eventType: 'idea_submitted' | 'idea_under_review' | 'idea_approved' | 'idea_converted' | 'challenge_resolved';
  ideaId?: string;
  challengeId?: string;
  pilotId?: string;
  citizenEmail: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  notification_id: string;
}
```

---

### 2. `autoNotificationTriggers`
**File:** `functions/autoNotificationTriggers.ts`  
**JWT Required:** No  
**Purpose:** Handles automatic notifications on entity status changes (ideas, challenges, pilots).

**Parameters:**
```typescript
{
  entity_name: string;
  entity_id: string;
  old_status: string;
  new_status: string;
  citizen_email: string;
}
```

---

### 3. `evaluationNotifications`
**File:** `functions/evaluationNotifications.ts`  
**JWT Required:** No  
**Purpose:** Sends notifications for evaluation workflow events (expert assigned, evaluation submitted, consensus reached).

**Parameters:**
```typescript
{
  event_type: 'expert_assigned' | 'evaluation_submitted' | 'consensus_reached';
  entity_type: string;
  entity_id: string;
  expert_email?: string;
  submitter_email?: string;
}
```

---

### 4. `providerMatchNotifications`
**File:** `functions/providerMatchNotifications.ts`  
**JWT Required:** No  
**Purpose:** Notifies solution providers about new challenges matching their solutions via semantic search.

**Parameters:** None (runs as scheduled job)

**Returns:**
```typescript
{
  success: boolean;
  notifications_sent: number;
  total_matches: number;
  details: Array<{ solution_id: string; solution_name: string; match_count: number; provider_email: string }>;
}
```

---

## Approval Workflow Functions

### 1. `approveDelegation`
**File:** `functions/approveDelegation.ts`  
**JWT Required:** Yes (Admin only)  
**Purpose:** Approves or rejects delegation requests and notifies delegators.

**Parameters:**
```typescript
{
  delegationId: string;
  approved: boolean;
}
```

**Used In:**
- `src/components/access/DelegationApprovalQueue.jsx`
- `src/components/rbac/DelegationApprovalQueue.jsx`

---

### 2. `budgetApproval`
**File:** `functions/budgetApproval.ts`  
**JWT Required:** Yes  
**Purpose:** Handles pilot budget approval workflow (request, approve, reject).

**Parameters:**
```typescript
{
  action: 'request' | 'approve' | 'reject';
  pilot_id: string;
  phase: string;
  amount: number;
  comments?: string;
}
```

---

### 3. `checkConsensus`
**File:** `functions/checkConsensus.ts`  
**JWT Required:** No  
**Purpose:** Checks if expert evaluators have reached consensus and updates entity status.

**Parameters:**
```typescript
{
  entity_type: 'rd_proposal' | 'program_application' | 'matchmaker_application' | 'citizen_idea' | 'challenge' | 'solution' | 'pilot' | 'scaling_plan';
  entity_id: string;
}
```

**Used In:**
- `src/pages/EvaluationPanel.jsx`
- `src/pages/MatchmakerEvaluationHub.jsx`
- `src/pages/PilotEvaluations.jsx`
- `src/pages/ApplicationReviewHub.jsx`

---

### 4. `initiativeLaunch`
**File:** `functions/initiativeLaunch.ts`  
**JWT Required:** Yes  
**Purpose:** Handles launch approval workflow for pilots, programs, and R&D calls.

**Parameters:**
```typescript
{
  action: 'submit' | 'approve' | 'reject';
  entity_type: 'pilot' | 'program' | 'rd_call';
  entity_id: string;
  comments?: string;
  checklist?: object;
}
```

---

### 5. `strategicPlanApproval`
**File:** `functions/strategicPlanApproval.ts`  
**JWT Required:** Yes  
**Purpose:** Handles strategic plan approval workflow.

**Parameters:**
```typescript
{
  action: 'submit' | 'approve' | 'reject';
  plan_id: string;
  comments?: string;
}
```

**Used In:**
- `src/pages/StrategicPlanApprovalGate.jsx`

---

### 6. `portfolioReview`
**File:** `functions/portfolioReview.ts`  
**JWT Required:** Yes  
**Purpose:** Handles quarterly portfolio review workflow.

**Parameters:**
```typescript
{
  action: 'create' | 'approve' | 'request_revision';
  review_id?: string;
  review_data?: { period: string; quarter: number; year: number; budget_utilization?: number; recommendations?: string[] };
  comments?: string;
  decisions?: object;
}
```

**Used In:**
- `src/pages/PortfolioReviewGate.jsx`

---

## Automation Functions

### 1. `alumniAutomation`
**File:** `functions/alumniAutomation.ts`  
**JWT Required:** No  
**Purpose:** Automates post-graduation processes: mentor invitations for high performers, impact tracking setup.

**Parameters:** None (processes all eligible graduates)

**Returns:**
```typescript
{
  status: 'success';
  results: { processed: number; mentor_invites: number; showcase_added: number; impact_tracking_started: number };
}
```

---

### 2. `autoExpertAssignment`
**File:** `functions/autoExpertAssignment.ts`  
**JWT Required:** No  
**Purpose:** AI-powered expert assignment based on sector matching and workload balancing.

**Parameters:**
```typescript
{
  entity_type: string;
  entity_id: string;
  assignment_type: string;
  sector?: string;
}
```

---

### 3. `autoMatchmakerEnrollment`
**File:** `functions/autoMatchmakerEnrollment.ts`  
**JWT Required:** No  
**Purpose:** Auto-enrolls solution providers into Matchmaker program after solution verification.

**Parameters:**
```typescript
{
  solution_id: string;
}
```

**Used In:**
- `src/components/SolutionVerificationWizard.jsx`

---

### 4. `autoProgramStartupLink`
**File:** `functions/autoProgramStartupLink.ts`  
**JWT Required:** No  
**Purpose:** Auto-creates startup profiles for program graduates.

**Parameters:**
```typescript
{
  program_application_id: string;
}
```

---

### 5. `autoRoleAssignment`
**File:** `functions/autoRoleAssignment.ts`  
**JWT Required:** Yes  
**Purpose:** Automatically assigns roles based on user profile (organization type, expertise areas).

**Parameters:**
```typescript
{
  user_id?: string;
  user_email?: string;
}
```

---

### 6. `challengeRDBacklink`
**File:** `functions/challengeRDBacklink.ts`  
**JWT Required:** No  
**Purpose:** Auto-updates Challenge.linked_rd_ids when R&D entities reference challenges.

**Parameters:** None (runs as scheduled job)

---

### 7. `pointsAutomation`
**File:** `functions/pointsAutomation.ts`  
**JWT Required:** No  
**Purpose:** Awards gamification points and badges to citizens based on activity.

**Parameters:**
```typescript
{
  eventType: 'idea_submitted' | 'vote_received' | 'idea_converted' | 'comment_posted' | 'challenge_resolved';
  ideaId?: string;
  citizenEmail: string;
}
```

---

### 8. `slaAutomation`
**File:** `functions/slaAutomation.ts`  
**JWT Required:** No  
**Purpose:** Auto-calculates SLA due dates and escalates overdue challenges.

**Parameters:** None (runs as scheduled job)

**Returns:**
```typescript
{
  success: boolean;
  updated: number;
  escalations: number;
  message: string;
}
```

---

### 9. `programSLAAutomation`
**File:** `functions/programSLAAutomation.ts`  
**JWT Required:** No  
**Purpose:** Monitors program SLAs and sends alerts for breaches.

---

## Scoring & Analytics Functions

### 1. `calculateOrganizationReputation`
**File:** `functions/calculateOrganizationReputation.ts`  
**JWT Required:** No  
**Purpose:** Calculates weighted reputation scores for organizations based on delivery quality, timeliness, innovation, satisfaction, and impact.

**Parameters:** None (processes all organizations)

**Returns:**
```typescript
{
  success: boolean;
  updated: number;
  message: string;
}
```

---

### 2. `calculateStartupReputation`
**File:** `functions/calculateStartupReputation.ts`  
**JWT Required:** No  
**Purpose:** Calculates reputation scores for startup profiles.

**Parameters:**
```typescript
{
  startup_profile_id: string;
}
```

---

### 3. `strategicPriorityScoring`
**File:** `functions/strategicPriorityScoring.ts`  
**JWT Required:** No  
**Purpose:** Calculates strategic priority scores for entities based on strategic plan linkage.

**Parameters:**
```typescript
{
  entityType: string;
  entityId: string;
}
```

---

### 4. `strategySectorGapAnalysis`
**File:** `functions/strategySectorGapAnalysis.ts`  
**JWT Required:** No  
**Purpose:** Analyzes sector gaps in innovation pipelines vs strategic priorities.

**Parameters:** None

**Returns:**
```typescript
{
  success: boolean;
  gapAnalysis: Array<{ sector: string; gapScore: number; challenges: number; pilots: number; solutions: number; isStrategicPriority: boolean }>;
  summary: object;
}
```

---

### 5. `miiCitizenIntegration`
**File:** `functions/miiCitizenIntegration.ts`  
**JWT Required:** No  
**Purpose:** Calculates citizen engagement metrics and updates municipality MII scores.

**Parameters:**
```typescript
{
  municipality_id: string;
}
```

---

## Security & RBAC Functions

### 1. `validatePermission`
**File:** `functions/validatePermission.ts`  
**JWT Required:** Yes  
**Purpose:** Backend middleware to validate if user has required permission (via role or delegation).

**Parameters:**
```typescript
{
  permission: string;
  userId?: string;
}
```

**Returns:**
```typescript
{
  hasPermission: boolean;
  source: 'role' | 'delegation' | 'admin' | 'none';
  roles: string[];
}
```

---

### 2. `checkFieldSecurity`
**File:** `functions/checkFieldSecurity.ts`  
**JWT Required:** Yes  
**Purpose:** Filters sensitive fields from data based on user roles.

**Parameters:**
```typescript
{
  entityType: string;
  fields: string[];
  data: object;
}
```

---

### 3. `runRBACSecurityAudit`
**File:** `functions/runRBACSecurityAudit.ts`  
**JWT Required:** Yes (Admin only)  
**Purpose:** Runs comprehensive RBAC security audit to identify issues.

**Parameters:** None

**Returns:**
```typescript
{
  success: boolean;
  audit: {
    timestamp: string;
    summary: { totalUsers: number; usersWithoutRoles: number; totalRoles: number; unusedRoles: number; activeDelegations: number; expiredDelegations: number; permissionConflicts: number };
    findings: { usersWithoutRoles: string[]; unusedRoles: string[]; expiredDelegations: object[]; permissionConflicts: object[] };
    recommendations: string[];
  };
}
```

---

## Utility Functions

### 1. `searchImages`
**File:** `functions/searchImages.ts`  
**JWT Required:** No  
**Purpose:** Searches Unsplash for royalty-free images.

**Parameters:**
```typescript
{
  searchQuery: string;
  page?: number;
}
```

**Returns:**
```typescript
{
  success: boolean;
  images: Array<{ url: string; thumbnail: string; credit: string; description: string; source: string; photographer: string; photographerUrl: string }>;
  total: number;
}
```

---

## Function Deployment Status

All functions are configured in `supabase/config.toml`:

| Function | JWT Verification |
|----------|-----------------|
| invoke-llm | ❌ No |
| send-email | ❌ No |
| extract-file-data | ❌ No |
| generate-image | ❌ No |
| chat-agent | ✅ Yes |
| generate-embeddings | ❌ No |
| semantic-search | ❌ No |
| translate-policy | ❌ No |
| check-consensus | ❌ No |
| citizen-notifications | ❌ No |
| role-request-notification | ❌ No |
| approve-delegation | ✅ Yes |
| validate-permission | ✅ Yes |
| check-field-security | ✅ Yes |
| budget-approval | ✅ Yes |
| initiative-launch | ✅ Yes |
| auto-notification-triggers | ❌ No |
| search-images | ❌ No |
| auto-matchmaker-enrollment | ❌ No |
| enroll-municipality-training | ❌ No |
| evaluation-notifications | ❌ No |
| points-automation | ❌ No |
| sla-automation | ❌ No |
| calculate-organization-reputation | ❌ No |
| auto-expert-assignment | ❌ No |
| challenge-rd-backlink | ❌ No |
| alumni-automation | ❌ No |
| auto-generate-success-story | ❌ No |
| auto-program-startup-link | ❌ No |
| auto-role-assignment | ✅ Yes |
| calculate-startup-reputation | ❌ No |
| mii-citizen-integration | ❌ No |
| portfolio-review | ✅ Yes |
| program-sla-automation | ❌ No |
| provider-match-notifications | ❌ No |
| publications-auto-tracker | ❌ No |
| run-rbac-security-audit | ✅ Yes |
| strategic-plan-approval | ✅ Yes |
| strategic-priority-scoring | ❌ No |
| strategy-lab-research-generator | ❌ No |
| strategy-program-theme-generator | ❌ No |
| strategy-rd-call-generator | ❌ No |
| strategy-sandbox-planner | ❌ No |
| strategy-sector-gap-analysis | ❌ No |
| weekly-ideas-report | ❌ No |

---

## Integration Patterns

### AI Integration
Functions using `base44.integrations.Core.InvokeLLM`:
- `autoGenerateSuccessStory` - Case study generation
- `publicationsAutoTracker` - Academic publication search
- `strategyLabResearchGenerator` - Research theme generation
- `strategyProgramThemeGenerator` - Program theme generation
- `strategyRDCallGenerator` - R&D call focus areas
- `strategySandboxPlanner` - Sandbox recommendations
- `translatePolicy` - Arabic to English translation
- `weeklyIdeasReport` - Weekly insights generation

### Email Integration
Functions using `base44.integrations.Core.SendEmail`:
- `alumniAutomation` - Mentor invitations
- `approveDelegation` - Delegation status notifications
- `autoMatchmakerEnrollment` - Matchmaker welcome email
- `autoNotificationTriggers` - Status change emails
- `autoProgramStartupLink` - Startup profile creation email
- `budgetApproval` - Budget request/approval emails
- `citizenNotifications` - Citizen status emails
- `evaluationNotifications` - Expert/submitter emails
- `initiativeLaunch` - Launch approval emails
- `portfolioReview` - Review workflow emails
- `providerMatchNotifications` - Match opportunity emails
- `slaAutomation` - Escalation alerts
- `strategicPlanApproval` - Plan status emails
- `weeklyIdeasReport` - Admin reports

---

## Scheduled Jobs

Functions intended for cron scheduling:
1. `slaAutomation` - Check SLA breaches daily
2. `weeklyIdeasReport` - Send weekly on Sundays
3. `providerMatchNotifications` - Run daily to match new challenges
4. `challengeRDBacklink` - Run periodically to sync links
5. `calculateOrganizationReputation` - Run nightly to update scores

---

*Last updated: December 2024*
