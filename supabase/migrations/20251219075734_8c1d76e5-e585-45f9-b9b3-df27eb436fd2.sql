-- Fix RLS policies for program-related tables (simplified)
-- Drop any partially created policies first
DROP POLICY IF EXISTS "program_applications_user_view_own" ON public.program_applications;
DROP POLICY IF EXISTS "program_applications_user_insert" ON public.program_applications;
DROP POLICY IF EXISTS "program_applications_user_update_own" ON public.program_applications;
DROP POLICY IF EXISTS "program_applications_staff_view" ON public.program_applications;
DROP POLICY IF EXISTS "program_mentorships_mentor_view" ON public.program_mentorships;
DROP POLICY IF EXISTS "program_mentorships_mentee_view" ON public.program_mentorships;
DROP POLICY IF EXISTS "program_mentorships_mentor_update" ON public.program_mentorships;
DROP POLICY IF EXISTS "program_mentorships_staff_manage" ON public.program_mentorships;
DROP POLICY IF EXISTS "program_pilot_links_staff_view" ON public.program_pilot_links;
DROP POLICY IF EXISTS "program_pilot_links_staff_insert" ON public.program_pilot_links;

-- =============================================
-- 1. PROGRAM_APPLICATIONS
-- =============================================

-- Applicants can view their own applications
CREATE POLICY "program_applications_user_view_own"
ON public.program_applications
FOR SELECT
TO authenticated
USING (applicant_email = auth.email());

-- Applicants can insert their own applications
CREATE POLICY "program_applications_user_insert"
ON public.program_applications
FOR INSERT
TO authenticated
WITH CHECK (applicant_email = auth.email());

-- Applicants can update their own applications (while draft/pending)
CREATE POLICY "program_applications_user_update_own"
ON public.program_applications
FOR UPDATE
TO authenticated
USING (applicant_email = auth.email() AND status IN ('draft', 'pending', 'submitted'))
WITH CHECK (applicant_email = auth.email());

-- Staff can view all applications (for program management)
CREATE POLICY "program_applications_staff_view"
ON public.program_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager')
  )
);

-- =============================================
-- 2. PROGRAM_MENTORSHIPS
-- =============================================

-- Mentors can view their mentorships
CREATE POLICY "program_mentorships_mentor_view"
ON public.program_mentorships
FOR SELECT
TO authenticated
USING (mentor_email = auth.email());

-- Mentees can view their mentorships
CREATE POLICY "program_mentorships_mentee_view"
ON public.program_mentorships
FOR SELECT
TO authenticated
USING (mentee_email = auth.email());

-- Mentors can update their mentorships (log sessions)
CREATE POLICY "program_mentorships_mentor_update"
ON public.program_mentorships
FOR UPDATE
TO authenticated
USING (mentor_email = auth.email())
WITH CHECK (mentor_email = auth.email());

-- Staff can manage all mentorships
CREATE POLICY "program_mentorships_staff_manage"
ON public.program_mentorships
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager')
  )
);

-- =============================================
-- 3. PROGRAM_PILOT_LINKS
-- =============================================

-- Staff can view pilot links
CREATE POLICY "program_pilot_links_staff_view"
ON public.program_pilot_links
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager', 'pilot manager')
  )
);

-- Staff can create pilot links
CREATE POLICY "program_pilot_links_staff_insert"
ON public.program_pilot_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager', 'pilot manager')
  )
);