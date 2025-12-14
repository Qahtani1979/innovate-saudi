-- Phase 5: Strategy Communication Database Tables

-- Communication Plans Table
CREATE TABLE public.communication_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES public.strategic_plans(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_ar text,
  description_en text,
  description_ar text,
  target_audiences jsonb DEFAULT '[]',
  key_messages jsonb DEFAULT '[]',
  channel_strategy jsonb DEFAULT '[]',
  content_calendar jsonb DEFAULT '[]',
  master_narrative_en text,
  master_narrative_ar text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date date,
  end_date date,
  owner_email text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communication_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view communication plans" ON public.communication_plans
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communication plans" ON public.communication_plans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update communication plans" ON public.communication_plans
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Impact Stories Table
CREATE TABLE public.impact_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id uuid REFERENCES public.strategic_plans(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  title_en text NOT NULL,
  title_ar text,
  summary_en text,
  summary_ar text,
  full_story_en text,
  full_story_ar text,
  key_metrics jsonb DEFAULT '[]',
  testimonials jsonb DEFAULT '[]',
  before_situation text,
  after_situation text,
  lessons_learned text[],
  tags text[],
  image_url text,
  gallery_urls text[],
  video_url text,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  published_date timestamptz,
  view_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.impact_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published impact stories" ON public.impact_stories
  FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create impact stories" ON public.impact_stories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update impact stories" ON public.impact_stories
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Communication Notifications Log Table
CREATE TABLE public.communication_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_plan_id uuid REFERENCES public.communication_plans(id) ON DELETE SET NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'sms', 'push', 'in_app', 'social')),
  recipient_type text NOT NULL CHECK (recipient_type IN ('individual', 'group', 'audience_segment', 'all')),
  recipient_emails text[],
  recipient_audience_id text,
  subject_en text,
  subject_ar text,
  content_en text,
  content_ar text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'sent', 'failed', 'cancelled')),
  delivery_stats jsonb DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0}',
  error_message text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communication_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view notifications" ON public.communication_notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create notifications" ON public.communication_notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update notifications" ON public.communication_notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Communication Analytics Table
CREATE TABLE public.communication_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_plan_id uuid REFERENCES public.communication_plans(id) ON DELETE CASCADE,
  date date NOT NULL,
  channel text NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('reach', 'engagement', 'clicks', 'shares', 'conversions', 'feedback')),
  metric_value integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communication_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view analytics" ON public.communication_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create analytics" ON public.communication_analytics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_communication_plans_strategic_plan ON public.communication_plans(strategic_plan_id);
CREATE INDEX idx_communication_plans_status ON public.communication_plans(status);
CREATE INDEX idx_impact_stories_strategic_plan ON public.impact_stories(strategic_plan_id);
CREATE INDEX idx_impact_stories_entity ON public.impact_stories(entity_type, entity_id);
CREATE INDEX idx_impact_stories_published ON public.impact_stories(is_published, is_featured);
CREATE INDEX idx_communication_notifications_plan ON public.communication_notifications(communication_plan_id);
CREATE INDEX idx_communication_notifications_status ON public.communication_notifications(status);
CREATE INDEX idx_communication_analytics_plan_date ON public.communication_analytics(communication_plan_id, date);

-- Update triggers
CREATE TRIGGER update_communication_plans_updated_at
  BEFORE UPDATE ON public.communication_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_impact_stories_updated_at
  BEFORE UPDATE ON public.impact_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();