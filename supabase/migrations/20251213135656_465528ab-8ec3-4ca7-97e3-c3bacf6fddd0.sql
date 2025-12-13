-- Add reminder_sent_at column to events table for tracking reminder status
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;

-- Add budget fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget_estimate numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget_actual numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget_currency text DEFAULT 'SAR';

-- Create index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_events_reminder_pending 
ON events (start_date, reminder_sent_at) 
WHERE reminder_sent_at IS NULL;

-- Add event_reminder email template
INSERT INTO email_templates (template_key, name_en, name_ar, subject_en, subject_ar, body_en, body_ar, category, is_active, is_html, variables)
VALUES (
  'event_reminder',
  'Event Reminder',
  'تذكير بالفعالية',
  'Reminder: {{event_title}} is Tomorrow',
  'تذكير: {{event_title}} غداً',
  '<h2>Event Reminder</h2><p>This is a friendly reminder that you are registered for:</p><h3>{{event_title}}</h3><p><strong>Date:</strong> {{event_date}}</p><p><strong>Location:</strong> {{event_location}}</p>{{#if join_link}}<p><a href="{{join_link}}">Join Virtual Event</a></p>{{/if}}<p>We look forward to seeing you there!</p>',
  '<h2>تذكير بالفعالية</h2><p>نود تذكيركم بأنكم مسجلون في:</p><h3>{{event_title}}</h3><p><strong>التاريخ:</strong> {{event_date}}</p><p><strong>الموقع:</strong> {{event_location}}</p>{{#if join_link}}<p><a href="{{join_link}}">الانضمام للفعالية الافتراضية</a></p>{{/if}}<p>نتطلع لرؤيتكم!</p>',
  'events',
  true,
  true,
  '["event_title", "event_date", "event_location", "join_link"]'::jsonb
) ON CONFLICT (template_key) DO NOTHING;