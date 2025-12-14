# Strategy System - Implementation Tasks

**Generated:** 2025-12-14  
**Updated:** 2025-12-14 (Phase 1, 2 & 3 Implementation Complete)  
**Based on:** Code analysis of all 9 generators, Phase 1-3 integration  
**Priority:** Critical → High → Medium → Low

---

## EXECUTIVE SUMMARY

After Phase 1, 2 & 3 deep validation and implementation:

| Finding | Status | Impact |
|---------|--------|--------|
| Phase 1→2 data flow | ✅ FIXED | All preplanning data feeds into strategy creation |
| Strategy creation context | ✅ FIXED | Plans consider existing data, gaps identified |
| Duplicate prevention | ✅ FIXED | Objectives checked for similarity before save |
| Database schema gaps | ✅ FIXED | All required columns added to pilots, challenges, rd_calls, partnerships |
| Generator field gaps | ✅ FIXED | 6/9 generators now set all strategy tracking fields |
| Approval integration | 🟠 Pending | Phase 4 work |

---

## COMPLETED TASKS

### Phase 1 & 2 (100% Complete)

| Task ID | Description | Status | Date |
|---------|-------------|--------|------|
| TASK-P2-001 | Create useStrategyContext Hook | ✅ DONE | 2025-12-14 |
| TASK-P2-002 | Enhance StrategicPlanBuilder | ✅ DONE | 2025-12-14 |
| TASK-P2-003 | ObjectiveGenerator Deduplication | ✅ DONE | 2025-12-14 |
| TASK-P2-004 | Connect Preplanning to Creation | ✅ DONE | 2025-12-14 |
| TASK-P2-005 | Gap-Driven Recommendation | ✅ DONE | 2025-12-14 |

### Phase 3 Database Schema (100% Complete)

| Task ID | Description | Status | Date |
|---------|-------------|--------|------|
| TASK-DB-001 | Add strategy columns to `pilots` table | ✅ DONE | 2025-12-14 |
| TASK-DB-002 | Add strategy columns to `challenges` table | ✅ DONE | 2025-12-14 |
| TASK-DB-003 | Add `is_strategy_derived` to `partnerships` table | ✅ DONE | 2025-12-14 |
| TASK-DB-004 | Add strategy columns to `rd_calls` table | ✅ DONE | 2025-12-14 |

### Phase 3 Generator Fixes (100% Complete)

| Task ID | Description | Status | Date |
|---------|-------------|--------|------|
| TASK-GEN-001 | Fix StrategyChallengeGenerator | ✅ DONE | 2025-12-14 |
| TASK-GEN-002 | Fix StrategyToLivingLabGenerator | ✅ DONE | 2025-12-14 |
| TASK-GEN-003 | Fix StrategyToPilotGenerator | ✅ DONE | 2025-12-14 |
| TASK-GEN-004 | Fix StrategyToEventGenerator | ✅ DONE | 2025-12-14 |
| TASK-GEN-005 | Fix StrategyToPartnershipGenerator | ✅ DONE | 2025-12-14 |
| TASK-GEN-006 | Fix StrategyToRDCallGenerator | ✅ DONE | 2025-12-14 |

---

## CURRENT GENERATOR STATUS (All Fixed)

| Generator | File | `is_strategy_derived` | `strategy_derivation_date` | `strategic_plan_ids` | Status |
|-----------|------|:---------------------:|:--------------------------:|:--------------------:|--------|
| StrategyToProgramGenerator | `StrategyToProgramGenerator.jsx` | ✅ | ✅ | ✅ | **COMPLETE** |
| StrategyChallengeGenerator | `cascade/StrategyChallengeGenerator.jsx` | ✅ | ✅ | ✅ | **COMPLETE** |
| StrategyToPilotGenerator | `cascade/StrategyToPilotGenerator.jsx` | ✅ | ✅ | ✅ | **COMPLETE** |
| StrategyToLivingLabGenerator | `cascade/StrategyToLivingLabGenerator.jsx` | ✅ | ✅ | ✅ | **COMPLETE** |
| StrategyToEventGenerator | `cascade/StrategyToEventGenerator.jsx` | ✅ | ✅ | ✅ | **COMPLETE** |
| StrategyToPartnershipGenerator | `cascade/StrategyToPartnershipGenerator.jsx` | ✅ | ✅ | ✅ | **COMPLETE** |
| StrategyToRDCallGenerator | `cascade/StrategyToRDCallGenerator.jsx` | ✅ | ✅ | ✅ | **COMPLETE** |
| StrategyToPolicyGenerator | `cascade/StrategyToPolicyGenerator.jsx` | ❌ | ❌ | singular | **NEEDS FIX** |
| StrategyToCampaignGenerator | `cascade/StrategyToCampaignGenerator.jsx` | ❌ | ❌ | singular | **NEEDS FIX** |

---

## REMAINING TASKS

### TASK-GEN-007: Fix StrategyToPolicyGenerator & StrategyToCampaignGenerator
**Priority:** Medium  
**Effort:** 30 min  
**Status:** ⏳ Pending

**Issue:** Both use `strategic_plan_id` (singular) instead of `strategic_plan_ids` (array), and do not set derived flags.

---

### TASK-APPR-001: Create shared approval request hook
**Priority:** High  
**Effort:** 45 min  
**Status:** ⏳ Pending (Phase 4)

Create `src/hooks/useApprovalRequest.js` to automatically create approval requests when strategy-derived entities are saved.

---

### TASK-APPR-002: Integrate approval hook into generators
**Priority:** High  
**Effort:** 30 min  
**Status:** ⏳ Pending (Phase 4)

Update all cascade generators to call `createApprovalRequest` after successful entity save.

---

## DATABASE SCHEMA STATUS (After Migration)

| Table | `is_strategy_derived` | `strategy_derivation_date` | `strategic_plan_ids` | Status |
|-------|:---------------------:|:--------------------------:|:--------------------:|--------|
| `programs` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |
| `living_labs` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |
| `events` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |
| `sandboxes` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |
| `partnerships` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |
| `challenges` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |
| `pilots` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |
| `rd_calls` | ✅ | ✅ | ✅ ARRAY | **COMPLETE** |

---

## SUMMARY

**Phase 1:** 100% Complete - All 6 preplanning components store and feed data  
**Phase 2:** 100% Complete - Context-aware strategy creation with deduplication  
**Phase 3:** 95% Complete - 7/9 generators fully fixed, 2 pending minor fixes  
**Phase 4-8:** See phase-specific methodology docs for status
