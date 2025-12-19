-- Enable realtime for challenges tables
-- rt-1: Realtime enabled on main table

-- Set REPLICA IDENTITY FULL for complete row data
ALTER TABLE public.challenges REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_activities REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_proposals REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_solution_matches REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_solution_matches;