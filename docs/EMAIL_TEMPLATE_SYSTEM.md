# Email Template System - Complete Specification

## Overview

A comprehensive bilingual (EN/AR) email template system for the Saudi Innovates platform, supporting HTML emails with configurable headers/footers, user preferences integration, and complete platform coverage.

**Status**: ✅ Fully Implemented (All Core Phases Complete)

### Implementation Progress

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Database & Core (tables, seed templates) | ✅ Complete |
| Phase 2 | Edge Function (template fetching, HTML builder, preferences) | ✅ Complete |
| Phase 3 | Admin UI (template editor, preview, test send) | ✅ Complete |
| Phase 4 | Integration (connect all triggers) | 🔄 Ready for Integration |

### Test Send Feature
- Sends to current logged-in user's email by default
- If template is saved: uses template with variable interpolation
- If template is new/unsaved: builds HTML preview directly
- Supports both English and Arabic previews

### Database Tables Created
- `email_settings` - Global email configuration
- `email_templates` - Template storage with bilingual support
- `email_logs` - Email send tracking and analytics

### Edge Function Features
- Template-based or direct content emails
- User preference checking (with bypass for critical emails)
- HTML email builder with header/footer injection
- RTL support for Arabic
- Variable interpolation
- Email logging

---

## 1. User Preferences Integration

### 1.1 Notification Preferences (from `user_notification_preferences` table)
Users can control which emails they receive:

| Preference Key | Description | Default |
|----------------|-------------|---------|
| `email_enabled` | Master switch for all emails | `true` |
| `challenge_updates` | Challenge status changes, matches | `true` |
| `pilot_updates` | Pilot status, KPI alerts | `true` |
| `program_updates` | Program deadlines, acceptances | `true` |
| `task_reminders` | Task assignments, deadlines | `true` |
| `proposal_updates` | Proposal status, feedback | `true` |
| `system_announcements` | Platform-wide announcements | `true` |
| `weekly_digest` | Weekly activity summary | `false` |
| `marketing_emails` | News, tips, promotions | `false` |

### 1.2 Language Preferences
- Primary source: `user_profiles.preferred_language` or `citizen_profiles.language_preference`
- Fallback: Browser locale detection
- Default: `en` (English)
- RTL support: Automatic for Arabic (`ar`)

### 1.3 Preference Checking Flow
```
1. Check if user has email_enabled = true
2. Check specific preference category
3. Get user's language preference
4. Fetch template in correct language
5. Send email with appropriate direction (LTR/RTL)
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

## 3. Complete Template Catalog

### 3.1 Authentication & Onboarding

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 1 | `welcome_new_user` | auth | User registration | New user | `userName`, `loginUrl`, `supportEmail` |
| 2 | `email_verification` | auth | Registration/email change | User | `userName`, `verificationUrl`, `expiresIn` |
| 3 | `password_reset` | auth | Password reset request | User | `userName`, `resetUrl`, `expiresIn` |
| 4 | `password_changed` | auth | Password successfully changed | User | `userName`, `changeTime`, `supportUrl` |
| 5 | `account_locked` | auth | Multiple failed attempts | User | `userName`, `unlockTime`, `supportEmail` |
| 6 | `account_deactivated` | auth | Admin deactivation | User | `userName`, `reason`, `appealUrl` |
| 7 | `login_new_device` | auth | Login from new device/location | User | `userName`, `device`, `location`, `time` |

### 3.2 Role & Access Management

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 8 | `role_request_submitted` | role | User submits role request | User | `userName`, `roleName`, `submissionDate` |
| 9 | `role_request_pending` | role | New role request | Admin/Approver | `requesterName`, `roleName`, `justification`, `reviewUrl` |
| 10 | `role_request_approved` | role | Role request approved | User | `userName`, `roleName`, `startDate`, `dashboardUrl` |
| 11 | `role_request_rejected` | role | Role request rejected | User | `userName`, `roleName`, `reason`, `reapplyUrl` |
| 12 | `role_expiring_soon` | role | Role expires in 7 days | User | `userName`, `roleName`, `expiryDate`, `renewUrl` |
| 13 | `role_expired` | role | Role has expired | User | `userName`, `roleName`, `reapplyUrl` |
| 14 | `invitation_sent` | role | User invited to platform | Invitee | `inviterName`, `roleName`, `organizationName`, `acceptUrl` |
| 15 | `invitation_accepted` | role | Invitee accepts | Inviter | `inviteeName`, `roleName`, `profileUrl` |

### 3.3 Challenges

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 16 | `challenge_submitted` | challenge | Challenge submitted | Submitter | `challengeTitle`, `challengeCode`, `trackingUrl` |
| 17 | `challenge_assigned` | challenge | Challenge assigned for review | Reviewer | `challengeTitle`, `challengeCode`, `dueDate`, `reviewUrl` |
| 18 | `challenge_approved` | challenge | Challenge approved | Submitter, Stakeholders | `challengeTitle`, `challengeCode`, `nextSteps`, `detailUrl` |
| 19 | `challenge_rejected` | challenge | Challenge rejected | Submitter | `challengeTitle`, `reason`, `resubmitUrl` |
| 20 | `challenge_needs_info` | challenge | Additional info requested | Submitter | `challengeTitle`, `questions`, `respondUrl` |
| 21 | `challenge_status_change` | challenge | Status updated | Stakeholders | `challengeTitle`, `oldStatus`, `newStatus`, `detailUrl` |
| 22 | `challenge_match_found` | challenge | Solution matched | Challenge Owner, Provider | `challengeTitle`, `solutionName`, `matchScore`, `matchUrl` |
| 23 | `challenge_escalated` | challenge | SLA breach/escalation | Manager | `challengeTitle`, `escalationLevel`, `daysOverdue`, `actionUrl` |

### 3.4 Solutions & Proposals

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 24 | `solution_submitted` | solution | Solution registered | Provider | `solutionName`, `solutionCode`, `dashboardUrl` |
| 25 | `solution_approved` | solution | Solution approved | Provider | `solutionName`, `marketplaceUrl` |
| 26 | `solution_rejected` | solution | Solution rejected | Provider | `solutionName`, `reason`, `resubmitUrl` |
| 27 | `solution_interest` | solution | Municipality interested | Provider | `solutionName`, `municipalityName`, `contactUrl` |
| 28 | `proposal_submitted` | proposal | Proposal submitted | Provider | `proposalTitle`, `challengeTitle`, `trackingUrl` |
| 29 | `proposal_received` | proposal | New proposal received | Challenge Owner | `proposalTitle`, `providerName`, `reviewUrl` |
| 30 | `proposal_shortlisted` | proposal | Proposal shortlisted | Provider | `proposalTitle`, `challengeTitle`, `nextSteps` |
| 31 | `proposal_selected` | proposal | Proposal selected for pilot | Provider | `proposalTitle`, `challengeTitle`, `pilotUrl` |
| 32 | `proposal_rejected` | proposal | Proposal not selected | Provider | `proposalTitle`, `challengeTitle`, `feedback` |

### 3.5 Pilots

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 33 | `pilot_created` | pilot | Pilot initiated | All stakeholders | `pilotTitle`, `pilotCode`, `startDate`, `dashboardUrl` |
| 34 | `pilot_kickoff` | pilot | Pilot officially starts | Team members | `pilotTitle`, `kickoffDate`, `objectives`, `workspaceUrl` |
| 35 | `pilot_milestone_due` | pilot | Milestone due in 3 days | Responsible party | `pilotTitle`, `milestoneName`, `dueDate`, `updateUrl` |
| 36 | `pilot_milestone_completed` | pilot | Milestone completed | Stakeholders | `pilotTitle`, `milestoneName`, `nextMilestone` |
| 37 | `pilot_milestone_overdue` | pilot | Milestone overdue | Manager, Team | `pilotTitle`, `milestoneName`, `daysOverdue`, `actionUrl` |
| 38 | `pilot_kpi_alert` | pilot | KPI below threshold | Pilot Manager | `pilotTitle`, `kpiName`, `currentValue`, `threshold`, `dashboardUrl` |
| 39 | `pilot_issue_reported` | pilot | New issue logged | Pilot Manager | `pilotTitle`, `issueTitle`, `severity`, `issueUrl` |
| 40 | `pilot_issue_resolved` | pilot | Issue resolved | Reporter | `pilotTitle`, `issueTitle`, `resolution` |
| 41 | `pilot_status_change` | pilot | Status updated | Stakeholders | `pilotTitle`, `oldStatus`, `newStatus`, `detailUrl` |
| 42 | `pilot_completed` | pilot | Pilot finished | All stakeholders | `pilotTitle`, `results`, `reportUrl`, `nextSteps` |
| 43 | `pilot_extension_request` | pilot | Extension requested | Approver | `pilotTitle`, `currentEndDate`, `requestedEndDate`, `reason`, `approvalUrl` |
| 44 | `pilot_approval_required` | pilot | Pilot needs approval | Approver | `pilotTitle`, `stage`, `requestedBy`, `approvalUrl` |
| 45 | `pilot_expense_submitted` | pilot | Expense claim submitted | Finance | `pilotTitle`, `amount`, `category`, `reviewUrl` |

### 3.6 Programs

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 46 | `program_announced` | program | New program launched | Eligible users | `programName`, `description`, `deadline`, `applyUrl` |
| 47 | `program_application_received` | program | Application submitted | Applicant | `programName`, `applicationId`, `trackingUrl` |
| 48 | `program_application_reviewed` | program | Application under review | Applicant | `programName`, `reviewerName`, `expectedDate` |
| 49 | `program_accepted` | program | Accepted to program | Applicant | `programName`, `startDate`, `orientationUrl`, `nextSteps` |
| 50 | `program_rejected` | program | Not accepted | Applicant | `programName`, `feedback`, `alternativePrograms` |
| 51 | `program_deadline_reminder` | program | Deadline in 3 days | Potential applicants | `programName`, `deadline`, `applyUrl` |
| 52 | `program_cohort_start` | program | Cohort begins | Participants | `programName`, `startDate`, `schedule`, `resourcesUrl` |
| 53 | `program_mentorship_assigned` | program | Mentor assigned | Mentee, Mentor | `programName`, `mentorName`, `menteeName`, `meetingUrl` |

### 3.7 Evaluations & Reviews

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 54 | `evaluation_assigned` | evaluation | Assigned as evaluator | Expert | `entityType`, `entityTitle`, `deadline`, `evaluationUrl` |
| 55 | `evaluation_reminder` | evaluation | Evaluation due soon | Expert | `entityType`, `entityTitle`, `dueDate`, `evaluationUrl` |
| 56 | `evaluation_completed` | evaluation | Evaluation submitted | Requester | `entityType`, `entityTitle`, `evaluatorName`, `resultsUrl` |
| 57 | `panel_invitation` | evaluation | Invited to expert panel | Expert | `panelName`, `purpose`, `sessionDate`, `acceptUrl` |
| 58 | `panel_reminder` | evaluation | Panel session tomorrow | Panel members | `panelName`, `sessionDate`, `agendaUrl` |
| 59 | `feedback_requested` | evaluation | Feedback request | Stakeholder | `entityType`, `entityTitle`, `deadline`, `feedbackUrl` |
| 60 | `feedback_received` | evaluation | Feedback submitted | Entity owner | `entityType`, `entityTitle`, `fromName`, `viewUrl` |

### 3.8 Citizen Engagement

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 61 | `citizen_welcome` | citizen | Citizen registration | Citizen | `userName`, `exploreUrl`, `featuredChallenges` |
| 62 | `idea_submitted` | citizen | Idea submitted | Citizen | `ideaTitle`, `trackingUrl` |
| 63 | `idea_approved` | citizen | Idea approved | Citizen | `ideaTitle`, `pointsEarned`, `badgeEarned`, `dashboardUrl` |
| 64 | `idea_converted` | citizen | Idea became challenge | Citizen | `ideaTitle`, `challengeTitle`, `challengeUrl` |
| 65 | `vote_confirmation` | citizen | Vote recorded | Citizen | `entityTitle`, `voteType`, `totalVotes` |
| 66 | `badge_earned` | citizen | Achievement unlocked | Citizen | `badgeName`, `badgeDescription`, `pointsEarned`, `profileUrl` |
| 67 | `level_up` | citizen | New level reached | Citizen | `newLevel`, `benefits`, `nextLevelProgress`, `profileUrl` |
| 68 | `pilot_enrollment_confirmed` | citizen | Enrolled in pilot | Citizen | `pilotTitle`, `location`, `startDate`, `detailsUrl` |
| 69 | `pilot_feedback_request` | citizen | Pilot ended, feedback needed | Participant | `pilotTitle`, `feedbackUrl`, `rewardPoints` |
| 70 | `points_expiring` | citizen | Points expire in 30 days | Citizen | `expiringPoints`, `expiryDate`, `redeemUrl` |

### 3.9 Tasks & Collaboration

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 71 | `task_assigned` | task | Task assigned | Assignee | `taskTitle`, `assignedBy`, `dueDate`, `priority`, `taskUrl` |
| 72 | `task_due_reminder` | task | Task due tomorrow | Assignee | `taskTitle`, `dueDate`, `taskUrl` |
| 73 | `task_overdue` | task | Task overdue | Assignee, Manager | `taskTitle`, `daysOverdue`, `taskUrl` |
| 74 | `task_completed` | task | Task marked complete | Assigner | `taskTitle`, `completedBy`, `completionDate` |
| 75 | `comment_mention` | task | Mentioned in comment | User | `mentionedBy`, `entityType`, `entityTitle`, `commentPreview`, `commentUrl` |
| 76 | `comment_reply` | task | Reply to your comment | User | `repliedBy`, `entityTitle`, `replyPreview`, `commentUrl` |

### 3.10 Events & Bookings

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 77 | `event_invitation` | event | Invited to event | Invitee | `eventTitle`, `eventDate`, `location`, `rsvpUrl` |
| 78 | `event_registration_confirmed` | event | Registration confirmed | Registrant | `eventTitle`, `eventDate`, `location`, `calendarUrl`, `qrCode` |
| 79 | `event_reminder` | event | Event tomorrow | Registrant | `eventTitle`, `eventDate`, `location`, `directionsUrl` |
| 80 | `event_cancelled` | event | Event cancelled | Registrants | `eventTitle`, `originalDate`, `reason`, `alternativeUrl` |
| 81 | `event_updated` | event | Event details changed | Registrants | `eventTitle`, `changes`, `newDetailsUrl` |
| 82 | `living_lab_booking_confirmed` | booking | Booking confirmed | User | `labName`, `bookingDate`, `duration`, `prepInfo` |
| 83 | `living_lab_booking_reminder` | booking | Booking tomorrow | User | `labName`, `bookingDate`, `checklistUrl` |
| 84 | `demo_request_received` | booking | Demo requested | Provider | `requesterName`, `solutionName`, `preferredDate`, `respondUrl` |
| 85 | `demo_scheduled` | booking | Demo confirmed | Requester | `solutionName`, `demoDate`, `meetingUrl` |

### 3.11 Contracts & Finance

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 86 | `contract_created` | contract | Contract initiated | Parties | `contractTitle`, `contractCode`, `reviewUrl` |
| 87 | `contract_pending_signature` | contract | Awaiting signature | Signatory | `contractTitle`, `fromParty`, `signUrl` |
| 88 | `contract_signed` | contract | All parties signed | Parties | `contractTitle`, `signedDate`, `downloadUrl` |
| 89 | `contract_expiring` | contract | Expires in 30 days | Parties | `contractTitle`, `expiryDate`, `renewUrl` |
| 90 | `invoice_issued` | finance | Invoice created | Recipient | `invoiceNumber`, `amount`, `dueDate`, `payUrl` |
| 91 | `payment_received` | finance | Payment confirmed | Payer | `invoiceNumber`, `amount`, `receiptUrl` |
| 92 | `payment_overdue` | finance | Payment overdue | Payer | `invoiceNumber`, `amount`, `daysOverdue`, `payUrl` |

### 3.12 Sandboxes & Regulatory

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 93 | `sandbox_application_received` | sandbox | Application submitted | Applicant | `sandboxName`, `applicationId`, `trackingUrl` |
| 94 | `sandbox_application_approved` | sandbox | Application approved | Applicant | `sandboxName`, `startDate`, `guidelinesUrl` |
| 95 | `sandbox_milestone_due` | sandbox | Milestone approaching | Participant | `sandboxName`, `milestoneName`, `dueDate` |
| 96 | `exemption_granted` | sandbox | Regulatory exemption granted | Applicant | `exemptionType`, `validUntil`, `conditionsUrl` |
| 97 | `exemption_expiring` | sandbox | Exemption expires soon | Holder | `exemptionType`, `expiryDate`, `renewUrl` |
| 98 | `compliance_alert` | sandbox | Compliance issue detected | Participant | `sandboxName`, `issue`, `deadline`, `resolveUrl` |

### 3.13 System & Administrative

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 99 | `system_maintenance` | system | Scheduled maintenance | All users | `maintenanceDate`, `duration`, `affectedServices` |
| 100 | `platform_announcement` | system | Important announcement | All users | `title`, `message`, `learnMoreUrl` |
| 101 | `weekly_digest` | system | Weekly (if subscribed) | Subscribed users | `challengeCount`, `pilotUpdates`, `upcomingEvents`, `dashboardUrl` |
| 102 | `monthly_report` | system | Monthly summary | Managers | `month`, `metrics`, `highlights`, `reportUrl` |
| 103 | `export_ready` | system | Data export completed | Requester | `exportType`, `downloadUrl`, `expiresIn` |
| 104 | `backup_completed` | system | Backup successful | Admin | `backupDate`, `size`, `location` |
| 105 | `security_alert` | system | Security event detected | Admin | `alertType`, `details`, `actionRequired`, `dashboardUrl` |
| 106 | `quota_warning` | system | Usage quota at 80% | Admin | `quotaType`, `currentUsage`, `limit`, `upgradeUrl` |
| 107 | `integration_failure` | system | External integration failed | Admin | `integrationName`, `errorDetails`, `retryUrl` |

### 3.14 R&D & Research

| # | Template Key | Category | Trigger | Recipients | Variables |
|---|--------------|----------|---------|------------|-----------|
| 108 | `rd_call_announced` | research | New R&D call published | Researchers | `callTitle`, `deadline`, `eligibility`, `applyUrl` |
| 109 | `rd_proposal_submitted` | research | Proposal submitted | Researcher | `callTitle`, `proposalId`, `trackingUrl` |
| 110 | `rd_proposal_reviewed` | research | Review completed | Researcher | `callTitle`, `score`, `feedback`, `detailUrl` |
| 111 | `rd_project_approved` | research | Project approved for funding | Researcher | `projectTitle`, `fundingAmount`, `startDate`, `nextSteps` |
| 112 | `rd_progress_due` | research | Progress report due | Researcher | `projectTitle`, `reportType`, `dueDate`, `submitUrl` |

---

## 4. Database Schema

### 4.1 Email Settings (Global Configuration)

```sql
CREATE TABLE email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by VARCHAR(255)
);

-- Default settings
INSERT INTO email_settings (setting_key, setting_value, description) VALUES
('logo_url', '"https://saudiinnovates.sa/logo.png"', 'Platform logo for email headers'),
('default_header_gradient_start', '"#006C35"', 'Default gradient start color (Saudi green)'),
('default_header_gradient_end', '"#00A651"', 'Default gradient end color'),
('primary_button_color', '"#006C35"', 'Primary CTA button color'),
('footer_social_links', '{"twitter": "https://twitter.com/saudiinnovates", "linkedin": "https://linkedin.com/company/saudiinnovates"}', 'Social media links'),
('footer_contact_email', '"support@saudiinnovates.sa"', 'Support email in footer'),
('footer_contact_phone', '"+966-XXX-XXX-XXXX"', 'Contact phone'),
('footer_address', '"Riyadh, Saudi Arabia"', 'Physical address'),
('unsubscribe_url_base', '"https://saudiinnovates.sa/unsubscribe"', 'Base URL for unsubscribe'),
('default_from_email', '"noreply@saudiinnovates.sa"', 'Default sender email'),
('default_from_name_en', '"Saudi Innovates"', 'Default sender name (English)'),
('default_from_name_ar', '"ابتكر السعودية"', 'Default sender name (Arabic)');
```

### 4.2 Email Templates

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  
  -- Template metadata
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  
  -- Content (bilingual)
  subject_en TEXT NOT NULL,
  subject_ar TEXT,
  body_en TEXT NOT NULL,
  body_ar TEXT,
  
  -- HTML structure options
  is_html BOOLEAN DEFAULT true,
  use_header BOOLEAN DEFAULT true,
  use_footer BOOLEAN DEFAULT true,
  header_title_en VARCHAR(255),
  header_title_ar VARCHAR(255),
  header_gradient_start VARCHAR(20),
  header_gradient_end VARCHAR(20),
  header_icon VARCHAR(50),
  
  -- CTA Button (optional)
  cta_text_en VARCHAR(100),
  cta_text_ar VARCHAR(100),
  cta_url_variable VARCHAR(100),
  
  -- Variables definition
  variables JSONB DEFAULT '[]',
  
  -- Preference mapping
  preference_category VARCHAR(50),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Index for fast lookups
CREATE INDEX idx_email_templates_key ON email_templates(template_key);
CREATE INDEX idx_email_templates_category ON email_templates(category);
```

### 4.3 Email Logs

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template reference
  template_id UUID REFERENCES email_templates(id),
  template_key VARCHAR(100),
  
  -- Recipient info
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID,
  
  -- Content sent
  subject TEXT NOT NULL,
  body_preview TEXT,
  language VARCHAR(10) DEFAULT 'en',
  
  -- Variables used
  variables_used JSONB,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'queued',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  entity_type VARCHAR(50),
  entity_id UUID,
  triggered_by VARCHAR(255),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for analytics
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_template ON email_logs(template_key);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at);
```

### 4.4 User Email Preferences

```sql
-- Extends existing user_notification_preferences or creates new
ALTER TABLE user_notification_preferences ADD COLUMN IF NOT EXISTS 
  email_categories JSONB DEFAULT '{
    "auth": true,
    "role": true,
    "challenge": true,
    "solution": true,
    "pilot": true,
    "program": true,
    "evaluation": true,
    "citizen": true,
    "task": true,
    "event": true,
    "contract": true,
    "sandbox": true,
    "system": true,
    "research": true,
    "marketing": false,
    "digest": false
  }';
```

---

## 5. Edge Function: send-email (Enhanced)

### 5.1 Function Flow

```
1. Receive request with template_key and variables
2. Fetch template from database
3. Get recipient's preferences
   - Check email_enabled
   - Check category preference
   - Get language preference
4. If preferences allow:
   - Fetch email_settings for header/footer
   - Interpolate variables into subject and body
   - Build HTML with header/body/footer
   - Apply RTL if Arabic
   - Send via Resend API
   - Log to email_logs
5. Return success/failure
```

### 5.2 Request Schema

```typescript
interface SendEmailRequest {
  template_key: string;
  recipient_email: string;
  recipient_user_id?: string;
  variables: Record<string, string>;
  language?: 'en' | 'ar';  // Override user preference
  force_send?: boolean;     // Skip preference check (for critical emails)
  entity_type?: string;
  entity_id?: string;
}
```

### 5.3 Critical Emails (Always Send)

These emails bypass preference checks:
- `email_verification`
- `password_reset`
- `password_changed`
- `account_locked`
- `account_deactivated`
- `security_alert`
- `login_new_device`

### 5.4 Usage Examples

#### From Frontend (React)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Send a template-based email
const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      template_key: 'welcome_new_user',
      recipient_email: userEmail,
      variables: {
        userName: userName,
        loginUrl: window.location.origin
      },
      language: 'en'
    }
  });
  
  if (error) throw error;
  return data;
};

// Send with preference bypass (critical)
const sendPasswordReset = async (userEmail: string, resetUrl: string) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      template_key: 'password_reset',
      recipient_email: userEmail,
      variables: {
        userName: 'User',
        resetUrl: resetUrl,
        expiresIn: '1 hour'
      },
      force_send: true
    }
  });
  
  return data;
};
```

#### From Edge Functions

```typescript
// In another edge function
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Trigger email via function invoke
await supabase.functions.invoke('send-email', {
  body: {
    template_key: 'challenge_approved',
    recipient_email: challenge.challenge_owner_email,
    variables: {
      challengeTitle: challenge.title_en,
      challengeCode: challenge.code,
      detailUrl: `https://saudiinnovates.sa/challenges/${challenge.id}`
    }
  }
});
```

#### Direct Content (Backward Compatible)

```typescript
// Send without template (legacy support)
const { data } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Custom Email',
    html: '<p>Hello World</p>'
  }
});
```

---

## 6. Admin UI Features

### 6.1 Template List View
- Filter by category
- Search by name/key
- Status toggle (active/inactive)
- Quick preview
- Usage stats (sent count, open rate)

### 6.2 Template Editor
- Split view: English / Arabic
- WYSIWYG editor with formatting
- Variable insertion toolbar
- Header customization (gradient colors, title, icon)
- CTA button configuration
- Live preview (desktop/mobile, EN/AR)
- Test send functionality
- Version history

### 6.3 Email Settings
- Logo upload
- Default colors
- Footer content
- Social links
- Contact information

### 6.4 Email Logs & Analytics
- Sent/delivered/opened/clicked metrics
- Filter by template, date, status
- Export capabilities
- Bounce management

---

## 7. Implementation Phases

### Phase 1: Database & Core (Week 1)
- [ ] Create `email_settings` table with defaults
- [ ] Create `email_templates` table
- [ ] Create `email_logs` table
- [ ] Update `user_notification_preferences`
- [ ] Seed all 112 templates with default content

### Phase 2: Edge Function (Week 1-2)
- [ ] Enhance `send-email` function
- [ ] Template fetching and caching
- [ ] Variable interpolation
- [ ] HTML builder with header/footer
- [ ] RTL support
- [ ] Preference checking
- [ ] Logging

### Phase 3: Admin UI (Week 2-3)
- [ ] Redesign EmailTemplateEditor page
- [ ] Template list with filtering
- [ ] WYSIWYG editor integration
- [ ] Variable insertion
- [ ] Live preview
- [ ] Email settings page
- [ ] Test send

### Phase 4: Integration (Week 3-4)
- [ ] Update all edge functions to use templates
- [ ] Connect notification triggers
- [ ] Migrate hardcoded templates
- [ ] Add email preference UI to user settings
- [ ] Analytics dashboard

---

## 8. Variable Naming Conventions

| Convention | Example | Description |
|------------|---------|-------------|
| camelCase | `userName` | Standard variables |
| Url suffix | `detailUrl`, `dashboardUrl` | Links |
| Date suffix | `startDate`, `dueDate` | Dates |
| Count suffix | `challengeCount` | Numbers |
| Name suffix | `providerName` | Entity names |
| Title suffix | `challengeTitle` | Entity titles |
| Code suffix | `pilotCode` | Reference codes |

---

## 9. Localization Guidelines

### English
- Professional but friendly tone
- Action-oriented subject lines
- Clear CTAs

### Arabic
- Formal tone (فصحى)
- Right-to-left layout
- Arabic numerals
- Culturally appropriate greetings

---

## 10. Security Considerations

1. **Unsubscribe tokens**: Signed, time-limited tokens
2. **Variable sanitization**: Prevent XSS in variables
3. **Rate limiting**: Max emails per user per hour
4. **Bounce handling**: Auto-disable after multiple bounces
5. **PII protection**: No sensitive data in logs
6. **Audit trail**: Track all template changes

---

*Document Version: 1.0*
*Last Updated: December 2024*
