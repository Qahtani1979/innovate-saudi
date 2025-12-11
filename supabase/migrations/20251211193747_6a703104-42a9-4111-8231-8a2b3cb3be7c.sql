-- Add missing GDIBS roles to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gdibs_internal';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gdibs_analyst';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gdibs_coordinator';