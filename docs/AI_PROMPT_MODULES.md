# AI Prompt Modules System

> Centralized, maintainable AI prompt architecture for the Innovation Ecosystem Platform

## Overview

The AI Prompt Modules System provides a structured approach to managing AI prompts across the platform. All prompts are centralized in `src/lib/ai/prompts/` with consistent patterns for easy maintenance, testing, and reuse.

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Prompt Modules | 126 |
| Total Prompts | ~404 |
| Categories | 16 |
| Inline Prompts Remaining | 0 |

## Architecture

```
src/lib/ai/prompts/
├── index.js                    # Main entry point & registry
├── core/                       # Core platform prompts
│   ├── index.js
│   ├── capacityPredictor.js
│   ├── peerComparison.js
│   ├── exemptionSuggester.js
│   ├── formAssistant.js
│   ├── rdToPilot.js
│   ├── successPredictor.js
│   ├── proposalBrief.js
│   ├── crossEntity.js
│   ├── platformInsights.js
│   └── workPrioritizer.js
├── challenges/                 # Challenge management
├── solutions/                  # Solution prompts
├── pilots/                     # Pilot project prompts
├── programs/                   # Program management
├── strategy/                   # Strategic planning
├── policy/                     # Policy analysis
├── events/                     # Event management
├── executive/                  # Executive dashboards
├── portfolio/                  # Portfolio management
├── profiles/                   # User profiles
├── onboarding/                 # User onboarding
├── forms/                      # Form assistance
├── evaluation/                 # Evaluation prompts
├── quality/                    # Quality assurance
├── analytics/                  # Analytics prompts
└── rd/                         # R&D management
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

### Solution Modules (`solutions/`)
Solution discovery and matching prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `solutionAnalysis` | 2 | Solution viability analysis |
| `solutionMatching` | 3 | Challenge-solution matching |
| `solutionScoring` | 2 | Solution ranking |

### Pilot Modules (`pilots/`)
Pilot project management prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `pilotDesign` | 3 | Pilot design assistance |
| `pilotEvaluation` | 2 | Pilot outcome evaluation |
| `pilotScaling` | 2 | Scale-up recommendations |
| `pilotRisks` | 1 | Risk assessment |

### Program Modules (`programs/`)
Program management and impact tracking.

| Module | Prompts | Description |
|--------|---------|-------------|
| `impactStory` | 1 | Narrative impact stories |
| `impactCalculator` | 1 | Quantified impact metrics |
| `curriculumGenerator` | 1 | Training curriculum |
| `successPredictor` | 1 | Program success prediction |
| `crossProgramSynergy` | 1 | Cross-program opportunities |
| `programDesign` | 1 | Program structure design |
| `programWorkflows` | 1 | Workflow automation |
| `lessonsToStrategy` | 1 | Lessons learned synthesis |
| `applicationScreening` | 1 | Application review |

### Strategy Modules (`strategy/`)
Strategic planning and analysis.

| Module | Prompts | Description |
|--------|---------|-------------|
| `wizardPrompts` | 9 | Strategy creation wizard |
| `strategyAnalysis` | 3 | Strategic analysis |
| `strategyAlignment` | 2 | Goal alignment |

### Policy Modules (`policy/`)
Policy analysis and recommendations.

| Module | Prompts | Description |
|--------|---------|-------------|
| `executiveSummary` | 1 | Policy summaries |
| `conflictDetector` | 1 | Policy conflict detection |

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

### Portfolio Modules (`portfolio/`)
Portfolio health and optimization.

| Module | Prompts | Description |
|--------|---------|-------------|
| `portfolioHealth` | 1 | Portfolio health analysis |
| `portfolioOptimizer` | 1 | Optimization recommendations |
| `collaborationSuggester` | 1 | Collaboration opportunities |

### Profile Modules (`profiles/`)
User profile management.

| Module | Prompts | Description |
|--------|---------|-------------|
| `profileCompletion` | 1 | Profile completion suggestions |
| `expertFinder` | 1 | Expert matching |
| `credentialVerification` | 1 | Credential verification |
| `connections` | 1 | Connection recommendations |

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

### Quality Modules (`quality/`)
Quality assurance prompts.

| Module | Prompts | Description |
|--------|---------|-------------|
| `assurance` | 3 | Quality checks |

## File Pattern

Each prompt module follows a consistent structure:

```javascript
/**
 * Module Name
 * @module category/moduleName
 * @version 1.0.0
 */

/**
 * System prompt for the AI model
 */
export const MODULE_NAME_SYSTEM_PROMPT = `
You are an AI assistant specialized in...
`;

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
 * Zod schema for structured output
 */
export const moduleNameSchema = z.object({
  result: z.string(),
  confidence: z.number(),
  recommendations: z.array(z.string())
});
```

## Usage Examples

### Basic Usage

```javascript
import { 
  buildChallengeAnalysisPrompt, 
  CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  challengeAnalysisSchema 
} from '@/lib/ai/prompts/challenges';

// In an edge function or component
const systemPrompt = CHALLENGE_ANALYSIS_SYSTEM_PROMPT;
const userPrompt = buildChallengeAnalysisPrompt({
  challenge: challengeData,
  context: additionalContext
});

// Call AI with structured output
const result = await callAI({
  system: systemPrompt,
  prompt: userPrompt,
  schema: challengeAnalysisSchema
});
```

### With Edge Function

```javascript
// supabase/functions/analyze-challenge/index.ts
import { buildChallengeAnalysisPrompt } from '../_shared/prompts/challenges';

serve(async (req) => {
  const { challenge } = await req.json();
  
  const prompt = buildChallengeAnalysisPrompt({ challenge });
  
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
        { role: 'user', content: prompt }
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
| Schema | `xxxSchema` | `challengeAnalysisSchema` |
| Module File | `camelCase.js` | `challengeAnalysis.js` |

### Best Practices

1. **Keep prompts focused** - One prompt = one task
2. **Use structured output** - Always define Zod schemas
3. **Include examples** - Add few-shot examples in system prompts
4. **Version control** - Use `@version` JSDoc tags
5. **Test edge cases** - Handle missing/null data gracefully
6. **Document parameters** - Use JSDoc `@param` tags

## Migrating Inline Prompts

If you find an inline prompt in a component:

1. Identify the prompt's purpose
2. Create a new module or add to existing one
3. Extract the prompt text to a constant
4. Create a builder function for dynamic parts
5. Import and use the module in the component
6. Update the category's `index.js`

### Before (Inline)

```javascript
// Component.jsx
const prompt = `Analyze this challenge: ${challenge.title}...`;
```

### After (Module)

```javascript
// prompts/challenges/analysis.js
export function buildAnalysisPrompt({ challenge }) {
  return `Analyze this challenge: ${challenge.title}...`;
}

// Component.jsx
import { buildAnalysisPrompt } from '@/lib/ai/prompts/challenges';
const prompt = buildAnalysisPrompt({ challenge });
```

## Related Documentation

- [Edge Functions Documentation](./EDGE_FUNCTIONS_DOCUMENTATION.md)
- [AI Integration Guide](./AI_INTEGRATION.md)
- [API Reference](./API_REFERENCE.md)

---

*Last Updated: December 2024*
*Migration Status: 100% Complete*
