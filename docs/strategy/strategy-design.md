# Strategy System - Design Document

**Version:** 3.0 (COMPREHENSIVE ENTITY INTEGRATION REVIEW)  
**Last Updated:** 2025-12-13  
**Status:** ⚠️ 67% PLATFORM INTEGRATION - Critical Gaps on Sandboxes/Living Labs

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Entity Integration Model](#entity-integration-model)
3. [Architecture](#architecture)
4. [Data Model](#data-model)
5. [Pages Inventory](#pages-inventory)
6. [Components Inventory](#components-inventory)
7. [Edge Functions](#edge-functions)
8. [Hooks](#hooks)
9. [AI Features](#ai-features)
10. [User Flows](#user-flows)
11. [Gap Analysis](#gap-analysis)

---

## System Overview

The Strategy System provides comprehensive strategic planning and execution management for municipal innovation. It enables:

- **Strategic Plan Creation** - Build and manage multi-year strategic plans
- **Objective & KPI Management** - Define and track strategic objectives and KPIs
- **Bidirectional Integration** - Strategy drives entities, entities inform strategy
- **AI-Powered Insights** - 7 AI features for analysis and recommendations
- **Approval Workflows** - Multi-step approval gates for strategic decisions

### Key Metrics

| Metric | Count | Status |
|--------|-------|--------|
| Pages | 25+ | ✅ Complete |
| Components | 14 | ✅ Complete |
| Edge Functions | 7 | ✅ Complete |
| Hooks | 1 | ✅ Complete |
| Database Tables | 6 | ✅ Complete |
| AI Features | 7 | ✅ Complete |
| Direct Entity Integration | 2/5 | ⚠️ 40% |
| Indirect Entity Integration | 13/16 | ⚠️ 81% |

---

## Entity Integration Model

### Three-Tier Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STRATEGY SYSTEM                                      │
│                    (Strategic Plans, Objectives, KPIs)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIER 1: DIRECT INTEGRATION                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Programs ⚠️  │ Challenges ✅ │ Partnerships ⚠️ │ Sandboxes ❌ │ Labs ❌ │   │
│  │ (85%)        │ (100%)        │ (60%)           │ (0%)         │ (0%)   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│         ▼                                                                    │
│  TIER 2: INDIRECT INTEGRATION (Via Parent Entity)                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Campaigns ❌ │ R&D Calls ⚠️ │ Events ✅ │ Matchmaker ✅ │ Solutions ✅ │   │
│  │ (0%)         │ (80%)         │ (100%+)   │ (100%)       │ (100%)      │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │ Pilots ✅ │ R&D Projects ✅ │ Scaling ⚠️ │ Proposals ✅ │ Innovations ✅│   │
│  │ (100%)    │ (100%)          │ (50%)      │ (100%)       │ (100%)       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│         ▼                                                                    │
│  TIER 3: NO INTEGRATION (By Design)                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Providers (External) │ Ideas (Raw Input) │ Municipalities (Owns Plan) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### DIRECT Integration Requirements

Entities that should have explicit strategy fields:

| Entity | Required Fields | Current State | Gap |
|--------|-----------------|---------------|-----|
| **Programs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `lessons_learned` | Missing 3 fields | P0 |
| **Challenges** | `strategic_plan_ids[]`, `strategic_goal` | ✅ Complete | - |
| **Partnerships** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived` | Has `is_strategic` only | P1 |
| **Sandboxes** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date` | ❌ NO FIELDS | P0 |
| **Living Labs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date` | ❌ NO FIELDS | P0 |

### INDIRECT Integration Chains

| Entity | Via Chain | DB Fields | Status |
|--------|-----------|-----------|--------|
| **Campaigns** | Programs → Strategy | ❌ No `program_id` | BROKEN |
| **R&D Calls** | Challenges → Strategy | `challenge_ids[]` | ✅ Works |
| **Events** | Programs → Strategy | `program_id` + DIRECT fields | ✅ EXCEEDS |
| **Matchmaker** | Challenges → Strategy | `target_challenges[]` | ✅ Works |
| **Solutions** | Programs/R&D → Strategy | `source_program_id`, `source_rd_project_id` | ✅ Works |
| **Pilots** | Challenges → Strategy | `challenge_id`, `source_program_id` | ✅ Works |
| **R&D Projects** | R&D Calls → Challenges → Strategy | `rd_call_id`, `challenge_ids[]` | ✅ Works |
| **Scaling Plans** | Pilots → Challenges → Strategy | `pilot_id` | ⚠️ Missing `rd_project_id` |
| **Proposals** | Challenges → Strategy | `challenge_id`, `target_challenges[]` | ✅ Works |
| **Innovations** | Challenges → Strategy | `target_challenges[]` | ✅ Works |

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STRATEGY SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   STRATEGY   │───▶│   ENTITIES   │───▶│   OUTCOMES   │                   │
│  │    LAYER     │    │    LAYER     │    │    LAYER     │                   │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘                   │
│         │                                        │                           │
│         └────────────── FEEDBACK ────────────────┘                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           AI SERVICES                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │  Insights  │ │   Themes   │ │    Gaps    │ │ Narratives │                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
├─────────────────────────────────────────────────────────────────────────────┤
│                         EDGE FUNCTIONS                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │  Approval  │ │  Scoring   │ │  Generator │ │  Analysis  │                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── pages/
│   ├── StrategyCockpit.jsx              # Main dashboard
│   ├── StrategicPlanBuilder.jsx         # Create/edit plans
│   ├── StrategyFeedbackDashboard.jsx    # Bidirectional hub
│   ├── GapAnalysisTool.jsx              # Gap detection
│   ├── OKRManagementSystem.jsx          # OKR management
│   └── ... (20+ more pages)
│
├── components/strategy/
│   ├── StrategyToProgramGenerator.jsx   # Forward flow
│   ├── StrategicGapProgramRecommender.jsx # Gap recommendations
│   ├── WhatIfSimulator.jsx              # What-if simulation
│   └── ... (11 more components)
│
├── components/programs/
│   ├── ProgramOutcomeKPITracker.jsx     # KPI tracking
│   ├── ProgramLessonsToStrategy.jsx     # Lessons feedback
│   └── StrategicAlignmentWidget.jsx     # Alignment display
│
├── components/events/
│   └── EventStrategicAlignment.jsx      # Event linking
│
├── hooks/
│   └── useStrategicKPI.js               # Centralized KPI logic
│
└── supabase/functions/
    ├── strategic-plan-approval/
    ├── strategic-priority-scoring/
    ├── strategy-program-theme-generator/
    ├── strategy-lab-research-generator/
    ├── strategy-rd-call-generator/
    ├── strategy-sandbox-planner/
    └── strategy-sector-gap-analysis/
```

---

## Data Model

### Core Tables

#### strategic_plans

```typescript
interface StrategicPlan {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  municipality_id: string;
  start_year: number;
  end_year: number;
  vision_en: string;
  vision_ar: string;
  pillars: JSONB;      // Strategic pillars array
  objectives: JSONB;   // Strategic objectives array
  kpis: JSONB;         // Key performance indicators
  status: string;      // draft|pending|active|completed|archived
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Strategic Fields on Entities

#### CURRENT STATE vs REQUIRED

| Entity | Current Fields | Required Fields | Gap |
|--------|---------------|-----------------|-----|
| **programs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategic_pillar_id`, `strategic_priority_level`, `strategic_kpi_contributions` | + `is_strategy_derived`, `strategy_derivation_date`, `lessons_learned` | 3 fields |
| **events** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategic_pillar_id`, `strategic_alignment_score`, `is_strategy_derived`, `strategy_derivation_date`, `program_id` | ALL PRESENT | ✅ |
| **challenges** | `strategic_plan_ids[]`, `strategic_goal`, `linked_program_ids[]` | ALL PRESENT | ✅ |
| **partnerships** | `is_strategic`, `linked_challenge_ids[]`, `linked_pilot_ids[]`, `linked_program_ids[]` | + `strategic_plan_ids[]`, `strategic_objective_ids[]` | 2 fields |
| **sandboxes** | NONE | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `strategic_gaps_addressed[]` | 5+ fields |
| **living_labs** | NONE | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `research_priorities` | 5+ fields |
| **email_campaigns** | NONE | `program_id`, `challenge_id` | 2 fields |
| **scaling_plans** | `pilot_id` | + `rd_project_id` | 1 field |
| **rd_calls** | `challenge_ids[]` | + `program_id` | 1 field |

---

## Pages Inventory

### Core Strategy Pages (25+)

| # | Page | Purpose | Status |
|---|------|---------|--------|
| 1 | StrategyCockpit | Main strategy dashboard | ✅ |
| 2 | StrategicPlanBuilder | Create/edit plans | ✅ |
| 3 | StrategyFeedbackDashboard | Bidirectional hub | ✅ |
| 4 | GapAnalysisTool | AI-powered gap detection | ✅ |
| 5 | OKRManagementSystem | OKR management | ✅ |
| 6 | Portfolio | Innovation Kanban | ✅ |
| 7 | StrategicPlanApprovalGate | Approval workflow | ✅ |
| 8 | BudgetAllocationTool | Budget allocation | ✅ |
| 9 | BudgetAllocationApprovalGate | Budget approval | ✅ |
| 10 | WhatIfSimulatorPage | Scenario simulation | ✅ |
| 11 | StrategicKPITracker | KPI monitoring | ✅ |
| 12 | StrategicExecutionDashboard | Execution view | ✅ |
| 13 | StrategicInitiativeTracker | Initiative tracking | ✅ |
| 14 | StrategicPlanningProgress | Progress tracking | ✅ |
| 15 | StrategicAdvisorChat | AI advisor | ✅ |
| 16 | StrategyCopilotChat | Strategy copilot | ✅ |
| 17 | StrategyAlignment | Entity alignment | ✅ |
| 18 | InitiativePortfolio | Portfolio view | ✅ |
| 19 | ProgressToGoalsTracker | Goal tracking | ✅ |
| 20 | MultiYearRoadmap | Long-term planning | ✅ |
| 21 | InitiativeLaunchGate | Launch gate | ✅ |
| 22 | PortfolioReviewGate | Review gate | ✅ |
| 23 | PortfolioRebalancing | Rebalancing | ✅ |
| 24 | StrategicCommunicationsHub | Communications | ✅ |
| 25 | StrategicPlanningCoverageReport | Coverage report | ✅ |

---

## Components Inventory

### Strategy Components (14 Existing + 5 Missing)

| # | Component | Purpose | AI | Status |
|---|-----------|---------|-----|--------|
| 1 | StrategyToProgramGenerator | Generate programs from plans | ✅ | ✅ |
| 2 | StrategicGapProgramRecommender | Gap-based recommendations | ✅ | ✅ |
| 3 | WhatIfSimulator | Scenario simulation | ✅ | ✅ |
| 4 | SectorGapAnalysisWidget | Sector gap analysis | ✅ | ✅ |
| 5 | BottleneckDetector | Pipeline bottleneck detection | ✅ | ✅ |
| 6 | StrategicNarrativeGenerator | AI narrative generation | ✅ | ✅ |
| 7 | ResourceAllocationView | Resource visualization | No | ✅ |
| 8 | PartnershipNetwork | Network visualization | No | ✅ |
| 9 | CollaborationMapper | Collaboration view | No | ✅ |
| 10 | HistoricalComparison | Year-over-year comparison | No | ✅ |
| 11 | GeographicCoordinationWidget | Geographic coordination | No | ✅ |
| 12 | StrategicPlanWorkflowTab | Workflow stage display | No | ✅ |
| 13 | StrategyChallengeRouter | Challenge routing | No | ✅ |
| 14 | AutomatedMIICalculator | MII score calculation | No | ✅ |
| **15** | **StrategicAlignmentSandbox** | **Sandbox strategy alignment** | No | ❌ MISSING |
| **16** | **StrategicAlignmentLivingLab** | **Living lab strategy alignment** | No | ❌ MISSING |
| **17** | **StrategicAlignmentPartnership** | **Partnership strategy alignment** | No | ❌ MISSING |
| **18** | **StrategyToSandboxGenerator** | **Generate sandboxes from strategy** | ✅ | ❌ MISSING |
| **19** | **StrategyToLivingLabGenerator** | **Generate living labs from strategy** | ✅ | ❌ MISSING |

---

## Edge Functions

### Strategy Edge Functions (7)

| # | Function | Purpose | Status |
|---|----------|---------|--------|
| 1 | `strategic-plan-approval` | Process approval actions | ✅ |
| 2 | `strategic-priority-scoring` | Calculate priority scores | ✅ |
| 3 | `strategy-program-theme-generator` | AI program theme generation | ✅ |
| 4 | `strategy-lab-research-generator` | AI research brief generation | ✅ |
| 5 | `strategy-rd-call-generator` | Generate R&D calls | ✅ |
| 6 | `strategy-sandbox-planner` | Plan sandbox from strategy | ✅ |
| 7 | `strategy-sector-gap-analysis` | Sector gap analysis | ✅ |

---

## Hooks

### useStrategicKPI Hook

**File:** `src/hooks/useStrategicKPI.js` (211 lines)

```typescript
export function useStrategicKPI() {
  return {
    // Data
    strategicPlans: StrategicPlan[];
    strategicKPIs: StrategicKPI[];
    isLoading: boolean;
    
    // Mutations
    updateStrategicKPI: (kpiId, programId, value, notes) => void;
    updateStrategicKPIAsync: (params) => Promise<void>;
    isUpdating: boolean;
    batchUpdateKPIs: (programId, outcomes) => void;
    
    // Utilities
    calculateProgramContribution: (programId) => ContributionMetrics;
    getLinkedKPIs: (planIds, objectiveIds) => StrategicKPI[];
    getStrategicCoverage: (programs) => CoverageMetrics;
  };
}
```

---

## AI Features

### AI Feature Matrix (7 Features)

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 1 | Strategic Insights | StrategyCockpit | ✅ |
| 2 | Program Theme Generation | StrategyToProgramGenerator | ✅ |
| 3 | Gap Recommendations | StrategicGapProgramRecommender | ✅ |
| 4 | Plan Generation | StrategicPlanBuilder | ✅ |
| 5 | Strategy Feedback | ProgramLessonsToStrategy | ✅ |
| 6 | Narrative Generation | StrategicNarrativeGenerator | ✅ |
| 7 | What-If Simulation | WhatIfSimulator | ✅ |

---

## User Flows

### Flow 1: Strategy → Programs (Forward Flow) ✅

```
Strategic Plan → Select Objectives → AI Generate Themes → Create Programs
                                                              │
                                                              ▼
                                                 Programs with:
                                                 - strategic_plan_ids[]
                                                 - strategic_objective_ids[]
                                                 - is_strategy_derived ⚠️ MISSING
```

### Flow 2: Programs → Strategy (Feedback Flow) ✅

```
Program Outcomes → Track KPI Contributions → Update Strategic KPIs
       │
       ▼
Lessons Learned → AI Analysis → Strategy Recommendations
                                      │
                                      ▼ ⚠️ lessons_learned column MISSING
                             Update Strategic Plans
```

### Flow 3: Strategy → Sandboxes (BROKEN) ❌

```
Strategic Plan → Identify Gaps → ??? → Create Sandbox
                                   │
                                   ▼
                        NO STRATEGIC FIELDS ON SANDBOXES
                        Edge function exists but can't persist linkage
```

### Flow 4: Strategy → Living Labs (BROKEN) ❌

```
Strategic Plan → Research Priorities → ??? → Create Living Lab
                                         │
                                         ▼
                              NO STRATEGIC FIELDS ON LIVING_LABS
                              Edge function exists but can't persist linkage
```

---

## Gap Analysis

### P0 Critical Gaps

| # | Entity | Gap | Impact |
|---|--------|-----|--------|
| 1 | sandboxes | No `strategic_plan_ids[]` | Cannot track strategy alignment |
| 2 | sandboxes | No `strategic_objective_ids[]` | Cannot link to objectives |
| 3 | sandboxes | No `is_strategy_derived` | Cannot identify strategy-derived sandboxes |
| 4 | living_labs | No `strategic_plan_ids[]` | Cannot track strategy alignment |
| 5 | living_labs | No `strategic_objective_ids[]` | Cannot link to objectives |
| 6 | living_labs | No `is_strategy_derived` | Cannot identify strategy-derived labs |
| 7 | programs | No `is_strategy_derived` | Cannot identify strategy-derived programs |
| 8 | programs | No `strategy_derivation_date` | Cannot track derivation timing |
| 9 | programs | No `lessons_learned` | Cannot persist lessons feedback |

### P1 High Priority Gaps

| # | Entity | Gap | Impact |
|---|--------|-----|--------|
| 1 | partnerships | No `strategic_plan_ids[]` | Only has boolean flag, not explicit link |
| 2 | email_campaigns | No `program_id` | Cannot trace campaigns to strategy |
| 3 | email_campaigns | No `challenge_id` | Cannot trace campaigns to strategy |
| 4 | scaling_plans | No `rd_project_id` | R&D scaling path broken |
| 5 | rd_calls | No `program_id` | Cannot link R&D calls to programs |

---

## Summary

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Core Strategy System | 92% | 100% | 8% |
| Direct Entity Integration | 40% | 100% | 60% |
| Indirect Entity Integration | 81% | 100% | 19% |
| Overall Platform Integration | **67%** | **100%** | **33%** |

*Design document last updated: 2025-12-13 (Comprehensive Entity Integration Review)*
