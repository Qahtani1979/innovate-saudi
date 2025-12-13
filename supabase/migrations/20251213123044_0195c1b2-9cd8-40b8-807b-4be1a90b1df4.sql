-- Add sync tracking columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS program_synced boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS program_sync_source text;

-- Add comment for documentation
COMMENT ON COLUMN events.program_synced IS 'Whether this event was synced from a program (CampaignPlanner)';
COMMENT ON COLUMN events.program_sync_source IS 'Source of sync: campaign_planner, direct, etc.';