-- Fix RLS policies for programs - add staff management

-- Staff can view all programs (including unpublished for management)
CREATE POLICY "programs_staff_view_all"
ON public.programs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager', 'program director')
  )
);

-- Staff can create programs
CREATE POLICY "programs_staff_create"
ON public.programs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager', 'program director')
  )
);

-- Staff can update programs
CREATE POLICY "programs_staff_update"
ON public.programs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager', 'program director')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND LOWER(r.name) IN ('municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'program manager', 'program director')
  )
);