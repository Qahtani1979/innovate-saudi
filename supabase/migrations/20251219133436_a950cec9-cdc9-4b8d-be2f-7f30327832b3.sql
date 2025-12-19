-- Fix security definer view warning - recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.challenges_public_view;

CREATE VIEW public.challenges_public_view 
WITH (security_invoker = true)
AS
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
  mask_email(challenge_owner_email) as owner_email_masked,
  CASE WHEN reviewer IS NOT NULL THEN '***' ELSE NULL END as reviewer_masked
FROM public.challenges
WHERE is_published = true 
  AND is_deleted = false;

COMMENT ON VIEW public.challenges_public_view IS 
'Public view with PII masked. Uses SECURITY INVOKER for proper RLS enforcement.';