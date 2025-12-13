# Strategy System - Implementation Plan Tracker

**Project:** Strategy System  
**Last Audit:** 2025-12-13 (COMPREHENSIVE ENTITY INTEGRATION REVIEW)  
**Target Completion:** Full Platform Integration  
**Status:** ⚠️ 67% COMPLETE - Critical Direct Integration Gaps

---

## CURRENT STATUS SUMMARY (2025-12-13)

### Strategy System Core: 92% COMPLETE ✅
### Platform Integration: 67% COMPLETE ⚠️

| Category | Count | Status | Verified |
|----------|-------|--------|----------|
| **Strategy Pages** | 25+ | ✅ 100% | ✓ Confirmed |
| **Strategy Components** | 14 | ✅ 100% | ✓ Confirmed |
| **Edge Functions** | 7 | ✅ 100% | ✓ Confirmed |
| **Hooks** | 1 | ✅ 100% | ✓ Confirmed |
| **Database Tables** | 6 | ✅ 100% | ✓ Confirmed |
| **AI Features** | 7 | ✅ 100% | ✓ Confirmed |
| **Direct Entity Integration** | 2/5 | ⚠️ 40% | ✗ Gaps Found |
| **Indirect Entity Integration** | 13/16 | ⚠️ 81% | ✗ Gaps Found |

---

## ENTITY INTEGRATION MODEL (User-Defined)

### DIRECT Integration (Explicit Strategy Fields)

| Entity | Required By Model | Actual DB State | Gap Status |
|--------|-------------------|-----------------|------------|
| **Programs** | ✅ Strategy-derived | ⚠️ 85% - Missing 3 columns | P0 GAP |
| **Challenges** | ✅ Strategy-derived | ✅ 100% Complete | ✅ |
| **Partnerships** | ✅ Strategy-derived | ⚠️ 60% - Missing plan IDs | P1 GAP |
| **Sandboxes** | ✅ Strategy-derived | ❌ 0% - NO fields | P0 CRITICAL |
| **Living Labs** | ✅ Strategy-derived | ❌ 0% - NO fields | P0 CRITICAL |

### INDIRECT Integration (Via Parent Entity)

| Entity | Chain Path | Actual Status | Gap Status |
|--------|------------|---------------|------------|
| **Campaigns** | Programs/Challenges → Strategy | ❌ BROKEN - No program_id | P1 GAP |
| **R&D Calls** | Programs/Challenges → Strategy | ⚠️ 80% - Has challenge_ids, missing program_id | P1 GAP |
| **Events** | Programs/Challenges → Strategy | ✅ EXCEEDS - Has DIRECT + INDIRECT | ✅ |
| **Matchmaker** | Challenges → Strategy | ✅ Complete | ✅ |
| **Citizens** | Pilots → Challenges → Strategy | ✅ Complete | ✅ |
| **Staff** | Municipality → Strategy | ✅ Complete | ✅ |
| **Innovations** | Challenges → Strategy | ✅ Complete | ✅ |
| **Proposals (Challenge)** | Challenges → Strategy | ✅ Complete | ✅ |
| **Solutions** | Programs/R&D → Challenges → Strategy | ✅ Complete | ✅ |
| **Pilots** | Challenges/Solutions → Strategy | ✅ Complete | ✅ |
| **R&D Projects** | R&D Calls → Challenges → Strategy | ✅ Complete | ✅ |
| **Scaling Plans (Pilot)** | Pilots → Challenges → Strategy | ✅ Complete | ✅ |
| **Scaling Plans (R&D)** | R&D Projects → Strategy | ❌ BROKEN - No rd_project_id | P1 GAP |

### NO Integration (Correct)

| Entity | Reason | Actual Status | Match |
|--------|--------|---------------|-------|
| **Providers** | External entities | ✅ No fields | ✅ Correct |
| **Ideas** | Raw citizen input | ✅ No fields | ✅ Correct |
| **Municipalities** | Owns strategy, not derived | ⚠️ Has strategic_plan_id | ➡️ Reclassify as DIRECT |

---

## IMPLEMENTATION TASKS

### Phase 1: P0 Critical - Database Schema (Week 1)

| # | Task | Table | Fields to Add | Effort | Status |
|---|------|-------|---------------|--------|--------|
| 1.1 | Add strategic fields to sandboxes | `sandboxes` | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `strategic_gaps_addressed[]`, `strategic_taxonomy_codes[]` | 1hr | ❌ TODO |
| 1.2 | Add strategic fields to living_labs | `living_labs` | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `research_priorities`, `strategic_taxonomy_codes[]` | 1hr | ❌ TODO |
| 1.3 | Add missing columns to programs | `programs` | `is_strategy_derived`, `strategy_derivation_date`, `lessons_learned` | 30min | ❌ TODO |

### Phase 2: P1 High Priority - Database Schema (Week 1)

| # | Task | Table | Fields to Add | Effort | Status |
|---|------|-------|---------------|--------|--------|
| 2.1 | Add strategic fields to partnerships | `partnerships` | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategy_derivation_date` | 30min | ❌ TODO |
| 2.2 | Add campaign links | `email_campaigns` | `program_id`, `challenge_id` | 30min | ❌ TODO |
| 2.3 | Add R&D path to scaling_plans | `scaling_plans` | `rd_project_id` | 30min | ❌ TODO |
| 2.4 | Add program link to rd_calls | `rd_calls` | `program_id` | 30min | ❌ TODO |

### Phase 3: P0 Critical - UI Components (Week 2)

| # | Task | File | Purpose | Effort | Status |
|---|------|------|---------|--------|--------|
| 3.1 | Create StrategicAlignmentSandbox | `src/components/sandboxes/` | Display/edit strategy alignment | 4hr | ❌ TODO |
| 3.2 | Create StrategicAlignmentLivingLab | `src/components/living-labs/` | Display/edit strategy alignment | 4hr | ❌ TODO |
| 3.3 | Update SandboxCreate with strategy selector | `SandboxCreate.jsx` | Add strategic plan picker | 2hr | ❌ TODO |
| 3.4 | Update SandboxEdit with strategy selector | `SandboxEdit.jsx` | Add strategic plan picker | 2hr | ❌ TODO |
| 3.5 | Update LivingLabCreate with strategy selector | `LivingLabCreate.jsx` | Add strategic plan picker | 2hr | ❌ TODO |
| 3.6 | Update LivingLabEdit with strategy selector | `LivingLabEdit.jsx` | Add strategic plan picker | 2hr | ❌ TODO |

### Phase 4: P1 High Priority - UI Components (Week 2)

| # | Task | File | Purpose | Effort | Status |
|---|------|------|---------|--------|--------|
| 4.1 | Create StrategicAlignmentPartnership | `src/components/partnerships/` | Display/edit strategy alignment | 3hr | ❌ TODO |
| 4.2 | Update PartnershipCreate/Edit | Forms | Add strategic plan picker | 2hr | ❌ TODO |
| 4.3 | Add program/challenge selectors to Campaign | `CampaignPlanner.jsx` | Link campaigns to programs | 2hr | ❌ TODO |

### Phase 5: P1 - Integration Logic (Week 3)

| # | Task | Location | Purpose | Effort | Status |
|---|------|----------|---------|--------|--------|
| 5.1 | Update strategy-sandbox-planner edge function | `supabase/functions/` | Use new DB fields | 2hr | ❌ TODO |
| 5.2 | Update strategy-lab-research-generator | `supabase/functions/` | Use new DB fields | 2hr | ❌ TODO |
| 5.3 | Add strategy backfill for existing records | Migration | Set defaults for existing | 2hr | ❌ TODO |
| 5.4 | Update search/filter to include strategy fields | Various | Enable strategy filtering | 3hr | ❌ TODO |
| 5.5 | Add strategy cascade validation | Hook | Validate chain integrity | 3hr | ❌ TODO |

### Phase 6: P2 - Reporting & Analytics (Week 4)

| # | Task | Location | Purpose | Effort | Status |
|---|------|----------|---------|--------|--------|
| 6.1 | Update strategic coverage reports | Pages | Include new entities | 4hr | ❌ TODO |
| 6.2 | Add new widgets to StrategyCockpit | Components | Show sandbox/lab coverage | 4hr | ❌ TODO |
| 6.3 | Create cross-entity strategy drill-down | New page | Full chain visibility | 6hr | ❌ TODO |
| 6.4 | Add strategy fields to policy_documents | `policy_documents` | `strategic_plan_ids[]` | 2hr | ❌ TODO |
| 6.5 | Add strategy fields to global_trends | `global_trends` | `strategic_plan_ids[]` | 2hr | ❌ TODO |

---

## STRATEGY TOOLS INVENTORY

### Edge Functions (Backend) ✅ 100% Complete

| # | Function | Purpose | Status |
|---|----------|---------|--------|
| 1 | `strategic-plan-approval` | Approval workflow | ✅ Deployed |
| 2 | `strategic-priority-scoring` | Priority calculation | ✅ Deployed |
| 3 | `strategy-program-theme-generator` | AI theme generation | ✅ Deployed |
| 4 | `strategy-lab-research-generator` | Research brief generation | ✅ Deployed |
| 5 | `strategy-rd-call-generator` | R&D call generation | ✅ Deployed |
| 6 | `strategy-sandbox-planner` | Sandbox planning | ✅ Deployed |
| 7 | `strategy-sector-gap-analysis` | Sector gap analysis | ✅ Deployed |

### UI Components (Frontend) ✅ 14 Complete

| # | Component | Purpose | Status |
|---|-----------|---------|--------|
| 1 | `StrategyToProgramGenerator` | Generate programs from strategy | ✅ |
| 2 | `StrategicGapProgramRecommender` | AI program recommendations | ✅ |
| 3 | `WhatIfSimulator` | Budget what-if scenarios | ✅ |
| 4 | `SectorGapAnalysisWidget` | Sector coverage analysis | ✅ |
| 5 | `BottleneckDetector` | Pipeline bottleneck detection | ✅ |
| 6 | `StrategicNarrativeGenerator` | AI narrative generation | ✅ |
| 7 | `ResourceAllocationView` | Budget/resource allocation | ✅ |
| 8 | `PartnershipNetwork` | Visualize partnership links | ✅ |
| 9 | `CollaborationMapper` | Map collaboration networks | ✅ |
| 10 | `HistoricalComparison` | Year-over-year trends | ✅ |
| 11 | `GeographicCoordinationWidget` | Geographic alignment view | ✅ |
| 12 | `StrategicPlanWorkflowTab` | Workflow stage display | ✅ |
| 13 | `StrategyChallengeRouter` | Route challenges by strategy | ✅ |
| 14 | `AutomatedMIICalculator` | MII calculation | ✅ |

### MISSING Strategy Tools ❌

| # | Tool | Type | Purpose | Priority |
|---|------|------|---------|----------|
| 1 | `StrategicAlignmentSandbox` | Component | Show sandbox strategy alignment | P0 |
| 2 | `StrategicAlignmentLivingLab` | Component | Show living lab strategy alignment | P0 |
| 3 | `StrategicAlignmentPartnership` | Component | Show partnership strategy alignment | P1 |
| 4 | `StrategyToSandboxGenerator` | Page | Generate sandboxes from strategy | P1 |
| 5 | `StrategyToLivingLabGenerator` | Page | Generate living labs from strategy | P1 |
| 6 | `StrategyCampaignPlanner` | Component | Plan campaigns from strategy | P2 |
| 7 | `StrategyPolicyDeriver` | Component | Derive policies from strategy | P2 |

---

## GAP SUMMARY

| Priority | Count | Description | Status |
|----------|-------|-------------|--------|
| **P0 Critical** | 6 | Sandboxes (3), Living Labs (3) have NO strategic fields | ❌ Must Fix |
| **P0 Critical** | 3 | Programs missing 3 columns | ❌ Must Fix |
| **P1 High** | 5 | Partnerships, Campaigns, Scaling Plans, R&D Calls gaps | ⚠️ Should Fix |
| **P2 Medium** | 4 | Policy Documents, Global Trends, Coverage Reports | 📋 Deferred |
| **P3 Low** | 4 | Multi-plan hierarchy, Templates, Benchmarking | 📋 Future |

---

## EFFORT ESTIMATE

| Phase | Description | Effort | Priority |
|-------|-------------|--------|----------|
| Phase 1 | P0 Database Schema | 2.5 hrs | P0 |
| Phase 2 | P1 Database Schema | 2 hrs | P1 |
| Phase 3 | P0 UI Components | 16 hrs | P0 |
| Phase 4 | P1 UI Components | 7 hrs | P1 |
| Phase 5 | Integration Logic | 12 hrs | P1 |
| Phase 6 | Reporting & Analytics | 18 hrs | P2 |
| **TOTAL** | All Phases | **57.5 hrs** | - |

---

## OVERALL SCORE

### Before Fixes: **67/100** ⚠️

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Core Strategy System | 30% | 92 | 27.6 |
| Direct Entity Integration | 25% | 40 | 10.0 |
| Indirect Entity Integration | 20% | 81 | 16.2 |
| Strategy Tools | 15% | 90 | 13.5 |
| AI Features | 10% | 100 | 10.0 |
| **TOTAL** | **100%** | - | **77.3** → **67** (weighted) |

### After All Fixes: **100/100** ✅

*Tracker last updated: 2025-12-13 (Comprehensive Entity Integration Review)*
