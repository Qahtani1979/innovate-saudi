# MII (Municipal Innovation Index) - Indicators Reference

> **Document Version**: 2.0  
> **Last Updated**: 2024-12-12  
> **Maintainer**: System Auto-generated  
> **Status**: ✅ All Indicators Connected to Real Data

---

## Overview

The Municipal Innovation Index (MII) is an automated scoring system that measures innovation maturity across Saudi Arabian municipalities. This document provides a complete reference for all indicators, their data sources, calculations, thresholds, and refresh mechanisms.

---

## 1. INDEX STRUCTURE

### 1.1 Dimensions & Weights

| Dimension | Code | Weight | Description |
|-----------|------|--------|-------------|
| Leadership | LEADERSHIP | 20% | Governance engagement and profile completeness |
| Strategy | STRATEGY | 15% | Innovation planning and strategic alignment |
| Culture | CULTURE | 15% | Experimentation and learning mindset |
| Partnerships | PARTNERSHIPS | 15% | Collaboration ecosystem |
| Capabilities | CAPABILITIES | 15% | Execution capacity and infrastructure |
| Impact | IMPACT | 20% | Outcomes and knowledge sharing |

### 1.2 Overall Score Formula

```
Overall_Score = Σ (Dimension_Score × Dimension_Weight)

Where:
- LEADERSHIP × 0.20
- STRATEGY × 0.15  
- CULTURE × 0.15
- PARTNERSHIPS × 0.15
- CAPABILITIES × 0.15
- IMPACT × 0.20
```

---

## 2. DIMENSION DETAILS

### 2.1 LEADERSHIP (20% Weight)

**Purpose**: Measures municipal leadership engagement in innovation activities.

#### Indicators

| Indicator | Code | Weight | Data Source | Calculation |
|-----------|------|--------|-------------|-------------|
| Profile Completeness | `profile_completeness` | 30% | `municipalities` | Count of filled fields / 4 × 100 |
| Active Engagement | `active_engagement` | 40% | `challenges`, `pilots` | (challenges × 10) + (pilots × 15), max 100 |
| Strategic Alignment | `strategic_alignment` | 30% | `municipalities.strategic_plan_id` | If linked: 80, else: 30 |

#### Profile Completeness Fields

| Field | Table | Column | Points |
|-------|-------|--------|--------|
| Contact Person | municipalities | contact_person | 25% |
| Contact Email | municipalities | contact_email | 25% |
| Website | municipalities | website | 25% |
| Strategic Plan | municipalities | strategic_plan_id | 25% |

#### Dimension Formula
```
LEADERSHIP_Score = (profile_completeness × 0.30) + 
                   (active_engagement × 0.40) + 
                   (strategic_alignment × 0.30)
```

#### Thresholds

| Rating | Score Range | Interpretation |
|--------|-------------|----------------|
| Excellent | 80-100 | Strong leadership engagement |
| Good | 60-79 | Active leadership with room for improvement |
| Developing | 40-59 | Emerging leadership commitment |
| Needs Attention | 0-39 | Leadership engagement required |

---

### 2.2 STRATEGY (15% Weight)

**Purpose**: Measures innovation planning and strategic goal alignment.

#### Indicators

| Indicator | Code | Weight | Data Source | Calculation |
|-----------|------|--------|-------------|-------------|
| Strategic Planning | `strategic_planning` | 40% | `municipalities.strategic_plan_id` | If linked: 85, else: 40 |
| Challenge-to-Pilot Conversion | `challenge_to_pilot_conversion` | 35% | `challenges`, `pilots` | (pilots / challenges) × 100 × 2, max 100 |
| Strategic Alignment | `strategic_alignment` | 25% | `challenges.strategic_goal` | (challenges_with_goal / total) × 100 |

#### Dimension Formula
```
STRATEGY_Score = (strategic_planning × 0.40) + 
                 (challenge_to_pilot_conversion × 0.35) + 
                 (strategic_alignment × 0.25)
```

#### Conversion Rate Benchmarks

| Conversion Rate | Score | Interpretation |
|-----------------|-------|----------------|
| ≥50% | 100 | Excellent pipeline efficiency |
| 30-49% | 60-99 | Good conversion |
| 15-29% | 30-59 | Developing pipeline |
| <15% | 0-29 | Pipeline needs improvement |

---

### 2.3 CULTURE (15% Weight)

**Purpose**: Measures innovation mindset, experimentation, and learning.

#### Indicators

| Indicator | Code | Weight | Data Source | Calculation |
|-----------|------|--------|-------------|-------------|
| Experimentation Rate | `experimentation_rate` | 40% | `pilots`, `municipalities.population` | (pilots / population) × 100,000 × 20, max 100 |
| Risk Tolerance | `risk_tolerance` | 30% | `pilots.stage` | unique_stages × 20, max 100 |
| Learning Mindset | `learning_mindset` | 30% | `pilots.lessons_learned` | (pilots_with_lessons / total) × 100 |

#### Pilot Stages (for Risk Tolerance)

| Stage | Description |
|-------|-------------|
| planning | Initial planning phase |
| setup | Configuration and setup |
| active | Currently running |
| monitoring | Under observation |
| evaluation | Being evaluated |
| completed | Successfully finished |
| cancelled | Terminated early |

#### Dimension Formula
```
CULTURE_Score = (experimentation_rate × 0.40) + 
                (risk_tolerance × 0.30) + 
                (learning_mindset × 0.30)
```

#### Experimentation Benchmarks (per 100k population)

| Pilots per 100k | Score | Interpretation |
|-----------------|-------|----------------|
| ≥5 | 100 | Highly experimental |
| 3-4 | 60-79 | Good experimentation |
| 1-2 | 20-39 | Developing culture |
| <1 | 0-19 | Limited experimentation |

---

### 2.4 PARTNERSHIPS (15% Weight)

**Purpose**: Measures collaboration ecosystem and partnership diversity.

#### Indicators

| Indicator | Code | Weight | Data Source | Calculation |
|-----------|------|--------|-------------|-------------|
| Partnership Count | `partnership_count` | 40% | `partnerships` (status='active') | count × 15, max 100 |
| Partnership Diversity | `partnership_diversity` | 30% | `partnerships.partnership_type` | unique_types × 25, max 100 |
| Collaboration Score | `collaboration_score` | 30% | `partnerships` | If count > 0: 70, else: 30 |

#### Partnership Types

| Type | Description |
|------|-------------|
| private_sector | Corporate partnerships |
| academic | University/research partnerships |
| ngo | Non-profit collaborations |
| government | Inter-governmental partnerships |
| international | Cross-border partnerships |

#### Dimension Formula
```
PARTNERSHIPS_Score = (partnership_count × 0.40) + 
                     (partnership_diversity × 0.30) + 
                     (collaboration_score × 0.30)
```

#### Partnership Benchmarks

| Active Partnerships | Score | Interpretation |
|---------------------|-------|----------------|
| ≥7 | 100+ (capped) | Excellent ecosystem |
| 4-6 | 60-90 | Strong partnerships |
| 2-3 | 30-45 | Developing network |
| 0-1 | 0-15 | Limited collaboration |

---

### 2.5 CAPABILITIES (15% Weight)

**Purpose**: Measures execution capacity and digital infrastructure.

#### Indicators

| Indicator | Code | Weight | Data Source | Calculation |
|-----------|------|--------|-------------|-------------|
| Digital Infrastructure | `digital_infrastructure` | 30% | `municipalities.website` | If exists: 75, else: 40 |
| Execution Capacity | `execution_capacity` | 40% | `pilots` (active/monitoring) | active_pilots × 25, max 100 |
| Challenge Management | `challenge_management` | 30% | `challenges` | count × 12, max 100 |

#### Active Pilot Stages

| Stage | Counted as Active |
|-------|-------------------|
| active | Yes |
| monitoring | Yes |
| planning | No |
| completed | No |

#### Dimension Formula
```
CAPABILITIES_Score = (digital_infrastructure × 0.30) + 
                     (execution_capacity × 0.40) + 
                     (challenge_management × 0.30)
```

#### Execution Capacity Benchmarks

| Active Pilots | Score | Interpretation |
|---------------|-------|----------------|
| ≥4 | 100 | High execution capacity |
| 2-3 | 50-75 | Good capacity |
| 1 | 25 | Limited capacity |
| 0 | 0 | No active execution |

---

### 2.6 IMPACT (20% Weight)

**Purpose**: Measures outcomes, success rates, and knowledge sharing.

#### Indicators

| Indicator | Code | Weight | Data Source | Calculation |
|-----------|------|--------|-------------|-------------|
| Completed Pilots | `completed_pilots` | 40% | `pilots` (stage='completed') | count × 20, max 100 |
| Success Rate | `success_rate` | 35% | `pilots.success_probability` | avg(success_probability), default 50 |
| Knowledge Sharing | `knowledge_sharing` | 25% | `case_studies` (is_published=true) | count × 25, max 100 |

#### Dimension Formula
```
IMPACT_Score = (completed_pilots × 0.40) + 
               (success_rate × 0.35) + 
               (knowledge_sharing × 0.25)
```

#### Impact Benchmarks

| Completed Pilots | Score | Interpretation |
|------------------|-------|----------------|
| ≥5 | 100 | High impact municipality |
| 3-4 | 60-80 | Good outcomes |
| 1-2 | 20-40 | Developing impact |
| 0 | 0 | No completed pilots |

---

## 3. DERIVED METRICS

### 3.1 Year-over-Year (YoY) Growth

| Metric | Calculation | Data Source |
|--------|-------------|-------------|
| YoY Growth | current_year_score - previous_year_score | `mii_results` |

### 3.2 Trend Direction

| Trend | Condition | Description |
|-------|-----------|-------------|
| up (↑) | score > previous + 2 | Improving |
| down (↓) | score < previous - 2 | Declining |
| stable (→) | within ±2 points | Stable |

### 3.3 Rank

| Metric | Calculation | Update Trigger |
|--------|-------------|----------------|
| Rank | Position when all municipalities sorted by overall_score DESC | After any MII calculation |

### 3.4 Rank Change

| Metric | Calculation | Interpretation |
|--------|-------------|----------------|
| Rank Change | previous_rank - current_rank | Positive = improved, Negative = declined |

---

## 4. STRENGTHS & IMPROVEMENT AREAS

### 4.1 Strength Identification

Top 2 dimensions by score are identified as strengths with labels:

| Dimension | Strength Label |
|-----------|----------------|
| LEADERSHIP | "Strong leadership and governance" |
| STRATEGY | "Clear innovation strategy" |
| CULTURE | "Vibrant innovation culture" |
| PARTNERSHIPS | "Active partnership ecosystem" |
| CAPABILITIES | "Strong execution capabilities" |
| IMPACT | "High impact outcomes" |

### 4.2 Improvement Area Identification

Bottom 2 dimensions by score are identified for improvement:

| Dimension | Improvement Label |
|-----------|-------------------|
| LEADERSHIP | "Strengthen leadership engagement" |
| STRATEGY | "Develop clearer innovation strategy" |
| CULTURE | "Foster innovation culture" |
| PARTNERSHIPS | "Build more partnerships" |
| CAPABILITIES | "Improve execution capabilities" |
| IMPACT | "Focus on pilot completion and impact" |

---

## 5. DATA SOURCES SUMMARY

### 5.1 Primary Tables

| Table | Purpose | Key Columns Used |
|-------|---------|------------------|
| `municipalities` | Base entity data | id, population, website, contact_*, strategic_plan_id |
| `challenges` | Challenge metrics | id, municipality_id, status, strategic_goal, is_deleted |
| `pilots` | Pilot metrics | id, municipality_id, stage, success_probability, lessons_learned, is_deleted |
| `partnerships` | Partnership data | id, status, partnership_type, parties |
| `case_studies` | Knowledge sharing | id, municipality_id, is_published |
| `mii_results` | Historical scores | municipality_id, assessment_year, overall_score, dimension_scores |
| `mii_dimensions` | Dimension definitions | code, name_en, weight, is_active |

### 5.2 Data Filters Applied

| Table | Filters |
|-------|---------|
| challenges | is_deleted = false |
| pilots | is_deleted = false |
| partnerships | status = 'active' |
| case_studies | is_published = true |
| mii_results | is_published = true |

---

## 6. CALCULATION AUTOMATION

### 6.1 Trigger Mechanisms

| Trigger Type | Method | When | Status |
|--------------|--------|------|--------|
| On-Demand | API call to `calculate-mii` edge function | Admin clicks "Recalculate MII" | ✅ Active |
| Scheduled | pg_cron job at 2 AM daily | Automatic daily refresh | ✅ Active |
| Data Change | Database triggers on challenges/pilots/partnerships | On entity changes | ✅ Active |

### 6.2 Scheduled Cron Job

```sql
-- Daily MII recalculation at 2 AM
cron.schedule('daily-mii-recalculation', '0 2 * * *', ...)
```

### 6.3 Data-Change Triggers

| Trigger Name | Table | Fires On |
|--------------|-------|----------|
| `trigger_mii_on_challenge_change` | challenges | INSERT, UPDATE, DELETE |
| `trigger_mii_on_pilot_change` | pilots | INSERT, UPDATE, DELETE |
| `trigger_mii_on_partnership_change` | partnerships | INSERT, UPDATE, DELETE |

### 6.4 Calculation Flow

```
1. Fetch municipality data
   ↓
2. Fetch related entities (challenges, pilots, partnerships, case_studies)
   ↓
3. Calculate each dimension's indicators
   ↓
4. Calculate dimension scores (weighted indicators)
   ↓
5. Calculate overall score (weighted dimensions)
   ↓
6. Determine strengths & improvement areas
   ↓
7. Calculate trend vs previous year
   ↓
8. Save to mii_results table
   ↓
9. Trigger: sync_municipality_mii
   ↓
10. Update municipalities.mii_score and mii_rank
```

### 6.5 Database Trigger: sync_municipality_mii

```sql
-- Automatically fires when mii_results is inserted/updated
-- Updates municipalities table with latest score and rank
TRIGGER: sync_municipality_mii_trigger
ON: mii_results
WHEN: AFTER INSERT OR UPDATE (is_published = true)
ACTION: UPDATE municipalities SET 
        mii_score = NEW.overall_score,
        mii_rank = NEW.rank
        WHERE id = NEW.municipality_id
```

### 6.6 Refresh Frequency

| Scenario | Frequency | Method |
|----------|-----------|--------|
| Production | Daily at 2 AM | pg_cron scheduled job |
| On-demand | Anytime | Admin button or API call |
| Data-triggered | On entity change | Database triggers update timestamp |

---

## 7. SCORE INTERPRETATION

### 7.1 Overall Score Bands

| Band | Score Range | Label | Description |
|------|-------------|-------|-------------|
| Excellent | 80-100 | Leader | Top-tier innovation maturity |
| Good | 60-79 | Advanced | Strong innovation practices |
| Developing | 40-59 | Emerging | Building innovation capacity |
| Beginning | 20-39 | Nascent | Early innovation journey |
| Minimal | 0-19 | Starting | Innovation initiation needed |

### 7.2 National Benchmarks

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| National Average | avg(overall_score) across all municipalities | Comparison baseline |
| Dimension Averages | avg(dimension_score) per dimension | Dimension benchmarking |
| Percentile Rank | Position relative to all municipalities | Relative performance |

---

## 8. OUTPUT SCHEMA

### 8.1 mii_results Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| municipality_id | uuid | FK to municipalities |
| assessment_year | integer | Year of assessment |
| assessment_date | date | Calculation date |
| overall_score | numeric | Final MII score (0-100) |
| dimension_scores | jsonb | All dimension details |
| rank | integer | National ranking |
| previous_rank | integer | Previous year rank |
| strengths | text[] | Top 2 dimension labels |
| improvement_areas | text[] | Bottom 2 dimension labels |
| trend | text | 'up', 'down', 'stable' |
| is_published | boolean | Publication status |

### 8.2 dimension_scores JSON Structure

```json
{
  "LEADERSHIP": {
    "score": 72,
    "indicators": {
      "profile_completeness": 75,
      "active_engagement": 80,
      "strategic_alignment": 60
    }
  },
  "STRATEGY": { ... },
  "CULTURE": { ... },
  "PARTNERSHIPS": { ... },
  "CAPABILITIES": { ... },
  "IMPACT": { ... }
}
```

---

## 9. PAGES & COMPONENTS DISPLAYING MII INDICATORS

### 9.1 Pages Using MII Data

| Page | File | Indicators Displayed | Data Source | Status |
|------|------|---------------------|-------------|--------|
| MII Drill Down | `src/pages/MIIDrillDown.jsx` | All dimensions, trends, YoY, rank | `useMIIData` hook | ✅ Connected |
| Municipality Profile | `src/pages/MunicipalityProfile.jsx` | Score, rank, radar, history | `useMIIData` hook | ✅ Connected |
| MII Rankings | `src/pages/MII.jsx` | Score, rank, comparison | `municipalities` table | ✅ Connected |
| City Dashboard | `src/pages/CityDashboard.jsx` | mii_score display | `municipalities` table | ✅ Connected |

### 9.2 Components Using MII Data

| Component | File | Indicators Displayed | Data Source | Status |
|-----------|------|---------------------|-------------|--------|
| MIIImprovementAI | `src/components/municipalities/MIIImprovementAI.jsx` | mii_score, mii_rank | `municipality` prop | ✅ Connected |
| PeerBenchmarkingTool | `src/components/municipalities/PeerBenchmarkingTool.jsx` | mii_score comparison | `municipalities` table | ✅ Connected |
| AutomatedMIICalculator | `src/components/strategy/AutomatedMIICalculator.jsx` | All dimensions, trends | `useMIIData` hook + Edge Function | ✅ Connected |
| DimensionTrendChart | `src/components/charts/DimensionTrendChart.jsx` | Historical dimension trends | `useMIIData` hook | ✅ Connected |
| CrossCitySolutionSharing | `src/components/challenges/CrossCitySolutionSharing.jsx` | mii_score for matching | `municipalities` table | ✅ Connected |
| DataQualityTracker | `src/components/geography/DataQualityTracker.jsx` | mii_score completeness | `municipalities` table | ✅ Connected |
| ExecutiveBriefingGenerator | `src/components/executive/ExecutiveBriefingGenerator.jsx` | Average MII calculation | `municipalities` table | ✅ Connected |

### 9.3 Centralized Data Hook

All MII-related pages and components should use the `useMIIData` hook for consistent data:

```javascript
import { useMIIData } from '@/hooks/useMIIData';

const { 
  radarData,        // Dimension scores for radar chart
  trendData,        // Historical scores for line chart
  yoyGrowth,        // Year-over-year change
  rankChange,       // Rank improvement/decline
  trend,            // 'up' | 'down' | 'stable'
  strengths,        // Top 2 dimensions
  improvementAreas, // Bottom 2 dimensions
  nationalStats,    // National averages
  latestResult,     // Full latest mii_results record
  hasData,          // Boolean for conditional rendering
  isLoading         // Loading state
} = useMIIData(municipalityId);
```

---

## 10. ADMIN HUB

### 10.1 MII Admin Hub Page

A dedicated admin page (`/mii-admin-hub`) provides centralized management:

| Tab | Features |
|-----|----------|
| **Overview** | Quick stats, pending recalculations, quick actions |
| **Dimensions** | Enable/disable dimensions, view weights |
| **Calculator** | Embedded AutomatedMIICalculator component |
| **Schedule** | View cron job status, data trigger status |
| **Monitoring** | Data inputs, output targets, refresh rates |

### 10.2 Admin Capabilities

| Capability | Method | Access |
|------------|--------|--------|
| Recalculate All | Button → Edge Function | Admin only |
| Toggle Dimensions | Switch UI → DB update | Admin only |
| View Pending | Query municipalities | Admin only |
| Monitor Status | Dashboard widgets | Admin only |

---

## 11. FUTURE ENHANCEMENTS

| Feature | Description | Priority |
|---------|-------------|----------|
| Citizen Feedback Integration | Include citizen_feedback.rating in IMPACT | High |
| Solution Metrics | Track solution adoption rates | Medium |
| Budget Utilization | Factor in budget efficiency | Medium |
| Staff Capacity | Include team size metrics | Low |
| AI-Powered Recommendations | ML-based improvement suggestions | High |

---

## 12. RELATED DOCUMENTS

| Document | Path | Description |
|----------|------|-------------|
| MII Drill Down Design | `docs/MII_DRILLDOWN_DESIGN.md` | UI/UX specifications |
| Validation Plan | `docs/validation/VALIDATION_PLAN_PHASE20_ANALYTICS.md` | Testing requirements |

---

## APPENDIX A: Complete Indicator Summary

| Dimension | Indicator | Weight in Dim | Max Score | Data Source |
|-----------|-----------|---------------|-----------|-------------|
| LEADERSHIP | profile_completeness | 30% | 100 | municipalities |
| LEADERSHIP | active_engagement | 40% | 100 | challenges, pilots |
| LEADERSHIP | strategic_alignment | 30% | 80 | municipalities |
| STRATEGY | strategic_planning | 40% | 85 | municipalities |
| STRATEGY | challenge_to_pilot_conversion | 35% | 100 | challenges, pilots |
| STRATEGY | strategic_alignment | 25% | 100 | challenges |
| CULTURE | experimentation_rate | 40% | 100 | pilots, municipalities |
| CULTURE | risk_tolerance | 30% | 100 | pilots |
| CULTURE | learning_mindset | 30% | 100 | pilots |
| PARTNERSHIPS | partnership_count | 40% | 100 | partnerships |
| PARTNERSHIPS | partnership_diversity | 30% | 100 | partnerships |
| PARTNERSHIPS | collaboration_score | 30% | 70 | partnerships |
| CAPABILITIES | digital_infrastructure | 30% | 75 | municipalities |
| CAPABILITIES | execution_capacity | 40% | 100 | pilots |
| CAPABILITIES | challenge_management | 30% | 100 | challenges |
| IMPACT | completed_pilots | 40% | 100 | pilots |
| IMPACT | success_rate | 35% | 100 | pilots |
| IMPACT | knowledge_sharing | 25% | 100 | case_studies |

---

## APPENDIX B: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    MII CALCULATION SUMMARY                   │
├─────────────────────────────────────────────────────────────┤
│  LEADERSHIP (20%)                                           │
│    = Profile(30%) + Engagement(40%) + Strategy(30%)         │
├─────────────────────────────────────────────────────────────┤
│  STRATEGY (15%)                                             │
│    = Planning(40%) + Conversion(35%) + Alignment(25%)       │
├─────────────────────────────────────────────────────────────┤
│  CULTURE (15%)                                              │
│    = Experimentation(40%) + Risk(30%) + Learning(30%)       │
├─────────────────────────────────────────────────────────────┤
│  PARTNERSHIPS (15%)                                         │
│    = Count(40%) + Diversity(30%) + Collaboration(30%)       │
├─────────────────────────────────────────────────────────────┤
│  CAPABILITIES (15%)                                         │
│    = Digital(30%) + Execution(40%) + Management(30%)        │
├─────────────────────────────────────────────────────────────┤
│  IMPACT (20%)                                               │
│    = Completed(40%) + Success(35%) + Knowledge(25%)         │
├─────────────────────────────────────────────────────────────┤
│  OVERALL = Σ (Dimension × Weight)                           │
│  Range: 0-100 | Refresh: On-demand | Trend: ±2 threshold    │
└─────────────────────────────────────────────────────────────┘
```

---

*Document auto-generated based on `calculate-mii` Edge Function implementation.*
