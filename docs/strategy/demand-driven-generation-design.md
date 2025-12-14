# Demand-Driven Cascade Generation System - Fully AI-Driven Design

## Overview

This document describes a **fully AI-assessed, auto-populated generation system** where the AI analyzes strategic plans, calculates demand, prioritizes generation, and **automatically populates generator forms** from a demand queue—eliminating manual input.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STRATEGIC PLAN                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Vision      │ │ Objectives  │ │ KPIs        │ │ Timeline    │           │
│  │ Mission     │ │ Priorities  │ │ Targets     │ │ Milestones  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI GAP ANALYSIS ENGINE (Automated)                        │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Coverage Scanner │  │ Capacity Analyzer│  │ Timeline Checker │          │
│  │ • Objectives     │  │ • Resources      │  │ • Deadlines      │          │
│  │ • Sectors        │  │ • Budget         │  │ • Dependencies   │          │
│  │ • Entities       │  │ • Teams          │  │ • Sequences      │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                     │                     │
│           └─────────────────────┼─────────────────────┘                     │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    AI DEMAND CALCULATOR                           │      │
│  │  • Analyzes gaps across all dimensions                           │      │
│  │  • Calculates priority scores using weighted formula             │      │
│  │  • Determines optimal generation sequence                        │      │
│  │  • Creates detailed generation specifications                    │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEMAND QUEUE                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ Priority │ Entity Type │ Objective    │ Pre-filled Spec │ Status   │    │
│  ├──────────┼─────────────┼──────────────┼─────────────────┼──────────┤    │
│  │ 95       │ Challenge   │ OBJ-001      │ {title, desc..} │ pending  │    │
│  │ 87       │ Pilot       │ OBJ-002      │ {title, desc..} │ pending  │    │
│  │ 82       │ Campaign    │ OBJ-001      │ {title, desc..} │ pending  │    │
│  │ 76       │ Event       │ OBJ-003      │ {title, desc..} │ pending  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTO-POPULATION ORCHESTRATOR                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    QUEUE PROCESSOR                                   │   │
│  │  1. Fetches next priority item from queue                          │   │
│  │  2. Loads pre-filled specification                                 │   │
│  │  3. Routes to appropriate generator                                │   │
│  │  4. Auto-populates ALL form fields                                 │   │
│  │  5. Triggers AI generation with full context                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
│          ┌───────────────────────┼───────────────────────┐                 │
│          ▼                       ▼                       ▼                 │
│  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐          │
│  │ Challenge     │      │ Pilot         │      │ Campaign      │          │
│  │ Generator     │      │ Generator     │      │ Generator     │          │
│  │ (Auto-filled) │      │ (Auto-filled) │      │ (Auto-filled) │          │
│  └───────┬───────┘      └───────┬───────┘      └───────┬───────┘          │
│          │                      │                      │                   │
│          └──────────────────────┼──────────────────────┘                   │
│                                 ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AI QUALITY GATE                                   │   │
│  │  • Validates alignment with objective (>70% required)               │   │
│  │  • Checks completeness of all fields                                │   │
│  │  • Scores innovation and feasibility                                │   │
│  │  • Auto-accepts, flags for review, or regenerates                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENTITY STORE                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Challenges  │ │ Pilots      │ │ Campaigns   │ │ Events      │           │
│  │ (Generated) │ │ (Generated) │ │ (Generated) │ │ (Generated) │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### 1. Cascade Configuration (in Strategic Plan)

```typescript
interface CascadeConfig {
  // Target ratios per objective
  targets: {
    challenges_per_objective: number;      // e.g., 5
    pilots_per_challenge: number;          // e.g., 2
    solutions_per_challenge: number;       // e.g., 3
    campaigns_per_objective: number;       // e.g., 2
    events_per_objective: number;          // e.g., 3
  };
  
  // Quality thresholds
  quality: {
    min_alignment_score: number;           // e.g., 70
    min_feasibility_score: number;         // e.g., 60
    min_innovation_score: number;          // e.g., 50
    auto_accept_threshold: number;         // e.g., 85
    auto_reject_threshold: number;         // e.g., 40
  };
  
  // Generation preferences
  preferences: {
    sector_distribution: 'balanced' | 'weighted' | 'focused';
    priority_focus: 'timeline' | 'impact' | 'coverage';
    batch_size: number;                    // e.g., 5
    auto_generate: boolean;                // Enable fully automated generation
  };
}
```

### 2. Demand Queue Item (AI-Generated Specification)

```typescript
interface DemandQueueItem {
  id: string;
  strategic_plan_id: string;
  objective_id: string;
  
  // Routing
  entity_type: 'challenge' | 'pilot' | 'solution' | 'campaign' | 'event' | 'action_plan';
  generator_route: string;                 // e.g., '/strategy/cascade/challenges'
  
  // Priority (AI-calculated)
  priority_score: number;                  // 0-100
  priority_factors: {
    objective_weight: number;
    coverage_gap: number;
    timeline_urgency: number;
    dependency_score: number;
    strategic_alignment: number;
  };
  
  // AI Pre-filled Specification (AUTO-POPULATES GENERATOR FORMS)
  prefilled_spec: {
    // Common fields
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    sector_id: string;
    tags: string[];
    
    // Entity-specific fields (varies by entity_type)
    entity_fields: Record<string, any>;
    
    // Generation context
    ai_context: {
      objective_text: string;
      kpi_targets: string[];
      related_entities: string[];
      sector_context: string;
      innovation_hints: string[];
    };
  };
  
  // Status tracking
  status: 'pending' | 'in_progress' | 'generated' | 'review' | 'accepted' | 'rejected';
  attempts: number;
  last_attempt_at: string | null;
  generated_entity_id: string | null;
  quality_score: number | null;
  
  created_at: string;
  updated_at: string;
}
```

### 3. Entity-Specific Pre-filled Specs

```typescript
// Challenge specification
interface ChallengePrefillSpec {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  problem_statement_en: string;
  problem_statement_ar: string;
  current_situation_en: string;
  desired_outcome_en: string;
  sector_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  budget_estimate: number;
  timeline_estimate: string;
  affected_population_size: number;
  tags: string[];
  root_causes: string[];
  kpis: Array<{ name: string; target: string; baseline: string }>;
}

// Pilot specification
interface PilotPrefillSpec {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  objectives: string[];
  methodology: string;
  success_criteria: Array<{ metric: string; target: string }>;
  duration_months: number;
  budget: number;
  target_participants: number;
  sector_id: string;
  challenge_id: string;           // Links to source challenge
  solution_id: string | null;     // Optional solution being tested
  risk_assessment: Array<{ risk: string; mitigation: string }>;
  resource_requirements: string[];
}

// Campaign specification
interface CampaignPrefillSpec {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  campaign_type: string;
  target_audience: string[];
  key_messages: string[];
  channels: string[];
  budget: number;
  duration_weeks: number;
  success_metrics: Array<{ metric: string; target: string }>;
  content_themes: string[];
}

// Event specification
interface EventPrefillSpec {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  event_type: string;
  format: 'in_person' | 'virtual' | 'hybrid';
  target_audience: string[];
  expected_attendees: number;
  duration_hours: number;
  agenda_outline: string[];
  speakers_needed: string[];
  budget: number;
  objectives: string[];
}
```

---

## AI Analysis & Auto-Population Flow

### Step 1: AI Gap Analysis (Triggered on Plan Update or Schedule)

```typescript
interface GapAnalysisRequest {
  strategic_plan_id: string;
  analysis_depth: 'quick' | 'comprehensive';
}

interface GapAnalysisResult {
  plan_id: string;
  analyzed_at: string;
  
  coverage_analysis: {
    objectives: Array<{
      id: string;
      title: string;
      weight: number;
      current_coverage: {
        challenges: number;
        pilots: number;
        solutions: number;
        campaigns: number;
        events: number;
      };
      target_coverage: {
        challenges: number;
        pilots: number;
        solutions: number;
        campaigns: number;
        events: number;
      };
      gaps: {
        challenges_needed: number;
        pilots_needed: number;
        solutions_needed: number;
        campaigns_needed: number;
        events_needed: number;
      };
    }>;
  };
  
  sector_analysis: {
    distribution: Record<string, number>;
    underserved_sectors: string[];
    recommended_focus: string[];
  };
  
  timeline_analysis: {
    upcoming_deadlines: Array<{ objective_id: string; deadline: string; days_remaining: number }>;
    delayed_items: Array<{ entity_type: string; count: number }>;
  };
  
  total_generation_needed: {
    challenges: number;
    pilots: number;
    solutions: number;
    campaigns: number;
    events: number;
  };
}
```

### Step 2: AI Demand Queue Population

The AI generates fully specified queue items with all form fields pre-filled:

```typescript
interface DemandQueueGenerationRequest {
  gap_analysis: GapAnalysisResult;
  strategic_plan: StrategicPlan;
  existing_entities: {
    challenges: Challenge[];
    pilots: Pilot[];
    solutions: Solution[];
  };
}

// AI generates prioritized queue with COMPLETE specifications
async function generateDemandQueue(request: DemandQueueGenerationRequest): Promise<DemandQueueItem[]> {
  const prompt = `
    You are a strategic planning AI. Analyze the following strategic plan and gap analysis,
    then generate a prioritized queue of entities to create.
    
    For EACH queue item, provide COMPLETE specifications that can directly populate
    generator forms without any user input.
    
    Strategic Plan: ${JSON.stringify(request.strategic_plan)}
    Gap Analysis: ${JSON.stringify(request.gap_analysis)}
    Existing Entities: ${JSON.stringify(request.existing_entities)}
    
    Generate queue items with:
    1. Priority score (0-100) based on:
       - Objective weight (from plan)
       - Coverage gap severity
       - Timeline urgency
       - Strategic alignment
    
    2. Complete prefilled_spec including:
       - Bilingual titles and descriptions
       - All entity-specific fields
       - Realistic budget estimates
       - Appropriate tags and categories
       - KPIs aligned with objectives
    
    Return as JSON array of DemandQueueItem objects.
  `;
  
  // Call AI and parse response
  return await invokeAI(prompt, DemandQueueSchema);
}
```

### Step 3: Auto-Population into Generators

```typescript
interface AutoPopulationContext {
  queueItem: DemandQueueItem;
  generator: 'challenge' | 'pilot' | 'campaign' | 'event' | 'action_plan';
}

// Hook for generators to consume queue items
function useQueueAutoPopulation(generatorType: string) {
  const [queueItem, setQueueItem] = useState<DemandQueueItem | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  
  // Load next priority item for this generator type
  const loadNextFromQueue = async () => {
    const item = await fetchNextQueueItem(generatorType);
    if (item) {
      setQueueItem(item);
      setIsAutoMode(true);
      return item.prefilled_spec;  // Returns all form field values
    }
    return null;
  };
  
  // Mark item as processed
  const completeQueueItem = async (generatedEntityId: string, qualityScore: number) => {
    if (queueItem) {
      await updateQueueItem(queueItem.id, {
        status: qualityScore >= 70 ? 'accepted' : 'review',
        generated_entity_id: generatedEntityId,
        quality_score: qualityScore
      });
    }
  };
  
  return {
    queueItem,
    isAutoMode,
    loadNextFromQueue,
    completeQueueItem,
    prefillData: queueItem?.prefilled_spec || null
  };
}
```

### Step 4: Generator Integration

Each generator component integrates with the queue:

```typescript
// Example: Challenge Generator with Auto-Population
function StrategyChallengeGenerator() {
  const { queueItem, isAutoMode, loadNextFromQueue, completeQueueItem, prefillData } = 
    useQueueAutoPopulation('challenge');
  
  const [formData, setFormData] = useState<ChallengePrefillSpec | null>(null);
  
  // Auto-populate from queue
  useEffect(() => {
    if (prefillData) {
      setFormData(prefillData as ChallengePrefillSpec);
    }
  }, [prefillData]);
  
  // Generate with AI enhancement
  const handleGenerate = async () => {
    const result = await generateChallenge({
      ...formData,
      ai_context: queueItem?.prefilled_spec.ai_context
    });
    
    // Quality assessment
    const qualityScore = await assessQuality(result, queueItem);
    
    // Complete queue item
    await completeQueueItem(result.id, qualityScore);
    
    // Auto-load next if in batch mode
    if (isAutoMode && batchMode) {
      await loadNextFromQueue();
    }
  };
  
  return (
    <div>
      {/* Queue indicator */}
      {isAutoMode && (
        <QueueIndicator 
          position={queueItem?.priority_score}
          objective={queueItem?.prefilled_spec.ai_context.objective_text}
        />
      )}
      
      {/* Form fields - all auto-populated */}
      <Form data={formData} onChange={setFormData} readOnly={isAutoMode} />
      
      {/* Actions */}
      <Button onClick={handleGenerate}>
        {isAutoMode ? 'Generate from Queue' : 'Generate Custom'}
      </Button>
      <Button onClick={loadNextFromQueue}>Load Next from Queue</Button>
    </div>
  );
}
```

---

## Quality Assessment System

### AI Quality Gate

```typescript
interface QualityAssessment {
  entity_id: string;
  entity_type: string;
  queue_item_id: string;
  
  scores: {
    objective_alignment: number;      // How well it serves the objective (0-100)
    completeness: number;             // All required fields filled properly (0-100)
    feasibility: number;              // Realistic and achievable (0-100)
    innovation: number;               // Novel approach or idea (0-100)
    clarity: number;                  // Clear, well-written content (0-100)
  };
  
  overall_score: number;              // Weighted average
  
  decision: 'auto_accept' | 'needs_review' | 'regenerate' | 'reject';
  
  feedback: {
    strengths: string[];
    improvements_needed: string[];
    regeneration_hints: string[];     // Used if regenerating
  };
}

// Quality thresholds from cascade config
const qualityRules = {
  auto_accept: (scores) => scores.overall >= 85 && scores.objective_alignment >= 80,
  needs_review: (scores) => scores.overall >= 60 && scores.overall < 85,
  regenerate: (scores) => scores.overall >= 40 && scores.overall < 60,
  reject: (scores) => scores.overall < 40
};
```

---

## Batch Generation Mode

```typescript
interface BatchGenerationConfig {
  strategic_plan_id: string;
  entity_types: string[];           // Which types to generate
  batch_size: number;               // How many per batch
  quality_threshold: number;        // Minimum quality to accept
  max_attempts: number;             // Max regeneration attempts
  auto_save: boolean;               // Save without review
  notify_on_complete: boolean;      // Send notification
}

async function runBatchGeneration(config: BatchGenerationConfig) {
  const queue = await getDemandQueue(config.strategic_plan_id, config.entity_types);
  
  const results = {
    processed: 0,
    accepted: 0,
    review_needed: 0,
    failed: 0
  };
  
  for (const item of queue.slice(0, config.batch_size)) {
    const generator = getGenerator(item.entity_type);
    
    let attempts = 0;
    let success = false;
    
    while (attempts < config.max_attempts && !success) {
      const entity = await generator.generate(item.prefilled_spec);
      const quality = await assessQuality(entity, item);
      
      if (quality.overall_score >= config.quality_threshold) {
        if (config.auto_save) {
          await saveEntity(entity);
          results.accepted++;
        } else {
          await markForReview(entity, quality);
          results.review_needed++;
        }
        success = true;
      } else {
        // Enhance prompt with feedback and retry
        item.prefilled_spec = enhanceWithFeedback(item.prefilled_spec, quality.feedback);
        attempts++;
      }
    }
    
    if (!success) {
      results.failed++;
    }
    
    results.processed++;
  }
  
  if (config.notify_on_complete) {
    await sendNotification('batch_generation_complete', results);
  }
  
  return results;
}
```

---

## Database Schema

```sql
-- Cascade configuration (stored in strategic_plans.cascade_config JSONB)

-- Demand queue table
CREATE TABLE demand_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id UUID,
  entity_type TEXT NOT NULL,
  generator_route TEXT NOT NULL,
  
  -- Priority
  priority_score INTEGER NOT NULL DEFAULT 50,
  priority_factors JSONB,
  
  -- Pre-filled specification
  prefilled_spec JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  generated_entity_id UUID,
  quality_score INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'generated', 'review', 'accepted', 'rejected'))
);

-- Index for queue processing
CREATE INDEX idx_demand_queue_priority ON demand_queue(strategic_plan_id, status, priority_score DESC);
CREATE INDEX idx_demand_queue_type ON demand_queue(entity_type, status);

-- Generation history for analytics
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID REFERENCES demand_queue(id),
  strategic_plan_id UUID REFERENCES strategic_plans(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  -- Quality metrics
  quality_assessment JSONB,
  overall_score INTEGER,
  
  -- Generation details
  attempt_number INTEGER NOT NULL DEFAULT 1,
  generation_time_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  -- Outcome
  outcome TEXT NOT NULL, -- 'accepted', 'rejected', 'regenerated', 'manual_edit'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coverage snapshots for trend analysis
CREATE TABLE coverage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Coverage data
  coverage_data JSONB NOT NULL,
  gap_analysis JSONB NOT NULL,
  
  -- Summary metrics
  total_objectives INTEGER,
  fully_covered_objectives INTEGER,
  total_gap_items INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(strategic_plan_id, snapshot_date)
);
```

---

## API Endpoints (Edge Functions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/strategy-gap-analysis` | POST | Run AI gap analysis on strategic plan |
| `/strategy-demand-queue` | GET | Get prioritized demand queue |
| `/strategy-demand-queue` | POST | Generate/refresh demand queue with AI |
| `/strategy-demand-queue/:id` | PATCH | Update queue item status |
| `/strategy-auto-generate` | POST | Trigger batch generation |
| `/strategy-quality-assess` | POST | Assess generated entity quality |
| `/strategy-coverage-snapshot` | POST | Create coverage snapshot |

---

## UI Components

### 1. Demand Dashboard
- Queue overview with priority visualization
- Coverage heat map by objective
- Generation progress tracker
- Batch controls

### 2. Queue-Aware Generators
- Auto-population from queue
- Queue position indicator
- One-click generation
- Quality feedback display

### 3. Quality Review Panel
- Review flagged items
- Accept/reject controls
- Regeneration with feedback
- Bulk actions

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Add `cascade_config` to strategic_plans
- [ ] Create `demand_queue` table
- [ ] Build gap analysis edge function

### Phase 2: Queue System
- [ ] Build AI demand queue generator
- [ ] Create queue management UI
- [ ] Implement `useQueueAutoPopulation` hook

### Phase 3: Generator Integration
- [ ] Update all generators with queue support
- [ ] Add auto-population mode
- [ ] Implement quality assessment

### Phase 4: Automation
- [ ] Build batch generation system
- [ ] Add scheduled gap analysis
- [ ] Create notification system

---

## Key Benefits

1. **Zero Manual Input**: AI pre-fills all form fields based on strategic context
2. **Priority-Driven**: Always generates what matters most first
3. **Quality Assured**: AI validates alignment and completeness
4. **Traceable**: Every generation linked back to strategic objectives
5. **Adaptive**: Learns from feedback to improve specifications
6. **Scalable**: Batch generation handles large cascade requirements
