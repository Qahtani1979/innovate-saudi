# Demand-Driven Cascade Generation - Implementation Plan

> **Last Updated**: 2025-12-15
> **Status**: ✅ Complete (All Phases Implemented)

## Implementation Status

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| 1 | Database Foundation | ✅ Complete | 100% |
| 2 | Edge Functions (Core) | ✅ Complete | 100% |
| 3 | Frontend Hooks | ✅ Complete | 100% |
| 4 | Generator Integration | ✅ Complete | 100% |
| 5 | Demand Dashboard | ✅ Complete | 100% |
| 6 | Batch Generation | ✅ Complete | 100% |

### Completed Items

#### Phase 1: Database ✅
- [x] Added `cascade_config` JSONB column to `strategic_plans`
- [x] Created `demand_queue` table with indexes and RLS
- [x] Created `generation_history` table
- [x] Created `coverage_snapshots` table
- [x] Added `update_demand_queue_updated_at` trigger function

#### Phase 2: Edge Functions ✅
- [x] Created `strategy-gap-analysis` - Analyzes plan coverage gaps
- [x] Created `strategy-demand-queue-generator` - AI-powered queue creation
- [x] Created `strategy-quality-assessor` - AI quality validation

#### Phase 3: Frontend Hooks ✅
- [x] Created `useDemandQueue` hook - Queue management
- [x] Created `useQueueAutoPopulation` hook - Auto-population for generators
- [x] Created `useGapAnalysis` hook - Gap analysis integration

#### Phase 4: Generator Integration ✅
- [x] Created `QueueAwareGeneratorWrapper` component
- [x] Auto-population support for generators
- [x] Queue navigation controls (next, skip, reject, exit)
- [x] Progress tracking and queue status display

#### Phase 5: Demand Dashboard ✅
- [x] Created `DemandDashboard` component with coverage analysis
- [x] Created `StrategyDemandDashboardPage` page
- [x] Created `CoverageHeatmap` component - Visual coverage by objective
- [x] Created `QueueByTypeChart` component - Queue distribution charts
- [x] Queue visualization with stats and item list
- [x] Linked in Strategy Hub Monitoring Tab

#### Phase 6: Batch Generation ✅
- [x] Created `BatchGenerationControls` component
- [x] Entity type filtering
- [x] Configurable batch size (1-20)
- [x] Auto-approve option with quality threshold
- [x] Progress tracking with pause/resume/stop controls
- [x] Quality assessment integration

---

## Strategy Hub Integration

The Demand Dashboard is accessible from the Strategy Hub:

| Tab | Tool | Route |
|-----|------|-------|
| Monitoring | Demand Dashboard | `/strategy-demand-dashboard` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DEMAND-DRIVEN CASCADE SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         STRATEGIC PLAN                                    │   │
│  │  cascade_config: { targets, quality, preferences }                       │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                           │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                      GAP ANALYSIS ENGINE                                  │   │
│  │  strategy-gap-analysis edge function                                     │   │
│  │  - Analyze coverage by objective                                         │   │
│  │  - Compare against cascade_config targets                                │   │
│  │  - Calculate priority scores                                             │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                           │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                       DEMAND QUEUE                                        │   │
│  │  demand_queue table                                                      │   │
│  │  - Prioritized generation items                                          │   │
│  │  - AI pre-filled specifications                                          │   │
│  │  - Status tracking (pending → in_progress → generated → accepted)        │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                           │
│  ┌─────────────────┬─────────────────┴─────────────────┬─────────────────┐      │
│  │                 │                                   │                 │      │
│  ▼                 ▼                                   ▼                 ▼      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Challenge       │ │ Pilot           │ │ Policy          │ │ ...Other        ││
│  │ Generator       │ │ Generator       │ │ Generator       │ │ Generators      ││
│  │                 │ │                 │ │                 │ │                 ││
│  │ Auto-populated  │ │ Auto-populated  │ │ Auto-populated  │ │ Auto-populated  ││
│  │ with prefilled  │ │ with prefilled  │ │ with prefilled  │ │ with prefilled  ││
│  │ spec from queue │ │ spec from queue │ │ spec from queue │ │ spec from queue ││
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘│
│           │                   │                   │                   │         │
│           └───────────────────┴───────────────────┴───────────────────┘         │
│                                      │                                           │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                      QUALITY ASSESSOR                                     │   │
│  │  strategy-quality-assessor edge function                                 │   │
│  │  - Objective alignment score                                             │   │
│  │  - Completeness score                                                    │   │
│  │  - Feasibility score                                                     │   │
│  │  - Auto-accept/reject/review decision                                    │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                           │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                     GENERATION HISTORY                                    │   │
│  │  generation_history table                                                │   │
│  │  - Track all generation attempts                                         │   │
│  │  - Quality metrics over time                                             │   │
│  │  - Outcome tracking (accepted/rejected/regenerated)                      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### cascade_config (in strategic_plans)

```json
{
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
}
```

### demand_queue Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| strategic_plan_id | UUID | FK to strategic_plans |
| objective_id | TEXT | From objectives JSONB |
| pillar_id | TEXT | From pillars JSONB |
| entity_type | TEXT | challenge, pilot, policy, etc. |
| generator_component | TEXT | Component to use |
| priority_score | INTEGER | 0-100 |
| priority_factors | JSONB | Score breakdown |
| prefilled_spec | JSONB | AI-generated spec |
| status | TEXT | pending, in_progress, generated, review, accepted, rejected, skipped |
| attempts | INTEGER | Generation attempts |
| generated_entity_id | UUID | Result entity ID |
| quality_score | INTEGER | Quality assessment |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Updated timestamp |

---

## Frontend Hooks

### useDemandQueue

```typescript
const {
  queueItems,
  getNextItem,
  updateItemStatus,
  completeItem,
  refetch,
  pendingCount,
  byType
} = useDemandQueue(strategicPlanId);
```

### useQueueAutoPopulation

```typescript
const {
  queueItem,
  isAutoMode,
  setIsAutoMode,
  loadNextFromQueue,
  completeQueueItem,
  skipItem,
  prefillData
} = useQueueAutoPopulation(entityType, strategicPlanId);
```

### useGapAnalysis

```typescript
const {
  gaps,
  coverage,
  recommendations,
  runAnalysis,
  isAnalyzing
} = useGapAnalysis(strategicPlanId);
```

---

## Components

### DemandDashboard

Main dashboard showing:
- Coverage heatmap by objective
- Queue by entity type chart
- Queue item list with actions
- Gap analysis summary
- Batch generation controls

### BatchGenerationControls

Controls for batch generation:
- Entity type filter
- Batch size selector (1-20)
- Auto-approve toggle with threshold
- Progress bar
- Pause/Resume/Stop buttons

### QueueAwareGeneratorWrapper

Wrapper that adds queue awareness to any generator:
- Auto-load from queue
- Pre-fill form with queue spec
- Queue navigation (next, skip, reject)
- Progress indicator
- Exit queue mode

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [strategy-design.md](./strategy-design.md) | Phase 3 Cascade design |
| [strategy-integration-matrix.md](./strategy-integration-matrix.md) | Entity generation specs |
| [wizard-implementation-status.md](./wizard-implementation-status.md) | Wizard implementation |
