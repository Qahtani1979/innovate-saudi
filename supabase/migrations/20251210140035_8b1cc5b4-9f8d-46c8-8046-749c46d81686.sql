-- Create user_settings table for storing all user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification settings
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT false,
  notifications_challenges BOOLEAN DEFAULT true,
  notifications_pilots BOOLEAN DEFAULT true,
  notifications_programs BOOLEAN DEFAULT true,
  notifications_digest_frequency TEXT DEFAULT 'daily',
  notifications_quiet_hours_start TEXT DEFAULT '22:00',
  notifications_quiet_hours_end TEXT DEFAULT '08:00',
  
  -- Appearance settings
  theme TEXT DEFAULT 'auto',
  font_size TEXT DEFAULT 'medium',
  density TEXT DEFAULT 'comfortable',
  
  -- Privacy settings
  profile_visibility TEXT DEFAULT 'public',
  show_activity BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  
  -- Accessibility settings
  high_contrast BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  screen_reader_optimized BOOLEAN DEFAULT false,
  keyboard_navigation BOOLEAN DEFAULT false,
  
  -- Work preferences
  default_view TEXT DEFAULT 'cards',
  auto_save BOOLEAN DEFAULT true,
  show_tutorials BOOLEAN DEFAULT true,
  
  -- Language
  preferred_language TEXT DEFAULT 'en',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own settings
CREATE POLICY "Users can create own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all settings
CREATE POLICY "Admins can manage all settings"
ON public.user_settings FOR ALL
USING (is_admin(auth.uid()));

-- Create index for user_id
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();