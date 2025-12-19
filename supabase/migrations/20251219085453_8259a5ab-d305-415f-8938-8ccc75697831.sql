-- Fix challenge_activities RLS - Add staff policies
CREATE POLICY "Staff can manage activities for own municipality challenges"
ON public.challenge_activities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_activities.challenge_id
    AND ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_activities.challenge_id
    AND ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer'])
  )
);

CREATE POLICY "Deputyship staff can view all activities"
ON public.challenge_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager'])
  )
);

-- Fix challenge_attachments RLS - Add staff policies
CREATE POLICY "Staff can manage attachments for own municipality challenges"
ON public.challenge_attachments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_attachments.challenge_id
    AND ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM challenges c
    JOIN user_roles ur ON ur.municipality_id = c.municipality_id
    JOIN roles r ON ur.role_id = r.id
    WHERE c.id = challenge_attachments.challenge_id
    AND ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['municipality staff', 'municipality admin', 'municipality director', 'municipality manager', 'challenge lead', 'challenge reviewer'])
  )
);

CREATE POLICY "Deputyship staff can view all attachments"
ON public.challenge_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND ur.is_active = true
    AND lower(r.name) = ANY(ARRAY['deputyship staff', 'deputyship admin', 'deputyship director', 'deputyship analyst', 'deputyship manager'])
  )
);

CREATE POLICY "Anyone can view public attachments"
ON public.challenge_attachments
FOR SELECT
USING (is_public = true);