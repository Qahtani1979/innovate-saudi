# Step 12 (Action Plans) - Complete Implementation Plan

> **Version:** 1.0  
> **Last Updated:** 2025-12-16  
> **Status:** Gap Analysis Complete | Implementation Pending

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
| Programs | `programs` | ❌ **MISSING** | ❌ | **GAP** |
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
| `program` | `program` | `programs` table | ✅ Yes (needs generator) |
| `project` | ❌ **REMOVE** | N/A | N/A |
| `pilot` | `pilot` | `pilots` table | ✅ Yes |
| — | `challenge` | `challenges` table | ✅ Yes |
| — | `rd_call` | `rd_calls` table | ✅ Yes |
| — | `partnership` | `partnerships` table | ✅ Yes |
| — | `event` | `events` table | ✅ Yes |
| — | `policy` | `policy_documents` table | ✅ Yes |
| — | `living_lab` | `living_labs` table | ✅ Yes |
| — | `campaign` | `marketing_campaigns` table | ✅ Yes |

**Code Change** (lines 205-213):
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

**File**: `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` (lines 71-79)

```javascript
const getTypeColor = (type) => {
  const colors = {
    initiative: 'bg-blue-100 text-blue-700',
    program: 'bg-purple-100 text-purple-700',
    pilot: 'bg-orange-100 text-orange-700',
    challenge: 'bg-red-100 text-red-700',
    rd_call: 'bg-indigo-100 text-indigo-700',
    partnership: 'bg-green-100 text-green-700',
    event: 'bg-pink-100 text-pink-700',
    policy: 'bg-slate-100 text-slate-700',
    living_lab: 'bg-teal-100 text-teal-700',
    campaign: 'bg-amber-100 text-amber-700'
  };
  return colors[type] || 'bg-muted';
};
```

---

### Phase 2: Add Missing Generator

#### 2.1 Create `StrategyToProgramGenerator.jsx`

**File**: `src/components/strategy/cascade/StrategyToProgramGenerator.jsx`

Pattern: Copy from `StrategyToPilotGenerator.jsx` and adapt for programs table.

#### 2.2 Create Edge Function

**File**: `supabase/functions/strategy-program-generator/index.ts`

```typescript
// AI-powered program generation from strategic objectives
// Similar pattern to strategy-pilot-generator
```

---

### Phase 3: Expand Demand Queue

#### 3.1 Update `strategy-demand-queue-generator`

**File**: `supabase/functions/strategy-demand-queue-generator/index.ts`

**Add missing entity types to `priorityWeights`** (line ~44):

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

**Update `getGeneratorComponent`** (line ~146):

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

**Add `buildPrefilledSpec` cases** for new entity types.

---

### Phase 4: Wire Step 12 to Demand Queue

#### 4.1 Add `cascade_entity_type` Field to Action Plans

In wizard data structure and AI schema:

```javascript
{
  name_en: '',
  name_ar: '',
  type: 'challenge',           // The action type
  cascade_entity_type: null,   // NEW: Explicit entity to generate
  should_create_entity: false, // NEW: Toggle for cascade
  // ... existing fields
}
```

#### 4.2 Add UI Toggle for Entity Creation

```jsx
<div className="flex items-center gap-2">
  <Checkbox 
    checked={ap.should_create_entity} 
    onCheckedChange={(v) => updateActionPlan(apIndex, { should_create_entity: v })}
  />
  <Label className="text-xs">
    {t({ en: 'Create entity from this action', ar: 'إنشاء كيان من هذا الإجراء' })}
  </Label>
</div>
```

#### 4.3 Create Demand Queue Items on Wizard Save

**File**: `src/components/strategy/wizard/StrategyWizardWrapper.jsx`

In the save/finalize function:

```javascript
// For each action_plan where should_create_entity = true
const demandQueueItems = actionPlans
  .filter(ap => ap.should_create_entity && ap.type !== 'initiative')
  .map(ap => ({
    strategic_plan_id: planId,
    objective_id: resolveObjectiveId(ap.objective_index, objectives),
    entity_type: ap.type, // Use action type as entity type
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
      source_action_plan_index: actionPlans.indexOf(ap)
    },
    status: 'pending'
  }));

// Insert to demand_queue
if (demandQueueItems.length > 0) {
  await supabase.from('demand_queue').insert(demandQueueItems);
}
```

#### 4.4 Helper Functions

```javascript
const resolveObjectiveId = (objectiveIndex, objectives) => {
  const obj = objectives[objectiveIndex];
  return obj?.id || `obj-${objectiveIndex}`;
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

await supabase.from('action_plans').upsert(relationalPlans, {
  onConflict: 'strategic_plan_id,objective_id'
});
```

---

## 📁 Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `src/components/strategy/wizard/steps/Step6ActionPlans.jsx` | Update types, add cascade toggle, fix colors | 🔴 High |
| `src/components/strategy/wizard/StrategyWizardWrapper.jsx` | Update AI schema enum, add demand queue creation | 🔴 High |
| `supabase/functions/strategy-demand-queue-generator/index.ts` | Add missing entity types | 🔴 High |
| `src/components/strategy/cascade/StrategyToProgramGenerator.jsx` | **NEW** - Create program generator | 🟡 Medium |
| `supabase/functions/strategy-program-generator/index.ts` | **NEW** - Create edge function | 🟡 Medium |

---

## 📊 Summary of Gaps

| Gap | Severity | Fix | Phase |
|-----|----------|-----|-------|
| "project" is not an entity | 🔴 High | Remove from types | 1 |
| Missing 7 entity types in UI | 🔴 High | Add to select options | 1 |
| No enum in AI schema | 🟡 Medium | Add type enum | 1 |
| Demand queue missing 5 entities | 🔴 High | Update edge function | 3 |
| StrategyToProgramGenerator missing | 🟡 Medium | Create new component | 2 |
| No demand_queue integration | 🔴 High | Wire on finalize | 4 |
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

- [ ] **Phase 1.1**: Update Step6ActionPlans.jsx types
- [ ] **Phase 1.2**: Update AI schema in StrategyWizardWrapper.jsx
- [ ] **Phase 1.3**: Update type color mapping
- [ ] **Phase 2.1**: Create StrategyToProgramGenerator.jsx
- [ ] **Phase 2.2**: Create strategy-program-generator edge function
- [ ] **Phase 3.1**: Update strategy-demand-queue-generator
- [ ] **Phase 4.1**: Add cascade_entity_type field
- [ ] **Phase 4.2**: Add UI toggle for entity creation
- [ ] **Phase 4.3**: Wire demand queue creation on save
- [ ] **Phase 5.1**: Optional - Sync to action_plans table
