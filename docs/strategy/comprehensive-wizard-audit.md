# Comprehensive Strategic Plan Wizard Audit

**Date:** December 16, 2024  
**Scope:** All 18 wizard steps, hooks, edge functions, and entity systems

---

## 1. FILE NAMING INCONSISTENCY

### Issue: Duplicate Step Numbers
The wizard step files have inconsistent naming:

| File | Actual Step # | Issue |
|------|---------------|-------|
| `Step1Context.jsx` | Step 1 | ✅ OK |
| `Step2Vision.jsx` | Step 2a | ⚠️ Duplicate |
| `Step2SWOT.jsx` | Step 2b | ⚠️ Duplicate |
| `Step3Objectives.jsx` | Step 3a | ⚠️ Duplicate |
| `Step3Stakeholders.jsx` | Step 3b | ⚠️ Duplicate |
| `Step4NationalAlignment.jsx` | Step 4a | ⚠️ Duplicate |
| `Step4PESTEL.jsx` | Step 4b | ⚠️ Duplicate |
| `Step5KPIs.jsx` | Step 5 | ✅ OK |
| `Step6ActionPlans.jsx` | Step 6a | ⚠️ Duplicate |
| `Step6Scenarios.jsx` | Step 6b | ⚠️ Duplicate |
| `Step7Risks.jsx` | Step 7a | ⚠️ Duplicate |
| `Step7Timeline.jsx` | Step 7b | ⚠️ Duplicate |
| `Step8Dependencies.jsx` | Step 8a | ⚠️ Duplicate |
| `Step8Review.jsx` | Step 8b | ⚠️ Duplicate |
| `Step13Resources.jsx` | Step 13 | ✅ OK |
| `Step15Governance.jsx` | Step 15 | ✅ OK |
| `Step16Communication.jsx` | Step 16 | ✅ OK |
| `Step18Review.jsx` | Step 18 | ✅ OK |

**Missing:** Steps 9, 10, 11, 12, 14, 17

---

## 2. CRITICAL INTEGRATION GAPS

### 2.1 Entity Generation Disconnect
**Severity:** 🔴 CRITICAL

Steps 6-8 create action plans, but they **DO NOT** integrate with:
- `demand_queue` table
- Entity generators (`strategy-challenge-generator`, `strategy-pilot-generator`, etc.)
- `generated_entity_id` tracking

#### Current Flow (Broken):
```
Step6ActionPlans → Local state only → Never reaches demand_queue
```

#### Expected Flow:
```
Step6ActionPlans → useActionPlans hook → demand_queue → 
  → Edge Function Generator → DB Entity → generated_entity_id back to queue
```

### 2.2 Steps 13-17 Entity Isolation
**Severity:** 🔴 CRITICAL

These steps are completely isolated from generated entities:

| Step | Current State | Required |
|------|---------------|----------|
| Step 13 (Resources) | Generic `resource_plan` | `resource_plan.entity_allocations[{entity_id, entity_type}]` |
| Step 14 (Timeline) | Missing | `milestones.entity_milestones[{entity_id}]` |
| Step 15 (Governance) | Generic RACI | `governance.entity_oversight[{entity_id}]` |
| Step 16 (Communication) | Generic messages | `communication_plan.entity_launches[{entity_id}]` |
| Step 17 (Change) | Missing | `change_management.entity_training[{entity_id}]` |

---

## 3. DATA STRUCTURE ANALYSIS

### 3.1 Step6ActionPlans Data Model
```javascript
// Current (Incomplete)
{
  action_plans: [{
    name_en, name_ar,
    description_en, description_ar,
    objective_index,  // ← Links to objective
    type: 'initiative' | 'program' | 'project' | 'pilot',
    priority, budget_estimate,
    start_date, end_date,
    owner, deliverables, dependencies
  }]
}
```

**Missing:**
- `strategic_plan_id` (foreign key)
- `generated_entity_id` (reference to created entity)
- `queue_item_id` (reference to demand_queue)
- `generation_status`: 'pending' | 'in_progress' | 'generated' | 'failed'

### 3.2 Step13Resources Data Model
```javascript
// Current
{
  resource_plan: {
    hr_requirements: [],
    budget_allocation: [],
    technology_needs: []
  }
}
```

**Missing:**
- `entity_allocations[]` with `entity_id`, `entity_type`
- Per-entity resource tracking

### 3.3 Step15Governance Data Model
```javascript
// Current
{
  governance: {
    committees: [],
    reporting_frequency,
    decision_rights: []
  }
}
```

**Missing:**
- `entity_oversight[]` with RACI per entity
- Entity-specific reporting requirements

### 3.4 Step16Communication Data Model
```javascript
// Current
{
  communication_plan: {
    internal_channels: [],
    external_channels: [],
    key_messages: []
  }
}
```

**Missing:**
- `entity_launches[]` with launch dates per entity
- Entity-specific messaging

---

## 4. HOOK USAGE ANALYSIS

### 4.1 Available Hooks (in `src/hooks/strategy/`)

| Hook | Used By | Status |
|------|---------|--------|
| `useActionPlans.js` | Not connected to wizard | ⚠️ Orphaned |
| `useDemandQueue.js` | Not used in steps | ⚠️ Orphaned |
| `useQueueAutoPopulation.js` | Unknown | ⚠️ Review |
| `useWizardValidation.js` | Unknown | ⚠️ Review |
| `useStrategicCascadeValidation.js` | Unknown | ⚠️ Review |
| `useStrategyAlignment.js` | Unknown | ⚠️ Review |

### 4.2 Required New Hooks
- `useEntityGeneration.js` - Trigger and track entity generation
- `useEntityResourceAllocation.js` - Step 13 entity support
- `useEntityTimeline.js` - Step 14 entity milestones
- `useEntityGovernance.js` - Step 15 entity RACI
- `useEntityCommunication.js` - Step 16 entity launches

---

## 5. EDGE FUNCTION ANALYSIS

### 5.1 Generator Functions (Exist but Not Integrated)

| Function | Purpose | Integration Status |
|----------|---------|-------------------|
| `strategy-challenge-generator` | Generate challenges | ❌ Not called from wizard |
| `strategy-pilot-generator` | Generate pilots | ❌ Not called from wizard |
| `strategy-program-theme-generator` | Generate programs | ❌ Not called from wizard |
| `strategy-sandbox-planner` | Generate sandboxes | ❌ Not called from wizard |
| `strategy-lab-research-generator` | Generate living labs | ❌ Not called from wizard |
| `strategy-rd-call-generator` | Generate R&D calls | ❌ Not called from wizard |
| `strategy-partnership-matcher` | Generate partnerships | ❌ Not called from wizard |
| `strategy-batch-generator` | Batch processing | ❌ Not triggered |
| `strategy-quality-assessor` | Quality scoring | ❌ Not integrated |

### 5.2 Supporting Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `queue-processor` | Process demand queue | ⚠️ Needs review |
| `strategy-demand-queue-generator` | Populate queue | ⚠️ Needs review |
| `strategy-action-plan-generator` | Generate action plans | ❌ Not connected |

---

## 6. DATABASE SCHEMA GAPS

### 6.1 Tables Exist but Under-utilized

```sql
-- demand_queue table exists but not populated from wizard
-- generation_history table exists but not tracked

-- Missing: generated_entity tracking in strategic_plans
ALTER TABLE strategic_plans ADD COLUMN generated_entities JSONB DEFAULT '[]';
```

### 6.2 Required Schema Updates

```sql
-- Add entity tracking to action_plans
ALTER TABLE action_plans ADD COLUMN generated_entity_id UUID;
ALTER TABLE action_plans ADD COLUMN entity_type TEXT;
ALTER TABLE action_plans ADD COLUMN generation_status TEXT DEFAULT 'pending';

-- Add entity allocations to resource tracking
CREATE TABLE resource_entity_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_plan_id UUID REFERENCES resource_plans(id),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  allocation_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. UI/UX ISSUES

### 7.1 Step Navigation
- Step numbers in UI don't match file names
- Missing breadcrumb showing actual progress
- No visual indicator for which steps generate entities

### 7.2 Entity Generation UX
- No "Generate Entities" button in Step 6
- No entity status dashboard
- No way to see generated entities from previous runs

### 7.3 Bilingual Support
- ✅ Most steps have `_en` and `_ar` fields
- ⚠️ Some legacy fields still use single `text` or `name` fields
- ⚠️ Helper functions handle legacy format but add complexity

---

## 8. RECOMMENDED FIXES

### Priority 1: Entity Integration (Week 1)
1. Connect `Step6ActionPlans` to `useActionPlans` hook
2. Add "Generate Entities" button that populates `demand_queue`
3. Wire up entity generators through `strategy-batch-generator`
4. Track `generated_entity_id` back to action plans

### Priority 2: Steps 13-17 Entity Propagation (Week 2)
1. Add `entity_id` fields to resource allocations
2. Create entity-aware timeline milestones
3. Extend governance RACI for entities
4. Add entity launch tracking to communication
5. Map change management to affected entities

### Priority 3: Missing Steps (Week 3)
1. Create Step 9-12 components if needed
2. Create Step 14 (Timeline with entities)
3. Create Step 17 (Change Management)
4. Fix file naming to sequential numbers

### Priority 4: Hook Consolidation (Week 4)
1. Connect orphaned hooks to wizard
2. Create missing entity-aware hooks
3. Add validation using `useWizardValidation`

---

## 9. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STRATEGIC PLAN WIZARD                        │
├─────────────────────────────────────────────────────────────────────┤
│ Steps 1-5: Context, Vision, Stakeholders, Analysis, KPIs           │
│ └── Data flows to strategic_plans table                            │
├─────────────────────────────────────────────────────────────────────┤
│ Step 6: Action Plans  ←──── BROKEN LINK ────→  demand_queue        │
│ └── Should trigger entity generation                               │
├─────────────────────────────────────────────────────────────────────┤
│ Steps 7-8: Risks, Dependencies, Review                             │
│ └── No entity awareness                                            │
├─────────────────────────────────────────────────────────────────────┤
│ Steps 9-12: MISSING FILES                                          │
│ └── Need investigation                                             │
├─────────────────────────────────────────────────────────────────────┤
│ Steps 13-17: Resources, Timeline, Governance, Comms, Change        │
│ └── NO entity_id references                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Step 18: Final Review                                              │
│ └── PDF/Excel export works                                         │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ SHOULD CONNECT TO ↓

┌─────────────────────────────────────────────────────────────────────┐
│                      ENTITY GENERATION LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│ demand_queue → queue-processor → strategy-*-generator               │
│                                                                     │
│ Entity Types:                                                       │
│ - challenges    → strategy-challenge-generator                      │
│ - programs      → strategy-program-theme-generator                  │
│ - pilots        → strategy-pilot-generator                          │
│ - sandboxes     → strategy-sandbox-planner                          │
│ - living_labs   → strategy-lab-research-generator                   │
│ - partnerships  → strategy-partnership-matcher                      │
│ - rd_calls      → strategy-rd-call-generator                        │
│                                                                     │
│ Quality: strategy-quality-assessor                                  │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ WRITES TO ↓

┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE ENTITY TABLES                         │
├─────────────────────────────────────────────────────────────────────┤
│ challenges, programs, pilots, sandboxes, living_labs,               │
│ partnerships, rd_calls                                              │
│                                                                     │
│ All with: strategic_plan_ids[], is_strategy_derived: true          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. FILES TO CREATE/MODIFY

### New Files Needed:
1. `src/components/strategy/wizard/EntityGenerationPanel.jsx`
2. `src/components/strategy/wizard/EntityStatusDashboard.jsx`
3. `src/hooks/strategy/useEntityGeneration.js`
4. `src/hooks/strategy/useEntityResourceAllocation.js`
5. `src/components/strategy/wizard/steps/Step14Timeline.jsx` (with entities)
6. `src/components/strategy/wizard/steps/Step17ChangeManagement.jsx`

### Files to Modify:
1. `Step6ActionPlans.jsx` - Add entity generation trigger
2. `Step13Resources.jsx` - Add entity_id support
3. `Step15Governance.jsx` - Add entity RACI
4. `Step16Communication.jsx` - Add entity launches
5. `useActionPlans.js` - Connect to wizard
6. `useDemandQueue.js` - Expose to wizard components

---

## 11. TESTING CHECKLIST

After fixes, verify:

- [ ] Action plan creation triggers demand_queue entry
- [ ] Entity generators are invoked correctly
- [ ] Generated entities have `is_strategy_derived: true`
- [ ] `generated_entity_id` is stored back in action plan
- [ ] Steps 13-17 can reference generated entities
- [ ] Resource allocation tracks per-entity
- [ ] Timeline shows entity milestones
- [ ] Governance RACI includes entities
- [ ] Communication plan shows entity launches
- [ ] Change management maps to affected entities
- [ ] Final review shows all generated entities

---

**Next Steps:** Proceed with Priority 1 fixes - Entity Integration
