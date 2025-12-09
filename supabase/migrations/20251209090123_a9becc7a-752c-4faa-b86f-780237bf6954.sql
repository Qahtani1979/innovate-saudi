-- Add missing page_url column to user_activities table
ALTER TABLE public.user_activities 
ADD COLUMN IF NOT EXISTS page_url TEXT;