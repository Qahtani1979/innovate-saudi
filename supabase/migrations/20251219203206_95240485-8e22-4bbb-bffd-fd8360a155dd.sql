-- ================================================
-- R&D PROJECTS & CALLS SYSTEM - FIX ALL GAPS
-- ================================================

-- 1. Add performance indexes for rd_projects
CREATE INDEX IF NOT EXISTS idx_rd_projects_status ON public.rd_projects(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_rd_projects_sector_id ON public.rd_projects(sector_id);
CREATE INDEX IF NOT EXISTS idx_rd_projects_created_at ON public.rd_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_rd_projects_is_published ON public.rd_projects(is_published);
CREATE INDEX IF NOT EXISTS idx_rd_projects_is_deleted ON public.rd_projects(is_deleted);
CREATE INDEX IF NOT EXISTS idx_rd_projects_principal_investigator ON public.rd_projects(principal_investigator_id);

-- 2. Add performance indexes for rd_calls
CREATE INDEX IF NOT EXISTS idx_rd_calls_status ON public.rd_calls(status);
CREATE INDEX IF NOT EXISTS idx_rd_calls_sector_id ON public.rd_calls(sector_id);
CREATE INDEX IF NOT EXISTS idx_rd_calls_created_at ON public.rd_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_rd_calls_is_published ON public.rd_calls(is_published);
CREATE INDEX IF NOT EXISTS idx_rd_calls_application_deadline ON public.rd_calls(application_deadline);

-- 3. Add performance indexes for rd_proposals
CREATE INDEX IF NOT EXISTS idx_rd_proposals_rd_call_id ON public.rd_proposals(rd_call_id);
CREATE INDEX IF NOT EXISTS idx_rd_proposals_status ON public.rd_proposals(status);
CREATE INDEX IF NOT EXISTS idx_rd_proposals_submitter_id ON public.rd_proposals(submitter_id);
CREATE INDEX IF NOT EXISTS idx_rd_proposals_created_at ON public.rd_proposals(created_at);

-- 4. Add updated_at trigger for rd_projects if not exists
DROP TRIGGER IF EXISTS update_rd_projects_updated_at ON public.rd_projects;
CREATE TRIGGER update_rd_projects_updated_at
  BEFORE UPDATE ON public.rd_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add updated_at trigger for rd_calls if not exists
DROP TRIGGER IF EXISTS update_rd_calls_updated_at ON public.rd_calls;
CREATE TRIGGER update_rd_calls_updated_at
  BEFORE UPDATE ON public.rd_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Add updated_at trigger for rd_proposals if not exists  
DROP TRIGGER IF EXISTS update_rd_proposals_updated_at ON public.rd_proposals;
CREATE TRIGGER update_rd_proposals_updated_at
  BEFORE UPDATE ON public.rd_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Enable realtime for R&D tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rd_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rd_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rd_proposals;

-- 8. RLS: Researchers can view their own projects
CREATE POLICY "Researchers can view own projects" 
  ON public.rd_projects 
  FOR SELECT 
  USING (
    principal_investigator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND ur.is_active = true
        AND LOWER(r.name) IN ('researcher', 'r&d manager', 'research lead')
    )
  );

-- 9. RLS: Proposal submitters can view their own proposals
CREATE POLICY "Submitters can view own proposals"
  ON public.rd_proposals
  FOR SELECT
  USING (
    submitter_id = auth.uid() OR
    auth.uid()::text = submitter_email OR
    is_admin(auth.uid())
  );

-- 10. RLS: Authenticated users can submit proposals to open calls
CREATE POLICY "Authenticated can submit proposals"
  ON public.rd_proposals
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.rd_calls 
      WHERE id = rd_call_id 
      AND status = 'open'
      AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
    )
  );

-- 11. RLS: Submitters can update their own draft proposals
CREATE POLICY "Submitters can update own draft proposals"
  ON public.rd_proposals
  FOR UPDATE
  USING (
    (submitter_id = auth.uid() OR auth.uid()::text = submitter_email)
    AND status = 'draft'
  );

-- 12. RLS: Sector staff can view rd_calls in their sector
CREATE POLICY "Sector staff can view sector calls"
  ON public.rd_calls
  FOR SELECT
  USING (
    is_published = true OR
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND LOWER(r.name) IN ('rd_manager', 'research lead', 'program manager')
    )
  );