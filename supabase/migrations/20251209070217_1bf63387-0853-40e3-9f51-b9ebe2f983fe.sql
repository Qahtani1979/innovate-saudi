-- Create onboarding_events table for analytics tracking
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  step_number INTEGER,
  step_name TEXT,
  persona TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own events
CREATE POLICY "Users can insert their own onboarding events"
ON public.onboarding_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own events
CREATE POLICY "Users can view their own onboarding events"
ON public.onboarding_events
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for admins to view all events
CREATE POLICY "Admins can view all onboarding events"
ON public.onboarding_events
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Create A/B test experiments table
CREATE TABLE IF NOT EXISTS public.ab_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[]',
  allocation_percentages JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience JSONB DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;

-- Everyone can read experiments
CREATE POLICY "Anyone can view active experiments"
ON public.ab_experiments
FOR SELECT
USING (status = 'active' OR public.is_admin(auth.uid()));

-- Only admins can create/update
CREATE POLICY "Admins can manage experiments"
ON public.ab_experiments
FOR ALL
USING (public.is_admin(auth.uid()));

-- Create A/B test assignments table
CREATE TABLE IF NOT EXISTS public.ab_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.ab_assignments ENABLE ROW LEVEL SECURITY;

-- Users can view their own assignments
CREATE POLICY "Users can view their own AB assignments"
ON public.ab_assignments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own assignments
CREATE POLICY "Users can insert their own AB assignments"
ON public.ab_assignments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all AB assignments"
ON public.ab_assignments
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Create A/B test conversions table
CREATE TABLE IF NOT EXISTS public.ab_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.ab_assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_conversions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own conversions
CREATE POLICY "Users can insert their own conversions"
ON public.ab_conversions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all conversions"
ON public.ab_conversions
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Create progressive_profiling_prompts table
CREATE TABLE IF NOT EXISTS public.progressive_profiling_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL,
  field_name TEXT NOT NULL,
  prompt_message_en TEXT,
  prompt_message_ar TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  dismissed_count INTEGER DEFAULT 0,
  last_shown_at TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progressive_profiling_prompts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own prompts
CREATE POLICY "Users can view their own profiling prompts"
ON public.progressive_profiling_prompts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiling prompts"
ON public.progressive_profiling_prompts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiling prompts"
ON public.progressive_profiling_prompts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create welcome_emails_sent table
CREATE TABLE IF NOT EXISTS public.welcome_emails_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  persona TEXT,
  email_type TEXT DEFAULT 'welcome',
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.welcome_emails_sent ENABLE ROW LEVEL SECURITY;

-- Users can view their own emails
CREATE POLICY "Users can view their own welcome emails"
ON public.welcome_emails_sent
FOR SELECT
USING (auth.uid() = user_id);

-- Allow insert from service role (edge function)
CREATE POLICY "Service can insert welcome emails"
ON public.welcome_emails_sent
FOR INSERT
WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view all welcome emails"
ON public.welcome_emails_sent
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user ON public.onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_type ON public.onboarding_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment ON public.ab_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_conversions_experiment ON public.ab_conversions(experiment_id);
CREATE INDEX IF NOT EXISTS idx_profiling_prompts_user ON public.progressive_profiling_prompts(user_id);