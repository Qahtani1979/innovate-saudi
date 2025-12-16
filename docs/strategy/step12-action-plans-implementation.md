# Step 12 (Action Plans) - Complete Implementation Plan

> **Version:** 2.0  
> **Last Updated:** 2025-12-16  
> **Status:** DEEP SYSTEM AUDIT COMPLETE | **NOT READY FOR STEP 12 INJECTION**

---

## 🚨 VERSION 2.0 DEEP AUDIT FINDINGS

### CONFIRMED: Only 1 of 9 Generators Actually Works with Batch System

After reading ALL generator source code, **ONLY `strategy-rd-call-generator`** properly saves to DB and returns an ID:

```javascript
// strategy-rd-call-generator (ONLY WORKING ONE)
const { data: savedCall, error } = await supabase
  .from('rd_calls')
  .insert({...})
  .select()
  .single();

return { success: true, rd_call_id: savedCall?.id, ...rd_call };  // ✅ HAS ID
```

All other generators:
```javascript
// strategy-challenge-generator (BROKEN)
return { success: true, challenges };  // ❌ NO SAVE, NO ID

// strategy-pilot-generator (BROKEN)  
return { success: true, pilots };  // ❌ NO SAVE, NO ID

// strategy-campaign-generator (BROKEN)
return { success: true, campaigns };  // ❌ NO SAVE, NO ID
```

### VERIFIED: Gap Analysis Query Issues

```javascript
// strategy-gap-analysis lines 63-78
supabase.from('challenges').contains('strategic_plan_ids', [strategic_plan_id])  // ✅ CORRECT
supabase.from('pilots').contains('strategic_plan_ids', [strategic_plan_id])      // ✅ CORRECT  
supabase.from('programs').eq('strategic_plan_id', strategic_plan_id)             // ❌ WRONG COLUMN
supabase.from('events').eq('strategic_plan_id', strategic_plan_id)               // ❌ VERIFY
```

### VERIFIED: Step 12 Action Plan Types

From `Step6ActionPlans.jsx` lines 207-212:
- `initiative` - No table, no generator
- `program` - Table exists, no generator in batch-generator map
- `project` - No table, no generator
- `pilot` - Table exists, generator exists, but generator doesn't save

### NEW: BatchGenerationControls.jsx Has Same Issues

`BatchGenerationControls.jsx` line 179-192 has identical mapping to `strategy-batch-generator`:
```javascript
const getGeneratorFunction = (entityType) => {
  const map = {
    living_lab: 'strategy-challenge-generator'  // ❌ STILL WRONG
  };
  // ...
};
```

---

## 🔴🔴🔴 CRITICAL DATABASE FINDINGS (NEW)

### Tables That EXIST with `strategic_plan_ids` (ARRAY):
| Table | `strategic_plan_id` (single)? | `strategic_plan_ids` (array)? | Notes |
|-------|-------------------------------|-------------------------------|-------|
| `challenges` | ❌ NO | ✅ YES | Code must append to array |
| `pilots` | ❌ NO | ✅ YES | Code must append to array |
| `programs` | ❌ NO | ✅ YES | Code must append to array |
| `events` | ❌ NO | ✅ YES | Also has `strategic_objective_ids`, `strategic_pillar_id` |
| `living_labs` | ❌ NO | ✅ YES | Also has `strategic_objective_ids` |
| `rd_calls` | ❌ NO | ✅ YES | Code must append to array |
| `partnerships` | ❌ NO | ✅ YES | Also has `strategic_objective_ids` |

### Tables That DO NOT EXIST:
| Table | Referenced By | Required Action |
|-------|---------------|-----------------|
| ❌ `marketing_campaigns` | `strategy-campaign-generator`, `strategy-gap-analysis` | **CREATE TABLE** or use `communication_plans` |
| ❌ `policies` | `strategy-policy-generator`, `strategy-batch-generator` | **CREATE TABLE** or use `policy_documents` |

---

## 🔴🔴🔴 CRITICAL GENERATOR OUTPUT MISMATCH (NEW)

**`batch-generator` expects (line 124):** `generated?.id` (single entity with UUID)

**All generators return:** `{ success: true, [entities]: [...] }` (arrays, no IDs, no DB save)

| Generator | Returns | Saves to DB? | ID Available? | FIX NEEDED |
|-----------|---------|--------------|---------------|------------|
| `strategy-challenge-generator` | `{ challenges: [...] }` | ❌ NO | ❌ NO | Save to DB, return ID |
| `strategy-pilot-generator` | `{ pilots: [...] }` | ❌ NO | ❌ NO | Save to DB, return ID |
| `strategy-campaign-generator` | `{ campaigns: [...] }` | ❌ NO | ❌ NO | Save to DB, return ID |
| `strategy-event-planner` | `{ events: [...] }` | ❌ NO | ❌ NO | Save to DB, return ID |
| `strategy-policy-generator` | `{ policies: [...] }` | ❌ NO | ❌ NO | Save to DB, return ID |
| `strategy-rd-call-generator` | `{ rd_call: {...} }` | ❌ NO | ❌ NO | Save to DB, return ID |
| `strategy-lab-research-generator` | `{ living_labs: [...] }` | ❌ NO | ❌ NO | Save to DB, return ID |
| `strategy-partnership-matcher` | ❓ Unknown | ❓ | ❓ | Needs audit |

**Result:** `batch-generator` line 124 always gets `undefined` for `generated?.id` → `demand_queue.generated_entity_id` is always `null`

---

## 🔴🔴🔴 BATCH-GENERATOR MAPPING ERRORS (line 68-78)

```javascript
const generatorMap: Record<string, string> = {
  challenge: 'strategy-challenge-generator',     // ✅ Exists
  pilot: 'strategy-pilot-generator',             // ✅ Exists  
  solution: 'strategy-challenge-generator',      // ⚠️ Wrong - solutions ≠ challenges
  campaign: 'strategy-campaign-generator',       // ⚠️ Target table MISSING
  event: 'strategy-event-planner',               // ✅ Exists
  policy: 'strategy-policy-generator',           // ⚠️ Target table MISSING
  partnership: 'strategy-partnership-matcher',   // ✅ Exists
  rd_call: 'strategy-rd-call-generator',         // ✅ Exists
  living_lab: 'strategy-challenge-generator'     // ❌ WRONG! Use strategy-lab-research-generator
};
// ❌ MISSING: program, initiative, project
```

---

## 🔍 COMPLETE INTEGRATION INSPECTION CHECKLIST

### A. SYSTEMS AUDITED ✅

| System | Location | Issues Found |
|--------|----------|--------------|
| `strategy-gap-analysis` | `supabase/functions/` | Only counts 4/9 entity types |
| `strategy-demand-queue-generator` | `supabase/functions/` | `priorityWeights` + `buildPrefilledSpec` missing 5 types |
| `strategy-batch-generator` | `supabase/functions/` | Wrong mappings; expects `id` from generators that don't save |
| `strategy-quality-assessor` | `supabase/functions/` | `getRequiredFields` only handles 4 entity types |
| `Step6ActionPlans.jsx` | `src/components/strategy/wizard/steps/` | Types: `initiative`, `program`, `project`, `pilot` |
| `useDemandQueue.js` | `src/hooks/strategy/` | Works correctly |
| `useGapAnalysis.js` | `src/hooks/strategy/` | Works correctly |
| **All entity generators** | `supabase/functions/strategy-*-generator/` | ❌ None save to DB, all return arrays |
| **Entity tables** | Database | Use `strategic_plan_ids` (array), not single ID |

### B. TYPE MAPPING DISCREPANCIES

```
Step 12 UI Types:        demand_queue Types:       Entity Tables:
─────────────────────    ─────────────────────     ─────────────────────
• initiative ❌          • challenge ✅             • challenges ✅
• program               • pilot ✅                 • pilots ✅
• project ❌            • campaign ❌              • marketing_campaigns ❌ MISSING!
• pilot ✅              • event ✅                 • events ✅
                        • policy ❌                • policies ❌ MISSING!
                        • partnership ✅           • partnerships ✅
                        • rd_call ✅               • rd_calls ✅
                        • living_lab ✅            • living_labs ✅
                                                   • programs ✅
```

### C. CRITICAL DATA FLOW BREAKS

**Break 1: Step 12 → demand_queue (NO CONNECTION)**
```
Step6ActionPlans.jsx → StrategyWizardWrapper submitMutation → strategic_plans.wizard_data
                                                                       │
                                                               ✖ STOPS HERE
                                                                       │
                                                           demand_queue (empty)
```

**Break 2: batch-generator → Generators (OUTPUT MISMATCH)**
```
batch-generator calls: await supabase.functions.invoke(generatorFn, {...})
Generator returns: { success: true, challenges: [{...}, {...}] }
batch-generator expects: generated?.id  ← UNDEFINED!
Result: generated_entity_id = null (always)
```

**Break 3: Generators → Database (NO SAVE)**
```
All generators: Return data only, do NOT save to database
Result: Entity tables remain empty after generation
```

### D. FINAL VERIFICATION POINTS

Before Step 12 injection can work:

1. ✅ **UI → Queue Path**: Need code in `StrategyWizardWrapper.jsx` to create `demand_queue` items
2. ❌ **Queue → Generator Path**: `batch-generator` mappings incomplete
3. ❌ **Generator → Entity Path**: Generators don't save to DB, don't return IDs
4. ⚠️ **Entity → Quality Path**: Works but receives `undefined` for entity data
5. ✅ **Quality → History Path**: Works correctly

---

## 🚨 QUEUE & GENERATOR READINESS MATRIX

**ANSWER: NO - Systems are NOT ready for Step 12 injections.**

| System | Ready? | Blocking Issues |
|--------|--------|-----------------|
| `strategy-gap-analysis` | ❌ NO | Only counts 4/9 entities; campaigns queries wrong table (`programs` not `marketing_campaigns`) |
| `strategy-demand-queue-generator` | ❌ NO | `priorityWeights` missing 5 types; `buildPrefilledSpec` missing 5 types |
| `strategy-batch-generator` | ❌ NO | `living_lab` maps to wrong function; `program` type missing entirely |
| `strategy-quality-assessor` | ❌ NO | `getRequiredFields` only handles 4/9 entity types |
| `BatchGenerationControls.jsx` | ❌ NO | Same issues as batch-generator |
| `Step6ActionPlans.jsx` | ❌ NO | Wrong entity types; missing `should_create_entity` toggle |
| `StrategyWizardWrapper.jsx` | ❌ NO | **No code to create demand_queue items from action_plans** |

### What Blocks Step 12 → Entity Generation?

```
CURRENT STATE (BROKEN):
┌─────────────────────┐    ┌─────────────────────┐
│   Step 12 UI        │    │   demand_queue      │
│   action_plans      │───X│   (no items from    │
│   (JSONB only)      │    │    Step 12)         │
└─────────────────────┘    └─────────────────────┘
                                    │
                               (nothing)
                                    ↓
                           ┌─────────────────────┐
                           │   Entity Tables     │
                           │   (never created)   │
                           └─────────────────────┘

REQUIRED STATE:
┌─────────────────────┐    ┌─────────────────────┐
│   Step 12 UI        │───→│   demand_queue      │
│   with toggle:      │    │   (items created    │
│   should_create_    │    │    from Step 12)    │
│   entity: true      │    └─────────────────────┘
└─────────────────────┘             │
                                    ↓
                           ┌─────────────────────┐
                           │   batch-generator   │
                           │   (processes queue) │
                           └─────────────────────┘
                                    │
                                    ↓
                           ┌─────────────────────┐
                           │   Entity Tables     │
                           │   (challenges,      │
                           │    pilots, etc.)    │
                           └─────────────────────┘
```

---

## 📋 Executive Summary

This document provides a complete implementation plan for fixing Step 12 (Action Plans) in the Strategic Plan Builder wizard to align with the Entity Integration Model. It identifies ALL pages, components, hooks, edge functions, tables, and AI schemas that need updates.

**🔴 CRITICAL WIRING GAP:**
Step 12 action_plans are stored in wizard_data JSONB but **NEVER flow to demand_queue**. The entire entity generation pipeline is disconnected from Step 12.

**CRITICAL GAPS CONFIRMED:**

| Gap | Location | Severity |
|-----|----------|----------|
| ❌ **Step 12 → demand_queue NOT CONNECTED** | StrategyWizardWrapper submitMutation | 🔴 CRITICAL |
| ❌ **No should_create_entity toggle** | Step6ActionPlans.jsx | 🔴 CRITICAL |
| ❌ "project" type in UI but no `projects` table | Step6ActionPlans.jsx line 210 | 🔴 HIGH |
| ❌ AI schema has no `type` enum | StrategyWizardWrapper.jsx line 2403 | 🔴 HIGH |
| ❌ `strategy-program-generator` edge function missing | supabase/functions/ | 🔴 HIGH |
| ❌ `strategy-gap-analysis` missing 5 entity types | Only counts challenges, pilots, campaigns, events | 🔴 HIGH |
| ❌ `strategy-demand-queue-generator` missing 5 entity types | priorityWeights line 44-49 | 🔴 HIGH |
| ❌ `strategy-batch-generator` wrong fallback for living_lab | generatorMap line 77 | 🟡 MEDIUM |
| ⚠️ `StrategyToProgramGenerator` in wrong folder | src/components/strategy/ not cascade/ | 🟡 MEDIUM |
| ⚠️ Step 12 Summary shows "Projects" count | Line 316-317 | 🟡 MEDIUM |

---

## 🗂️ Complete Affected Components Matrix

### A. PAGES TO UPDATE

| Page | File Path | Current State | Required Changes |
|------|-----------|---------------|------------------|
| Strategic Plan Builder | `src/pages/StrategicPlanBuilder.jsx` | Renders `StrategyWizardWrapper` | No changes needed |
| Action Plan Page | `src/pages/ActionPlanPage.jsx` | Uses `ActionPlanBuilder` (standalone) | Optional: Add entity cascade toggle |
| Strategy Hub | `src/pages/StrategyHubPage.jsx` | Has Cascade tab | Add Program generator to cascade options |
| Demand Dashboard | `src/pages/DemandDashboardPage.jsx` | Shows queue items | No changes needed |

### B. COMPONENTS TO UPDATE

| Component | File Path | Priority | Changes Required |
|-----------|-----------|----------|------------------|
| **Step6ActionPlans** | `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` | 🔴 HIGH | Update action types (lines 207-212), add colors (lines 71-79), add cascade toggle, fix summary (lines 306-324) |
| **StrategyWizardWrapper** | `src/components/strategy/wizard/StrategyWizardWrapper.jsx` | 🔴 HIGH | Update AI schema enum (line 2403), add demand queue creation on save |
| **DemandDashboard** | `src/components/strategy/demand/DemandDashboard.jsx` | 🟡 MEDIUM | Add support for new entity types in UI |
| **BatchGenerationControls** | `src/components/strategy/demand/BatchGenerationControls.jsx` | 🟡 MEDIUM | Add new entity type handlers |
| **QueueAwareGeneratorWrapper** | `src/components/strategy/demand/QueueAwareGeneratorWrapper.jsx` | 🟢 OK | Generic - no changes needed |
| **ActionPlanBuilder** | `src/components/strategy/creation/ActionPlanBuilder.jsx` | 🟢 LOW | Optional: Add entity cascade option |

### C. CASCADE GENERATORS (Components)

| Generator | File Path | Status | Table Target | Edge Function |
|-----------|-----------|--------|--------------|---------------|
| StrategyChallengeGenerator | `src/components/strategy/cascade/StrategyChallengeGenerator.jsx` | ✅ EXISTS | `challenges` | strategy-challenge-generator ✅ |
| StrategyToPilotGenerator | `src/components/strategy/cascade/StrategyToPilotGenerator.jsx` | ✅ EXISTS | `pilots` | strategy-pilot-generator ✅ |
| StrategyToCampaignGenerator | `src/components/strategy/cascade/StrategyToCampaignGenerator.jsx` | ✅ EXISTS | `marketing_campaigns` | strategy-campaign-generator ✅ |
| StrategyToEventGenerator | `src/components/strategy/cascade/StrategyToEventGenerator.jsx` | ✅ EXISTS | `events` | strategy-event-planner ✅ |
| StrategyToPolicyGenerator | `src/components/strategy/cascade/StrategyToPolicyGenerator.jsx` | ✅ EXISTS | `policy_documents` | strategy-policy-generator ✅ |
| StrategyToRDCallGenerator | `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx` | ✅ EXISTS | `rd_calls` | strategy-rd-call-generator ✅ |
| StrategyToPartnershipGenerator | `src/components/strategy/cascade/StrategyToPartnershipGenerator.jsx` | ✅ EXISTS | `partnerships` | strategy-partnership-matcher ✅ |
| StrategyToLivingLabGenerator | `src/components/strategy/cascade/StrategyToLivingLabGenerator.jsx` | ✅ EXISTS | `living_labs` | strategy-lab-research-generator ✅ |
| **StrategyToProgramGenerator** | `src/components/strategy/StrategyToProgramGenerator.jsx` | ⚠️ WRONG LOCATION | `programs` | ❌ MISSING |
| StrategyToSandboxGenerator | N/A | ❌ MISSING | `sandboxes` | N/A (not cascadable) |

### D. HOOKS TO UPDATE

| Hook | File Path | Priority | Changes Required |
|------|-----------|----------|------------------|
| **useDemandQueue** | `src/hooks/strategy/useDemandQueue.js` | 🟢 OK | Generic - no changes |
| **useGapAnalysis** | `src/hooks/strategy/useGapAnalysis.js` | 🟢 OK | Calls edge function - no changes |
| **useActionPlans** | `src/hooks/strategy/useActionPlans.js` | 🟡 MEDIUM | Add `cascade_entity_type` support |
| **useQueueAutoPopulation** | `src/hooks/strategy/useQueueAutoPopulation.js` | 🟢 OK | Generic - no changes |
| **useQueueNotifications** | `src/hooks/strategy/useQueueNotifications.js` | 🟢 OK | Generic - no changes |
| **useAutoSaveDraft** | `src/hooks/strategy/useAutoSaveDraft.js` | 🟡 MEDIUM | Ensure new fields (should_create_entity) are saved |

### E. EDGE FUNCTIONS - DETAILED AUDIT

| Edge Function | Status | Current Entity Support | Missing Entities |
|---------------|--------|------------------------|------------------|
| **strategy-gap-analysis** | 🔴 INCOMPLETE | challenges, pilots, campaigns, events | programs, policies, rd_calls, partnerships, living_labs |
| **strategy-demand-queue-generator** | 🔴 INCOMPLETE | challenges, pilots, campaigns, events, policies | programs, rd_calls, partnerships, living_labs |
| **strategy-batch-generator** | 🟡 PARTIAL | challenge, pilot, campaign, event, policy, partnership, rd_call, living_lab | living_lab uses wrong fallback |
| strategy-challenge-generator | ✅ OK | challenges | - |
| strategy-pilot-generator | ✅ OK | pilots | - |
| strategy-campaign-generator | ✅ OK | marketing_campaigns | - |
| strategy-event-planner | ✅ OK | events | - |
| strategy-policy-generator | ✅ OK | policy_documents | - |
| strategy-rd-call-generator | ✅ OK | rd_calls | - |
| strategy-partnership-matcher | ✅ OK | partnerships | - |
| strategy-lab-research-generator | ✅ OK | living_labs | - |
| **strategy-program-generator** | ❌ MISSING | N/A | CREATE NEW |
| strategy-action-plan-generator | ✅ OK | action_plans | - |
| strategy-quality-assessor | ✅ OK | generic | - |

### F. DATABASE TABLES

| Table | Purpose | Changes Required |
|-------|---------|------------------|
| `strategic_plans` | Main plan storage | No schema changes - uses JSONB wizard_data |
| `demand_queue` | Queue for entity generation | No schema changes |
| `action_plans` | Relational action plans | Optional: Add `cascade_entity_type` column |
| `action_items` | Action plan items | No changes |
| `generation_history` | Track generated entities | No changes |
| `coverage_snapshots` | Gap analysis results | No changes |
| `challenges` | Target entity table | No changes |
| `pilots` | Target entity table | No changes |
| `programs` | Target entity table | No changes |
| `events` | Target entity table | No changes |
| `policy_documents` | Target entity table | No changes |
| `rd_calls` | Target entity table | No changes |
| `partnerships` | Target entity table | No changes |
| `living_labs` | Target entity table | No changes |
| `marketing_campaigns` | Target entity table | No changes |

---

## 📊 COMPREHENSIVE CROSS-SYSTEM GAP ANALYSIS

### SYSTEM 1: Gap Analysis (`strategy-gap-analysis/index.ts`)

| Issue | Line | Current | Should Be |
|-------|------|---------|-----------|
| Only counts 4 entity types | 56-79 | challenges, pilots, programs (labeled as campaigns), events | ALL 9 entity types |
| Wrong table for campaigns | 71-74 | Queries `programs` table | Should query `marketing_campaigns` |
| Missing entity counts | - | - | policies, rd_calls, partnerships, living_labs |

**Current Code (Lines 56-79):**
```typescript
const [
  { count: challengeCount },
  { count: pilotCount },
  { count: campaignCount },  // ❌ Actually queries 'programs' table!
  { count: eventCount }
] = await Promise.all([
  supabase.from('challenges')...,
  supabase.from('pilots')...,
  supabase.from('programs')...,  // ❌ WRONG - this is programs, not campaigns
  supabase.from('events')...
]);
// ❌ MISSING: policies, rd_calls, partnerships, living_labs, marketing_campaigns
```

---

### SYSTEM 2: Demand Queue Generator (`strategy-demand-queue-generator/index.ts`)

| Issue | Line | Current | Should Be |
|-------|------|---------|-----------|
| priorityWeights missing 5 types | 44-49 | challenges, pilots, campaigns, events | + programs, policies, rd_calls, partnerships, living_labs |
| getGeneratorComponent missing 4 types | 146-159 | 5 entity mappings | + programs, rd_calls, partnerships, living_labs |
| buildPrefilledSpec missing 5 types | 162-223 | challenges, pilots, campaigns, events | + programs, policies, rd_calls, partnerships, living_labs |

**Current priorityWeights (Lines 44-49):**
```typescript
const priorityWeights = {
  challenges: 100,
  pilots: 80,
  campaigns: 60,
  events: 40
  // ❌ MISSING: programs, policies, rd_calls, partnerships, living_labs
};
```

**Current getGeneratorComponent (Lines 146-159):**
```typescript
const mapping: Record<string, string> = {
  challenges: 'StrategyChallengeGenerator',
  pilots: 'StrategyToPilotGenerator',
  campaigns: 'StrategyToCampaignGenerator',
  events: 'StrategyToEventGenerator',
  policies: 'StrategyToPolicyGenerator'
  // ❌ MISSING: programs, rd_calls, partnerships, living_labs
};
```

---

### SYSTEM 3: Batch Generator (`strategy-batch-generator/index.ts`)

| Issue | Line | Current | Should Be |
|-------|------|---------|-----------|
| living_lab wrong fallback | 77 | strategy-challenge-generator | strategy-lab-research-generator |
| program missing | - | - | strategy-program-generator (needs creation) |
| solution type orphan | 71 | strategy-challenge-generator | Remove or clarify workflow |

**Current generatorMap (Lines 68-78):**
```typescript
const generatorMap: Record<string, string> = {
  challenge: 'strategy-challenge-generator',
  pilot: 'strategy-pilot-generator',
  solution: 'strategy-challenge-generator', // ❓ Unclear workflow
  campaign: 'strategy-campaign-generator',
  event: 'strategy-event-planner',
  policy: 'strategy-policy-generator',
  partnership: 'strategy-partnership-matcher',
  rd_call: 'strategy-rd-call-generator',
  living_lab: 'strategy-challenge-generator'  // ❌ WRONG - should be strategy-lab-research-generator
  // ❌ MISSING: program -> strategy-program-generator
};
```

---

### SYSTEM 4: Quality Assessor (`strategy-quality-assessor/index.ts`)

| Issue | Line | Current | Should Be |
|-------|------|---------|-----------|
| getRequiredFields only handles 4 types | 240-253 | challenge, pilot, campaign, event | ALL 9+ entity types |

**Current getRequiredFields (Lines 240-253):**
```typescript
function getRequiredFields(entityType: string): string[] {
  switch (entityType) {
    case 'challenge':
      return ['title_en', 'description_en', 'problem_statement_en'];
    case 'pilot':
      return ['name_en', 'description_en', 'duration_months'];
    case 'campaign':
      return ['title_en', 'description_en', 'campaign_type'];
    case 'event':
      return ['title_en', 'description_en', 'event_type'];
    default:
      return ['title_en', 'description_en'];  // Fallback too generic
  }
  // ❌ MISSING: program, policy, rd_call, partnership, living_lab
}
```

---

### SYSTEM 5: BatchGenerationControls.jsx (Frontend)

| Issue | Line | Current | Should Be |
|-------|------|---------|-----------|
| getGeneratorFunction incomplete | 179-192 | 9 types but living_lab wrong | Fix living_lab, add program |

**Current getGeneratorFunction (Lines 179-192):**
```javascript
const getGeneratorFunction = (entityType) => {
  const map = {
    challenge: 'strategy-challenge-generator',
    pilot: 'strategy-pilot-generator',
    solution: 'strategy-challenge-generator',
    campaign: 'strategy-campaign-generator',
    event: 'strategy-event-planner',
    policy: 'strategy-policy-generator',
    partnership: 'strategy-partnership-matcher',
    rd_call: 'strategy-rd-call-generator',
    living_lab: 'strategy-challenge-generator' // ❌ WRONG
  };
  return map[entityType] || 'strategy-challenge-generator';
};
// ❌ MISSING: program
```

---

### SYSTEM 6: Step6ActionPlans.jsx (UI)

| Issue | Line | Current | Should Be |
|-------|------|---------|-----------|
| "project" type not an entity | 210 | project option | Remove |
| Missing 7 entity types | 207-212 | initiative, program, project, pilot | + challenge, rd_call, partnership, event, policy, living_lab, campaign |
| getTypeColor missing types | 71-79 | 4 types | 10 types |
| Summary shows "Projects" | 316-317 | Projects count | Remove or replace |

---

### SYSTEM 7: StrategyWizardWrapper.jsx (AI Schema)

| Issue | Line | Current | Should Be |
|-------|------|---------|-----------|
| type field has no enum | ~2403 | `type: { type: 'string' }` | Add enum constraint |

---

### SYSTEM 8: Cascade Generator Components

| Component | Location | Edge Function | Status |
|-----------|----------|---------------|--------|
| StrategyChallengeGenerator | cascade/ | strategy-challenge-generator | ✅ OK |
| StrategyToPilotGenerator | cascade/ | strategy-pilot-generator | ✅ OK |
| StrategyToCampaignGenerator | cascade/ | strategy-campaign-generator | ✅ OK |
| StrategyToEventGenerator | cascade/ | strategy-event-planner | ✅ OK |
| StrategyToPolicyGenerator | cascade/ | strategy-policy-generator | ✅ OK |
| StrategyToRDCallGenerator | cascade/ | strategy-rd-call-generator | ✅ OK |
| StrategyToPartnershipGenerator | cascade/ | strategy-partnership-matcher | ✅ OK |
| StrategyToLivingLabGenerator | cascade/ | strategy-lab-research-generator | ✅ OK |
| **StrategyToProgramGenerator** | ❌ strategy/ (wrong) | ❌ MISSING | 🔴 NEEDS FIX |

---

## 🔴 CRITICAL WIRING GAP: Step 12 → Demand Queue NOT CONNECTED

### Current Data Flow (BROKEN)

```
Step 12 (action_plans) 
    ↓
wizard_data JSONB in strategic_plans table
    ↓
❌ DEAD END - Nothing reads action_plans to create entities
```

### Required Data Flow

```
Step 12 (action_plans with should_create_entity=true)
    ↓
StrategyWizardWrapper.submitMutation (line 306-354)
    ↓
NEW: createDemandQueueItems() function
    ↓
demand_queue table (pending items)
    ↓
Batch Generator / Manual processing
    ↓
Entity tables (challenges, pilots, programs, etc.)
```

### SYSTEM 9: StrategyWizardWrapper.jsx - WIRING GAP

| Issue | Location | Current | Required |
|-------|----------|---------|----------|
| No demand_queue creation on save | saveMutation (line 218-303) | Saves action_plans to JSONB only | Add createDemandQueueItems() call |
| No demand_queue creation on submit | submitMutation (line 306-354) | Creates approval request only | Add createDemandQueueItems() call |
| action_plans missing should_create_entity | initialWizardData | No field | Add field to action plan structure |
| action_plans missing cascade_entity_type | initialWizardData | No field | Add field for explicit entity override |

**Current submitMutation (Lines 306-354):**
```javascript
const submitMutation = useMutation({
  mutationFn: async (data) => {
    // First save the plan
    const saveResult = await saveMutation.mutateAsync(data);
    
    // Update status to pending approval
    await supabase.from('strategic_plans').update({...});
    
    // Create approval request
    await createApprovalRequest({...});
    
    // ❌ MISSING: Create demand_queue items from action_plans
    return saveResult;
  }
});
```

**Required Addition:**
```javascript
// After createApprovalRequest, add:
const cascadableActions = data.action_plans?.filter(
  ap => ap.should_create_entity && ap.type !== 'initiative'
) || [];

if (cascadableActions.length > 0) {
  const queueItems = cascadableActions.map((ap, index) => ({
    strategic_plan_id: saveResult.id,
    objective_id: data.objectives[ap.objective_index]?.id || null,
    entity_type: ap.cascade_entity_type || ap.type,
    generator_component: getGeneratorComponent(ap.type),
    priority_score: getPriorityScore(ap.priority),
    prefilled_spec: {
      title_en: ap.name_en,
      title_ar: ap.name_ar,
      description_en: ap.description_en,
      description_ar: ap.description_ar,
      budget_estimate: ap.budget_estimate,
      start_date: ap.start_date,
      end_date: ap.end_date,
      owner: ap.owner,
      deliverables: ap.deliverables,
      source: 'wizard_step12',
      source_index: index
    },
    status: 'pending'
  }));
  
  await supabase.from('demand_queue').insert(queueItems);
}
```

### SYSTEM 10: Step6ActionPlans.jsx - UI WIRING GAP

| Issue | Line | Current | Required |
|-------|------|---------|----------|
| No should_create_entity toggle | N/A | Not implemented | Add checkbox per action |
| No cascade_entity_type override | N/A | Not implemented | Add optional select |
| Default action structure missing fields | addActionPlan (line 25-43) | Basic fields only | Add should_create_entity, cascade_entity_type |

**Current addActionPlan (Lines 25-43):**
```javascript
const addActionPlan = (objectiveIndex = null) => {
  onChange({
    action_plans: [...actionPlans, {
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      objective_index: objectiveIndex,
      type: 'initiative',
      priority: 'medium',
      budget_estimate: '',
      start_date: '',
      end_date: '',
      owner: '',
      deliverables: [],
      dependencies: []
      // ❌ MISSING: should_create_entity: false
      // ❌ MISSING: cascade_entity_type: null
    }]
  });
};
```

---

## 📈 MASTER FIX MATRIX (UPDATED)

| System | File | Fix Required | Priority |
|--------|------|--------------|----------|
| **WIRING: Step12→Queue** | StrategyWizardWrapper.jsx | Add createDemandQueueItems on submit | 🔴 CRITICAL |
| **WIRING: UI Toggle** | Step6ActionPlans.jsx | Add should_create_entity checkbox | 🔴 CRITICAL |
| Gap Analysis | strategy-gap-analysis/index.ts | Add 5 entity counts, fix campaign table | 🔴 HIGH |
| Demand Queue Gen | strategy-demand-queue-generator/index.ts | Add 5 types to all mappings | 🔴 HIGH |
| Batch Generator | strategy-batch-generator/index.ts | Fix living_lab, add program | 🔴 HIGH |
| Quality Assessor | strategy-quality-assessor/index.ts | Add 5+ entity field definitions | 🟡 MEDIUM |
| BatchGenerationControls | BatchGenerationControls.jsx | Fix living_lab, add program | 🟡 MEDIUM |
| Step6ActionPlans | Step6ActionPlans.jsx | Replace types, colors, summary | 🔴 HIGH |
| AI Schema | StrategyWizardWrapper.jsx | Add type enum | 🔴 HIGH |
| Program Generator | Create new | Create edge function + move component | 🟡 MEDIUM |

---

## 🎯 Implementation Plan

### Phase 1: Fix Action Type Consistency (Step6ActionPlans.jsx)

#### 1.1 Update Action Types (Lines 207-212)

**BEFORE:**
```jsx
<SelectItem value="initiative">{t({ en: 'Initiative', ar: 'مبادرة' })}</SelectItem>
<SelectItem value="program">{t({ en: 'Program', ar: 'برنامج' })}</SelectItem>
<SelectItem value="project">{t({ en: 'Project', ar: 'مشروع' })}</SelectItem>
<SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجريبي' })}</SelectItem>
```

**AFTER:**
```jsx
<SelectItem value="initiative">{t({ en: 'Initiative', ar: 'مبادرة' })}</SelectItem>
<SelectItem value="program">{t({ en: 'Program', ar: 'برنامج' })}</SelectItem>
<SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجريبي' })}</SelectItem>
<SelectItem value="challenge">{t({ en: 'Challenge', ar: 'تحدي' })}</SelectItem>
<SelectItem value="rd_call">{t({ en: 'R&D Call', ar: 'دعوة بحث وتطوير' })}</SelectItem>
<SelectItem value="partnership">{t({ en: 'Partnership', ar: 'شراكة' })}</SelectItem>
<SelectItem value="event">{t({ en: 'Event', ar: 'فعالية' })}</SelectItem>
<SelectItem value="policy">{t({ en: 'Policy', ar: 'سياسة' })}</SelectItem>
<SelectItem value="living_lab">{t({ en: 'Living Lab', ar: 'مختبر حي' })}</SelectItem>
<SelectItem value="campaign">{t({ en: 'Campaign', ar: 'حملة' })}</SelectItem>
```

#### 1.2 Update Type Colors (Lines 71-79)

```javascript
const getTypeColor = (type) => {
  const colors = {
    initiative: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    program: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    pilot: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    challenge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    rd_call: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    partnership: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    event: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    policy: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    living_lab: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    campaign: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  };
  return colors[type] || 'bg-muted';
};
```

#### 1.3 Update Summary Section (Lines 306-324)

Replace fixed 4-column grid with dynamic entity type counts.

### Phase 2: Fix AI Schema (StrategyWizardWrapper.jsx)

#### 2.1 Add Type Enum (Line 2403)

**BEFORE:**
```javascript
type: { type: 'string' },
```

**AFTER:**
```javascript
type: { 
  type: 'string',
  enum: ['initiative', 'program', 'pilot', 'challenge', 'rd_call', 
         'partnership', 'event', 'policy', 'living_lab', 'campaign']
},
```

### Phase 3: Fix Edge Functions

#### 3.1 Create `strategy-program-generator` (NEW)

**File**: `supabase/functions/strategy-program-generator/index.ts`

```typescript
// AI-powered program generation from strategic objectives
// Pattern: Copy from strategy-pilot-generator and adapt
```

#### 3.2 Update `strategy-gap-analysis`

Add counts for ALL entity types:
- challenges, pilots, programs, campaigns, events, policies, rd_calls, partnerships, living_labs

#### 3.3 Update `strategy-demand-queue-generator`

**priorityWeights:**
```typescript
const priorityWeights = {
  challenges: 100,
  pilots: 80,
  programs: 75,
  rd_calls: 70,
  partnerships: 65,
  living_labs: 60,
  campaigns: 55,
  events: 50,
  policies: 45
};
```

**getGeneratorComponent:**
```typescript
const mapping: Record<string, string> = {
  // ... existing
  programs: 'StrategyToProgramGenerator',
  program: 'StrategyToProgramGenerator',
  rd_calls: 'StrategyToRDCallGenerator',
  rd_call: 'StrategyToRDCallGenerator',
  partnerships: 'StrategyToPartnershipGenerator',
  partnership: 'StrategyToPartnershipGenerator',
  living_labs: 'StrategyToLivingLabGenerator',
  living_lab: 'StrategyToLivingLabGenerator'
};
```

#### 3.4 Update `strategy-batch-generator`

**generatorMap:**
```typescript
const generatorMap: Record<string, string> = {
  challenge: 'strategy-challenge-generator',
  pilot: 'strategy-pilot-generator',
  program: 'strategy-program-generator',  // NEW
  campaign: 'strategy-campaign-generator',
  event: 'strategy-event-planner',
  policy: 'strategy-policy-generator',
  partnership: 'strategy-partnership-matcher',
  rd_call: 'strategy-rd-call-generator',
  living_lab: 'strategy-lab-research-generator'  // FIX: was strategy-challenge-generator
};
```

### Phase 4: Move/Fix Components

#### 4.1 Move StrategyToProgramGenerator

**FROM**: `src/components/strategy/StrategyToProgramGenerator.jsx`
**TO**: `src/components/strategy/cascade/StrategyToProgramGenerator.jsx`

### Phase 5: Wire Step 12 to Demand Queue (Optional)

Add `should_create_entity` toggle and create demand_queue items on wizard save.

---

## 📁 Complete File Change Summary

### Files to MODIFY

| File | Line Numbers | Changes | Priority |
|------|--------------|---------|----------|
| `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` | 71-79, 207-212, 306-324 | Update types, colors, summary | 🔴 HIGH |
| `src/components/strategy/wizard/StrategyWizardWrapper.jsx` | 2403 | Add enum to AI schema | 🔴 HIGH |
| `supabase/functions/strategy-gap-analysis/index.ts` | 56-105 | Add 5 missing entity counts | 🔴 HIGH |
| `supabase/functions/strategy-demand-queue-generator/index.ts` | 44-49, 146-159, 162-223 | Add missing entity types | 🔴 HIGH |
| `supabase/functions/strategy-batch-generator/index.ts` | 67-78 | Fix living_lab, add program | 🟡 MEDIUM |

### Files to CREATE

| File | Purpose | Priority |
|------|---------|----------|
| `supabase/functions/strategy-program-generator/index.ts` | AI program generation edge function | 🔴 HIGH |

### Files to MOVE

| From | To | Reason |
|------|----|--------|
| `src/components/strategy/StrategyToProgramGenerator.jsx` | `src/components/strategy/cascade/StrategyToProgramGenerator.jsx` | Consistency with other generators |

---

## ✅ Implementation Checklist

### Phase 1: Fix Step 12 UI
- [ ] **1.1**: Remove "project", add 7 new entity types (lines 207-212)
- [ ] **1.2**: Update getTypeColor function (lines 71-79)
- [ ] **1.3**: Update summary section (lines 306-324)

### Phase 2: Fix AI Schema
- [ ] **2.1**: Add enum constraint to type field (line 2403)

### Phase 3: Fix Edge Functions
- [ ] **3.1**: Create strategy-program-generator
- [ ] **3.2**: Update strategy-gap-analysis (add 5 entity counts)
- [ ] **3.3**: Update strategy-demand-queue-generator (priorityWeights + getGeneratorComponent + buildPrefilledSpec)
- [ ] **3.4**: Fix strategy-batch-generator (living_lab mapping + add program)

### Phase 4: Fix Components
- [ ] **4.1**: Move StrategyToProgramGenerator to cascade/ folder

### Phase 5: Optional Enhancements
- [ ] **5.1**: Add should_create_entity toggle to Step 12
- [ ] **5.2**: Create demand_queue items on wizard finalize
- [ ] **5.3**: Sync to action_plans relational table

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [strategy-design.md](./strategy-design.md) | Entity Integration Model |
| [demand-driven-implementation-plan.md](./demand-driven-implementation-plan.md) | Cascade system |
| [strategy-integration-matrix.md](./strategy-integration-matrix.md) | Entity integrations |
| [STRATEGIC_WIZARD_DESIGN.md](./STRATEGIC_WIZARD_DESIGN.md) | Wizard design |

**Code Change**:
```jsx
<Select value={ap.type} onValueChange={(v) => updateActionPlan(apIndex, { type: v })}>
  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="initiative">{t({ en: 'Initiative', ar: 'مبادرة' })}</SelectItem>
    <SelectItem value="program">{t({ en: 'Program', ar: 'برنامج' })}</SelectItem>
    <SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجريبي' })}</SelectItem>
    <SelectItem value="challenge">{t({ en: 'Challenge', ar: 'تحدي' })}</SelectItem>
    <SelectItem value="rd_call">{t({ en: 'R&D Call', ar: 'دعوة بحث وتطوير' })}</SelectItem>
    <SelectItem value="partnership">{t({ en: 'Partnership', ar: 'شراكة' })}</SelectItem>
    <SelectItem value="event">{t({ en: 'Event', ar: 'فعالية' })}</SelectItem>
    <SelectItem value="policy">{t({ en: 'Policy', ar: 'سياسة' })}</SelectItem>
    <SelectItem value="living_lab">{t({ en: 'Living Lab', ar: 'مختبر حي' })}</SelectItem>
    <SelectItem value="campaign">{t({ en: 'Campaign', ar: 'حملة' })}</SelectItem>
  </SelectContent>
</Select>
```

#### 1.2 Update AI Schema

**File**: `src/components/strategy/wizard/StrategyWizardWrapper.jsx` (line ~2403)

```javascript
type: { 
  type: 'string', 
  enum: ['initiative', 'program', 'pilot', 'challenge', 'rd_call', 
         'partnership', 'event', 'policy', 'living_lab', 'campaign'] 
}
```

#### 1.3 Update Type Color Mapping

**File**: `src/components/strategy/wizard/steps/Step6ActionPlans.jsx`

```javascript
const getTypeColor = (type) => {
  const colors = {
    initiative: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    program: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    pilot: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    challenge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    rd_call: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    partnership: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    event: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    policy: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    living_lab: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    campaign: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  };
  return colors[type] || 'bg-muted';
};
```

---

### Phase 2: Fix Missing/Misplaced Generators

#### 2.1 Move `StrategyToProgramGenerator.jsx`

**Current Location**: `src/components/strategy/StrategyToProgramGenerator.jsx`
**New Location**: `src/components/strategy/cascade/StrategyToProgramGenerator.jsx`

#### 2.2 Create Edge Function (if missing)

**File**: `supabase/functions/strategy-program-generator/index.ts`

```typescript
// AI-powered program generation from strategic objectives
// Pattern: Similar to strategy-pilot-generator
```

---

### Phase 3: Expand Demand Queue

#### 3.1 Update `strategy-demand-queue-generator`

**File**: `supabase/functions/strategy-demand-queue-generator/index.ts`

**Current `priorityWeights`** (line ~44):
```typescript
const priorityWeights = {
  challenges: 100,
  pilots: 80,
  campaigns: 55,
  events: 50,
  policies: 45
};
```

**Updated `priorityWeights`**:
```typescript
const priorityWeights = {
  challenges: 100,  // Highest priority - foundation of cascade
  pilots: 80,
  programs: 75,      // NEW
  rd_calls: 70,      // NEW
  partnerships: 65,  // NEW
  living_labs: 60,   // NEW
  campaigns: 55,
  events: 50,
  policies: 45
};
```

**Current `getGeneratorComponent`** (line ~146):
```typescript
function getGeneratorComponent(entityType: string): string {
  const mapping: Record<string, string> = {
    challenges: 'StrategyChallengeGenerator',
    challenge: 'StrategyChallengeGenerator',
    pilots: 'StrategyToPilotGenerator',
    pilot: 'StrategyToPilotGenerator',
    campaigns: 'StrategyToCampaignGenerator',
    campaign: 'StrategyToCampaignGenerator',
    events: 'StrategyToEventGenerator',
    event: 'StrategyToEventGenerator',
    policies: 'StrategyToPolicyGenerator',
    policy: 'StrategyToPolicyGenerator'
  };
  return mapping[entityType] || 'StrategyChallengeGenerator';
}
```

**Updated `getGeneratorComponent`**:
```typescript
function getGeneratorComponent(entityType: string): string {
  const mapping: Record<string, string> = {
    challenges: 'StrategyChallengeGenerator',
    challenge: 'StrategyChallengeGenerator',
    pilots: 'StrategyToPilotGenerator',
    pilot: 'StrategyToPilotGenerator',
    programs: 'StrategyToProgramGenerator',      // NEW
    program: 'StrategyToProgramGenerator',
    campaigns: 'StrategyToCampaignGenerator',
    campaign: 'StrategyToCampaignGenerator',
    events: 'StrategyToEventGenerator',
    event: 'StrategyToEventGenerator',
    policies: 'StrategyToPolicyGenerator',
    policy: 'StrategyToPolicyGenerator',
    rd_calls: 'StrategyToRDCallGenerator',       // NEW
    rd_call: 'StrategyToRDCallGenerator',
    partnerships: 'StrategyToPartnershipGenerator', // NEW
    partnership: 'StrategyToPartnershipGenerator',
    living_labs: 'StrategyToLivingLabGenerator',    // NEW
    living_lab: 'StrategyToLivingLabGenerator'
  };
  return mapping[entityType] || 'StrategyChallengeGenerator';
}
```

#### 3.2 Update `strategy-batch-generator`

**File**: `supabase/functions/strategy-batch-generator/index.ts`

**Current `generatorMap`** (line ~67):
```typescript
const generatorMap: Record<string, string> = {
  challenge: 'strategy-challenge-generator',
  pilot: 'strategy-pilot-generator',
  solution: 'strategy-challenge-generator',
  campaign: 'strategy-campaign-generator',
  event: 'strategy-event-planner',
  policy: 'strategy-policy-generator',
  partnership: 'strategy-partnership-matcher',
  rd_call: 'strategy-rd-call-generator',
  living_lab: 'strategy-challenge-generator'  // Falls back - needs dedicated
};
```

**Updated `generatorMap`**:
```typescript
const generatorMap: Record<string, string> = {
  challenge: 'strategy-challenge-generator',
  pilot: 'strategy-pilot-generator',
  program: 'strategy-program-generator',        // NEW - needs creation
  solution: 'strategy-challenge-generator',
  campaign: 'strategy-campaign-generator',
  event: 'strategy-event-planner',
  policy: 'strategy-policy-generator',
  partnership: 'strategy-partnership-matcher',
  rd_call: 'strategy-rd-call-generator',
  living_lab: 'strategy-lab-research-generator' // Point to correct function
};
```

---

### Phase 4: Wire Step 12 to Demand Queue

#### 4.1 Add `cascade_entity_type` Field to Action Plans

In wizard data structure and AI schema:

```javascript
{
  name_en: '',
  name_ar: '',
  type: 'challenge',           // The action type
  cascade_entity_type: null,   // NEW: Explicit entity to generate (optional override)
  should_create_entity: false, // NEW: Toggle for cascade
  // ... existing fields
}
```

#### 4.2 Add UI Toggle for Entity Creation

**File**: `src/components/strategy/wizard/steps/Step6ActionPlans.jsx`

```jsx
{/* Only show for cascadable types */}
{ap.type !== 'initiative' && (
  <div className="flex items-center gap-2 mt-2">
    <Checkbox 
      id={`cascade-${apIndex}`}
      checked={ap.should_create_entity} 
      onCheckedChange={(v) => updateActionPlan(apIndex, { should_create_entity: v })}
    />
    <Label htmlFor={`cascade-${apIndex}`} className="text-xs cursor-pointer">
      {t({ en: 'Queue for entity generation', ar: 'إضافة لقائمة الإنشاء' })}
    </Label>
  </div>
)}
```

#### 4.3 Create Demand Queue Items on Wizard Save

**File**: `src/components/strategy/wizard/StrategyWizardWrapper.jsx`

In the save/finalize function, add:

```javascript
// After saving wizard_data, create demand_queue items for cascadable actions
const createDemandQueueItems = async (planId, actionPlans, objectives) => {
  const cascadableActions = actionPlans.filter(
    ap => ap.should_create_entity && ap.type !== 'initiative'
  );
  
  if (cascadableActions.length === 0) return;
  
  const demandQueueItems = cascadableActions.map(ap => ({
    strategic_plan_id: planId,
    objective_id: resolveObjectiveId(ap.objective_index, objectives),
    entity_type: ap.cascade_entity_type || ap.type,
    generator_component: getGeneratorComponent(ap.type),
    priority_score: calculatePriority(ap),
    prefilled_spec: {
      title_en: ap.name_en,
      title_ar: ap.name_ar,
      description_en: ap.description_en,
      description_ar: ap.description_ar,
      budget_estimate: ap.budget_estimate,
      start_date: ap.start_date,
      end_date: ap.end_date,
      owner: ap.owner,
      source: 'wizard_step12',
      source_action_plan_index: actionPlans.indexOf(ap)
    },
    status: 'pending'
  }));

  const { error } = await supabase.from('demand_queue').insert(demandQueueItems);
  if (error) console.error('Failed to create demand queue items:', error);
};
```

#### 4.4 Helper Functions

```javascript
const CASCADABLE_TYPES = [
  'challenge', 'pilot', 'program', 'rd_call', 
  'partnership', 'event', 'policy', 'living_lab', 'campaign'
];

const resolveObjectiveId = (objectiveIndex, objectives) => {
  const obj = objectives[objectiveIndex];
  return obj?.id || null;
};

const getGeneratorComponent = (type) => {
  const mapping = {
    challenge: 'StrategyChallengeGenerator',
    pilot: 'StrategyToPilotGenerator',
    program: 'StrategyToProgramGenerator',
    rd_call: 'StrategyToRDCallGenerator',
    partnership: 'StrategyToPartnershipGenerator',
    event: 'StrategyToEventGenerator',
    policy: 'StrategyToPolicyGenerator',
    living_lab: 'StrategyToLivingLabGenerator',
    campaign: 'StrategyToCampaignGenerator'
  };
  return mapping[type] || null;
};

const calculatePriority = (ap) => {
  const priorityWeights = { high: 100, medium: 70, low: 40 };
  return priorityWeights[ap.priority] || 50;
};
```

---

### Phase 5: Optional - Sync to Relational Tables

#### 5.1 Save to `action_plans` Table

On finalize, also persist to relational table:

```javascript
const syncToRelationalTables = async (planId, actionPlans, objectives) => {
  const relationalPlans = actionPlans.map((ap, index) => ({
    strategic_plan_id: planId,
    objective_id: resolveObjectiveId(ap.objective_index, objectives),
    objective_title: objectives[ap.objective_index]?.name_en || '',
    title_en: ap.name_en,
    title_ar: ap.name_ar,
    total_budget: parseBudget(ap.budget_estimate),
    start_date: ap.start_date || null,
    end_date: ap.end_date || null,
    owner_email: ap.owner || null,
    status: 'draft'
  }));

  const { error } = await supabase.from('action_plans').upsert(relationalPlans, {
    onConflict: 'strategic_plan_id,objective_id'
  });
  
  if (error) console.error('Failed to sync action plans:', error);
};
```

#### 5.2 Optional DB Migration

If you want explicit `cascade_entity_type` tracking:

```sql
ALTER TABLE action_plans 
ADD COLUMN cascade_entity_type TEXT,
ADD COLUMN demand_queue_item_id UUID REFERENCES demand_queue(id);
```

---

## 📁 Complete File Change Summary

### Files to MODIFY

| File | Changes | Priority | LOE |
|------|---------|----------|-----|
| `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` | Update types, add colors, add cascade toggle | 🔴 HIGH | 2hr |
| `src/components/strategy/wizard/StrategyWizardWrapper.jsx` | Update AI schema enum, add demand queue creation | 🔴 HIGH | 3hr |
| `supabase/functions/strategy-demand-queue-generator/index.ts` | Add missing entity types to priorityWeights and getGeneratorComponent | 🔴 HIGH | 1hr |
| `supabase/functions/strategy-batch-generator/index.ts` | Add program to generatorMap | 🟡 MEDIUM | 30min |
| `src/hooks/strategy/useAutoSaveDraft.js` | Ensure new fields (should_create_entity) are saved | 🟡 MEDIUM | 30min |

### Files to CREATE

| File | Purpose | Priority | LOE |
|------|---------|----------|-----|
| `supabase/functions/strategy-program-generator/index.ts` | AI program generation edge function | 🟡 MEDIUM | 2hr |

### Files to MOVE

| From | To | Reason |
|------|----|--------|
| `src/components/strategy/StrategyToProgramGenerator.jsx` | `src/components/strategy/cascade/StrategyToProgramGenerator.jsx` | Consistency with other generators |

---

## 📊 Summary of Gaps

| Gap | Severity | Fix | Phase |
|-----|----------|-----|-------|
| "project" is not an entity | 🔴 High | Remove from types | 1 |
| Missing 7 entity types in UI | 🔴 High | Add to select options | 1 |
| No enum in AI schema | 🟡 Medium | Add type enum | 1 |
| Demand queue missing 4 entities | 🔴 High | Update edge function | 3 |
| StrategyToProgramGenerator wrong location | 🟡 Medium | Move to cascade/ folder | 2 |
| strategy-program-generator missing | 🟡 Medium | Create edge function | 2 |
| No demand_queue integration in Step 12 | 🔴 High | Wire on finalize | 4 |
| Uses objective_index vs objective_id | 🟡 Medium | Add resolver function | 4 |

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [strategy-design.md](./strategy-design.md) | Entity Integration Model |
| [demand-driven-implementation-plan.md](./demand-driven-implementation-plan.md) | Cascade system |
| [strategy-integration-matrix.md](./strategy-integration-matrix.md) | Entity integrations |
| [STRATEGIC_WIZARD_DESIGN.md](./STRATEGIC_WIZARD_DESIGN.md) | Wizard design |

---

## ✅ Implementation Checklist

### Phase 1: Fix Action Type Consistency
- [ ] **1.1**: Update Step6ActionPlans.jsx action types (remove project, add 7 new)
- [ ] **1.2**: Update AI schema enum in StrategyWizardWrapper.jsx
- [ ] **1.3**: Update type color mapping function

### Phase 2: Fix Missing/Misplaced Generators
- [ ] **2.1**: Move StrategyToProgramGenerator.jsx to cascade/ folder
- [ ] **2.2**: Create strategy-program-generator edge function

### Phase 3: Expand Demand Queue
- [ ] **3.1**: Update strategy-demand-queue-generator priorityWeights
- [ ] **3.2**: Update strategy-demand-queue-generator getGeneratorComponent
- [ ] **3.3**: Update strategy-batch-generator generatorMap

### Phase 4: Wire Step 12 to Demand Queue
- [ ] **4.1**: Add should_create_entity field to action plan data structure
- [ ] **4.2**: Add UI toggle for entity creation in Step6ActionPlans.jsx
- [ ] **4.3**: Add createDemandQueueItems function to StrategyWizardWrapper.jsx
- [ ] **4.4**: Call createDemandQueueItems on wizard save/finalize

### Phase 5: Optional - Sync to Relational Tables
- [ ] **5.1**: Add syncToRelationalTables function
- [ ] **5.2**: Optional: Add cascade_entity_type column migration

---

## 📈 Expected Outcomes

After implementation:

1. **Step 12 UI** shows all 10 cascadable entity types (no "project")
2. **AI generation** respects entity type enum constraints
3. **Demand Queue** supports all entity types for gap-driven generation
4. **Action Plans** can optionally queue entities for automated generation
5. **Consistent flow** from wizard → demand_queue → entity tables

---

## 🔴 VERSION 2.0: MASTER FIX PRIORITY LIST

### PRIORITY 1: Database (Must Fix First)
| Task | Description | Blocks |
|------|-------------|--------|
| Create `policies` table | With RLS, `strategic_plan_ids` array | policy generator saving |
| Create `marketing_campaigns` table | With RLS, `strategic_plan_ids` array | campaign generator saving |
| Verify `programs` column | Confirm `strategic_plan_ids` is array type | gap analysis queries |

### PRIORITY 2: Generator Output Fix (Critical)
| Generator | Changes Needed |
|-----------|----------------|
| `strategy-challenge-generator` | Add: save to `challenges` table, return `{ id, ...challenge }` |
| `strategy-pilot-generator` | Add: save to `pilots` table, return `{ id, ...pilot }` |
| `strategy-campaign-generator` | Add: save to `marketing_campaigns` table, return `{ id, ...campaign }` |
| `strategy-event-planner` | Verify: saves to `events` table, returns `{ id, ...event }` |
| `strategy-policy-generator` | Add: save to `policies` table, return `{ id, ...policy }` |
| `strategy-partnership-matcher` | Add: save to `partnerships` table, return `{ id, ...partnership }` |
| `strategy-lab-research-generator` | Add: save to `living_labs` table, return `{ id, ...lab }` |
| **ALL**: Must append `strategic_plan_id` to entity's `strategic_plan_ids` array |

### PRIORITY 3: Batch Generator Mapping Fix
| Type | Current Mapping | Correct Mapping |
|------|-----------------|-----------------|
| `living_lab` | `strategy-challenge-generator` ❌ | `strategy-lab-research-generator` ✅ |
| `program` | MISSING | Create `strategy-program-generator` |
| `initiative` | MISSING | Decide: map to programs or create table |
| `project` | MISSING | Decide: map to existing or create table |
| `solution` | `strategy-challenge-generator` | REMOVE (orphan type) |

### PRIORITY 4: Gap Analysis Fix
| Query | Issue | Fix |
|-------|-------|-----|
| `programs` | Uses `.eq('strategic_plan_id', id)` | Change to `.contains('strategic_plan_ids', [id])` |
| `events` | Verify column name | Check if `strategic_plan_ids` array exists |
| Missing entities | Only counts 4 types | Add: rd_calls, partnerships, living_labs, policies |

### PRIORITY 5: Step 12 → Queue Wiring (New Code)
```javascript
// Add to StrategyWizardWrapper.jsx submitMutation after plan save
const createQueueItemsFromActionPlans = async (planId, actionPlans) => {
  const queueItems = actionPlans
    .filter(ap => ap.should_create_entity)
    .map(ap => ({
      strategic_plan_id: planId,
      objective_id: ap.objective_id,
      entity_type: mapActionTypeToEntityType(ap.type), // initiative→?, program→program, pilot→pilot
      generator_component: getGeneratorForType(ap.type),
      priority_score: calculatePriority(ap),
      prefilled_spec: {
        title_en: ap.name_en,
        title_ar: ap.name_ar,
        description_en: ap.description_en,
        description_ar: ap.description_ar,
        budget_estimate: ap.budget_estimate,
        start_date: ap.start_date,
        end_date: ap.end_date,
        deliverables: ap.deliverables,
        ai_context: {
          objective_text: getObjectiveTitle(ap.objective_index),
          plan_vision: wizardData.vision_en
        }
      },
      status: 'pending',
      attempts: 0,
      max_attempts: 3
    }));
  
  await supabase.from('demand_queue').insert(queueItems);
};
```

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

```
Week 1: Database + Generator Fixes
├── Day 1-2: Create missing tables (policies, marketing_campaigns)
├── Day 3-5: Fix all generators to save to DB and return IDs
└── Day 5: Test generators individually

Week 2: System Integration
├── Day 1-2: Fix batch-generator and BatchGenerationControls mappings
├── Day 3: Fix gap-analysis queries
├── Day 4: Fix quality-assessor entity handlers
└── Day 5: Test batch generation end-to-end

Week 3: Step 12 Wiring
├── Day 1-2: Add should_create_entity toggle to Step 12 UI
├── Day 3-4: Add queue injection code to submitMutation
└── Day 5: Full integration test

Week 4: Steps 13-17 Entity Propagation
├── Day 1: Update data structures with generated_entity_ids
├── Day 2-3: Update AI schemas for entity-aware generation
├── Day 4-5: Update UI components for entity references
```

---

## 🔗 STEPS 13-17 ENTITY PROPAGATION PLAN

### Overview: The Structural Disconnect

**Current State:** Steps 13-17 operate in data silos without referencing entities generated from Step 12.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT ARCHITECTURE (BROKEN)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Step 12                Steps 13-17                   Entity Tables         │
│   ┌──────────┐          ┌──────────────┐              ┌──────────────┐      │
│   │ Action   │    ✖     │ Resources    │      ✖       │ challenges   │      │
│   │ Plans    │──────────│ Timeline     │──────────────│ pilots       │      │
│   │ (JSONB)  │   NO     │ Governance   │     NO       │ programs     │      │
│   │          │  LINK    │ Comms        │   REFERENCE  │ events       │      │
│   └──────────┘          │ Change Mgmt  │              │ etc.         │      │
│                         └──────────────┘              └──────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Required State:** Entity IDs flow through the entire wizard, enabling entity-aware planning.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TARGET ARCHITECTURE (FIXED)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Step 12                demand_queue              Entity Tables             │
│   ┌──────────┐          ┌──────────┐              ┌──────────────┐          │
│   │ Action   │ ───────→ │ Queue    │ ───────────→ │ challenges   │          │
│   │ Plans    │          │ Items    │              │ pilots       │          │
│   │ (toggle) │          └──────────┘              │ programs     │          │
│   └──────────┘               │                    └──────────────┘          │
│        │                     │                          │                    │
│        └─────────────────────┴──────────────────────────┘                    │
│                              │                                               │
│                    ┌─────────▼─────────┐                                     │
│                    │ generated_entity_ │                                     │
│                    │ ids[] references  │                                     │
│                    └─────────┬─────────┘                                     │
│                              │                                               │
│              ┌───────────────┼───────────────┐                               │
│              ▼               ▼               ▼                               │
│         Step 13         Step 14-15      Step 16-17                          │
│      ┌──────────┐      ┌──────────┐    ┌──────────┐                         │
│      │ Resources│      │ Timeline │    │ Comms    │                         │
│      │ per      │      │ with     │    │ with     │                         │
│      │ entity   │      │ entity   │    │ entity   │                         │
│      │          │      │ milestones    │ messages │                         │
│      └──────────┘      └──────────┘    └──────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### STEP 13: Resource Allocation - Entity-Aware Changes

**Current Location:** `src/components/strategy/wizard/steps/Step7Resources.jsx`

**Current Data Structure (wizard_data.resources):**
```javascript
{
  financial: { total_budget, currency, breakdown_by_pillar: [] },
  human: { total_fte, breakdown_by_role: [] },
  technology: { systems: [], infrastructure: [] },
  facilities: []
}
```

**Required Data Structure:**
```javascript
{
  financial: {
    total_budget: number,
    currency: string,
    breakdown_by_pillar: [...],
    // NEW: Entity-specific allocations
    entity_allocations: [
      {
        entity_id: "uuid",           // Reference to generated entity
        entity_type: "challenge",     // Type from demand_queue
        entity_title: "...",          // Cached for display
        allocated_budget: 50000,
        allocation_percentage: 15,
        funding_source: "operating_budget",
        notes: ""
      }
    ]
  },
  human: {
    total_fte: number,
    breakdown_by_role: [...],
    // NEW: Entity-specific assignments
    entity_assignments: [
      {
        entity_id: "uuid",
        entity_type: "pilot",
        entity_title: "...",
        assigned_fte: 2.5,
        roles: ["project_manager", "developer"],
        team_members: []
      }
    ]
  },
  technology: {
    systems: [...],
    // NEW: Entity-system mappings
    entity_systems: [
      {
        entity_id: "uuid",
        entity_type: "program",
        required_systems: ["crm", "analytics"],
        new_systems_needed: []
      }
    ]
  }
}
```

**UI Changes Required:**
1. Add "Allocate to Entities" tab showing generated entities from Step 12
2. Show entity cards with allocation inputs
3. Auto-calculate totals per entity vs per pillar

**AI Schema Update:**
```javascript
// Add to resource_allocation schema
entity_allocations: z.array(z.object({
  entity_id: z.string().uuid(),
  entity_type: z.enum(['challenge', 'pilot', 'program', 'event', 'campaign', 'policy', 'partnership', 'rd_call', 'living_lab']),
  allocated_budget: z.number().optional(),
  allocated_fte: z.number().optional(),
  systems_assigned: z.array(z.string()).optional()
})).optional()
```

---

### STEP 14: Timeline & Milestones - Entity-Aware Changes

**Current Location:** `src/components/strategy/wizard/steps/Step8Timeline.jsx`

**Current Data Structure (wizard_data.timeline):**
```javascript
{
  phases: [
    { name, start_date, end_date, objectives: [] }
  ],
  milestones: [
    { title, date, description, linked_objective_index }
  ]
}
```

**Required Data Structure:**
```javascript
{
  phases: [...],
  milestones: [
    {
      title: "...",
      date: "2025-06-15",
      description: "...",
      linked_objective_index: 0,
      // NEW: Entity linkage
      linked_entity_id: "uuid",       // Optional: specific entity
      linked_entity_type: "pilot",
      milestone_type: "entity_launch" // NEW: enum
    }
  ],
  // NEW: Entity-specific timelines
  entity_timelines: [
    {
      entity_id: "uuid",
      entity_type: "challenge",
      entity_title: "...",
      planned_start: "2025-03-01",
      planned_end: "2025-09-30",
      key_milestones: [
        { title: "Challenge Published", date: "2025-03-15", type: "publish" },
        { title: "Solutions Received", date: "2025-06-01", type: "submission_deadline" },
        { title: "Winner Selected", date: "2025-07-15", type: "selection" }
      ],
      dependencies: ["other_entity_uuid"]
    }
  ]
}
```

**UI Changes Required:**
1. Add Gantt-style view showing entity timelines
2. Entity cards with date pickers
3. Dependency mapping between entities
4. Auto-generate milestones based on entity type templates

**Milestone Type Templates by Entity:**
```javascript
const ENTITY_MILESTONE_TEMPLATES = {
  challenge: ['publish', 'submission_deadline', 'evaluation', 'winner_selection', 'implementation'],
  pilot: ['kickoff', 'prototype', 'testing', 'evaluation', 'scale_decision'],
  program: ['launch', 'quarterly_review', 'mid_term_evaluation', 'completion'],
  event: ['planning_complete', 'registration_open', 'event_date', 'post_event_report'],
  campaign: ['creative_approved', 'launch', 'mid_campaign_review', 'completion', 'roi_analysis'],
  policy: ['draft', 'stakeholder_review', 'approval', 'implementation', 'review'],
  rd_call: ['announcement', 'submission_deadline', 'review', 'award', 'reporting'],
  partnership: ['mou_signed', 'kickoff', 'quarterly_review', 'renewal_decision'],
  living_lab: ['setup', 'recruitment', 'experimentation', 'analysis', 'scale_decision']
};
```

---

### STEP 15: Governance - Entity-Aware Changes

**Current Location:** `src/components/strategy/wizard/steps/Step9Governance.jsx`

**Current Data Structure (wizard_data.governance):**
```javascript
{
  oversight_committee: { name, chair, members: [] },
  meeting_cadence: "monthly",
  decision_rights: [],
  raci_matrix: [
    { activity, responsible, accountable, consulted, informed }
  ],
  escalation_process: []
}
```

**Required Data Structure:**
```javascript
{
  oversight_committee: {...},
  meeting_cadence: "monthly",
  decision_rights: [...],
  
  // NEW: Entity-type governance
  entity_governance: {
    challenge: {
      approval_authority: "innovation_committee",
      review_cadence: "weekly_during_active",
      required_approvals: ["legal", "procurement"],
      escalation_threshold: "budget_over_100k"
    },
    pilot: {
      approval_authority: "steering_committee",
      review_cadence: "biweekly",
      go_no_go_criteria: ["success_metrics_met", "budget_on_track"],
      scale_approval_authority: "executive_sponsor"
    },
    // ... other entity types
  },
  
  // NEW: Entity-specific RACI
  entity_raci: [
    {
      entity_id: "uuid",
      entity_type: "pilot",
      entity_title: "...",
      raci: [
        { activity: "Budget Approval", R: "PM", A: "Sponsor", C: "Finance", I: "Team" },
        { activity: "Go/No-Go Decision", R: "Sponsor", A: "SteerCo", C: "PM", I: "All" }
      ]
    }
  ],
  
  raci_matrix: [...] // Keep existing for overall strategy
}
```

**UI Changes Required:**
1. Add "Entity Governance" tab
2. Template-based governance rules per entity type
3. Entity-specific RACI builder
4. Approval workflow visualization

---

### STEP 16: Communication Plan - Entity-Aware Changes

**Current Location:** `src/components/strategy/wizard/steps/Step10Communication.jsx`

**Current Data Structure (wizard_data.communication_plan):**
```javascript
{
  key_messages: [
    { audience, message, channel, frequency }
  ],
  stakeholder_engagement: [],
  communication_calendar: []
}
```

**Required Data Structure:**
```javascript
{
  key_messages: [...],
  stakeholder_engagement: [...],
  
  // NEW: Entity-specific messaging
  entity_communications: [
    {
      entity_id: "uuid",
      entity_type: "challenge",
      entity_title: "...",
      launch_announcement: {
        date: "2025-03-01",
        channels: ["website", "social_media", "email"],
        target_audiences: ["innovators", "startups", "researchers"],
        key_messages: ["..."],
        call_to_action: "Submit your solution"
      },
      milestone_communications: [
        {
          milestone: "submission_deadline",
          date: "2025-06-01",
          message_type: "reminder",
          channels: ["email", "social_media"]
        }
      ],
      success_story_plan: {
        publish_date: "2025-09-15",
        format: "case_study",
        distribution: ["website", "newsletter", "press_release"]
      }
    }
  ],
  
  // NEW: Integrated calendar
  integrated_calendar: [
    {
      date: "2025-03-01",
      type: "entity_launch",
      entity_id: "uuid",
      entity_type: "challenge",
      communication_items: ["press_release", "social_post", "email_blast"]
    }
  ]
}
```

**UI Changes Required:**
1. Entity communication cards with templates
2. Integrated calendar showing all entity communications
3. Channel allocation per entity
4. Auto-generate comms from entity milestones

---

### STEP 17: Change Management - Entity-Aware Changes

**Current Location:** `src/components/strategy/wizard/steps/Step11ChangeManagement.jsx`

**Current Data Structure (wizard_data.change_management):**
```javascript
{
  readiness_assessment: { score, gaps: [] },
  training_plan: [],
  resistance_mitigation: [],
  success_metrics: []
}
```

**Required Data Structure:**
```javascript
{
  readiness_assessment: {...},
  
  // NEW: Entity impact assessment
  entity_impacts: [
    {
      entity_id: "uuid",
      entity_type: "program",
      entity_title: "...",
      affected_departments: ["operations", "it", "hr"],
      affected_roles: ["service_agents", "managers"],
      impact_level: "high", // high/medium/low
      change_type: "process_change", // process/technology/culture/structure
      readiness_score: 65,
      gaps: ["training_needed", "system_access"]
    }
  ],
  
  // NEW: Entity-specific training
  entity_training: [
    {
      entity_id: "uuid",
      entity_type: "pilot",
      training_modules: [
        {
          title: "New System Training",
          target_audience: ["pilot_participants"],
          format: "workshop",
          duration_hours: 4,
          scheduled_date: "2025-03-10",
          prerequisites: []
        }
      ]
    }
  ],
  
  // NEW: Entity adoption metrics
  entity_adoption_metrics: [
    {
      entity_id: "uuid",
      entity_type: "program",
      metrics: [
        { name: "user_adoption_rate", target: 80, measurement: "percentage" },
        { name: "training_completion", target: 100, measurement: "percentage" },
        { name: "satisfaction_score", target: 4.0, measurement: "scale_1_5" }
      ]
    }
  ],
  
  training_plan: [...], // Keep existing
  resistance_mitigation: [...],
  success_metrics: [...]
}
```

**UI Changes Required:**
1. Entity impact matrix visualization
2. Training assignment per entity
3. Adoption dashboard mockup
4. Change readiness heatmap by entity

---

### IMPLEMENTATION COMPONENTS MATRIX

| Step | Component File | Data Field | New Sub-fields | AI Schema Changes |
|------|----------------|------------|----------------|-------------------|
| 13 | Step7Resources.jsx | `resources` | `entity_allocations`, `entity_assignments`, `entity_systems` | Add entity allocation schema |
| 14 | Step8Timeline.jsx | `timeline` | `entity_timelines`, milestone `linked_entity_id` | Add entity timeline schema |
| 15 | Step9Governance.jsx | `governance` | `entity_governance`, `entity_raci` | Add entity RACI schema |
| 16 | Step10Communication.jsx | `communication_plan` | `entity_communications`, `integrated_calendar` | Add entity comms schema |
| 17 | Step11ChangeManagement.jsx | `change_management` | `entity_impacts`, `entity_training`, `entity_adoption_metrics` | Add entity change schema |

---

### NEW SHARED COMPONENTS NEEDED

```
src/components/strategy/wizard/shared/
├── EntitySelector.jsx              # Dropdown to select from generated entities
├── EntityCard.jsx                  # Display card for entity with type icon
├── EntityAllocationTable.jsx       # Table for resource allocation per entity
├── EntityTimelineGantt.jsx         # Gantt chart showing entity timelines
├── EntityRACIBuilder.jsx           # RACI matrix builder for specific entity
├── EntityCommunicationPlanner.jsx  # Communication planning per entity
├── EntityImpactAssessment.jsx      # Change impact form per entity
└── EntityReferenceContext.jsx      # React context for entity data sharing
```

---

### REQUIRED HOOKS

```javascript
// New hook: useGeneratedEntities.js
export function useGeneratedEntities(strategicPlanId) {
  // Fetches all entities generated from demand_queue for this plan
  // Returns { entities: [], isLoading, entityTypes: [], getEntitiesByType }
}

// New hook: useEntityReferences.js  
export function useEntityReferences(wizardData) {
  // Extracts entity_id references from all steps
  // Returns { allReferencedIds: [], getReferencesForEntity, validateReferences }
}
```

---

### AI SCHEMA UPDATES FOR STEPS 13-17

Add to `StrategyWizardWrapper.jsx` AI schemas:

```javascript
// Step 13 Resources - Add to existing schema
const step13EntitySchema = z.object({
  entity_allocations: z.array(z.object({
    entity_id: z.string().uuid(),
    entity_type: z.enum([...ENTITY_TYPES]),
    allocated_budget: z.number().optional(),
    allocated_fte: z.number().optional(),
    priority: z.enum(['critical', 'high', 'medium', 'low']).optional()
  })).optional()
});

// Step 14 Timeline - Add to existing schema
const step14EntitySchema = z.object({
  entity_timelines: z.array(z.object({
    entity_id: z.string().uuid(),
    entity_type: z.enum([...ENTITY_TYPES]),
    planned_start: z.string(),
    planned_end: z.string(),
    key_milestones: z.array(z.object({
      title: z.string(),
      date: z.string(),
      type: z.string()
    }))
  })).optional()
});

// Step 15 Governance - Add to existing schema
const step15EntitySchema = z.object({
  entity_raci: z.array(z.object({
    entity_id: z.string().uuid(),
    entity_type: z.enum([...ENTITY_TYPES]),
    raci: z.array(z.object({
      activity: z.string(),
      responsible: z.string(),
      accountable: z.string(),
      consulted: z.string().optional(),
      informed: z.string().optional()
    }))
  })).optional()
});

// Step 16 Communication - Add to existing schema
const step16EntitySchema = z.object({
  entity_communications: z.array(z.object({
    entity_id: z.string().uuid(),
    entity_type: z.enum([...ENTITY_TYPES]),
    launch_announcement: z.object({
      date: z.string(),
      channels: z.array(z.string()),
      key_messages: z.array(z.string())
    }).optional(),
    milestone_communications: z.array(z.object({
      milestone: z.string(),
      date: z.string(),
      channels: z.array(z.string())
    })).optional()
  })).optional()
});

// Step 17 Change Management - Add to existing schema
const step17EntitySchema = z.object({
  entity_impacts: z.array(z.object({
    entity_id: z.string().uuid(),
    entity_type: z.enum([...ENTITY_TYPES]),
    affected_departments: z.array(z.string()),
    impact_level: z.enum(['high', 'medium', 'low']),
    readiness_score: z.number().min(0).max(100)
  })).optional(),
  entity_training: z.array(z.object({
    entity_id: z.string().uuid(),
    training_modules: z.array(z.object({
      title: z.string(),
      target_audience: z.array(z.string()),
      duration_hours: z.number()
    }))
  })).optional()
});
```

---

### DEPENDENCY GRAPH

```
                    ┌─────────────────────────────────────────┐
                    │           DEPENDENCY ORDER               │
                    └─────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────────┐
     │  PHASE 0: Prerequisites (Step 12 Fixes)                      │
     │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
     │  │ Generator   │→ │ Batch       │→ │ Step 12     │          │
     │  │ Output Fix  │  │ Mapping Fix │  │ Queue Wire  │          │
     │  └─────────────┘  └─────────────┘  └─────────────┘          │
     └──────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────────────────┐
     │  PHASE 1: Shared Infrastructure                              │
     │  ┌─────────────────────┐  ┌─────────────────────┐           │
     │  │ useGeneratedEntities│  │ EntityReferenceCtx  │           │
     │  │ hook                │  │ context             │           │
     │  └─────────────────────┘  └─────────────────────┘           │
     └──────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌──────────────────────────────────────────────────────────────┐
     │  PHASE 2: Shared Components                                  │
     │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
     │  │ Entity   │  │ Entity   │  │ Entity   │  │ Entity   │    │
     │  │ Selector │  │ Card     │  │ Table    │  │ Timeline │    │
     │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
     └──────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
     ┌──────────┐             ┌──────────┐             ┌──────────┐
     │ Step 13  │             │ Step 14  │             │ Step 15  │
     │ Resources│             │ Timeline │             │ Governance
     └──────────┘             └──────────┘             └──────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    ▼
          ┌─────────────────────────┼─────────────────────────┐
          ▼                                                   ▼
     ┌──────────┐                                       ┌──────────┐
     │ Step 16  │                                       │ Step 17  │
     │ Comms    │                                       │ Change   │
     └──────────┘                                       └──────────┘
```

---

### DETAILED IMPLEMENTATION TIMELINE

```
Week 4: Steps 13-17 Entity Propagation
├── Day 1: Infrastructure
│   ├── Create useGeneratedEntities hook
│   ├── Create EntityReferenceContext
│   └── Update wizard data types
│
├── Day 2: Shared Components
│   ├── EntitySelector.jsx
│   ├── EntityCard.jsx
│   ├── EntityAllocationTable.jsx
│   └── EntityTimelineGantt.jsx (basic)
│
├── Day 3: Step 13 & 14 Updates
│   ├── Step7Resources.jsx - Add entity allocations tab
│   ├── Step8Timeline.jsx - Add entity timelines tab
│   ├── Update AI schemas for Steps 13-14
│   └── Test entity references in resources/timeline
│
├── Day 4: Step 15 & 16 Updates
│   ├── Step9Governance.jsx - Add entity governance tab
│   ├── Step10Communication.jsx - Add entity comms tab
│   ├── Update AI schemas for Steps 15-16
│   └── Test entity references in governance/comms
│
└── Day 5: Step 17 & Integration Testing
    ├── Step11ChangeManagement.jsx - Add entity impacts tab
    ├── Update AI schema for Step 17
    ├── End-to-end test: Step 12 → entity generation → Steps 13-17
    └── Fix any reference integrity issues
```

---

### SUCCESS CRITERIA

| Criterion | Validation Method |
|-----------|-------------------|
| Step 12 entities appear in Steps 13-17 | UI shows entity selector with correct items |
| Resources can be allocated per entity | Allocation saves to wizard_data with entity_id |
| Timeline shows entity milestones | Gantt view displays entity-specific timelines |
| Governance has entity-specific RACI | RACI builder shows per-entity activities |
| Communications link to entities | Calendar shows entity launch dates |
| Change management maps to entities | Impact assessment shows per-entity scores |
| AI generates entity-aware content | AI schemas accept and produce entity references |
| Data integrity on save | wizard_data contains valid entity_id UUIDs |

---

### ROLLBACK PLAN

If entity propagation causes issues:

1. **Feature flags**: Add `ENABLE_ENTITY_REFERENCES` flag per step
2. **Graceful degradation**: Steps work without entity data (existing behavior)
3. **Data migration**: Entity references are optional fields, no schema breaks
4. **Incremental rollout**: Enable per step, not all at once
