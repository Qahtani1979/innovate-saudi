# Campaign Communication System Documentation

## Overview

The Campaign System enables bulk email sending to targeted audiences with template selection, scheduling, and analytics tracking.

**Last Updated**: 2025-12-13
**System Status**: ✅ Fully Operational
**Integration Coverage**: 94% (50/53 module integrations)

## Current Status

| Component | Status |
|-----------|--------|
| Campaign Manager UI | ✅ Active |
| Campaign Sender Edge Function | ✅ Deployed |
| Scheduled Campaign Processing | ✅ Cron active |
| Audience Targeting | ✅ Implemented |
| Analytics Tracking | ✅ Via webhooks |

---

## Campaigns vs Triggers

The email system has **two distinct flows** that share the same template infrastructure:

| Aspect | Campaigns | Triggers |
|--------|-----------|----------|
| **Purpose** | Manual bulk marketing emails | Automated event-driven emails |
| **Initiated By** | Admin via Communications Hub UI | Code events (status change, user action) |
| **Recipients** | Large audience segments | Single user or small group |
| **Template Lookup** | Via `email_campaigns.template_id` | Via `email_trigger_config.template_key` |
| **Variables** | Defined per campaign | Extracted from entity data |
| **Examples** | Newsletter, feature announcement | Challenge approved, task assigned |
| **Edge Function** | `campaign-sender` | `email-trigger-hub` |

### Shared Infrastructure

Both flows use:
- **`email_templates`** - Same template storage (126 templates)
- **`email_logs`** - Same logging/tracking
- **`send-email`** - Same Resend delivery function
- **User preferences** - Same opt-out handling
- **`resend-webhook`** - Same delivery tracking

### When to Use Each

**Use Campaigns when:**
- Sending marketing or announcement emails
- Targeting a filtered audience segment
- Admin controls timing and content
- Bulk sending to many recipients
- Newsletters, promotions, surveys

**Use Triggers when:**
- Email is in response to a user action or system event
- Recipients are determined by the event context
- Variables come from entity data (challenge, pilot, task)
- Single or few recipients per event
- Transactional emails

---

## Architecture

### Database Tables

| Table | Purpose |
|-------|---------|
| `email_campaigns` | Main campaign metadata, status, and statistics |
| `campaign_recipients` | Individual recipient tracking with delivery status |
| `email_templates` | Reusable email templates (shared with triggers) |
| `email_logs` | Detailed delivery logs (shared) |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `campaign-sender` | Processes campaign sending, preview, pause, resume |
| `send-email` | Core email sending via Resend (shared by both flows) |
| `resend-webhook` | Tracks delivery, opens, clicks, bounces |

### Cron Job

| Job | Schedule | Purpose |
|-----|----------|---------|
| `process-scheduled-campaigns` | Every 5 minutes | Processes scheduled campaigns |

---

## Campaign Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Create Draft  │────▶│  Select Template │────▶│  Define Audience│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Campaign Sent │◀────│  Send/Schedule  │◀────│  Preview & Test │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Campaign Status Flow

```
draft ──▶ scheduled ──▶ sending ──▶ completed
  │           │            │
  └───────────┴────────────┴──▶ cancelled
                           │
                           └──▶ paused ──▶ sending
```

---

## Communications Hub - Campaign Manager

Access at `/communications-hub` → Campaigns tab

### Features

- **Create Campaign** - New campaign with template selection
- **Audience Targeting** - Filter by role, municipality, sector, or custom list
- **Preview** - See rendered email before sending
- **Schedule** - Set future send date/time
- **Analytics** - Track opens, clicks, bounces

---

## Database Schema

### `email_campaigns` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Campaign name |
| `description` | TEXT | Campaign description |
| `template_id` | UUID | Selected template |
| `audience_type` | VARCHAR | all/role/municipality/sector/custom |
| `audience_filter` | JSONB | Filter criteria |
| `campaign_variables` | JSONB | Custom variables |
| `program_id` | UUID | FK to programs (Strategy Integration) |
| `challenge_id` | UUID | FK to challenges (Strategy Integration) |
| `recipient_count` | INTEGER | Total recipients |
| `sent_count` | INTEGER | Successfully sent |
| `opened_count` | INTEGER | Unique opens |
| `clicked_count` | INTEGER | Unique clicks |
| `failed_count` | INTEGER | Failed deliveries |
| `status` | VARCHAR | draft/scheduled/sending/completed/cancelled |
| `scheduled_at` | TIMESTAMPTZ | Scheduled send time |
| `started_at` | TIMESTAMPTZ | When sending started |
| `completed_at` | TIMESTAMPTZ | When sending finished |
| `created_by` | VARCHAR | Admin email |
| `created_at` | TIMESTAMPTZ | Creation time |

> **Strategy Integration**: Campaigns can be linked to programs or challenges via `program_id` and `challenge_id` fields. This enables indirect strategy chain: Campaign → Program/Challenge → Strategic Plan.

### `campaign_recipients` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `campaign_id` | UUID | Campaign reference |
| `recipient_email` | VARCHAR | Recipient address |
| `recipient_user_id` | UUID | User reference |
| `status` | VARCHAR | pending/sent/failed |
| `sent_at` | TIMESTAMPTZ | When sent |
| `email_log_id` | UUID | Reference to email_logs |
| `error_message` | TEXT | Error if failed |

---

## Audience Targeting

### Audience Types

| Type | Description | Filter Example |
|------|-------------|----------------|
| `all` | All active users | `{}` |
| `role` | By user role | `{ "role": "municipality_staff" }` |
| `municipality` | By municipality | `{ "municipality_id": "uuid" }` |
| `sector` | By sector | `{ "sector_id": "uuid" }` |
| `custom` | Manual email list | `{ "custom_emails": ["a@b.com", "c@d.com"] }` |

### Audience Resolution

The `campaign-sender` edge function resolves audiences:

```javascript
switch (audience_type) {
  case 'all':
    recipients = await fetchAllUsers();
    break;
  case 'role':
    recipients = await fetchUsersByRole(filter.role);
    break;
  case 'municipality':
    recipients = await fetchUsersByMunicipality(filter.municipality_id);
    break;
  case 'sector':
    recipients = await fetchUsersBySector(filter.sector_id);
    break;
  case 'custom':
    recipients = filter.custom_emails.map(email => ({ email }));
    break;
}
```

---

## Campaign Variables

Templates can include variables replaced during sending:

### Template
```html
<p>Hello {{userName}},</p>
<p>{{customMessage}}</p>
<a href="{{actionUrl}}">{{ctaText}}</a>
```

### Campaign Variables
```json
{
  "customMessage": "Join us for our annual summit!",
  "actionUrl": "https://summit.example.com",
  "ctaText": "Register Now"
}
```

### Variable Resolution Order

1. Campaign-level variables
2. Recipient-level variables (user name, email)
3. System variables (date, platform name, year)

---

## Usage Examples

### Creating a Campaign

```javascript
const { data } = await supabase
  .from('email_campaigns')
  .insert({
    name: 'December Newsletter',
    description: 'Monthly update for all users',
    template_id: 'uuid-of-template',
    audience_type: 'all',
    audience_filter: {},
    campaign_variables: {
      month: 'December',
      year: '2024'
    },
    status: 'draft',
    created_by: currentUser.email
  });
```

### Sending a Campaign

```javascript
await supabase.functions.invoke('campaign-sender', {
  body: {
    campaign_id: campaignId,
    action: 'send'
  }
});
```

### Preview Before Send

```javascript
await supabase.functions.invoke('campaign-sender', {
  body: {
    campaign_id: campaignId,
    action: 'preview',
    preview_email: 'test@example.com'
  }
});
```

### Scheduling a Campaign

```javascript
await supabase
  .from('email_campaigns')
  .update({
    scheduled_at: '2024-12-25T09:00:00Z',
    status: 'scheduled'
  })
  .eq('id', campaignId);
```

### Pausing/Resuming

```javascript
// Pause
await supabase.functions.invoke('campaign-sender', {
  body: { campaign_id: campaignId, action: 'pause' }
});

// Resume
await supabase.functions.invoke('campaign-sender', {
  body: { campaign_id: campaignId, action: 'resume' }
});
```

### Cancelling

```javascript
await supabase.functions.invoke('campaign-sender', {
  body: { campaign_id: campaignId, action: 'cancel' }
});
```

---

## AI Campaign Helpers

Located in `src/components/communications/CampaignAIHelpers.jsx`

### Available Tools

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| **Generate** | Creates full email content | Topic, tone, type | Subject + body |
| **Subjects** | A/B testing variations | Topic description | 5 subject lines |
| **Translate** | EN↔AR translation | Text + direction | Translated text |
| **Improve** | Text enhancement | Text + improvement type | Enhanced text |

### Improvement Types

- `clarity` - Make clearer and easier to understand
- `concise` - Shorten while keeping meaning
- `engaging` - More compelling and interesting
- `formal` - Professional business tone
- `friendly` - Warm conversational tone
- `persuasive` - Call-to-action focused

---

## Template Categories for Campaigns

When creating campaigns, use templates from the `campaign` or `marketing` categories:

| Template Key | Purpose |
|--------------|---------|
| `campaign_newsletter` | Monthly/weekly newsletters |
| `campaign_announcement` | Feature announcements |
| `campaign_promotion` | Promotional offers |
| `campaign_survey` | Survey invitations |
| `campaign_event_invite` | Event invitations |
| `campaign_digest` | Activity digests |
| `campaign_reminder` | General reminders |
| `campaign_thank_you` | Thank you messages |
| `campaign_product_update` | Product updates |

---

## Analytics & Tracking

### Campaign Statistics

| Metric | Field | Description |
|--------|-------|-------------|
| Recipients | `recipient_count` | Total targeted |
| Sent | `sent_count` | Successfully sent |
| Opened | `opened_count` | Unique opens |
| Clicked | `clicked_count` | Unique clicks |
| Failed | `failed_count` | Delivery failures |

### Tracking via Webhooks

The `resend-webhook` edge function updates metrics:

| Event | Updates |
|-------|---------|
| `email.delivered` | `email_logs.delivered_at` |
| `email.opened` | `email_logs.opened_at`, campaign `opened_count` |
| `email.clicked` | `email_logs.clicked_at`, campaign `clicked_count` |
| `email.bounced` | `email_logs.bounced_at`, status = 'bounced' |
| `email.complained` | Disables marketing for user |

---

## Cron Job Configuration

### Scheduled Campaign Processing

- **Job Name**: `process-scheduled-campaigns`
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Action**: Checks for campaigns where `status = 'scheduled'` and `scheduled_at <= now()`

---

## User Preference Handling

### Opt-Out Checking

Before sending, the campaign system checks:
1. `user_notification_preferences.email_notifications = true`
2. `user_notification_preferences.email_categories.marketing = true`

### Automatic Disable on Complaint

When a user marks an email as spam (`email.complained` webhook event):
- `email_categories.marketing` is set to `false`
- Future marketing campaigns skip this user

---

## Security & Permissions

### Required Permission

- `manage:email_templates` - Required to access Campaign Manager

### Rate Limiting

- Campaigns are processed in batches
- Default batch size: 50 emails per run
- Prevents overloading Resend API

### Audit Trail

All campaign actions are logged:
- Created by (admin email)
- Started at / Completed at
- Recipients processed

---

## Best Practices

1. **Always preview** before sending to a large audience
2. **Use campaign templates** for bulk emails (not transactional templates)
3. **Test with small audience** first (custom list)
4. **Include unsubscribe links** in campaign templates
5. **Monitor analytics** to improve future campaigns
6. **Use AI helpers** to optimize subject lines
7. **Schedule during business hours** for better open rates
8. **Segment your audience** for relevant content
9. **Track bounce rates** and clean email lists
10. **Respect user preferences** - never bypass for marketing

---

## Troubleshooting

### Campaign Stuck in "Sending"

1. Check edge function logs for errors
2. Verify Resend API key is valid
3. Check if cron job is running
4. Manually trigger `campaign-sender` with action 'resume'

### Low Open Rates

1. Review subject lines (use AI helper for A/B testing)
2. Check sender reputation
3. Verify emails aren't going to spam
4. Segment audience for relevance

### Failed Deliveries

1. Check `campaign_recipients.error_message`
2. Verify email addresses are valid
3. Check for bounce patterns
4. Remove invalid addresses from future campaigns

---

## Related Documentation

- [Communication System](./COMMUNICATION_SYSTEM.md) - Architecture overview
- [Email Template System](./EMAIL_TEMPLATE_SYSTEM.md) - Template catalog
- [Email Trigger Hub](./EMAIL_TRIGGER_HUB.md) - Trigger system reference
- [Email Trigger Integration](./EMAIL_TRIGGER_INTEGRATION.md) - Integration guide
