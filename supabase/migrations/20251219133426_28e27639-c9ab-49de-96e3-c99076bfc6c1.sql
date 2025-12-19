-- Create audit log retention policy function (audit-14)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete old access logs beyond retention period
  DELETE FROM public.access_logs 
  WHERE created_at < now() - (retention_days || ' days')::interval
    AND is_admin_action = false;  -- Keep admin actions longer
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup action
  INSERT INTO public.access_logs (
    action, 
    entity_type, 
    metadata,
    user_email
  ) VALUES (
    'audit_cleanup',
    'access_logs',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'retention_days', retention_days,
      'cleanup_date', now()
    ),
    'system'
  );
  
  RETURN deleted_count;
END;
$$;

-- Add comment documenting the retention policy
COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 
'Audit log retention policy: Deletes non-admin audit logs older than specified days (default 365). 
Admin actions are retained indefinitely for compliance. 
Run via scheduled job: SELECT cleanup_old_audit_logs(365);';

-- Create a view for PII-masked challenge data (rls-7, sec-6)
CREATE OR REPLACE VIEW public.challenges_public_view AS
SELECT 
  id,
  title_en,
  title_ar,
  tagline_en,
  tagline_ar,
  description_en,
  description_ar,
  status,
  priority,
  category,
  sector_id,
  municipality_id,
  image_url,
  citizen_votes_count,
  view_count,
  is_featured,
  created_at,
  -- PII fields are masked
  mask_email(challenge_owner_email) as owner_email_masked,
  CASE WHEN reviewer IS NOT NULL THEN '***' ELSE NULL END as reviewer_masked
FROM public.challenges
WHERE is_published = true 
  AND is_deleted = false;

COMMENT ON VIEW public.challenges_public_view IS 
'Public view of challenges with PII fields masked using mask_email() function.
Use this view for public-facing queries to protect sensitive data.';