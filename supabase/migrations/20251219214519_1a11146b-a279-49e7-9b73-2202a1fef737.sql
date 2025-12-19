
-- ============================================
-- COMPREHENSIVE DEEP VALIDATION FIX - SAFE VERSION
-- ============================================

-- 1. CREATE/REPLACE updated_at TRIGGERS
DROP TRIGGER IF EXISTS update_pilots_updated_at ON public.pilots;
CREATE TRIGGER update_pilots_updated_at BEFORE UPDATE ON public.pilots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_solutions_updated_at ON public.solutions;
CREATE TRIGGER update_solutions_updated_at BEFORE UPDATE ON public.solutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_programs_updated_at ON public.programs;
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_living_labs_updated_at ON public.living_labs;
CREATE TRIGGER update_living_labs_updated_at BEFORE UPDATE ON public.living_labs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sandboxes_updated_at ON public.sandboxes;
CREATE TRIGGER update_sandboxes_updated_at BEFORE UPDATE ON public.sandboxes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rd_projects_updated_at ON public.rd_projects;
CREATE TRIGGER update_rd_projects_updated_at BEFORE UPDATE ON public.rd_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rd_calls_updated_at ON public.rd_calls;
CREATE TRIGGER update_rd_calls_updated_at BEFORE UPDATE ON public.rd_calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_innovation_proposals_updated_at ON public.innovation_proposals;
CREATE TRIGGER update_innovation_proposals_updated_at BEFORE UPDATE ON public.innovation_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_municipalities_updated_at ON public.municipalities;
CREATE TRIGGER update_municipalities_updated_at BEFORE UPDATE ON public.municipalities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ministries_updated_at ON public.ministries;
CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON public.ministries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ADD MISSING COLUMNS
ALTER TABLE public.pilots ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id);
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id);
ALTER TABLE public.rd_calls ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE public.rd_calls ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.rd_calls ADD COLUMN IF NOT EXISTS deleted_by text;
ALTER TABLE public.rd_projects ADD COLUMN IF NOT EXISTS municipality_id uuid REFERENCES public.municipalities(id);

-- 3. ADD PERFORMANCE INDEXES (only for verified columns)
CREATE INDEX IF NOT EXISTS idx_pilots_sector_id ON public.pilots(sector_id);
CREATE INDEX IF NOT EXISTS idx_solutions_sector_id ON public.solutions(sector_id);
CREATE INDEX IF NOT EXISTS idx_solutions_created_at ON public.solutions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solutions_maturity_level ON public.solutions(maturity_level);
CREATE INDEX IF NOT EXISTS idx_programs_created_at ON public.programs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_rd_projects_municipality_id ON public.rd_projects(municipality_id);
CREATE INDEX IF NOT EXISTS idx_rd_projects_workflow_stage ON public.rd_projects(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_rd_projects_created_at ON public.rd_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rd_calls_status ON public.rd_calls(status);
CREATE INDEX IF NOT EXISTS idx_rd_calls_deadline ON public.rd_calls(application_deadline);
CREATE INDEX IF NOT EXISTS idx_rd_calls_created_at ON public.rd_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rd_calls_is_deleted ON public.rd_calls(is_deleted);

-- 4. ENABLE REALTIME
ALTER TABLE public.solutions REPLICA IDENTITY FULL;
ALTER TABLE public.programs REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.living_labs REPLICA IDENTITY FULL;
ALTER TABLE public.sandboxes REPLICA IDENTITY FULL;
ALTER TABLE public.rd_projects REPLICA IDENTITY FULL;
ALTER TABLE public.rd_calls REPLICA IDENTITY FULL;
ALTER TABLE public.innovation_proposals REPLICA IDENTITY FULL;
ALTER TABLE public.organizations REPLICA IDENTITY FULL;
ALTER TABLE public.municipalities REPLICA IDENTITY FULL;
ALTER TABLE public.ministries REPLICA IDENTITY FULL;
ALTER TABLE public.sectors REPLICA IDENTITY FULL;
ALTER TABLE public.subsectors REPLICA IDENTITY FULL;
ALTER TABLE public.services REPLICA IDENTITY FULL;

-- 5. R&D CALLS RLS POLICIES
ALTER TABLE public.rd_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage rd_calls" ON public.rd_calls;
DROP POLICY IF EXISTS "Anyone can view published rd_calls" ON public.rd_calls;
DROP POLICY IF EXISTS "Deputyship staff can view all rd_calls" ON public.rd_calls;
DROP POLICY IF EXISTS "Researchers can view rd_calls" ON public.rd_calls;

CREATE POLICY "Admins can manage rd_calls" ON public.rd_calls FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view published rd_calls" ON public.rd_calls FOR SELECT
  USING (is_published = true AND (is_deleted IS NULL OR is_deleted = false));

CREATE POLICY "Deputyship staff can view all rd_calls" ON public.rd_calls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND ur.is_active = true AND LOWER(r.name) LIKE '%deputyship%'
  ));

CREATE POLICY "Researchers can view rd_calls" ON public.rd_calls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND ur.is_active = true 
    AND (LOWER(r.name) LIKE '%researcher%' OR LOWER(r.name) LIKE '%academia%')
  ));
