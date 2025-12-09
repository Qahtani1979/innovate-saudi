-- Fix function search path security issue
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;