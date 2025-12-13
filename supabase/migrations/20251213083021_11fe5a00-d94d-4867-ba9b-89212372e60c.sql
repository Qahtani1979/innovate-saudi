-- Create trigger to auto-create notification preferences when user profile is created
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert default notification preferences for new user
  INSERT INTO public.user_notification_preferences (
    user_id,
    user_email,
    email_notifications,
    sms_notifications,
    push_notifications,
    notification_types,
    email_categories
  )
  VALUES (
    NEW.user_id,
    NEW.user_email,
    true, -- email enabled by default
    false, -- sms disabled by default
    true, -- push enabled by default
    jsonb_build_object(
      'challenges', true,
      'pilots', true,
      'solutions', true,
      'approvals', true,
      'tasks', true,
      'events', true,
      'system', true
    ),
    jsonb_build_object(
      'authentication', true,
      'challenges', true,
      'pilots', true,
      'solutions', true,
      'contracts', true,
      'evaluations', true,
      'events', true,
      'tasks', true,
      'programs', true,
      'proposals', true,
      'roles', true,
      'finance', true,
      'citizen', true,
      'marketing', true
    )
  )
  ON CONFLICT (user_email) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_profiles insert
DROP TRIGGER IF EXISTS on_user_profile_created_create_prefs ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_create_prefs
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();

-- Add quiet_hours columns to user_notification_preferences if not exists
ALTER TABLE public.user_notification_preferences 
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME,
ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'immediate',
ADD COLUMN IF NOT EXISTS in_app_notifications BOOLEAN DEFAULT true;

-- Create unique constraint on user_email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_notification_preferences_user_email_key'
  ) THEN
    ALTER TABLE public.user_notification_preferences 
    ADD CONSTRAINT user_notification_preferences_user_email_key UNIQUE (user_email);
  END IF;
EXCEPTION WHEN duplicate_table THEN
  -- Constraint already exists
END $$;