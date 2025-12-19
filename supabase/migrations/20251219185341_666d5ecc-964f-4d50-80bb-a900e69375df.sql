-- =============================================
-- PROGRAMS & EVENTS SYSTEM ALIGNMENT MIGRATION
-- =============================================

-- 1. Add missing columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id),
ADD COLUMN IF NOT EXISTS created_by text,
ADD COLUMN IF NOT EXISTS deleted_by text,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. Add missing column to programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS municipality_id uuid REFERENCES public.municipalities(id);

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_is_deleted ON public.events(is_deleted);
CREATE INDEX IF NOT EXISTS idx_events_sector_id ON public.events(sector_id);
CREATE INDEX IF NOT EXISTS idx_events_municipality_sector ON public.events(municipality_id, sector_id);
CREATE INDEX IF NOT EXISTS idx_programs_municipality_id ON public.programs(municipality_id);

-- 4. Update RLS policies for events table to include is_deleted filter

-- Drop existing SELECT policies that need updating
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "events_staff_view_all" ON public.events;

-- Recreate with is_deleted filter
CREATE POLICY "Anyone can view published events" 
ON public.events 
FOR SELECT 
USING (is_published = true AND is_deleted = false);

CREATE POLICY "events_staff_view_all" 
ON public.events 
FOR SELECT 
TO authenticated
USING (
  is_deleted = false AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND ur.is_active = true 
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'event manager', 'program manager'])
  )
);

-- 5. Add DELETE policy for soft delete (staff can soft-delete own municipality events)
DROP POLICY IF EXISTS "events_staff_delete" ON public.events;

CREATE POLICY "events_staff_delete" 
ON public.events 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND ur.is_active = true 
    AND ur.municipality_id IS NOT NULL
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'event manager', 'program manager'])
  )
  AND (
    municipality_id IN (
      SELECT ur.municipality_id FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.municipality_id IS NOT NULL
    )
    OR municipality_id IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND ur.is_active = true 
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'deputyship staff', 'deputyship admin', 'event manager', 'program manager'])
  )
);