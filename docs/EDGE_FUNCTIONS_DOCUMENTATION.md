# Supabase Edge Functions Documentation

> **Saudi Innovates Municipal Innovation Platform**  
> Complete reference for all 47 deployed edge functions in `supabase/functions/`

---

## Overview

All edge functions are deployed to Supabase and accessible via:
```
https://wneorgiqyvkkjmqootpe.supabase.co/functions/v1/{function-name}
```

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ useAIWithFallback│    │ base44Client.js │                     │
│  │     Hook        │    │ Compatibility   │                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      ▼                                           │
│         supabase.functions.invoke()                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Edge Functions                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  invoke-llm  │ │  send-email  │ │ chat-agent   │ ...        │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  External APIs: Lovable AI Gateway, Resend, Unsplash            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                             │
│  Tables, RLS Policies, Database Functions                        │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration

All functions are configured in `supabase/config.toml`:

```toml
[functions.function-name]
verify_jwt = true  # Requires authentication
# or
verify_jwt = false # Public endpoint
```

---

## Quick Reference

| Function | Auth | Category | External API |
|----------|------|----------|--------------|
| `invoke-llm` | ❌ | AI | Lovable AI |
| `chat-agent` | ✅ | AI | Lovable AI |
| `public-idea-ai` | ❌ | AI | Lovable AI |
| `generate-embeddings` | ❌ | AI | Lovable AI |
| `semantic-search` | ❌ | AI | Lovable AI |
| `translate-policy` | ❌ | AI | Lovable AI |
| `generate-image` | ❌ | AI | Lovable AI |
| `extract-file-data` | ❌ | AI | Lovable AI |
| `auto-generate-success-story` | ❌ | AI | Lovable AI |
| `strategy-lab-research-generator` | ❌ | AI | Lovable AI |
| `strategy-program-theme-generator` | ❌ | AI | Lovable AI |
| `strategy-rd-call-generator` | ❌ | AI | Lovable AI |
| `strategy-sandbox-planner` | ❌ | AI | Lovable AI |
| `strategy-sector-gap-analysis` | ❌ | AI | Lovable AI |
| `weekly-ideas-report` | ❌ | AI | Lovable AI |
| `send-email` | ❌ | Email | Resend |
| `send-welcome-email` | ❌ | Email | Resend |
| `role-request-notification` | ❌ | Email | Resend |
| `citizen-notifications` | ❌ | Notification | - |
| `auto-notification-triggers` | ❌ | Notification | - |
| `evaluation-notifications` | ❌ | Notification | - |
| `provider-match-notifications` | ❌ | Notification | - |
| `approve-delegation` | ✅ | Approval | - |
| `budget-approval` | ✅ | Approval | - |
| `check-consensus` | ❌ | Approval | - |
| `initiative-launch` | ✅ | Approval | - |
| `strategic-plan-approval` | ✅ | Approval | - |
| `portfolio-review` | ✅ | Approval | - |
| `alumni-automation` | ❌ | Automation | - |
| `auto-expert-assignment` | ❌ | Automation | - |
| `auto-matchmaker-enrollment` | ❌ | Automation | - |
| `auto-program-startup-link` | ❌ | Automation | - |
| `enroll-municipality-training` | ❌ | Automation | - |
| `points-automation` | ❌ | Automation | - |
| `sla-automation` | ❌ | Automation | - |
| `program-sla-automation` | ❌ | Automation | - |
| `publications-auto-tracker` | ❌ | Automation | - |
| `calculate-organization-reputation` | ❌ | Analytics | - |
| `calculate-startup-reputation` | ❌ | Analytics | - |
| `strategic-priority-scoring` | ❌ | Analytics | - |
| `auto-role-assignment` | ✅ | Security | - |
| `validate-permission` | ✅ | Security | - |
| `check-field-security` | ✅ | Security | - |
| `run-rbac-security-audit` | ✅ | Security | - |
| `search-images` | ❌ | Utility | Unsplash |
| `mii-citizen-integration` | ❌ | Utility | - |
| `challenge-rd-backlink` | ❌ | Utility | - |

---

## Environment Variables

| Secret | Required By | Purpose |
|--------|-------------|---------|
| `SUPABASE_URL` | All | Database connection |
| `SUPABASE_SERVICE_ROLE_KEY` | All | Admin database access |
| `LOVABLE_API_KEY` | AI functions | Lovable AI Gateway |
| `RESEND_API_KEY` | Email functions | Email delivery |
| `UNSPLASH_ACCESS_KEY` | `search-images` | Image search |
| `GOOGLE_API_KEY` | Future use | Google services |

---

## AI & Machine Learning Functions

### `invoke-llm`
**The core AI function** used by all components via `useAIWithFallback` hook.

**Features:**
- ✅ Rate limiting per user/session with database tracking
- ✅ Role-based limits (admin: unlimited, staff: higher, citizen: standard, anonymous: lowest)
- ✅ JSON schema support via tool calling
- ✅ 80% usage warning emails
- ✅ Proper 429/402 error handling

**Request:**
```typescript
{
  prompt: string;
  response_json_schema?: object;  // For structured output
  system_prompt?: string;
  session_id?: string;  // For anonymous rate limiting
}
```

**Response:**
```typescript
{
  // AI response (parsed JSON if schema provided, or string)
  ...result,
  rate_limit_info: {
    user_type: 'admin' | 'staff' | 'citizen' | 'anonymous';
    daily_limit: number;
    daily_used: number;
    daily_remaining: number;
  }
}
```

---

### `chat-agent`
**Conversational AI** with persistent message history for strategic advisory.

**Features:**
- ✅ JWT authentication required
- ✅ Conversation history from `ai_messages` table
- ✅ Agent-specific system prompts (strategicAdvisor)
- ✅ Real-time message storage

**Request:**
```typescript
{
  conversationId: string;
  message: string;
  agentName: string;  // 'strategicAdvisor'
}
```

---

### `public-idea-ai`
**Public citizen idea analysis** - generates structured submissions from raw ideas.

**Features:**
- ✅ No authentication required (public portal)
- ✅ Session-based rate limiting
- ✅ Response caching (7 days) to reduce costs
- ✅ Bilingual output (EN/AR)

**Request:**
```typescript
{
  idea: string;  // Min 20 characters
  municipality?: string;
  session_id?: string;
  user_type?: string;
}
```

**Response:**
```typescript
{
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  tags_en: string[];
  tags_ar: string[];
  impact_score: number;  // 0-100
  feasibility_score: number;  // 0-100
  ai_summary_en: string;
  ai_summary_ar: string;
  _cached: boolean;
  _rate_limit: object;
}
```

---

### `semantic-search`
**AI-powered search** across entities using keyword extraction.

**Request:**
```typescript
{
  query: string;
  entity_type?: 'challenges' | 'solutions' | 'pilots' | 'rd_projects';
  limit?: number;  // Default: 10
  threshold?: number;  // Default: 0.5
}
```

**Response:**
```typescript
{
  success: boolean;
  query: string;
  results: Array<{
    entity_type: string;
    entity_id: string;
    title: string;
    score: number;  // 0-1 relevance
    data: object;
  }>;
}
```

---

### `generate-embeddings`
**Metadata extraction** from text content (keywords, themes, summary, sector tags).

**Request:**
```typescript
{
  entity_type: string;
  entity_id: string;
  content: string;
  title?: string;
}
```

---

### `translate-policy`
**Bilingual translation** optimized for formal policy documents.

**Request:**
```typescript
{
  text: string;
  source_lang?: 'en' | 'ar';  // Default: 'en'
  target_lang?: 'en' | 'ar';  // Default: 'ar'
  context?: string;
}
```

---

### `generate-image`
**AI image generation** using Gemini 2.5 Flash Image model.

**Request:**
```typescript
{
  prompt: string;
}
```

**Response:**
```typescript
{
  url: string | null;
  success: boolean;
}
```

---

### Strategy Generator Functions

All use similar patterns - AI generates strategic content from plans/parameters.

| Function | Purpose |
|----------|---------|
| `strategy-lab-research-generator` | Generate research priorities |
| `strategy-program-theme-generator` | Generate program themes |
| `strategy-rd-call-generator` | Generate R&D call focus areas |
| `strategy-sandbox-planner` | Plan regulatory sandbox initiatives |
| `strategy-sector-gap-analysis` | Analyze sector gaps |

---

## Email & Notification Functions

### `send-email`
**Generic email sending** via Resend API.

**Request:**
```typescript
{
  to: string | string[];
  subject: string;
  body?: string;  // Plain text
  html?: string;  // HTML content
}
```

**Response:**
```typescript
{
  success: boolean;
  id?: string;  // Resend email ID
  error?: string;
}
```

---

### `send-welcome-email`
**Persona-specific welcome emails** with role-based content.

**Features:**
- ✅ Beautiful HTML templates
- ✅ Bilingual (EN/AR)
- ✅ Persona-specific benefits and next steps
- ✅ Logs sent emails to database

**Request:**
```typescript
{
  userId: string;
  userEmail: string;
  userName: string;
  persona: 'municipality_staff' | 'provider' | 'researcher' | 'citizen' | 'expert';
  language?: 'en' | 'ar';
}
```

---

### `role-request-notification`
**Role request workflow emails** - submission, approval, rejection.

**Features:**
- ✅ User notifications with status updates
- ✅ Admin notifications for new requests
- ✅ In-app notifications created
- ✅ Beautiful HTML templates with RTL support

**Request:**
```typescript
{
  type: 'submitted' | 'approved' | 'rejected';
  request_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  requested_role: string;
  justification?: string;
  rejection_reason?: string;
  language?: 'en' | 'ar';
  notify_admins?: boolean;
}
```

---

### `citizen-notifications`
**In-app notifications** stored in `citizen_notifications` table.

**Request:**
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

### `auto-notification-triggers`
**Status change notifications** - automatically notifies followers/stakeholders.

**Request:**
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

## Approval Workflow Functions

### `approve-delegation`
**Delegation rule approval** - approves/rejects delegation requests.

**Request:**
```typescript
{
  delegation_id: string;
  action?: 'approve' | 'reject';
  approved?: boolean;
  comments?: string;
}
```

---

### `budget-approval`
**Pilot budget workflow** - creates approval records and updates pilot status.

**Request:**
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

### `check-consensus`
**Expert evaluation consensus** - calculates if evaluators agree.

**Request:**
```typescript
{
  entity_type: string;
  entity_id: string;
  required_approvals?: number;
  threshold?: number;
}
```

**Response:**
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

### `initiative-launch`
**Launch/rejection workflow** for pilots, programs, R&D projects.

**Request:**
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

## Automation Functions

### `points-automation`
**Gamification points system** - awards points for actions.

**Points Configuration:**
| Action | Points |
|--------|--------|
| `idea_submitted` | 10 |
| `idea_approved` | 25 |
| `idea_converted_challenge` | 50 |
| `idea_converted_pilot` | 100 |
| `vote_cast` | 2 |
| `vote_received` | 5 |
| `comment_posted` | 3 |
| `feedback_submitted` | 5 |
| `challenge_resolved` | 100 |
| `pilot_completed` | 200 |
| `badge_earned` | 50 |

**Request:**
```typescript
{
  user_id?: string;
  user_email?: string;
  action: string;
  points_override?: number;
  metadata?: object;
}
```

**Response:**
```typescript
{
  success: boolean;
  points_awarded: number;
  total_points: number;
  total_earned: number;
  level: number;
}
```

---

### `sla-automation`
**SLA monitoring** - checks deadlines and escalates overdue items.

**SLA Days by Priority:**
| Priority | Days |
|----------|------|
| critical | 3 |
| high | 7 |
| medium | 14 |
| low | 21 |

**Request:**
```typescript
{
  entity_type: string;
  check_all?: boolean;
}
```

---

### `auto-expert-assignment`
**Smart expert matching** - assigns experts based on sector and workload.

**Request:**
```typescript
{
  entity_type: string;
  entity_id: string;
  sector_id?: string;
  expertise_required?: string[];
}
```

---

## Security & RBAC Functions

### `validate-permission`
**Permission check** - validates if user can perform action.

**Request:**
```typescript
{
  user_id?: string;
  user_email?: string;
  permission: string;
  resource?: string;
  action?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  allowed: boolean;
  roles: string[];
  reason: string;
}
```

---

### `check-field-security`
**Field-level access** - validates read/write access to specific fields.

**Security Levels:**
- `restricted`: Admin only
- `sensitive`: Admin + authorized staff
- `public`: All authenticated users

**Request:**
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

## Utility Functions

### `search-images`
**Image search** via Unsplash API with fallback to placeholders.

**Request:**
```typescript
{
  query: string;
  per_page?: number;
  page?: number;
}
```

---

### `challenge-rd-backlink`
**Bidirectional linking** - syncs challenge↔R&D project references.

**Request:**
```typescript
{
  challenge_id?: string;
  rd_project_id?: string;
  sync_all?: boolean;
}
```

---

## Error Handling

All functions follow consistent error patterns:

```typescript
// Success
{ success: true, ...data }

// Rate limit (429)
{ error: "Rate limit exceeded", rate_limit_info: {...} }

// Payment required (402)
{ error: "AI credits exhausted" }

// Server error (500)
{ error: "Error message" }
```

---

## Frontend Integration

### Via Compatibility Layer

```typescript
import { base44 } from '@/api/base44Client';

// AI calls
const result = await base44.integrations.Core.InvokeLLM({
  prompt: "...",
  response_json_schema: {...}
});

// Email
await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "...",
  html: "..."
});

// File upload
const { file_url } = await base44.integrations.Core.UploadFile({ file });
```

### Via Direct Function Invoke

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { ...params }
});
```

---

## Deployment

All edge functions are **automatically deployed** when code is pushed. No manual deployment required.

To test locally:
```bash
supabase functions serve function-name --env-file .env.local
```

---

## Monitoring

- **Logs**: Available in Supabase Dashboard → Edge Functions → Logs
- **Metrics**: Function invocations, errors, latency
- **Rate Limits**: Tracked in `ai_usage_tracking` table
- **Errors**: Logged with `console.error()` for debugging

---

## AI Prompt Architecture

All AI prompts are centralized in `src/lib/ai/prompts/` for maintainability and consistency.

### Migration Status: ✅ 100% Complete

| Metric | Count |
|--------|-------|
| **Prompt Modules** | 85 directories |
| **Total Prompts** | ~340 prompts |
| **Inline Prompts Remaining** | 0 |
| **Components Using Centralized Prompts** | 100% |

### Prompt Module Structure

Each module follows a consistent pattern:

```
src/lib/ai/prompts/
├── {module}/
│   ├── index.js           # Module exports
│   ├── {feature}.js       # Feature-specific prompts
│   └── ...
└── index.js               # Central export point
```

### Prompt File Pattern

```javascript
/**
 * {Feature} AI Prompts
 * @module {module}/{feature}
 */

export const {FEATURE}_SYSTEM_PROMPT = `System instructions...`;

export function build{Feature}Prompt(context) {
  return `User prompt with ${context}...`;
}

export const {FEATURE}_SCHEMA = {
  type: 'object',
  properties: { ... }
};
```

### Key Prompt Modules by Category

| Category | Modules | Prompt Count |
|----------|---------|--------------|
| **Strategy** | strategyWizard, strategyModule | 45 |
| **Innovation Pipeline** | challenges, pilots, rd, scaling | 50 |
| **Matchmaking** | matchmaker, solution, solutions | 24 |
| **Citizen Engagement** | citizen, feedback, onboarding | 15 |
| **Programs** | programs, sandbox, livinglab | 26 |
| **Analytics** | data, reports, benchmarks, forecasting | 11 |
| **Communications** | communications, notifications, translation | 13 |
| **Governance** | approval, gates, compliance, security | 11 |
| **Content** | content, documents, media, templates | 8 |
| **Utilities** | core, profiles, geography, taxonomy | 19 |
| **Other** | 40+ specialized modules | ~118 |

### Using Prompts in Code

```javascript
// Import from central index
import { 
  CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  buildChallengeAnalysisPrompt,
  CHALLENGE_ANALYSIS_SCHEMA 
} from '@/lib/ai/prompts';

// Or import from specific module
import { 
  buildChallengeAnalysisPrompt 
} from '@/lib/ai/prompts/challenges';

// Use with AI hook
const { data } = await invokeAI({
  systemPrompt: CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  prompt: buildChallengeAnalysisPrompt(challengeData),
  schema: CHALLENGE_ANALYSIS_SCHEMA
});
```

### Saudi Context Integration

All prompts integrate with Saudi municipal context:

```javascript
import { getSystemPrompt, buildPromptWithContext } from '@/lib/saudiContext';

export const MY_SYSTEM_PROMPT = getSystemPrompt('feature_name', `
  Base system prompt here...
`);

export function buildMyPrompt(data) {
  return buildPromptWithContext(`
    Prompt text...
  `, data);
}
```

### Bilingual Output Support

Many prompts generate bilingual (EN/AR) output:

```javascript
export const SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' }
  }
};
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | 47 edge functions documented |
| 1.1.0 | Dec 2025 | AI prompt architecture added (340 prompts, 85 modules) |
