-- Add pilot_kpis and pilot_issues to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pilot_kpis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pilot_issues;