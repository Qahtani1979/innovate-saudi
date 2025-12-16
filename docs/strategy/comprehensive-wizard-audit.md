# Comprehensive Strategic Plan Wizard Audit

**Date:** December 16, 2024  
**Last Updated:** December 16, 2024  
**Scope:** All 18 wizard steps, hooks, edge functions, and entity systems

---

## IMPLEMENTATION STATUS SUMMARY

| Category | Status | Notes |
|----------|--------|-------|
| Entity Integration (Step 12) | ✅ COMPLETE | EntityGenerationPanel, useEntityGeneration hook |
| Steps 13-17 Entity Propagation | ✅ COMPLETE | EntityAllocationSelector UI added to all steps |
| strategicPlanId Prop Passing | ✅ COMPLETE | Both StrategyWizardWrapper & StrategyCreateWizard |
| Hook Consolidation | ✅ COMPLETE | useEntityGeneration, useDemandQueue connected |
| Edge Function Integration | ✅ COMPLETE | Generators connected via batch-generator |
| File Naming | ⚠️ DEFERRED | Low priority - works as-is |

---

## 1. FILE NAMING INCONSISTENCY

### Issue: Duplicate Step Numbers (DEFERRED - Low Priority)
The wizard step files have inconsistent naming but work correctly with the mapping in StrategyWizardWrapper:

| File | Maps To Step | Status |
|------|--------------|--------|
| `Step1Context.jsx` | Step 1 | ✅ Working |
| `Step2Vision.jsx` | Step 2 | ✅ Working |
| `Step2SWOT.jsx` | Step 5 | ✅ Working |
| `Step3Objectives.jsx` | Step 9 | ✅ Working |
| `Step3Stakeholders.jsx` | Step 3 | ✅ Working |
| `Step4NationalAlignment.jsx` | Step 10 | ✅ Working |
| `Step4PESTEL.jsx` | Step 4 | ✅ Working |
| `Step5KPIs.jsx` | Step 11 | ✅ Working |
| `Step6ActionPlans.jsx` | Step 12 | ✅ ENHANCED with EntityGenerationPanel |
| `Step6Scenarios.jsx` | Step 6 | ✅ Working |
| `Step7Risks.jsx` | Step 7 | ✅ Working |
| `Step7Timeline.jsx` | Step 14 | ✅ ENHANCED with entity_milestones, entity_phases + UI |
| `Step8Dependencies.jsx` | Step 8 | ✅ Working |
| `Step8Review.jsx` | - | ⚠️ Legacy, not used |
| `Step13Resources.jsx` | Step 13 | ✅ ENHANCED with entity_allocations + UI |
| `Step15Governance.jsx` | Step 15 | ✅ ENHANCED with strategicPlanId |
| `Step16Communication.jsx` | Step 16/17 | ✅ ENHANCED with entity_launches/entity_training + UI |
| `Step18Review.jsx` | Step 18 | ✅ Working |

---

## 2. CRITICAL INTEGRATION GAPS - ALL RESOLVED ✅

### 2.1 Entity Generation Disconnect - FIXED ✅
**Status:** RESOLVED

#### Previous State (Broken):
```
Step6ActionPlans → Local state only → Never reaches demand_queue
```

#### Current State (Working):
```
Step6ActionPlans → EntityGenerationPanel → useEntityGeneration hook
  → queueForGeneration → demand_queue table
  → triggerBatchGeneration → strategy-batch-generator
  → Individual generators → DB Entity → generated_entity_id
```

**Files Created:**
- `src/hooks/strategy/useEntityGeneration.js` - Core entity generation logic
- `src/components/strategy/wizard/EntityGenerationPanel.jsx` - UI component

**Files Modified:**
- `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` - Added EntityGenerationPanel

### 2.2 Steps 13-17 Entity Propagation - FIXED ✅
**Status:** RESOLVED

| Step | Previous State | Current State |
|------|----------------|---------------|
| Step 13 (Resources) | Generic `resource_plan` | ✅ `entity_allocations[]` via EntityAllocationSelector UI |
| Step 14 (Timeline) | No entity support | ✅ `entity_milestones[]` and `entity_phases[]` with EntityAllocationSelector UI |
| Step 15 (Governance) | Generic RACI | ✅ `strategicPlanId` passed for future entity_oversight |
| Step 16 (Communication) | Generic messages | ✅ `entity_launches[]` in key_messages with EntityAllocationSelector UI |
| Step 17 (Change) | Generic training | ✅ `entity_training[]` in training_plan with EntityAllocationSelector UI |

**Files Created:**
- `src/components/strategy/wizard/EntityAllocationSelector.jsx` - Reusable entity linking component

**Files Modified:**
- `src/components/strategy/wizard/steps/Step13Resources.jsx` - Added EntityAllocationSelector UI
- `src/components/strategy/wizard/steps/Step7Timeline.jsx` - Added EntityAllocationSelector UI for phases & milestones
- `src/components/strategy/wizard/steps/Step16Communication.jsx` - Added EntityAllocationSelector UI for messages & training
- `src/components/strategy/wizard/StrategyWizardWrapper.jsx` - Pass strategicPlanId to steps 12-17
- `src/components/strategy/wizard/StrategyCreateWizard.jsx` - Pass strategicPlanId={null} to steps 12-17

---

## 3. DATA STRUCTURE ANALYSIS - COMPLETE ✅

### 3.1 Step6ActionPlans Data Model
```javascript
// Current (Complete) ✅
{
  action_plans: [{
    name_en, name_ar,
    description_en, description_ar,
    objective_index,
    type: 'challenge' | 'pilot' | 'program' | 'campaign' | 'event' | 'policy' | 'rd_call' | 'partnership' | 'living_lab',
    priority, budget_estimate,
    start_date, end_date,
    owner, deliverables, dependencies,
    should_create_entity: boolean  // ✅ Added - triggers queue population
  }]
}
```

### 3.2 Step13Resources Data Model
```javascript
// Current (Complete) ✅
{
  resource_plan: {
    hr_requirements: [{
      id, name_en, name_ar, quantity, cost,
      notes_en, notes_ar,
      entity_allocations: [{entity_id, entity_type}]  // ✅ Added with UI
    }],
    technology_requirements: [...],
    infrastructure_requirements: [...],
    budget_allocation: [...]
  }
}
```

### 3.3 Step14Timeline Data Model
```javascript
// Current (Complete) ✅
{
  milestones: [{
    name_en, name_ar, date, type, status,
    description_en, description_ar,
    entity_milestones: [{entity_id, entity_type}]  // ✅ Added with UI
  }],
  phases: [{
    name_en, name_ar, start_date, end_date,
    description_en, description_ar,
    objectives_covered: [],
    entity_phases: [{entity_id, entity_type}]  // ✅ Added with UI
  }]
}
```

### 3.4 Step16Communication Data Model
```javascript
// Current (Complete) ✅
{
  communication_plan: {
    key_messages: [{
      id, text_en, text_ar, audience, channel,
      entity_launches: [{entity_id, entity_type}]  // ✅ Added with UI
    }],
    ...
  }
}
```

### 3.5 Step17Change Data Model
```javascript
// Current (Complete) ✅
{
  change_management: {
    training_plan: [{
      id, name_en, name_ar,
      target_audience_en, target_audience_ar,
      duration_en, duration_ar,
      timeline_en, timeline_ar,
      entity_training: [{entity_id, entity_type}]  // ✅ Added with UI
    }],
    ...
  }
}
```

---

## 4. HOOK USAGE ANALYSIS - COMPLETE ✅

### 4.1 Hooks Status

| Hook | Status | Connected To |
|------|--------|-------------|
| `useEntityGeneration.js` | ✅ NEW | EntityGenerationPanel, Step6ActionPlans |
| `useActionPlans.js` | ✅ Available | Can be used for DB persistence |
| `useDemandQueue.js` | ✅ Connected | EntityGenerationPanel, useEntityGeneration |
| `useQueueAutoPopulation.js` | ✅ Available | BatchGenerationControls |
| `useWizardValidation.js` | ✅ Connected | StrategyWizardWrapper |
| `useStrategicCascadeValidation.js` | ✅ Available | Validation utilities |
| `useStrategyAlignment.js` | ✅ Available | Alignment calculations |

---

## 5. EDGE FUNCTION ANALYSIS - COMPLETE ✅

### 5.1 Generator Functions

| Function | Status | Integration |
|----------|--------|-------------|
| `strategy-challenge-generator` | ✅ Connected | Via strategy-batch-generator |
| `strategy-pilot-generator` | ✅ Connected | Via strategy-batch-generator |
| `strategy-program-generator` | ✅ Connected | Via strategy-batch-generator |
| `strategy-campaign-generator` | ✅ Connected | Via strategy-batch-generator |
| `strategy-event-planner` | ✅ Connected | Via strategy-batch-generator |
| `strategy-policy-generator` | ✅ Connected | Via strategy-batch-generator |
| `strategy-partnership-matcher` | ✅ Connected | Via strategy-batch-generator |
| `strategy-rd-call-generator` | ✅ Connected | Via strategy-batch-generator |
| `strategy-lab-research-generator` | ✅ Connected | Via strategy-batch-generator |
| `strategy-batch-generator` | ✅ Triggered | useEntityGeneration.triggerBatchGeneration |
| `strategy-quality-assessor` | ✅ Integrated | Called by batch-generator |

### 5.2 Supporting Functions

| Function | Status | Notes |
|----------|--------|-------|
| `queue-processor` | ✅ Available | Background processing |
| `strategy-demand-queue-generator` | ✅ Available | Gap analysis queue population |
| `strategy-gap-analysis` | ✅ Available | Coverage analysis |

---

## 6. DATABASE SCHEMA - NO CHANGES NEEDED

The existing `demand_queue` table schema is sufficient:
- `strategic_plan_id` - Links to plan
- `entity_type` - Type of entity to generate
- `prefilled_spec` - JSON with generation context
- `generated_entity_id` - Result tracking
- `quality_score` - Quality assessment result
- `status` - Generation status tracking

---

## 7. UI/UX IMPROVEMENTS - COMPLETE ✅

### 7.1 Entity Generation UX
- ✅ "Generate Entities" collapsible panel in Step 12
- ✅ Entity type selection with visual indicators
- ✅ Progress tracking with status badges
- ✅ Queue status dashboard

### 7.2 Entity Allocation UX
- ✅ EntityAllocationSelector component for linking entities
- ✅ Dropdown with entity types grouped
- ✅ Badge display for selected entities
- ✅ Quality score display

---

## 8. OPTIONAL FUTURE ENHANCEMENTS

### Low Priority (Future)
1. **EntityStatusDashboard** - Dedicated view of all generated entities
2. **Entity RACI** - Add entity-specific RACI in Step15Governance
3. **Entity Timeline View** - Visual Gantt of entity milestones
4. **File Renaming** - Sequential step numbers (cosmetic)

---

## 9. ARCHITECTURE DIAGRAM - FINAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STRATEGIC PLAN WIZARD                        │
├─────────────────────────────────────────────────────────────────────┤
│ Steps 1-11: Context, Vision, Stakeholders, Analysis, KPIs          │
│ └── Data flows to strategic_plans table                            │
├─────────────────────────────────────────────────────────────────────┤
│ Step 12: Action Plans  ← ✅ CONNECTED → demand_queue               │
│ └── EntityGenerationPanel triggers entity generation               │
│ └── useEntityGeneration hook manages queue and batch generation    │
├─────────────────────────────────────────────────────────────────────┤
│ Step 13: Resources ← ✅ entity_allocations via EntityAllocationSelector UI │
│ Step 14: Timeline  ← ✅ entity_milestones, entity_phases with UI   │
│ Step 15: Governance ← ✅ strategicPlanId passed                    │
│ Step 16: Communication ← ✅ entity_launches with UI                │
│ Step 17: Change Management ← ✅ entity_training with UI            │
├─────────────────────────────────────────────────────────────────────┤
│ Step 18: Final Review                                              │
│ └── PDF/Excel export works                                         │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ CONNECTED ↓

┌─────────────────────────────────────────────────────────────────────┐
│                      ENTITY GENERATION LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│ useEntityGeneration.queueForGeneration → demand_queue               │
│ useEntityGeneration.triggerBatchGeneration → strategy-batch-generator│
│                                                                     │
│ Entity Types (9 total):                                             │
│ ├── challenges    → strategy-challenge-generator                    │
│ ├── programs      → strategy-program-generator                      │
│ ├── pilots        → strategy-pilot-generator                        │
│ ├── campaigns     → strategy-campaign-generator                     │
│ ├── events        → strategy-event-planner                          │
│ ├── policies      → strategy-policy-generator                       │
│ ├── partnerships  → strategy-partnership-matcher                    │
│ ├── rd_calls      → strategy-rd-call-generator                      │
│ └── living_labs   → strategy-lab-research-generator                 │
│                                                                     │
│ Quality: strategy-quality-assessor (integrated)                     │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ WRITES TO ↓

┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE ENTITY TABLES                         │
├─────────────────────────────────────────────────────────────────────┤
│ challenges, programs, pilots, campaigns, events, policies,          │
│ partnerships, rd_calls, living_labs                                 │
│                                                                     │
│ All with: strategic_plan_ids[], is_strategy_derived: true          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. FILES CREATED/MODIFIED - COMPLETE LIST

### New Files Created:
1. ✅ `src/hooks/strategy/useEntityGeneration.js`
2. ✅ `src/components/strategy/wizard/EntityGenerationPanel.jsx`
3. ✅ `src/components/strategy/wizard/EntityAllocationSelector.jsx`

### Files Modified:
1. ✅ `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` - EntityGenerationPanel
2. ✅ `src/components/strategy/wizard/steps/Step13Resources.jsx` - EntityAllocationSelector UI
3. ✅ `src/components/strategy/wizard/steps/Step7Timeline.jsx` - EntityAllocationSelector UI for phases & milestones
4. ✅ `src/components/strategy/wizard/steps/Step16Communication.jsx` - EntityAllocationSelector UI for messages & training
5. ✅ `src/components/strategy/wizard/StrategyWizardWrapper.jsx` - strategicPlanId to steps 12-17
6. ✅ `src/components/strategy/wizard/StrategyCreateWizard.jsx` - strategicPlanId={null} to steps 12-17

---

## 11. TESTING CHECKLIST

After fixes, verify:

- [x] Action plan `should_create_entity` toggle works
- [x] EntityGenerationPanel displays in Step 12
- [x] Queue population via "Add to Queue" button
- [x] Batch generation via "Generate Entities" button
- [x] Entity type counts display correctly
- [x] Step 13 shows EntityAllocationSelector UI for resources
- [x] Step 14 shows EntityAllocationSelector UI for phases AND milestones
- [x] Step 16 shows EntityAllocationSelector UI for key messages
- [x] Step 17 shows EntityAllocationSelector UI for training items
- [x] strategicPlanId passed to Steps 12-17 in StrategyWizardWrapper
- [x] strategicPlanId={null} passed to Steps 12-17 in StrategyCreateWizard

---

**Status:** ✅ ALL IMPLEMENTATION COMPLETE

All critical items from the audit have been implemented. The wizard now supports:
1. Entity generation from action plans via demand_queue
2. Entity propagation across Steps 13-17 with full UI
3. Full integration with demand_queue and batch generators
4. Both StrategyWizardWrapper and StrategyCreateWizard properly configured
