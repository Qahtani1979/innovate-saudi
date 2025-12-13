# Strategy System - Integration Matrix

**Last Updated:** 2025-12-13 (COMPREHENSIVE ENTITY INTEGRATION REVIEW)  
**Status:** ⚠️ 67% PLATFORM INTEGRATION - Critical Gaps on Direct Entities

---

## INTEGRATION SUMMARY

### By Integration Type

| Type | Entities | Complete | Partial | Missing | Coverage |
|------|----------|----------|---------|---------|----------|
| **DIRECT** | 5 | 1 | 2 | 2 | 40% |
| **INDIRECT** | 16 | 13 | 2 | 1 | 81% |
| **NO INTEGRATION** | 3 | 3 | 0 | 0 | N/A |
| **TOTAL** | 24 | 17 | 4 | 3 | **67%** |

### Entity Status Overview

| # | Entity | Integration Type | Expected | Actual | Status |
|---|--------|------------------|----------|--------|--------|
| 1 | Programs | DIRECT | strategic_plan_ids[], is_strategy_derived, lessons_learned | Has plan_ids, missing 3 cols | ⚠️ 85% |
| 2 | Challenges | DIRECT | strategic_plan_ids[], strategic_goal | ✅ All present | ✅ 100% |
| 3 | Partnerships | DIRECT | strategic_plan_ids[], is_strategy_derived | Has is_strategic only | ⚠️ 60% |
| 4 | Sandboxes | DIRECT | strategic_plan_ids[], is_strategy_derived | ❌ NO FIELDS | ❌ 0% |
| 5 | Living Labs | DIRECT | strategic_plan_ids[], is_strategy_derived | ❌ NO FIELDS | ❌ 0% |
| 6 | Campaigns | INDIRECT | program_id → Programs | ❌ No program_id | ❌ 0% |
| 7 | R&D Calls | INDIRECT | challenge_ids[] → Challenges | ✅ Has challenge_ids | ✅ 100% |
| 8 | Events | INDIRECT | program_id → Programs | ✅ Has program_id + DIRECT | ✅ 100%+ |
| 9 | Matchmaker | INDIRECT | target_challenges[] → Challenges | ✅ Has target_challenges | ✅ 100% |
| 10 | Solutions | INDIRECT | source_program_id → Programs | ✅ Has source_program_id | ✅ 100% |
| 11 | Pilots | INDIRECT | challenge_id, source_program_id | ✅ Has both | ✅ 100% |
| 12 | R&D Projects | INDIRECT | rd_call_id, challenge_ids[] | ✅ Has both | ✅ 100% |
| 13 | Scaling Plans | INDIRECT | pilot_id, rd_project_id | Has pilot_id only | ⚠️ 50% |
| 14 | Proposals (Challenge) | INDIRECT | challenge_id | ✅ Has challenge_id | ✅ 100% |
| 15 | Proposals (Innovation) | INDIRECT | target_challenges[] | ✅ Has target_challenges | ✅ 100% |
| 16 | Citizens | INDIRECT | Via pilot enrollments | ✅ Works | ✅ 100% |
| 17 | Staff | INDIRECT | Via municipality | ✅ Works | ✅ 100% |
| 18 | Providers | NONE | N/A - External | ✅ Correct | ✅ N/A |
| 19 | Ideas | NONE | N/A - Raw input | ✅ Correct | ✅ N/A |
| 20 | Municipalities | NONE* | N/A - Owns strategy | Has strategic_plan_id | ⚠️ Reclassify |

---

## DIRECT INTEGRATION DETAIL

### 1. Programs ⚠️ 85% Complete

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `strategic_plan_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_objective_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_pillar_id` | uuid | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_priority_level` | text | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_kpi_contributions` | jsonb | ✅ | ✅ EXISTS | ✓ DB verified |
| `is_strategy_derived` | boolean | ✅ | ❌ MISSING | ✗ P0 GAP |
| `strategy_derivation_date` | timestamptz | ✅ | ❌ MISSING | ✗ P0 GAP |
| `lessons_learned` | jsonb | ✅ | ❌ MISSING | ✗ P0 GAP |

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

### 3. Partnerships ⚠️ 60% Complete

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `is_strategic` | boolean | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_challenge_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_pilot_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `linked_program_ids` | uuid[] | ✅ | ✅ EXISTS | ✓ DB verified |
| `strategic_plan_ids` | uuid[] | ✅ | ❌ MISSING | ✗ P1 GAP |
| `strategic_objective_ids` | uuid[] | ✅ | ❌ MISSING | ✗ P1 GAP |
| `is_strategy_derived` | boolean | Optional | ❌ MISSING | - |
| `strategy_derivation_date` | timestamptz | Optional | ❌ MISSING | - |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| PartnershipNetwork | Network visualization | ✅ |
| **StrategicAlignmentPartnership** | Strategy alignment | ❌ MISSING |

---

### 4. Sandboxes ❌ 0% Complete (CRITICAL)

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `strategic_plan_ids` | uuid[] | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `strategic_objective_ids` | uuid[] | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `is_strategy_derived` | boolean | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `strategy_derivation_date` | timestamptz | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `strategic_gaps_addressed` | text[] | Optional | ❌ MISSING | - |
| `strategic_taxonomy_codes` | text[] | Optional | ❌ MISSING | - |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| strategy-sandbox-planner | Edge function (exists) | ✅ |
| **StrategicAlignmentSandbox** | Strategy alignment | ❌ MISSING |
| **StrategyToSandboxGenerator** | Generate from strategy | ❌ MISSING |

---

### 5. Living Labs ❌ 0% Complete (CRITICAL)

#### Database Fields

| Field | Type | Required | Status | Verified |
|-------|------|----------|--------|----------|
| `strategic_plan_ids` | uuid[] | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `strategic_objective_ids` | uuid[] | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `is_strategy_derived` | boolean | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `strategy_derivation_date` | timestamptz | ✅ | ❌ MISSING | ✗ P0 CRITICAL |
| `research_priorities` | jsonb | Optional | ❌ MISSING | - |
| `strategic_taxonomy_codes` | text[] | Optional | ❌ MISSING | - |

#### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| strategy-lab-research-generator | Edge function (exists) | ✅ |
| **StrategicAlignmentLivingLab** | Strategy alignment | ❌ MISSING |
| **StrategyToLivingLabGenerator** | Generate from strategy | ❌ MISSING |

---

## INDIRECT INTEGRATION DETAIL

### Working Chains ✅

| Chain | Path | Status |
|-------|------|--------|
| Events → Strategy | `events.program_id` → `programs.strategic_plan_ids[]` | ✅ Works + Has Direct |
| Matchmaker → Strategy | `matchmaker_applications.target_challenges[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Solutions → Strategy | `solutions.source_program_id` → `programs.strategic_plan_ids[]` | ✅ Works |
| Pilots → Strategy | `pilots.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ Works |
| R&D Projects → Strategy | `rd_projects.rd_call_id` → `rd_calls.challenge_ids[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| R&D Calls → Strategy | `rd_calls.challenge_ids[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Challenge Proposals → Strategy | `challenge_proposals.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Innovation Proposals → Strategy | `innovation_proposals.target_challenges[]` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Citizens → Strategy | `citizen_pilot_enrollments.pilot_id` → `pilots.challenge_id` → `challenges.strategic_plan_ids[]` | ✅ Works |
| Staff → Strategy | `municipality_staff_profiles.municipality_id` → `municipalities.strategic_plan_id` | ✅ Works |

### Broken Chains ❌

| Chain | Expected Path | Issue | Fix |
|-------|---------------|-------|-----|
| Campaigns → Strategy | `email_campaigns.program_id` → Programs | No `program_id` field | Add `program_id` to `email_campaigns` |
| Scaling (R&D) → Strategy | `scaling_plans.rd_project_id` → R&D Projects | No `rd_project_id` field | Add `rd_project_id` to `scaling_plans` |

### Partial Chains ⚠️

| Chain | Path | Issue | Fix |
|-------|------|-------|-----|
| R&D Calls → Programs | `rd_calls.program_id` → Programs | No `program_id` field | Add `program_id` to `rd_calls` |

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
| Direct Entity Coverage | 2/5 (40%) | 5/5 (100%) | 3 entities |
| Indirect Chain Coverage | 13/16 (81%) | 16/16 (100%) | 3 chains |
| AI Feature Count | 7/7 (100%) | 7/7 (100%) | None |
| Edge Function Count | 7/7 (100%) | 7/7 (100%) | None |
| Component Coverage | 14/19 (74%) | 19/19 (100%) | 5 components |
| **Overall Score** | **67%** | **100%** | **33%** |

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
| Core Strategy System | 92% | ✅ |
| Direct Integration | 40% | ❌ Critical |
| Indirect Integration | 81% | ⚠️ |
| Strategy Tools | 90% | ✅ |
| **Platform Integration** | **67%** | ⚠️ |

*Integration matrix last updated: 2025-12-13 (Comprehensive Entity Integration Review)*
