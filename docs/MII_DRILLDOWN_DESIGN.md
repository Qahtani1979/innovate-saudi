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

### Data Sources Available

#### 1. `municipalities` Table
| Column | Type | Used | Purpose |
|--------|------|------|---------|
| `mii_score` | numeric | ✅ | Current overall MII score |
| `mii_rank` | integer | ✅ | National ranking |
| `active_challenges` | integer | ✅ | Count of active challenges |
| `active_pilots` | integer | ✅ | Count of active pilots |
| `completed_pilots` | integer | ✅ | Count of completed pilots |
| `population` | integer | ✅ | Population size |
| `region` | text | ✅ | Region name |
| `city_type` | text | ✅ | Type classification |

#### 2. `mii_dimensions` Table (Reference Data)
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

#### 3. `mii_results` Table (Time Series Data)
| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `municipality_id` | uuid | Foreign key to municipalities |
| `assessment_year` | integer | Year of assessment (2022, 2023, 2024, 2025) |
| `overall_score` | numeric | Total MII score for that year |
| `dimension_scores` | jsonb | Breakdown by dimension |
| `rank` | integer | National rank for that year |
| `previous_rank` | integer | Previous year's rank |
| `assessment_date` | date | Date of assessment |
| `assessor_notes` | text | Notes from assessor |
| `is_published` | boolean | Whether result is published |

---

## KPI Coverage Matrix

### Currently Implemented (Real Data) ✅

| KPI | Source | MII Drill Down | Municipality Profile |
|-----|--------|----------------|---------------------|
| MII Score | `municipalities.mii_score` | ✅ | ✅ |
| National Rank | `municipalities.mii_rank` | ✅ | ✅ |
| Active Challenges | `municipalities.active_challenges` | ✅ | ✅ |
| Active Pilots | `municipalities.active_pilots` | ✅ | ✅ |
| Completed Pilots | `municipalities.completed_pilots` | ✅ | ✅ |
| Population | `municipalities.population` | ✅ | ✅ |
| Region | `municipalities.region` | ✅ | ✅ |
| City Type | `municipalities.city_type` | ✅ | ✅ |

### Currently Mock Data ⚠️

| KPI | Target Source | MII Drill Down | Municipality Profile |
|-----|---------------|----------------|---------------------|
| Dimension Breakdown (Radar) | `mii_results.dimension_scores` + `mii_dimensions` | ⚠️ Mock | ⚠️ Mock |
| Historical Trend | `mii_results` (multi-year) | ⚠️ Mock | ❌ Missing |
| YoY Growth | Calculated from `mii_results` | ⚠️ Mock | ⚠️ Mock |
| Rank Change | `mii_results.previous_rank` | ❌ Missing | ❌ Missing |
| AI Recommendations | AI Generated | ⚠️ Static | ✅ Dynamic |

### Indicators from Municipality Profile (to add to MII Drill Down)

| Indicator | Source | Currently In MII DD |
|-----------|--------|---------------------|
| MII Trend Arrow | `mii_results` latest vs previous | ❌ Add |
| Peer Benchmarking Tool | Component exists | ❌ Add |
| MII Improvement AI | Component exists | ❌ Add |

---

## Dimension Score Structure

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

---

## Implementation Plan

### Phase 1: Seed Reference Data

**File:** Database Migration

**Action:** Populate `mii_dimensions` with 6 standard dimensions

```sql
INSERT INTO mii_dimensions (id, code, name_en, name_ar, weight, sort_order, is_active) VALUES
  (gen_random_uuid(), 'LEADERSHIP', 'Leadership & Governance', 'القيادة والحوكمة', 0.20, 1, true),
  (gen_random_uuid(), 'STRATEGY', 'Innovation Strategy', 'استراتيجية الابتكار', 0.15, 2, true),
  (gen_random_uuid(), 'CULTURE', 'Innovation Culture', 'ثقافة الابتكار', 0.15, 3, true),
  (gen_random_uuid(), 'PARTNERSHIPS', 'Partnerships & Ecosystem', 'الشراكات والنظام البيئي', 0.15, 4, true),
  (gen_random_uuid(), 'CAPABILITIES', 'Capabilities & Resources', 'القدرات والموارد', 0.15, 5, true),
  (gen_random_uuid(), 'IMPACT', 'Impact & Outcomes', 'الأثر والنتائج', 0.20, 6, true);
```

### Phase 2: Seed Sample MII Results

**File:** Database Migration

**Action:** Add sample historical data for testing

```sql
-- For each municipality with an mii_score, create historical records
INSERT INTO mii_results (municipality_id, assessment_year, overall_score, dimension_scores, rank, previous_rank, is_published)
SELECT 
  m.id,
  2025,
  m.mii_score,
  jsonb_build_object(
    'LEADERSHIP', jsonb_build_object('score', m.mii_score + (random() * 10 - 5)),
    'STRATEGY', jsonb_build_object('score', m.mii_score + (random() * 10 - 5)),
    'CULTURE', jsonb_build_object('score', m.mii_score + (random() * 10 - 5)),
    'PARTNERSHIPS', jsonb_build_object('score', m.mii_score + (random() * 10 - 5)),
    'CAPABILITIES', jsonb_build_object('score', m.mii_score + (random() * 10 - 5)),
    'IMPACT', jsonb_build_object('score', m.mii_score + (random() * 10 - 5))
  ),
  m.mii_rank,
  m.mii_rank + floor(random() * 5 - 2)::int,
  true
FROM municipalities m
WHERE m.mii_score IS NOT NULL;
```

### Phase 3: Create Data Fetching Hook

**File:** `src/hooks/useMIIData.js`

**Purpose:** Centralized hook for all MII data fetching

```javascript
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
      return data;
    }
  });

  // Fetch latest result
  const { data: latestResult } = useQuery({
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

  // Fetch historical trend
  const { data: history } = useQuery({
    queryKey: ['mii-history', municipalityId],
    queryFn: async () => {
      const { data } = await supabase
        .from('mii_results')
        .select('assessment_year, overall_score, rank')
        .eq('municipality_id', municipalityId)
        .eq('is_published', true)
        .order('assessment_year', { ascending: true });
      return data;
    },
    enabled: !!municipalityId
  });

  // Fetch national average
  const { data: nationalAvg } = useQuery({
    queryKey: ['mii-national-avg'],
    queryFn: async () => {
      const { data } = await supabase
        .from('mii_results')
        .select('overall_score')
        .eq('is_published', true)
        .order('assessment_year', { ascending: false })
        .limit(1);
      // Calculate average from latest year results
      // ...
    }
  });

  return {
    dimensions,
    latestResult,
    history,
    nationalAvg,
    // Computed values
    radarData: computed from dimensions + latestResult,
    trendData: computed from history,
    yoyGrowth: computed from history,
    rankChange: latestResult?.rank - latestResult?.previous_rank
  };
}
```

### Phase 4: Update MII Drill Down Page

**File:** `src/pages/MIIDrillDown.jsx`

**Changes:**

1. **Replace mock radarData** (lines 114-121) with real data from `useMIIData`
2. **Replace mock trendData** (lines 124-129) with real historical data
3. **Add rank change indicator** (show ↑/↓ with previous rank)
4. **Add national average comparison** per dimension
5. **Integrate MII Improvement AI** component
6. **Integrate Peer Benchmarking Tool** component

### Phase 5: Sync Mechanism

**Option A: Database Trigger**

```sql
CREATE OR REPLACE FUNCTION sync_municipality_mii()
RETURNS TRIGGER AS $$
BEGIN
  -- Update municipality score from latest result
  UPDATE municipalities
  SET 
    mii_score = NEW.overall_score,
    mii_rank = NEW.rank
  WHERE id = NEW.municipality_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_mii_result_insert
AFTER INSERT OR UPDATE ON mii_results
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION sync_municipality_mii();
```

**Option B: Scheduled Edge Function**
- Runs nightly
- Calculates ranks across all municipalities
- Updates `municipalities.mii_rank` based on scores

### Phase 6: Fallback Mechanism

When no `mii_results` exist for a municipality:

```jsx
{!latestResult ? (
  <Card className="border-dashed border-2 border-amber-300 bg-amber-50">
    <CardContent className="pt-6 text-center">
      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h3 className="font-semibold text-amber-900">
        {t({ en: 'MII Assessment Pending', ar: 'تقييم المؤشر معلق' })}
      </h3>
      <p className="text-sm text-amber-700 mt-2">
        {t({ en: 'This municipality has not been assessed yet.', ar: 'لم يتم تقييم هذه البلدية بعد.' })}
      </p>
    </CardContent>
  </Card>
) : (
  // Show real data
)}
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/hooks/useMIIData.js` | **CREATE** - Centralized MII data hook |
| `src/pages/MIIDrillDown.jsx` | **UPDATE** - Use real data, add components |
| `src/pages/MunicipalityProfile.jsx` | **UPDATE** - Align dimension names |
| Database Migration | **RUN** - Seed dimensions + sample results |

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
| Peer Benchmarking | Missing | Integrated |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES                             │
├──────────────────┬──────────────────┬──────────────────────────┤
│  municipalities  │   mii_results    │     mii_dimensions       │
│  - mii_score     │  - dimension_    │  - code, name_en/ar      │
│  - mii_rank      │    scores (JSON) │  - weight                │
│  - active_*      │  - overall_score │  - indicators (JSON)     │
│                  │  - assessment_   │                          │
│                  │    year          │                          │
└────────┬─────────┴────────┬─────────┴────────────┬─────────────┘
         │                  │                      │
         ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      useMIIData Hook                            │
│  - Fetches all sources                                          │
│  - Computes derived values (radarData, trendData, yoyGrowth)    │
│  - Handles fallbacks                                            │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI COMPONENTS                                 │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Radar Chart    │  Line Chart     │  KPI Cards                  │
│  (Dimensions)   │  (Trend)        │  (Score, Rank, Growth)      │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-12 | Initial design document created |
