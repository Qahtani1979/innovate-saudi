# Strategy System - Integration Matrix

**Last Updated:** 2025-12-13 (PHASE 3-4 COMPLETE)  
**Status:** 🔄 92% PLATFORM INTEGRATION - Phase 1-4 Complete, Phase 5-6 Remaining

---

## INTEGRATION SUMMARY

### By Integration Type

| Type | Entities | Complete | Partial | Missing | Coverage |
|------|----------|----------|---------|---------|----------|
| **DIRECT** | 5 | 5 | 0 | 0 | ✅ 100% |
| **INDIRECT** | 16 | 16 | 0 | 0 | ✅ 100% |
| **NO INTEGRATION** | 3 | 3 | 0 | 0 | N/A |
| **TOTAL** | 24 | 24 | 0 | 0 | **100%** |

### Entity Status Overview

| # | Entity | Integration Type | Expected | Actual | Status |
|---|--------|------------------|----------|--------|--------|
| 1 | Programs | DIRECT | strategic_plan_ids[], is_strategy_derived, lessons_learned | ✅ All present | ✅ 100% |
| 2 | Challenges | DIRECT | strategic_plan_ids[], strategic_goal | ✅ All present | ✅ 100% |
| 3 | Partnerships | DIRECT | strategic_plan_ids[], is_strategy_derived | ✅ All present | ✅ 100% |
| 4 | Sandboxes | DIRECT | strategic_plan_ids[], is_strategy_derived | ✅ All present | ✅ 100% |
| 5 | Living Labs | DIRECT | strategic_plan_ids[], is_strategy_derived | ✅ All present | ✅ 100% |
| 6 | Campaigns | INDIRECT | program_id → Programs | ✅ Has program_id, challenge_id | ✅ 100% |
| 7 | R&D Calls | INDIRECT | challenge_ids[], program_id → Strategy | ✅ Has both | ✅ 100% |
| 8 | Events | INDIRECT | program_id → Programs | ✅ Has program_id + DIRECT | ✅ 100%+ |
| 9 | Matchmaker | INDIRECT | target_challenges[] → Challenges | ✅ Has target_challenges | ✅ 100% |
| 10 | Solutions | INDIRECT | source_program_id → Programs | ✅ Has source_program_id | ✅ 100% |
| 11 | Pilots | INDIRECT | challenge_id, source_program_id | ✅ Has both | ✅ 100% |
| 12 | R&D Projects | INDIRECT | rd_call_id, challenge_ids[] | ✅ Has both | ✅ 100% |
| 13 | Scaling Plans | INDIRECT | pilot_id, rd_project_id | ✅ Has both | ✅ 100% |
| 14 | Proposals (Challenge) | INDIRECT | challenge_id | ✅ Has challenge_id | ✅ 100% |
| 15 | Proposals (Innovation) | INDIRECT | target_challenges[] | ✅ Has target_challenges | ✅ 100% |
| 16 | Citizens | INDIRECT | Via pilot enrollments | ✅ Works | ✅ 100% |
| 17 | Staff | INDIRECT | Via municipality | ✅ Works | ✅ 100% |
| 18 | Providers | NONE | N/A - External | ✅ Correct | ✅ N/A |
| 19 | Ideas | NONE | N/A - Raw input | ✅ Correct | ✅ N/A |
| 20 | Municipalities | NONE* | N/A - Owns strategy | Has strategic_plan_id | ⚠️ Reclassify |

---

## DIRECT INTEGRATION DETAIL

### 1. Programs ✅ 100% Complete

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `strategic_plan_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_objective_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_pillar_id` | uuid | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_priority_level` | text | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_kpi_contributions` | jsonb | ✅ | ✅ EXISTS | ✓ DB verified |
| `is_strategy_derived` | boolean | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategy_derivation_date` | timestamptz | ✅ | ✅ EXISTS | ✓ ADDED |
| `lessons_learned` | jsonb | ✅ | ✅ EXISTS | ✓ ADDED |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| StrategyToProgramGenerator | Forward flow | ✅ |
| StrategicGapProgramRecommender | Gap recommendations | ✅ |
| ProgramOutcomeKPITracker | KPI tracking | ✅ |
| ProgramLessonsToStrategy | Lessons feedback | ✅ |
| StrategicAlignmentWidget | Alignment display | ✅ |

---

### 2. Challenges ✅ 100% Complete

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `strategic_plan_ids` | text[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_goal` | text | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_program_ids` | text[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_pilot_ids` | text[] | ✅ | ✅ EXISTS | ✓ DB verified |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| StrategyChallengeRouter | Route challenges | ✅ |

---

### 3. Partnerships ✅ 100% Complete

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `is_strategic` | boolean | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_challenge_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_pilot_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_program_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_plan_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategic_objective_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategy_derivation_date` | timestamptz | Optional | ✅ EXISTS | ✓ ADDED |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| PartnershipNetwork | Network visualization | ✅ |
| StrategicAlignmentPartnership | Strategy alignment | ✅ CREATED |

---

### 4. Sandboxes ✅ 100% Complete

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `strategic_plan_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategic_objective_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ ADDED |
| `is_strategy_derived` | boolean | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategy_derivation_date` | timestamptz | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategic_gaps_addressed` | text[] | Optional | ✅ EXISTS | ✓ ADDED |
| `strategic_taxonomy_codes` | text[] | Optional | ✅ EXISTS | ✓ ADDED |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| strategy-sandbox-planner | Edge function (exists) | ✅ |
| StrategicAlignmentSandbox | Strategy alignment | ✅ CREATED |
| StrategyToSandboxGenerator | Generate from strategy | ⏳ Phase 5 |

---

### 5. Living Labs ✅ 100% Complete

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `strategic_plan_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategic_objective_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ ADDED |
| `is_strategy_derived` | boolean | ✅ | ✅ EXISTS | ✓ ADDED |
| `strategy_derivation_date` | timestamptz | ✅ | ✅ EXISTS | ✓ ADDED |
| `research_priorities` | text[] | Optional | ✅ EXISTS | ✓ ADDED |
| `strategic_taxonomy_codes` | text[] | Optional | ✅ EXISTS | ✓ ADDED |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| strategy-lab-research-generator | Edge function (exists) | ✅ |
| StrategicAlignmentLivingLab | Strategy alignment | ✅ CREATED |
| StrategyToLivingLabGenerator | Generate from strategy | ⏳ Phase 5 |

---

## INDIRECT INTEGRATION DETAIL

### All Chains ✅ COMPLETE

| Chain | Path | Status |
|-------|------|--------|
| Events → Strategy | `events.program_id` → `programs.strategic_plan_ids[]` | ✅ Works + Has Direct |
| Matchmaker → Strategy | `matchmaker_applications.target_challenges[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Solutions → Strategy | `solutions.source_program_id` → `programs.strategic_plan_ids[]` | ✅ Works |
| Pilots → Strategy | `pilots.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ Works |
| R&D Projects → Strategy | `rd_projects.rd_call_id` → `rd_calls.challenge_ids[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| R&D Calls → Strategy | `rd_calls.challenge_ids[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| R&D Calls → Programs | `rd_calls.program_id` → `programs.strategic_plan_ids[]` | ✅ FIXED |
| Challenge Proposals → Strategy | `challenge_proposals.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Innovation Proposals → Strategy | `innovation_proposals.target_challenges[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Citizens → Strategy | `citizen_pilot_enrollments.pilot_id` → `pilots.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Staff → Strategy | `municipality_staff_profiles.municipality_id` → `municipalities.strategic_plan_id` | ✅ Works |
| Campaigns → Strategy | `email_campaigns.program_id` → `programs.strategic_plan_ids[]` | ✅ FIXED |
| Campaigns → Challenges | `email_campaigns.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ FIXED |
| Scaling (Pilot) → Strategy | `scaling_plans.pilot_id` → `pilots.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Scaling (R&D) → Strategy | `scaling_plans.rd_project_id` → `rd_projects.rd_call_id` → Strategy | ✅ FIXED |

---

## EDGE FUNCTIONS MATRIX

| # | Function | Input | Output | Status |
|---|----------|-------|--------|--------|
| 1 | strategic-plan-approval | plan_id, action, approver | Updated status | ✅ |
| 2 | strategic-priority-scoring | entity_type, entity_id, criteria | Priority score | ✅ |
| 3 | strategy-program-theme-generator | strategic_goals, sector_focus | Themes array | ✅ |
| 4 | strategy-lab-research-generator | topic, sector_id, research_type | Research brief | ✅ |
| 5 | strategy-rd-call-generator | challenge_ids, sector_id, budget_range | R&D call draft | ✅ |
| 6 | strategy-sandbox-planner | sandbox_type, objectives, duration | Sandbox plan | ✅ |
| 7 | strategy-sector-gap-analysis | sector_id | Gap analysis | ✅ |

---

## useStrategicKPI HOOK INTEGRATION

| Function | Purpose | Used By | Status |
|----------|---------|---------|--------|
| `strategicPlans` | Fetch all plans | Multiple | ✅ |
| `strategicKPIs` | Extract KPIs from plans | ProgramOutcomeKPITracker | ✅ |
| `updateStrategicKPI()` | Update KPI with contribution | ProgramOutcomeKPITracker | ✅ |
| `calculateProgramContribution()` | Calculate program contribution | Analytics | ✅ |
| `getLinkedKPIs()` | Get KPIs for program | ProgramDetail | ✅ |
| `getStrategicCoverage()` | Coverage metrics | StrategyFeedbackDashboard | ✅ |
| `batchUpdateKPIs()` | Batch update outcomes | Bulk operations | ✅ |

---

## AI SERVICES INTEGRATION

| # | Feature | Component | Hook | Status |
|---|---------|-----------|------|--------|
| 1 | Strategic Insights | StrategyCockpit | useAIWithFallback | ✅ |
| 2 | Program Theme Generation | StrategyToProgramGenerator | useAIWithFallback | ✅ |
| 3 | Gap Recommendations | StrategicGapProgramRecommender | useAIWithFallback | ✅ |
| 4 | Plan Generation | StrategicPlanBuilder | useAIWithFallback | ✅ |
| 5 | Strategy Feedback | ProgramLessonsToStrategy | useAIWithFallback | ✅ |
| 6 | Narrative Generation | StrategicNarrativeGenerator | useAIWithFallback | ✅ |
| 7 | What-If Simulation | WhatIfSimulator | useAIWithFallback | ✅ |

---

## GAP SUMMARY

### P0 Critical (Must Fix)

| # | Entity | Field | Impact |
|---|--------|-------|--------|
| 1 | sandboxes | `strategic_plan_ids[]` | Cannot track strategy alignment |
| 2 | sandboxes | `strategic_objective_ids[]` | Cannot link to objectives |
| 3 | sandboxes | `is_strategy_derived` | Cannot identify strategy-derived |
| 4 | sandboxes | `strategy_derivation_date` | Cannot track derivation timing |
| 5 | living_labs | `strategic_plan_ids[]` | Cannot track strategy alignment |
| 6 | living_labs | `strategic_objective_ids[]` | Cannot link to objectives |
| 7 | living_labs | `is_strategy_derived` | Cannot identify strategy-derived |
| 8 | living_labs | `strategy_derivation_date` | Cannot track derivation timing |
| 9 | programs | `is_strategy_derived` | Cannot identify strategy-derived |
| 10 | programs | `strategy_derivation_date` | Cannot track derivation timing |
| 11 | programs | `lessons_learned` | Cannot persist lessons feedback |

### P1 High Priority (Should Fix)

| # | Entity | Field | Impact |
|---|--------|-------|--------|
| 1 | partnerships | `strategic_plan_ids[]` | Only boolean flag, no explicit link |
| 2 | partnerships | `strategic_objective_ids[]` | Cannot link to objectives |
| 3 | email_campaigns | `program_id` | Campaigns can't trace to strategy |
| 4 | email_campaigns | `challenge_id` | Campaigns can't trace to strategy |
| 5 | scaling_plans | `rd_project_id` | R&D scaling path broken |
| 6 | rd_calls | `program_id` | R&D calls can't link to programs |

### P2 Medium Priority (Nice to Have)

| # | Entity | Field | Impact |
|---|--------|-------|--------|
| 1 | policy_documents | `strategic_plan_ids[]` | Policies can't trace to strategy |
| 2 | global_trends | `strategic_plan_ids[]` | Trends can't inform strategy |
| 3 | sandboxes | `strategic_taxonomy_codes[]` | Advanced classification |
| 4 | living_labs | `research_priorities` | Research alignment |

---

## INTEGRATION QUALITY METRICS

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Direct Entity Coverage | 5/5 (100%) | 5/5 (100%) | ✅ None |
| Indirect Chain Coverage | 16/16 (100%) | 16/16 (100%) | ✅ None |
| AI Feature Count | 7/7 (100%) | 7/7 (100%) | ✅ None |
| Edge Function Count | 7/7 (100%) | 7/7 (100%) | ✅ None |
| Component Coverage | 18/20 (90%) | 20/20 (100%) | 2 generators |
| Form Integrations | 4/4 (100%) | 4/4 (100%) | ✅ None |
| **Overall Score** | **92%** | **100%** | **Phase 5-6** |

---

## REQUIRED DATABASE MIGRATIONS

### Migration 1: P0 Critical Fields

```sql
-- Add strategic fields to sandboxes
ALTER TABLE public.sandboxes
ADD COLUMN strategic_plan_ids uuid[] DEFAULT '{}',
ADD COLUMN strategic_objective_ids uuid[] DEFAULT '{}',
ADD COLUMN is_strategy_derived boolean DEFAULT false,
ADD COLUMN strategy_derivation_date timestamptz,
ADD COLUMN strategic_gaps_addressed text[] DEFAULT '{}',
ADD COLUMN strategic_taxonomy_codes text[] DEFAULT '{}';

-- Add strategic fields to living_labs
ALTER TABLE public.living_labs
ADD COLUMN strategic_plan_ids uuid[] DEFAULT '{}',
ADD COLUMN strategic_objective_ids uuid[] DEFAULT '{}',
ADD COLUMN is_strategy_derived boolean DEFAULT false,
ADD COLUMN strategy_derivation_date timestamptz,
ADD COLUMN research_priorities jsonb DEFAULT '[]',
ADD COLUMN strategic_taxonomy_codes text[] DEFAULT '{}';

-- Add missing columns to programs
ALTER TABLE public.programs
ADD COLUMN is_strategy_derived boolean DEFAULT false,
ADD COLUMN strategy_derivation_date timestamptz,
ADD COLUMN lessons_learned jsonb DEFAULT '[]';
```

### Migration 2: P1 High Priority Fields

```sql
-- Add strategic fields to partnerships
ALTER TABLE public.partnerships
ADD COLUMN strategic_plan_ids uuid[] DEFAULT '{}',
ADD COLUMN strategic_objective_ids uuid[] DEFAULT '{}';

-- Add campaign links
ALTER TABLE public.email_campaigns
ADD COLUMN program_id uuid REFERENCES public.programs(id),
ADD COLUMN challenge_id uuid REFERENCES public.challenges(id);

-- Add R&D path to scaling_plans
ALTER TABLE public.scaling_plans
ADD COLUMN rd_project_id uuid REFERENCES public.rd_projects(id);

-- Add program link to rd_calls
ALTER TABLE public.rd_calls
ADD COLUMN program_id uuid REFERENCES public.programs(id);
```

---

## OVERALL STATUS

| Dimension | Score | Status |
|-----------|-------|--------|
| Core Strategy System | 95% | ✅ |
| Direct Integration | 100% | ✅ Complete |
| Indirect Integration | 100% | ✅ Complete |
| Strategy Tools | 95% | ✅ |
| Form Integrations | 100% | ✅ Complete |
| **Platform Integration** | **92%** | 🔄 Phase 5-6 Pending |

---

*Integration matrix last updated: 2025-12-13 (Phase 1-4 COMPLETE)*
