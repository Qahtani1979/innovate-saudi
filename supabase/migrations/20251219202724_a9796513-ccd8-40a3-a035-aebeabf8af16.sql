-- Sandboxes Database Gaps Fix

-- Add performance indexes on sandboxes table
CREATE INDEX IF NOT EXISTS idx_sandboxes_status ON public.sandboxes(status);
CREATE INDEX IF NOT EXISTS idx_sandboxes_municipality_id ON public.sandboxes(municipality_id);
CREATE INDEX IF NOT EXISTS idx_sandboxes_domain ON public.sandboxes(domain);
CREATE INDEX IF NOT EXISTS idx_sandboxes_is_active ON public.sandboxes(is_active);
CREATE INDEX IF NOT EXISTS idx_sandboxes_living_lab_id ON public.sandboxes(living_lab_id);

-- Add indexes on sandbox_applications table
CREATE INDEX IF NOT EXISTS idx_sandbox_applications_status ON public.sandbox_applications(status);
CREATE INDEX IF NOT EXISTS idx_sandbox_applications_sandbox_id ON public.sandbox_applications(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_applications_applicant_email ON public.sandbox_applications(applicant_email);

-- Add RLS policies for municipality staff and applicants

-- Municipality staff can view their municipality's sandboxes
CREATE POLICY "Municipality staff can view their sandboxes"
ON public.sandboxes
FOR SELECT
USING (
  municipality_id IN (
    SELECT municipality_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Sandbox managers can update their sandboxes
CREATE POLICY "Sandbox managers can update their sandboxes"
ON public.sandboxes
FOR UPDATE
USING (
  municipality_id IN (
    SELECT municipality_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
      AND ur.is_active = true
      AND LOWER(r.name) IN ('sandbox manager', 'sandbox operator', 'admin')
  )
);

-- Applicants can view their own applications
CREATE POLICY "Applicants can view own applications"
ON public.sandbox_applications
FOR SELECT
USING (
  applicant_email = (
    SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()
  )
);

-- Applicants can insert their own applications
CREATE POLICY "Applicants can insert own applications"
ON public.sandbox_applications
FOR INSERT
WITH CHECK (
  applicant_email = (
    SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()
  )
);

-- Add sandboxes to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sandboxes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sandbox_applications;