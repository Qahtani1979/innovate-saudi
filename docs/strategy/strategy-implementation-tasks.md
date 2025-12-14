# Strategy System - Implementation Tasks

**Generated:** 2025-12-14  
**Updated:** 2025-12-14 (Deep Validation Pass + Phase 2 Analysis)  
**Based on:** Code analysis of all 9 generators, Phase 2 (Strategy Creation), and database schema  
**Priority:** Critical → High → Medium → Low

---

## EXECUTIVE SUMMARY

After deep validation against existing code and database:

| Finding | Status | Impact |
|---------|--------|--------|
| Database schema gaps | 🔴 4 tables missing columns | Entities can't be tracked as strategy-derived |
| Generator field gaps | 🔴 6/8 generators incomplete | Records created without proper strategy flags |
| Phase 2 methodology gaps | 🔴 Strategy creation blind to existing data | Duplicate plans, no gap-driven planning |
| Approval integration | 🟠 None implemented | Drafts don't appear in ApprovalCenter |

---

## 🆕 SECTION: PHASE 2 (STRATEGY CREATION) DEEP ANALYSIS

### Current Phase 2 Implementation Status

| Component | File | Purpose | Considers Existing Plans? | Considers Existing Entities? | Avoids Duplicates? |
|-----------|------|---------|:-------------------------:|:---------------------------:|:------------------:|
| `StrategicPlanBuilder` | `pages/StrategicPlanBuilder.jsx` | Create new strategic plans | ❌ NO | ❌ NO | ❌ NO |
| `StrategicGapProgramRecommender` | `strategy/StrategicGapProgramRecommender.jsx` | Recommend programs from gaps | ✅ PARTIAL | ✅ YES - challenges, programs | ❌ NO |
| `SectorGapAnalysisWidget` | `strategy/SectorGapAnalysisWidget.jsx` | Sector coverage analysis | ✅ YES | ✅ YES - counts entities | ❌ N/A |
| `StrategyObjectiveGenerator` | `strategy/creation/StrategyObjectiveGenerator.jsx` | Generate strategic objectives | ❌ NO | ❌ NO | ❌ NO - Appends blindly |
| `StrategyPillarGenerator` | `strategy/creation/StrategyPillarGenerator.jsx` | Generate strategy pillars | ❌ NO | ❌ NO | ❌ NO |
| `EnvironmentalScanWidget` | `strategy/preplanning/EnvironmentalScanWidget.jsx` | PESTLE analysis | ❌ NO | ✅ YES - fetches global_trends | ❌ N/A |
| `StrategyInputCollector` | `strategy/preplanning/StrategyInputCollector.jsx` | Stakeholder inputs | ❌ N/A | ❌ N/A | ❌ N/A |
| `SWOTAnalysisBuilder` | `strategy/preplanning/SWOTAnalysisBuilder.jsx` | SWOT analysis | ❌ NO | ❌ NO | ❌ NO |
| `BaselineDataCollector` | `strategy/preplanning/BaselineDataCollector.jsx` | Baseline metrics | ❌ NO | ❌ NO | ❌ NO |

### CRITICAL PHASE 2 GAPS IDENTIFIED

#### GAP-P2-001: Strategy Creation Ignores Existing Plans
**Severity:** 🔴 CRITICAL  
**Component:** `StrategicPlanBuilder.jsx`  
**Issue:** 
- AI prompt does NOT receive existing strategic plans data
- No duplicate title/vision checking
- No analysis of what sectors/themes are already covered
- Creates plans in isolation without context

**Current AI Prompt (Line 36-40):**
```javascript
prompt: `Generate a strategic plan for a municipal innovation initiative. Include:
1. Vision statement
2. 3-5 strategic objectives
3. Key focus areas

Format as JSON with title_en, vision_en, and objectives array.`
```

**Expected AI Prompt:**
```javascript
prompt: `Analyze the existing strategic landscape and generate a NEW strategic plan that fills identified gaps:

EXISTING STRATEGIC PLANS:
${existingPlans.map(p => `- ${p.name_en}: ${p.vision_en} (Status: ${p.status})`).join('\n')}

EXISTING COVERAGE:
- Sectors covered: ${coveredSectors.join(', ')}
- Sectors with gaps: ${uncoveredSectors.join(', ')}
- Active challenges: ${challenges.length}
- Unaddressed challenges: ${unresolvedChallenges.length}

IDENTIFIED GAPS:
${gaps.map(g => `- ${g.title}: ${g.description}`).join('\n')}

Generate a strategic plan that:
1. Addresses the identified gaps
2. Avoids duplicating existing plans
3. Focuses on uncovered sectors
4. Builds on existing objectives where possible`
```

---

#### GAP-P2-002: Objective Generator Creates Duplicates
**Severity:** 🔴 CRITICAL  
**Component:** `StrategyObjectiveGenerator.jsx`  
**Issue:**
- `saveObjectives()` at line 94 simply appends new objectives to existing ones
- No similarity check against existing objectives
- No cross-plan deduplication
- Objectives may duplicate existing ones verbatim

**Current Code (Lines 94-96):**
```javascript
const existingObjectives = strategicPlan?.objectives || [];
const updatedObjectives = [...existingObjectives, ...objectives];
```

**Missing Logic:**
- No title similarity check
- No description overlap analysis
- No KPI target conflict detection
- No notification about potential duplicates

---

#### GAP-P2-003: No Entity Analysis Before Plan Creation
**Severity:** 🔴 CRITICAL  
**Component:** Multiple preplanning widgets  
**Issue:**
The preplanning phase collects PESTLE factors, SWOT analysis, and stakeholder inputs, but this data is NOT fed into:
- Strategic plan creation
- Objective generation
- Pillar generation
- Gap analysis

**Flow Should Be:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: STRATEGY CREATION (EXPECTED)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  EXISTING   │    │   EXISTING   │    │   GAP        │                   │
│  │  PLANS      │───▶│   ENTITIES   │───▶│   ANALYSIS   │                   │
│  │  (5 plans)  │    │  (500+ items)│    │  (automated) │                   │
│  └─────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────────────────────────────────────────────┐                   │
│  │         PRE-PLANNING DATA AGGREGATION                 │                   │
│  │  • PESTLE factors (EnvironmentalScanWidget)           │                   │
│  │  • SWOT analysis (SWOTAnalysisBuilder)                │                   │
│  │  • Stakeholder inputs (StrategyInputCollector)        │                   │
│  │  • Baseline metrics (BaselineDataCollector)           │                   │
│  │  • Risk assessment (RiskAssessmentBuilder)            │                   │
│  └──────────────────────────────────────────────────────┘                   │
│                            │                                                 │
│                            ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐                   │
│  │            AI-POWERED STRATEGY SYNTHESIS              │                   │
│  │  • Analyze all inputs + gaps                          │                   │
│  │  • Check for existing plan overlaps                   │                   │
│  │  • Recommend focus areas based on gaps                │                   │
│  │  • Generate objectives that fill identified gaps      │                   │
│  │  • Deduplicate against existing objectives            │                   │
│  └──────────────────────────────────────────────────────┘                   │
│                            │                                                 │
│                            ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐                   │
│  │              NEW STRATEGIC PLAN                       │                   │
│  │  • Vision addressing gaps                             │                   │
│  │  • Pillars for uncovered sectors                      │                   │
│  │  • Objectives with deduplication check                │                   │
│  │  • KPIs avoiding target conflicts                     │                   │
│  └──────────────────────────────────────────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Current Flow (BROKEN):**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: STRATEGY CREATION (CURRENT)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  EXISTING   │    │   EXISTING   │    │   GAP        │                   │
│  │  PLANS      │    │   ENTITIES   │    │   ANALYSIS   │                   │
│  │  (IGNORED)  │    │  (IGNORED)   │    │  (ISOLATED)  │                   │
│  └─────────────┘    └──────────────┘    └──────────────┘                   │
│         ✗                   ✗                   ✗                           │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             │                                               │
│                    NOT CONNECTED                                            │
│                             │                                               │
│                             ▼                                               │
│  ┌──────────────────────────────────────────────────────┐                   │
│  │         PRE-PLANNING WIDGETS (ISOLATED)               │                   │
│  │  • PESTLE ──▶ Stores in DB (NOT USED)                 │                   │
│  │  • SWOT ──▶ Stores in DB (NOT USED)                   │                   │
│  │  • Inputs ──▶ Stores in DB (NOT USED)                 │                   │
│  │  • Baseline ──▶ Stores in DB (NOT USED)               │                   │
│  └──────────────────────────────────────────────────────┘                   │
│                             │                                               │
│                    NOT CONNECTED                                            │
│                             │                                               │
│                             ▼                                               │
│  ┌──────────────────────────────────────────────────────┐                   │
│  │         STRATEGIC PLAN BUILDER (BLIND)                │                   │
│  │  • Generic AI prompt (no context)                     │                   │
│  │  • Creates plan without existing data                 │                   │
│  │  • No duplicate checking                              │                   │
│  │  • No gap-driven focus                                │                   │
│  └──────────────────────────────────────────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### PHASE 2 IMPLEMENTATION TASKS

#### TASK-P2-001: Create Strategy Context Aggregator Hook
**Priority:** 🔴 CRITICAL  
**Effort:** 2h  
**Status:** ✅ COMPLETED (2025-12-14)

Created `src/hooks/strategy/useStrategyContext.js` that fetches and aggregates:
- All existing strategic plans
- Entity counts by sector
- Unresolved challenges
- Gap analysis results
- PESTLE factors
- SWOT data
- Stakeholder inputs

```javascript
// src/hooks/useStrategyContext.js
export function useStrategyContext() {
  const { data: plans } = useQuery(['strategic-plans'], fetchPlans);
  const { data: challenges } = useQuery(['challenges'], fetchChallenges);
  const { data: sectors } = useQuery(['sectors'], fetchSectors);
  const { data: pestle } = useQuery(['environmental-factors'], fetchPESTLE);
  const { data: swot } = useQuery(['swot-analyses'], fetchSWOT);
  
  const aggregateContext = useMemo(() => ({
    existingPlans: plans || [],
    coveredSectors: calculateCoveredSectors(plans, challenges),
    uncoveredSectors: calculateGaps(sectors, challenges),
    unresolvedChallenges: challenges?.filter(c => c.status !== 'resolved') || [],
    environmentalFactors: pestle || [],
    swotAnalysis: swot || [],
    gaps: identifyGaps(plans, challenges, sectors)
  }), [plans, challenges, sectors, pestle, swot]);
  
  return aggregateContext;
}
```

---

#### TASK-P2-002: Enhance StrategicPlanBuilder with Context
**Priority:** 🔴 CRITICAL  
**Effort:** 1.5h  
**Status:** ✅ COMPLETED (2025-12-14)

Update `StrategicPlanBuilder.jsx` to:
1. Use `useStrategyContext()` hook
2. Display existing plans summary
3. Show gap analysis before creation
4. Pass context to AI prompt
5. Add duplicate title/vision check before save

---

#### TASK-P2-003: Add Deduplication to StrategyObjectiveGenerator
**Priority:** 🔴 CRITICAL  
**Effort:** 1h  
**Status:** ✅ COMPLETED (2025-12-14)

Update `StrategyObjectiveGenerator.jsx` to:
1. Fetch all existing objectives across all plans
2. Calculate similarity score for generated objectives
3. Flag potential duplicates before save
4. Allow user to merge or skip duplicates

---

#### TASK-P2-004: Connect Preplanning Widgets to Plan Creation
**Priority:** 🟠 HIGH  
**Effort:** 2h  
**Status:** ❌ Not Started

Create orchestration layer that:
1. Aggregates PESTLE, SWOT, inputs, baseline data
2. Feeds into plan creation AI prompt
3. Tracks which inputs influenced which plan elements

---

#### TASK-P2-005: Create Gap-Driven Plan Recommendation Engine
**Priority:** 🟠 HIGH  
**Effort:** 3h  
**Status:** ❌ Not Started

New component that:
1. Analyzes all entity gaps (sectors, challenges, solutions)
2. Cross-references with existing plan objectives
3. Recommends new plan focus areas
4. Suggests regenerating similar plans if gaps identified

---

## REVISED TASK SUMMARY

| Priority | Category | Tasks | Effort |
|----------|----------|-------|--------|
| 🔴 Critical | Phase 2 Methodology | 5 | 9.5h |
| 🔴 Critical | Database Schema | 5 | 1.5h |
| 🔴 Critical | Generator Fixes | 7 | 2h |
| 🟠 High | Approval Integration | 3 | 3h |
| 🟡 Medium | UI Enhancements | 4 | 4h |
| 🟢 Low | Documentation | 2 | 1h |
| **TOTAL** | | **26 tasks** | **~21h** |

---

## ACTUAL CURRENT STATE (VALIDATED)

### Database Schema Analysis

| Table | `is_strategy_derived` | `strategy_derivation_date` | `strategic_plan_ids` | Status |
|-------|:---------------------:|:--------------------------:|:--------------------:|--------|
| `programs` | ✅ boolean | ✅ timestamptz | ✅ ARRAY | **COMPLETE** |
| `living_labs` | ✅ boolean | ✅ timestamptz | ✅ ARRAY | **COMPLETE** |
| `events` | ✅ boolean | ✅ timestamptz | ✅ ARRAY | **COMPLETE** |
| `sandboxes` | ✅ boolean | ✅ timestamptz | ✅ ARRAY | **COMPLETE** |
| `partnerships` | ❌ MISSING | ✅ timestamptz | ✅ ARRAY | **NEEDS 1 COLUMN** |
| `challenges` | ❌ MISSING | ❌ MISSING | ✅ ARRAY | **NEEDS 2 COLUMNS** |
| `pilots` | ❌ MISSING | ❌ MISSING | ❌ MISSING | **NEEDS ALL 3** |
| `rd_calls` | ❌ MISSING | ❌ MISSING | ❌ MISSING | **NEEDS ALL 3** |
| `policies` | ❌ MISSING | ❌ MISSING | ❌ MISSING | **TABLE MAY NOT EXIST** |
| `marketing_campaigns` | ❌ MISSING | ❌ MISSING | ❌ MISSING | **TABLE MAY NOT EXIST** |

### Generator Code Analysis

| Generator | File | Target Table | Sets `is_strategy_derived` | Sets `strategy_derivation_date` | Sets `strategic_plan_ids` | Status |
|-----------|------|--------------|:--------------------------:|:------------------------------:|:------------------------:|--------|
| StrategyToProgramGenerator | ✅ Correct location | `programs` via base44 | ✅ YES (line 153) | ✅ YES (line 154) | ✅ YES (line 149) | **COMPLETE** |
| StrategyChallengeGenerator | `cascade/` folder | `challenges` | ❌ NO | ❌ NO | ✅ YES (line 104) | **NEEDS FIX** |
| StrategyToPilotGenerator | `cascade/` folder | `pilots` | ❌ NO | ❌ NO | ❌ NO | **NEEDS FIX + DB** |
| StrategyToLivingLabGenerator | `cascade/` folder | `living_labs` | ✅ YES (line 90) | ❌ NO | ✅ YES (line 89) | **NEEDS FIX** |
| StrategyToEventGenerator | `cascade/` folder | `events` | ❌ NO | ❌ NO | ✅ YES (line 98) | **NEEDS FIX** |
| StrategyToPolicyGenerator | `cascade/` folder | `policies` | ❌ NO | ❌ NO | uses `strategic_plan_id` (single) | **NEEDS FIX + DB** |
| StrategyToPartnershipGenerator | `cascade/` folder | `partnerships` | ✅ YES (line 90) | ❌ NO | ✅ YES (line 89) | **NEEDS FIX** |
| StrategyToRDCallGenerator | `cascade/` folder | `rd_calls` | ❌ NO | ❌ NO | ❌ NO | **NEEDS FIX + DB** |
| StrategyToCampaignGenerator | `cascade/` folder | `marketing_campaigns` | ❌ NO | ❌ NO | uses `strategic_plan_id` (single) | **NEEDS FIX + DB** |

---

## 🔴 CRITICAL: Database Schema Fixes

### TASK-DB-001: Add strategy columns to `pilots` table
**Priority:** Critical  
**Effort:** 15 min  
**Status:** ❌ Not Started

```sql
-- Migration: add_strategy_fields_to_pilots
ALTER TABLE pilots 
  ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_pilots_strategic_plan_ids 
  ON pilots USING GIN(strategic_plan_ids);

CREATE INDEX IF NOT EXISTS idx_pilots_is_strategy_derived 
  ON pilots(is_strategy_derived) WHERE is_strategy_derived = true;
```

---

### TASK-DB-002: Add strategy columns to `challenges` table
**Priority:** Critical  
**Effort:** 15 min  
**Status:** ❌ Not Started

```sql
-- Migration: add_strategy_fields_to_challenges
ALTER TABLE challenges 
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_challenges_is_strategy_derived 
  ON challenges(is_strategy_derived) WHERE is_strategy_derived = true;
```

**Note:** `strategic_plan_ids` already exists as ARRAY type in challenges table.

---

### TASK-DB-003: Add `is_strategy_derived` column to `partnerships` table
**Priority:** Critical  
**Effort:** 10 min  
**Status:** ❌ Not Started

```sql
-- Migration: add_is_strategy_derived_to_partnerships
ALTER TABLE partnerships 
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_partnerships_is_strategy_derived 
  ON partnerships(is_strategy_derived) WHERE is_strategy_derived = true;
```

**Note:** `strategy_derivation_date` and `strategic_plan_ids` already exist.

---

### TASK-DB-004: Add strategy columns to `rd_calls` table
**Priority:** Critical  
**Effort:** 15 min  
**Status:** ❌ Not Started

```sql
-- Migration: add_strategy_fields_to_rd_calls
ALTER TABLE rd_calls 
  ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_rd_calls_strategic_plan_ids 
  ON rd_calls USING GIN(strategic_plan_ids);
```

---

### TASK-DB-005: Verify/Create policies and marketing_campaigns tables
**Priority:** Critical  
**Effort:** 30 min  
**Status:** ❌ Not Started

**Action:** Check if `policies` and `marketing_campaigns` tables exist. If not, generators are saving to non-existent tables.

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('policies', 'marketing_campaigns');

-- If tables don't exist, create them with proper fields
-- Or update generators to use correct tables
```

---

## 🔴 CRITICAL: Generator Fixes

### GENERATOR DATA ACCESS PATTERNS (VALIDATED)

**Front-end cascade generators (React):**

| Generator | Source Component | How it fetches existing data | Blind / Scoped? |
|-----------|------------------|------------------------------|------------------|
| Challenges | `StrategyChallengeGenerator.jsx` | Fetches **all** non-deleted `strategic_plans` and all active `sectors` (no pagination / tenant scoping) | ⚠️ Semi-blind (plan must be selected, but plan list is global) |
| Pilots | `StrategyToPilotGenerator.jsx` | Fetches up to **50 challenges** globally (non-deleted, status in `approved/published/open`), **all** matching solutions (up to 50) | ⚠️ Partially scoped (status filter + limit, no municipality/plan scoping) |
| Living Labs | `StrategyToLivingLabGenerator.jsx` | Fetches **all** non-deleted `strategic_plans` + **all** active `municipalities` | 🔴 Blind global fetch |
| Events | `StrategyToEventGenerator.jsx` | Fetches **all** non-deleted `strategic_plans` | 🔴 Blind global fetch |
| Partnerships | `StrategyToPartnershipGenerator.jsx` | Fetches **all** non-deleted `strategic_plans` | 🔴 Blind global fetch |
| R&D Calls | `StrategyToRDCallGenerator.jsx` | Fetches up to **50 challenges** globally (non-deleted, approved/published/open) | ⚠️ Partially scoped (status + limit only) |
| Campaigns | `StrategyToCampaignGenerator.jsx` | Fetches **all** non-deleted `strategic_plans` | 🔴 Blind global fetch |
| Pillars | `StrategyPillarGenerator.jsx` | Calls edge function with single `strategic_plan_id`, but **does not** load or compare existing pillars | 🔴 Blind w.r.t. existing pillars |

**Edge generators (backend functions):**

| Function | File | Data inputs | Blind / Scoped? |
|----------|------|------------|------------------|
| `strategy-challenge-generator` | `supabase/functions/strategy-challenge-generator/index.ts` | Loads **one** `strategic_plan` by ID; uses only that plan's `objectives`; no knowledge of **existing challenges** | ⚠️ Scoped to plan, blind to existing entities |
| `strategy-pilot-generator` | `supabase/functions/strategy-pilot-generator/index.ts` | Loads **one** `challenge` (and optional `solution`) by ID; no knowledge of existing pilots for that challenge | ⚠️ Scoped to challenge, blind to existing pilots |
| `strategy-lab-research-generator` | (viewed via component) | Uses `strategic_plan_id` + municipality context; does **not** inspect existing `living_labs` | 🔴 Blind to existing labs |
| `strategy-rd-call-generator` | (viewed via component) | Uses selected `challenge_ids`; does **not** inspect existing `rd_calls` for those challenges | 🔴 Blind to existing R&D calls |
| `strategy-campaign-generator` | `supabase/functions/strategy-campaign-generator/index.ts` | Uses `strategic_context` + `strategic_plan_id`; no check against existing `marketing_campaigns` | 🔴 Blind to existing campaigns |
| `strategy-pillar-generator` | (edge) | Uses `strategic_plan_id`, optional context; does **not** read existing pillars from DB | 🔴 Blind to existing pillars |

**Conclusion:** All generators either:
- Fetch **broad global sets** of source data (plans, challenges, sectors, municipalities) without scoping to user/tenant, OR
- Generate new strategy-derived records **without checking** existing entities of the same type (no deduplication, no “already exists” awareness).

This confirms the user concern: generators are effectively **blind** to existing records when creating new strategy-derived entities.

---

### TASK-GEN-001: Fix StrategyChallengeGenerator
**File:** `src/components/strategy/cascade/StrategyChallengeGenerator.jsx`  
**Priority:** Critical  
**Effort:** 10 min  
**Status:** ❌ Not Started

**Current (Lines 94-106):**
```javascript
.insert({
  title_en: challenge.title_en,
  // ... other fields
  strategic_plan_ids: [selectedPlanId],
  status: 'draft',
  source: 'ai_generated'
})
```

**Fix - Add after line 106:**
```javascript
  source: 'ai_generated',
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString()
```

---

### TASK-GEN-002: Fix StrategyToLivingLabGenerator
**File:** `src/components/strategy/cascade/StrategyToLivingLabGenerator.jsx`  
**Priority:** Critical  
**Effort:** 5 min  
**Status:** ❌ Not Started

**Current (Lines 79-92):** Already sets `is_strategy_derived: true`

**Fix - Add `strategy_derivation_date` after line 90:**
```javascript
is_strategy_derived: true,
strategy_derivation_date: new Date().toISOString(),
status: 'planning'
```

---

### TASK-GEN-003: Fix StrategyToPilotGenerator
**File:** `src/components/strategy/cascade/StrategyToPilotGenerator.jsx`  
**Priority:** Critical  
**Effort:** 20 min  
**Status:** ❌ Not Started

**Issue 1:** Challenge query currently selects:
```javascript
.select('id, title_en, title_ar, municipality_id')
```
Does not load `strategic_plan_ids`, so pilots cannot inherit strategic linkage.

**Issue 2:** Insert does not set any strategy fields (lines 91-105).

**Fix challenges query (Line 28-30):**
```javascript
.select('id, title_en, title_ar, municipality_id, strategic_plan_ids')
```

**Fix insert (Lines 91-105) - Add after line 104:**
```javascript
status: 'proposed',
strategic_plan_ids: challenge?.strategic_plan_ids || [],
is_strategy_derived: true,
strategy_derivation_date: new Date().toISOString()
```

---

### TASK-GEN-004: Fix StrategyToEventGenerator
**File:** `src/components/strategy/cascade/StrategyToEventGenerator.jsx`  
**Priority:** Critical  
**Effort:** 10 min  
**Status:** ❌ Not Started

**Current (Lines 90-102):** Sets `strategic_plan_ids` but not derived flags.

**Fix - Replace insert block:**
```javascript
.insert({
  title_en: event.title_en,
  title_ar: event.title_ar,
  description_en: event.description_en,
  description_ar: event.description_ar,
  event_type: eventType,
  target_audience: targetAudience,
  strategic_plan_ids: [selectedPlanId],
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString(),
  status: 'planning',
  estimated_attendees: event.estimated_attendees,
  suggested_agenda: event.agenda
})
```

---

### TASK-GEN-005: Fix StrategyToPartnershipGenerator
**File:** `src/components/strategy/cascade/StrategyToPartnershipGenerator.jsx`  
**Priority:** Critical  
**Effort:** 5 min  
**Status:** ❌ Not Started

**Current (Lines 82-91):** Already sets `is_strategy_derived: true` but no `strategy_derivation_date`.

**Fix - Add `strategy_derivation_date` after line 90:**
```javascript
is_strategy_derived: true,
strategy_derivation_date: new Date().toISOString(),
status: 'proposed'
```

---

### TASK-GEN-006: Fix StrategyToRDCallGenerator
**File:** `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx`  
**Priority:** Critical  
**Effort:** 15 min  
**Status:** ❌ Not Started

**Issue:** No strategy fields set at all. Also uses `challenge_ids` array but does not propagate `strategic_plan_ids`.

**Fix - Modify insert block:**
```javascript
.insert({
  // ... existing fields
  challenge_ids: selectedChallenges,
  strategic_plan_ids: [], // derive from selected challenges in future task
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString(),
  status: 'draft'
})
```

(Plus: future enhancement to load `strategic_plan_ids` from challenges and populate.)

---

### TASK-GEN-007: Fix StrategyToPolicyGenerator & StrategyToCampaignGenerator
**File:** `src/components/strategy/cascade/StrategyToPolicyGenerator.jsx`  
**File:** `src/components/strategy/cascade/StrategyToCampaignGenerator.jsx`  
**Priority:** Critical  
**Effort:** 30 min  
**Status:** ❌ Not Started

**Issue:** Both use `strategic_plan_id` (singular) instead of `strategic_plan_ids` (array), and do not set derived flags.

**StrategyToPolicyGenerator (insert block):**
```javascript
// Current:
strategic_plan_id: selectedPlanId,

// Should be:
strategic_plan_ids: [selectedPlanId],
is_strategy_derived: true,
strategy_derivation_date: new Date().toISOString()
```

**StrategyToCampaignGenerator (insert block in `handleSaveCampaign`):**
```javascript
// Current:
strategic_plan_id: selectedPlanId,
status: 'draft'

// Should be:
strategic_plan_ids: [selectedPlanId],
is_strategy_derived: true,
strategy_derivation_date: new Date().toISOString(),
status: 'draft'
```

(Assumes DB tables have been updated per TASK-DB-005.)

---

## 🟠 HIGH: Approval Integration

### TASK-APPR-001: Create shared approval request hook
**File:** `src/hooks/useApprovalRequest.js` (NEW)  
**Priority:** High  
**Effort:** 45 min  
**Status:** ❌ Not Started

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useApprovalRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createApprovalRequest = useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      entityData, 
      strategicPlanId = null 
    }) => {
      const slaDueDate = new Date();
      slaDueDate.setDate(slaDueDate.getDate() + 5);

      const { data, error } = await supabase
        .from('approval_requests')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          request_type: `${entityType}_initial_review`,
          requester_email: user?.email,
          approval_status: 'pending',
          sla_due_date: slaDueDate.toISOString(),
          metadata: {
            source: 'strategy_cascade',
            strategic_plan_id: strategicPlanId,
            entity_name: entityData?.name_en || entityData?.title_en,
            is_strategy_derived: true
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['approval-requests']);
      toast.success('Submitted for approval');
    },
    onError: (error) => {
      console.error('Approval request error:', error);
      toast.error('Failed to submit for approval');
    }
  });

  return {
    createApprovalRequest: createApprovalRequest.mutateAsync,
    isSubmitting: createApprovalRequest.isPending
  };
}
```

---

### TASK-APPR-002: Add "Save & Submit" option to generators
**Files:** All 8 cascade generators  
**Priority:** High  
**Effort:** 1.5h  
**Status:** ❌ Not Started

Add checkbox + hook integration to each generator's save handler.

---

### TASK-APPR-003: Add gate configs for missing entity types
**File:** `src/components/approval/ApprovalGateConfig.jsx`  
**Priority:** High  
**Effort:** 45 min  
**Status:** ❌ Not Started

Add configs for: `living_lab`, `sandbox`, `partnership`, `event`, `rd_call`, `email_campaign`, `policy`

---

## 🟡 MEDIUM: UI Enhancements

### TASK-UI-001: Add "Strategy Derived" badge to entity lists
**Files:** Entity list components  
**Priority:** Medium  
**Effort:** 1h  
**Status:** ❌ Not Started

```jsx
{entity.is_strategy_derived && (
  <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
    <Target className="h-3 w-3 mr-1" />
    Strategy Derived
  </Badge>
)}
```

---

### TASK-UI-002: Add strategy filter to ApprovalCenter
**File:** `src/pages/ApprovalCenter.jsx`  
**Priority:** Medium  
**Effort:** 45 min  
**Status:** ❌ Not Started

---

### TASK-UI-003: Add bulk save option to generators
**Files:** All generator components  
**Priority:** Medium  
**Effort:** 1h  
**Status:** ❌ Not Started

---

### TASK-UI-004: Add strategy source indicator in entity detail
**Files:** Entity detail pages  
**Priority:** Medium  
**Effort:** 1h  
**Status:** ❌ Not Started

---

## 🟢 LOW: Documentation

### TASK-DOC-001: Update user guide for strategy cascade
**File:** `docs/user-guides/strategy-cascade.md` (NEW)  
**Priority:** Low  
**Effort:** 30 min  
**Status:** ❌ Not Started

---

### TASK-DOC-002: Add API documentation for generators
**File:** `docs/api/generators.md` (NEW)  
**Priority:** Low  
**Effort:** 30 min  
**Status:** ❌ Not Started

---

## EXECUTION ORDER

### Sprint 1 (Critical - Do First)
1. TASK-DB-005 - Verify policies/marketing_campaigns tables exist
2. TASK-DB-001 through TASK-DB-004 (Database migrations for missing columns)
3. TASK-GEN-001 through TASK-GEN-007 (Generator fixes)

### Sprint 2 (High Priority)
4. TASK-APPR-001 (Create shared approval hook)
5. TASK-APPR-003 (Add gate configs for missing types)
6. TASK-APPR-002 (Add "Save & Submit" to generators)

### Sprint 3 (Medium Priority)
7. TASK-UI-001 through TASK-UI-004 (UI enhancements)

### Sprint 4 (Low Priority)
8. TASK-DOC-001 and TASK-DOC-002 (Documentation)

---

## VERIFICATION CHECKLIST

After implementation, verify:

### Database
- [ ] `pilots` table has all 3 strategy columns
- [ ] `challenges` table has `is_strategy_derived` and `strategy_derivation_date`
- [ ] `partnerships` table has `is_strategy_derived`
- [ ] `rd_calls` table has all 3 strategy columns
- [ ] `policies` table exists with strategy columns (or generator uses correct table)
- [ ] `marketing_campaigns` table exists with strategy columns (or generator uses correct table)

### Generators
- [ ] StrategyChallengeGenerator sets all 3 strategy fields
- [ ] StrategyToLivingLabGenerator sets `strategy_derivation_date`
- [ ] StrategyToPilotGenerator fetches challenge's strategic_plan_ids and sets all 3 fields
- [ ] StrategyToEventGenerator sets all 3 strategy fields
- [ ] StrategyToPartnershipGenerator sets `strategy_derivation_date`
- [ ] StrategyToRDCallGenerator derives and sets strategic_plan_ids + 2 other fields
- [ ] StrategyToPolicyGenerator uses correct column name and sets all fields
- [ ] StrategyToCampaignGenerator uses correct column name and sets all fields

### Approval Integration
- [ ] useApprovalRequest hook exists and works
- [ ] "Save & Submit" option works in all generators
- [ ] Entities appear in ApprovalCenter after submission
- [ ] Gate configs exist for all entity types

### UI
- [ ] Strategy-derived badge shows in entity lists
- [ ] Strategy filter works in ApprovalCenter
- [ ] Source plan link works in detail pages

---

## REFERENCE: Correct Implementation Pattern

From `StrategyToProgramGenerator.jsx` (Lines 143-155):

```javascript
const program = await base44.entities.Program.create({
  name_en: theme.name_en,
  name_ar: theme.name_ar,
  description_en: theme.description_en,
  description_ar: theme.description_ar,
  program_type: theme.recommended_type || 'capacity_building',
  strategic_plan_ids: [selectedPlanId],        // ✅ ARRAY of UUIDs
  status: 'draft',                              // ✅ Draft status
  objectives: theme.objectives,
  target_outcomes: theme.target_outcomes?.map(o => ({ description: o, target: 100, current: 0 })),
  is_strategy_derived: true,                   // ✅ Boolean flag
  strategy_derivation_date: new Date().toISOString()  // ✅ Timestamp
});
```

**All generators should follow this pattern.**
