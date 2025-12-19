-- Add missing solution tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.solution_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.solution_interests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.solution_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.solution_version_history;