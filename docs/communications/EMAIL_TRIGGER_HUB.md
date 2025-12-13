# Email Trigger Hub - Technical Reference

## Overview

The `email-trigger-hub` is the **unified entry point** for all automated email sending across the Saudi Innovates platform. It provides a single, consistent API for triggering emails based on platform events, with automatic template lookup, variable extraction, preference checking, and queue management.

**Last Updated**: 2025-12-13

---

## Current Statistics

| Metric | Count |
|--------|-------|
| Active Triggers | 96 |
| Trigger Categories | 20+ |
| Integrated Components | 41+ |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                           │
│  ┌─────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐ │
│  │  useEmailTrigger()  │     │   Direct Invoke     │     │  CampaignManager │ │
│  │       Hook          │     │   supabase.invoke   │     │    Component     │ │
│  └──────────┬──────────┘     └──────────┬──────────┘     └────────┬─────────┘ │
└─────────────┼────────────────────────────┼───────────────────────┼────────────┘
              │                            │                       │
              ▼                            ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                           EDGE FUNCTIONS                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                        email-trigger-hub                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Trigger    │  │   Template   │  │   Variable   │  │  Preference │  │  │
│  │  │   Lookup     │──│   Fetching   │──│  Extraction  │──│   Check     │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────┬──────┘  │  │
│  └───────────────────────────────────────────────────────────────┼──────────┘  │
│                                                                  │             │
│  ┌────────────────┐                  ┌─────────────────┐        │             │
│  │ campaign-sender│                  │  queue-processor │◀──(cron every 5min) │
│  │  (bulk/batch)  │                  │  (delayed emails)│                     │
│  └───────┬────────┘                  └────────┬─────────┘                     │
│          │                                    │                               │
│          ▼                                    ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           send-email                                      │  │
│  │           (HTML builder, Resend integration, logging)                    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           Resend API                                      │  │
│  │                      (Email Delivery Service)                            │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                        resend-webhook                                     │  │
│  │           (Delivery tracking: opens, clicks, bounces)                    │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Interface

### Basic Request

```typescript
interface EmailTriggerRequest {
  // Required: The trigger key (e.g., 'challenge.approved')
  trigger: string;
  
  // Optional: Entity context
  entity_type?: string;
  entity_id?: string;
  entity_data?: Record<string, any>;
  
  // Optional: Recipient overrides
  recipient_email?: string;
  recipient_user_id?: string;
  additional_recipients?: string[];
  
  // Optional: Variable overrides
  variables?: Record<string, string>;
  
  // Optional: Behavior flags
  skip_preferences?: boolean;
  force_send?: boolean;
  delay_seconds?: number;
}
```

### Response Interface

```typescript
interface EmailTriggerResponse {
  success: boolean;
  processed: number;
  errors?: Array<{
    recipient: string;
    error: string;
  }>;
  queued?: boolean;
  message?: string;
}
```

---

## Usage Examples

### 1. Using the React Hook (Recommended)

```tsx
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

function ChallengeApprovalHandler() {
  const { triggerEmail, triggerBatch } = useEmailTrigger();

  const handleApprove = async (challenge) => {
    // Trigger single email
    const result = await triggerEmail('challenge.approved', {
      entity_type: 'challenge',
      entity_id: challenge.id,
      entity_data: challenge,
    });

    if (result.success) {
      toast.success('Notification sent');
    }
  };

  const handleBulkApprove = async (challenges) => {
    // Trigger multiple emails
    const results = await triggerBatch(
      challenges.map(c => ({
        trigger: 'challenge.approved',
        options: {
          entity_type: 'challenge',
          entity_id: c.id,
          entity_data: c,
        }
      }))
    );
  };
}
```

### 2. Direct Edge Function Call

```typescript
const { data, error } = await supabase.functions.invoke('email-trigger-hub', {
  body: {
    trigger: 'pilot.milestone_completed',
    entity_type: 'pilot',
    entity_id: 'uuid-here',
    entity_data: {
      name_en: 'Smart Traffic Pilot',
      milestone_name: 'Phase 1 Complete',
      pilot_lead_email: 'lead@municipality.gov',
    },
  },
});
```

### 3. With Explicit Recipients

```typescript
await triggerEmail('task.assigned', {
  entity_type: 'task',
  entity_id: task.id,
  entity_data: task,
  recipient_email: 'specific@email.com',
  additional_recipients: ['manager@email.com', 'team@email.com'],
});
```

### 4. With Delayed Sending

```typescript
await triggerEmail('pilot.feedback_request', {
  entity_type: 'pilot',
  entity_id: pilot.id,
  entity_data: pilot,
  delay_seconds: 3600, // Send in 1 hour
});
```

### 5. Bypass User Preferences (Critical Emails)

```typescript
await triggerEmail('auth.password_reset', {
  recipient_email: user.email,
  variables: {
    userName: user.name,
    resetUrl: resetLink,
  },
  skip_preferences: true, // Always send
});
```

---

## Complete Trigger Key Reference

### Authentication (`auth.*`) - 7 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `auth.signup` | `welcome_new_user` | New user registration |
| `auth.password_reset` | `password_reset` | Password reset request |
| `auth.password_changed` | `password_changed` | Password change confirmation |
| `auth.email_verification` | `email_verification` | Email verification |
| `auth.login_new_device` | `login_new_device` | New device login alert |
| `auth.account_locked` | `account_locked` | Account locked notification |
| `auth.account_suspended` | `account_suspended_admin` | Admin suspended account |

### Challenges (`challenge.*`) - 8 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `challenge.submitted` | `challenge_submitted` | Challenge submission |
| `challenge.approved` | `challenge_approved` | Challenge approved |
| `challenge.rejected` | `challenge_rejected` | Challenge rejected |
| `challenge.assigned` | `challenge_assigned` | Assigned for review |
| `challenge.escalated` | `challenge_escalated` | Escalated to manager |
| `challenge.status_changed` | `challenge_status_change` | Status update |
| `challenge.match_found` | `challenge_match_found` | Solution matched |
| `challenge.needs_info` | `challenge_needs_info` | Additional info needed |

### Pilots (`pilot.*`) - 9 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `pilot.created` | `pilot_created` | New pilot created |
| `pilot.status_changed` | `pilot_status_change` | Status update |
| `pilot.milestone_completed` | `pilot_milestone_completed` | Milestone achieved |
| `pilot.completed` | `pilot_completed` | Pilot finished |
| `pilot.extended` | `pilot_extended` | Pilot extension approved |
| `pilot.enrollment_confirmed` | `pilot_enrollment_confirmed` | Citizen enrolled |
| `pilot.feedback_request` | `pilot_feedback_request` | Feedback requested |

### Solutions (`solution.*`) - 7 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `solution.submitted` | `solution_submitted` | Solution submitted |
| `solution.verified` | `solution_verified` | Solution verified |
| `solution.published` | `solution_published` | Published to marketplace |
| `solution.interest_received` | `solution_interest_received` | Interest expressed |
| `solution.interest_expressed` | `solution_interest_expressed` | User expressed interest |
| `solution.matched` | `solution_matched` | Matched to challenge |
| `solution.deprecated` | `solution_deprecated` | Solution deprecated |

### Programs (`program.*`) - 6 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `program.application_received` | `program_application_received` | Application received |
| `program.application_status` | `program_application_status` | Status update |
| `program.accepted` | `program_accepted` | Accepted to program |
| `program.rejected` | `program_rejected` | Not accepted |
| `program.deadline_reminder` | `program_deadline_reminder` | Deadline reminder |

### Tasks (`task.*`) - 4 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `task.assigned` | `task_assigned` | Task assigned |
| `task.due_reminder` | `task_due_reminder` | Due date reminder |
| `task.overdue` | `task_overdue` | Task overdue |
| `task.completed` | `task_completed` | Task completed |

### Events (`event.*`) - 5 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `event.invitation` | `event_invitation` | Event invitation |
| `event.reminder` | `event_reminder` | Event reminder |
| `event.registration_confirmed` | `event_registration_confirmed` | Registration confirmed |
| `event.updated` | `event_updated` | Event details changed |
| `event.cancelled` | `event_cancelled` | Event cancelled |

### Roles (`role.*`) - 2 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `role.approved` | `role_request_approved` | Role request approved |
| `role.rejected` | `role_request_rejected` | Role request rejected |

### Citizen (`citizen.*`) - 4 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `citizen.signup` | `citizen_welcome` | Citizen registration |
| `citizen.badge_earned` | `badge_earned` | Badge unlocked |
| `citizen.level_up` | `level_up` | New level reached |
| `citizen.points_expiring` | `points_expiring` | Points about to expire |

### Ideas (`idea.*`) - 3 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `idea.submitted` | `idea_submitted` | Idea submitted |
| `idea.approved` | `idea_approved` | Idea approved |
| `idea.converted` | `idea_converted` | Idea became challenge |

### Contracts (`contract.*`) - 4 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `contract.created` | `contract_created` | Contract generated |
| `contract.pending_signature` | `contract_pending_signature` | Awaiting signature |
| `contract.signed` | `contract_signed` | Contract signed |
| `contract.expiring` | `contract_expiring` | Contract expiring soon |

### Contact (`contact.*`) - 2 triggers

| Trigger Key | Template Key | Description |
|-------------|--------------|-------------|
| `contact.form` | `contact_form_received` | Contact form received |
| `contact.form_confirmation` | `contact_form_confirmation` | Confirmation to sender |

### Additional Triggers

| Category | Triggers |
|----------|----------|
| `proposal.*` | submitted, accepted, rejected, revision_requested |
| `evaluation.*` | assigned, reminder, completed |
| `feedback.*` | requested, received |
| `panel.*` | invitation, reminder |
| `partnership.*` | proposal |
| `dashboard.*` | shared |
| `waitlist.*` | promoted |
| `living_lab.*` | booking_confirmed, booking_reminder |
| `finance.*` | invoice_issued, payment_received, payment_overdue |
| `announcement.*` | send |
| `campaign.*` | newsletter_send, announcement_send, etc. |

---

## Database Tables

### `email_trigger_config`

Configuration for each trigger key:

| Column | Type | Description |
|--------|------|-------------|
| `trigger_key` | VARCHAR | Unique trigger identifier |
| `template_key` | VARCHAR | Associated template |
| `is_active` | BOOLEAN | Enable/disable trigger |
| `recipient_field` | VARCHAR | Field in entity_data for recipient |
| `variable_mapping` | JSONB | Maps template vars to entity fields |
| `respect_preferences` | BOOLEAN | Check user preferences |
| `priority` | INTEGER | 1=critical, 2=high, 3=normal |
| `delay_seconds` | INTEGER | Default delay before sending |
| `additional_recipient_fields` | TEXT[] | Extra recipient fields |

### `email_queue`

Delayed email storage:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `trigger_key` | VARCHAR | Trigger used |
| `template_key` | VARCHAR | Template to use |
| `recipient_email` | VARCHAR | Recipient address |
| `variables` | JSONB | Interpolation data |
| `scheduled_for` | TIMESTAMPTZ | When to send |
| `status` | VARCHAR | pending, processing, sent, failed |
| `created_at` | TIMESTAMPTZ | Queue time |

---

## Queue Processing

Delayed emails are processed by the `queue-processor` edge function, which runs every 5 minutes via cron.

### Cron Job Configuration

```sql
-- Job name: process-email-queue
-- Schedule: */5 * * * * (every 5 minutes)
```

### Queue States

```
pending ──▶ processing ──▶ sent
              │
              └──▶ failed (with retry)
```

---

## User Preferences

The trigger hub automatically respects user notification preferences stored in `user_notification_preferences`:

| Preference | Category Mapping |
|------------|------------------|
| `email_categories.challenges` | challenge.* triggers |
| `email_categories.pilots` | pilot.* triggers |
| `email_categories.tasks` | task.* triggers |
| `email_categories.events` | event.* triggers |
| `email_categories.authentication` | auth.* triggers (critical) |
| `email_notifications` | Master switch |

To bypass preferences for critical emails:
```typescript
skip_preferences: true
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Template not found` | Invalid trigger/template key | Check template exists |
| `No recipients` | No email found | Provide explicit recipient |
| `User opted out` | Preference disabled | Use skip_preferences if critical |
| `Rate limited` | Too many emails | Implement backoff |
| `Invalid email` | Malformed address | Validate before sending |

### Error Response

```typescript
{
  success: false,
  processed: 0,
  errors: [
    { recipient: "user@example.com", error: "Template not found: invalid_key" }
  ]
}
```

---

## Best Practices

1. **Use the hook** - `useEmailTrigger()` provides consistent error handling
2. **Include entity_data** - Allows automatic variable extraction
3. **Respect preferences** - Only bypass for critical/transactional emails
4. **Add delays** - Use for feedback requests to avoid immediate spam
5. **Log errors** - Track failed sends for debugging
6. **Test templates** - Use the Communications Hub preview before deployment

---

## Webhook Tracking

The `resend-webhook` edge function tracks email delivery:

| Event | Action |
|-------|--------|
| `email.delivered` | Update delivery timestamp |
| `email.opened` | Track opens |
| `email.clicked` | Track link clicks |
| `email.bounced` | Mark as bounced |
| `email.complained` | Disable marketing for user |

---

## Migration from Legacy

All email sending should now go through `email-trigger-hub`. Legacy patterns to avoid:

```typescript
// ❌ LEGACY - Don't use
await supabase.functions.invoke('send-email', {...});
await base44.integrations.sendEmail({...});

// ✅ CURRENT - Use this
await triggerEmail('trigger.key', options);
```

---

## Related Documentation

- [Email Template System](./EMAIL_TEMPLATE_SYSTEM.md) - Template catalog and structure
- [Campaign System](./CAMPAIGN_SYSTEM.md) - Bulk email campaigns
- [Communication System](./COMMUNICATION_SYSTEM.md) - Architecture overview
- [Email Trigger Integration](./EMAIL_TRIGGER_INTEGRATION.md) - Integration guide
