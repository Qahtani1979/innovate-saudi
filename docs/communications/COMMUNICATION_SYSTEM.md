# 📧 Communication System Architecture

## Overview

The Saudi Innovates platform includes a comprehensive, bilingual (English/Arabic) communication system that handles automated notifications, transactional emails, and marketing campaigns.

**Last Updated**: 2025-12-13

## Current System Status

| Component | Status | Count |
|-----------|--------|-------|
| Email Templates | ✅ Active | 126 templates |
| Trigger Configurations | ✅ Active | 96 triggers |
| User Preferences | ✅ Active | 24 users |
| Cron Jobs | ✅ Running | 2 jobs |
| Edge Functions | ✅ Deployed | 6 functions |
| Integrated Components | ✅ Connected | 41+ files |

## Related Documentation

- [Email Template System](./EMAIL_TEMPLATE_SYSTEM.md) - Template catalog and structure
- [Email Trigger Hub](./EMAIL_TRIGGER_HUB.md) - Technical reference for triggers
- [Email Trigger Integration](./EMAIL_TRIGGER_INTEGRATION.md) - Developer integration guide
- [Campaign System](./CAMPAIGN_SYSTEM.md) - Bulk email campaigns

---

## 🏗️ Architecture

The system has **two distinct email flows** that share infrastructure:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHARED INFRASTRUCTURE                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐    │
│  │ email_templates │     │    email_logs   │     │     Resend API      │    │
│  │   (126 active)  │     │   (Database)    │     │   (Delivery)        │    │
│  └─────────────────┘     └─────────────────┘     └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                    ▲                                         ▲
                    │                                         │
    ┌───────────────┴───────────────┐       ┌─────────────────┴───────────────┐
    │      TRIGGER FLOW             │       │        CAMPAIGN FLOW            │
    │   (Event-Driven Emails)       │       │    (Bulk Marketing Emails)      │
    │   - Automatic                 │       │   - Manual                      │
    │   - Single recipient          │       │   - Bulk audience               │
    │   - Entity-driven variables   │       │   - Campaign-defined variables  │
    └───────────────────────────────┘       └─────────────────────────────────┘
                    │                                         │
    ┌───────────────┴───────────────┐       ┌─────────────────┴───────────────┐
    │   Frontend Code               │       │   Communications Hub UI         │
    │   useEmailTrigger()           │       │   Campaign Manager              │
    │   (41+ integrated files)      │       │   /communications-hub           │
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
    │   (96 active triggers)        │       │      campaign_recipients        │
    └───────────────────────────────┘       └─────────────────────────────────┘
                    │                                         │
                    └──────────────┬──────────────────────────┘
                                   ▼
                    ┌───────────────────────────────┐
                    │         send-email            │
                    │     (Shared Delivery)         │
                    └───────────────────────────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   RESEND API    │
                         │  (Email Sender) │
                         └─────────────────┘
                                   │
                                   ▼
                    ┌───────────────────────────────┐
                    │      resend-webhook           │
                    │   (Bounce/Open Tracking)      │
                    └───────────────────────────────┘
```

---

## ⚡ Two Email Flows Comparison

| Aspect | Trigger Flow | Campaign Flow |
|--------|--------------|---------------|
| **Purpose** | Automated event-driven emails | Manual bulk marketing emails |
| **Initiated By** | Code events (status change, user action) | Admin via Communications Hub UI |
| **Recipients** | Single user or small group | Large audience segments |
| **Template Lookup** | Via `email_trigger_config.template_key` | Via `email_campaigns.template_id` |
| **Variables** | Extracted from entity data | Defined per campaign |
| **Examples** | Challenge approved, task assigned | Newsletter, feature announcement |
| **Edge Function** | `email-trigger-hub` | `campaign-sender` |
| **Frontend Hook** | `useEmailTrigger()` | Campaign Manager UI |

---

## 🖥️ Communications Hub

Accessible at `/communications-hub` (requires `manage:email_templates` permission):

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMMUNICATION HUB                                │
│  /communications-hub                                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│  Templates  │  Campaigns  │    Logs     │  Settings   │ User Prefs  │
│   Editor    │   Manager   │   Viewer    │   Editor    │  Overview   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│   email_    │   email_    │   email_    │    user_    │   email_    │
│  templates  │  campaigns  │    logs     │notification_│  settings   │
│   (126)     │             │             │ preferences │             │
└──────┬──────┴──────┬──────┴─────────────┴──────┬──────┴──────┬──────┘
       │             │                           │             │
       ▼             ▼                           ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTIONS                                    │
├───────────────┬────────────────┬─────────────────┬──────────────────┤
│  send-email   │ email-trigger  │ campaign-sender │ resend-webhook   │
│  (delivery)   │     -hub       │  (bulk send)    │ (tracking)       │
├───────────────┴────────────────┴─────────────────┴──────────────────┤
│  queue-processor (cron)                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### 1. `email_templates` (31 columns)
Stores all email templates with bilingual support.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `template_key` | VARCHAR | Unique identifier (e.g., `challenge_approved`) |
| `category` | VARCHAR | Category for grouping (17 categories) |
| `name_en` / `name_ar` | VARCHAR | Display names |
| `subject_en` / `subject_ar` | TEXT | Email subjects |
| `body_en` / `body_ar` | TEXT | HTML email bodies |
| `is_html` | BOOLEAN | HTML or plain text |
| `use_header` / `use_footer` | BOOLEAN | Include branding |
| `header_title_en` / `header_title_ar` | VARCHAR | Header titles |
| `header_gradient_start` / `_end` | VARCHAR | Brand colors |
| `cta_text_en` / `cta_text_ar` | VARCHAR | Button text |
| `cta_url_variable` | VARCHAR | Variable for CTA URL |
| `variables` | JSONB | List of template variables |
| `preference_category` | VARCHAR | For user opt-out grouping |
| `is_active` | BOOLEAN | Enable/disable template |
| `is_system` | BOOLEAN | System-managed template |
| `is_critical` | BOOLEAN | Cannot be disabled by user |
| `version` | INTEGER | Template version |

### 2. `email_logs` (21 columns)
Tracks all sent emails with delivery status.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `template_id` / `template_key` | UUID/VARCHAR | Template reference |
| `recipient_email` | VARCHAR | Recipient address |
| `recipient_user_id` | UUID | User reference (optional) |
| `subject` | TEXT | Actual subject sent |
| `body_preview` | TEXT | First 500 chars of body |
| `language` | VARCHAR | 'en' or 'ar' |
| `variables_used` | JSONB | Variables interpolated |
| `status` | VARCHAR | queued/sent/delivered/opened/clicked/failed/bounced |
| `sent_at` / `delivered_at` / `opened_at` / `clicked_at` / `bounced_at` | TIMESTAMPTZ | Tracking timestamps |
| `error_message` | TEXT | Error details if failed |
| `retry_count` | INTEGER | Retry attempts |
| `entity_type` / `entity_id` | VARCHAR/UUID | Related entity |
| `triggered_by` | VARCHAR | Who/what triggered this email |

### 3. `email_settings` (15+ settings)
Global email configuration.

| Setting Key | Description |
|-------------|-------------|
| `default_from_email` | Sender email address |
| `default_from_name_en` / `_ar` | Sender name (bilingual) |
| `logo_url` | Platform logo for headers |
| `primary_button_color` | CTA button color |
| `default_header_gradient_start` / `_end` | Brand gradient |
| `footer_contact_email` | Support email |
| `footer_address` | Physical address |
| `footer_social_links` | Social media URLs |
| `unsubscribe_url_base` | Unsubscribe link base |
| `daily_email_limit` | Rate limiting |
| `enable_tracking` | Open/click tracking |

### 4. `user_notification_preferences` (14 columns)
Per-user notification settings with auto-creation trigger.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | User reference |
| `user_email` | VARCHAR | User email (unique) |
| `email_notifications` | BOOLEAN | Master email switch |
| `in_app_notifications` | BOOLEAN | In-app notifications |
| `push_notifications` | BOOLEAN | Push notifications |
| `sms_notifications` | BOOLEAN | SMS notifications |
| `notification_types` | JSONB | Type-based preferences |
| `email_categories` | JSONB | 14 category opt-in/out |
| `frequency` | VARCHAR | immediate/daily/weekly |
| `quiet_hours_start` / `_end` | TIME | Do not disturb window |

### 5. `email_campaigns` (18 columns)
Marketing and bulk email campaigns.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Campaign name |
| `template_id` | UUID | Template to use |
| `audience_type` | VARCHAR | all/role/municipality/sector/custom |
| `audience_filter` | JSONB | Audience criteria |
| `campaign_variables` | JSONB | Custom variables |
| `recipient_count` | INTEGER | Total recipients |
| `sent_count` | INTEGER | Successfully sent |
| `opened_count` | INTEGER | Opened emails |
| `clicked_count` | INTEGER | Clicked links |
| `failed_count` | INTEGER | Failed to send |
| `status` | VARCHAR | draft/scheduled/sending/completed/cancelled |
| `scheduled_at` | TIMESTAMPTZ | When to send |
| `started_at` / `completed_at` | TIMESTAMPTZ | Execution times |
| `created_by` | VARCHAR | Admin who created |

### 6. `email_trigger_config` (11 columns)
Maps trigger keys to templates for automated emails.

| Column | Type | Description |
|--------|------|-------------|
| `trigger_key` | VARCHAR | Unique trigger identifier (e.g., `challenge.approved`) |
| `template_key` | VARCHAR | Associated template key |
| `is_active` | BOOLEAN | Enable/disable trigger |
| `recipient_field` | VARCHAR | Field in entity_data for recipient |
| `variable_mapping` | JSONB | Maps template vars to entity fields |
| `respect_preferences` | BOOLEAN | Check user preferences |
| `priority` | INTEGER | 1=critical, 2=high, 3=normal |
| `delay_seconds` | INTEGER | Default delay before sending |
| `additional_recipient_fields` | TEXT[] | Extra recipient fields |

### 7. `email_queue` (12 columns)
Delayed email storage for scheduled sending.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `trigger_key` | VARCHAR | Trigger used |
| `template_key` | VARCHAR | Template to use |
| `recipient_email` | VARCHAR | Recipient address |
| `variables` | JSONB | Interpolation data |
| `scheduled_for` | TIMESTAMPTZ | When to send |
| `status` | VARCHAR | pending/processing/sent/failed |

---

## 🔄 Email Template Categories (17 Categories)

| Category | Templates | Trigger Type |
|----------|-----------|--------------|
| **auth** | welcome, password_reset, email_verification, login_new_device, account_locked, account_deactivated | Automatic (auth events) |
| **challenge** | submitted, approved, rejected, assigned, escalated, status_change, match_found, needs_info | Automatic (status change) |
| **pilot** | created, kickoff, milestone, progress, completed, issue_reported, extension_request, kpi_alert | Automatic (workflow) |
| **solution** | submitted, approved, verified, feedback, partnership, deprecated | Automatic (status change) |
| **program** | application_submitted, accepted, rejected, started, milestone, completed, waitlist | Automatic (workflow) |
| **evaluation** | assigned, reminder, completed, feedback_requested, panel_invitation | Automatic (assignment) |
| **role** | request_submitted, approved, rejected, revoked | Automatic (RBAC events) |
| **contract** | created, pending_signature, signed, expiring | Automatic + Scheduled |
| **event** | invitation, registration, reminder, updated, cancelled | Manual + Scheduled |
| **citizen** | welcome, idea_approved, idea_converted, badge_earned, level_up, points_expiring | Automatic (gamification) |
| **sandbox** | approved, access_granted, expiring, experiment_created | Automatic (workflow) |
| **research** | proposal_submitted, funded, milestone_completed, publication | Automatic (workflow) |
| **task** | assigned, reminder, completed, overdue | Automatic + Scheduled |
| **system** | announcements, maintenance, feature_update | Manual (admin) |
| **marketing** | newsletter, promotion, survey, re-engagement | Manual (campaigns) |
| **finance** | invoice, payment, overdue | Automatic |
| **contact** | form submission, auto-reply | Automatic |

---

## 🚀 Edge Functions

### 1. `send-email`
Sends individual transactional emails (shared by both flows).

```typescript
// Request body
{
  template_key: string,        // OR direct content
  variables: Record<string, string>,
  recipient_email: string,
  recipient_user_id?: string,
  language?: 'en' | 'ar',
  force_send?: boolean,        // Bypass preferences
  entity_type?: string,
  entity_id?: string,
  triggered_by?: string
}
```

### 2. `email-trigger-hub`
Centralized email triggering for all platform events.

```typescript
// Request body
{
  trigger: string,             // e.g., 'challenge.approved'
  entity_type: string,
  entity_id: string,
  recipient_email?: string,    // Override auto-detection
  recipient_user_id?: string,
  additional_recipients?: string[],
  variables?: Record<string, string>,
  skip_preferences?: boolean
}
```

### 3. `campaign-sender`
Handles marketing campaigns and bulk sending.

```typescript
// Request body
{
  campaign_id: string,
  action: 'send' | 'preview' | 'pause' | 'resume' | 'cancel'
}
```

### 4. `queue-processor`
Processes delayed emails from `email_queue` (runs via cron every 5 minutes).

### 5. `resend-webhook`
Handles Resend webhook events for delivery tracking:
- `email.delivered` - Updates delivery timestamp
- `email.opened` - Tracks opens
- `email.clicked` - Tracks link clicks
- `email.bounced` - Marks bounced emails
- `email.complained` - Disables marketing for user

---

## ⏰ Cron Jobs

| Job Name | Schedule | Purpose |
|----------|----------|---------|
| `process-email-queue` | Every 5 minutes | Processes delayed/scheduled emails |
| `process-scheduled-campaigns` | Every 5 minutes | Processes scheduled campaigns |

---

## 🎯 Trigger Key Format

All triggers use `category.action` format:

| Category | Example Triggers |
|----------|-----------------|
| `auth` | `auth.signup`, `auth.password_reset`, `auth.login_new_device` |
| `challenge` | `challenge.approved`, `challenge.rejected`, `challenge.assigned` |
| `pilot` | `pilot.created`, `pilot.status_changed`, `pilot.milestone_completed` |
| `solution` | `solution.verified`, `solution.submitted`, `solution.interest_received` |
| `program` | `program.accepted`, `program.rejected`, `program.deadline_reminder` |
| `task` | `task.assigned`, `task.completed`, `task.overdue` |
| `event` | `event.invitation`, `event.registration_confirmed`, `event.reminder` |
| `role` | `role.approved`, `role.rejected` |
| `citizen` | `citizen.badge_earned`, `citizen.level_up` |
| `contract` | `contract.created`, `contract.signed`, `contract.expiring` |

---

## 👤 User Profile Integration

### Auto-Creation of Preferences
When a new `user_profiles` record is created, a trigger automatically creates default notification preferences:

```sql
-- Trigger: create_default_notification_preferences
-- Fires: ON INSERT to user_profiles
-- Creates: Default preferences in user_notification_preferences
```

### Preference Categories (14 categories)
Users can opt-out of specific email categories:
- `authentication` - Login, password reset
- `challenges` - Challenge updates
- `pilots` - Pilot status
- `solutions` - Solution notifications
- `contracts` - Contract updates
- `evaluations` - Evaluation requests
- `events` - Event invitations
- `tasks` - Task assignments
- `programs` - Program updates
- `proposals` - Proposal status
- `roles` - Role approvals
- `finance` - Financial notifications
- `citizen` - Gamification updates
- `marketing` - Newsletters, promotions

### Quiet Hours
Users can set `quiet_hours_start` and `quiet_hours_end` to prevent emails during specific hours.

### Frequency Settings
- `immediate` - Send emails instantly
- `daily` - Batch into daily digest
- `weekly` - Batch into weekly digest

---

## 🔧 Frontend Integration

### Using the Hook

```tsx
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

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

### Integrated Components (41+ files)

Key integrations include:
- `ChallengeReviewWorkflow.jsx` - Challenge approvals/rejections
- `RoleRequestApprovalQueue.jsx` - Role approvals
- `ContractGeneratorWizard.jsx` - Contract creation
- `EventRegistration.jsx` - Event registrations
- `OnboardingWizard.jsx` - User signup
- `ExpressInterestButton.jsx` - Solution interest
- And 35+ more components

---

## 📈 Analytics & Tracking

### Email Metrics
- **Sent** - Successfully delivered to Resend
- **Delivered** - Confirmed delivery to inbox
- **Opened** - Email opened (tracked via pixel)
- **Clicked** - Link clicked in email
- **Bounced** - Delivery failed
- **Complained** - Marked as spam

### Webhook Integration
Configure Resend webhook at:
```
https://wneorgiqyvkkjmqootpe.supabase.co/functions/v1/resend-webhook
```

Events handled:
- `email.delivered`
- `email.opened`
- `email.clicked`
- `email.bounced`
- `email.complained`

---

## 🔐 Security & Permissions

### Required Permission
- `manage:email_templates` - Access Communications Hub

### Critical Emails
Some emails bypass user preferences:
- Password reset
- Account locked
- Email verification
- Security alerts

### Bounce Handling
When users mark emails as spam (`email.complained`), marketing emails are automatically disabled for that user.

---

## 🚀 Getting Started

### 1. For Developers
```tsx
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

const { triggerEmail } = useEmailTrigger();
await triggerEmail('trigger.key', { entity_data: data });
```

### 2. For Admins
Navigate to `/communications-hub` to:
- Edit email templates
- Create and send campaigns
- View email logs
- Configure settings
- Monitor user preferences

### 3. For New Integrations
1. Create template in Communications Hub
2. Add trigger config to `email_trigger_config`
3. Call `triggerEmail()` in your component
