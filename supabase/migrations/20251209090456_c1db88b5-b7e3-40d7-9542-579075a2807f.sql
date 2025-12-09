-- Drop existing policies and recreate with email-based check
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.user_activities;

-- Allow authenticated users to insert activities where email matches
CREATE POLICY "Users can insert their own activities" 
ON public.user_activities 
FOR INSERT 
TO authenticated
WITH CHECK (auth.email() = user_email);

-- Allow users to view activities by email match
CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
TO authenticated
USING (auth.email() = user_email);