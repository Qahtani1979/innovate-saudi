-- Add campaign category templates

INSERT INTO email_templates (template_key, name_en, name_ar, category, subject_en, subject_ar, body_en, body_ar, variables, is_active)
VALUES 
  ('campaign_newsletter', 'Newsletter Template', 'قالب النشرة الإخبارية', 'campaign', 
   '{{newsletterTitle}} - {{month}} Update', '{{newsletterTitle}} - تحديث {{month}}',
   '<h1>{{newsletterTitle}}</h1><p>Dear {{userName}},</p><p>{{introText}}</p><div>{{mainContent}}</div><p>Best regards,<br>{{senderName}}</p>',
   '<h1>{{newsletterTitle}}</h1><p>عزيزي {{userName}}،</p><p>{{introText}}</p><div>{{mainContent}}</div><p>مع أطيب التحيات،<br>{{senderName}}</p>',
   '["newsletterTitle", "month", "userName", "introText", "mainContent", "senderName"]'::jsonb, true),

  ('campaign_announcement', 'Announcement Template', 'قالب الإعلان', 'campaign',
   '{{announcementType}}: {{title}}', '{{announcementType}}: {{title}}',
   '<h1>{{title}}</h1><p>{{message}}</p><p><a href="{{actionUrl}}">{{actionText}}</a></p>',
   '<h1>{{title}}</h1><p>{{message}}</p><p><a href="{{actionUrl}}">{{actionText}}</a></p>',
   '["announcementType", "title", "message", "actionUrl", "actionText"]'::jsonb, true),

  ('campaign_event_invite', 'Event Invitation', 'دعوة لحدث', 'campaign',
   'You''re Invited: {{eventName}}', 'أنت مدعو: {{eventName}}',
   '<h1>{{eventName}}</h1><p>Dear {{userName}},</p><p>You are cordially invited to {{eventName}}.</p><p><strong>Date:</strong> {{eventDate}}<br><strong>Time:</strong> {{eventTime}}<br><strong>Location:</strong> {{eventLocation}}</p><p>{{eventDescription}}</p><p><a href="{{rsvpUrl}}">RSVP Now</a></p>',
   '<h1>{{eventName}}</h1><p>عزيزي {{userName}}،</p><p>يسعدنا دعوتك لحضور {{eventName}}.</p><p><strong>التاريخ:</strong> {{eventDate}}<br><strong>الوقت:</strong> {{eventTime}}<br><strong>المكان:</strong> {{eventLocation}}</p><p>{{eventDescription}}</p><p><a href="{{rsvpUrl}}">تأكيد الحضور</a></p>',
   '["eventName", "userName", "eventDate", "eventTime", "eventLocation", "eventDescription", "rsvpUrl"]'::jsonb, true),

  ('campaign_product_update', 'Product Update', 'تحديث المنتج', 'campaign',
   'New Features: {{updateTitle}}', 'ميزات جديدة: {{updateTitle}}',
   '<h1>{{updateTitle}}</h1><p>Hello {{userName}},</p><p>We''re excited to share some updates:</p><div>{{updateContent}}</div><p><a href="{{learnMoreUrl}}">Learn More</a></p>',
   '<h1>{{updateTitle}}</h1><p>مرحباً {{userName}}،</p><p>يسعدنا مشاركتكم بعض التحديثات:</p><div>{{updateContent}}</div><p><a href="{{learnMoreUrl}}">اعرف المزيد</a></p>',
   '["updateTitle", "userName", "updateContent", "learnMoreUrl"]'::jsonb, true),

  ('campaign_survey_request', 'Survey Request', 'طلب استبيان', 'campaign',
   'We Value Your Feedback: {{surveyTitle}}', 'نقدر رأيك: {{surveyTitle}}',
   '<h1>{{surveyTitle}}</h1><p>Dear {{userName}},</p><p>Your feedback helps us improve. Please take a moment to complete our survey.</p><p>{{surveyDescription}}</p><p><a href="{{surveyUrl}}">Take Survey</a></p><p>Thank you for your time!</p>',
   '<h1>{{surveyTitle}}</h1><p>عزيزي {{userName}}،</p><p>رأيك يساعدنا على التحسين. يرجى تخصيص بعض الوقت لإكمال الاستبيان.</p><p>{{surveyDescription}}</p><p><a href="{{surveyUrl}}">ابدأ الاستبيان</a></p><p>شكراً لوقتك!</p>',
   '["surveyTitle", "userName", "surveyDescription", "surveyUrl"]'::jsonb, true),

  ('campaign_digest', 'Weekly Digest', 'الملخص الأسبوعي', 'campaign',
   'Your Weekly Summary - {{weekDate}}', 'ملخصك الأسبوعي - {{weekDate}}',
   '<h1>Weekly Digest</h1><p>Hello {{userName}},</p><p>Here''s what happened this week:</p><div>{{digestContent}}</div><h2>Highlights</h2><div>{{highlights}}</div><p><a href="{{dashboardUrl}}">View Dashboard</a></p>',
   '<h1>الملخص الأسبوعي</h1><p>مرحباً {{userName}}،</p><p>إليك ما حدث هذا الأسبوع:</p><div>{{digestContent}}</div><h2>أبرز الأحداث</h2><div>{{highlights}}</div><p><a href="{{dashboardUrl}}">عرض لوحة التحكم</a></p>',
   '["weekDate", "userName", "digestContent", "highlights", "dashboardUrl"]'::jsonb, true),

  ('campaign_reminder', 'General Reminder', 'تذكير عام', 'campaign',
   'Reminder: {{reminderTitle}}', 'تذكير: {{reminderTitle}}',
   '<h1>{{reminderTitle}}</h1><p>Dear {{userName}},</p><p>This is a friendly reminder about:</p><p>{{reminderContent}}</p><p><strong>Deadline:</strong> {{deadline}}</p><p><a href="{{actionUrl}}">{{actionText}}</a></p>',
   '<h1>{{reminderTitle}}</h1><p>عزيزي {{userName}}،</p><p>هذا تذكير ودي بخصوص:</p><p>{{reminderContent}}</p><p><strong>الموعد النهائي:</strong> {{deadline}}</p><p><a href="{{actionUrl}}">{{actionText}}</a></p>',
   '["reminderTitle", "userName", "reminderContent", "deadline", "actionUrl", "actionText"]'::jsonb, true),

  ('campaign_thank_you', 'Thank You Message', 'رسالة شكر', 'campaign',
   'Thank You, {{userName}}!', 'شكراً لك {{userName}}!',
   '<h1>Thank You!</h1><p>Dear {{userName}},</p><p>{{thankYouMessage}}</p><p>We truly appreciate your {{appreciationReason}}.</p><p>Best regards,<br>{{teamName}}</p>',
   '<h1>شكراً لك!</h1><p>عزيزي {{userName}}،</p><p>{{thankYouMessage}}</p><p>نقدر حقاً {{appreciationReason}}.</p><p>مع أطيب التحيات،<br>{{teamName}}</p>',
   '["userName", "thankYouMessage", "appreciationReason", "teamName"]'::jsonb, true)

ON CONFLICT (template_key) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  category = EXCLUDED.category,
  subject_en = EXCLUDED.subject_en,
  subject_ar = EXCLUDED.subject_ar,
  body_en = EXCLUDED.body_en,
  body_ar = EXCLUDED.body_ar,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Add trigger configs for campaign templates (without description column)
INSERT INTO email_trigger_config (trigger_key, template_key, is_active)
VALUES
  ('campaign_newsletter_send', 'campaign_newsletter', true),
  ('campaign_announcement_send', 'campaign_announcement', true),
  ('campaign_event_invite_send', 'campaign_event_invite', true),
  ('campaign_product_update_send', 'campaign_product_update', true),
  ('campaign_survey_request_send', 'campaign_survey_request', true),
  ('campaign_digest_send', 'campaign_digest', true),
  ('campaign_reminder_send', 'campaign_reminder', true),
  ('campaign_thank_you_send', 'campaign_thank_you', true)
ON CONFLICT (trigger_key) DO NOTHING;