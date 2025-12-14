# Demand-Driven Cascade Generation - Implementation Plan

## Current State Analysis

### Existing Infrastructure

#### 1. Strategic Plan Context
- **File**: `src/contexts/StrategicPlanContext.jsx`
- **Provides**: `activePlanId`, `activePlan`, `strategicPlans`
- **Storage**: Plans stored with `objectives` (JSONB), `kpis` (JSONB), `pillars` (JSONB)
- **Missing**: `cascade_config` field for target ratios and quality thresholds

#### 2. Existing Generators (8 total)
Located in `src/components/strategy/cascade/`:

| Generator | Entity | Edge Function | Current Flow |
|-----------|--------|---------------|--------------|
| `StrategyChallengeGenerator.jsx` | Challenge | `strategy-challenge-generator` | Manual objective selection → AI generation → Manual save |
| `StrategyToPilotGenerator.jsx` | Pilot | `strategy-pilot-generator` | Manual challenge selection → AI generation → Manual save |
| `StrategyToCampaignGenerator.jsx` | Campaign | `strategy-campaign-generator` | Manual plan selection → AI generation → Manual save |
| `StrategyToEventGenerator.jsx` | Event | `strategy-event-planner` | Manual plan selection → AI generation → Manual save |
| `StrategyToPolicyGenerator.jsx` | Policy | `strategy-policy-generator` | Manual objective selection → AI generation → Manual save |
| `StrategyToLivingLabGenerator.jsx` | Living Lab | (uses challenge-generator) | Manual selection → AI generation |
| `StrategyToPartnershipGenerator.jsx` | Partnership | `strategy-partnership-matcher` | Manual selection → AI matching |
| `StrategyToRDCallGenerator.jsx` | R&D Call | `strategy-rd-call-generator` | Manual selection → AI generation |

#### 3. Database Schema
**strategic_plans table columns:**
- `id`, `name_en`, `name_ar`, `description_en`, `description_ar`
- `municipality_id`, `start_year`, `end_year`
- `vision_en`, `vision_ar`
- `pillars` (JSONB), `objectives` (JSONB), `kpis` (JSONB)
- `status`, `created_at`, `updated_at`

**Missing Tables:**
- `demand_queue` - For prioritized generation queue
- `generation_history` - For tracking generation attempts
- `coverage_snapshots` - For trend analysis

---

## Implementation Phases

### Phase 1: Database Foundation (Week 1)

#### 1.1 Add cascade_config to strategic_plans

```sql
-- Add cascade configuration column
ALTER TABLE strategic_plans 
ADD COLUMN cascade_config JSONB DEFAULT '{
  "targets": {
    "challenges_per_objective": 5,
    "pilots_per_challenge": 2,
    "solutions_per_challenge": 3,
    "campaigns_per_objective": 2,
    "events_per_objective": 3,
    "policies_per_pillar": 2,
    "partnerships_per_sector": 3
  },
  "quality": {
    "min_alignment_score": 70,
    "min_feasibility_score": 60,
    "auto_accept_threshold": 85,
    "auto_reject_threshold": 40
  },
  "preferences": {
    "sector_distribution": "balanced",
    "priority_focus": "coverage",
    "batch_size": 5,
    "auto_generate": false
  }
}'::jsonb;
```

#### 1.2 Create demand_queue table

```sql
CREATE TABLE demand_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id TEXT,  -- From objectives JSONB array
  pillar_id TEXT,     -- From pillars JSONB array
  
  -- Routing
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'challenge', 'pilot', 'solution', 'campaign', 
    'event', 'policy', 'partnership', 'rd_call', 'living_lab'
  )),
  generator_component TEXT NOT NULL,
  
  -- Priority (AI-calculated)
  priority_score INTEGER NOT NULL DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
  priority_factors JSONB DEFAULT '{}'::jsonb,
  
  -- AI Pre-filled Specification
  prefilled_spec JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'generated', 'review', 'accepted', 'rejected', 'skipped'
  )),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  
  -- Result
  generated_entity_id UUID,
  generated_entity_type TEXT,
  quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
  quality_feedback JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  batch_id UUID  -- For batch generation tracking
);

-- Indexes
CREATE INDEX idx_demand_queue_priority ON demand_queue(strategic_plan_id, status, priority_score DESC);
CREATE INDEX idx_demand_queue_type ON demand_queue(entity_type, status);
CREATE INDEX idx_demand_queue_batch ON demand_queue(batch_id) WHERE batch_id IS NOT NULL;

-- Enable RLS
ALTER TABLE demand_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view demand queue for accessible plans"
ON demand_queue FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM strategic_plans sp
    WHERE sp.id = demand_queue.strategic_plan_id
  )
);

CREATE POLICY "Users can manage demand queue"
ON demand_queue FOR ALL
USING (true);
```

#### 1.3 Create generation_history table

```sql
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID REFERENCES demand_queue(id) ON DELETE SET NULL,
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  
  -- Entity info
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  -- Generation details
  attempt_number INTEGER NOT NULL DEFAULT 1,
  input_spec JSONB,
  output_entity JSONB,
  
  -- Quality metrics
  quality_assessment JSONB,
  overall_score INTEGER,
  
  -- Performance
  generation_time_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  -- Outcome
  outcome TEXT NOT NULL CHECK (outcome IN (
    'accepted', 'rejected', 'regenerated', 'manual_edit', 'error'
  )),
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generation_history_plan ON generation_history(strategic_plan_id, created_at DESC);
CREATE INDEX idx_generation_history_entity ON generation_history(entity_type, outcome);

ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view generation history"
ON generation_history FOR SELECT USING (true);

CREATE POLICY "Users can insert generation history"
ON generation_history FOR INSERT WITH CHECK (true);
```

#### 1.4 Create coverage_snapshots table

```sql
CREATE TABLE coverage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Coverage data per objective
  objective_coverage JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Coverage data per entity type
  entity_coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Gap analysis results
  gap_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Summary metrics
  overall_coverage_pct INTEGER,
  total_objectives INTEGER,
  fully_covered_objectives INTEGER,
  total_gap_items INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(strategic_plan_id, snapshot_date)
);

ALTER TABLE coverage_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view coverage snapshots"
ON coverage_snapshots FOR SELECT USING (true);

CREATE POLICY "System can manage coverage snapshots"
ON coverage_snapshots FOR ALL USING (true);
```

---

### Phase 2: Edge Functions (Week 2)

#### 2.1 Create `strategy-gap-analysis` function

**Purpose**: Analyze strategic plan and calculate coverage gaps

```typescript
// supabase/functions/strategy-gap-analysis/index.ts

interface GapAnalysisRequest {
  strategic_plan_id: string;
  analysis_depth: 'quick' | 'comprehensive';
}

interface GapAnalysisResult {
  plan_id: string;
  analyzed_at: string;
  objectives: ObjectiveCoverage[];
  entity_coverage: Record<string, EntityCoverage>;
  gaps: Gap[];
  total_generation_needed: Record<string, number>;
  recommendations: string[];
}

// Implementation:
// 1. Fetch strategic plan with objectives
// 2. Count existing entities per objective (challenges, pilots, etc.)
// 3. Compare against cascade_config targets
// 4. Calculate gaps and priority scores
// 5. Return structured analysis
```

#### 2.2 Create `strategy-demand-queue-generator` function

**Purpose**: AI generates prioritized queue with pre-filled specs

```typescript
// supabase/functions/strategy-demand-queue-generator/index.ts

interface DemandQueueRequest {
  strategic_plan_id: string;
  gap_analysis: GapAnalysisResult;
  max_items?: number;
}

// Implementation:
// 1. Receive gap analysis
// 2. Call AI to generate prioritized queue items
// 3. AI creates COMPLETE prefilled_spec for each item
// 4. Insert into demand_queue table
// 5. Return queue summary
```

#### 2.3 Create `strategy-quality-assessor` function

**Purpose**: AI validates generated entities for quality

```typescript
// supabase/functions/strategy-quality-assessor/index.ts

interface QualityAssessmentRequest {
  entity_type: string;
  entity_data: Record<string, any>;
  queue_item: DemandQueueItem;
  strategic_context: {
    objective: Objective;
    plan_vision: string;
    kpis: KPI[];
  };
}

interface QualityAssessmentResult {
  scores: {
    objective_alignment: number;
    completeness: number;
    feasibility: number;
    innovation: number;
    clarity: number;
  };
  overall_score: number;
  decision: 'auto_accept' | 'needs_review' | 'regenerate' | 'reject';
  feedback: {
    strengths: string[];
    improvements_needed: string[];
    regeneration_hints: string[];
  };
}
```

#### 2.4 Update existing generator functions

Modify each existing generator to accept `prefilled_spec`:

```typescript
// Example: strategy-challenge-generator/index.ts

interface EnhancedRequest {
  // Existing params
  strategic_plan_id: string;
  objective_ids: string[];
  sector_id?: string;
  challenge_count: number;
  additional_context?: string;
  
  // NEW: Queue-driven params
  queue_item_id?: string;
  prefilled_spec?: ChallengePrefillSpec;
  auto_mode?: boolean;
}

// If prefilled_spec provided:
// - Use it as the base for generation
// - Enhance with AI rather than generate from scratch
// - Return with queue_item_id for tracking
```

---

### Phase 3: Frontend Hooks & Context (Week 3)

#### 3.1 Create `useDemandQueue` hook

```typescript
// src/hooks/strategy/useDemandQueue.js

export function useDemandQueue(strategicPlanId) {
  // Fetch queue items for plan
  const { data: queueItems, refetch } = useQuery({
    queryKey: ['demand-queue', strategicPlanId],
    queryFn: () => fetchDemandQueue(strategicPlanId)
  });
  
  // Get next item by entity type
  const getNextItem = (entityType) => {
    return queueItems?.find(
      item => item.entity_type === entityType && item.status === 'pending'
    );
  };
  
  // Update item status
  const updateItemStatus = useMutation({...});
  
  // Complete item with result
  const completeItem = useMutation({...});
  
  return {
    queueItems,
    getNextItem,
    updateItemStatus,
    completeItem,
    refetch,
    pendingCount: queueItems?.filter(i => i.status === 'pending').length || 0,
    byType: groupBy(queueItems, 'entity_type')
  };
}
```

#### 3.2 Create `useQueueAutoPopulation` hook

```typescript
// src/hooks/strategy/useQueueAutoPopulation.js

export function useQueueAutoPopulation(entityType, strategicPlanId) {
  const [queueItem, setQueueItem] = useState(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const { getNextItem, updateItemStatus, completeItem } = useDemandQueue(strategicPlanId);
  
  // Load next from queue
  const loadNextFromQueue = useCallback(async () => {
    const item = getNextItem(entityType);
    if (item) {
      await updateItemStatus({ id: item.id, status: 'in_progress' });
      setQueueItem(item);
      setIsAutoMode(true);
      return item.prefilled_spec;
    }
    return null;
  }, [entityType, getNextItem]);
  
  // Complete current item
  const completeQueueItem = useCallback(async (entityId, qualityScore) => {
    if (queueItem) {
      await completeItem({
        id: queueItem.id,
        generated_entity_id: entityId,
        quality_score: qualityScore,
        status: qualityScore >= 70 ? 'accepted' : 'review'
      });
      setQueueItem(null);
    }
  }, [queueItem, completeItem]);
  
  // Skip current item
  const skipItem = useCallback(async (reason) => {
    if (queueItem) {
      await updateItemStatus({ 
        id: queueItem.id, 
        status: 'skipped',
        quality_feedback: { skip_reason: reason }
      });
      setQueueItem(null);
    }
  }, [queueItem]);
  
  return {
    queueItem,
    isAutoMode,
    setIsAutoMode,
    loadNextFromQueue,
    completeQueueItem,
    skipItem,
    prefillData: queueItem?.prefilled_spec || null
  };
}
```

#### 3.3 Create `useGapAnalysis` hook

```typescript
// src/hooks/strategy/useGapAnalysis.js

export function useGapAnalysis(strategicPlanId) {
  const [analysis, setAnalysis] = useState(null);
  
  const runAnalysis = useMutation({
    mutationFn: async (depth = 'quick') => {
      const { data, error } = await supabase.functions.invoke('strategy-gap-analysis', {
        body: { strategic_plan_id: strategicPlanId, analysis_depth: depth }
      });
      if (error) throw error;
      setAnalysis(data);
      return data;
    }
  });
  
  const generateQueue = useMutation({
    mutationFn: async (maxItems = 20) => {
      if (!analysis) throw new Error('Run analysis first');
      const { data, error } = await supabase.functions.invoke('strategy-demand-queue-generator', {
        body: { 
          strategic_plan_id: strategicPlanId,
          gap_analysis: analysis,
          max_items: maxItems
        }
      });
      if (error) throw error;
      return data;
    }
  });
  
  return {
    analysis,
    runAnalysis,
    generateQueue,
    isAnalyzing: runAnalysis.isPending,
    isGeneratingQueue: generateQueue.isPending
  };
}
```

---

### Phase 4: Generator Integration (Week 4)

#### 4.1 Create `QueueAwareGeneratorWrapper` component

```jsx
// src/components/strategy/cascade/QueueAwareGeneratorWrapper.jsx

export function QueueAwareGeneratorWrapper({ 
  entityType,
  strategicPlanId,
  strategicPlan,
  GeneratorComponent,
  onEntityCreated 
}) {
  const { 
    queueItem, 
    isAutoMode, 
    loadNextFromQueue, 
    completeQueueItem,
    skipItem,
    prefillData 
  } = useQueueAutoPopulation(entityType, strategicPlanId);
  
  const { queueItems } = useDemandQueue(strategicPlanId);
  const pendingForType = queueItems?.filter(
    i => i.entity_type === entityType && i.status === 'pending'
  ).length || 0;
  
  return (
    <div className="space-y-4">
      {/* Queue Status Banner */}
      {pendingForType > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-700">
                  {pendingForType} items in queue for this generator
                </span>
              </div>
              <Button 
                size="sm" 
                variant={isAutoMode ? "secondary" : "default"}
                onClick={loadNextFromQueue}
              >
                {isAutoMode ? 'Load Next' : 'Start from Queue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Queue Item Context */}
      {isAutoMode && queueItem && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Generating from Queue (Priority: {queueItem.priority_score})
                </p>
                <p className="text-xs text-amber-600">
                  Objective: {queueItem.prefilled_spec?.ai_context?.objective_text}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => skipItem('manual_skip')}>
                  Skip
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAutoMode(false)}>
                  Exit Auto Mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Actual Generator */}
      <GeneratorComponent
        strategicPlanId={strategicPlanId}
        strategicPlan={strategicPlan}
        prefillData={prefillData}
        isAutoMode={isAutoMode}
        queueItem={queueItem}
        onEntityCreated={(entity) => {
          if (isAutoMode && queueItem) {
            // Trigger quality assessment and complete queue item
            assessAndComplete(entity, queueItem).then(score => {
              completeQueueItem(entity.id, score);
            });
          }
          onEntityCreated?.(entity);
        }}
      />
    </div>
  );
}
```

#### 4.2 Update `StrategyChallengeGenerator` with auto-population

```jsx
// Additions to StrategyChallengeGenerator.jsx

export default function StrategyChallengeGenerator({ 
  strategicPlanId, 
  strategicPlan, 
  onChallengeCreated,
  // NEW props for queue integration
  prefillData,
  isAutoMode,
  queueItem 
}) {
  // Auto-populate form when prefillData changes
  useEffect(() => {
    if (prefillData && isAutoMode) {
      // Set sector
      if (prefillData.sector_id) {
        setSelectedSector(prefillData.sector_id);
      }
      
      // Set objectives from queue item
      if (queueItem?.objective_id) {
        setSelectedObjectives([queueItem.objective_id]);
      }
      
      // Set context
      if (prefillData.ai_context?.additional_context) {
        setAdditionalContext(prefillData.ai_context.additional_context);
      }
      
      // Set count to 1 for queue-driven generation
      setChallengeCount(1);
    }
  }, [prefillData, isAutoMode, queueItem]);
  
  // Auto-trigger generation in auto mode
  useEffect(() => {
    if (isAutoMode && prefillData && selectedObjectives.length > 0) {
      handleGenerate();
    }
  }, [isAutoMode, prefillData, selectedObjectives]);
  
  // ... rest of component
}
```

---

### Phase 5: Demand Dashboard (Week 5)

#### 5.1 Create `DemandDashboard` component

```jsx
// src/components/strategy/demand/DemandDashboard.jsx

export default function DemandDashboard({ strategicPlanId }) {
  const { analysis, runAnalysis, generateQueue, isAnalyzing } = useGapAnalysis(strategicPlanId);
  const { queueItems, refetch } = useDemandQueue(strategicPlanId);
  
  return (
    <div className="space-y-6">
      {/* Gap Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => runAnalysis.mutate('comprehensive')} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Run Gap Analysis'}
          </Button>
          
          {analysis && (
            <CoverageHeatmap data={analysis} />
          )}
        </CardContent>
      </Card>
      
      {/* Queue Generation */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Queue</CardTitle>
            <CardDescription>
              AI-prioritized items ready for generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateQueue.mutate(20)}>
              Generate Queue from Gaps
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Queue Overview */}
      {queueItems?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Demand Queue ({queueItems.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <QueueTable items={queueItems} />
            <QueueByTypeChart items={queueItems} />
          </CardContent>
        </Card>
      )}
      
      {/* Batch Actions */}
      <BatchGenerationControls 
        strategicPlanId={strategicPlanId}
        queueItems={queueItems}
        onComplete={refetch}
      />
    </div>
  );
}
```

#### 5.2 Create `CoverageHeatmap` component

```jsx
// src/components/strategy/demand/CoverageHeatmap.jsx

export function CoverageHeatmap({ data }) {
  const objectives = data.objectives || [];
  const entityTypes = ['challenges', 'pilots', 'solutions', 'campaigns', 'events'];
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Objective</th>
            {entityTypes.map(type => (
              <th key={type} className="text-center p-2 capitalize">{type}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {objectives.map(obj => (
            <tr key={obj.id}>
              <td className="p-2">{obj.title}</td>
              {entityTypes.map(type => {
                const current = obj.current_coverage?.[type] || 0;
                const target = obj.target_coverage?.[type] || 0;
                const pct = target > 0 ? (current / target) * 100 : 100;
                
                return (
                  <td key={type} className="text-center p-2">
                    <CoverageCell 
                      current={current} 
                      target={target} 
                      percentage={pct} 
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoverageCell({ current, target, percentage }) {
  const color = percentage >= 100 ? 'bg-green-100 text-green-700' :
                percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700';
  
  return (
    <div className={`rounded px-2 py-1 ${color}`}>
      {current}/{target}
    </div>
  );
}
```

---

### Phase 6: Batch Generation (Week 6)

#### 6.1 Create `strategy-batch-generator` edge function

```typescript
// supabase/functions/strategy-batch-generator/index.ts

interface BatchRequest {
  strategic_plan_id: string;
  entity_types: string[];
  batch_size: number;
  quality_threshold: number;
  max_attempts: number;
  auto_save: boolean;
}

// Implementation:
// 1. Fetch pending queue items
// 2. Process each item:
//    a. Call appropriate generator with prefilled_spec
//    b. Run quality assessment
//    c. If passes threshold: save entity
//    d. If fails: retry with enhanced prompt or mark for review
// 3. Update queue statuses
// 4. Return batch results
```

#### 6.2 Create `BatchGenerationControls` component

```jsx
// src/components/strategy/demand/BatchGenerationControls.jsx

export function BatchGenerationControls({ strategicPlanId, queueItems, onComplete }) {
  const [config, setConfig] = useState({
    entity_types: ['challenge', 'pilot', 'campaign'],
    batch_size: 5,
    quality_threshold: 70,
    max_attempts: 3,
    auto_save: false
  });
  
  const runBatch = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('strategy-batch-generator', {
        body: { strategic_plan_id: strategicPlanId, ...config }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.accepted} items`);
      onComplete?.();
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entity type selection */}
        {/* Batch size slider */}
        {/* Quality threshold slider */}
        {/* Auto-save toggle */}
        
        <Button 
          onClick={() => runBatch.mutate()} 
          disabled={runBatch.isPending}
        >
          {runBatch.isPending ? 'Processing...' : 'Run Batch Generation'}
        </Button>
        
        {runBatch.data && (
          <BatchResultsSummary results={runBatch.data} />
        )}
      </CardContent>
    </Card>
  );
}
```

---

## File Structure Summary

```
src/
├── components/strategy/
│   ├── cascade/
│   │   ├── StrategyChallengeGenerator.jsx      (UPDATE)
│   │   ├── StrategyToPilotGenerator.jsx        (UPDATE)
│   │   ├── StrategyToCampaignGenerator.jsx     (UPDATE)
│   │   ├── StrategyToEventGenerator.jsx        (UPDATE)
│   │   ├── StrategyToPolicyGenerator.jsx       (UPDATE)
│   │   ├── QueueAwareGeneratorWrapper.jsx      (NEW)
│   │   └── ...
│   └── demand/
│       ├── DemandDashboard.jsx                 (NEW)
│       ├── CoverageHeatmap.jsx                 (NEW)
│       ├── QueueTable.jsx                      (NEW)
│       ├── QueueByTypeChart.jsx                (NEW)
│       ├── BatchGenerationControls.jsx         (NEW)
│       ├── BatchResultsSummary.jsx             (NEW)
│       └── CascadeConfigEditor.jsx             (NEW)
├── hooks/strategy/
│   ├── useDemandQueue.js                       (NEW)
│   ├── useQueueAutoPopulation.js               (NEW)
│   ├── useGapAnalysis.js                       (NEW)
│   └── useBatchGeneration.js                   (NEW)
└── pages/
    └── StrategyDemandDashboardPage.jsx         (NEW)

supabase/functions/
├── strategy-gap-analysis/                      (NEW)
│   └── index.ts
├── strategy-demand-queue-generator/            (NEW)
│   └── index.ts
├── strategy-quality-assessor/                  (NEW)
│   └── index.ts
├── strategy-batch-generator/                   (NEW)
│   └── index.ts
├── strategy-challenge-generator/               (UPDATE)
├── strategy-pilot-generator/                   (UPDATE)
├── strategy-campaign-generator/                (UPDATE)
├── strategy-event-planner/                     (UPDATE)
└── strategy-policy-generator/                  (UPDATE)

docs/strategy/
├── demand-driven-generation-design.md          (EXISTS)
└── demand-driven-implementation-plan.md        (THIS FILE)
```

---

## Migration Checklist

### Database Migrations
- [ ] Add `cascade_config` column to `strategic_plans`
- [ ] Create `demand_queue` table with indexes and RLS
- [ ] Create `generation_history` table
- [ ] Create `coverage_snapshots` table

### Edge Functions
- [ ] Create `strategy-gap-analysis`
- [ ] Create `strategy-demand-queue-generator`
- [ ] Create `strategy-quality-assessor`
- [ ] Create `strategy-batch-generator`
- [ ] Update `strategy-challenge-generator` for prefilled_spec
- [ ] Update `strategy-pilot-generator` for prefilled_spec
- [ ] Update `strategy-campaign-generator` for prefilled_spec
- [ ] Update `strategy-event-planner` for prefilled_spec
- [ ] Update `strategy-policy-generator` for prefilled_spec

### Frontend Hooks
- [ ] Create `useDemandQueue`
- [ ] Create `useQueueAutoPopulation`
- [ ] Create `useGapAnalysis`
- [ ] Create `useBatchGeneration`

### Frontend Components
- [ ] Create `QueueAwareGeneratorWrapper`
- [ ] Create `DemandDashboard`
- [ ] Create `CoverageHeatmap`
- [ ] Create `QueueTable`
- [ ] Create `BatchGenerationControls`
- [ ] Create `CascadeConfigEditor`
- [ ] Update all generator components for auto-population

### Pages & Routes
- [ ] Create `StrategyDemandDashboardPage`
- [ ] Add route for demand dashboard
- [ ] Add navigation link in strategy menu

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Database | Tables, columns, RLS policies |
| 2 | Edge Functions | Gap analysis, queue generator, quality assessor |
| 3 | Frontend Hooks | Queue hooks, auto-population hook |
| 4 | Generator Updates | All 8 generators with queue integration |
| 5 | Demand Dashboard | Coverage visualization, queue management |
| 6 | Batch Generation | Automated bulk generation, monitoring |

---

## Success Metrics

1. **Coverage Improvement**: Measure % coverage before/after queue generation
2. **Time Savings**: Manual generation time vs queue-driven time
3. **Quality Consistency**: Average quality scores across generated entities
4. **Throughput**: Entities generated per hour in batch mode
5. **User Adoption**: % of generations using queue vs manual
