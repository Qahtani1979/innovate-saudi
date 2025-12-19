
-- =============================================
-- MINISTRIES SYSTEM VALIDATION FIXES
-- =============================================

-- 1. ADD MISSING COLUMNS FOR COMPLETENESS
-- =============================================
ALTER TABLE public.ministries 
ADD COLUMN IF NOT EXISTS description_en text,
ADD COLUMN IF NOT EXISTS description_ar text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id),
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_by uuid;

-- 2. ADD PERFORMANCE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_ministries_is_active ON public.ministries(is_active);
CREATE INDEX IF NOT EXISTS idx_ministries_is_deleted ON public.ministries(is_deleted);
CREATE INDEX IF NOT EXISTS idx_ministries_sector_id ON public.ministries(sector_id);
CREATE INDEX IF NOT EXISTS idx_ministries_created_at ON public.ministries(created_at);

-- 3. ADD UPDATED_AT TRIGGER
-- =============================================
DROP TRIGGER IF EXISTS update_ministries_updated_at ON public.ministries;
CREATE TRIGGER update_ministries_updated_at
  BEFORE UPDATE ON public.ministries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ENABLE REALTIME
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'ministries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ministries;
  END IF;
END $$;

-- 5. ADD RLS POLICIES
-- =============================================

-- Deputyship staff can view all ministries
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Deputyship staff can view all ministries' AND tablename = 'ministries') THEN
    CREATE POLICY "Deputyship staff can view all ministries"
      ON public.ministries
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

-- Admins can create ministries
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can create ministries' AND tablename = 'ministries') THEN
    CREATE POLICY "Admins can create ministries"
      ON public.ministries
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

-- Admins can update ministries
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update ministries' AND tablename = 'ministries') THEN
    CREATE POLICY "Admins can update ministries"
      ON public.ministries
      FOR UPDATE
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

-- Admins can delete ministries
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete ministries' AND tablename = 'ministries') THEN
    CREATE POLICY "Admins can delete ministries"
      ON public.ministries
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
