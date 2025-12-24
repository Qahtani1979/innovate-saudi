-- Migration: Add missing fields to rd_proposals and matchmaker_applications
-- Date: 2025-12-22
-- Description: Adds fields discovered during base44 to Supabase migration

-- Add missing fields to rd_proposals table
ALTER TABLE rd_proposals 
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_ar TEXT,
  ADD COLUMN IF NOT EXISTS pi_name TEXT,
  ADD COLUMN IF NOT EXISTS budget_requested NUMERIC,
  ADD COLUMN IF NOT EXISTS duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS abstract_en TEXT,
  ADD COLUMN IF NOT EXISTS abstract_ar TEXT,
  ADD COLUMN IF NOT EXISTS institution_en TEXT;

-- Add missing fields to matchmaker_applications table
ALTER TABLE matchmaker_applications 
  ADD COLUMN IF NOT EXISTS organization_type TEXT,
  ADD COLUMN IF NOT EXISTS sectors TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN rd_proposals.title_en IS 'English title of the R&D proposal';
COMMENT ON COLUMN rd_proposals.title_ar IS 'Arabic title of the R&D proposal';
COMMENT ON COLUMN rd_proposals.pi_name IS 'Principal Investigator name';
COMMENT ON COLUMN rd_proposals.budget_requested IS 'Requested budget amount';
COMMENT ON COLUMN rd_proposals.duration_months IS 'Project duration in months';
COMMENT ON COLUMN rd_proposals.abstract_en IS 'English abstract of the proposal';
COMMENT ON COLUMN rd_proposals.abstract_ar IS 'Arabic abstract of the proposal';
COMMENT ON COLUMN rd_proposals.institution_en IS 'English name of the institution';

COMMENT ON COLUMN matchmaker_applications.organization_type IS 'Type of organization (startup, SME, corporate, etc.)';
COMMENT ON COLUMN matchmaker_applications.sectors IS 'Array of sectors the organization operates in';
