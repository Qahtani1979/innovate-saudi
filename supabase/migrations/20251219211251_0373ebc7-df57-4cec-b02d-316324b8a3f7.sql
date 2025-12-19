
-- =============================================
-- MUNICIPALITIES SYSTEM VALIDATION FIXES (RETRY)
-- =============================================

-- 1. ADD MISSING INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_municipalities_region_id ON public.municipalities(region_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_sector_id ON public.municipalities(sector_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_ministry_id ON public.municipalities(ministry_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_is_active ON public.municipalities(is_active);
CREATE INDEX IF NOT EXISTS idx_municipalities_is_deleted ON public.municipalities(is_deleted);
CREATE INDEX IF NOT EXISTS idx_municipalities_mii_score ON public.municipalities(mii_score);
CREATE INDEX IF NOT EXISTS idx_municipalities_mii_rank ON public.municipalities(mii_rank);
CREATE INDEX IF NOT EXISTS idx_municipalities_city_type ON public.municipalities(city_type);
CREATE INDEX IF NOT EXISTS idx_municipalities_created_at ON public.municipalities(created_at);
CREATE INDEX IF NOT EXISTS idx_municipalities_is_verified ON public.municipalities(is_verified);
CREATE INDEX IF NOT EXISTS idx_municipalities_strategic_plan_id ON public.municipalities(strategic_plan_id);

-- 2. ADD UPDATED_AT TRIGGER
-- =============================================
DROP TRIGGER IF EXISTS update_municipalities_updated_at ON public.municipalities;
CREATE TRIGGER update_municipalities_updated_at
  BEFORE UPDATE ON public.municipalities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. ENABLE REALTIME (if not already)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'municipalities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.municipalities;
  END IF;
END $$;

-- 4. ADD ADDITIONAL RLS POLICIES
-- =============================================

-- Deputyship staff can view all municipalities for national oversight
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Deputyship staff can view all municipalities' AND tablename = 'municipalities') THEN
    CREATE POLICY "Deputyship staff can view all municipalities"
      ON public.municipalities
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON ur.role_id = r.id
          WHERE ur.user_id = auth.uid()
            AND ur.is_active = true
            AND LOWER(r.name) IN ('deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst')
        )
      );
  END IF;
END $$;

-- Municipality staff can view their own municipality
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Municipality staff can view own municipality' AND tablename = 'municipalities') THEN
    CREATE POLICY "Municipality staff can view own municipality"
      ON public.municipalities
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.is_active = true
            AND ur.municipality_id = municipalities.id
        )
      );
  END IF;
END $$;

-- Only admins can INSERT municipalities
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can create municipalities' AND tablename = 'municipalities') THEN
    CREATE POLICY "Admins can create municipalities"
      ON public.municipalities
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON ur.role_id = r.id
          WHERE ur.user_id = auth.uid()
            AND ur.is_active = true
            AND LOWER(r.name) = 'admin'
        )
      );
  END IF;
END $$;

-- Only admins can delete municipalities
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete municipalities' AND tablename = 'municipalities') THEN
    CREATE POLICY "Admins can delete municipalities"
      ON public.municipalities
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON ur.role_id = r.id
          WHERE ur.user_id = auth.uid()
            AND ur.is_active = true
            AND LOWER(r.name) = 'admin'
        )
      );
  END IF;
END $$;
