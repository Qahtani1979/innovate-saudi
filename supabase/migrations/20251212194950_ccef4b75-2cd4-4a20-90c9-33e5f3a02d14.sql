-- =============================================
-- EMAIL TEMPLATE SYSTEM - Database Schema
-- =============================================

-- 1. Email Settings (Global Configuration)
CREATE TABLE public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by VARCHAR(255)
);

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage email_settings"
  ON public.email_settings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view email_settings"
  ON public.email_settings FOR SELECT
  USING (true);

-- Insert default settings
INSERT INTO public.email_settings (setting_key, setting_value, description) VALUES
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

-- 2. Email Templates
CREATE TABLE public.email_templates (
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
  is_critical BOOLEAN DEFAULT false,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage email_templates"
  ON public.email_templates FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active email_templates"
  ON public.email_templates FOR SELECT
  USING (is_active = true);

-- Indexes
CREATE INDEX idx_email_templates_key ON public.email_templates(template_key);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);

-- 3. Email Logs
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template reference
  template_id UUID REFERENCES public.email_templates(id),
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

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage email_logs"
  ON public.email_logs FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own email_logs"
  ON public.email_logs FOR SELECT
  USING (auth.email() = recipient_email);

-- Indexes
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_template ON public.email_logs(template_key);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_created ON public.email_logs(created_at);

-- 4. Add email preferences to user_notification_preferences (if column doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_notification_preferences' 
    AND column_name = 'email_categories'
  ) THEN
    ALTER TABLE public.user_notification_preferences 
    ADD COLUMN email_categories JSONB DEFAULT '{
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
  END IF;
END $$;

-- 5. Insert seed templates (most critical ones first)
INSERT INTO public.email_templates (template_key, category, name_en, name_ar, subject_en, subject_ar, body_en, body_ar, variables, preference_category, is_system, is_critical, header_title_en, header_title_ar, cta_text_en, cta_text_ar, cta_url_variable) VALUES
-- Authentication
('welcome_new_user', 'auth', 'Welcome Email', 'بريد الترحيب', 
 'Welcome to Saudi Innovates, {{userName}}!', 
 'مرحباً بك في ابتكر السعودية، {{userName}}!',
 '<p>Dear {{userName}},</p><p>Welcome to Saudi Innovates! We''re excited to have you join our innovation community.</p><p>You can now:</p><ul><li>Explore municipal challenges</li><li>Discover innovative solutions</li><li>Participate in pilot programs</li><li>Submit your own ideas</li></ul><p>Let''s innovate together!</p>',
 '<p>عزيزي {{userName}}،</p><p>مرحباً بك في ابتكر السعودية! يسعدنا انضمامك إلى مجتمع الابتكار.</p><p>يمكنك الآن:</p><ul><li>استكشاف تحديات البلديات</li><li>اكتشاف الحلول المبتكرة</li><li>المشاركة في البرامج التجريبية</li><li>تقديم أفكارك الخاصة</li></ul><p>لنبتكر معاً!</p>',
 '[{"name": "userName", "required": true}, {"name": "loginUrl", "required": true}]',
 'auth', true, true, 'Welcome!', 'مرحباً!', 'Get Started', 'ابدأ الآن', 'loginUrl'),

('password_reset', 'auth', 'Password Reset', 'إعادة تعيين كلمة المرور',
 'Reset Your Password', 
 'إعادة تعيين كلمة المرور',
 '<p>Hi {{userName}},</p><p>We received a request to reset your password. Click the button below to create a new password:</p><p><strong>This link expires in {{expiresIn}}.</strong></p><p>If you didn''t request this, please ignore this email.</p>',
 '<p>مرحباً {{userName}}،</p><p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p><p><strong>تنتهي صلاحية هذا الرابط خلال {{expiresIn}}.</strong></p><p>إذا لم تطلب ذلك، يرجى تجاهل هذا البريد.</p>',
 '[{"name": "userName", "required": true}, {"name": "resetUrl", "required": true}, {"name": "expiresIn", "required": true}]',
 'auth', true, true, 'Password Reset', 'إعادة تعيين كلمة المرور', 'Reset Password', 'إعادة تعيين', 'resetUrl'),

-- Role Management
('role_request_approved', 'role', 'Role Request Approved', 'تمت الموافقة على طلب الدور',
 'Your Role Request Has Been Approved!', 
 'تمت الموافقة على طلب دورك!',
 '<p>Great news, {{userName}}!</p><p>Your request for the <strong>{{roleName}}</strong> role has been approved.</p><p>You now have access to new features and capabilities on the platform.</p>',
 '<p>أخبار رائعة، {{userName}}!</p><p>تمت الموافقة على طلبك للحصول على دور <strong>{{roleName}}</strong>.</p><p>لديك الآن إمكانية الوصول إلى ميزات وقدرات جديدة على المنصة.</p>',
 '[{"name": "userName", "required": true}, {"name": "roleName", "required": true}, {"name": "dashboardUrl", "required": true}]',
 'role', true, false, 'Role Approved', 'تمت الموافقة', 'Go to Dashboard', 'انتقل إلى لوحة التحكم', 'dashboardUrl'),

-- Challenges
('challenge_submitted', 'challenge', 'Challenge Submitted', 'تم إرسال التحدي',
 'Challenge Submitted: {{challengeTitle}}', 
 'تم إرسال التحدي: {{challengeTitle}}',
 '<p>Dear {{userName}},</p><p>Your challenge <strong>{{challengeTitle}}</strong> (Code: {{challengeCode}}) has been successfully submitted.</p><p>Our team will review it and you''ll receive updates on its status.</p>',
 '<p>عزيزي {{userName}}،</p><p>تم إرسال تحديك <strong>{{challengeTitle}}</strong> (الرمز: {{challengeCode}}) بنجاح.</p><p>سيقوم فريقنا بمراجعته وستتلقى تحديثات حول حالته.</p>',
 '[{"name": "userName", "required": true}, {"name": "challengeTitle", "required": true}, {"name": "challengeCode", "required": true}, {"name": "trackingUrl", "required": true}]',
 'challenge', true, false, 'Challenge Submitted', 'تم إرسال التحدي', 'Track Status', 'تتبع الحالة', 'trackingUrl'),

('challenge_approved', 'challenge', 'Challenge Approved', 'تمت الموافقة على التحدي',
 'Challenge Approved: {{challengeTitle}}', 
 'تمت الموافقة على التحدي: {{challengeTitle}}',
 '<p>Congratulations!</p><p>Your challenge <strong>{{challengeTitle}}</strong> has been approved and is now visible to solution providers.</p><p>You may start receiving proposals and matches soon.</p>',
 '<p>تهانينا!</p><p>تمت الموافقة على تحديك <strong>{{challengeTitle}}</strong> وأصبح مرئياً لمزودي الحلول.</p><p>قد تبدأ في تلقي المقترحات والمطابقات قريباً.</p>',
 '[{"name": "challengeTitle", "required": true}, {"name": "challengeCode", "required": true}, {"name": "detailUrl", "required": true}]',
 'challenge', true, false, 'Challenge Approved', 'تمت الموافقة على التحدي', 'View Details', 'عرض التفاصيل', 'detailUrl'),

-- Pilots
('pilot_created', 'pilot', 'Pilot Created', 'تم إنشاء التجربة',
 'New Pilot: {{pilotTitle}}', 
 'تجربة جديدة: {{pilotTitle}}',
 '<p>A new pilot has been initiated:</p><p><strong>{{pilotTitle}}</strong> (Code: {{pilotCode}})</p><p>Start Date: {{startDate}}</p><p>You are a stakeholder in this pilot. Please review the details and prepare for kickoff.</p>',
 '<p>تم بدء تجربة جديدة:</p><p><strong>{{pilotTitle}}</strong> (الرمز: {{pilotCode}})</p><p>تاريخ البدء: {{startDate}}</p><p>أنت من أصحاب المصلحة في هذه التجربة. يرجى مراجعة التفاصيل والاستعداد للانطلاق.</p>',
 '[{"name": "pilotTitle", "required": true}, {"name": "pilotCode", "required": true}, {"name": "startDate", "required": true}, {"name": "dashboardUrl", "required": true}]',
 'pilot', true, false, 'New Pilot', 'تجربة جديدة', 'View Pilot', 'عرض التجربة', 'dashboardUrl'),

-- Tasks
('task_assigned', 'task', 'Task Assigned', 'تم تعيين مهمة',
 'New Task: {{taskTitle}}', 
 'مهمة جديدة: {{taskTitle}}',
 '<p>Hi {{userName}},</p><p>A new task has been assigned to you:</p><p><strong>{{taskTitle}}</strong></p><p>Assigned by: {{assignedBy}}<br>Due: {{dueDate}}<br>Priority: {{priority}}</p>',
 '<p>مرحباً {{userName}}،</p><p>تم تعيين مهمة جديدة لك:</p><p><strong>{{taskTitle}}</strong></p><p>المُعيِّن: {{assignedBy}}<br>الموعد النهائي: {{dueDate}}<br>الأولوية: {{priority}}</p>',
 '[{"name": "userName", "required": true}, {"name": "taskTitle", "required": true}, {"name": "assignedBy", "required": true}, {"name": "dueDate", "required": true}, {"name": "priority", "required": true}, {"name": "taskUrl", "required": true}]',
 'task', true, false, 'New Task', 'مهمة جديدة', 'View Task', 'عرض المهمة', 'taskUrl'),

-- System
('system_announcement', 'system', 'System Announcement', 'إعلان النظام',
 '{{title}}', 
 '{{title}}',
 '<p>{{message}}</p>',
 '<p>{{message}}</p>',
 '[{"name": "title", "required": true}, {"name": "message", "required": true}, {"name": "learnMoreUrl", "required": false}]',
 'system', true, false, 'Announcement', 'إعلان', 'Learn More', 'معرفة المزيد', 'learnMoreUrl'),

-- Test template
('test_email', 'system', 'Test Email', 'بريد تجريبي',
 'Test Email from Saudi Innovates', 
 'بريد تجريبي من ابتكر السعودية',
 '<p>Hi {{userName}},</p><p>This is a test email to verify your email configuration is working correctly.</p><p>If you received this, everything is set up properly!</p><p>Sent at: {{sentAt}}</p>',
 '<p>مرحباً {{userName}}،</p><p>هذا بريد تجريبي للتحقق من أن إعدادات بريدك الإلكتروني تعمل بشكل صحيح.</p><p>إذا تلقيت هذا البريد، فكل شيء مُعد بشكل صحيح!</p><p>تم الإرسال في: {{sentAt}}</p>',
 '[{"name": "userName", "required": true}, {"name": "sentAt", "required": true}]',
 'system', true, false, 'Test Email', 'بريد تجريبي', null, null, null);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_timestamp
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();