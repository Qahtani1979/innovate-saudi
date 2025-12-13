-- Add event permissions to relevant roles

-- Update Municipality Admin role
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_create', 'event_edit', 'event_view', 'event_approve', 'event_publish']
)
WHERE name = 'Municipality Admin' AND NOT ('event_create' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Update Municipality Coordinator role
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_create', 'event_edit', 'event_view']
)
WHERE name = 'Municipality Coordinator' AND NOT ('event_create' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Update Program Manager role
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_create', 'event_edit', 'event_view']
)
WHERE name = 'Program Manager' AND NOT ('event_create' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Update Program Director role
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_create', 'event_edit', 'event_view', 'event_approve']
)
WHERE name = 'Program Director' AND NOT ('event_create' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Update GDIBS Operations Manager role
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_view', 'event_approve', 'event_edit']
)
WHERE name = 'GDISB Operations Manager' AND NOT ('event_view' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Update Municipality Staff role
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_view', 'event_register']
)
WHERE name = 'Municipality Staff' AND NOT ('event_view' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Update Deputyship Director with event permissions
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_view', 'event_approve']
)
WHERE name = 'Deputyship Director' AND NOT ('event_view' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Update viewer roles with event_view
UPDATE public.roles 
SET permissions = array_cat(
  COALESCE(permissions, ARRAY[]::text[]),
  ARRAY['event_view']
)
WHERE name = 'Municipality Viewer' AND NOT ('event_view' = ANY(COALESCE(permissions, ARRAY[]::text[])));

-- Add event_approved email template if not exists
INSERT INTO public.email_templates (
  template_key,
  category,
  name_en,
  name_ar,
  subject_en,
  subject_ar,
  body_en,
  body_ar,
  is_html,
  use_header,
  use_footer,
  header_title_en,
  header_title_ar,
  header_gradient_start,
  header_gradient_end,
  header_icon,
  cta_text_en,
  cta_text_ar,
  cta_url_variable,
  preference_category,
  is_active,
  is_system,
  variables
) VALUES (
  'event_approved',
  'event',
  'Event Approved',
  'تمت الموافقة على الفعالية',
  'Your Event "{{event_title}}" Has Been Approved',
  'تمت الموافقة على فعاليتك "{{event_title}}"',
  '<p>Great news! Your event <strong>{{event_title}}</strong> has been approved and is now scheduled.</p><p><strong>Event Details:</strong></p><ul><li>Date: {{start_date}}</li><li>Location: {{location}}</li></ul><p>Your event is now visible to participants. You can manage registrations from the event dashboard.</p>',
  '<p>خبر رائع! تمت الموافقة على فعاليتك <strong>{{event_title}}</strong> وهي الآن مجدولة.</p><p><strong>تفاصيل الفعالية:</strong></p><ul><li>التاريخ: {{start_date}}</li><li>الموقع: {{location}}</li></ul><p>فعاليتك الآن مرئية للمشاركين. يمكنك إدارة التسجيلات من لوحة تحكم الفعالية.</p>',
  true,
  true,
  true,
  'Event Approved',
  'تمت الموافقة على الفعالية',
  '#10b981',
  '#059669',
  'CheckCircle',
  'View Event',
  'عرض الفعالية',
  'event_url',
  'events',
  true,
  true,
  '{"event_title": "Title of the event", "start_date": "Event start date", "location": "Event location", "event_url": "URL to view event"}'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;

-- Add event_submitted email template
INSERT INTO public.email_templates (
  template_key,
  category,
  name_en,
  name_ar,
  subject_en,
  subject_ar,
  body_en,
  body_ar,
  is_html,
  use_header,
  use_footer,
  header_title_en,
  header_title_ar,
  header_gradient_start,
  header_gradient_end,
  header_icon,
  cta_text_en,
  cta_text_ar,
  cta_url_variable,
  preference_category,
  is_active,
  is_system,
  variables
) VALUES (
  'event_submitted',
  'event',
  'Event Submitted for Approval',
  'تم تقديم الفعالية للموافقة',
  'Your Event "{{event_title}}" is Pending Approval',
  'فعاليتك "{{event_title}}" بانتظار الموافقة',
  '<p>Your event <strong>{{event_title}}</strong> has been submitted and is now pending approval.</p><p><strong>Event Details:</strong></p><ul><li>Type: {{event_type}}</li><li>Date: {{start_date}}</li></ul><p>You will receive a notification once your event has been reviewed.</p>',
  '<p>تم تقديم فعاليتك <strong>{{event_title}}</strong> وهي الآن بانتظار الموافقة.</p><p><strong>تفاصيل الفعالية:</strong></p><ul><li>النوع: {{event_type}}</li><li>التاريخ: {{start_date}}</li></ul><p>ستتلقى إشعاراً بمجرد مراجعة فعاليتك.</p>',
  true,
  true,
  true,
  'Event Submitted',
  'تم تقديم الفعالية',
  '#f59e0b',
  '#d97706',
  'Clock',
  'View Event',
  'عرض الفعالية',
  'event_url',
  'events',
  true,
  true,
  '{"event_title": "Title of the event", "event_type": "Type of event", "start_date": "Event start date", "event_url": "URL to view event"}'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;