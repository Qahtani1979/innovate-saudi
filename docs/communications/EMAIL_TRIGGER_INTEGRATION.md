# Email Trigger Integration Guide

## Overview

The email system uses a **unified triggering mechanism** via the `email-trigger-hub` edge function. This allows any part of the codebase to trigger emails by simply specifying a trigger key and providing entity data.

## Architecture

The email system has **two distinct flows** that share the same template infrastructure:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHARED INFRASTRUCTURE                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐    │
│  │ email_templates │     │    email_logs   │     │     Resend API      │    │
│  │   (Database)    │     │   (Database)    │     │   (Delivery)        │    │
│  └─────────────────┘     └─────────────────┘     └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                    ▲                                         ▲
                    │                                         │
    ┌───────────────┴───────────────┐       ┌─────────────────┴───────────────┐
    │      TRIGGER FLOW             │       │        CAMPAIGN FLOW            │
    │   (Event-Driven Emails)       │       │    (Bulk Marketing Emails)      │
    └───────────────────────────────┘       └─────────────────────────────────┘
                    │                                         │
    ┌───────────────┴───────────────┐       ┌─────────────────┴───────────────┐
    │   Frontend Code               │       │   Communications Hub UI         │
    │   useEmailTrigger()           │       │   Campaign Manager              │
    └───────────────────────────────┘       └─────────────────────────────────┘
                    │                                         │
                    ▼                                         ▼
    ┌───────────────────────────────┐       ┌─────────────────────────────────┐
    │    email-trigger-hub          │       │      campaign-sender            │
    │    (Edge Function)            │       │      (Edge Function)            │
    └───────────────────────────────┘       └─────────────────────────────────┘
                    │                                         │
                    ▼                                         ▼
    ┌───────────────────────────────┐       ┌─────────────────────────────────┐
    │   email_trigger_config        │       │      email_campaigns            │
    │   (Maps trigger → template)   │       │      campaign_recipients        │
    └───────────────────────────────┘       └─────────────────────────────────┘
                    │                                         │
                    ▼                                         ▼
    ┌───────────────────────────────┐       ┌─────────────────────────────────┐
    │   email_queue (optional)      │       │      (Direct send or batch)     │
    │   (Delayed Emails)            │       │                                 │
    └───────────────────────────────┘       └─────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │   queue-processor             │
    │   (Cron Triggered)            │
    └───────────────────────────────┘
```

## Triggers vs Campaigns

| Aspect | Triggers | Campaigns |
|--------|----------|-----------|
| **Purpose** | Automated event-driven emails | Manual bulk marketing emails |
| **Initiated By** | Code events (status change, etc.) | Admin via Communications Hub UI |
| **Recipients** | Single user or small group | Large audience segments |
| **Template Lookup** | Via `email_trigger_config.template_key` | Via `email_campaigns.template_id` |
| **Variables** | Extracted from entity data | Defined per campaign |
| **Examples** | Challenge approved, task assigned | Newsletter, feature announcement |
| **Edge Function** | `email-trigger-hub` | `campaign-sender` |

### When to Use Each

**Use Triggers when:**
- Email is in response to a user action or system event
- Recipients are determined by the event context
- Variables come from entity data (challenge, pilot, task, etc.)

**Use Campaigns when:**
- Sending marketing or announcement emails
- Targeting a filtered audience segment
- Admin controls timing and content

## How to Use

### 1. Using the Hook (Recommended)

```tsx
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

function ChallengeApprovalHandler() {
  const { triggerEmail } = useEmailTrigger();

  const handleApprove = async (challenge) => {
    // Approve the challenge in database
    await supabase
      .from('challenges')
      .update({ status: 'approved' })
      .eq('id', challenge.id);

    // Trigger the email
    await triggerEmail('challenge.approved', {
      entity_type: 'challenge',
      entity_id: challenge.id,
      entity_data: challenge, // The trigger hub will extract variables
    });
  };
}
```

### 2. Direct Edge Function Call

```typescript
const { data, error } = await supabase.functions.invoke('email-trigger-hub', {
  body: {
    trigger: 'pilot.status_changed',
    entity_type: 'pilot',
    entity_id: 'uuid-here',
    entity_data: {
      name_en: 'Smart Traffic Pilot',
      status: 'active',
      pilot_lead_email: 'lead@municipality.gov',
    },
  },
});
```

### 3. With Explicit Recipients

```tsx
await triggerEmail('task.assigned', {
  entity_type: 'task',
  entity_id: task.id,
  entity_data: task,
  recipient_email: 'specific@email.com', // Override auto-detection
  additional_recipients: ['cc1@email.com', 'cc2@email.com'],
});
```

### 4. With Custom Variables

```tsx
await triggerEmail('contract.expiring', {
  entity_type: 'contract',
  entity_id: contract.id,
  entity_data: contract,
  variables: {
    daysUntilExpiry: '7', // Override or add variables
    renewalLink: 'https://...',
  },
});
```

## Available Triggers

### Authentication
| Trigger Key | Template | Description |
|-------------|----------|-------------|
| `auth.signup` | welcome_new_user | New user registration |
| `auth.password_reset` | password_reset | Password reset request |
| `auth.password_changed` | password_changed | Password change confirmation |
| `auth.email_verification` | email_verification | Email verification |
| `auth.login_new_device` | login_new_device | New device login alert |
| `auth.account_locked` | account_locked | Account locked notification |
| `auth.account_suspended` | account_suspended_admin | Admin suspended account |

### Challenges
| Trigger Key | Template | Description |
|-------------|----------|-------------|
| `challenge.submitted` | challenge_submitted | Challenge submission confirmation |
| `challenge.approved` | challenge_approved | Challenge approved |
| `challenge.rejected` | challenge_rejected | Challenge rejected |
| `challenge.assigned` | challenge_assigned | Assigned for review |
| `challenge.escalated` | challenge_escalated | Escalated to higher level |
| `challenge.status_changed` | challenge_status_change | Status update |
| `challenge.match_found` | challenge_match_found | Solution match found |

### Pilots
| Trigger Key | Template | Description |
|-------------|----------|-------------|
| `pilot.created` | pilot_created | New pilot created |
| `pilot.status_changed` | pilot_status_change | Status update |
| `pilot.enrollment_confirmed` | pilot_enrollment_confirmed | Citizen enrollment |
| `pilot.feedback_request` | pilot_feedback_request | Feedback request |
| `pilot.milestone_reached` | pilot_milestone_reached | Milestone achieved |
| `pilot.completed` | pilot_completed | Pilot completed |

### Solutions
| Trigger Key | Template | Description |
|-------------|----------|-------------|
| `solution.verified` | solution_verified | Solution verified |
| `solution.submitted` | solution_submitted | Solution submitted |
| `solution.published` | solution_published | Published to marketplace |
| `solution.interest_received` | solution_interest_received | Interest expressed |

### Events
| Trigger Key | Template | Description |
|-------------|----------|-------------|
| `event.invitation` | event_invitation | Event invitation |
| `event.reminder` | event_reminder | Event reminder (24h before) |
| `event.registration_confirmed` | event_registration_confirmed | Registration confirmed |
| `event.updated` | event_updated | Event details changed |
| `event.cancelled` | event_cancelled | Event cancelled |

### Tasks
| Trigger Key | Template | Description |
|-------------|----------|-------------|
| `task.assigned` | task_assigned | Task assigned |
| `task.due_reminder` | task_reminder | Due date reminder |
| `task.overdue` | task_overdue | Task overdue |
| `task.completed` | task_completed | Task completed |

## Integration Points

Here's where to add email triggers in the codebase:

### 1. Challenge Status Changes
**File:** `src/components/challenges/ChallengeStatusUpdate.jsx`
```tsx
// After status update
await triggerEmail('challenge.status_changed', {
  entity_type: 'challenge',
  entity_id: challengeId,
  entity_data: { ...challenge, old_status: oldStatus, status: newStatus },
});
```

### 2. Pilot Creation
**File:** `src/components/pilots/PilotForm.jsx`
```tsx
// After pilot creation
await triggerEmail('pilot.created', {
  entity_type: 'pilot',
  entity_id: newPilot.id,
  entity_data: newPilot,
});
```

### 3. Task Assignment
**File:** `src/components/tasks/TaskAssignment.jsx`
```tsx
// After task assignment
await triggerEmail('task.assigned', {
  entity_type: 'task',
  entity_id: task.id,
  entity_data: { ...task, assigned_by_name: currentUser.name },
});
```

### 4. Role Approval
**File:** `src/components/admin/RoleRequestManager.jsx`
```tsx
// After role approved
await triggerEmail('role.approved', {
  entity_type: 'role_request',
  entity_id: request.id,
  entity_data: request,
});
```

## Delayed Emails

Some triggers have built-in delays:

| Trigger | Delay | Purpose |
|---------|-------|---------|
| `pilot.feedback_request` | 60 seconds | Avoid immediate request after action |
| `event.reminder` | -24 hours (scheduled) | Day-before reminder |
| `task.due_reminder` | -24 hours (scheduled) | Day-before reminder |
| `living_lab.booking_reminder` | -24 hours | Day-before reminder |

For custom delays:
```tsx
await triggerEmail('custom.trigger', {
  entity_data: data,
  delay_seconds: 3600, // 1 hour delay
});
```

## Queue Processing

Delayed emails are stored in `email_queue` and processed by the `queue-processor` edge function.

To set up automatic processing, add a cron job:

```sql
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://wneorgiqyvkkjmqootpe.supabase.co/functions/v1/queue-processor',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
    body := '{"batch_size": 50}'::jsonb
  );
  $$
);
```

## User Preferences

The trigger system automatically respects user notification preferences stored in `user_notification_preferences`.

To force send (bypass preferences):
```tsx
await triggerEmail('important.notification', {
  entity_data: data,
  skip_preferences: true, // Will send regardless of user settings
});
```

## Adding New Triggers

1. **Add the template** in Communications Hub → Templates tab
2. **Add trigger config** via database insert:
```sql
INSERT INTO email_trigger_config (
  trigger_key,
  template_key,
  is_active,
  recipient_field,
  variable_mapping,
  respect_preferences,
  priority,
  delay_seconds
) VALUES (
  'my_entity.my_action',
  'my_template_key',
  true,
  'owner_email', -- Field in entity_data containing recipient
  '{"varName": "entity_field"}'::jsonb, -- Map template vars to entity fields
  true,
  3,
  0
);
```

3. **Call the trigger** in your code:
```tsx
await triggerEmail('my_entity.my_action', {
  entity_type: 'my_entity',
  entity_id: entity.id,
  entity_data: entity,
});
```
