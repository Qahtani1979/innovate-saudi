-- AI Rate Limiting and Caching Tables

-- Track AI usage per session/user
CREATE TABLE public.ai_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL, -- For anonymous users (from client)
  user_id UUID, -- For authenticated users (nullable)
  user_email TEXT, -- For authenticated users
  endpoint TEXT NOT NULL, -- Which AI endpoint was called
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_ai_usage_session_date ON public.ai_usage_tracking (session_id, created_at);
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage_tracking (user_id, created_at);
CREATE INDEX idx_ai_usage_endpoint ON public.ai_usage_tracking (endpoint);

-- Cache AI analysis results to avoid duplicate calls
CREATE TABLE public.ai_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  input_hash TEXT NOT NULL UNIQUE, -- Hash of the input for lookup
  input_text TEXT NOT NULL, -- Original input for reference
  endpoint TEXT NOT NULL,
  result JSONB NOT NULL, -- Cached AI response
  hit_count INTEGER DEFAULT 1, -- Track cache usage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Index for cache lookups
CREATE INDEX idx_ai_cache_hash ON public.ai_analysis_cache (input_hash);
CREATE INDEX idx_ai_cache_expires ON public.ai_analysis_cache (expires_at);

-- Rate limit configuration table
CREATE TABLE public.ai_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_type TEXT NOT NULL UNIQUE, -- 'anonymous', 'citizen', 'staff', 'admin'
  daily_limit INTEGER NOT NULL,
  hourly_limit INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default rate limits by persona
INSERT INTO public.ai_rate_limits (user_type, daily_limit, hourly_limit, description) VALUES
  ('anonymous', 5, 3, 'Public anonymous users - strict limits'),
  ('citizen', 20, 10, 'Authenticated citizens'),
  ('staff', 100, 30, 'Municipality staff members'),
  ('admin', 500, 100, 'System administrators');

-- Enable RLS
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies for ai_usage_tracking (service role only for writes, public read for own data)
CREATE POLICY "Service role can manage ai_usage_tracking"
  ON public.ai_usage_tracking
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policies for ai_analysis_cache (public read, service role write)
CREATE POLICY "Anyone can read cache"
  ON public.ai_analysis_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage cache"
  ON public.ai_analysis_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policies for ai_rate_limits (public read)
CREATE POLICY "Anyone can read rate limits"
  ON public.ai_rate_limits
  FOR SELECT
  USING (true);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
  p_session_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_user_type TEXT DEFAULT 'anonymous',
  p_endpoint TEXT DEFAULT 'public-idea-ai'
)
RETURNS JSONB AS $$
DECLARE
  v_daily_limit INTEGER;
  v_hourly_limit INTEGER;
  v_daily_count INTEGER;
  v_hourly_count INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Get rate limits for user type
  SELECT daily_limit, hourly_limit INTO v_daily_limit, v_hourly_limit
  FROM public.ai_rate_limits
  WHERE user_type = p_user_type;
  
  -- Default to anonymous limits if not found
  IF v_daily_limit IS NULL THEN
    v_daily_limit := 5;
    v_hourly_limit := 3;
  END IF;
  
  -- Count usage in last 24 hours
  SELECT COUNT(*) INTO v_daily_count
  FROM public.ai_usage_tracking
  WHERE (session_id = p_session_id OR (p_user_id IS NOT NULL AND user_id = p_user_id))
    AND endpoint = p_endpoint
    AND created_at > now() - interval '24 hours';
  
  -- Count usage in last hour
  SELECT COUNT(*) INTO v_hourly_count
  FROM public.ai_usage_tracking
  WHERE (session_id = p_session_id OR (p_user_id IS NOT NULL AND user_id = p_user_id))
    AND endpoint = p_endpoint
    AND created_at > now() - interval '1 hour';
  
  -- Check if allowed
  v_allowed := (v_daily_count < v_daily_limit) AND (v_hourly_limit IS NULL OR v_hourly_count < v_hourly_limit);
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'daily_limit', v_daily_limit,
    'daily_used', v_daily_count,
    'daily_remaining', GREATEST(0, v_daily_limit - v_daily_count),
    'hourly_limit', v_hourly_limit,
    'hourly_used', v_hourly_count,
    'hourly_remaining', CASE WHEN v_hourly_limit IS NOT NULL THEN GREATEST(0, v_hourly_limit - v_hourly_count) ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;