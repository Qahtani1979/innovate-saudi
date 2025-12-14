# Demand-Driven Cascade Generation System

## Executive Summary

This document outlines the architecture for a **Strategy-Driven Demand Generation System** that automatically calculates, prioritizes, and orchestrates the generation of cascade entities (Programs, Challenges, Solutions, Pilots, etc.) based on strategic plan objectives, KPIs, and gap analysis.

---

## 1. System Overview

### 1.1 Core Concept

The system transforms strategic plans from passive documents into **active demand drivers** that:
- Analyze coverage gaps across the innovation cascade
- Calculate required entity quantities per objective
- Prioritize generation based on strategic importance
- Ensure quality through objective-aligned prompts
- Track progress toward strategic targets

### 1.2 Key Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGIC PLAN                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Objectives  │  │    KPIs     │  │  Timelines  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GAP ANALYSIS ENGINE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Coverage   │  │  Capacity   │  │  Timeline   │              │
│  │  Analysis   │  │  Analysis   │  │  Analysis   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DEMAND CALCULATOR                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Demand Queue: Prioritized list of required entities    │    │
│  │  - Entity Type, Quantity, Priority, Objective Link      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATION ORCHESTRATOR                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  AI Prompt  │  │  Quality    │  │  Progress   │              │
│  │  Builder    │  │  Validator  │  │  Tracker    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model

### 2.1 Strategic Plan Structure

```typescript
interface StrategicPlan {
  id: string;
  title_en: string;
  title_ar: string;
  vision: string;
  mission: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  
  // Cascade Configuration
  cascade_config: CascadeConfig;
  
  // Objectives with targets
  objectives: StrategicObjective[];
}

interface CascadeConfig {
  // Target ratios per objective
  challenges_per_objective: number;      // e.g., 5
  solutions_per_challenge: number;       // e.g., 3
  pilots_per_solution: number;           // e.g., 2
  
  // Sector distribution
  sector_weights: Record<string, number>; // e.g., { "technology": 0.3, "health": 0.25 }
  
  // Priority thresholds
  critical_coverage_threshold: number;   // e.g., 0.3 (30%)
  warning_coverage_threshold: number;    // e.g., 0.6 (60%)
  
  // Generation limits
  max_batch_size: number;                // e.g., 10
  generation_cooldown_hours: number;     // e.g., 24
}

interface StrategicObjective {
  id: string;
  title_en: string;
  title_ar: string;
  description: string;
  weight: number;                        // 0-1, importance factor
  
  // Targets
  target_challenges: number;
  target_solutions: number;
  target_pilots: number;
  target_completion_date: string;
  
  // KPIs
  kpis: ObjectiveKPI[];
  
  // Sector focus
  sector_ids: string[];
}

interface ObjectiveKPI {
  id: string;
  name: string;
  target_value: number;
  current_value: number;
  unit: string;
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}
```

### 2.2 Demand Item Structure

```typescript
interface DemandItem {
  id: string;
  strategic_plan_id: string;
  objective_id: string;
  
  // What to generate
  entity_type: 'program' | 'challenge' | 'solution' | 'sandbox' | 'living_lab' | 'pilot';
  required_quantity: number;
  generated_quantity: number;
  
  // Priority calculation
  priority_score: number;               // 0-100
  priority_factors: PriorityFactors;
  
  // Context for generation
  generation_context: GenerationContext;
  
  // Status tracking
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  created_at: string;
  updated_at: string;
  last_generation_at: string | null;
}

interface PriorityFactors {
  objective_weight: number;             // From strategic objective
  coverage_gap: number;                 // How far from target (0-1)
  timeline_urgency: number;             // Days until deadline factor
  dependency_readiness: number;         // Are prerequisites met?
  sector_priority: number;              // Sector strategic importance
}

interface GenerationContext {
  // Inherited from strategy
  strategic_themes: string[];
  target_sectors: string[];
  target_kpis: string[];
  
  // Specific guidance
  focus_areas: string[];
  constraints: string[];
  success_criteria: string[];
  
  // Related entities for context
  related_challenges: string[];
  related_solutions: string[];
  existing_pilots: string[];
}
```

---

## 3. Gap Analysis Engine

### 3.1 Coverage Analysis

```typescript
interface CoverageAnalysis {
  plan_id: string;
  analyzed_at: string;
  
  // Overall metrics
  overall_coverage: number;             // 0-100%
  
  // By entity type
  entity_coverage: {
    programs: EntityCoverage;
    challenges: EntityCoverage;
    solutions: EntityCoverage;
    sandboxes: EntityCoverage;
    living_labs: EntityCoverage;
    pilots: EntityCoverage;
  };
  
  // By objective
  objective_coverage: ObjectiveCoverage[];
  
  // By sector
  sector_coverage: SectorCoverage[];
  
  // Gaps identified
  gaps: CoverageGap[];
}

interface EntityCoverage {
  target: number;
  current: number;
  coverage_percentage: number;
  status: 'critical' | 'warning' | 'on_track' | 'exceeded';
}

interface CoverageGap {
  id: string;
  gap_type: 'quantity' | 'quality' | 'sector' | 'timeline';
  entity_type: string;
  objective_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  // Gap details
  expected: number;
  actual: number;
  deficit: number;
  
  // Recommendation
  recommended_action: string;
  estimated_effort: 'low' | 'medium' | 'high';
}
```

### 3.2 Gap Detection Rules

| Gap Type | Detection Logic | Severity Calculation |
|----------|-----------------|---------------------|
| **Quantity Gap** | `current < target * threshold` | `(target - current) / target * 100` |
| **Sector Gap** | Missing sectors from objective focus | Count of missing sectors |
| **Timeline Gap** | `days_remaining < estimated_days_needed` | `estimated / remaining` ratio |
| **Cascade Gap** | Missing downstream entities | Chain break severity |
| **Quality Gap** | Low alignment scores | Average alignment < 60% |

---

## 4. Demand Calculation Algorithm

### 4.1 Priority Score Formula

```
Priority Score = (
  (Objective_Weight × 0.25) +
  (Coverage_Gap × 0.30) +
  (Timeline_Urgency × 0.25) +
  (Dependency_Readiness × 0.10) +
  (Sector_Priority × 0.10)
) × 100
```

### 4.2 Calculation Process

```typescript
function calculateDemand(plan: StrategicPlan): DemandItem[] {
  const demandQueue: DemandItem[] = [];
  
  for (const objective of plan.objectives) {
    // 1. Calculate current coverage
    const coverage = calculateObjectiveCoverage(objective);
    
    // 2. Determine gaps
    const gaps = identifyGaps(objective, coverage);
    
    // 3. Create demand items for each gap
    for (const gap of gaps) {
      const demandItem: DemandItem = {
        entity_type: gap.entity_type,
        required_quantity: gap.deficit,
        priority_score: calculatePriorityScore({
          objective_weight: objective.weight,
          coverage_gap: gap.deficit / gap.expected,
          timeline_urgency: calculateTimelineUrgency(objective),
          dependency_readiness: checkDependencies(gap),
          sector_priority: getSectorPriority(objective.sector_ids)
        }),
        generation_context: buildContext(objective, gap)
      };
      
      demandQueue.push(demandItem);
    }
  }
  
  // Sort by priority
  return demandQueue.sort((a, b) => b.priority_score - a.priority_score);
}
```

---

## 5. Generation Orchestrator

### 5.1 Prompt Enhancement

The system enhances AI prompts with strategic context:

```typescript
interface EnhancedPrompt {
  // Base instruction
  base_prompt: string;
  
  // Strategic context injection
  strategic_context: {
    plan_vision: string;
    plan_mission: string;
    objective_title: string;
    objective_description: string;
    target_kpis: string[];
    success_criteria: string[];
  };
  
  // Quality requirements
  quality_requirements: {
    alignment_keywords: string[];
    required_sections: string[];
    minimum_detail_level: 'basic' | 'detailed' | 'comprehensive';
    language_requirements: string[];
  };
  
  // Context from existing entities
  existing_context: {
    related_challenges: string[];
    related_solutions: string[];
    sector_focus: string[];
    avoid_duplication: string[];
  };
}
```

### 5.2 Generation Flow

```
┌──────────────────┐
│  Demand Queue    │
│  (Prioritized)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  Check Capacity  │────▶│  Wait/Schedule   │
│  (Rate limits,   │ No  │  (Cooldown,      │
│   budget, etc.)  │     │   queue later)   │
└────────┬─────────┘     └──────────────────┘
         │ Yes
         ▼
┌──────────────────┐
│  Build Enhanced  │
│  Prompt          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generate via    │
│  AI Gateway      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  Quality Check   │────▶│  Reject/Retry    │
│  (Alignment,     │ Fail│  (Log reason,    │
│   completeness)  │     │   adjust prompt) │
└────────┬─────────┘     └──────────────────┘
         │ Pass
         ▼
┌──────────────────┐
│  Save Entity     │
│  Link to Plan    │
│  Update Queue    │
└──────────────────┘
```

---

## 6. Quality Assurance

### 6.1 Alignment Scoring

Each generated entity is scored against strategic objectives:

```typescript
interface AlignmentScore {
  entity_id: string;
  entity_type: string;
  
  // Scoring dimensions
  scores: {
    objective_alignment: number;        // 0-100
    kpi_relevance: number;              // 0-100
    sector_match: number;               // 0-100
    terminology_alignment: number;      // 0-100
    feasibility: number;                // 0-100
  };
  
  // Overall
  overall_score: number;
  
  // Threshold
  minimum_acceptable: number;           // e.g., 70
  
  // Status
  status: 'accepted' | 'review_needed' | 'rejected';
}
```

### 6.2 Quality Rules

| Dimension | Measurement | Threshold |
|-----------|-------------|-----------|
| Objective Alignment | Keyword matching + semantic similarity | ≥ 70% |
| KPI Relevance | Mentioned KPIs / Required KPIs | ≥ 50% |
| Sector Match | Correct sector assignment | 100% |
| Terminology | Strategic vocabulary usage | ≥ 60% |
| Feasibility | Budget/timeline reasonableness | ≥ 70% |

---

## 7. Progress Tracking

### 7.1 Dashboard Metrics

```typescript
interface CascadeProgress {
  plan_id: string;
  
  // Overall progress
  overall_completion: number;           // 0-100%
  
  // By entity type
  entity_progress: {
    programs: ProgressMetric;
    challenges: ProgressMetric;
    solutions: ProgressMetric;
    sandboxes: ProgressMetric;
    living_labs: ProgressMetric;
    pilots: ProgressMetric;
  };
  
  // By objective
  objective_progress: ObjectiveProgress[];
  
  // Generation stats
  generation_stats: {
    total_generated: number;
    accepted: number;
    rejected: number;
    pending_review: number;
    average_quality_score: number;
  };
  
  // Predictions
  predictions: {
    estimated_completion_date: string;
    at_risk_objectives: string[];
    recommended_focus_areas: string[];
  };
}

interface ProgressMetric {
  target: number;
  current: number;
  percentage: number;
  trend: 'improving' | 'stable' | 'declining';
  velocity: number;                     // entities per week
}
```

---

## 8. User Interface Components

### 8.1 Demand Dashboard

Shows the prioritized demand queue with:
- Priority score visualization
- Gap severity indicators
- Quick-generate actions
- Bulk generation controls

### 8.2 Coverage Heat Map

Visual representation of:
- Sector × Objective coverage matrix
- Color-coded gap severity
- Click-to-drill-down functionality

### 8.3 Generation Controls

- **Auto-pilot mode**: System generates based on priority
- **Guided mode**: User reviews before each generation
- **Batch mode**: Generate multiple items at once

---

## 9. Database Schema Additions

```sql
-- Cascade configuration per plan
CREATE TABLE cascade_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id),
  challenges_per_objective INTEGER DEFAULT 5,
  solutions_per_challenge INTEGER DEFAULT 3,
  pilots_per_solution INTEGER DEFAULT 2,
  sector_weights JSONB DEFAULT '{}',
  critical_threshold DECIMAL DEFAULT 0.3,
  warning_threshold DECIMAL DEFAULT 0.6,
  max_batch_size INTEGER DEFAULT 10,
  cooldown_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Demand queue
CREATE TABLE demand_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id),
  objective_id UUID,
  entity_type VARCHAR(50) NOT NULL,
  required_quantity INTEGER NOT NULL,
  generated_quantity INTEGER DEFAULT 0,
  priority_score DECIMAL DEFAULT 0,
  priority_factors JSONB DEFAULT '{}',
  generation_context JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_generation_at TIMESTAMPTZ
);

-- Coverage snapshots for tracking
CREATE TABLE coverage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id),
  snapshot_date DATE DEFAULT CURRENT_DATE,
  overall_coverage DECIMAL,
  entity_coverage JSONB,
  objective_coverage JSONB,
  sector_coverage JSONB,
  gaps JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generation history
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_item_id UUID REFERENCES demand_queue(id),
  entity_type VARCHAR(50),
  entity_id UUID,
  prompt_used TEXT,
  quality_score DECIMAL,
  alignment_scores JSONB,
  status VARCHAR(20),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create database tables
- [ ] Build CascadeConfig editor in strategic plan
- [ ] Implement basic coverage calculation

### Phase 2: Gap Analysis (Week 3-4)
- [ ] Build Gap Analysis Engine
- [ ] Create coverage heat map visualization
- [ ] Implement demand calculation algorithm

### Phase 3: Smart Generation (Week 5-6)
- [ ] Enhance generators with strategic context
- [ ] Implement quality scoring
- [ ] Build demand queue UI

### Phase 4: Automation (Week 7-8)
- [ ] Add auto-generation capabilities
- [ ] Implement progress tracking
- [ ] Build predictive analytics

---

## 11. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/plans/{id}/coverage` | GET | Get current coverage analysis |
| `/api/plans/{id}/demand` | GET | Get prioritized demand queue |
| `/api/plans/{id}/gaps` | GET | Get identified gaps |
| `/api/plans/{id}/generate` | POST | Trigger generation for demand item |
| `/api/plans/{id}/config` | PUT | Update cascade configuration |
| `/api/generation/{id}/quality` | GET | Get quality scores for entity |

---

## 12. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Coverage Improvement | +30% in 3 months | Weekly snapshots |
| Generation Quality | >75% acceptance rate | Quality scores |
| Time to Full Coverage | <6 months | Progress tracking |
| Strategic Alignment | >80% average score | Alignment scoring |
| User Efficiency | 50% less manual work | Time tracking |

---

*Document Version: 1.0*
*Last Updated: 2025-02-13*
*Author: Lovable AI System*
