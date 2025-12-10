# Supabase Edge Functions Documentation

This document provides a comprehensive overview of all **47 Supabase edge functions** in the `supabase/functions/` directory. These are the active, migrated versions from the legacy Base44 platform.

> **Note**: The `functions/` directory contains legacy Base44 functions that are no longer in use. All active edge functions are in `supabase/functions/`.

---

## Quick Reference

| Function | JWT Required | Category |
|----------|-------------|----------|
| `alumni-automation` | No | Automation |
| `approve-delegation` | Yes | Approval Workflow |
| `auto-expert-assignment` | No | Automation |
| `auto-generate-success-story` | No | AI & ML |
| `auto-matchmaker-enrollment` | No | Automation |
| `auto-notification-triggers` | No | Notification |
| `auto-program-startup-link` | No | Automation |
| `auto-role-assignment` | Yes | Security & RBAC |
| `budget-approval` | Yes | Approval Workflow |
| `calculate-organization-reputation` | No | Scoring & Analytics |
| `calculate-startup-reputation` | No | Scoring & Analytics |
| `challenge-rd-backlink` | No | Utility |
| `chat-agent` | Yes | AI & ML |
| `check-consensus` | No | Approval Workflow |
| `check-field-security` | Yes | Security & RBAC |
| `citizen-notifications` | No | Notification |
| `enroll-municipality-training` | No | Automation |
| `evaluation-notifications` | No | Notification |
| `extract-file-data` | No | AI & ML |
| `generate-embeddings` | No | AI & ML |
| `generate-image` | No | AI & ML |
| `initiative-launch` | Yes | Approval Workflow |
| `invoke-llm` | No | AI & ML |
| `mii-citizen-integration` | No | Utility |
| `points-automation` | No | Automation |
| `portfolio-review` | Yes | Approval Workflow |
| `program-sla-automation` | No | Automation |
| `provider-match-notifications` | No | Notification |
| `public-idea-ai` | No | AI & ML |
| `publications-auto-tracker` | No | AI & ML |
| `role-request-notification` | No | Notification |
| `run-rbac-security-audit` | Yes | Security & RBAC |
| `search-images` | No | Utility |
| `semantic-search` | No | AI & ML |
| `send-email` | No | Notification |
| `send-welcome-email` | No | Notification |
| `sla-automation` | No | Automation |
| `strategic-plan-approval` | Yes | Approval Workflow |
| `strategic-priority-scoring` | No | Scoring & Analytics |
| `strategy-lab-research-generator` | No | AI & ML |
| `strategy-program-theme-generator` | No | AI & ML |
| `strategy-rd-call-generator` | No | AI & ML |
| `strategy-sandbox-planner` | No | AI & ML |
| `strategy-sector-gap-analysis` | No | AI & ML |
| `translate-policy` | No | AI & ML |
| `validate-permission` | Yes | Security & RBAC |
| `weekly-ideas-report` | No | AI & ML |

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

### 1. `generate-embeddings`
**Path:** `supabase/functions/generate-embeddings/index.ts`  
**JWT Required:** No  
**Purpose:** Generates metadata (keywords, themes, summary, sector tags) from text content using Lovable AI.

**Parameters:**
```typescript
{
  entity_type: string;
  entity_id: string;
  content: string;
  title?: string;
}
```

**Returns:**
```typescript
{
  entity_type: string;
  entity_id: string;
  keywords: string[];
  themes: string[];
  summary: string;
  sector_tags: string[];
}
```

---

### 2. `semantic-search`
**Path:** `supabase/functions/semantic-search/index.ts`  
**JWT Required:** No  
**Purpose:** Performs semantic similarity search across entities.

---

### 3. `translate-policy`
**Path:** `supabase/functions/translate-policy/index.ts`  
**JWT Required:** No  
**Purpose:** Translates text between English and Arabic using AI, optimized for formal policy documents.

**Parameters:**
```typescript
{
  text: string;
  source_lang?: string; // 'en' | 'ar' (default: 'en')
  target_lang?: string; // 'en' | 'ar' (default: 'ar')
  context?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  original_text: string;
  translated_text: string;
}
```

---

### 4. `auto-generate-success-story`
**Path:** `supabase/functions/auto-generate-success-story/index.ts`  
**JWT Required:** No  
**Purpose:** Generates success stories for entities (pilots, solutions, programs) using AI.

**Parameters:**
```typescript
{
  entity_type: 'pilot' | 'solution' | 'program';
  entity_id: string;
  metrics?: object;
}
```

---

### 5. `publications-auto-tracker`
**Path:** `supabase/functions/publications-auto-tracker/index.ts`  
**JWT Required:** No  
**Purpose:** Tracks and reports publications for entities.

**Actions:** `track_publication`, `update_metrics`, `increment_views`, `get_report`

---

### 6. `extract-file-data`
**Path:** `supabase/functions/extract-file-data/index.ts`  
**JWT Required:** No  
**Purpose:** Extracts structured data from files using AI.

**Parameters:**
```typescript
{
  file_url: string;
  json_schema?: object;
}
```

---

### 7. `generate-image`
**Path:** `supabase/functions/generate-image/index.ts`  
**JWT Required:** No  
**Purpose:** Generates images using Lovable AI (Gemini 2.5 Flash Image model).

**Parameters:**
```typescript
{
  prompt: string;
}
```

**Returns:**
```typescript
{
  url: string | null;
  success: boolean;
}
```

---

### 8. `invoke-llm`
**Path:** `supabase/functions/invoke-llm/index.ts`  
**JWT Required:** No  
**Purpose:** General-purpose LLM invocation endpoint.

---

### 9. `chat-agent`
**Path:** `supabase/functions/chat-agent/index.ts`  
**JWT Required:** Yes  
**Purpose:** AI chat agent for conversational interactions.

---

### 10. `public-idea-ai`
**Path:** `supabase/functions/public-idea-ai/index.ts`  
**JWT Required:** No  
**Purpose:** AI assistance for public citizen idea submissions.

---

### 11. `weekly-ideas-report`
**Path:** `supabase/functions/weekly-ideas-report/index.ts`  
**JWT Required:** No  
**Purpose:** Generates weekly reports of citizen ideas for municipalities.

**Parameters:**
```typescript
{
  municipality_id?: string;
  week_start?: string;
  week_end?: string;
}
```

---

### 12. Strategy Generator Functions

#### `strategy-lab-research-generator`
**Path:** `supabase/functions/strategy-lab-research-generator/index.ts`  
**Purpose:** Generates strategic research briefs using AI.

#### `strategy-program-theme-generator`
**Path:** `supabase/functions/strategy-program-theme-generator/index.ts`  
**Purpose:** Generates strategic program themes.

#### `strategy-rd-call-generator`
**Path:** `supabase/functions/strategy-rd-call-generator/index.ts`  
**Purpose:** Generates R&D call focus areas.

#### `strategy-sandbox-planner`
**Path:** `supabase/functions/strategy-sandbox-planner/index.ts`  
**Purpose:** Plans regulatory sandbox initiatives.

#### `strategy-sector-gap-analysis`
**Path:** `supabase/functions/strategy-sector-gap-analysis/index.ts`  
**Purpose:** Analyzes sector gaps for strategic planning.

---

## Notification Functions

### 1. `citizen-notifications`
**Path:** `supabase/functions/citizen-notifications/index.ts`  
**JWT Required:** No  
**Purpose:** Creates notifications for citizens in the `citizen_notifications` table.

**Parameters:**
```typescript
{
  user_id?: string;
  user_email?: string;
  notification_type: string;
  title: string;
  message?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: object;
}
```

---

### 2. `auto-notification-triggers`
**Path:** `supabase/functions/auto-notification-triggers/index.ts`  
**JWT Required:** No  
**Purpose:** Handles automatic notifications based on trigger types (status changes, entity updates).

**Parameters:**
```typescript
{
  trigger_type: string;
  entity_type?: string;
  entity_id?: string;
  recipients?: string[];
  data?: object;
}
```

---

### 3. `evaluation-notifications`
**Path:** `supabase/functions/evaluation-notifications/index.ts`  
**JWT Required:** No  
**Purpose:** Sends evaluation-related notifications to recipients.

**Parameters:**
```typescript
{
  entity_type: string;
  entity_id: string;
  notification_type: string;
  recipients: string[];
  evaluation_data?: object;
}
```

---

### 4. `provider-match-notifications`
**Path:** `supabase/functions/provider-match-notifications/index.ts`  
**JWT Required:** No  
**Purpose:** Handles provider match notifications for challenges.

**Actions:** `notify_match`, `get_matches`, `accept_match`, `decline_match`

---

### 5. `role-request-notification`
**Path:** `supabase/functions/role-request-notification/index.ts`  
**JWT Required:** No  
**Purpose:** Sends notifications for role access requests.

---

### 6. `send-email`
**Path:** `supabase/functions/send-email/index.ts`  
**JWT Required:** No  
**Purpose:** Sends emails via Resend API.

**Parameters:**
```typescript
{
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
}
```

---

### 7. `send-welcome-email`
**Path:** `supabase/functions/send-welcome-email/index.ts`  
**JWT Required:** No  
**Purpose:** Sends welcome emails to new users.

---

## Approval Workflow Functions

### 1. `approve-delegation`
**Path:** `supabase/functions/approve-delegation/index.ts`  
**JWT Required:** Yes  
**Purpose:** Approves or rejects delegation rules.

**Parameters:**
```typescript
{
  delegation_id: string;
  action?: string;
  approved?: boolean;
  comments?: string;
}
```

---

### 2. `budget-approval`
**Path:** `supabase/functions/budget-approval/index.ts`  
**JWT Required:** Yes  
**Purpose:** Handles pilot budget approval/rejection workflow.

**Parameters:**
```typescript
{
  action: 'approve' | 'reject';
  pilot_id: string;
  phase?: string;
  amount?: number;
  comments?: string;
  approver_email?: string;
}
```

---

### 3. `check-consensus`
**Path:** `supabase/functions/check-consensus/index.ts`  
**JWT Required:** No  
**Purpose:** Checks for expert evaluation consensus.

**Parameters:**
```typescript
{
  entity_type: string;
  entity_id: string;
  required_approvals?: number;
  threshold?: number;
}
```

**Returns:**
```typescript
{
  success: boolean;
  has_consensus: boolean;
  decision: 'approved' | 'rejected' | 'needs_revision' | 'pending';
  metrics: {
    average_score: number;
    score_std_dev: number;
    approval_rate: number;
    rejection_rate: number;
  };
  evaluations: array;
}
```

---

### 4. `initiative-launch`
**Path:** `supabase/functions/initiative-launch/index.ts`  
**JWT Required:** Yes  
**Purpose:** Handles launch/rejection of initiatives (pilots, programs, rd_projects).

**Parameters:**
```typescript
{
  action: 'launch' | 'approve' | 'reject';
  entity_type: 'pilot' | 'program' | 'rd_project';
  entity_id: string;
  comments?: string;
  launcher_email?: string;
}
```

---

### 5. `strategic-plan-approval`
**Path:** `supabase/functions/strategic-plan-approval/index.ts`  
**JWT Required:** Yes  
**Purpose:** Handles strategic plan approval workflow.

**Actions:** `approve`, `reject`, `request_changes`, `submit_for_approval`

---

### 6. `portfolio-review`
**Path:** `supabase/functions/portfolio-review/index.ts`  
**JWT Required:** Yes  
**Purpose:** Handles portfolio review operations.

**Actions:** `submit_review`, `get_portfolio_stats`, `generate_report`

---

## Automation Functions

### 1. `alumni-automation`
**Path:** `supabase/functions/alumni-automation/index.ts`  
**JWT Required:** No  
**Purpose:** Automates alumni network management.

**Actions:** `graduate`, `send_newsletter`, `track_success`

---

### 2. `auto-expert-assignment`
**Path:** `supabase/functions/auto-expert-assignment/index.ts`  
**JWT Required:** No  
**Purpose:** Automatically assigns experts to entities based on sector and workload.

**Parameters:**
```typescript
{
  entity_type: string;
  entity_id: string;
  sector_id?: string;
  expertise_required?: string[];
}
```

---

### 3. `auto-matchmaker-enrollment`
**Path:** `supabase/functions/auto-matchmaker-enrollment/index.ts`  
**JWT Required:** No  
**Purpose:** Handles matchmaker enrollment automation.

---

### 4. `auto-program-startup-link`
**Path:** `supabase/functions/auto-program-startup-link/index.ts`  
**JWT Required:** No  
**Purpose:** Links/unlinks programs with startups, auto-matches based on sector.

**Actions:** `link`, `unlink`, `auto_match`

---

### 5. `enroll-municipality-training`
**Path:** `supabase/functions/enroll-municipality-training/index.ts`  
**JWT Required:** No  
**Purpose:** Enrolls municipalities in training programs.

**Parameters:**
```typescript
{
  municipality_id: string;
  training_program_id: string;
  user_email?: string;
  participants?: string[];
}
```

---

### 6. `points-automation`
**Path:** `supabase/functions/points-automation/index.ts`  
**JWT Required:** No  
**Purpose:** Automates gamification points distribution.

---

### 7. `sla-automation`
**Path:** `supabase/functions/sla-automation/index.ts`  
**JWT Required:** No  
**Purpose:** Automates SLA checks and escalations for entities.

**Parameters:**
```typescript
{
  entity_type: string;
  check_all?: boolean;
}
```

---

### 8. `program-sla-automation`
**Path:** `supabase/functions/program-sla-automation/index.ts`  
**JWT Required:** No  
**Purpose:** Program-specific SLA automation.

**Actions:** `check_sla`, `escalate`, `update_sla`

---

## Scoring & Analytics Functions

### 1. `calculate-organization-reputation`
**Path:** `supabase/functions/calculate-organization-reputation/index.ts`  
**JWT Required:** No  
**Purpose:** Calculates reputation scores for organizations.

**Parameters:**
```typescript
{
  organization_id?: string;
  calculate_all?: boolean;
}
```

---

### 2. `calculate-startup-reputation`
**Path:** `supabase/functions/calculate-startup-reputation/index.ts`  
**JWT Required:** No  
**Purpose:** Calculates reputation scores for startups.

**Parameters:**
```typescript
{
  startup_id: string;
}
```

---

### 3. `strategic-priority-scoring`
**Path:** `supabase/functions/strategic-priority-scoring/index.ts`  
**JWT Required:** No  
**Purpose:** Calculates strategic priority scores for entities.

**Parameters:**
```typescript
{
  entity_type: string;
  entity_id: string;
  criteria: object;
}
```

---

## Security & RBAC Functions

### 1. `auto-role-assignment`
**Path:** `supabase/functions/auto-role-assignment/index.ts`  
**JWT Required:** Yes  
**Purpose:** Handles automatic role assignment for users.

**Actions:** `assign`, `revoke`, `auto_assign`

---

### 2. `validate-permission`
**Path:** `supabase/functions/validate-permission/index.ts`  
**JWT Required:** Yes  
**Purpose:** Validates user permissions for actions on resources.

**Parameters:**
```typescript
{
  user_id?: string;
  user_email?: string;
  permission: string;
  resource?: string;
  action?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  allowed: boolean;
  roles: string[];
  reason: string;
}
```

---

### 3. `check-field-security`
**Path:** `supabase/functions/check-field-security/index.ts`  
**JWT Required:** Yes  
**Purpose:** Validates field-level access permissions.

**Parameters:**
```typescript
{
  user_id?: string;
  user_email?: string;
  entity_type: string;
  field_name: string;
  action: 'read' | 'write';
}
```

---

### 4. `run-rbac-security-audit`
**Path:** `supabase/functions/run-rbac-security-audit/index.ts`  
**JWT Required:** Yes  
**Purpose:** Runs security audits on RBAC configuration.

---

## Utility Functions

### 1. `search-images`
**Path:** `supabase/functions/search-images/index.ts`  
**JWT Required:** No  
**Purpose:** Searches images via Unsplash API or returns placeholders.

**Parameters:**
```typescript
{
  query: string;
  per_page?: number;
  page?: number;
}
```

---

### 2. `mii-citizen-integration`
**Path:** `supabase/functions/mii-citizen-integration/index.ts`  
**JWT Required:** No  
**Purpose:** Handles MII Citizen service integration.

**Actions:** `sync_profile`, `verify_identity`, `get_services`, `submit_request`

---

### 3. `challenge-rd-backlink`
**Path:** `supabase/functions/challenge-rd-backlink/index.ts`  
**JWT Required:** No  
**Purpose:** Synchronizes backlinks between challenges and R&D projects.

**Parameters:**
```typescript
{
  challenge_id?: string;
  rd_project_id?: string;
  sync_all?: boolean;
}
```

---

## Configuration

All edge functions are configured in `supabase/config.toml`. JWT verification settings:

```toml
[functions.function-name]
verify_jwt = true  # or false for public endpoints
```

---

## Environment Variables / Secrets

The following secrets are available to edge functions:

| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations |
| `SUPABASE_ANON_KEY` | Anonymous key for public operations |
| `LOVABLE_API_KEY` | Lovable AI API access |
| `RESEND_API_KEY` | Email sending via Resend |
| `UNSPLASH_ACCESS_KEY` | Image search via Unsplash |
| `GOOGLE_API_KEY` | Google services integration |

---

## Legacy Functions

The `functions/` directory (root level) contains legacy Base44 functions that have been migrated. These are **no longer in use** and kept for reference only.
