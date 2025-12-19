-- ================================================
-- INNOVATION PROPOSALS SYSTEM - FIX ALL GAPS
-- ================================================

-- 1. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_status ON public.innovation_proposals(status);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_sector_id ON public.innovation_proposals(sector_id);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_submitter_id ON public.innovation_proposals(submitter_id);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_submitter_email ON public.innovation_proposals(submitter_email);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_created_at ON public.innovation_proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_proposal_type ON public.innovation_proposals(proposal_type);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_is_deleted ON public.innovation_proposals(is_deleted);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_organization_id ON public.innovation_proposals(organization_id);

-- 2. Add updated_at trigger
DROP TRIGGER IF EXISTS update_innovation_proposals_updated_at ON public.innovation_proposals;
CREATE TRIGGER update_innovation_proposals_updated_at
  BEFORE UPDATE ON public.innovation_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.innovation_proposals;

-- 4. RLS: Evaluators can view proposals assigned to them
CREATE POLICY "Evaluators can view assigned proposals"
  ON public.innovation_proposals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND ur.is_active = true
        AND LOWER(r.name) IN ('evaluator', 'expert', 'program evaluator', 'idea moderator')
    )
  );

-- 5. RLS: Authenticated users can submit proposals
CREATE POLICY "Authenticated can submit proposals"
  ON public.innovation_proposals
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- 6. RLS: Submitters can update their draft proposals
CREATE POLICY "Submitters can update own drafts"
  ON public.innovation_proposals
  FOR UPDATE
  USING (
    (submitter_id = auth.uid() OR auth.email() = submitter_email)
    AND status = 'draft'
  );