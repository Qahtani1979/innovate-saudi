# Communication System - Implementation Tracker

## Overview

This document tracks the implementation progress of all identified gaps in the communication system.

**Created**: 2025-12-13
**Last Updated**: 2025-12-13
**Total Tasks**: 59
**Completed**: 47

---

## Progress Summary

| Phase | Description | Tasks | Completed | Status |
|-------|-------------|-------|-----------|--------|
| Phase 1 | Frontend Integration | 41 | 41 | ✅ Complete |
| Phase 2 | Digest Processor | 6 | 6 | ✅ Complete |
| Phase 3 | Scheduled Reminders | 3 | 0 | 🔴 Not Started |
| Phase 4 | Unsubscribe Endpoint | 4 | 0 | 🔴 Not Started |
| Phase 5 | Analytics Dashboard | 5 | 0 | 🔴 Not Started |
| Phase 6 | Minor Improvements | 4 | 0 | 🔴 Not Started |

---

## Phase 1: Frontend Integration ✅ COMPLETE

**Priority**: ✅ DONE
**Verified**: 2025-12-13

All 41+ frontend files are integrated with `useEmailTrigger` hook calling `email-trigger-hub`.

---

## Phase 2: Digest Processor ✅ COMPLETE

**Priority**: ✅ DONE
**Verified**: 2025-12-13 (Database verified)

| # | Task | Type | Status | Verification |
|---|------|------|--------|--------------|
| 2.1 | Create `email_digest_queue` table | Migration | ✅ Done | Table exists in DB |
| 2.2 | Create `digest-processor` edge function | Edge Function | ✅ Done | File at `supabase/functions/digest-processor/index.ts` |
| 2.3 | Add daily digest cron job (5 AM UTC) | SQL Insert | ✅ Done | `process-daily-digest: 0 5 * * *` |
| 2.4 | Add weekly digest cron job (Monday 5 AM) | SQL Insert | ✅ Done | `process-weekly-digest: 0 5 * * 1` |
| 2.5 | Update `email-trigger-hub` to check frequency | Edge Function | ✅ Done | Lines 222-244 queue to digest |
| 2.6 | Create digest email templates | DB Insert | ✅ Done | `digest_daily`, `digest_weekly` exist |

---

## Phase 3: Scheduled Reminders

**Priority**: 🟠 MEDIUM
**Estimated Effort**: 2 hours
**Description**: Automated reminder emails for tasks, contracts, events, and pilot milestones.

| # | Task | Type | Status | Details |
|---|------|------|--------|---------|
| 3.1 | Create `send-scheduled-reminders` edge function | Edge Function | ⬜ Pending | See requirements below |
| 3.2 | Add daily reminder cron job (8 AM UTC) | SQL Insert | ⬜ Pending | `0 8 * * *` schedule |
| 3.3 | Test with existing data | Manual | ⬜ Pending | Verify all entity types |

### Edge Function Requirements (`send-scheduled-reminders`)
```typescript
// File: supabase/functions/send-scheduled-reminders/index.ts
// Purpose: Query entities needing reminders and trigger emails

// 1. Tasks due in 24 hours
SELECT id, title, assigned_to_email, due_date FROM tasks 
WHERE due_date BETWEEN now() AND now() + interval '24 hours' 
AND status NOT IN ('completed', 'cancelled')
AND reminder_sent IS NULL;

// 2. Contracts expiring in 7 days
SELECT id, title_en, signed_by_municipality, end_date FROM contracts
WHERE end_date BETWEEN now() AND now() + interval '7 days'
AND status = 'active';

// 3. Events starting in 24 hours
SELECT id, title_en, created_by FROM events
WHERE start_date BETWEEN now() AND now() + interval '24 hours';

// 4. Pilot milestones due in 48 hours
SELECT pm.id, pm.name, p.pilot_owner_email, pm.target_date 
FROM pilot_milestones pm
JOIN pilots p ON pm.pilot_id = p.id
WHERE pm.target_date BETWEEN now() AND now() + interval '48 hours'
AND pm.status NOT IN ('completed', 'verified');

// For each result, call email-trigger-hub with appropriate trigger:
// - task.reminder
// - contract.expiring
// - event.reminder
// - pilot.milestone_reminder
```

---

## Phase 4: Unsubscribe Endpoint

**Priority**: 🟠 MEDIUM (Legal Compliance - CAN-SPAM / GDPR)
**Estimated Effort**: 1.5 hours
**Description**: Allow users to unsubscribe from email categories via link in emails.

| # | Task | Type | Status | Details |
|---|------|------|--------|---------|
| 4.1 | Create `unsubscribe` edge function | Edge Function | ⬜ Pending | See requirements below |
| 4.2 | Update `send-email` to add unsubscribe link | Edge Function | ⬜ Pending | Generate JWT token |
| 4.3 | Create `/unsubscribe` page | Frontend | ⬜ Pending | See UI mockup below |
| 4.4 | Add re-subscribe functionality | Frontend | ⬜ Pending | Button on page |

### Edge Function Requirements (`unsubscribe`)
```typescript
// File: supabase/functions/unsubscribe/index.ts
// Purpose: Handle unsubscribe link clicks

// Accept GET request: /unsubscribe?token=xxx
// 1. Decode JWT token (contains: user_email, category, iat)
// 2. Validate token not expired (30 days max)
// 3. Update user_notification_preferences:
//    - If category = 'all': set email_notifications = false
//    - If category = specific: set email_categories[category] = false
// 4. Return HTML confirmation page

// Token generation (in send-email):
const token = jwt.sign(
  { email: recipientEmail, category: preferenceCategory },
  UNSUBSCRIBE_SECRET,
  { expiresIn: '30d' }
);
const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${token}`;
```

### UI Requirements (`/unsubscribe` page)
```
┌─────────────────────────────────────────────────────────────────────┐
│                         🔔 Email Preferences                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│     ✅ You have been unsubscribed from [category] emails            │
│                                                                     │
│     Email: user@example.com                                         │
│     Category: Challenges                                            │
│                                                                     │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │  Changed your mind?                                     │     │
│     │  [Re-subscribe to these emails]                         │     │
│     └─────────────────────────────────────────────────────────┘     │
│                                                                     │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │  Want to manage all your preferences?                   │     │
│     │  [Go to Notification Settings]                          │     │
│     └─────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: Analytics Dashboard

**Priority**: 🟡 LOW
**Estimated Effort**: 2.5 hours
**Description**: Visual analytics dashboard for email performance in Communications Hub.

| # | Task | Type | Status | Details |
|---|------|------|--------|---------|
| 5.1 | Create `EmailAnalyticsDashboard.jsx` | Frontend | ⬜ Pending | See UI mockup below |
| 5.2 | Add "Analytics" tab to Communications Hub | Frontend | ⬜ Pending | 6th tab with BarChart3 icon |
| 5.3 | Implement date range filter | Frontend | ⬜ Pending | 7/30/90 days selector |
| 5.4 | Add category breakdown chart | Frontend | ⬜ Pending | Pie/donut chart |
| 5.5 | Add trend line chart | Frontend | ⬜ Pending | Sent/opened/clicked over time |

### UI Requirements (`EmailAnalyticsDashboard.jsx`)
```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Email Analytics                              [Last 30 days ▼]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  12,450  │  │  11,890  │  │   4,520  │  │   1,230  │  │   120  ││
│  │   Sent   │  │Delivered │  │  Opened  │  │ Clicked  │  │ Failed ││
│  │          │  │   95.5%  │  │   36.0%  │  │   9.8%   │  │   1.0% ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                                     │
│  ┌────────────────────────────────┐  ┌─────────────────────────────┐│
│  │   📈 Email Volume Over Time   │  │  📊 By Category             ││
│  │   [Recharts LineChart]        │  │  [Recharts PieChart]        ││
│  │   - Lines: sent, opened       │  │  - Challenges: 25%          ││
│  │   - X-axis: dates             │  │  - Pilots: 20%              ││
│  │   - Y-axis: count             │  │  - Auth: 15%                ││
│  │                               │  │  - Programs: 15%            ││
│  │                               │  │  - Events: 10%              ││
│  │                               │  │  - Other: 15%               ││
│  └────────────────────────────────┘  └─────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📋 Top Performing Templates                                    ││
│  │  ┌────────────────────────────┬───────┬────────┬───────────────┐││
│  │  │ Template                   │ Sent  │ Opened │ Open Rate     │││
│  │  ├────────────────────────────┼───────┼────────┼───────────────┤││
│  │  │ welcome_email              │ 2,340 │ 1,872  │ 80.0%         │││
│  │  │ challenge_approved         │ 890   │ 623    │ 70.0%         │││
│  │  │ pilot_kickoff              │ 456   │ 365    │ 80.0%         │││
│  │  │ event_registration         │ 234   │ 187    │ 79.9%         │││
│  │  │ task_assigned              │ 189   │ 151    │ 79.9%         │││
│  │  └────────────────────────────┴───────┴────────┴───────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Component Structure
```jsx
// src/components/communications/EmailAnalyticsDashboard.jsx

// Data queries needed:
// 1. Stats summary: SELECT status, COUNT(*) FROM email_logs WHERE created_at > X GROUP BY status
// 2. Category breakdown: SELECT template_key, COUNT(*) FROM email_logs WHERE created_at > X GROUP BY template_key
// 3. Time series: SELECT DATE(created_at), status, COUNT(*) FROM email_logs WHERE created_at > X GROUP BY 1, 2
// 4. Top templates: SELECT template_key, COUNT(*) as sent, SUM(CASE WHEN status='opened' THEN 1 ELSE 0 END) as opened 
//                   FROM email_logs WHERE created_at > X GROUP BY template_key ORDER BY sent DESC LIMIT 10

// Dependencies: recharts (already installed), @/components/ui/* (shadcn)
```

### CommunicationsHub.jsx Changes
```jsx
// Add 6th tab:
import { BarChart3 } from 'lucide-react';
import EmailAnalyticsDashboard from '@/components/communications/EmailAnalyticsDashboard';

// Update TabsList to grid-cols-6
<TabsList className="grid grid-cols-6 w-full max-w-4xl">
  ...existing 5 tabs...
  <TabsTrigger value="analytics" className="gap-2">
    <BarChart3 className="h-4 w-4" />
    {t({ en: 'Analytics', ar: 'التحليلات' })}
  </TabsTrigger>
</TabsList>

// Add TabsContent:
<TabsContent value="analytics">
  <EmailAnalyticsDashboard />
</TabsContent>
```

---

## Phase 6: Minor Improvements

**Priority**: 🟡 LOW
**Estimated Effort**: 1.5 hours
**Description**: UX polish and quality-of-life improvements.

| # | Task | Type | Status | Details |
|---|------|------|--------|---------|
| 6.1 | Add "Retry" button for failed emails | Frontend | ⬜ Pending | In EmailLogsViewer detail modal |
| 6.2 | Add digest queue viewer | Frontend | ⬜ Pending | New component or tab |
| 6.3 | Add pending email queue viewer | Frontend | ⬜ Pending | Show email_queue items |
| 6.4 | Add bounce cleanup job | Edge Function | ⬜ Pending | Mark users with 3+ bounces |

### Retry Button Implementation
```jsx
// In EmailLogsViewer.jsx, add to the detail dialog when status === 'failed':
<Button
  variant="outline"
  onClick={async () => {
    await supabase.functions.invoke('email-trigger-hub', {
      body: {
        trigger: selectedLog.template_key,
        recipient_email: selectedLog.recipient_email,
        variables: selectedLog.variables_used,
        language: selectedLog.language
      }
    });
    // Update retry_count in email_logs
    await supabase.from('email_logs')
      .update({ retry_count: (selectedLog.retry_count || 0) + 1 })
      .eq('id', selectedLog.id);
    refetch();
    toast.success('Email retry queued');
  }}
>
  <RefreshCw className="h-4 w-4 mr-2" />
  Retry Send
</Button>
```

### Digest Queue Viewer (Optional Tab or Section)
```
┌─────────────────────────────────────────────────────────────────────┐
│  📬 Pending Digest Items                            [Refresh]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Daily Digests (45 items for 12 users)                              │
│  ┌────────────────────────────────┬───────────┬───────────────────┐ │
│  │ User                           │ Items     │ Next Send         │ │
│  ├────────────────────────────────┼───────────┼───────────────────┤ │
│  │ user1@example.com              │ 5 items   │ Tomorrow 5 AM     │ │
│  │ user2@example.com              │ 3 items   │ Tomorrow 5 AM     │ │
│  └────────────────────────────────┴───────────┴───────────────────┘ │
│                                                                     │
│  Weekly Digests (23 items for 8 users)                              │
│  ┌────────────────────────────────┬───────────┬───────────────────┐ │
│  │ User                           │ Items     │ Next Send         │ │
│  ├────────────────────────────────┼───────────┼───────────────────┤ │
│  │ user3@example.com              │ 8 items   │ Monday 5 AM       │ │
│  └────────────────────────────────┴───────────┴───────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Existing Components (Verified)

| Component | Location | Status |
|-----------|----------|--------|
| `EmailTemplateEditorContent.jsx` | `src/components/communications/` | ✅ Active |
| `EmailLogsViewer.jsx` | `src/components/communications/` | ✅ Active |
| `EmailSettingsEditor.jsx` | `src/components/communications/` | ✅ Active |
| `UserPreferencesOverview.jsx` | `src/components/communications/` | ✅ Active |
| `CampaignManager.jsx` | `src/components/communications/` | ✅ Active |
| `CommunicationAnalytics.jsx` | `src/components/communications/` | ✅ Exists (basic) |

---

## Existing Edge Functions (Verified)

| Function | Location | Status |
|----------|----------|--------|
| `send-email` | `supabase/functions/send-email/` | ✅ Active |
| `email-trigger-hub` | `supabase/functions/email-trigger-hub/` | ✅ Active |
| `campaign-sender` | `supabase/functions/campaign-sender/` | ✅ Active |
| `queue-processor` | `supabase/functions/queue-processor/` | ✅ Active |
| `resend-webhook` | `supabase/functions/resend-webhook/` | ✅ Active |
| `digest-processor` | `supabase/functions/digest-processor/` | ✅ Active |

---

## Database Tables (Verified)

| Table | Status | Records |
|-------|--------|---------|
| `email_templates` | ✅ Active | 126+ templates |
| `email_logs` | ✅ Active | Tracking all emails |
| `email_settings` | ✅ Active | Global config |
| `email_campaigns` | ✅ Active | Campaign definitions |
| `campaign_recipients` | ✅ Active | Recipient tracking |
| `email_trigger_config` | ✅ Active | 96 triggers |
| `email_queue` | ✅ Active | Delayed emails |
| `email_digest_queue` | ✅ Active | Digest aggregation |
| `user_notification_preferences` | ✅ Active | Per-user prefs |

---

## Cron Jobs (Verified)

| Job Name | Schedule | Status |
|----------|----------|--------|
| `process-daily-digest` | `0 5 * * *` (5 AM UTC daily) | ✅ Active |
| `process-weekly-digest` | `0 5 * * 1` (5 AM UTC Monday) | ✅ Active |
| `send-scheduled-reminders` | `0 8 * * *` (8 AM UTC daily) | ⬜ Pending |

---

## Change Log

| Date | Phase | Task | Status | Notes |
|------|-------|------|--------|-------|
| 2025-12-13 | - | Document created | ✅ | Initial tracking |
| 2025-12-13 | 1 | Verified 41+ integrations | ✅ | Frontend complete |
| 2025-12-13 | 2 | Full digest system | ✅ | Table, function, crons, templates verified |

---

## Recommended Implementation Order

1. **Phase 4: Unsubscribe** (Legal compliance - do before marketing campaigns)
2. **Phase 3: Scheduled Reminders** (High value automation)
3. **Phase 5: Analytics Dashboard** (Visibility)
4. **Phase 6: Minor Improvements** (Polish)

---

## Dependencies

| Dependency | Status |
|------------|--------|
| `RESEND_API_KEY` | ✅ Configured |
| `pg_cron` extension | ✅ Enabled |
| `pg_net` extension | ✅ Enabled |
| `recharts` package | ✅ Installed |
