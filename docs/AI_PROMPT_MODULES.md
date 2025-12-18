# AI Prompt Modules System

> Centralized, maintainable AI prompt architecture for the Innovation Ecosystem Platform

## Overview

The AI Prompt Modules System provides a structured approach to managing AI prompts across the platform. All prompts are centralized in `src/lib/ai/prompts/` with consistent patterns for easy maintenance, testing, and reuse.

### Migration Status

| Metric | Value | Status |
|--------|-------|--------|
| Total Prompt Modules | **395+** | ✅ Complete |
| Prompt Categories | **90+ directories** | ✅ Organized |
| Strategy System | **23 files** | ✅ Complete |
| Components Migrated | **94/94** | ✅ Complete |
| Pages Migrated | **102/102** | ✅ Complete |
| Edge Functions | **2/2** | ✅ Complete |

---

## 📁 Directory Structure

```
src/lib/ai/prompts/
├── accessibility/       ├── admin/              ├── alerts/
├── analytics/          ├── approval/           ├── automation/
├── benchmarks/         ├── bonus/              ├── challenges/
├── change/             ├── citizen/            ├── classification/
├── collaboration/      ├── communications/     ├── comparison/
├── compliance/         ├── content/            ├── core/
├── data/               ├── dataManagement/     ├── decisions/
├── documents/          ├── evaluation/         ├── events/
├── executive/          ├── extraction/         ├── feedback/
├── finance/            ├── forecasting/        ├── forms/
├── gates/              ├── generation/         ├── geography/
├── governance/         ├── hub/                ├── impact/
├── integration/        ├── knowledge/          ├── learning/
├── linking/            ├── livinglab/          ├── localization/
├── matchmaker/         ├── media/              ├── meetings/
├── mii/                ├── monitoring/         ├── municipalities/
├── notifications/      ├── onboarding/         ├── organizations/
├── partnerships/       ├── performance/        ├── pilots/
├── policy/             ├── portfolio/          ├── procurement/
├── profiles/           ├── programs/           ├── projects/
├── quality/            ├── rd/                 ├── recommendations/
├── reports/            ├── resources/          ├── sandbox/
├── scaling/            ├── scheduling/         ├── search/
├── security/           ├── services/           ├── smart/
├── solution/           ├── solutions/          ├── startup/
├── strategy/           ├── summarization/      ├── surveys/
├── taxonomy/           ├── templates/          ├── timeline/
├── training/           ├── translation/        ├── uploader/
├── ux/                 ├── validation/         ├── visualization/
├── work/               ├── workflow/           ├── workflows/
└── index.js
```

---

## 🎯 Strategy System (23 files)

The Strategy module is the most comprehensive prompt system, supporting the full strategic planning lifecycle.

### Strategy Module Files (`src/lib/ai/prompts/strategy/`)

| File | Description | Exports |
|------|-------------|---------|
| `index.js` | Module exports | All strategy prompts |
| `pestel.js` | PESTEL analysis | `PESTEL_ANALYSIS_PROMPTS` |
| `riskAssessment.js` | Risk identification & mitigation | `RISK_ASSESSMENT_PROMPTS` |
| `dependencies.js` | Strategic dependencies mapping | `DEPENDENCIES_PROMPTS` |
| `timeline.js` | Timeline generation | `TIMELINE_PROMPTS` |
| `actionPlans.js` | Action plan generation | `ACTION_PLAN_PROMPTS` |
| `kpis.js` | KPI generation & tracking | `KPI_GENERATION_PROMPTS` |
| `wizard.js` | Strategy wizard core prompts | `STRATEGY_WIZARD_PROMPTS` |
| `wizardPrompts.js` | Step-specific wizard prompts | `buildStrategyWizardPrompt` |
| `wizardContent.js` | Wizard content generation | `WIZARD_CONTENT_PROMPTS` |
| `copilot.js` | Strategy AI copilot | `STRATEGY_COPILOT_PROMPTS` |
| `preplanning.js` | Pre-planning analysis | `PREPLANNING_PROMPTS` |
| `impactAssessment.js` | Impact assessment | `IMPACT_ASSESSMENT_PROMPTS` |
| `adjustment.js` | Strategy adjustments | `ADJUSTMENT_PROMPTS` |
| `adjustmentWizard.js` | Adjustment wizard | `ADJUSTMENT_WIZARD_PROMPTS` |
| `bottleneckDetector.js` | Bottleneck detection | `BOTTLENECK_DETECTOR_PROMPTS` |
| `whatIfSimulator.js` | What-if scenarios | `WHAT_IF_SIMULATOR_PROMPTS` |
| `narrativeGenerator.js` | Strategy narratives | `NARRATIVE_GENERATOR_PROMPTS` |
| `gapProgramRecommender.js` | Gap-based recommendations | `GAP_PROGRAM_RECOMMENDER_PROMPTS` |
| `partnership.js` | Partnership strategies | `PARTNERSHIP_PROMPTS` |
| `caseStudy.js` | Case study generation | `CASE_STUDY_PROMPTS` |
| `reprioritizer.js` | Priority rebalancing | `REPRIORITIZER_PROMPTS` |
| `strategyGeneration.js` | Full strategy generation | `STRATEGY_GENERATION_PROMPTS` |

---

## File Pattern

Each prompt module follows a consistent structure:

```javascript
/**
 * Module Name
 * @module category/moduleName
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

---

## Usage Examples

### Basic Usage

```javascript
import { 
  buildChallengeAnalysisPrompt, 
  CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  CHALLENGE_ANALYSIS_SCHEMA 
} from '@/lib/ai/prompts/challenges';

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

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| System Prompt | `UPPER_SNAKE_CASE` | `CHALLENGE_ANALYSIS_SYSTEM_PROMPT` |
| Prompt Builder | `buildXxxPrompt` | `buildChallengeAnalysisPrompt` |
| Schema | `XXX_SCHEMA` | `CHALLENGE_ANALYSIS_SCHEMA` |
| Config Object | `XXX_PROMPTS` | `CHALLENGE_ANALYSIS_PROMPTS` |
| Module File | `camelCase.js` | `challengeAnalysis.js` |

---

## Best Practices

1. **Keep prompts focused** - One prompt = one task
2. **Use structured output** - Always define JSON schemas
3. **Include Saudi context** - Use `getSystemPrompt()` for Saudi-specific context
4. **Support bilingual** - Always generate EN + AR content
5. **Document parameters** - Use JSDoc `@param` tags

---

## Related Documentation

- [Edge Functions Documentation](./EDGE_FUNCTIONS_DOCUMENTATION.md)
- [AI Integration Guide](./AI_INTEGRATION.md)
- [Saudi Context System](../src/lib/saudiContext.js)

---

*Last Updated: December 18, 2024*
