-- Phase 3 Strategy Tracking Fields Migration
-- Add missing strategy tracking columns to support Phase 3 cascade

-- TASK-DB-002: Add strategy columns to challenges table
ALTER TABLE challenges 
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_challenges_is_strategy_derived 
  ON challenges(is_strategy_derived) WHERE is_strategy_derived = true;

-- TASK-DB-001: Add strategy columns to pilots table  
ALTER TABLE pilots 
  ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_pilots_strategic_plan_ids 
  ON pilots USING GIN(strategic_plan_ids);

CREATE INDEX IF NOT EXISTS idx_pilots_is_strategy_derived 
  ON pilots(is_strategy_derived) WHERE is_strategy_derived = true;

-- TASK-DB-003: Add is_strategy_derived to partnerships table
ALTER TABLE partnerships 
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_partnerships_is_strategy_derived 
  ON partnerships(is_strategy_derived) WHERE is_strategy_derived = true;

-- TASK-DB-004: Add strategy columns to rd_calls table
ALTER TABLE rd_calls 
  ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_rd_calls_strategic_plan_ids 
  ON rd_calls USING GIN(strategic_plan_ids);

CREATE INDEX IF NOT EXISTS idx_rd_calls_is_strategy_derived 
  ON rd_calls(is_strategy_derived) WHERE is_strategy_derived = true;

-- Add is_strategy_derived to events table (already has strategic_plan_ids)
-- is_strategy_derived already exists per query

-- Add strategy_derivation_date to events if missing (it already exists per query)
-- No action needed for events