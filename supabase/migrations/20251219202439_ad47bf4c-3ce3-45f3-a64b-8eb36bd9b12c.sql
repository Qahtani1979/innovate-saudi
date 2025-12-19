-- Living Labs Database Gaps Fix (corrected columns)

-- Add indexes for performance on living_labs (using actual columns)
CREATE INDEX IF NOT EXISTS idx_living_labs_status ON public.living_labs(status);
CREATE INDEX IF NOT EXISTS idx_living_labs_municipality_id ON public.living_labs(municipality_id);
CREATE INDEX IF NOT EXISTS idx_living_labs_domain ON public.living_labs(domain);
CREATE INDEX IF NOT EXISTS idx_living_labs_is_active ON public.living_labs(is_active);
CREATE INDEX IF NOT EXISTS idx_living_labs_region_id ON public.living_labs(region_id);

-- Add indexes for living_lab_bookings
CREATE INDEX IF NOT EXISTS idx_living_lab_bookings_status ON public.living_lab_bookings(status);
CREATE INDEX IF NOT EXISTS idx_living_lab_bookings_living_lab_id ON public.living_lab_bookings(living_lab_id);
CREATE INDEX IF NOT EXISTS idx_living_lab_bookings_project_type ON public.living_lab_bookings(project_type);
CREATE INDEX IF NOT EXISTS idx_living_lab_bookings_organization_id ON public.living_lab_bookings(organization_id);

-- Create updated_at trigger for living_labs if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_living_labs_updated_at'
  ) THEN
    CREATE TRIGGER update_living_labs_updated_at
      BEFORE UPDATE ON public.living_labs
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create updated_at trigger for living_lab_bookings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_living_lab_bookings_updated_at'
  ) THEN
    CREATE TRIGGER update_living_lab_bookings_updated_at
      BEFORE UPDATE ON public.living_lab_bookings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add living_labs to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.living_labs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.living_lab_bookings;