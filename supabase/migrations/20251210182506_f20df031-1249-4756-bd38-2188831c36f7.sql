-- Add municipality_coordinator and municipality_admin roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'municipality_coordinator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'municipality_admin';