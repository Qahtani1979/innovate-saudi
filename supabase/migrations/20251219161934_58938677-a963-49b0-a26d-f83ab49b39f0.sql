-- Add program tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.program_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.program_mentorships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.program_pilot_links;