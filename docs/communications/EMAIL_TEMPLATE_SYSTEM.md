# Email Template System - Complete Specification

## Overview

A comprehensive bilingual (EN/AR) email template system for the Saudi Innovates platform, supporting HTML emails with configurable headers/footers, user preferences integration, and complete platform coverage.

**Status**: ✅ Fully Implemented

**Last Updated**: 2025-12-13
**System Status**: ✅ Fully Operational
**Integration Coverage**: 94% (50/53 module integrations)

---

## Current Statistics

| Metric | Count |
|--------|-------|
| Active Templates | 126 |
| Template Categories | 17 |
| Active Triggers | 96 |
| Integrated Components | 50+ |
| Trigger Keys Implemented | 34 |

---

## Related Documentation

- [Email Trigger Hub](./EMAIL_TRIGGER_HUB.md) - Unified email triggering API
- [Campaign System](./CAMPAIGN_SYSTEM.md) - Bulk email campaigns
- [Communication System](./COMMUNICATION_SYSTEM.md) - Architecture overview
- [Email Trigger Integration](./EMAIL_TRIGGER_INTEGRATION.md) - Integration guide

---

## Quick Reference

### Implementation Progress

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Database & Core (tables, seed templates) | ✅ Complete |
| Phase 2 | Edge Function (template fetching, HTML builder, preferences) | ✅ Complete |
| Phase 3 | Admin UI (template editor, preview, test send) | ✅ Complete |
| Phase 4 | Integration (connect all triggers) | ✅ Complete |
| Phase 5 | Migration to email-trigger-hub | ✅ Complete (50 files) |
| Phase 6 | User profile integration | ✅ Complete |
| Phase 7 | Webhook tracking (Resend) | ✅ Complete |
| Phase 8 | Module Integrations | ✅ 94% Complete (50/53) |

### Email Sending Architecture

All email sending now goes through the unified `email-trigger-hub` edge function:

```
Frontend Component
       │
       ▼
useEmailTrigger() hook
       │
       ▼
email-trigger-hub (edge function)
       │
       ├──▶ Trigger config lookup
       ├──▶ Template fetching
       ├──▶ Variable extraction
       ├──▶ Preference check
       │
       ▼
send-email (edge function)
       │
       ├──▶ HTML builder
       ├──▶ RTL support
       ├──▶ Variable interpolation
       │
       ▼
Resend API
       │
       ▼
resend-webhook (tracking)
```

### Database Tables

| Table | Purpose | Record Count |
|-------|---------|--------------|
| `email_settings` | Global configuration (logo, colors, footer) | ~15 settings |
| `email_templates` | Template storage with bilingual support | 126 templates |
| `email_trigger_config` | Maps triggers to templates | 96 active |
| `email_logs` | Email send tracking and analytics | Dynamic |
| `email_queue` | Delayed/scheduled emails | Dynamic |
| `user_notification_preferences` | Per-user settings | 24+ users |

### Key Features

- ✅ Bilingual support (English/Arabic) with RTL
- ✅ Template-based or direct content emails
- ✅ User preference checking (with bypass for critical emails)
- ✅ HTML email builder with header/footer injection
- ✅ Variable interpolation with `{{variable}}` syntax
- ✅ Text-based logo fallback (when no logo URL configured)
- ✅ Email logging with status tracking
- ✅ Admin UI for template management
- ✅ Live preview with language toggle
- ✅ Test send to current user
- ✅ Language-aware test variables (EN/AR match preview)
- ✅ AI Analysis - Comprehensive template database assessment
- ✅ Webhook tracking for opens/clicks/bounces
- ✅ Auto-creation of user preferences on signup

---

## 1. User Preferences Integration

### 1.1 Notification Preferences Table

The `user_notification_preferences` table stores per-user settings:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `email_notifications` | BOOLEAN | true | Master switch for all emails |
| `in_app_notifications` | BOOLEAN | true | In-app notifications |
| `push_notifications` | BOOLEAN | true | Push notifications |
| `sms_notifications` | BOOLEAN | false | SMS notifications |
| `email_categories` | JSONB | (all true) | Per-category opt-in/out |
| `frequency` | VARCHAR | immediate | immediate/daily/weekly |
| `quiet_hours_start` | TIME | null | Do not disturb start |
| `quiet_hours_end` | TIME | null | Do not disturb end |

### 1.2 Email Categories (14 categories)

| Category Key | Description | Default |
|--------------|-------------|---------|
| `authentication` | Login, password reset, security | true |
| `challenges` | Challenge status changes | true |
| `pilots` | Pilot updates and KPIs | true |
| `solutions` | Solution notifications | true |
| `contracts` | Contract lifecycle | true |
| `evaluations` | Evaluation assignments | true |
| `events` | Event invitations | true |
| `tasks` | Task assignments | true |
| `programs` | Program updates | true |
| `proposals` | Proposal status | true |
| `roles` | Role approvals | true |
| `finance` | Financial notifications | true |
| `citizen` | Gamification (badges, levels) | true |
| `marketing` | Newsletters, promotions | true |

### 1.3 Auto-Creation Trigger

When a new user profile is created, notification preferences are automatically created:

```sql
-- Trigger: on_user_profile_created
-- Fires: AFTER INSERT ON user_profiles
-- Action: Creates default preferences in user_notification_preferences
```

### 1.4 Language Preferences
- Primary source: `user_profiles.preferred_language` or `citizen_profiles.language_preference`
- Fallback: Browser locale detection
- Default: `en` (English)
- RTL support: Automatic for Arabic (`ar`)

### 1.5 Preference Checking Flow

```
1. Check if user has email_notifications = true
2. Map template category to preference category
3. Check email_categories[category] = true
4. Check quiet hours (if set)
5. Get user's language preference
6. Fetch template in correct language
7. Send email with appropriate direction (LTR/RTL)
```

---

## 2. Email Structure

### 2.1 HTML Email Components

#### Header (Configurable per template)
```html
<!-- Header with gradient background -->
<div style="background: linear-gradient(135deg, {header_gradient_start}, {header_gradient_end}); padding: 32px; text-align: center;">
  <img src="{logo_url}" alt="Saudi Innovates" style="height: 48px;">
  <h1 style="color: white; margin-top: 16px;">{header_title}</h1>
  {optional_icon}
</div>
```

#### Body
```html
<div style="padding: 32px; background: white;">
  {body_content}
  
  <!-- Call to Action Button (optional) -->
  <a href="{cta_url}" style="background: {primary_color}; color: white; padding: 12px 24px; border-radius: 8px;">
    {cta_text}
  </a>
</div>
```

#### Footer (Global, configurable)
```html
<div style="background: #f5f5f5; padding: 24px; text-align: center;">
  <!-- Social Links -->
  <div>{social_links}</div>
  
  <!-- Contact Info -->
  <p>{contact_email} | {contact_phone}</p>
  
  <!-- Unsubscribe Link -->
  <a href="{unsubscribe_url}">Unsubscribe from these emails</a>
  
  <!-- Legal -->
  <p>© {year} Saudi Innovates. All rights reserved.</p>
  <p>{address}</p>
</div>
```

### 2.2 RTL Support
- Arabic emails use `dir="rtl"` on body
- Text alignment flipped automatically
- Button positioning adjusted
- Font family includes Arabic-friendly fonts (Noto Sans Arabic)

---

## 3. Complete Template Catalog (126 Templates)

### 3.1 Authentication & Onboarding (7 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 1 | `welcome_new_user` | `auth.signup` | New user | `userName`, `loginUrl`, `supportEmail` |
| 2 | `email_verification` | `auth.email_verification` | User | `userName`, `verificationUrl`, `expiresIn` |
| 3 | `password_reset` | `auth.password_reset` | User | `userName`, `resetUrl`, `expiresIn` |
| 4 | `password_changed` | `auth.password_changed` | User | `userName`, `changeTime`, `supportUrl` |
| 5 | `account_locked` | `auth.account_locked` | User | `userName`, `unlockTime`, `supportEmail` |
| 6 | `account_deactivated` | `auth.account_deactivated` | User | `userName`, `reason`, `appealUrl` |
| 7 | `login_new_device` | `auth.login_new_device` | User | `userName`, `device`, `location`, `time` |

### 3.2 Role & Access Management (8 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 8 | `role_request_submitted` | `role.request_submitted` | User | `userName`, `roleName`, `submissionDate` |
| 9 | `role_request_pending` | `role.pending` | Admin | `requesterName`, `roleName`, `justification` |
| 10 | `role_request_approved` | `role.approved` | User | `userName`, `roleName`, `startDate` |
| 11 | `role_request_rejected` | `role.rejected` | User | `userName`, `roleName`, `reason` |
| 12 | `role_expiring_soon` | `role.expiring` | User | `userName`, `roleName`, `expiryDate` |
| 13 | `role_expired` | `role.expired` | User | `userName`, `roleName`, `reapplyUrl` |
| 14 | `invitation_sent` | `invitation.sent` | Invitee | `inviterName`, `roleName`, `organizationName` |
| 15 | `invitation_accepted` | `invitation.accepted` | Inviter | `inviteeName`, `roleName`, `profileUrl` |

### 3.3 Challenges (8 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 16 | `challenge_submitted` | `challenge.submitted` | Submitter | `challengeTitle`, `challengeCode`, `trackingUrl` |
| 17 | `challenge_assigned` | `challenge.assigned` | Reviewer | `challengeTitle`, `challengeCode`, `dueDate` |
| 18 | `challenge_approved` | `challenge.approved` | Submitter | `challengeTitle`, `challengeCode`, `nextSteps` |
| 19 | `challenge_rejected` | `challenge.rejected` | Submitter | `challengeTitle`, `reason`, `resubmitUrl` |
| 20 | `challenge_needs_info` | `challenge.needs_info` | Submitter | `challengeTitle`, `questions`, `respondUrl` |
| 21 | `challenge_status_change` | `challenge.status_changed` | Stakeholders | `challengeTitle`, `oldStatus`, `newStatus` |
| 22 | `challenge_match_found` | `challenge.match_found` | Owner, Provider | `challengeTitle`, `solutionName`, `matchScore` |
| 23 | `challenge_escalated` | `challenge.escalated` | Manager | `challengeTitle`, `escalationLevel`, `daysOverdue` |

### 3.4 Solutions & Proposals (9 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 24 | `solution_submitted` | `solution.submitted` | Provider | `solutionName`, `solutionCode`, `dashboardUrl` |
| 25 | `solution_approved` | `solution.approved` | Provider | `solutionName`, `marketplaceUrl` |
| 26 | `solution_rejected` | `solution.rejected` | Provider | `solutionName`, `reason` |
| 27 | `solution_interest` | `solution.interest_received` | Provider | `solutionName`, `municipalityName` |
| 28 | `solution_deprecated` | `solution.deprecated` | Provider | `solutionName`, `reason`, `migrationUrl` |
| 29 | `proposal_submitted` | `proposal.submitted` | Provider | `proposalTitle`, `challengeTitle` |
| 30 | `proposal_received` | `proposal.received` | Owner | `proposalTitle`, `providerName` |
| 31 | `proposal_shortlisted` | `proposal.shortlisted` | Provider | `proposalTitle`, `challengeTitle` |
| 32 | `proposal_selected` | `proposal.accepted` | Provider | `proposalTitle`, `pilotUrl` |

### 3.5 Pilots (13 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 33 | `pilot_created` | `pilot.created` | Stakeholders | `pilotTitle`, `pilotCode`, `startDate` |
| 34 | `pilot_kickoff` | `pilot.kickoff` | Team | `pilotTitle`, `kickoffDate`, `objectives` |
| 35 | `pilot_milestone_due` | `pilot.milestone_due` | Responsible | `pilotTitle`, `milestoneName`, `dueDate` |
| 36 | `pilot_milestone_completed` | `pilot.milestone_completed` | Stakeholders | `pilotTitle`, `milestoneName` |
| 37 | `pilot_milestone_overdue` | `pilot.milestone_overdue` | Manager | `pilotTitle`, `milestoneName`, `daysOverdue` |
| 38 | `pilot_kpi_alert` | `pilot.kpi_alert` | Manager | `pilotTitle`, `kpiName`, `currentValue` |
| 39 | `pilot_issue_reported` | `pilot.issue_reported` | Manager | `pilotTitle`, `issueTitle`, `severity` |
| 40 | `pilot_issue_resolved` | `pilot.issue_resolved` | Reporter | `pilotTitle`, `issueTitle`, `resolution` |
| 41 | `pilot_status_change` | `pilot.status_changed` | Stakeholders | `pilotTitle`, `oldStatus`, `newStatus` |
| 42 | `pilot_completed` | `pilot.completed` | Stakeholders | `pilotTitle`, `results`, `reportUrl` |
| 43 | `pilot_extension_request` | `pilot.extension_request` | Approver | `pilotTitle`, `currentEndDate`, `reason` |
| 44 | `pilot_enrollment_confirmed` | `pilot.enrollment_confirmed` | Citizen | `pilotTitle`, `location`, `startDate` |
| 45 | `pilot_feedback_request` | `pilot.feedback_request` | Participant | `pilotTitle`, `feedbackUrl` |

### 3.6 Programs (8 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 46 | `program_announced` | `program.announced` | Eligible | `programName`, `description`, `deadline` |
| 47 | `program_application_received` | `program.application_received` | Applicant | `programName`, `applicationId` |
| 48 | `program_application_reviewed` | `program.reviewed` | Applicant | `programName`, `reviewerName` |
| 49 | `program_accepted` | `program.accepted` | Applicant | `programName`, `startDate`, `orientationUrl` |
| 50 | `program_rejected` | `program.rejected` | Applicant | `programName`, `feedback` |
| 51 | `program_deadline_reminder` | `program.deadline_reminder` | Potential | `programName`, `deadline`, `applyUrl` |
| 52 | `program_cohort_start` | `program.cohort_start` | Participants | `programName`, `startDate`, `schedule` |
| 53 | `program_mentorship_assigned` | `program.mentorship_assigned` | Both | `programName`, `mentorName`, `menteeName` |

### 3.7 Evaluations & Reviews (7 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 54 | `evaluation_assigned` | `evaluation.assigned` | Expert | `entityType`, `entityTitle`, `deadline` |
| 55 | `evaluation_reminder` | `evaluation.reminder` | Expert | `entityType`, `entityTitle`, `dueDate` |
| 56 | `evaluation_completed` | `evaluation.completed` | Requester | `entityType`, `entityTitle`, `evaluatorName` |
| 57 | `panel_invitation` | `panel.invitation` | Expert | `panelName`, `purpose`, `sessionDate` |
| 58 | `panel_reminder` | `panel.reminder` | Members | `panelName`, `sessionDate`, `agendaUrl` |
| 59 | `feedback_requested` | `feedback.requested` | Stakeholder | `entityType`, `entityTitle`, `deadline` |
| 60 | `feedback_received` | `feedback.received` | Owner | `entityType`, `entityTitle`, `fromName` |

### 3.8 Citizen Engagement (10 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 61 | `citizen_welcome` | `citizen.signup` | Citizen | `userName`, `exploreUrl` |
| 62 | `idea_submitted` | `idea.submitted` | Citizen | `ideaTitle`, `trackingUrl` |
| 63 | `idea_approved` | `idea.approved` | Citizen | `ideaTitle`, `pointsEarned`, `badgeEarned` |
| 64 | `idea_converted` | `idea.converted` | Citizen | `ideaTitle`, `challengeTitle`, `challengeUrl` |
| 65 | `vote_confirmation` | `vote.confirmation` | Citizen | `entityTitle`, `voteType`, `totalVotes` |
| 66 | `badge_earned` | `citizen.badge_earned` | Citizen | `badgeName`, `badgeDescription`, `pointsEarned` |
| 67 | `level_up` | `citizen.level_up` | Citizen | `newLevel`, `benefits`, `nextLevelProgress` |
| 68 | `pilot_enrollment_confirmed` | `pilot.enrollment_confirmed` | Citizen | `pilotTitle`, `location`, `startDate` |
| 69 | `pilot_feedback_request` | `pilot.feedback_request` | Participant | `pilotTitle`, `feedbackUrl`, `rewardPoints` |
| 70 | `points_expiring` | `citizen.points_expiring` | Citizen | `expiringPoints`, `expiryDate`, `redeemUrl` |

### 3.9 Tasks & Collaboration (6 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 71 | `task_assigned` | `task.assigned` | Assignee | `taskTitle`, `assignedBy`, `dueDate`, `priority` |
| 72 | `task_due_reminder` | `task.due_reminder` | Assignee | `taskTitle`, `dueDate`, `taskUrl` |
| 73 | `task_overdue` | `task.overdue` | Assignee, Manager | `taskTitle`, `daysOverdue` |
| 74 | `task_completed` | `task.completed` | Assigner | `taskTitle`, `completedBy`, `completionDate` |
| 75 | `comment_mention` | `comment.mention` | User | `mentionedBy`, `entityType`, `commentPreview` |
| 76 | `comment_reply` | `comment.reply` | User | `repliedBy`, `entityTitle`, `replyPreview` |

### 3.10 Events & Bookings (5 templates)

| # | Template Key | Trigger | Recipients | Variables |
|---|--------------|---------|------------|-----------|
| 77 | `event_invitation` | `event.invitation` | Invitee | `eventTitle`, `date`, `location` |
| 78 | `event_registration_confirmed` | `event.registration_confirmed` | Registrant | `eventTitle`, `confirmationCode` |
| 79 | `event_reminder` | `event.reminder` | Attendee | `eventTitle`, `date`, `location` |
| 80 | `event_updated` | `event.updated` | Registered | `eventTitle`, `changes` |
| 81 | `event_cancelled` | `event.cancelled` | Registered | `eventTitle`, `reason`, `refundInfo` |

### 3.11+ Additional Categories

Templates continue for:
- **Contracts** (4 templates) - Created, pending signature, signed, expiring
- **Finance** (4 templates) - Invoice, payment received, overdue, statement
- **Living Lab** (3 templates) - Booking, reminder, experiment created
- **System** (5 templates) - Announcements, maintenance, feature updates
- **Marketing/Campaigns** (10+ templates) - Newsletters, promotions, surveys
- **Contact** (2 templates) - Form submission, auto-reply

---

## 4. AI Analysis Feature

### Overview

The Email Template Editor includes an AI-powered analysis tool accessible via the "AI Analysis" button.

### Analysis Types

| Analysis Type | Description | Action |
|--------------|-------------|--------|
| **Health Score** | Overall score (1-100) assessing template database quality | Visual indicator |
| **Coverage Gaps** | Missing templates for common platform workflows | Click "Create" to start new template |
| **Consistency Issues** | Templates missing Arabic content, headers, CTAs | Click template key to select & edit |
| **Category Balance** | Identifies over/under-represented categories | Click category to filter template list |
| **Recommendations** | Specific actionable improvements prioritized by impact | Reference for improvements |
| **Suggested Templates** | AI-recommended new templates to add | Click "Create" to pre-fill new template |

### How to Use

1. Navigate to Communications Hub (`/communications-hub`)
2. Go to Templates tab
3. Click the "AI Analysis" button in the toolbar
4. Review the comprehensive analysis report
5. **Take Action Directly:**
   - Click on a template key in consistency issues → Selects that template for editing
   - Click on a category → Filters the template list by that category
   - Click "Create" on suggested templates → Creates new template with pre-filled fields
   - Use "AI Generate" after creating to auto-fill content

---

## 5. Template Management

### Creating a Template

1. Navigate to `/communications-hub`
2. Select "Templates" tab
3. Click "New Template"
4. Fill required fields:
   - Template Key (unique identifier)
   - Category
   - Name (EN/AR)
   - Subject (EN/AR)
   - Body (EN/AR)
5. Configure options:
   - Use header/footer
   - Header gradient colors
   - CTA button text and URL variable
6. Save template

### Template Variables

Use `{{variableName}}` syntax in subject and body:

```html
<p>Hello {{userName}},</p>
<p>Your {{entityType}} "{{entityTitle}}" has been {{action}}.</p>
<a href="{{actionUrl}}">View Details</a>
```

### Preview & Test

- Toggle language preview (EN/AR)
- Send test email to current user
- Language-aware test variables

---

## 6. Edge Function Integration

### send-email Function

```typescript
// supabase/functions/send-email/index.ts

interface SendEmailRequest {
  template_key?: string;        // Use template
  subject?: string;             // Or direct content
  body?: string;
  recipient_email: string;
  recipient_user_id?: string;
  language?: 'en' | 'ar';
  variables?: Record<string, string>;
  force_send?: boolean;         // Bypass preferences
  entity_type?: string;
  entity_id?: string;
  triggered_by?: string;
}
```

### Features

- Template fetching from database
- Variable interpolation
- HTML builder with header/footer
- RTL support for Arabic
- User preference checking
- Email logging
- Resend API integration

---

## 7. Webhook Tracking

### Resend Webhook Events

The `resend-webhook` edge function handles:

| Event | Action |
|-------|--------|
| `email.delivered` | Update `email_logs.delivered_at` |
| `email.opened` | Update `email_logs.opened_at` |
| `email.clicked` | Update `email_logs.clicked_at` |
| `email.bounced` | Update status to 'bounced', set `bounced_at` |
| `email.complained` | Disable marketing emails for user |

### Webhook URL

```
https://wneorgiqyvkkjmqootpe.supabase.co/functions/v1/resend-webhook
```

Configure in Resend dashboard → Webhooks.

---

## 8. Best Practices

### Template Design
1. Keep subjects under 50 characters
2. Include clear CTA buttons
3. Always provide Arabic translations
4. Use consistent header colors per category
5. Include unsubscribe link in footer

### Integration
1. Use `useEmailTrigger()` hook for all email sending
2. Include `entity_type` and `entity_id` for tracking
3. Provide `entity_data` for automatic variable extraction
4. Use `skip_preferences: true` only for critical emails

### Performance
1. Use delayed sending for non-urgent emails
2. Batch similar notifications
3. Respect user quiet hours
4. Monitor bounce rates

---

## 9. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Email not sent | Check user preferences and category opt-in |
| Template not found | Verify `template_key` matches exactly |
| Variables not replaced | Check variable names match template |
| Arabic text reversed | Ensure template uses RTL direction |
| Bounce rate high | Review email addresses, check spam score |

### Debug Logging

Check edge function logs:
1. Navigate to Supabase dashboard
2. Go to Edge Functions → send-email
3. View logs for errors

---

## 10. Migration Guide

### From Legacy Email Sending

```typescript
// ❌ OLD - Don't use
await supabase.functions.invoke('send-email', {
  body: { ... }
});

// ✅ NEW - Use the hook
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

const { triggerEmail } = useEmailTrigger();
await triggerEmail('category.action', {
  entity_type: 'entity',
  entity_id: id,
  entity_data: data,
});
```

### Adding New Templates

1. Create template in Communications Hub UI
2. Add trigger config via database:
```sql
INSERT INTO email_trigger_config (
  trigger_key,
  template_key,
  is_active,
  recipient_field,
  respect_preferences,
  priority
) VALUES (
  'category.action',
  'template_key',
  true,
  'owner_email',
  true,
  3
);
```
3. Integrate in component with `triggerEmail()`
