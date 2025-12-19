-- COMPREHENSIVE SYSTEM VALIDATION FIXES - PART 1
-- Fixing gaps across all major systems

-- =============================================
-- 1. SANDBOXES TABLE FIXES
-- =============================================

-- Add missing columns to sandboxes
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id);
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS municipality_id uuid REFERENCES public.municipalities(id);
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS gallery_urls text[];
ALTER TABLE public.sandboxes ADD COLUMN IF NOT EXISTS tags text[];

-- Add indexes for sandboxes
CREATE INDEX IF NOT EXISTS idx_sandboxes_status ON public.sandboxes(status);
CREATE INDEX IF NOT EXISTS idx_sandboxes_sector_id ON public.sandboxes(sector_id);
CREATE INDEX IF NOT EXISTS idx_sandboxes_municipality_id ON public.sandboxes(municipality_id);
CREATE INDEX IF NOT EXISTS idx_sandboxes_is_deleted ON public.sandboxes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_sandboxes_created_at ON public.sandboxes(created_at);

-- =============================================
-- 2. LIVING LABS TABLE FIXES
-- =============================================

-- Add missing columns to living_labs (add is_deleted first since it doesn't exist)
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id);
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE public.living_labs ADD COLUMN IF NOT EXISTS tags text[];

-- Add indexes for living_labs
CREATE INDEX IF NOT EXISTS idx_living_labs_status ON public.living_labs(status);
CREATE INDEX IF NOT EXISTS idx_living_labs_sector_id ON public.living_labs(sector_id);
CREATE INDEX IF NOT EXISTS idx_living_labs_municipality_id ON public.living_labs(municipality_id);
CREATE INDEX IF NOT EXISTS idx_living_labs_is_deleted ON public.living_labs(is_deleted);
CREATE INDEX IF NOT EXISTS idx_living_labs_created_at ON public.living_labs(created_at);

-- =============================================
-- 3. INNOVATION PROPOSALS TABLE FIXES
-- =============================================

-- Add missing columns
ALTER TABLE public.innovation_proposals ADD COLUMN IF NOT EXISTS municipality_id uuid REFERENCES public.municipalities(id);
ALTER TABLE public.innovation_proposals ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE public.innovation_proposals ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.innovation_proposals ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.innovation_proposals ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.innovation_proposals ADD COLUMN IF NOT EXISTS deleted_by uuid;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_status ON public.innovation_proposals(status);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_sector_id ON public.innovation_proposals(sector_id);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_submitter_id ON public.innovation_proposals(submitter_id);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_organization_id ON public.innovation_proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_is_deleted ON public.innovation_proposals(is_deleted);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_municipality_id ON public.innovation_proposals(municipality_id);
CREATE INDEX IF NOT EXISTS idx_innovation_proposals_created_at ON public.innovation_proposals(created_at);

-- =============================================
-- 4. UPDATED_AT TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Sandboxes trigger
DROP TRIGGER IF EXISTS update_sandboxes_updated_at ON public.sandboxes;
CREATE TRIGGER update_sandboxes_updated_at
  BEFORE UPDATE ON public.sandboxes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Living Labs trigger
DROP TRIGGER IF EXISTS update_living_labs_updated_at ON public.living_labs;
CREATE TRIGGER update_living_labs_updated_at
  BEFORE UPDATE ON public.living_labs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Innovation Proposals trigger
DROP TRIGGER IF EXISTS update_innovation_proposals_updated_at ON public.innovation_proposals;
CREATE TRIGGER update_innovation_proposals_updated_at
  BEFORE UPDATE ON public.innovation_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();