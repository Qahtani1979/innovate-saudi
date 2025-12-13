# Campaign Communication System Documentation

## Overview

The Campaign System enables bulk email sending to targeted audiences with AI-powered content generation, scheduling, and analytics tracking.

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
- **`email_templates`** - Same template storage
- **`email_logs`** - Same logging/tracking
- **`send-email`** - Same Resend delivery function
- **User preferences** - Same opt-out handling

### When to Use Each

**Use Campaigns when:**
- Sending marketing or announcement emails
- Targeting a filtered audience segment
- Admin controls timing and content
- Bulk sending to many recipients

**Use Triggers when:**
- Email is in response to a user action or system event
- Recipients are determined by the event context
- Variables come from entity data (challenge, pilot, task)
- Single or few recipients per event

## Architecture

### Database Tables

| Table | Purpose |
|-------|---------|
| `email_campaigns` | Main campaign metadata, status, and statistics |
| `campaign_recipients` | Individual recipient tracking with delivery status |
| `email_templates` | Reusable email templates (shared with triggers) |
| `email_trigger_config` | Maps trigger keys to templates (trigger system only) |
| `email_logs` | Detailed delivery logs (shared) |
| `email_queue` | Scheduled/delayed email queue |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `campaign-sender` | Processes campaign sending, preview, pause, resume |
| `email-trigger-hub` | Unified email triggering based on events |
| `queue-processor` | Processes scheduled emails from queue (runs via cron) |
| `send-email` | Core email sending via Resend (shared by both flows) |

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

## AI Campaign Helpers

Located in `src/components/communications/CampaignAIHelpers.jsx`

### Integration with Campaign Manager

The AI helpers are embedded in `CampaignManager.jsx` via a collapsible panel:

```jsx
import CampaignAIHelpers from './CampaignAIHelpers';

// Inside CampaignManager component:
<Collapsible open={showAIHelpers} onOpenChange={setShowAIHelpers}>
  <CollapsibleTrigger>AI Campaign Helpers</CollapsibleTrigger>
  <CollapsibleContent>
    <CampaignAIHelpers />
  </CollapsibleContent>
</Collapsible>
```

### Available AI Tools

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

### How AI Helpers Work

1. User opens the AI Helpers panel
2. Selects desired tool (Generate/Subjects/Translate/Improve)
3. Enters input (topic, text, etc.)
4. Clicks action button
5. AI generates content via `ai-text` edge function
6. User copies generated content to campaign

### Copying to Campaign

Each generated result includes a copy button that copies the content to clipboard. Users then paste into the campaign template or email body fields.

## Template Categories

| Category | Purpose |
|----------|---------|
| `campaign` | Bulk campaign emails (newsletters, announcements) |
| `auth` | Authentication related (welcome, password reset) |
| `challenge` | Challenge lifecycle notifications |
| `pilot` | Pilot program updates |
| `system` | System notifications |
| ... | (17+ categories total) |

### Campaign-Only Templates

When creating campaigns, templates are filtered to show only `campaign` category templates. This ensures:
- Separation between transactional and marketing emails
- Consistent branding for bulk communications
- Proper unsubscribe handling for campaigns

## Audience Targeting

### Audience Types

| Type | Description | Filter |
|------|-------------|--------|
| `all` | All active users | None |
| `role` | By user role | `{ role: 'municipality_staff' }` |
| `municipality` | By municipality | `{ municipality_id: 'uuid' }` |
| `custom` | Manual email list | `{ custom_emails: ['a@b.com'] }` |

### Audience Resolution

```javascript
// In campaign-sender edge function
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
  case 'custom':
    recipients = filter.custom_emails.map(email => ({ email }));
    break;
}
```

## Campaign Variables

Templates can include variables that are replaced during sending:

```html
<!-- Template -->
<p>Hello {{userName}},</p>
<p>{{customMessage}}</p>

<!-- Campaign Variables -->
{
  "customMessage": "Join us for our annual summit!"
}
```

### Variable Resolution Order

1. Campaign-level variables
2. Recipient-level variables
3. System variables (date, platform name, etc.)

## Usage Examples

### Creating a Campaign

```javascript
// Insert campaign
const { data } = await supabase
  .from('email_campaigns')
  .insert({
    name: 'December Newsletter',
    description: 'Monthly update',
    template_id: 'uuid-of-template',
    audience_type: 'all',
    audience_filter: {},
    campaign_variables: {
      month: 'December',
      year: '2024'
    }
  });
```

### Sending a Campaign

```javascript
// Via edge function
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

## Scheduling

Campaigns can be scheduled for future sending:

```javascript
await supabase
  .from('email_campaigns')
  .update({
    scheduled_at: '2024-12-25T09:00:00Z',
    status: 'scheduled'
  })
  .eq('id', campaignId);
```

The `queue-processor` cron job picks up scheduled campaigns and initiates sending.

## Analytics & Tracking

### Campaign Statistics

| Metric | Field | Description |
|--------|-------|-------------|
| Recipients | `recipient_count` | Total targeted |
| Sent | `sent_count` | Successfully sent |
| Opened | `opened_count` | Unique opens |
| Clicked | `clicked_count` | Unique clicks |
| Failed | `failed_count` | Delivery failures |

### Recipient-Level Tracking

Each recipient in `campaign_recipients` tracks:
- `status`: pending, sent, failed
- `sent_at`: When sent
- `error_message`: If failed

## Best Practices

1. **Always preview** before sending to a large audience
2. **Use campaign templates** for bulk emails (not transactional templates)
3. **Test with small audience** first
4. **Include unsubscribe links** in campaign templates
5. **Monitor analytics** to improve future campaigns
6. **Use AI helpers** to optimize subject lines

## Cron Job Setup

The queue processor runs every 5 minutes:

```sql
SELECT cron.schedule(
  'process-email-queue',
  '*/5 * * * *',
  $$SELECT net.http_post(
    url := 'https://wneorgiqyvkkjmqootpe.supabase.co/functions/v1/queue-processor',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );$$
);
```

## Security Considerations

1. Campaign creation requires `manage:email_templates` permission
2. Template content is sanitized before sending
3. Email addresses are validated before adding to queue
4. Rate limiting prevents abuse
5. Campaign actions are logged for audit
