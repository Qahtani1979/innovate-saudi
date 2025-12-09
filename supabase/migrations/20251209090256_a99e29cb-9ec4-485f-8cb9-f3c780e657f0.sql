-- Enable RLS and add policy for user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own activities
CREATE POLICY "Users can insert their own activities" 
ON public.user_activities 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Allow users to view their own activities
CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
TO authenticated
USING (auth.uid()::text = user_id::text);