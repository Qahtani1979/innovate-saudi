-- Drop restrictive policies and add admin-friendly ones
DROP POLICY IF EXISTS "Admins can manage system validations" ON system_validations;
DROP POLICY IF EXISTS "Admins can manage validation summaries" ON system_validation_summaries;

-- Allow admins (by role) to manage system_validations
CREATE POLICY "Admins can manage system validations" ON system_validations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND (ur.role = 'admin' OR ur.role_id IN (SELECT id FROM roles WHERE name = 'admin'))
    AND ur.is_active = true
  )
);

-- Allow admins (by role) to manage system_validation_summaries
CREATE POLICY "Admins can manage validation summaries" ON system_validation_summaries
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND (ur.role = 'admin' OR ur.role_id IN (SELECT id FROM roles WHERE name = 'admin'))
    AND ur.is_active = true
  )
);