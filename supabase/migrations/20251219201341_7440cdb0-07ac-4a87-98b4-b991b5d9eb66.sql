
-- Fix Living Labs RLS Gaps

-- GAP rls-6: Municipality staff can manage their own living labs
CREATE POLICY "Municipality staff can manage own living labs"
ON public.living_labs
FOR ALL
USING (
  municipality_id IN (
    SELECT municipality_id FROM user_profiles WHERE user_id = auth.uid()
  )
);

-- GAP rls-7: Booking owners can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.living_lab_bookings
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  )
  OR approved_by = auth.uid()
);
