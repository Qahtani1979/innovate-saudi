# Pilots Database Schema

## Overview

The pilots system uses the following database tables for managing innovation pilots.

## Main Tables

### pilots

Primary table for storing pilot information.

```sql
CREATE TABLE public.pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  tagline_en TEXT,
  tagline_ar TEXT,
  
  -- Relationships
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  solution_id UUID REFERENCES solutions(id),
  municipality_id UUID NOT NULL REFERENCES municipalities(id),
  city_id UUID REFERENCES cities(id),
  region_id UUID REFERENCES regions(id),
  living_lab_id UUID REFERENCES living_labs(id),
  sandbox_id UUID REFERENCES sandboxes(id),
  matchmaker_application_id UUID,
  source_program_id UUID,
  source_rd_project_id UUID,
  
  -- Classification
  sector TEXT NOT NULL,
  sub_sector TEXT,
  
  -- Content
  description_en TEXT,
  description_ar TEXT,
  objective_en TEXT,
  objective_ar TEXT,
  hypothesis TEXT,
  methodology TEXT,
  scope TEXT,
  target_population JSONB,
  
  -- Lifecycle
  stage TEXT DEFAULT 'ideation',
  timeline JSONB,
  duration_weeks INTEGER,
  
  -- Technology Readiness
  trl_start INTEGER,
  trl_current INTEGER,
  trl_target INTEGER,
  
  -- Budget
  budget NUMERIC,
  budget_currency TEXT DEFAULT 'SAR',
  budget_spent NUMERIC DEFAULT 0,
  budget_released NUMERIC DEFAULT 0,
  budget_approvals JSONB,
  budget_breakdown JSONB,
  resource_allocation JSONB,
  
  -- Metrics & Performance
  safety_incidents_count INTEGER DEFAULT 0,
  kpis JSONB,
  success_probability NUMERIC,
  risk_level TEXT,
  
  -- Team & Stakeholders
  team JSONB,
  stakeholders JSONB,
  risks JSONB,
  milestones JSONB,
  
  -- Engagement
  public_engagement JSONB,
  media_coverage JSONB,
  
  -- Pivot Tracking
  pivot_count INTEGER DEFAULT 0,
  pivot_history JSONB,
  gate_approval_history JSONB,
  
  -- AI & Recommendations
  ai_insights TEXT,
  recommendation TEXT,
  scaling_plan JSONB,
  
  -- Media
  image_url TEXT,
  gallery_urls TEXT[],
  video_url TEXT,
  tags TEXT[],
  
  -- Flags
  is_published BOOLEAN DEFAULT false,
  is_flagship BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_date TIMESTAMPTZ,
  deleted_by UUID,
  
  -- Versioning
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID,
  
  -- Strategy Links
  strategic_plan_ids TEXT[],
  is_strategy_derived BOOLEAN DEFAULT false,
  strategy_derivation_date TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);
```

## Views

### pilots_public_view

Public view with PII masking for safe external access.

```sql
CREATE VIEW public.pilots_public_view AS
SELECT 
  id, code, title_en, title_ar, stage,
  municipality_id, sector, sub_sector,
  description_en, description_ar,
  kpis, milestones,
  is_published, is_flagship,
  mask_email(created_by) as created_by_masked,
  created_at, updated_at
FROM public.pilots
WHERE is_deleted = false;
```

## Functions

### log_pilot_changes()

Audit trigger function that logs all pilot modifications.

```sql
CREATE TRIGGER pilot_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.pilots
FOR EACH ROW EXECUTE FUNCTION public.log_pilot_changes();
```

### validate_pilot_stage_transition()

Validates stage transitions follow allowed paths.

```sql
CREATE TRIGGER pilot_stage_transition_check
BEFORE UPDATE OF stage ON public.pilots
FOR EACH ROW EXECUTE FUNCTION public.validate_pilot_stage_transition();
```

### log_pilot_bulk_operation()

Logs bulk operations for audit trail.

### log_pilot_export()

Logs data exports for compliance.

### cleanup_old_pilot_audit_logs()

Retention policy function for audit logs.

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_pilots_stage ON pilots(stage);
CREATE INDEX idx_pilots_municipality ON pilots(municipality_id);
CREATE INDEX idx_pilots_challenge ON pilots(challenge_id);
CREATE INDEX idx_pilots_sector ON pilots(sector);
CREATE INDEX idx_pilots_created_at ON pilots(created_at DESC);
CREATE INDEX idx_pilots_is_deleted ON pilots(is_deleted) WHERE is_deleted = false;
```

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;

-- View policy
CREATE POLICY "pilots_select" ON pilots FOR SELECT
USING (
  is_deleted = false AND (
    is_published = true OR
    auth.uid() IS NOT NULL
  )
);

-- Insert policy
CREATE POLICY "pilots_insert" ON pilots FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Update policy
CREATE POLICY "pilots_update" ON pilots FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.jwt()->>'email' OR
    has_role_by_name(auth.uid(), 'admin')
  )
);

-- Delete policy
CREATE POLICY "pilots_delete" ON pilots FOR DELETE
USING (has_role_by_name(auth.uid(), 'admin'));
```

## Realtime

```sql
ALTER TABLE public.pilots REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pilots;
```
