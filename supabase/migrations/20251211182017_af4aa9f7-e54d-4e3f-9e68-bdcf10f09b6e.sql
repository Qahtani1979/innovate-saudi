-- Add missing columns to various tables

-- Add status column to programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add created_by column to rd_projects table
ALTER TABLE public.rd_projects 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Add created_by column to pilots table
ALTER TABLE public.pilots 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Add created_by column to challenges table (already has challenge_owner but adding created_by for compatibility)
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS created_by TEXT;