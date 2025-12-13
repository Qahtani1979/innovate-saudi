# 📧 Communication System Architecture

## Overview

The Saudi Innovates platform includes a comprehensive, bilingual (English/Arabic) communication system that handles automated notifications, transactional emails, and marketing campaigns.

---

## 🏗️ Architecture

The system has **two distinct email flows** that share infrastructure:

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
    │   - Automatic                 │       │   - Manual                      │
    │   - Single recipient          │       │   - Bulk audience               │
    │   - Entity-driven variables   │       │   - Campaign-defined variables  │
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

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMMUNICATION HUB                                │
│  /communications-hub                                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│  Templates  │    Logs     │  Settings   │ User Prefs  │  Campaigns  │
│   Editor    │   Viewer    │   Editor    │  Overview   │   Manager   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│   email_    │   email_    │   email_    │    user_    │   email_    │
│  templates  │    logs     │  settings   │notification_│  campaigns  │
│             │             │             │ preferences │             │
└──────┬──────┴──────┬──────┴─────────────┴──────┬──────┴──────┬──────┘
       │             │                           │             │
       ▼             ▼                           ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTIONS                                    │
├─────────────────────┬───────────────────────┬───────────────────────┤
│     send-email      │  email-trigger-hub    │   campaign-sender     │
│   (shared sender)   │ (event-driven flow)   │   (bulk marketing)    │
└─────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 📊 Database Schema

### 1. `email_templates` (31 columns)
Stores all email templates with bilingual support.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `template_key` | VARCHAR | Unique identifier (e.g., `challenge_approved`) |
| `category` | VARCHAR | Category for grouping |
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

### 3. `email_settings` (6 columns)
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

### 4. `user_notification_preferences` (10 columns)
Per-user notification settings.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | User reference |
| `user_email` | VARCHAR | User email |
| `email_notifications` | BOOLEAN | Master email switch |
| `in_app_notifications` | BOOLEAN | In-app notifications |
| `push_notifications` | BOOLEAN | Push notifications |
| `email_categories` | JSONB | Category opt-in/out |
| `frequency` | VARCHAR | immediate/daily/weekly |
| `quiet_hours_start` / `_end` | TIME | Do not disturb window |

### 5. `email_campaigns` (NEW - To be created)
Marketing and bulk email campaigns.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Campaign name |
| `template_id` | UUID | Template to use |
| `audience_type` | VARCHAR | all/role/municipality/sector/custom |
| `audience_filter` | JSONB | Audience criteria |
| `recipient_count` | INTEGER | Total recipients |
| `sent_count` | INTEGER | Successfully sent |
| `failed_count` | INTEGER | Failed to send |
| `status` | VARCHAR | draft/scheduled/sending/completed/cancelled |
| `scheduled_at` | TIMESTAMPTZ | When to send |
| `started_at` / `completed_at` | TIMESTAMPTZ | Execution times |
| `created_by` | VARCHAR | Admin who created |

---

## 🔄 Email Template Categories

| Category | Templates | Trigger Type |
|----------|-----------|--------------|
| **auth** | welcome, password_reset, email_verification, login_new_device, account_locked, account_deactivated | Automatic (auth events) |
| **challenge** | submitted, approved, rejected, assigned, escalated, status_change, match_found, needs_info | Automatic (status change) |
| **pilot** | created, kickoff, milestone, progress, completed, issue_reported, extension_request, kpi_alert | Automatic (workflow) |
| **solution** | submitted, approved, verified, feedback, partnership | Automatic (status change) |
| **program** | application_submitted, accepted, rejected, started, milestone, completed | Automatic (workflow) |
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

---

## 🚀 Edge Functions

### 1. `send-email` (Existing)
Sends individual transactional emails.

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

### 2. `email-trigger-hub` (NEW - Unified Trigger)
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

### 3. `campaign-sender` (NEW - Bulk Emails)
Handles marketing campaigns and bulk sending.

```typescript
// Request body
{
  campaign_id: string,
  action: 'send' | 'preview' | 'cancel'
}
```

---

## 🎯 Trigger Mapping

| Trigger Event | Template Key | Auto-detected Recipients |
|---------------|--------------|--------------------------|
| `auth.signup` | `welcome_new_user` | New user email |
| `auth.password_reset` | `password_reset` | User email |
| `challenge.submitted` | `challenge_submitted` | Submitter email |
| `challenge.approved` | `challenge_approved` | Challenge owner |
| `challenge.rejected` | `challenge_rejected` | Challenge owner |
| `challenge.assigned` | `challenge_assigned` | Assigned reviewer |
| `pilot.created` | `pilot_created` | Pilot manager |
| `pilot.status_changed` | `pilot_status_change` | Pilot manager + stakeholders |
| `pilot.milestone_completed` | `pilot_milestone_completed` | Pilot manager |
| `solution.verified` | `solution_verified` | Provider contact |
| `evaluation.assigned` | `evaluation_assigned` | Assigned evaluator |
| `role.approved` | `role_request_approved` | Requester |
| `role.rejected` | `role_request_rejected` | Requester |
| `contract.expiring` | `contract_expiring` | Contract parties |
| `task.assigned` | `task_assigned` | Assignee |
| `task.overdue` | `task_overdue` | Assignee + manager |

---

## 🔐 RLS Policies

| Table | Policy | Access |
|-------|--------|--------|
| `email_templates` | View active | Anyone (public) |
| `email_templates` | Manage all | Admins only |
| `email_logs` | View own | Recipients can see their emails |
| `email_logs` | Manage all | Admins only |
| `email_settings` | View | Anyone (needed by edge function) |
| `email_settings` | Manage | Admins only |
| `user_notification_preferences` | Manage own | Users can manage their prefs |
| `user_notification_preferences` | Manage all | Admins only |
| `email_campaigns` | Manage | Admins only |

---

## 📱 Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `EmailTemplateEditorContent` | `/communications-hub` | Create/edit email templates |
| `EmailLogsViewer` | `/communications-hub` | View sent emails, resend failed |
| `EmailSettingsEditor` | `/communications-hub` | Configure email branding |
| `UserPreferencesOverview` | `/communications-hub` | Admin view of user prefs |
| `CampaignManager` | `/communications-hub` | Create/send bulk campaigns |
| `NotificationPreferences` | User settings | User self-service prefs |

---

## 🔄 Workflow Integrations

### Current Integrations (11 files)
1. `AuthContext.jsx` - Welcome email on signup
2. `ChallengeReviewWorkflow.jsx` - Challenge approved email
3. `ChallengeSubmissionWizard.jsx` - Challenge submitted email
4. `RoleRequestApprovalQueue.jsx` - Role approved/rejected emails
5. `RDToPilotTransition.jsx` - Pilot created email
6. `ProgramToPilotWorkflow.jsx` - Pilot created email
7. `SolutionToPilotWorkflow.jsx` - Pilot created email
8. `RDProposalAwardWorkflow.jsx` - Proposal awarded email
9. `PublicIdeaSubmission.jsx` - Idea submitted email
10. `EmailTemplateEditorContent.jsx` - Test send
11. `base44Client.js` - Generic send helper

### Needed Integrations
- Pilot status change triggers
- Solution verification triggers
- Evaluation assignment triggers
- Task assignment triggers
- Contract expiring (scheduled job)
- Event reminders (scheduled job)

---

## 📊 Metrics & Analytics

| Metric | Source | Dashboard |
|--------|--------|-----------|
| Total emails sent | `email_logs` count | Communications Hub |
| Delivery rate | sent vs delivered | Communications Hub |
| Open rate | opened_at populated | Communications Hub |
| Click rate | clicked_at populated | Communications Hub |
| Bounce rate | bounced_at populated | Communications Hub |
| Unsubscribe rate | Preference changes | Communications Hub |
| Campaign performance | `email_campaigns` | Campaign Manager |

---

## 🛠️ Maintenance Tasks

| Task | Frequency | Method |
|------|-----------|--------|
| Retry failed emails | Hourly | Scheduled job |
| Clean old logs (>90 days) | Weekly | Scheduled job |
| Contract expiry reminders | Daily | Scheduled job |
| Task overdue notifications | Daily | Scheduled job |
| Inactive user re-engagement | Monthly | Campaign |

---

## 🔮 Future Enhancements

1. **A/B Testing** - Test subject lines and content variations
2. **Personalization Engine** - Dynamic content based on user behavior
3. **SMS Integration** - Multi-channel notifications
4. **WhatsApp Business API** - Message templates
5. **Email Analytics Dashboard** - Advanced reporting
6. **Drip Campaigns** - Automated email sequences
7. **Segment Builder** - Advanced audience targeting
