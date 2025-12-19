
-- Enable REPLICA IDENTITY FULL for realtime updates on all core tables
-- This ensures complete row data is captured during updates for realtime subscriptions

-- Core Innovation Pipeline
ALTER TABLE public.pilots REPLICA IDENTITY FULL;
ALTER TABLE public.solutions REPLICA IDENTITY FULL;
ALTER TABLE public.challenges REPLICA IDENTITY FULL;
ALTER TABLE public.programs REPLICA IDENTITY FULL;

-- Events & Engagement
ALTER TABLE public.events REPLICA IDENTITY FULL;

-- Innovation Infrastructure
ALTER TABLE public.living_labs REPLICA IDENTITY FULL;
ALTER TABLE public.sandboxes REPLICA IDENTITY FULL;

-- R&D System
ALTER TABLE public.rd_projects REPLICA IDENTITY FULL;
ALTER TABLE public.rd_calls REPLICA IDENTITY FULL;

-- Innovation Proposals
ALTER TABLE public.innovation_proposals REPLICA IDENTITY FULL;

-- Reference Data
ALTER TABLE public.organizations REPLICA IDENTITY FULL;
ALTER TABLE public.municipalities REPLICA IDENTITY FULL;
ALTER TABLE public.ministries REPLICA IDENTITY FULL;
ALTER TABLE public.sectors REPLICA IDENTITY FULL;

-- Ensure tables are added to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pilots'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pilots;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'solutions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.solutions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'challenges'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'programs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'living_labs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.living_labs;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sandboxes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sandboxes;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rd_projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rd_projects;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rd_calls'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rd_calls;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'innovation_proposals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.innovation_proposals;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'organizations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'municipalities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.municipalities;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'ministries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ministries;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sectors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sectors;
  END IF;
END$$;
