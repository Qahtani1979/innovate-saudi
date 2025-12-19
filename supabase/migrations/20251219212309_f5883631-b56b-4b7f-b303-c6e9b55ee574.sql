-- =============================================
-- Sectors & Taxonomy System Enhancement
-- =============================================

-- Performance indexes for sectors table
CREATE INDEX IF NOT EXISTS idx_sectors_is_active ON public.sectors(is_active);
CREATE INDEX IF NOT EXISTS idx_sectors_deputyship_id ON public.sectors(deputyship_id);
CREATE INDEX IF NOT EXISTS idx_sectors_display_order ON public.sectors(display_order);
CREATE INDEX IF NOT EXISTS idx_sectors_created_at ON public.sectors(created_at);

-- Performance indexes for subsectors table
CREATE INDEX IF NOT EXISTS idx_subsectors_sector_id ON public.subsectors(sector_id);
CREATE INDEX IF NOT EXISTS idx_subsectors_is_active ON public.subsectors(is_active);
CREATE INDEX IF NOT EXISTS idx_subsectors_display_order ON public.subsectors(display_order);
CREATE INDEX IF NOT EXISTS idx_subsectors_code ON public.subsectors(code);

-- Performance indexes for services table
CREATE INDEX IF NOT EXISTS idx_services_subsector_id ON public.services(subsector_id);
CREATE INDEX IF NOT EXISTS idx_services_sector_id ON public.services(sector_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_code ON public.services(code);

-- Performance indexes for domains table
CREATE INDEX IF NOT EXISTS idx_domains_is_active ON public.domains(is_active);
CREATE INDEX IF NOT EXISTS idx_domains_display_order ON public.domains(display_order);
CREATE INDEX IF NOT EXISTS idx_domains_code ON public.domains(code);

-- Performance indexes for deputyships table
CREATE INDEX IF NOT EXISTS idx_deputyships_domain_id ON public.deputyships(domain_id);
CREATE INDEX IF NOT EXISTS idx_deputyships_is_active ON public.deputyships(is_active);
CREATE INDEX IF NOT EXISTS idx_deputyships_display_order ON public.deputyships(display_order);
CREATE INDEX IF NOT EXISTS idx_deputyships_code ON public.deputyships(code);

-- Add missing columns to domains if needed
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Add missing columns to deputyships if needed
ALTER TABLE public.deputyships ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.deputyships ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.deputyships ADD COLUMN IF NOT EXISTS deleted_by TEXT;
ALTER TABLE public.deputyships ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.deputyships ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add missing columns to sectors if needed
ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Add missing columns to subsectors if needed
ALTER TABLE public.subsectors ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subsectors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.subsectors ADD COLUMN IF NOT EXISTS deleted_by TEXT;
ALTER TABLE public.subsectors ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add missing columns to services if needed
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS deleted_by TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_taxonomy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_domains_updated_at ON public.domains;
CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON public.domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_taxonomy_updated_at();

DROP TRIGGER IF EXISTS update_deputyships_updated_at ON public.deputyships;
CREATE TRIGGER update_deputyships_updated_at
  BEFORE UPDATE ON public.deputyships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_taxonomy_updated_at();

DROP TRIGGER IF EXISTS update_sectors_updated_at ON public.sectors;
CREATE TRIGGER update_sectors_updated_at
  BEFORE UPDATE ON public.sectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_taxonomy_updated_at();

DROP TRIGGER IF EXISTS update_subsectors_updated_at ON public.subsectors;
CREATE TRIGGER update_subsectors_updated_at
  BEFORE UPDATE ON public.subsectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_taxonomy_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_taxonomy_updated_at();

-- Enable realtime for taxonomy tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.domains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deputyships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sectors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subsectors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;

-- RLS policies for domains
DROP POLICY IF EXISTS "Anyone can view domains" ON public.domains;
CREATE POLICY "Anyone can view domains" ON public.domains
  FOR SELECT USING (is_active = true AND (is_deleted = false OR is_deleted IS NULL));

DROP POLICY IF EXISTS "Admins can manage domains" ON public.domains;
CREATE POLICY "Admins can manage domains" ON public.domains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND ur.is_active = true
        AND LOWER(r.name) = 'admin'
    )
  );

-- RLS policies for deputyships  
DROP POLICY IF EXISTS "Anyone can view deputyships" ON public.deputyships;
CREATE POLICY "Anyone can view deputyships" ON public.deputyships
  FOR SELECT USING (is_active = true AND (is_deleted = false OR is_deleted IS NULL));

DROP POLICY IF EXISTS "Admins can manage deputyships" ON public.deputyships;
CREATE POLICY "Admins can manage deputyships" ON public.deputyships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND ur.is_active = true
        AND LOWER(r.name) = 'admin'
    )
  );

-- RLS policies for custom_expertise_areas
DROP POLICY IF EXISTS "Anyone can view approved expertise areas" ON public.custom_expertise_areas;
CREATE POLICY "Anyone can view approved expertise areas" ON public.custom_expertise_areas
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage expertise areas" ON public.custom_expertise_areas;
CREATE POLICY "Admins can manage expertise areas" ON public.custom_expertise_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
        AND ur.is_active = true
        AND LOWER(r.name) = 'admin'
    )
  );