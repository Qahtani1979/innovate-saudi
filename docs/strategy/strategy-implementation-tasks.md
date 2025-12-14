# Strategy System - Implementation Tasks

**Generated:** 2025-12-14  
**Based on:** Deep Implementation Analysis (Section G & H of integration-matrix.md)  
**Priority:** Critical → High → Medium → Low

---

## TASK SUMMARY

| Priority | Category | Tasks | Effort |
|----------|----------|-------|--------|
| 🔴 Critical | Database Schema | 4 | 2h |
| 🔴 Critical | Generator Fixes | 9 | 4h |
| 🟠 High | Approval Integration | 3 | 3h |
| 🟡 Medium | UI Enhancements | 4 | 4h |
| 🟢 Low | Documentation | 2 | 1h |
| **TOTAL** | | **22 tasks** | **~14h** |

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

### TASK-DB-002: Fix `challenges` strategic_plan_ids type
**Priority:** Critical  
**Effort:** 20 min  
**Status:** ❌ Not Started

```sql
-- Migration: fix_challenges_strategic_fields
-- Note: challenges has text[] instead of uuid[], need to migrate data

-- Add new columns
ALTER TABLE challenges 
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

-- If strategic_plan_ids exists as text[], convert to uuid[]
-- First check if conversion is needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' 
      AND column_name = 'strategic_plan_ids' 
      AND data_type = 'ARRAY' 
      AND udt_name = '_text'
  ) THEN
    -- Create temp column
    ALTER TABLE challenges ADD COLUMN strategic_plan_ids_new uuid[] DEFAULT '{}';
    -- Migrate data (only valid UUIDs)
    UPDATE challenges 
    SET strategic_plan_ids_new = (
      SELECT array_agg(elem::uuid) 
      FROM unnest(strategic_plan_ids) elem 
      WHERE elem ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    )
    WHERE strategic_plan_ids IS NOT NULL;
    -- Swap columns
    ALTER TABLE challenges DROP COLUMN strategic_plan_ids;
    ALTER TABLE challenges RENAME COLUMN strategic_plan_ids_new TO strategic_plan_ids;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_challenges_strategic_plan_ids 
  ON challenges USING GIN(strategic_plan_ids);
```

---

### TASK-DB-003: Add strategy columns to `rd_calls` table
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

### TASK-DB-004: Add strategy columns to `email_campaigns` table
**Priority:** Critical  
**Effort:** 15 min  
**Status:** ❌ Not Started

```sql
-- Migration: add_strategy_fields_to_email_campaigns
ALTER TABLE email_campaigns 
  ADD COLUMN IF NOT EXISTS strategic_plan_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_strategy_derived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategy_derivation_date timestamptz;

CREATE INDEX IF NOT EXISTS idx_email_campaigns_strategic_plan_ids 
  ON email_campaigns USING GIN(strategic_plan_ids);
```

---

## 🔴 CRITICAL: Generator Fixes

### TASK-GEN-001: Fix StrategyChallengeGenerator
**File:** `src/components/strategy/cascade/StrategyChallengeGenerator.jsx`  
**Priority:** Critical  
**Effort:** 20 min  
**Status:** ❌ Not Started

**Current (Lines 92-107):**
```javascript
const { data, error } = await supabase
  .from('challenges')
  .insert({
    title_en: challenge.title_en,
    title_ar: challenge.title_ar,
    description_en: challenge.description_en,
    description_ar: challenge.description_ar,
    problem_statement_en: challenge.problem_statement_en,
    problem_statement_ar: challenge.problem_statement_ar,
    desired_outcome_en: challenge.desired_outcome_en,
    desired_outcome_ar: challenge.desired_outcome_ar,
    sector_id: selectedSector || null,
    strategic_plan_ids: [selectedPlanId],
    status: 'draft',
    source: 'ai_generated'
  })
```

**Fixed:**
```javascript
const { data, error } = await supabase
  .from('challenges')
  .insert({
    title_en: challenge.title_en,
    title_ar: challenge.title_ar,
    description_en: challenge.description_en,
    description_ar: challenge.description_ar,
    problem_statement_en: challenge.problem_statement_en,
    problem_statement_ar: challenge.problem_statement_ar,
    desired_outcome_en: challenge.desired_outcome_en,
    desired_outcome_ar: challenge.desired_outcome_ar,
    sector_id: selectedSector || null,
    strategic_plan_ids: [selectedPlanId],
    status: 'draft',
    source: 'ai_generated',
    // ADD THESE FIELDS:
    is_strategy_derived: true,
    strategy_derivation_date: new Date().toISOString()
  })
```

---

### TASK-GEN-002: Fix StrategyToLivingLabGenerator
**File:** `src/components/strategy/cascade/StrategyToLivingLabGenerator.jsx`  
**Priority:** Critical  
**Effort:** 10 min  
**Status:** ❌ Not Started

**Add to insert (Line 91):**
```javascript
// EXISTING: is_strategy_derived: true,
// ADD:
strategy_derivation_date: new Date().toISOString()
```

---

### TASK-GEN-003: Fix StrategyToPilotGenerator
**File:** `src/components/strategy/cascade/StrategyToPilotGenerator.jsx`  
**Priority:** Critical  
**Effort:** 20 min  
**Status:** ❌ Not Started

**Current (Lines 90-106):**
```javascript
const { data, error } = await supabase
  .from('pilots')
  .insert({
    name_en: pilot.name_en,
    name_ar: pilot.name_ar,
    description_en: pilot.description_en,
    description_ar: pilot.description_ar,
    challenge_id: selectedChallenge,
    solution_id: selectedSolution || null,
    municipality_id: challenge?.municipality_id,
    duration_months: Number(pilotDuration),
    target_participants: Number(targetParticipants),
    success_criteria: pilot.success_criteria,
    kpis: pilot.kpis,
    risks: pilot.risks,
    status: 'proposed'
  })
```

**Fixed:**
```javascript
// First, get the challenge to retrieve its strategic_plan_ids
const challenge = challenges?.find(c => c.id === selectedChallenge);

const { data, error } = await supabase
  .from('pilots')
  .insert({
    name_en: pilot.name_en,
    name_ar: pilot.name_ar,
    description_en: pilot.description_en,
    description_ar: pilot.description_ar,
    challenge_id: selectedChallenge,
    solution_id: selectedSolution || null,
    municipality_id: challenge?.municipality_id,
    duration_months: Number(pilotDuration),
    target_participants: Number(targetParticipants),
    success_criteria: pilot.success_criteria,
    kpis: pilot.kpis,
    risks: pilot.risks,
    status: 'proposed',
    // ADD THESE FIELDS:
    strategic_plan_ids: challenge?.strategic_plan_ids || [],
    is_strategy_derived: true,
    strategy_derivation_date: new Date().toISOString()
  })
```

**Also update the challenges query (Line 27-36) to include `strategic_plan_ids`:**
```javascript
const { data: challenges } = useQuery({
  queryKey: ['challenges-for-pilot-gen'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('id, title_en, title_ar, municipality_id, strategic_plan_ids')  // ADD strategic_plan_ids
      .eq('is_deleted', false)
      .in('status', ['approved', 'published', 'open'])
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  }
});
```

---

### TASK-GEN-004: Fix StrategyToEventGenerator
**File:** `src/components/strategy/cascade/StrategyToEventGenerator.jsx`  
**Priority:** Critical  
**Effort:** 20 min  
**Status:** ❌ Not Started

**Add to insert:**
```javascript
{
  // existing fields...
  strategic_plan_ids: [selectedPlanId],
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString()
}
```

---

### TASK-GEN-005: Fix StrategyToPolicyGenerator
**File:** `src/components/strategy/cascade/StrategyToPolicyGenerator.jsx`  
**Priority:** Critical  
**Effort:** 15 min  
**Status:** ❌ Not Started

**Add to insert:**
```javascript
{
  // existing fields...
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString()
}
```

---

### TASK-GEN-006: Fix StrategyToPartnershipGenerator
**File:** `src/components/strategy/cascade/StrategyToPartnershipGenerator.jsx`  
**Priority:** Critical  
**Effort:** 15 min  
**Status:** ❌ Not Started

**Add to insert:**
```javascript
{
  // existing fields...
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString()
}
```

---

### TASK-GEN-007: Fix StrategyToRDCallGenerator
**File:** `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx`  
**Priority:** Critical  
**Effort:** 20 min  
**Status:** ❌ Not Started

**Add to insert:**
```javascript
{
  // existing fields...
  strategic_plan_ids: [selectedPlanId],
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString()
}
```

---

### TASK-GEN-008: Fix StrategyCampaignGenerator
**File:** `src/components/strategy/cascade/StrategyToCampaignGenerator.jsx`  
**Priority:** Critical  
**Effort:** 20 min  
**Status:** ❌ Not Started

**Add to insert:**
```javascript
{
  // existing fields...
  strategic_plan_ids: [selectedPlanId],
  is_strategy_derived: true,
  strategy_derivation_date: new Date().toISOString()
}
```

---

### TASK-GEN-009: Verify StrategyToProgramGenerator (Already Correct)
**File:** `src/components/strategy/StrategyToProgramGenerator.jsx`  
**Priority:** Low  
**Effort:** 5 min  
**Status:** ✅ Verified Correct

No changes needed - already sets all fields correctly.

---

## 🟠 HIGH: Approval Integration

### TASK-APPR-001: Create shared approval request helper
**File:** `src/hooks/useApprovalRequest.js` (NEW)  
**Priority:** High  
**Effort:** 45 min  
**Status:** ❌ Not Started

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { gateConfigs } from '@/components/approval/ApprovalGateConfig';
import { toast } from 'sonner';

/**
 * Shared hook for creating approval requests from any generator
 */
export function useApprovalRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();

  const createApprovalRequest = useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      entityData, 
      gateName = null,
      strategicPlanId = null 
    }) => {
      // Get gate config for this entity type
      const entityGates = gateConfigs[entityType];
      const firstGate = gateName || entityGates?.[0]?.name || 'initial_review';
      const gateConfig = entityGates?.find(g => g.name === firstGate) || {};
      
      const slaDueDate = new Date();
      slaDueDate.setDate(slaDueDate.getDate() + (gateConfig.sla_days || 5));

      const { data, error } = await supabase
        .from('approval_requests')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          request_type: `${entityType}_${firstGate}`,
          requester_email: user?.email,
          approval_status: 'pending',
          sla_due_date: slaDueDate.toISOString(),
          metadata: {
            gate_name: firstGate,
            gate_type: gateConfig.type || 'review',
            source: 'strategy_cascade',
            strategic_plan_id: strategicPlanId,
            entity_name: entityData?.name_en || entityData?.title_en,
            is_strategy_derived: true
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger notification email
      try {
        await triggerEmail('approval.submitted', {
          entity_type: entityType,
          entity_id: entityId,
          recipient_role: gateConfig.requiredRole || 'reviewer',
          entity_data: {
            name: entityData?.name_en || entityData?.title_en,
            gate_name: firstGate,
            sla_due_date: slaDueDate.toISOString()
          }
        });
      } catch (e) {
        console.warn('Email trigger failed:', e);
      }

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

export default useApprovalRequest;
```

---

### TASK-APPR-002: Add "Save & Submit" option to all generators
**Files:** All 9 generators  
**Priority:** High  
**Effort:** 1.5h  
**Status:** ❌ Not Started

**Add to each generator component:**

```javascript
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

// In component:
const { createApprovalRequest, isSubmitting } = useApprovalRequest();
const [autoSubmit, setAutoSubmit] = useState(false);

// Replace save handler:
const handleSaveEntity = async (entity, index) => {
  try {
    // 1. Create entity
    const { data, error } = await supabase
      .from('entity_table')
      .insert({
        ...entityFields,
        is_strategy_derived: true,
        strategy_derivation_date: new Date().toISOString(),
        strategic_plan_ids: [selectedPlanId]
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Optionally create approval request
    if (autoSubmit) {
      await createApprovalRequest({
        entityType: 'entity_type',
        entityId: data.id,
        entityData: data,
        strategicPlanId: selectedPlanId
      });
    }

    // 3. Update UI
    const updated = [...generatedEntities];
    updated[index] = { 
      ...updated[index], 
      saved: true, 
      savedId: data.id,
      submitted: autoSubmit 
    };
    setGeneratedEntities(updated);

    toast.success(autoSubmit 
      ? 'Saved and submitted for approval' 
      : 'Saved as draft'
    );

  } catch (error) {
    console.error('Save error:', error);
    toast.error('Failed to save');
  }
};

// In UI, add checkbox:
<div className="flex items-center gap-2 mb-4">
  <Checkbox 
    id="auto-submit"
    checked={autoSubmit}
    onCheckedChange={setAutoSubmit}
  />
  <label htmlFor="auto-submit" className="text-sm">
    Auto-submit for approval after saving
  </label>
</div>
```

---

### TASK-APPR-003: Add gate configs for missing entity types
**File:** `src/components/approval/ApprovalGateConfig.jsx`  
**Priority:** High  
**Effort:** 45 min  
**Status:** ❌ Not Started

**Add gate configs for:**

```javascript
// Add to gateConfigs object:

living_lab: [
  {
    name: 'concept_review',
    label: { en: 'Concept Review', ar: 'مراجعة المفهوم' },
    type: 'review',
    requiredRole: 'innovation_officer',
    sla_days: 5,
    selfCheckItems: [
      { en: 'Research focus defined', ar: 'تركيز البحث محدد' },
      { en: 'Target outcomes clear', ar: 'النتائج المستهدفة واضحة' },
      { en: 'Municipality aligned', ar: 'البلدية متوافقة' },
      { en: 'Resources estimated', ar: 'الموارد مقدرة' }
    ],
    reviewerChecklistItems: [
      { en: 'Concept viable', ar: 'المفهوم قابل للتطبيق' },
      { en: 'Strategic alignment verified', ar: 'التوافق الاستراتيجي محقق' },
      { en: 'No duplicates', ar: 'لا توجد تكرارات' },
      { en: 'Approval recommended', ar: 'الموافقة موصى بها' }
    ]
  },
  {
    name: 'launch_approval',
    label: { en: 'Launch Approval', ar: 'موافقة الإطلاق' },
    type: 'approval',
    requiredRole: 'program_manager',
    sla_days: 7,
    selfCheckItems: [
      { en: 'Team assigned', ar: 'الفريق معين' },
      { en: 'Location confirmed', ar: 'الموقع مؤكد' },
      { en: 'Budget approved', ar: 'الميزانية معتمدة' },
      { en: 'Partners committed', ar: 'الشركاء ملتزمون' }
    ],
    reviewerChecklistItems: [
      { en: 'All prerequisites met', ar: 'كل المتطلبات محققة' },
      { en: 'Launch plan complete', ar: 'خطة الإطلاق مكتملة' },
      { en: 'Risks acceptable', ar: 'المخاطر مقبولة' },
      { en: 'Launch approved', ar: 'الإطلاق معتمد' }
    ]
  }
],

sandbox: [
  {
    name: 'proposal_review',
    label: { en: 'Proposal Review', ar: 'مراجعة المقترح' },
    type: 'review',
    requiredRole: 'regulatory_officer',
    sla_days: 7,
    selfCheckItems: [
      { en: 'Innovation scope clear', ar: 'نطاق الابتكار واضح' },
      { en: 'Regulatory exemptions listed', ar: 'الاستثناءات التنظيمية مدرجة' },
      { en: 'Risk assessment complete', ar: 'تقييم المخاطر مكتمل' },
      { en: 'Exit strategy defined', ar: 'استراتيجية الخروج محددة' }
    ],
    reviewerChecklistItems: [
      { en: 'Sandbox appropriate', ar: 'الصندوق الرملي مناسب' },
      { en: 'Risks manageable', ar: 'المخاطر قابلة للإدارة' },
      { en: 'Consumer protection adequate', ar: 'حماية المستهلك كافية' },
      { en: 'Approval recommended', ar: 'الموافقة موصى بها' }
    ]
  }
],

partnership: [
  {
    name: 'partner_verification',
    label: { en: 'Partner Verification', ar: 'التحقق من الشريك' },
    type: 'review',
    requiredRole: 'partnership_officer',
    sla_days: 5,
    selfCheckItems: [
      { en: 'Partner organization verified', ar: 'منظمة الشريك محققة' },
      { en: 'Objectives aligned', ar: 'الأهداف متوافقة' },
      { en: 'Terms draft ready', ar: 'مسودة الشروط جاهزة' },
      { en: 'Value proposition clear', ar: 'عرض القيمة واضح' }
    ],
    reviewerChecklistItems: [
      { en: 'Partner legitimate', ar: 'الشريك شرعي' },
      { en: 'Strategic fit verified', ar: 'التوافق الاستراتيجي محقق' },
      { en: 'No conflicts of interest', ar: 'لا توجد تضاربات مصالح' },
      { en: 'Partnership viable', ar: 'الشراكة قابلة للتطبيق' }
    ]
  },
  {
    name: 'agreement_approval',
    label: { en: 'Agreement Approval', ar: 'موافقة الاتفاقية' },
    type: 'approval',
    requiredRole: 'legal_officer',
    sla_days: 10,
    selfCheckItems: [
      { en: 'Legal review complete', ar: 'المراجعة القانونية مكتملة' },
      { en: 'Terms finalized', ar: 'الشروط نهائية' },
      { en: 'Budget allocated', ar: 'الميزانية مخصصة' },
      { en: 'Signatories identified', ar: 'الموقعون محددون' }
    ],
    reviewerChecklistItems: [
      { en: 'Legal compliance verified', ar: 'الامتثال القانوني محقق' },
      { en: 'Terms fair and balanced', ar: 'الشروط عادلة ومتوازنة' },
      { en: 'Exit clauses adequate', ar: 'بنود الخروج كافية' },
      { en: 'Agreement approved', ar: 'الاتفاقية معتمدة' }
    ]
  }
],

event: [
  {
    name: 'event_review',
    label: { en: 'Event Review', ar: 'مراجعة الفعالية' },
    type: 'review',
    requiredRole: 'events_coordinator',
    sla_days: 3,
    selfCheckItems: [
      { en: 'Event details complete', ar: 'تفاصيل الفعالية مكتملة' },
      { en: 'Venue confirmed', ar: 'المكان مؤكد' },
      { en: 'Budget estimated', ar: 'الميزانية مقدرة' },
      { en: 'Target audience defined', ar: 'الجمهور المستهدف محدد' }
    ],
    reviewerChecklistItems: [
      { en: 'Event aligned with strategy', ar: 'الفعالية متوافقة مع الاستراتيجية' },
      { en: 'Logistics feasible', ar: 'اللوجستيات ممكنة' },
      { en: 'Budget reasonable', ar: 'الميزانية معقولة' },
      { en: 'Event approved', ar: 'الفعالية معتمدة' }
    ]
  }
],

rd_call: [
  {
    name: 'call_review',
    label: { en: 'Call Review', ar: 'مراجعة الدعوة' },
    type: 'review',
    requiredRole: 'rd_coordinator',
    sla_days: 5,
    selfCheckItems: [
      { en: 'Research scope defined', ar: 'نطاق البحث محدد' },
      { en: 'Eligibility criteria clear', ar: 'معايير الأهلية واضحة' },
      { en: 'Budget allocated', ar: 'الميزانية مخصصة' },
      { en: 'Timeline realistic', ar: 'الجدول الزمني واقعي' }
    ],
    reviewerChecklistItems: [
      { en: 'Strategic alignment verified', ar: 'التوافق الاستراتيجي محقق' },
      { en: 'Scope appropriate', ar: 'النطاق مناسب' },
      { en: 'Budget adequate', ar: 'الميزانية كافية' },
      { en: 'Call approved', ar: 'الدعوة معتمدة' }
    ]
  }
],

email_campaign: [
  {
    name: 'campaign_review',
    label: { en: 'Campaign Review', ar: 'مراجعة الحملة' },
    type: 'review',
    requiredRole: 'communications_officer',
    sla_days: 2,
    selfCheckItems: [
      { en: 'Content reviewed', ar: 'المحتوى مراجع' },
      { en: 'Audience defined', ar: 'الجمهور محدد' },
      { en: 'Schedule set', ar: 'الجدول محدد' },
      { en: 'Branding compliant', ar: 'متوافق مع الهوية' }
    ],
    reviewerChecklistItems: [
      { en: 'Message aligned with strategy', ar: 'الرسالة متوافقة مع الاستراتيجية' },
      { en: 'No sensitive content', ar: 'لا محتوى حساس' },
      { en: 'Audience appropriate', ar: 'الجمهور مناسب' },
      { en: 'Campaign approved', ar: 'الحملة معتمدة' }
    ]
  }
]
```

---

## 🟡 MEDIUM: UI Enhancements

### TASK-UI-001: Add "Strategy Derived" badge to entity lists
**Files:** Entity list components (ProgramsList, ChallengesList, etc.)  
**Priority:** Medium  
**Effort:** 1h  
**Status:** ❌ Not Started

```jsx
// Add badge rendering:
{entity.is_strategy_derived && (
  <Badge variant="outline" className="bg-purple-100 text-purple-700">
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

Add filter option to show only strategy-derived entities:
```jsx
<Select value={filter} onValueChange={setFilter}>
  <SelectItem value="all">All Pending</SelectItem>
  <SelectItem value="strategy">Strategy Derived Only</SelectItem>
  <SelectItem value="manual">Manually Created Only</SelectItem>
</Select>
```

---

### TASK-UI-003: Add bulk save option to generators
**Files:** All generator components  
**Priority:** Medium  
**Effort:** 1h  
**Status:** ❌ Not Started

Add "Save All Selected" button:
```jsx
<Button 
  onClick={handleSaveAll}
  disabled={selectedEntities.length === 0}
>
  Save {selectedEntities.length} Selected
</Button>
```

---

### TASK-UI-004: Add strategy source indicator in entity detail
**Files:** Entity detail pages  
**Priority:** Medium  
**Effort:** 1h  
**Status:** ❌ Not Started

Show which strategic plan the entity was derived from:
```jsx
{entity.is_strategy_derived && (
  <Card className="bg-purple-50 border-purple-200">
    <CardContent className="py-3">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-purple-600" />
        <span className="font-medium">Strategy Derived</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Created from strategic plan on {format(entity.strategy_derivation_date, 'PPP')}
      </p>
      <Link to={`/strategy/${entity.strategic_plan_ids?.[0]}`}>
        View Source Plan →
      </Link>
    </CardContent>
  </Card>
)}
```

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
1. TASK-DB-001 through TASK-DB-004 (Database migrations)
2. TASK-GEN-001 through TASK-GEN-008 (Generator fixes)

### Sprint 2 (High Priority)
3. TASK-APPR-001 (Create shared approval hook)
4. TASK-APPR-003 (Add gate configs for missing types)
5. TASK-APPR-002 (Add "Save & Submit" to generators)

### Sprint 3 (Medium Priority)
6. TASK-UI-001 through TASK-UI-004 (UI enhancements)

### Sprint 4 (Low Priority)
7. TASK-DOC-001 and TASK-DOC-002 (Documentation)

---

## VERIFICATION CHECKLIST

After implementation, verify:

- [ ] All 9 generators set `is_strategy_derived: true`
- [ ] All 9 generators set `strategy_derivation_date`
- [ ] All 9 generators set `strategic_plan_ids[]`
- [ ] Database migrations applied successfully
- [ ] "Save & Submit" option works in all generators
- [ ] Entities appear in ApprovalCenter after submission
- [ ] Reviewers receive notification emails
- [ ] Approved entities show as active
- [ ] Strategy-derived badge shows in lists
- [ ] Source plan link works in detail pages
