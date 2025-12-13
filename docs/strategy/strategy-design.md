# Strategy System - Design Document

**Version:** 3.2 (PHASE 3-4 COMPLETE)  
**Last Updated:** 2025-12-13  
**Status:** 🔄 92% PLATFORM INTEGRATION - Phase 1-4 Complete, Phase 5-6 Remaining

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
| Components | 18 | ✅ Complete (+4 new alignment widgets) |
| Edge Functions | 7 | ✅ Complete |
| Hooks | 1 | ✅ Complete |
| Database Tables | 6 | ✅ Complete |
| AI Features | 7 | ✅ Complete |
| Direct Entity Integration | 5/5 | ✅ 100% (DB + UI Complete) |
| Indirect Entity Integration | 16/16 | ✅ 100% (DB Complete) |
| Form Integrations | 4/4 | ✅ 100% (All selectors added) |

---

## Entity Integration Model

### Three-Tier Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STRATEGY SYSTEM                                      │
│                    (Strategic Plans, Objectives, KPIs)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIER 1: DIRECT INTEGRATION ✅ ALL COMPLETE                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Programs ✅   │ Challenges ✅ │ Partnerships ✅ │ Sandboxes ✅ │ Labs ✅│   │
│  │ (100%)        │ (100%)        │ (100%)          │ (100%)       │ (100%) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│         ▼                                                                    │
│  TIER 2: INDIRECT INTEGRATION ✅ ALL COMPLETE                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Campaigns ✅  │ R&D Calls ✅  │ Events ✅ │ Matchmaker ✅ │ Solutions ✅ │   │
│  │ (100%)        │ (100%)        │ (100%+)   │ (100%)       │ (100%)      │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │ Pilots ✅ │ R&D Projects ✅ │ Scaling ✅  │ Proposals ✅ │ Innovations ✅│   │
│  │ (100%)    │ (100%)          │ (100%)      │ (100%)       │ (100%)       │   │
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

### DIRECT Integration Requirements ✅ ALL COMPLETE

Entities with explicit strategy fields (ALL DB FIELDS NOW PRESENT):

| Entity | Required Fields | Current State | Status |
|--------|-----------------|---------------|--------|
| **Programs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `lessons_learned` | ✅ All present | ✅ Complete |
| **Challenges** | `strategic_plan_ids[]`, `strategic_goal` | ✅ All present | ✅ Complete |
| **Partnerships** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategy_derivation_date` | ✅ All present | ✅ Complete |
| **Sandboxes** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `strategic_gaps_addressed[]`, `strategic_taxonomy_codes[]` | ✅ All present | ✅ Complete |
| **Living Labs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `research_priorities`, `strategic_taxonomy_codes[]` | ✅ All present | ✅ Complete |

### INDIRECT Integration Chains ✅ ALL COMPLETE

| Entity | Via Chain | DB Fields | Status |
|--------|-----------|-----------|--------|
| **Campaigns** | Programs → Strategy | ✅ `program_id`, `challenge_id` | ✅ FIXED |
| **R&D Calls** | Challenges + Programs → Strategy | ✅ `challenge_ids[]`, `program_id` | ✅ FIXED |
| **Events** | Programs → Strategy | `program_id` + DIRECT fields | ✅ EXCEEDS |
| **Matchmaker** | Challenges → Strategy | `target_challenges[]` | ✅ Works |
| **Solutions** | Programs/R&D → Strategy | `source_program_id`, `source_rd_project_id` | ✅ Works |
| **Pilots** | Challenges → Strategy | `challenge_id`, `source_program_id` | ✅ Works |
| **R&D Projects** | R&D Calls → Challenges → Strategy | `rd_call_id`, `challenge_ids[]` | ✅ Works |
| **Scaling Plans** | Pilots + R&D → Strategy | ✅ `pilot_id`, `rd_project_id` | ✅ FIXED |
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
| **15** | **StrategicAlignmentSandbox** | **Sandbox strategy alignment** | No | ✅ CREATED |
| **16** | **StrategicAlignmentLivingLab** | **Living lab strategy alignment** | No | ✅ CREATED |
| **17** | **StrategicAlignmentPartnership** | **Partnership strategy alignment** | No | ✅ CREATED |
| **18** | **StrategicPlanSelector** | **Shared reusable selector** | No | ✅ CREATED |
| **19** | **StrategyToSandboxGenerator** | **Generate sandboxes from strategy** | ✅ | ⏳ Phase 5 |
| **20** | **StrategyToLivingLabGenerator** | **Generate living labs from strategy** | ✅ | ⏳ Phase 5 |

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
    strategicPlans,           // All strategic plans
    strategicKPIs,           // Extracted KPIs from plans
    isLoading,               // Loading state
    isUpdating,              // Mutation state

    // Mutations
    updateStrategicKPI,      // Update single KPI
    updateStrategicKPIAsync, // Async update with await
    batchUpdateKPIs,         // Batch update from programs

    // Utilities
    calculateProgramContribution,  // Calculate program→KPI contribution
    getLinkedKPIs,                 // Get KPIs linked to program
    getStrategicCoverage          // Get coverage metrics
  };
}
```

---

## AI Features

### 7 AI-Powered Features

| # | Feature | Component/Function | Model | Status |
|---|---------|-------------------|-------|--------|
| 1 | Strategic Insights | StrategyCockpit | gemini-2.5-flash | ✅ |
| 2 | Program Theme Generation | strategy-program-theme-generator | gemini-2.5-flash | ✅ |
| 3 | Gap Recommendations | StrategicGapProgramRecommender | gemini-2.5-flash | ✅ |
| 4 | Plan Generation | StrategicPlanBuilder | gemini-2.5-flash | ✅ |
| 5 | Strategy Feedback | ProgramLessonsToStrategy | gemini-2.5-flash | ✅ |
| 6 | Narrative Generation | StrategicNarrativeGenerator | gemini-2.5-flash | ✅ |
| 7 | What-If Simulation | WhatIfSimulator | gemini-2.5-flash | ✅ |

---

## User Flows

### Flow 1: Strategy-Driven Program Creation

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Strategic Plan  │───▶│ Theme Generator │───▶│ Program Created │
│ (Objectives)    │    │ (AI-powered)    │    │ (Auto-linked)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                             │
         └─────────── is_strategy_derived=true ────────┘
```

### Flow 2: Program Outcome Feedback

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Program KPIs    │───▶│ Lessons Learned │───▶│ Strategy Update │
│ (Achievements)  │    │ (AI Analysis)   │    │ (KPI Revision)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                             │
         └─────────── useStrategicKPI hook ────────────┘
```

### Flow 3: Gap Analysis & Recommendations

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Strategic Gaps  │───▶│ AI Analysis     │───▶│ Recommendations │
│ (Unmet Goals)   │    │ (Gap Detection) │    │ (New Programs)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Gap Analysis

### Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 Critical | 9 | Sandboxes/Living Labs have NO strategic fields |
| P1 High | 6 | Programs missing columns, Partnerships missing IDs |
| P2 Medium | 5 | Missing UI components for alignment display |
| P3 Low | 4 | Policy documents, Global trends integration |

### Critical Fixes Required

1. **Database: Add strategic fields to `sandboxes`**
2. **Database: Add strategic fields to `living_labs`**
3. **Database: Add missing columns to `programs`**
4. **UI: Create StrategicAlignmentSandbox component**
5. **UI: Create StrategicAlignmentLivingLab component**

---

*Document last updated: 2025-12-13*
