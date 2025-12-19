# Challenges Integration Documentation

## System Integrations

### Solutions Integration
Challenges connect to solutions through matching and proposals.

**Data Flow:**
```
Challenge → AI Matching → Solution Matches → Solution Proposals → Pilot Creation
```

**Hook:**
```javascript
import { useChallengeIntegrations } from '@/hooks/useChallengeIntegrations';

const { 
  linkedSolutions, 
  linkSolution, 
  unlinkSolution 
} = useChallengeIntegrations(challengeId);
```

**Tables:**
- `challenge_solution_matches` - AI-powered matches
- `challenge_proposals` - Solution proposals

### Pilots Integration
Approved challenges can spawn pilots.

**Data Flow:**
```
Approved Challenge → Pilot Creation → Pilot Execution → Results → Challenge Resolution
```

**Fields:**
- `challenges.linked_pilot_ids` - Array of pilot UUIDs
- `pilots.challenge_id` - Back-reference

### Programs Integration
Challenges can be grouped into programs.

**Data Flow:**
```
Multiple Challenges → Program → Coordinated Execution → Aggregate Metrics
```

**Fields:**
- `challenges.linked_program_ids` - Program associations

### R&D Integration
Research projects inform challenge understanding.

**Data Flow:**
```
R&D Findings → Challenge Evidence → Solution Validation
```

**Fields:**
- `challenges.linked_rd_ids` - Research links
- `challenges.data_evidence` - JSON evidence data

## Approval System Integration

### useApprovalRequest Hook
```javascript
const {
  createApprovalRequest,
  createApprovalRequestWithNotification,
  hasExistingApprovalRequest,
  DEFAULT_SLA_DAYS,
  DEFAULT_GATE_NAMES
} = useApprovalRequest();

// Create approval request
await createApprovalRequest({
  entityType: 'challenge',
  entityId: challenge.id,
  entityTitle: challenge.title_en,
  requesterEmail: user.email
});
```

### Approval Tables
- `approval_requests` - Main approval tracking
- `approval_request` columns used:
  - `entity_type` = 'challenge'
  - `entity_id` = challenge UUID
  - `approval_status` = pending/approved/rejected
  - `sla_due_date` = calculated deadline

## Email Integration

### email-trigger-hub Edge Function
Sends notifications for challenge events.

**Triggers:**
| Event | Template | Recipients |
|-------|----------|------------|
| challenge_submitted | challenge_submitted | reviewers |
| challenge_approved | challenge_approved | owner |
| challenge_rejected | challenge_rejected | owner |
| sla_warning | sla_warning | reviewer |

**Usage:**
```javascript
await supabase.functions.invoke('email-trigger-hub', {
  body: {
    template: 'challenge_submitted',
    to: reviewerEmails,
    data: { challengeTitle, submitterName }
  }
});
```

## AI Integration

### strategy-workflow-ai Edge Function
AI-powered workflow analysis.

**Actions:**
- `optimize_workflow` - Suggest improvements
- `predict_bottlenecks` - Identify delays
- `estimate_duration` - Time predictions
- `analyze_gate_effectiveness` - Gate metrics

**Usage:**
```javascript
const { data } = await supabase.functions.invoke('strategy-workflow-ai', {
  body: {
    action: 'optimize_workflow',
    workflowData: challenge,
    entityType: 'challenge'
  }
});
```

## Security Integration

### Row-Level Security
Challenges use RLS for access control.

**Policies:**
1. Admin full access via `is_admin()` function
2. Public read for published challenges
3. Deputyship cross-municipality read
4. Municipality staff CRUD for own data

### PII Protection
Sensitive fields use `mask_email()` function.

**Protected Fields:**
- `challenge_owner_email`
- `reviewer`
- `review_assigned_to`

**Usage in Views:**
```sql
SELECT id, title_en, mask_email(challenge_owner_email) as owner
FROM challenges
WHERE is_published = true;
```

## Analytics Integration

### Metrics Tracked
- View counts per challenge
- Citizen vote counts
- Time in each status
- SLA compliance rates

### Audit Logging
All changes logged via triggers:
- `log_challenge_changes_with_diff()` - Field changes
- `log_challenge_permission_changes()` - Access changes

## External API Integration

### Municipality Services
Challenges can link to municipality service catalog.

**Fields:**
- `challenges.service_id` - FK to services table
- `challenges.ministry_service` - Ministry identifier

### Geographic Data
Location-based challenge tracking.

**Fields:**
- `challenges.coordinates` - GeoJSON
- `challenges.city_id` - FK to cities
- `challenges.region_id` - FK to regions
