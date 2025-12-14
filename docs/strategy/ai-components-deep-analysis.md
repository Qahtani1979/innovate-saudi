# AI Components Deep Analysis - Strategy Module

## AI Infrastructure

### Core AI Hook: `useAIWithFallback`

**Location:** `src/hooks/useAIWithFallback.js`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Centralized AI invocation with error handling and rate limiting |
| **Input** | `{ prompt, response_json_schema, system_prompt }` |
| **Output** | `{ success, data, fallback, rateLimited?, error? }` |
| **Backend** | Calls `supabase.functions.invoke('invoke-llm')` |
| **Rate Limiting** | Session-based tracking, warns at 80% usage |
| **Fallback** | Returns `fallbackData` if AI fails |

---

## Phase 1: Pre-Planning AI Components

### 1.1 SWOTAnalysisBuilder ✅ REAL AI

**Location:** `src/components/strategy/preplanning/SWOTAnalysisBuilder.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate SWOT analysis items based on context |
| **Trigger** | User enters context text + clicks "AI Analyze" |
| **AI Input** | Context text (free-form) |
| **AI Prompt** | "Analyze this context and provide a SWOT analysis with 3-5 items per category" |
| **AI Output Schema** | `{ strengths: [], weaknesses: [], opportunities: [], threats: [] }` each with `{ text_en, text_ar, priority, description }` |
| **Integration** | Merges AI suggestions with existing manual items |
| **Uses Hook** | `useAIWithFallback` |

### 1.2 StakeholderAnalysisWidget ✅ REAL AI

**Location:** `src/components/strategy/preplanning/StakeholderAnalysisWidget.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Identify stakeholders and their power/interest levels |
| **Trigger** | User enters context + clicks "AI Suggest" |
| **AI Input** | Initiative context description |
| **AI Prompt** | "Identify 5-8 key stakeholders for this initiative" |
| **AI Output Schema** | `{ stakeholders: [{ name_en, name_ar, type, power, interest, influence, expectations }] }` |
| **Integration** | Adds stakeholders to power/interest matrix |
| **Uses Hook** | `useAIWithFallback` |

### 1.3 RiskAssessmentBuilder ✅ REAL AI

**Location:** `src/components/strategy/preplanning/RiskAssessmentBuilder.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Identify and score strategic risks |
| **Trigger** | User enters context + clicks "AI Identify Risks" |
| **AI Input** | Strategic plan context |
| **AI Prompt** | "Identify 5-8 key risks for this strategic initiative" |
| **AI Output Schema** | `{ risks: [{ name_en, name_ar, category, probability, impact, mitigation_strategy, contingency_plan }] }` |
| **Integration** | Populates risk matrix visualization |
| **Uses Hook** | `useAIWithFallback` |

### 1.4 EnvironmentalScanWidget ⚠️ MOCK AI

**Location:** `src/components/strategy/preplanning/EnvironmentalScanWidget.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | PESTLE analysis - identify environmental factors |
| **Current State** | Uses `setTimeout` mock, NOT real AI |
| **Mock Behavior** | Returns hardcoded single factor after 2s delay |
| **Needed** | Real AI integration for PESTLE factor generation |

### 1.5 BaselineDataCollector ❌ NO AI

**Location:** `src/components/strategy/preplanning/BaselineDataCollector.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Collect and validate baseline KPI data |
| **Current State** | No AI integration |
| **Potential AI** | Could suggest KPIs based on strategic goals, predict targets |

---

## Phase 2: Strategy Creation AI Components

### 2.1 SectorStrategyBuilder ⚠️ NEEDS AI

**Location:** `src/components/strategy/creation/SectorStrategyBuilder.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Build sector-specific strategies |
| **Current State** | Manual form-based builder |
| **Needed AI** | Generate sector objectives based on national strategy alignment |

### 2.2 StrategyTimelinePlanner ❌ NO AI

**Location:** `src/components/strategy/creation/StrategyTimelinePlanner.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Create strategy timelines and milestones |
| **Current State** | Manual timeline builder |
| **Needed AI** | AI-optimized timeline generation, dependency analysis |

### 2.3 NationalStrategyLinker ❌ NO AI

**Location:** `src/components/strategy/creation/NationalStrategyLinker.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Link strategy to national Vision 2030 objectives |
| **Current State** | Manual linking |
| **Needed AI** | Auto-suggest alignments based on text analysis |

---

## Phase 3: Cascade AI Components

### 3.1 StrategyChallengeGenerator ✅ REAL AI (Edge Function)

**Location:** `src/components/strategy/cascade/StrategyChallengeGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate innovation challenges from strategic objectives |
| **Trigger** | Select plan + objectives + click "Generate" |
| **AI Input** | `{ strategic_plan_id, objective_ids, sector_id, challenge_count, additional_context }` |
| **Backend** | Calls `supabase.functions.invoke('strategy-challenge-generator')` |
| **AI Output** | `{ challenges: [{ title_en/ar, description_en/ar, problem_statement_en/ar, desired_outcome_en/ar }] }` |
| **Integration** | Saves generated challenges to `challenges` table |

### 3.2 StrategyToPilotGenerator ⚠️ CHECK IMPLEMENTATION

**Location:** `src/components/strategy/cascade/StrategyToPilotGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate pilot proposals from strategy |
| **Status** | Needs verification if using real AI or mock |

### 3.3 StrategyToPartnershipGenerator ⚠️ CHECK IMPLEMENTATION

**Location:** `src/components/strategy/cascade/StrategyToPartnershipGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate partnership proposals |
| **Status** | Needs verification if using real AI or mock |

### 3.4 StrategyToRDCallGenerator ⚠️ CHECK IMPLEMENTATION

**Location:** `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate R&D calls from strategy |
| **Status** | Needs verification |

### 3.5 StrategyToEventGenerator ⚠️ CHECK IMPLEMENTATION

**Location:** `src/components/strategy/cascade/StrategyToEventGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate events aligned with strategy |
| **Status** | Needs verification |

### 3.6 StrategyToLivingLabGenerator ⚠️ CHECK IMPLEMENTATION

**Location:** `src/components/strategy/cascade/StrategyToLivingLabGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate living lab proposals |
| **Status** | Needs verification |

### 3.7 StrategyToCampaignGenerator ⚠️ CHECK IMPLEMENTATION

**Location:** `src/components/strategy/cascade/StrategyToCampaignGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate awareness campaigns |
| **Status** | Needs verification |

### 3.8 StrategyToPolicyGenerator ⚠️ CHECK IMPLEMENTATION

**Location:** `src/components/strategy/cascade/StrategyToPolicyGenerator.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Generate policy recommendations |
| **Status** | Needs verification |

---

## Phase 4: Governance AI Components

### 4.1 StakeholderSignoffTracker ❌ NO AI

**Location:** `src/components/strategy/governance/StakeholderSignoffTracker.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Track stakeholder approvals |
| **Current State** | Manual workflow tracking |
| **Needed AI** | Smart routing based on stakeholder availability, bottleneck prediction |

### 4.2 StrategyVersionControl ❌ NO AI

**Location:** `src/components/strategy/governance/StrategyVersionControl.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Version and diff management |
| **Current State** | Manual version tracking |
| **Needed AI** | AI-generated change summaries, impact analysis |

---

## Phase 5: Communication AI Components

### 5.1 PublicStrategyDashboard ❌ NO AI

**Location:** `src/components/strategy/communication/PublicStrategyDashboard.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Public-facing strategy dashboard |
| **Current State** | Static display |
| **Needed AI** | AI-generated executive summaries, key highlights |

### 5.2 StrategyPublicView ❌ NO AI

**Location:** `src/components/strategy/communication/StrategyPublicView.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Public strategy view |
| **Current State** | Static display |
| **Needed AI** | Natural language strategy explanations |

---

## Phase 6: Monitoring AI Components

### 6.1 StrategyAlignmentScoreCard ❌ NO AI (Uses Hook)

**Location:** `src/components/strategy/monitoring/StrategyAlignmentScoreCard.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Show alignment scores |
| **Current State** | Needs verification |
| **Related** | Uses `useStrategyAlignment` hook |

### 6.2 Related AI Components (Other Modules)

These components use AI and are relevant to strategy monitoring:

- `BottleneckDetector.jsx` - Detect workflow bottlenecks
- `WhatIfSimulator.jsx` - Scenario simulation
- `StrategicNarrativeGenerator.jsx` - Generate narratives
- `StrategicGapProgramRecommender.jsx` - Gap analysis
- `AutomatedMIICalculator.jsx` - MII score calculation

---

## Phase 7: Review AI Components - ⚠️ CRITICAL GAPS

### 7.1 StrategyAdjustmentWizard ❌ NO AI

**Location:** `src/components/strategy/review/StrategyAdjustmentWizard.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Guide users through strategy adjustments |
| **Current State** | Multi-step wizard, NO AI |
| **Current Features** | Element selection, value changes, impact preview, approval routing |
| **Mock Data** | Hardcoded impact estimates (5 entities, +12% budget) |
| **CRITICAL GAP** | No AI for impact analysis, no smart recommendations |

**Needed AI Integration:**
```
Input: {
  strategic_plan_id,
  adjustment_type,
  element_affected,
  current_value,
  proposed_value,
  justification
}

Output: {
  impact_analysis: {
    downstream_entities: [...],
    budget_impact: { percentage, amount },
    timeline_impact: { days_difference, affected_milestones },
    kpi_impact: [{ kpi_name, before, after }],
    risk_assessment: { level, factors }
  },
  recommendations: [...],
  required_approvers: [...],
  similar_past_adjustments: [...]
}
```

### 7.2 StrategyReprioritizer ❌ NO AI

**Location:** `src/components/strategy/review/StrategyReprioritizer.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Drag-and-drop priority reordering |
| **Current State** | Manual reordering only |
| **Current Features** | Priority scores display, criteria bars, manual up/down buttons |
| **Mock Data** | Hardcoded items with static scores |
| **CRITICAL GAP** | No AI-optimized prioritization |

**Needed AI Integration:**
```
Input: {
  objectives: [...],
  criteria_weights: {
    strategic_importance: 0.3,
    resource_availability: 0.2,
    quick_win_potential: 0.15,
    risk_level: 0.15,
    stakeholder_demand: 0.2
  },
  constraints: { budget, timeline, resources }
}

Output: {
  optimized_order: [...],
  reasoning: [...],
  tradeoff_analysis: [...],
  sensitivity_analysis: { what changes if weights change }
}
```

### 7.3 StrategyImpactAssessment ❌ NO AI

**Location:** `src/components/strategy/review/StrategyImpactAssessment.jsx`

| Attribute | Details |
|-----------|---------|
| **Purpose** | Comprehensive impact assessment dashboard |
| **Current State** | Display only, NO AI |
| **Current Features** | 5 impact dimensions (Economic, Social, Environmental, Institutional, Innovation), metrics display |
| **Mock Data** | All hardcoded impact scores and metrics |
| **CRITICAL GAP** | No AI to calculate/predict impact |

**Needed AI Integration:**
```
Input: {
  strategic_plan_id,
  performance_data: [...],
  external_factors: [...],
  time_period
}

Output: {
  overall_impact_score,
  dimension_scores: {
    economic: { score, trend, contributing_factors },
    social: { ... },
    environmental: { ... },
    institutional: { ... },
    innovation: { ... }
  },
  predictions: { 6_month, 12_month },
  improvement_recommendations: [...],
  benchmark_comparison: { national, international }
}
```

---

## Summary Matrix

| Phase | Component | AI Status | Hook Used | Edge Function |
|-------|-----------|-----------|-----------|---------------|
| **1. Pre-Planning** | SWOTAnalysisBuilder | ✅ Real AI | useAIWithFallback | invoke-llm |
| | StakeholderAnalysisWidget | ✅ Real AI | useAIWithFallback | invoke-llm |
| | RiskAssessmentBuilder | ✅ Real AI | useAIWithFallback | invoke-llm |
| | EnvironmentalScanWidget | ⚠️ Mock | None | None |
| | BaselineDataCollector | ❌ None | None | None |
| **2. Creation** | SectorStrategyBuilder | ❌ None | None | None |
| | StrategyTimelinePlanner | ❌ None | None | None |
| | NationalStrategyLinker | ❌ None | None | None |
| **3. Cascade** | StrategyChallengeGenerator | ✅ Real AI | Direct invoke | strategy-challenge-generator |
| | Others (7 generators) | ⚠️ Verify | Needs check | Needs check |
| **4. Governance** | StakeholderSignoffTracker | ❌ None | None | None |
| | StrategyVersionControl | ❌ None | None | None |
| **5. Communication** | PublicStrategyDashboard | ❌ None | None | None |
| | StrategyPublicView | ❌ None | None | None |
| **6. Monitoring** | StrategyAlignmentScoreCard | ⚠️ Verify | useStrategyAlignment | Needs check |
| **7. Review** | StrategyAdjustmentWizard | ❌ None | None | None |
| | StrategyReprioritizer | ❌ None | None | None |
| | StrategyImpactAssessment | ❌ None | None | None |

---

## Priority Implementation Order

### P0 - Critical (Phase 7 Review)
1. **StrategyImpactAssessment AI** - Core review functionality
2. **StrategyAdjustmentWizard AI** - Impact prediction for changes
3. **StrategyReprioritizer AI** - Optimization recommendations

### P1 - High (Pre-Planning Completion)
4. **EnvironmentalScanWidget** - Replace mock with real AI

### P2 - Medium (Creation Phase)
5. **NationalStrategyLinker AI** - Auto-alignment suggestions
6. **StrategyTimelinePlanner AI** - Timeline optimization

### P3 - Enhancement (Governance & Communication)
7. **StrategyVersionControl AI** - Change summaries
8. **PublicStrategyDashboard AI** - Executive summaries
