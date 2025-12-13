# Email Trigger Integration Guide

## Overview

This guide explains how to integrate email notifications into your components using the unified `email-trigger-hub` system.

**Last Updated**: 2025-12-13
**System Status**: ✅ Fully Operational
**Integration Coverage**: 94% (50/53 module integrations)

---

## Quick Start

### 1. Import the Hook

```tsx
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
```

### 2. Use in Component

```tsx
function MyComponent() {
  const { triggerEmail, triggerBatch } = useEmailTrigger();

  const handleAction = async (entity) => {
    await triggerEmail('category.action', {
      entity_type: 'entity_name',
      entity_id: entity.id,
      entity_data: entity,
    });
  };
}
```

---

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

---

## Integration Examples

### 1. Challenge Approval

```tsx
// src/components/ChallengeReviewWorkflow.jsx
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

function ChallengeReviewWorkflow({ challenge }) {
  const { triggerEmail } = useEmailTrigger();

  const handleApprove = async () => {
    // Update challenge status
    await supabase
      .from('challenges')
      .update({ status: 'approved' })
      .eq('id', challenge.id);

    // Send approval email
    await triggerEmail('challenge.approved', {
      entity_type: 'challenge',
      entity_id: challenge.id,
      entity_data: challenge,
    });
  };
}
```

### 2. Role Request Approval

```tsx
// src/components/access/RoleRequestApprovalQueue.jsx
const handleApprove = async (request) => {
  // Update request
  await supabase
    .from('approval_requests')
    .update({ approval_status: 'approved' })
    .eq('id', request.id);

  // Send approval email
  await triggerEmail('role.approved', {
    entity_type: 'role_request',
    entity_id: request.id,
    entity_data: request,
  });
};
```

### 3. Contract Creation

```tsx
// src/components/solutions/ContractGeneratorWizard.jsx
const handleCreateContract = async (contract) => {
  const { data: createdContract } = await supabase
    .from('contracts')
    .insert(contract)
    .select()
    .single();

  await triggerEmail('contract.created', {
    entity_type: 'contract',
    entity_id: createdContract.id,
    entity_data: createdContract,
  });
};
```

### 4. Event Registration

```tsx
// src/pages/EventRegistration.jsx
const handleRegister = async (event) => {
  // Create registration
  await supabase
    .from('event_registrations')
    .insert({ event_id: event.id, user_email: user.email });

  // Send confirmation
  await triggerEmail('event.registration_confirmed', {
    entity_type: 'event',
    entity_id: event.id,
    entity_data: event,
    recipient_email: user.email,
  });
};
```

### 5. With Explicit Recipients

```tsx
await triggerEmail('task.assigned', {
  entity_type: 'task',
  entity_id: task.id,
  entity_data: task,
  recipient_email: 'specific@email.com',
  additional_recipients: ['cc1@email.com', 'cc2@email.com'],
});
```

### 6. With Custom Variables

```tsx
await triggerEmail('contract.expiring', {
  entity_type: 'contract',
  entity_id: contract.id,
  entity_data: contract,
  variables: {
    daysUntilExpiry: '7',
    renewalLink: 'https://...',
  },
});
```

### 7. With Delayed Sending

```tsx
await triggerEmail('pilot.feedback_request', {
  entity_type: 'pilot',
  entity_id: pilot.id,
  entity_data: pilot,
  delay_seconds: 3600, // Send in 1 hour
});
```

### 8. Bypass User Preferences

```tsx
await triggerEmail('auth.password_reset', {
  recipient_email: user.email,
  variables: {
    userName: user.name,
    resetUrl: resetLink,
  },
  skip_preferences: true, // Critical - always send
});
```

---

## Currently Integrated Components (50+ files)

### Authentication & Onboarding
| File | Triggers |
|------|----------|
| `OnboardingWizard.jsx` | `auth.signup` |
| `PublicIdeaSubmission.jsx` | `idea.submitted` |
| `BulkUserImport.jsx` | `auth.signup` |

### Challenges
| File | Triggers |
|------|----------|
| `ChallengeCreate.jsx` | `challenge.created` |
| `Approvals.jsx` | `challenge.approved`, `challenge.rejected` |
| `Challenges.jsx` | `challenge.status_changed` |
| `SLAMonitor.jsx` | `challenge.escalated` |
| `TrackAssignment.jsx` | `challenge.assigned` |
| `ChallengeSolutionMatching.jsx` | `challenge.match_found`, `solution.matched` |

### Pilots
| File | Triggers |
|------|----------|
| `PilotCreate.jsx` | `pilot.created` |
| `ProposalToPilotConverter.jsx` | `pilot.created`, `proposal.approved` |
| `RDToPilotTransition.jsx` | `pilot.created` |
| `LabToPilotTransitionWizard.jsx` | `pilot.created` |
| `PilotConversionWizard.jsx` | `pilot.created` |
| `SolutionToPilotWorkflow.jsx` | `pilot.created` |
| `ProgramToPilotWorkflow.jsx` | `pilot.created` |
| `MilestoneTracker.jsx` | `pilot.milestone_completed` |
| `PilotToProcurementWorkflow.jsx` | `contract.created` |
| `Approvals.jsx` | `pilot.approved`, `pilot.rejected` |

### Solutions
| File | Triggers |
|------|----------|
| `SolutionCreateWizard.jsx` | `solution.created` |
| `ContractGeneratorWizard.jsx` | `contract.created` |
| `SolutionVerificationWizard.jsx` | `solution.verified` |

### Programs & Events
| File | Triggers |
|------|----------|
| `ProgramCreateWizard.jsx` | `program.created` |
| `ProgramLaunchWorkflow.jsx` | `program.launched` |
| `EventRegistration.jsx` | `event.registration_confirmed` |
| `CommitteeMeetingScheduler.jsx` | `event.invitation` |

### R&D & Research
| File | Triggers |
|------|----------|
| `RDProjectCreateWizard.jsx` | `rd.project_created` |
| `ChallengeToRDWizard.jsx` | `rd.project_created` |
| `RDProposalSubmissionGate.jsx` | `proposal.submitted` |
| `RDProposalReviewGate.jsx` | `proposal.reviewed` |
| `RDCallPublishWorkflow.jsx` | `rd.call_published` |

### Living Labs, Sandbox & Partnerships
| File | Triggers |
|------|----------|
| `LivingLabCreateWizard.jsx` | `livinglab.created` |
| `SandboxCreateWizard.jsx` | `sandbox.created` |
| `StartupCollaborationHub.jsx` | `partnership.created` |

### Approvals & Evaluations
| File | Triggers |
|------|----------|
| `InlineApprovalWizard.jsx` | `approval.approved`, `approval.rejected`, `approval.conditional` |
| `UnifiedEvaluationForm.jsx` | `evaluation.completed` |

### Tasks & Knowledge
| File | Triggers |
|------|----------|
| `TaskManagement.jsx` | `task.assigned` |
| `KnowledgeDocumentEdit.jsx` | `knowledge.published` |

### Citizen & Proposals
| File | Triggers |
|------|----------|
| `CitizenIdeaSubmissionForm.jsx` | `citizen.idea_submitted` |
| `ProposalSubmissionForm.jsx` | `challenge.proposal_received` |

---

## Available Trigger Keys

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
| `pilot.milestone_completed` | pilot_milestone_completed | Milestone achieved |
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

### Roles
| Trigger Key | Template | Description |
|-------------|----------|-------------|
| `role.approved` | role_request_approved | Role request approved |
| `role.rejected` | role_request_rejected | Role request rejected |

---

## Delayed Emails

Some triggers have built-in delays configured in `email_trigger_config`:

| Trigger | Delay | Purpose |
|---------|-------|---------|
| `pilot.feedback_request` | 60 seconds | Avoid immediate request after action |
| `event.reminder` | Scheduled | Day-before reminder |
| `task.due_reminder` | Scheduled | Day-before reminder |
| `living_lab.booking_reminder` | Scheduled | Day-before reminder |

For custom delays:
```tsx
await triggerEmail('custom.trigger', {
  entity_data: data,
  delay_seconds: 3600, // 1 hour delay
});
```

---

## Queue Processing

Delayed emails are stored in `email_queue` and processed by the `queue-processor` edge function.

### Cron Job
- **Job Name**: `process-email-queue`
- **Schedule**: Every 5 minutes (`*/5 * * * *`)

---

## User Preferences

The trigger system automatically respects user notification preferences stored in `user_notification_preferences`.

### Preference Categories

| Category | Applies To |
|----------|------------|
| `authentication` | auth.* triggers (critical - usually bypassed) |
| `challenges` | challenge.* triggers |
| `pilots` | pilot.* triggers |
| `solutions` | solution.* triggers |
| `events` | event.* triggers |
| `tasks` | task.* triggers |
| `programs` | program.* triggers |
| `marketing` | campaign emails |

### Force Send (Bypass Preferences)

```tsx
await triggerEmail('important.notification', {
  entity_data: data,
  skip_preferences: true, // Will send regardless of user settings
});
```

---

## Adding New Triggers

### Step 1: Create the Template

1. Navigate to Communications Hub (`/communications-hub`)
2. Go to Templates tab
3. Click "New Template"
4. Fill in all fields (EN/AR)
5. Save

### Step 2: Add Trigger Config

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
  '{"varName": "entity_field"}'::jsonb,
  true,
  3,
  0
);
```

### Step 3: Integrate in Component

```tsx
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

function MyComponent() {
  const { triggerEmail } = useEmailTrigger();

  const handleAction = async (entity) => {
    await triggerEmail('my_entity.my_action', {
      entity_type: 'my_entity',
      entity_id: entity.id,
      entity_data: entity,
    });
  };
}
```

---

## Troubleshooting

### Email Not Sent

1. Check if trigger is active in `email_trigger_config`
2. Check if template exists and is active
3. Check user notification preferences
4. Check edge function logs

### Variables Not Replaced

1. Verify variable names match template `{{variableName}}`
2. Check `variable_mapping` in trigger config
3. Ensure `entity_data` contains the required fields

### Recipient Not Found

1. Provide explicit `recipient_email`
2. Check `recipient_field` in trigger config
3. Ensure `entity_data` contains the email field

---

## Best Practices

1. **Always include entity context** - Helps with logging and tracking
2. **Use entity_data** - Allows automatic variable extraction
3. **Respect preferences** - Only bypass for critical emails
4. **Test in Communications Hub** - Preview before deploying
5. **Handle errors gracefully** - Log but don't break the flow
6. **Use batch for multiple emails** - More efficient than sequential

---

## Related Documentation

- [Communication System](./COMMUNICATION_SYSTEM.md) - Architecture overview
- [Email Template System](./EMAIL_TEMPLATE_SYSTEM.md) - Template catalog
- [Email Trigger Hub](./EMAIL_TRIGGER_HUB.md) - Technical reference
- [Campaign System](./CAMPAIGN_SYSTEM.md) - Bulk email campaigns
