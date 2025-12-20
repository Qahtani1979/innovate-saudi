-- Add missing RLS policies for user_sessions table
-- Users should be able to view and manage their own sessions

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own sessions (for session tracking)
CREATE POLICY "Users can create own sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions (for marking as ended)
CREATE POLICY "Users can update own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add policy for access_logs - users should be able to view their own login history
CREATE POLICY "Users can view own access logs" 
ON public.access_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can insert access logs (for auth event logging)
CREATE POLICY "Service role can insert access logs" 
ON public.access_logs 
FOR INSERT 
WITH CHECK (true);