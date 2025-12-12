# MII Drill Down Page - Design & Data Architecture

## Executive Summary

This document outlines the data sources, KPIs, and implementation plan for the MII (Municipal Innovation Index) Drill Down page. The goal is to replace mock data with real dynamic data from the database.

---

## Current State Analysis

### Pages Involved

| Page | Path | Purpose |
|------|------|---------|
| MII Drill Down | `/mii-drill-down` | Deep dive into single municipality's MII metrics |
| Municipality Profile | `/municipality-profile` | Overview of municipality with MII section |

---

## Database Schema

### 1. `municipalities` Table
| Column | Type | Purpose | Used In |
|--------|------|---------|---------|
| `id` | uuid | Primary key | Both |
| `name_en` | text | English name | Both |
| `name_ar` | text | Arabic name | Both |
| `mii_score` | numeric | Current overall MII score | Both |
| `mii_rank` | integer | National ranking | Both |
| `active_challenges` | integer | Count of active challenges | Both |
| `active_pilots` | integer | Count of active pilots | Both |
| `completed_pilots` | integer | Count of completed pilots | Both |
| `population` | integer | Population size | Both |
| `region` | text | Region name | Both |
| `city_type` | text | Type classification | Both |
| `contact_person` | text | Innovation focal point | Profile |
| `contact_email` | text | Contact email | Profile |
| `contact_phone` | text | Contact phone | Profile |

### 2. `mii_dimensions` Table (Reference Data)
| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `code` | text | Dimension code (e.g., 'LEADERSHIP') |
| `name_en` | text | English name |
| `name_ar` | text | Arabic name |
| `description_en` | text | English description |
| `description_ar` | text | Arabic description |
| `weight` | numeric | Weight in overall score calculation |
| `indicators` | jsonb | KPIs that feed into this dimension |
| `sort_order` | integer | Display order |
| `is_active` | boolean | Whether dimension is active |

### 3. `mii_results` Table (Time Series Data)
| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `municipality_id` | uuid | Foreign key to municipalities |
| `assessment_year` | integer | Year of assessment (2022-2025) |
| `overall_score` | numeric | Total MII score for that year |
| `dimension_scores` | jsonb | Breakdown by dimension |
| `rank` | integer | National rank for that year |
| `previous_rank` | integer | Previous year's rank |
| `assessment_date` | date | Date of assessment |
| `assessor_notes` | text | Notes from assessor |
| `is_published` | boolean | Whether result is published |
| `strengths` | jsonb | Array of strength areas (NEW) |
| `improvement_areas` | jsonb | Array of improvement areas (NEW) |
| `trend` | text | Score trend: 'up', 'down', 'stable' (NEW) |

---

## KPI Coverage Matrix

### Currently Implemented (Real Data) ✅

| KPI | Source Table | Column | MII Drill Down | Municipality Profile |
|-----|--------------|--------|----------------|---------------------|
| MII Score | municipalities | mii_score | ✅ | ✅ |
| National Rank | municipalities | mii_rank | ✅ | ✅ |
| Active Challenges | municipalities | active_challenges | ✅ | ✅ |
| Active Pilots | municipalities | active_pilots | ✅ | ✅ |
| Completed Pilots | municipalities | completed_pilots | ✅ | ✅ |
| Population | municipalities | population | ✅ | ✅ |
| Region | municipalities | region | ✅ | ✅ |
| City Type | municipalities | city_type | ✅ | ✅ |

### Currently Mock/Missing Data ⚠️

| KPI | Target Source | MII Drill Down | Municipality Profile | Action |
|-----|---------------|----------------|---------------------|--------|
| Dimension Breakdown (Radar) | mii_results.dimension_scores | ⚠️ Mock (L114-121) | ⚠️ Uses legacy keys | Align to new schema |
| Historical Trend (Line Chart) | mii_results (multi-year) | ⚠️ Mock (L124-129) | ❌ Missing | Add |
| YoY Growth | Calculated from mii_results | ⚠️ Mock | ❌ Missing | Calculate |
| Rank Change | mii_results.previous_rank | ❌ Missing | ❌ Missing | Add |
| Trend Arrow | mii_results.trend | ❌ Missing | ⚠️ Uses latestMII.trend | Align |
| Strengths | mii_results.strengths | ❌ Missing | ✅ | Add to DrillDown |
| Improvement Areas | mii_results.improvement_areas | ❌ Missing | ✅ | Add to DrillDown |
| AI Recommendations | AI Generated | ⚠️ Static | ✅ Dynamic | Make dynamic |

### Components from Municipality Profile (to add to MII Drill Down)

| Component | File | Purpose | Add to DrillDown? |
|-----------|------|---------|-------------------|
| MIIImprovementAI | src/components/municipalities/MIIImprovementAI.jsx | AI-powered improvement suggestions | ✅ Yes |
| PeerBenchmarkingTool | src/components/municipalities/PeerBenchmarkingTool.jsx | Compare with similar municipalities | ✅ Yes |

---

## Dimension Score Structure

### Standard 6 Dimensions (to populate in mii_dimensions)

| Code | Name (EN) | Name (AR) | Weight |
|------|-----------|-----------|--------|
| LEADERSHIP | Leadership & Governance | القيادة والحوكمة | 0.20 |
| STRATEGY | Innovation Strategy | استراتيجية الابتكار | 0.15 |
| CULTURE | Innovation Culture | ثقافة الابتكار | 0.15 |
| PARTNERSHIPS | Partnerships & Ecosystem | الشراكات والنظام البيئي | 0.15 |
| CAPABILITIES | Capabilities & Resources | القدرات والموارد | 0.15 |
| IMPACT | Impact & Outcomes | الأثر والنتائج | 0.20 |

### Expected `dimension_scores` JSON Format
```json
{
  "LEADERSHIP": {
    "score": 78,
    "indicators": {
      "vision_clarity": 85,
      "leadership_commitment": 72,
      "resource_allocation": 77
    }
  },
  "STRATEGY": {
    "score": 72,
    "indicators": {
      "innovation_roadmap": 70,
      "goal_alignment": 75,
      "measurement_framework": 71
    }
  },
  "CULTURE": {
    "score": 68,
    "indicators": {
      "risk_tolerance": 65,
      "experimentation": 70,
      "learning_mindset": 69
    }
  },
  "PARTNERSHIPS": {
    "score": 65,
    "indicators": {
      "private_sector": 60,
      "academia": 70,
      "cross_municipality": 65
    }
  },
  "CAPABILITIES": {
    "score": 70,
    "indicators": {
      "digital_maturity": 72,
      "talent_skills": 68,
      "infrastructure": 70
    }
  },
  "IMPACT": {
    "score": 75,
    "indicators": {
      "pilot_success": 80,
      "citizen_satisfaction": 72,
      "cost_savings": 73
    }
  }
}
```

### Legacy Keys Mapping (for backward compatibility)
Municipality Profile currently uses these keys in `dimension_scores`:
- `challenges_score` → map to LEADERSHIP or remove
- `pilots_score` → map to IMPACT or remove
- `innovation_capacity_score` → map to CAPABILITIES
- `partnership_score` → map to PARTNERSHIPS
- `digital_maturity_score` → map to CAPABILITIES.indicators.digital_maturity

---

## Data Sync Mechanism

### How Data Gets Updated Automatically

#### 1. Manual Assessment Entry (Primary Source)
```
Assessor → Admin Dashboard → mii_results table
         ↓ (trigger fires)
municipalities.mii_score + mii_rank updated
```

#### 2. Database Trigger (Automatic Sync)
When a new `mii_results` record is inserted or updated with `is_published = true`:

```sql
CREATE OR REPLACE FUNCTION sync_municipality_mii()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the municipality's score from latest published result
  UPDATE municipalities
  SET 
    mii_score = NEW.overall_score,
    mii_rank = NEW.rank,
    updated_at = now()
  WHERE id = NEW.municipality_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_mii_result_publish
AFTER INSERT OR UPDATE ON mii_results
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION sync_municipality_mii();
```

#### 3. Rank Recalculation (When Any Score Changes)
```sql
CREATE OR REPLACE FUNCTION recalculate_mii_ranks()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate ranks for all municipalities based on latest scores
  WITH ranked AS (
    SELECT 
      municipality_id,
      ROW_NUMBER() OVER (ORDER BY overall_score DESC NULLS LAST) as new_rank
    FROM mii_results
    WHERE assessment_year = (SELECT MAX(assessment_year) FROM mii_results WHERE is_published = true)
      AND is_published = true
  )
  UPDATE municipalities m
  SET mii_rank = r.new_rank
  FROM ranked r
  WHERE m.id = r.municipality_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 4. Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ENTRY POINTS                             │
├──────────────────────────────────────────────────────────────────┤
│  1. Admin Dashboard (manual entry)                               │
│  2. Bulk Import (Excel/CSV)                                      │
│  3. API Integration (external systems)                           │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      mii_results table                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ INSERT/UPDATE with is_published = true                   │    │
│  └───────────────────────────┬─────────────────────────────┘    │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼ TRIGGER: sync_municipality_mii()
┌─────────────────────────────────────────────────────────────────┐
│                    municipalities table                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ mii_score = NEW.overall_score                            │    │
│  │ mii_rank = NEW.rank                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼ TRIGGER: recalculate_mii_ranks()
┌─────────────────────────────────────────────────────────────────┐
│              ALL municipalities ranks updated                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Database Migration - Add Missing Columns

```sql
-- Add missing columns to mii_results
ALTER TABLE mii_results ADD COLUMN IF NOT EXISTS strengths jsonb;
ALTER TABLE mii_results ADD COLUMN IF NOT EXISTS improvement_areas jsonb;
ALTER TABLE mii_results ADD COLUMN IF NOT EXISTS trend text CHECK (trend IN ('up', 'down', 'stable'));
```

### Phase 2: Seed Reference Data (mii_dimensions)

```sql
INSERT INTO mii_dimensions (id, code, name_en, name_ar, weight, sort_order, is_active, description_en, description_ar) VALUES
  (gen_random_uuid(), 'LEADERSHIP', 'Leadership & Governance', 'القيادة والحوكمة', 0.20, 1, true, 'Vision clarity, commitment, and resource allocation', 'وضوح الرؤية والالتزام وتخصيص الموارد'),
  (gen_random_uuid(), 'STRATEGY', 'Innovation Strategy', 'استراتيجية الابتكار', 0.15, 2, true, 'Innovation roadmap and goal alignment', 'خارطة طريق الابتكار ومواءمة الأهداف'),
  (gen_random_uuid(), 'CULTURE', 'Innovation Culture', 'ثقافة الابتكار', 0.15, 3, true, 'Risk tolerance and experimentation mindset', 'تقبل المخاطر وعقلية التجريب'),
  (gen_random_uuid(), 'PARTNERSHIPS', 'Partnerships & Ecosystem', 'الشراكات والنظام البيئي', 0.15, 4, true, 'Private sector, academia, and cross-municipality collaboration', 'التعاون مع القطاع الخاص والأكاديمي والبلديات'),
  (gen_random_uuid(), 'CAPABILITIES', 'Capabilities & Resources', 'القدرات والموارد', 0.15, 5, true, 'Digital maturity, talent, and infrastructure', 'النضج الرقمي والمواهب والبنية التحتية'),
  (gen_random_uuid(), 'IMPACT', 'Impact & Outcomes', 'الأثر والنتائج', 0.20, 6, true, 'Pilot success rates and citizen satisfaction', 'معدلات نجاح التجارب ورضا المواطنين')
ON CONFLICT DO NOTHING;
```

### Phase 3: Seed Sample MII Results

```sql
-- Generate historical data for municipalities with mii_score
INSERT INTO mii_results (municipality_id, assessment_year, overall_score, dimension_scores, rank, previous_rank, is_published, trend, strengths, improvement_areas)
SELECT 
  m.id,
  year_data.year,
  GREATEST(0, LEAST(100, m.mii_score + (year_data.year - 2025) * 5 + (random() * 10 - 5))),
  jsonb_build_object(
    'LEADERSHIP', jsonb_build_object('score', GREATEST(0, LEAST(100, m.mii_score + random() * 15 - 5))),
    'STRATEGY', jsonb_build_object('score', GREATEST(0, LEAST(100, m.mii_score + random() * 15 - 7))),
    'CULTURE', jsonb_build_object('score', GREATEST(0, LEAST(100, m.mii_score + random() * 15 - 8))),
    'PARTNERSHIPS', jsonb_build_object('score', GREATEST(0, LEAST(100, m.mii_score + random() * 15 - 10))),
    'CAPABILITIES', jsonb_build_object('score', GREATEST(0, LEAST(100, m.mii_score + random() * 15 - 6))),
    'IMPACT', jsonb_build_object('score', GREATEST(0, LEAST(100, m.mii_score + random() * 15 - 4)))
  ),
  m.mii_rank,
  m.mii_rank + floor(random() * 5 - 2)::int,
  true,
  CASE 
    WHEN year_data.year = 2025 THEN 'up'
    WHEN random() > 0.5 THEN 'up'
    ELSE 'stable'
  END,
  '["Strong leadership commitment", "Clear innovation vision"]'::jsonb,
  '["Digital infrastructure", "Partnership development"]'::jsonb
FROM municipalities m
CROSS JOIN (SELECT generate_series(2023, 2025) as year) year_data
WHERE m.mii_score IS NOT NULL
ON CONFLICT DO NOTHING;
```

### Phase 4: Create Data Sync Triggers

```sql
-- Trigger to sync municipality score when result is published
CREATE OR REPLACE FUNCTION sync_municipality_mii()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true THEN
    UPDATE municipalities
    SET 
      mii_score = NEW.overall_score,
      mii_rank = NEW.rank,
      updated_at = now()
    WHERE id = NEW.municipality_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_mii_result_publish ON mii_results;
CREATE TRIGGER after_mii_result_publish
AFTER INSERT OR UPDATE ON mii_results
FOR EACH ROW
EXECUTE FUNCTION sync_municipality_mii();
```

### Phase 5: Create useMIIData Hook

**File:** `src/hooks/useMIIData.js`

```javascript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMIIData(municipalityId) {
  // Fetch dimensions (reference data)
  const { data: dimensions } = useQuery({
    queryKey: ['mii-dimensions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('mii_dimensions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      return data || [];
    }
  });

  // Fetch latest result for this municipality
  const { data: latestResult, isLoading: loadingResult } = useQuery({
    queryKey: ['mii-latest-result', municipalityId],
    queryFn: async () => {
      const { data } = await supabase
        .from('mii_results')
        .select('*')
        .eq('municipality_id', municipalityId)
        .eq('is_published', true)
        .order('assessment_year', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!municipalityId
  });

  // Fetch historical trend (all years)
  const { data: history } = useQuery({
    queryKey: ['mii-history', municipalityId],
    queryFn: async () => {
      const { data } = await supabase
        .from('mii_results')
        .select('assessment_year, overall_score, rank, dimension_scores')
        .eq('municipality_id', municipalityId)
        .eq('is_published', true)
        .order('assessment_year', { ascending: true });
      return data || [];
    },
    enabled: !!municipalityId
  });

  // Fetch national average (latest year)
  const { data: nationalStats } = useQuery({
    queryKey: ['mii-national-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('mii_results')
        .select('overall_score, dimension_scores')
        .eq('is_published', true)
        .order('assessment_year', { ascending: false });
      
      if (!data || data.length === 0) return null;
      
      // Get latest year's results
      const latestYear = data[0]?.assessment_year;
      const latestResults = data.filter(r => r.assessment_year === latestYear);
      
      // Calculate averages
      const avgScore = latestResults.reduce((sum, r) => sum + (r.overall_score || 0), 0) / latestResults.length;
      
      return {
        averageScore: Math.round(avgScore * 10) / 10,
        totalMunicipalities: latestResults.length
      };
    }
  });

  // Compute radar chart data
  const radarData = dimensions?.map(dim => {
    const dimScore = latestResult?.dimension_scores?.[dim.code]?.score || 0;
    return {
      dimension: dim.name_en,
      dimensionAr: dim.name_ar,
      code: dim.code,
      value: Math.round(dimScore),
      weight: dim.weight
    };
  }) || [];

  // Compute trend data for line chart
  const trendData = history?.map(h => ({
    year: h.assessment_year,
    score: Math.round(h.overall_score || 0)
  })) || [];

  // Compute YoY growth
  const yoyGrowth = history?.length >= 2 
    ? Math.round((history[history.length - 1].overall_score - history[history.length - 2].overall_score) * 10) / 10
    : null;

  // Compute rank change
  const rankChange = latestResult?.previous_rank && latestResult?.rank
    ? latestResult.previous_rank - latestResult.rank // Positive = improved
    : null;

  return {
    dimensions,
    latestResult,
    history,
    nationalStats,
    radarData,
    trendData,
    yoyGrowth,
    rankChange,
    trend: latestResult?.trend || 'stable',
    strengths: latestResult?.strengths || [],
    improvementAreas: latestResult?.improvement_areas || [],
    isLoading: loadingResult
  };
}
```

### Phase 6: Update MII Drill Down Page

**File:** `src/pages/MIIDrillDown.jsx`

**Changes:**
1. Import and use `useMIIData` hook
2. Replace mock `radarData` with `useMIIData.radarData`
3. Replace mock `trendData` with `useMIIData.trendData`
4. Add rank change indicator (↑5 or ↓3)
5. Add YoY growth percentage
6. Add Strengths/Improvement Areas section
7. Integrate `MIIImprovementAI` component
8. Integrate `PeerBenchmarkingTool` component
9. Add fallback for missing data

### Phase 7: Update Municipality Profile Page (Align)

**File:** `src/pages/MunicipalityProfile.jsx`

**Changes:**
1. Use `useMIIData` hook for consistency
2. Align radar chart dimension keys to new schema
3. Add historical trend chart (if missing)

---

## Files to Modify

| File | Action | Priority |
|------|--------|----------|
| Database | RUN migration for mii_dimensions + mii_results seed + triggers | P0 |
| `src/hooks/useMIIData.js` | CREATE - Centralized MII data hook | P1 |
| `src/pages/MIIDrillDown.jsx` | UPDATE - Use real data, add components | P1 |
| `src/pages/MunicipalityProfile.jsx` | UPDATE - Align dimension names, use hook | P2 |
| `docs/MII_DRILLDOWN_DESIGN.md` | UPDATE - Keep in sync | Ongoing |

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Real data in Radar Chart | 0% | 100% |
| Real data in Trend Chart | 0% | 100% |
| Real YoY Growth calculation | 0% | 100% |
| Rank change indicator | ❌ | ✅ |
| National average comparison | Partial | Full |
| Fallback for missing data | ❌ | ✅ |
| AI Recommendations | Static | Dynamic |
| Peer Benchmarking | Missing in DrillDown | Integrated |
| Strengths/Improvements display | Missing in DrillDown | ✅ |

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-12 | Initial design document created |
| 2025-12-12 | Deep analysis of MunicipalityProfile - added missing indicators |
| 2025-12-12 | Added data sync mechanism documentation |
| 2025-12-12 | Added database triggers for automatic updates |
| 2025-12-12 | Added legacy key mapping for backward compatibility |
