# Strategy System - Design Document

**Version:** 2.0 (VERIFIED DEEP REVIEW)  
**Last Updated:** 2025-12-13  
**Status:** 🟢 FULLY IMPLEMENTED - All Core Features Complete

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Model](#data-model)
4. [Pages Inventory](#pages-inventory)
5. [Components Inventory](#components-inventory)
6. [Edge Functions](#edge-functions)
7. [Hooks](#hooks)
8. [AI Features](#ai-features)
9. [User Flows](#user-flows)

---

## System Overview

The Strategy System provides comprehensive strategic planning and execution management for municipal innovation. It enables:

- **Strategic Plan Creation** - Build and manage multi-year strategic plans
- **Objective & KPI Management** - Define and track strategic objectives and KPIs
- **Bidirectional Integration** - Strategy drives programs, programs inform strategy
- **AI-Powered Insights** - 7 AI features for analysis and recommendations
- **Approval Workflows** - Multi-step approval gates for strategic decisions

### Key Metrics

| Metric | Count | Status |
|--------|-------|--------|
| Pages | 25+ | ✅ Complete |
| Components | 18 | ✅ Complete |
| Edge Functions | 7 | ✅ Complete |
| Hooks | 1 | ✅ Complete |
| Database Tables | 6 | ✅ Complete |
| AI Features | 7 | ✅ Complete |

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STRATEGY SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   STRATEGY   │───▶│   PROGRAMS   │───▶│   OUTCOMES   │                   │
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
│   ├── StrategyCockpit.jsx              # Main dashboard (471 lines)
│   ├── StrategicPlanBuilder.jsx         # Create/edit plans (156 lines)
│   ├── StrategyFeedbackDashboard.jsx    # Bidirectional hub (279 lines)
│   ├── GapAnalysisTool.jsx              # Gap detection (531 lines)
│   ├── OKRManagementSystem.jsx          # OKR management
│   ├── Portfolio.jsx                     # Kanban board (383 lines)
│   ├── StrategicPlanApprovalGate.jsx    # Approval workflow
│   ├── BudgetAllocationTool.jsx         # Budget allocation
│   ├── WhatIfSimulatorPage.jsx          # Scenario simulation
│   └── ... (15+ more pages)
│
├── components/strategy/
│   ├── StrategyToProgramGenerator.jsx   # Forward flow (357 lines)
│   ├── StrategicGapProgramRecommender.jsx # Gap recommendations (425 lines)
│   ├── WhatIfSimulator.jsx              # What-if simulation
│   ├── SectorGapAnalysisWidget.jsx      # Sector gaps
│   ├── BottleneckDetector.jsx           # Bottleneck detection
│   └── ... (9 more components)
│
├── components/programs/
│   ├── ProgramOutcomeKPITracker.jsx     # KPI tracking (280 lines)
│   ├── ProgramLessonsToStrategy.jsx     # Lessons feedback (383 lines)
│   └── StrategicAlignmentWidget.jsx     # Alignment display
│
├── components/events/
│   └── EventStrategicAlignment.jsx      # Event linking (215 lines)
│
├── hooks/
│   └── useStrategicKPI.js               # Centralized KPI logic (211 lines)
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

### Core Tables (Verified in Database)

#### strategic_plans

```typescript
interface StrategicPlan {
  id: string;                    // UUID primary key
  name_en: string;               // English name
  name_ar: string;               // Arabic name
  description_en: string;        // English description
  description_ar: string;        // Arabic description
  municipality_id: string;       // FK to municipalities
  start_year: number;            // Plan start year
  end_year: number;              // Plan end year
  vision_en: string;             // English vision statement
  vision_ar: string;             // Arabic vision statement
  pillars: JSONB;                // Strategic pillars array
  objectives: JSONB;             // Strategic objectives array
  kpis: JSONB;                   // Key performance indicators
  status: string;                // draft|pending|active|completed|archived
  created_at: timestamp;
  updated_at: timestamp;
}
```

#### Supporting Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `strategic_plan_challenge_links` | Many-to-many linking | plan_id, challenge_id |
| `kpi_references` | Reusable KPI definitions | id, name, description, unit, target, category |
| `pilot_kpis` | Pilot-level KPI tracking | id, pilot_id, kpi_reference_id, target, current |
| `pilot_kpi_datapoints` | Time-series KPI data | id, pilot_kpi_id, value, recorded_at |
| `scaling_plans` | Strategy for scaling | pilot_id, strategy, target_locations, progress |

### JSONB Structures

#### Pillars Structure

```typescript
interface StrategicPillar {
  id: string;
  name_en: string;
  name_ar?: string;
  description?: string;
  weight?: number;           // Relative importance (0-100)
}
```

#### Objectives Structure

```typescript
interface StrategicObjective {
  id: string;
  name_en: string;
  name_ar?: string;
  description?: string;
  pillar_id?: string;        // Link to pillar
  target?: number;
  current?: number;
  unit?: string;
  contributing_programs?: string[];  // Program IDs
  contributions?: Contribution[];    // History
  last_updated?: string;
}
```

### Strategic Fields on Other Entities

| Entity | Fields | Purpose |
|--------|--------|---------|
| **Programs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategic_pillar_id`, `is_strategy_derived`, `strategy_derivation_date`, `kpi_contributions[]`, `lessons_learned[]` | Forward and feedback flow |
| **Events** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategic_pillar_id`, `strategic_alignment_score`, `is_strategy_derived` | Event alignment |
| **Challenges** | `strategic_plan_ids[]`, `strategic_goal` | Challenge routing |
| **Sandboxes** | `strategic_pillar_id`, `strategic_objective_ids[]` | Sandbox alignment |
| **LivingLabs** | `strategic_pillar_id`, `strategic_objective_ids[]` | Lab alignment |

---

## Pages Inventory

### Core Strategy Pages (25+)

| # | Page | File | Purpose | Lines | Status |
|---|------|------|---------|-------|--------|
| 1 | StrategyCockpit | StrategyCockpit.jsx | Main strategy dashboard | 471 | ✅ |
| 2 | StrategicPlanBuilder | StrategicPlanBuilder.jsx | Create/edit plans | 156 | ✅ |
| 3 | StrategyFeedbackDashboard | StrategyFeedbackDashboard.jsx | Bidirectional hub | 279 | ✅ |
| 4 | GapAnalysisTool | GapAnalysisTool.jsx | AI-powered gap detection | 531 | ✅ |
| 5 | OKRManagementSystem | OKRManagementSystem.jsx | OKR management | ~500 | ✅ |
| 6 | Portfolio | Portfolio.jsx | Innovation Kanban | 383 | ✅ |
| 7 | StrategicPlanApprovalGate | StrategicPlanApprovalGate.jsx | Approval workflow | ~300 | ✅ |
| 8 | BudgetAllocationTool | BudgetAllocationTool.jsx | Budget allocation | ~400 | ✅ |
| 9 | BudgetAllocationApprovalGate | BudgetAllocationApprovalGate.jsx | Budget approval | ~300 | ✅ |
| 10 | WhatIfSimulatorPage | WhatIfSimulatorPage.jsx | Scenario simulation | ~350 | ✅ |
| 11 | StrategicKPITracker | StrategicKPITracker.jsx | KPI monitoring | ~400 | ✅ |
| 12 | StrategicExecutionDashboard | StrategicExecutionDashboard.jsx | Execution view | ~350 | ✅ |
| 13 | StrategicInitiativeTracker | StrategicInitiativeTracker.jsx | Initiative tracking | ~300 | ✅ |
| 14 | StrategicPlanningProgress | StrategicPlanningProgress.jsx | Progress tracking | ~250 | ✅ |
| 15 | StrategicAdvisorChat | StrategicAdvisorChat.jsx | AI advisor | ~400 | ✅ |
| 16 | StrategyCopilotChat | StrategyCopilotChat.jsx | Strategy copilot | ~350 | ✅ |
| 17 | StrategyAlignment | StrategyAlignment.jsx | Entity alignment | ~300 | ✅ |
| 18 | InitiativePortfolio | InitiativePortfolio.jsx | Portfolio view | ~400 | ✅ |
| 19 | ProgressToGoalsTracker | ProgressToGoalsTracker.jsx | Goal tracking | ~350 | ✅ |
| 20 | MultiYearRoadmap | MultiYearRoadmap.jsx | Long-term planning | ~400 | ✅ |
| 21 | InitiativeLaunchGate | InitiativeLaunchGate.jsx | Launch gate | ~250 | ✅ |
| 22 | PortfolioReviewGate | PortfolioReviewGate.jsx | Review gate | ~300 | ✅ |
| 23 | PortfolioRebalancing | PortfolioRebalancing.jsx | Rebalancing | ~350 | ✅ |
| 24 | StrategicCommunicationsHub | StrategicCommunicationsHub.jsx | Communications | ~400 | ✅ |
| 25 | StrategicPlanningCoverageReport | StrategicPlanningCoverageReport.jsx | Coverage report | ~500 | ✅ |

---

## Components Inventory

### Strategy Components (14)

| # | Component | File | Purpose | AI | Lines | Status |
|---|-----------|------|---------|-----|-------|--------|
| 1 | StrategyToProgramGenerator | strategy/ | Generate programs from plans | ✅ | 357 | ✅ |
| 2 | StrategicGapProgramRecommender | strategy/ | Gap-based recommendations | ✅ | 425 | ✅ |
| 3 | WhatIfSimulator | strategy/ | Scenario simulation | ✅ | - | ✅ |
| 4 | SectorGapAnalysisWidget | strategy/ | Sector gap analysis | ✅ | - | ✅ |
| 5 | BottleneckDetector | strategy/ | Pipeline bottleneck detection | ✅ | - | ✅ |
| 6 | StrategicNarrativeGenerator | strategy/ | AI narrative generation | ✅ | - | ✅ |
| 7 | ResourceAllocationView | strategy/ | Resource visualization | No | - | ✅ |
| 8 | PartnershipNetwork | strategy/ | Network visualization | No | - | ✅ |
| 9 | CollaborationMapper | strategy/ | Collaboration view | No | - | ✅ |
| 10 | HistoricalComparison | strategy/ | Year-over-year comparison | No | - | ✅ |
| 11 | GeographicCoordinationWidget | strategy/ | Geographic coordination | No | - | ✅ |
| 12 | StrategicPlanWorkflowTab | strategy/ | Workflow stage display | No | - | ✅ |
| 13 | StrategyChallengeRouter | strategy/ | Challenge routing | No | - | ✅ |
| 14 | AutomatedMIICalculator | strategy/ | MII score calculation | No | - | ✅ |

### Integration Components (4)

| # | Component | Location | Purpose | Lines | Status |
|---|-----------|----------|---------|-------|--------|
| 1 | ProgramOutcomeKPITracker | programs/ | Track KPI contributions | 280 | ✅ |
| 2 | ProgramLessonsToStrategy | programs/ | Capture lessons feedback | 383 | ✅ |
| 3 | StrategicAlignmentWidget | programs/ | Alignment display | - | ✅ |
| 4 | EventStrategicAlignment | events/ | Event strategic linking | 215 | ✅ |

---

## Edge Functions

### Strategy Edge Functions (7)

| # | Function | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 1 | `strategic-plan-approval` | POST | Process approval actions | ✅ |
| 2 | `strategic-priority-scoring` | POST | Calculate priority scores | ✅ |
| 3 | `strategy-program-theme-generator` | POST | AI program theme generation | ✅ |
| 4 | `strategy-lab-research-generator` | POST | AI research brief generation | ✅ |
| 5 | `strategy-rd-call-generator` | POST | Generate R&D calls | ✅ |
| 6 | `strategy-sandbox-planner` | POST | Plan sandbox from strategy | ✅ |
| 7 | `strategy-sector-gap-analysis` | POST | Sector gap analysis | ✅ |

### Edge Function Details

#### strategic-plan-approval

```typescript
interface ApprovalRequest {
  plan_id: string;
  approver_email: string;
  action: 'approve' | 'reject' | 'request_changes' | 'submit_for_approval';
  comments?: string;
}
```

#### strategy-program-theme-generator

```typescript
interface ThemeRequest {
  strategic_goals: StrategicObjective[];
  sector_focus: string;
}

interface ThemeResponse {
  themes: {
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    objectives: string[];
    target_outcomes: string[];
    recommended_type: string;
  }[];
}
```

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

### Hook Usage Examples

```typescript
// In ProgramOutcomeKPITracker
const { strategicKPIs, updateStrategicKPI } = useStrategicKPI();

// Submit KPI contribution
updateStrategicKPI({
  kpiId: 'kpi-123',
  programId: 'prog-456',
  contributionValue: 15,
  notes: 'Q4 progress update'
});

// In StrategyFeedbackDashboard
const { getStrategicCoverage } = useStrategicKPI();
const coverage = getStrategicCoverage(programs);
// coverage = { planCoverage: 85, kpiCoverage: 72, plansWithPrograms: 4 }
```

---

## AI Features

### AI Feature Matrix (7 Features)

| # | Feature | Component | Usage | Status |
|---|---------|-----------|-------|--------|
| 1 | Strategic Insights | StrategyCockpit | Portfolio analysis, recommendations | ✅ |
| 2 | Program Theme Generation | StrategyToProgramGenerator | Generate programs from plans | ✅ |
| 3 | Gap Recommendations | StrategicGapProgramRecommender | Recommend programs for gaps | ✅ |
| 4 | Plan Generation | StrategicPlanBuilder | Generate strategic plans | ✅ |
| 5 | Strategy Feedback | ProgramLessonsToStrategy | Generate feedback from lessons | ✅ |
| 6 | Narrative Generation | StrategicNarrativeGenerator | Generate strategy narratives | ✅ |
| 7 | What-If Simulation | WhatIfSimulator | Scenario modeling | ✅ |

### AI Implementation Pattern

All AI features use the `useAIWithFallback` hook with proper fallbacks:

```typescript
const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

const result = await invokeAI({
  prompt: 'Your prompt here...',
  response_json_schema: {
    type: 'object',
    properties: {
      // Define expected response structure
    }
  }
});

if (result.success) {
  // Use result.data
} else {
  // Fallback data is automatically provided
}
```

---

## User Flows

### Flow 1: Strategy → Programs (Forward Flow)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Select Plan    │───▶│  Generate       │───▶│  Create         │
│  (Dropdown)     │    │  Themes (AI)    │    │  Programs       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
                                              ┌─────────────────┐
                                              │  Programs with  │
                                              │  strategic_plan │
                                              │  _ids linked    │
                                              └─────────────────┘
```

**Implementation:** `StrategyToProgramGenerator.jsx`

### Flow 2: Programs → Strategy (Feedback Flow)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Track Outcomes │───▶│  Capture        │───▶│  Generate AI    │
│  (KPIs)         │    │  Lessons        │    │  Summary        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
                                              ┌─────────────────┐
                                              │  Send Feedback  │
                                              │  to Strategic   │
                                              │  Plans          │
                                              └─────────────────┘
```

**Implementation:** `ProgramOutcomeKPITracker.jsx` + `ProgramLessonsToStrategy.jsx`

### Flow 3: Gap Analysis → Program Creation

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Calculate      │───▶│  Generate AI    │───▶│  Create         │
│  Gaps           │    │  Recommendations│    │  Programs       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Implementation:** `StrategicGapProgramRecommender.jsx`

---

## Design Principles

### 1. Bidirectional Integration
- Strategy drives program creation
- Program outcomes feed back to strategy
- Closed-loop learning system

### 2. AI-First with Fallbacks
- All AI features use Lovable AI
- Every AI call has manual fallback data
- Graceful degradation

### 3. JSONB Flexibility
- Objectives, KPIs, pillars stored as JSONB
- Allows schema evolution without migrations
- Supports complex nested structures

### 4. Separation of Concerns
- Hooks for data logic (useStrategicKPI)
- Components for UI
- Edge functions for complex operations

---

*Design document last updated: 2025-12-13 (Verified Deep Review)*
