# Step 12 (Action Plans) - Complete Implementation Plan

> **Version:** 1.1  
> **Last Updated:** 2025-12-16  
> **Status:** Gap Analysis Complete | Implementation Pending

---

## 📋 Executive Summary

This document provides a complete implementation plan for fixing Step 12 (Action Plans) in the Strategic Plan Builder wizard to align with the Entity Integration Model. It identifies ALL pages, components, hooks, edge functions, tables, and AI schemas that need updates.

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
| **Step6ActionPlans** | `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` | 🔴 HIGH | Update action types, add colors, add cascade toggle |
| **StrategyWizardWrapper** | `src/components/strategy/wizard/StrategyWizardWrapper.jsx` | 🔴 HIGH | Update AI schema enum, add demand queue creation on save |
| **DemandDashboard** | `src/components/strategy/demand/DemandDashboard.jsx` | 🟡 MEDIUM | Add support for new entity types in UI |
| **BatchGenerationControls** | `src/components/strategy/demand/BatchGenerationControls.jsx` | 🟡 MEDIUM | Add new entity type handlers |
| **QueueAwareGeneratorWrapper** | `src/components/strategy/demand/QueueAwareGeneratorWrapper.jsx` | 🟡 MEDIUM | Add new generator mappings |
| **ActionPlanBuilder** | `src/components/strategy/creation/ActionPlanBuilder.jsx` | 🟢 LOW | Optional: Add entity cascade option |

### C. CASCADE GENERATORS (Components)

| Generator | File Path | Status | Table Target |
|-----------|-----------|--------|--------------|
| StrategyChallengeGenerator | `src/components/strategy/cascade/StrategyChallengeGenerator.jsx` | ✅ EXISTS | `challenges` |
| StrategyToPilotGenerator | `src/components/strategy/cascade/StrategyToPilotGenerator.jsx` | ✅ EXISTS | `pilots` |
| StrategyToCampaignGenerator | `src/components/strategy/cascade/StrategyToCampaignGenerator.jsx` | ✅ EXISTS | `marketing_campaigns` |
| StrategyToEventGenerator | `src/components/strategy/cascade/StrategyToEventGenerator.jsx` | ✅ EXISTS | `events` |
| StrategyToPolicyGenerator | `src/components/strategy/cascade/StrategyToPolicyGenerator.jsx` | ✅ EXISTS | `policy_documents` |
| StrategyToRDCallGenerator | `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx` | ✅ EXISTS | `rd_calls` |
| StrategyToPartnershipGenerator | `src/components/strategy/cascade/StrategyToPartnershipGenerator.jsx` | ✅ EXISTS | `partnerships` |
| StrategyToLivingLabGenerator | `src/components/strategy/cascade/StrategyToLivingLabGenerator.jsx` | ✅ EXISTS | `living_labs` |
| **StrategyToProgramGenerator** | `src/components/strategy/StrategyToProgramGenerator.jsx` | ⚠️ WRONG LOCATION | Move to `cascade/` folder |
| StrategyToSandboxGenerator | N/A | ❌ MISSING | `sandboxes` (optional) |

### D. HOOKS TO UPDATE

| Hook | File Path | Priority | Changes Required |
|------|-----------|----------|------------------|
| **useDemandQueue** | `src/hooks/strategy/useDemandQueue.js` | 🟢 LOW | No changes needed - generic |
| **useGapAnalysis** | `src/hooks/strategy/useGapAnalysis.js` | 🟡 MEDIUM | Ensure all entity types supported |
| **useActionPlans** | `src/hooks/strategy/useActionPlans.js` | 🟡 MEDIUM | Add `cascade_entity_type` support |
| **useQueueAutoPopulation** | `src/hooks/strategy/useQueueAutoPopulation.js` | 🟢 LOW | No changes needed |
| **useQueueNotifications** | `src/hooks/strategy/useQueueNotifications.js` | 🟢 LOW | No changes needed |
| **useAutoSaveDraft** | `src/hooks/strategy/useAutoSaveDraft.js` | 🟡 MEDIUM | Ensure new fields are saved |

### E. EDGE FUNCTIONS TO UPDATE

| Edge Function | File Path | Status | Changes Required |
|---------------|-----------|--------|------------------|
| **strategy-demand-queue-generator** | `supabase/functions/strategy-demand-queue-generator/index.ts` | 🔴 HIGH | Add missing entity types (programs, rd_calls, partnerships, living_labs) |
| **strategy-batch-generator** | `supabase/functions/strategy-batch-generator/index.ts` | 🟡 MEDIUM | Add new generator mappings |
| strategy-action-plan-generator | `supabase/functions/strategy-action-plan-generator/index.ts` | 🟢 LOW | Optional: Add cascade_entity_type |
| strategy-challenge-generator | `supabase/functions/strategy-challenge-generator/index.ts` | ✅ OK | No changes |
| strategy-pilot-generator | `supabase/functions/strategy-pilot-generator/index.ts` | ✅ OK | No changes |
| strategy-campaign-generator | `supabase/functions/strategy-campaign-generator/index.ts` | ✅ OK | No changes |
| strategy-event-planner | `supabase/functions/strategy-event-planner/index.ts` | ✅ OK | No changes |
| strategy-policy-generator | `supabase/functions/strategy-policy-generator/index.ts` | ✅ OK | No changes |
| strategy-rd-call-generator | `supabase/functions/strategy-rd-call-generator/index.ts` | ✅ OK | No changes |
| strategy-partnership-matcher | `supabase/functions/strategy-partnership-matcher/index.ts` | ✅ OK | No changes |
| **strategy-program-generator** | N/A | ❌ MISSING | CREATE NEW |
| strategy-gap-analysis | `supabase/functions/strategy-gap-analysis/index.ts` | 🟡 MEDIUM | Add program coverage metrics |
| strategy-quality-assessor | `supabase/functions/strategy-quality-assessor/index.ts` | ✅ OK | No changes |

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

## 📊 Current State Analysis

### A. Step 12 Wizard Component

**File**: `src/components/strategy/wizard/steps/Step6ActionPlans.jsx`

| Aspect | Current State | Gap |
|--------|---------------|-----|
| **Data Storage** | JSONB in `wizard_data.action_plans` | ❌ Not using `action_plans` table |
| **Action Types** | `initiative`, `program`, `project`, `pilot` | ❌ "project" is NOT an entity |
| **AI Schema** | `type: { type: 'string' }` (no enum) | ❌ No entity-type validation |
| **Entity Linkage** | Uses `objective_index` (0-based) | ❌ Should use `objective_id` (UUID) |
| **Cascade Integration** | None | ❌ No `demand_queue` items created |

### B. Entity Integration Model (10 Direct Entities)

| Entity | DB Table | Cascade Generator | Demand Queue | Status |
|--------|----------|-------------------|--------------|--------|
| Challenges | `challenges` | ✅ StrategyChallengeGenerator | ✅ | Complete |
| Pilots | `pilots` | ✅ StrategyToPilotGenerator | ✅ | Complete |
| Programs | `programs` | ⚠️ StrategyToProgramGenerator (wrong location) | ❌ | **GAP** |
| Living Labs | `living_labs` | ✅ StrategyToLivingLabGenerator | ❌ | Partial |
| Sandboxes | `sandboxes` | ❌ N/A | ❌ | Not cascadable |
| Partnerships | `partnerships` | ✅ StrategyToPartnershipGenerator | ❌ | Partial |
| Events | `events` | ✅ StrategyToEventGenerator | ✅ | Complete |
| Policies | `policy_documents` | ✅ StrategyToPolicyGenerator | ✅ | Complete |
| R&D Calls | `rd_calls` | ✅ StrategyToRDCallGenerator | ❌ | Partial |
| Campaigns | `marketing_campaigns` | ✅ StrategyToCampaignGenerator | ✅ | Complete |

### C. When Does Entity Generation Happen?

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    ENTITY GENERATION PATHWAYS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PATH 1: MANUAL CASCADE (Strategy Hub → Cascade Tab)                           │
│  ───────────────────────────────────────────────────                           │
│  User selects objective → Opens Generator → AI generates → Saves to entity     │
│  Files: src/components/strategy/cascade/Strategy*Generator.jsx                  │
│  Saves to: challenges, pilots, events, etc. (with strategic_plan_ids[])        │
│                                                                                 │
│  PATH 2: DEMAND-DRIVEN QUEUE (Gap Analysis → Queue → Batch Generation)         │
│  ─────────────────────────────────────────────────────────────────────         │
│  Gap Analysis → demand_queue items → QueueAwareGeneratorWrapper → Entity       │
│  Edge Functions:                                                                │
│    - strategy-gap-analysis → Identifies coverage gaps                          │
│    - strategy-demand-queue-generator → Creates queue items                     │
│    - strategy-batch-generator → Processes queue automatically                  │
│  Tables: demand_queue, generation_history, coverage_snapshots                  │
│                                                                                 │
│  PATH 3: ACTION PLAN BUILDER (Standalone Page)                                 │
│  ─────────────────────────────────────────────                                 │
│  /action-plan-page → ActionPlanBuilder → useActionPlans hook                   │
│  Saves to: action_plans, action_items tables (relational)                      │
│  Edge Function: strategy-action-plan-generator                                 │
│  ❌ Does NOT create entities - just plans/items                                │
│                                                                                 │
│  PATH 4: WIZARD STEP 12 (Current - BROKEN)                                     │
│  ─────────────────────────────────────────                                     │
│  StrategicPlanBuilder → Step6ActionPlans                                       │
│  Saves to: wizard_data.action_plans (JSONB only)                               │
│  ❌ Does NOT save to action_plans table                                        │
│  ❌ Does NOT create demand_queue items                                         │
│  ❌ Does NOT generate entities                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Implementation Plan

### Phase 1: Fix Action Type Consistency

#### 1.1 Update Step 12 UI Types

**File**: `src/components/strategy/wizard/steps/Step6ActionPlans.jsx`

Replace current types with entity-aligned types:

| Current Type | New Type | Maps To | Can Cascade? |
|--------------|----------|---------|--------------|
| `initiative` | `initiative` | Narrative only | ❌ No |
| `program` | `program` | `programs` table | ✅ Yes |
| `project` | ❌ **REMOVE** | N/A | N/A |
| `pilot` | `pilot` | `pilots` table | ✅ Yes |
| — | `challenge` | `challenges` table | ✅ Yes |
| — | `rd_call` | `rd_calls` table | ✅ Yes |
| — | `partnership` | `partnerships` table | ✅ Yes |
| — | `event` | `events` table | ✅ Yes |
| — | `policy` | `policy_documents` table | ✅ Yes |
| — | `living_lab` | `living_labs` table | ✅ Yes |
| — | `campaign` | `marketing_campaigns` table | ✅ Yes |

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
