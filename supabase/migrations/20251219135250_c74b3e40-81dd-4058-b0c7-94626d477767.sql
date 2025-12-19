-- Enable realtime for pilots table (notif-4)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pilots'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pilots;
  END IF;
END;
$$;