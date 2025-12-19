-- Fix RLS policies for events and onboarding_events

-- =============================================
-- 1. EVENTS - Add staff policies
-- =============================================

-- Staff can create events for their municipality
CREATE POLICY "events_staff_create"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'event manager', 'program manager')
  )
);

-- Staff can view all events (including unpublished for management)
CREATE POLICY "events_staff_view_all"
ON public.events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'event manager', 'program manager')
  )
);

-- Staff can update events for their municipality
CREATE POLICY "events_staff_update"
ON public.events
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.municipality_id IS NOT NULL
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'event manager', 'program manager')
  )
  AND (
    municipality_id IN (
      SELECT ur.municipality_id FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.municipality_id IS NOT NULL
    )
    OR municipality_id IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'event manager', 'program manager')
  )
);

-- =============================================
-- 2. ONBOARDING_EVENTS - Fix INSERT policy
-- =============================================

-- Drop the existing INSERT policy without WITH CHECK
DROP POLICY IF EXISTS "Users can insert their own onboarding events" ON public.onboarding_events;

-- Create proper INSERT policy with WITH CHECK
CREATE POLICY "onboarding_events_user_insert"
ON public.onboarding_events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);