# AI Prompt Modules System

> Centralized, maintainable AI prompt architecture for the Innovation Ecosystem Platform

## Overview

The AI Prompt Modules System provides a structured approach to managing AI prompts across the platform. All prompts are centralized in `src/lib/ai/prompts/` with consistent patterns for easy maintenance, testing, and reuse.

### Current Migration Status

| Metric | Value | Status |
|--------|-------|--------|
| Total Prompt Modules | 126 | ✅ Created |
| Total Prompts Defined | ~404 | ✅ Available |
| Categories | 16 | ✅ Organized |
| Files Using Centralized Prompts | ~147 | ✅ Migrated |
| Files with Inline Prompts | ~57 | ⚠️ Pending |
| Edge Functions with Inline Prompts | ~17 | ⚠️ Pending |
| **Overall Migration Progress** | **~70%** | 🔄 In Progress |

## Architecture

```
src/lib/ai/prompts/
├── index.js                    # Main entry point & registry
├── core/                       # Core platform prompts (10 modules)
├── challenges/                 # Challenge management (12 modules)
├── solutions/                  # Solution prompts (8 modules)
├── pilots/                     # Pilot project prompts (7 modules)
├── programs/                   # Program management (10 modules)
├── strategy/                   # Strategic planning (14 modules)
├── policy/                     # Policy analysis (5 modules)
├── events/                     # Event management (3 modules)
├── executive/                  # Executive dashboards (5 modules)
├── portfolio/                  # Portfolio management (4 modules)
├── profiles/                   # User profiles (5 modules)
├── onboarding/                 # User onboarding (3 modules)
├── forms/                      # Form assistance (1 module)
├── evaluation/                 # Evaluation prompts (3 modules)
├── quality/                    # Quality assurance (3 modules)
├── analytics/                  # Analytics prompts (4 modules)
└── rd/                         # R&D management (6 modules)

src/components/strategy/wizard/prompts/
├── index.js                    # Strategy wizard prompts
├── stepPrompts.js              # Step 1-17 prompts
└── singleItemPrompts.js        # Single item generation
```

## Module Categories

### Core Modules (`core/`)
Foundation prompts used across the platform.

| Module | Prompts | Description |
|--------|---------|-------------|
| `capacityPredictor` | 1 | Predicts resource capacity needs |
| `peerComparison` | 1 | Compares entities against peers |
| `exemptionSuggester` | 1 | Suggests policy exemptions |
| `formAssistant` | 1 | Assists with form completion |
| `rdToPilot` | 1 | Converts R&D to pilot proposals |
| `successPredictor` | 1 | Predicts success likelihood |
| `proposalBrief` | 1 | Generates proposal briefs |
| `crossEntity` | 2 | Cross-entity analysis & matching |
| `platformInsights` | 3 | Platform-wide insights |
| `workPrioritizer` | 1 | Prioritizes work items |

### Challenge Modules (`challenges/`)
AI prompts for challenge lifecycle management.

| Module | Prompts | Description |
|--------|---------|-------------|
| `challengeAnalysis` | 3 | Root cause & impact analysis |
| `challengeMatching` | 2 | Solution-challenge matching |
| `challengeSummary` | 1 | Executive summaries |
| `challengeScoring` | 2 | Priority scoring |
| `challengeRecommendations` | 2 | Action recommendations |
| `submissionBrief` | 1 | Bilingual submission briefs |
| `challengeRD` | 3 | Challenge to R&D conversion |

### Solution Modules (`solutions/`)
Solution discovery and matching prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `solutionAnalysis` | 2 | Solution viability analysis |
| `solutionMatching` | 3 | Challenge-solution matching |
| `solutionScoring` | 2 | Solution ranking |
| `deploymentSuccess` | 3 | Deployment & ROI analysis |

### Pilot Modules (`pilots/`)
Pilot project management prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `pilotDesign` | 3 | Pilot design assistance |
| `pilotEvaluation` | 2 | Pilot outcome evaluation |
| `pilotScaling` | 2 | Scale-up recommendations |
| `pilotRisks` | 1 | Risk assessment |
| `pilotTransition` | 2 | Pilot transition workflows |

### Program Modules (`programs/`)
Program management and impact tracking.

| Module | Prompts | Description |
|--------|---------|-------------|
| `impactStory` | 1 | Narrative impact stories |
| `impactCalculator` | 1 | Quantified impact metrics |
| `curriculumGenerator` | 1 | Training curriculum |
| `successPredictor` | 1 | Program success prediction |
| `crossProgramSynergy` | 1 | Cross-program opportunities |
| `programDesign` | 2 | Program structure design |
| `programWorkflows` | 1 | Workflow automation |
| `lessonsToStrategy` | 1 | Lessons learned synthesis |
| `applicationScreening` | 1 | Application review |

### Strategy Modules (`strategy/`)
Strategic planning and analysis.

| Module | Prompts | Description |
|--------|---------|-------------|
| `wizard` | 9 | Strategy creation wizard |
| `wizardPrompts` | 17 | Step-by-step wizard prompts |
| `strategyAnalysis` | 3 | Strategic analysis |
| `strategyAlignment` | 2 | Goal alignment |
| `narrativeGenerator` | 1 | Strategic narratives |
| `gapProgramRecommender` | 1 | Gap-based recommendations |

### Strategy Wizard (`components/strategy/wizard/prompts/`)
Dedicated prompts for the 17-step strategy wizard.

| Prompt | Description |
|--------|-------------|
| `getStep1Prompt` - `getStep17Prompt` | Context, Vision, Stakeholders, PESTEL, SWOT, Scenarios, Risks, Dependencies, Objectives, National Alignment, KPIs, Actions, Resources, Timeline, Governance, Communication, Change Management |
| `generateSingleStakeholderPrompt` | Add individual stakeholder |
| `generateSingleRiskPrompt` | Add individual risk |
| `generateSingleObjectivePrompt` | Add individual objective |
| `generateSingleKpiPrompt` | Add individual KPI |
| `generateSingleActionPrompt` | Add individual action |

### Policy Modules (`policy/`)
Policy analysis and recommendations.

| Module | Prompts | Description |
|--------|---------|-------------|
| `executiveSummary` | 1 | Policy summaries |
| `conflictDetector` | 1 | Policy conflict detection |
| `policyAnalysis` | 2 | Comprehensive analysis |

### Events Modules (`events/`)
Event optimization and prediction.

| Module | Prompts | Description |
|--------|---------|-------------|
| `eventOptimizer` | 1 | Event timing & capacity |
| `attendancePredictor` | 1 | Attendance forecasting |
| `programEventCorrelator` | 1 | Program-event analysis |

### Executive Modules (`executive/`)
Executive dashboard insights.

| Module | Prompts | Description |
|--------|---------|-------------|
| `riskForecast` | 1 | Strategic risk forecasting |
| `executiveBriefing` | 1 | Executive briefings |
| `priorityRecommendations` | 1 | Priority recommendations |
| `executiveNarrative` | 2 | Narrative generation |

### Portfolio Modules (`portfolio/`)
Portfolio health and optimization.

| Module | Prompts | Description |
|--------|---------|-------------|
| `portfolioHealth` | 1 | Portfolio health analysis |
| `portfolioOptimizer` | 1 | Optimization recommendations |
| `collaborationSuggester` | 1 | Collaboration opportunities |
| `portfolioNarrative` | 1 | Portfolio narratives |

### Profile Modules (`profiles/`)
User profile management.

| Module | Prompts | Description |
|--------|---------|-------------|
| `profileCompletion` | 1 | Profile completion suggestions |
| `expertFinder` | 1 | Expert matching |
| `credentialVerification` | 1 | Credential verification |
| `connections` | 1 | Connection recommendations |
| `roleAssignment` | 1 | Role suggestions |

### Onboarding Modules (`onboarding/`)
User onboarding assistance.

| Module | Prompts | Description |
|--------|---------|-------------|
| `translationPrompts` | 1 | Content translation |
| `linkedinImport` | 1 | LinkedIn data import |
| `profileSuggestions` | 1 | Profile setup suggestions |

### Forms Modules (`forms/`)
Form assistance prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `formAssistant` | 1 | Form field assistance |

### Evaluation Modules (`evaluation/`)
Evaluation and assessment prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `evaluationAssist` | 1 | Evaluation assistance |
| `criteriaGenerator` | 1 | Evaluation criteria |
| `scoringHelper` | 1 | Scoring recommendations |

### Quality Modules (`quality/`)
Quality assurance prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `assurance` | 3 | Quality checks |

### Analytics Modules (`analytics/`)
Analytics and insights prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `trendAnalysis` | 1 | Trend detection |
| `anomalyDetection` | 1 | Anomaly identification |
| `forecastGeneration` | 1 | Predictive forecasts |
| `insightsSynthesis` | 1 | Insights compilation |

---

## Implementation Plan

### Phase 1: Component Migration (Priority: High)
**~57 files with inline prompts**

#### Batch 1: Pages (15 files)
| File | New Prompt Module | Priority |
|------|-------------------|----------|
| `ChallengeCreate.jsx` | `challenges/challengeCreate.js` | High |
| `PolicyCreate.jsx` | `policy/policyCreate.js` | High |
| `PolicyDetail.jsx` | `policy/policyDetail.js` | Medium |
| `RDProjectEdit.jsx` | `rd/rdProjectEdit.js` | Medium |
| `PatternRecognition.jsx` | `analytics/patternRecognition.js` | Medium |
| `SandboxDetail.jsx` | `sandbox/sandboxDetail.js` | Medium |
| `EventsAnalyticsDashboard.jsx` | `events/eventsAnalytics.js` | Medium |
| `ExpertMatchingEngine.jsx` | `profiles/expertMatching.js` | Medium |
| `InternationalBenchmarkingSuite.jsx` | `analytics/benchmarking.js` | Low |
| `MunicipalityEdit.jsx` | `municipalities/municipalityEdit.js` | Low |

#### Batch 2: Core Components (20 files)
| File | New Prompt Module | Priority |
|------|-------------------|----------|
| `AutoTranslator.jsx` | `translation/autoTranslator.js` | High |
| `KPIBenchmarkData.jsx` | `challenges/kpiBenchmark.js` | High |
| `MIIImprovementAI.jsx` | `municipalities/miiImprovement.js` | Medium |
| `PilotLearningEngine.jsx` | `pilots/learningEngine.js` | Medium |
| `AdaptiveManagement.jsx` | `pilots/adaptiveManagement.js` | Medium |
| `RealTimeMarketIntelligence.jsx` | `solutions/marketIntelligence.js` | Medium |
| `SolutionVerificationWizard.jsx` | `solutions/verification.js` | Medium |
| `LivingLabExpertMatching.jsx` | `livinglab/expertMatching.js` | Medium |
| `MatchQualityGate.jsx` | `matchmaker/qualityGate.js` | Medium |
| `TRLAssessmentTool.jsx` | `solutions/trlAssessment.js` | Medium |
| `MentorMatchingEngine.jsx` | `programs/mentorMatching.js` | Medium |
| `AlumniSuccessStoryGenerator.jsx` | `programs/alumniStory.js` | Low |
| `ProgramCreateWizard.jsx` | `programs/programCreate.js` | Medium |
| `DynamicPricingIntelligence.jsx` | `solutions/dynamicPricing.js` | Low |
| `PilotToPolicyWorkflow.jsx` | `pilots/policyWorkflow.js` | Medium |
| `AIRoleAssigner.jsx` | `onboarding/roleAssigner.js` | Low |
| `RDToPilotTransition.jsx` | `rd/pilotTransition.js` | Medium |
| `ProgramMentorMatching.jsx` | `programs/mentorMatching.js` | Low |

#### Batch 3: Remaining Components (22 files)
See full list in implementation tracking below.

### Phase 2: Edge Function Migration (Priority: High)
**~17 edge functions with inline prompts**

| Edge Function | Action | Priority |
|---------------|--------|----------|
| `strategy-workflow-ai` | Create `_shared/prompts/workflow.ts` | High |
| `strategy-committee-ai` | Create `_shared/prompts/committee.ts` | High |
| `strategy-signoff-ai` | Create `_shared/prompts/signoff.ts` | High |
| `strategy-version-ai` | Create `_shared/prompts/version.ts` | Medium |
| `strategy-action-plan-generator` | Create `_shared/prompts/actionPlan.ts` | Medium |
| `strategy-context-generator` | Create `_shared/prompts/context.ts` | Medium |
| `strategy-ownership-ai` | Create `_shared/prompts/ownership.ts` | Medium |
| `strategy-swot-generator` | Create `_shared/prompts/swot.ts` | Medium |
| `strategy-national-linker` | Create `_shared/prompts/nationalLink.ts` | Medium |
| `translate-policy` | Create `_shared/prompts/translate.ts` | Low |
| Others (7 functions) | Create respective prompt modules | Low |

### Phase 3: Prompt Library Enhancement
1. Add missing schemas for all prompts
2. Add JSDoc documentation
3. Add version tags
4. Create unit tests for prompt builders

---

## File Pattern

Each prompt module follows a consistent structure:

```javascript
/**
 * Module Name
 * @module category/moduleName
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for the AI model
 */
export const MODULE_NAME_SYSTEM_PROMPT = getSystemPrompt('module_key', `
You are an AI assistant specialized in...
`);

/**
 * Build the user prompt with context
 * @param {Object} params - Input parameters
 * @returns {string} Formatted prompt
 */
export function buildModuleNamePrompt(params) {
  const { field1, field2 } = params;
  return `
    Analyze the following:
    - Field 1: ${field1}
    - Field 2: ${field2}
  `;
}

/**
 * JSON schema for structured output
 */
export const MODULE_NAME_SCHEMA = {
  type: 'object',
  properties: {
    result: { type: 'string' },
    confidence: { type: 'number' },
    recommendations: { type: 'array', items: { type: 'string' } }
  },
  required: ['result', 'confidence']
};

/**
 * Prompt configuration object
 */
export const MODULE_NAME_PROMPTS = {
  systemPrompt: MODULE_NAME_SYSTEM_PROMPT,
  buildPrompt: buildModuleNamePrompt,
  schema: MODULE_NAME_SCHEMA
};
```

## Usage Examples

### Basic Usage

```javascript
import { 
  buildChallengeAnalysisPrompt, 
  CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  CHALLENGE_ANALYSIS_SCHEMA 
} from '@/lib/ai/prompts/challenges';

// In a component
const result = await invokeAI({
  systemPrompt: CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  prompt: buildChallengeAnalysisPrompt({ challenge }),
  response_json_schema: CHALLENGE_ANALYSIS_SCHEMA
});
```

### With usePrompt Hook

```javascript
import { usePrompt } from '@/hooks/usePrompt';
import { CHALLENGE_ANALYSIS_PROMPTS } from '@/lib/ai/prompts/challenges';

function MyComponent() {
  const { invoke, isLoading } = usePrompt(CHALLENGE_ANALYSIS_PROMPTS);
  
  const handleAnalyze = async () => {
    const result = await invoke({ challenge: challengeData });
  };
}
```

### With Edge Function

```typescript
// supabase/functions/_shared/prompts/challenges.ts
export const CHALLENGE_ANALYSIS_SYSTEM_PROMPT = `...`;
export function buildChallengeAnalysisPrompt(challenge) { ... }

// supabase/functions/analyze-challenge/index.ts
import { CHALLENGE_ANALYSIS_SYSTEM_PROMPT, buildChallengeAnalysisPrompt } from '../_shared/prompts/challenges.ts';

serve(async (req) => {
  const { challenge } = await req.json();
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: CHALLENGE_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: buildChallengeAnalysisPrompt(challenge) }
      ]
    })
  });
  
  return new Response(JSON.stringify(await response.json()));
});
```

## Contributing Guidelines

### Adding New Prompts

1. **Identify the category** - Determine which module category fits best
2. **Create or update module file** - Follow the file pattern above
3. **Export from index** - Add exports to the category's `index.js`
4. **Update main index** - Ensure main `prompts/index.js` exports the category
5. **Add JSDoc** - Document all exports with JSDoc comments
6. **Test the prompt** - Verify output quality with sample inputs

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| System Prompt | `UPPER_SNAKE_CASE` | `CHALLENGE_ANALYSIS_SYSTEM_PROMPT` |
| Prompt Builder | `buildXxxPrompt` | `buildChallengeAnalysisPrompt` |
| Schema | `XXX_SCHEMA` | `CHALLENGE_ANALYSIS_SCHEMA` |
| Config Object | `XXX_PROMPTS` | `CHALLENGE_ANALYSIS_PROMPTS` |
| Module File | `camelCase.js` | `challengeAnalysis.js` |

### Best Practices

1. **Keep prompts focused** - One prompt = one task
2. **Use structured output** - Always define JSON schemas
3. **Include Saudi context** - Use `getSystemPrompt()` for Saudi-specific context
4. **Include examples** - Add few-shot examples in system prompts
5. **Version control** - Use `@version` JSDoc tags
6. **Test edge cases** - Handle missing/null data gracefully
7. **Document parameters** - Use JSDoc `@param` tags
8. **Support bilingual** - Always generate EN + AR content

## Migrating Inline Prompts

If you find an inline prompt in a component:

1. Identify the prompt's purpose
2. Create a new module or add to existing one
3. Extract the prompt text to a constant
4. Create a builder function for dynamic parts
5. Add JSON schema for structured output
6. Import and use the module in the component
7. Update the category's `index.js`

### Before (Inline)

```javascript
// Component.jsx
const prompt = `Analyze this challenge: ${challenge.title}...`;
const result = await invokeAI({ prompt });
```

### After (Module)

```javascript
// prompts/challenges/analysis.js
export const CHALLENGE_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('challenge_analysis', `
You are an expert in municipal innovation challenge analysis...
`);

export function buildAnalysisPrompt({ challenge }) {
  return `Analyze this challenge: ${challenge.title}...`;
}

export const CHALLENGE_ANALYSIS_SCHEMA = { ... };

// Component.jsx
import { CHALLENGE_ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt, CHALLENGE_ANALYSIS_SCHEMA } from '@/lib/ai/prompts/challenges';

const result = await invokeAI({
  systemPrompt: CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  prompt: buildAnalysisPrompt({ challenge }),
  response_json_schema: CHALLENGE_ANALYSIS_SCHEMA
});
```

## Related Documentation

- [Edge Functions Documentation](./EDGE_FUNCTIONS_DOCUMENTATION.md)
- [AI Integration Guide](./AI_INTEGRATION.md)
- [Saudi Context System](../src/lib/saudiContext.js)

---

*Last Updated: December 2024*
*Migration Status: ~70% Complete (147/204 files migrated)*
