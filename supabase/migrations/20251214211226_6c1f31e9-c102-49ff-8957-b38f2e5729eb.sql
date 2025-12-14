-- Phase 1: Demand-Driven Generation - Database Foundation

-- 1.1 Add cascade_config to strategic_plans
ALTER TABLE strategic_plans 
ADD COLUMN IF NOT EXISTS cascade_config JSONB DEFAULT '{
  "targets": {
    "challenges_per_objective": 5,
    "pilots_per_challenge": 2,
    "solutions_per_challenge": 3,
    "campaigns_per_objective": 2,
    "events_per_objective": 3,
    "policies_per_pillar": 2,
    "partnerships_per_sector": 3
  },
  "quality": {
    "min_alignment_score": 70,
    "min_feasibility_score": 60,
    "auto_accept_threshold": 85,
    "auto_reject_threshold": 40
  },
  "preferences": {
    "sector_distribution": "balanced",
    "priority_focus": "coverage",
    "batch_size": 5,
    "auto_generate": false
  }
}'::jsonb;

-- 1.2 Create demand_queue table
CREATE TABLE IF NOT EXISTS demand_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id TEXT,
  pillar_id TEXT,
  
  entity_type TEXT NOT NULL,
  generator_component TEXT NOT NULL,
  
  priority_score INTEGER NOT NULL DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
  priority_factors JSONB DEFAULT '{}'::jsonb,
  
  prefilled_spec JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  
  generated_entity_id UUID,
  generated_entity_type TEXT,
  quality_score INTEGER CHECK (quality_score IS NULL OR quality_score BETWEEN 0 AND 100),
  quality_feedback JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  batch_id UUID
);

-- Indexes for demand_queue
CREATE INDEX IF NOT EXISTS idx_demand_queue_priority ON demand_queue(strategic_plan_id, status, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_demand_queue_type ON demand_queue(entity_type, status);
CREATE INDEX IF NOT EXISTS idx_demand_queue_batch ON demand_queue(batch_id) WHERE batch_id IS NOT NULL;

-- Enable RLS on demand_queue
ALTER TABLE demand_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for demand_queue
CREATE POLICY "Users can view demand queue"
ON demand_queue FOR SELECT USING (true);

CREATE POLICY "Users can insert demand queue"
ON demand_queue FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update demand queue"
ON demand_queue FOR UPDATE USING (true);

CREATE POLICY "Users can delete demand queue"
ON demand_queue FOR DELETE USING (true);

-- 1.3 Create generation_history table
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID REFERENCES demand_queue(id) ON DELETE SET NULL,
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  attempt_number INTEGER NOT NULL DEFAULT 1,
  input_spec JSONB,
  output_entity JSONB,
  
  quality_assessment JSONB,
  overall_score INTEGER,
  
  generation_time_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  outcome TEXT NOT NULL,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for generation_history
CREATE INDEX IF NOT EXISTS idx_generation_history_plan ON generation_history(strategic_plan_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_entity ON generation_history(entity_type, outcome);

-- Enable RLS on generation_history
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view generation history"
ON generation_history FOR SELECT USING (true);

CREATE POLICY "Users can insert generation history"
ON generation_history FOR INSERT WITH CHECK (true);

-- 1.4 Create coverage_snapshots table
CREATE TABLE IF NOT EXISTS coverage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  objective_coverage JSONB NOT NULL DEFAULT '[]'::jsonb,
  entity_coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  gap_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  overall_coverage_pct INTEGER,
  total_objectives INTEGER,
  fully_covered_objectives INTEGER,
  total_gap_items INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(strategic_plan_id, snapshot_date)
);

-- Enable RLS on coverage_snapshots
ALTER TABLE coverage_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view coverage snapshots"
ON coverage_snapshots FOR SELECT USING (true);

CREATE POLICY "Users can manage coverage snapshots"
ON coverage_snapshots FOR ALL USING (true);

-- Trigger to update updated_at on demand_queue
CREATE OR REPLACE FUNCTION update_demand_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_demand_queue_updated_at ON demand_queue;
CREATE TRIGGER trigger_demand_queue_updated_at
  BEFORE UPDATE ON demand_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_demand_queue_updated_at();