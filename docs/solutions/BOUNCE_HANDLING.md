# Email Bounce Handling

## Overview

Documentation for handling email bounces and delivery failures in the Solutions system.

## Webhook Configuration

### Resend Webhook Setup

1. Navigate to Resend Dashboard → Webhooks
2. Add webhook URL: `https://<project-id>.supabase.co/functions/v1/email-bounce-handler`
3. Select events:
   - `email.bounced`
   - `email.complained`
   - `email.delivery_delayed`

### Webhook Payload

```json
{
  "type": "email.bounced",
  "created_at": "2025-01-01T00:00:00.000Z",
  "data": {
    "email_id": "uuid",
    "from": "noreply@example.com",
    "to": ["user@example.com"],
    "subject": "Your Solution Has Been Approved",
    "bounce_type": "hard",
    "bounce_reason": "Mailbox not found"
  }
}
```

## Bounce Types

| Type | Action | Description |
|------|--------|-------------|
| Hard Bounce | Suppress email | Invalid address, domain doesn't exist |
| Soft Bounce | Retry 3x | Mailbox full, server down |
| Complaint | Suppress email | User marked as spam |
| Delivery Delay | Log only | Temporary delay, will retry |

## Edge Function Implementation

```typescript
// supabase/functions/email-bounce-handler/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const payload = await req.json();
  const { type, data } = payload;

  // Log the bounce event
  await supabase.from('email_bounce_logs').insert({
    event_type: type,
    email_address: data.to[0],
    bounce_type: data.bounce_type,
    bounce_reason: data.bounce_reason,
    raw_payload: payload
  });

  // Handle based on bounce type
  if (type === 'email.bounced' && data.bounce_type === 'hard') {
    // Suppress future emails
    await supabase.from('email_suppressions').insert({
      email_address: data.to[0],
      suppression_reason: 'hard_bounce',
      suppressed_at: new Date().toISOString()
    });
  }

  if (type === 'email.complained') {
    // Suppress + flag for review
    await supabase.from('email_suppressions').insert({
      email_address: data.to[0],
      suppression_reason: 'spam_complaint',
      suppressed_at: new Date().toISOString()
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

## Database Tables

### email_bounce_logs

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_type | TEXT | Bounce event type |
| email_address | TEXT | Recipient email |
| bounce_type | TEXT | hard/soft |
| bounce_reason | TEXT | Reason description |
| raw_payload | JSONB | Full webhook payload |
| created_at | TIMESTAMPTZ | Event timestamp |

### email_suppressions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email_address | TEXT | Suppressed email (unique) |
| suppression_reason | TEXT | Reason for suppression |
| suppressed_at | TIMESTAMPTZ | Suppression timestamp |
| can_retry_after | TIMESTAMPTZ | When to allow retry |

## Pre-Send Check

Before sending emails, check suppression list:

```typescript
const checkSuppression = async (email: string) => {
  const { data } = await supabase
    .from('email_suppressions')
    .select('*')
    .eq('email_address', email)
    .single();

  if (data) {
    // Check if can retry for soft bounces
    if (data.can_retry_after && new Date(data.can_retry_after) < new Date()) {
      return { suppressed: false };
    }
    return { suppressed: true, reason: data.suppression_reason };
  }

  return { suppressed: false };
};
```

## Monitoring

### Metrics to Track

| Metric | Threshold | Action |
|--------|-----------|--------|
| Hard bounce rate | > 2% | Review list hygiene |
| Soft bounce rate | > 5% | Check email content |
| Complaint rate | > 0.1% | Review opt-in process |

### Alerting

Set up alerts for:
- High bounce rates
- Sudden spike in complaints
- Delivery delays > 24h

## Best Practices

1. **List Hygiene**: Regularly clean invalid emails
2. **Double Opt-In**: Confirm email addresses before adding
3. **Unsubscribe**: Provide easy unsubscribe options
4. **Content Quality**: Avoid spam trigger words
5. **Authentication**: Use SPF, DKIM, DMARC
