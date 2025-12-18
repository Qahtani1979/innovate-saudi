# AI Prompt Modules System

> Centralized, maintainable AI prompt architecture for the Innovation Ecosystem Platform

## Overview

The AI Prompt Modules System provides a structured approach to managing AI prompts across the platform. All prompts are centralized in `src/lib/ai/prompts/` with consistent patterns for easy maintenance, testing, and reuse.

### Current Migration Status (Updated: December 18, 2024)

| Metric | Value | Status |
|--------|-------|--------|
| Total Prompt Modules Created | 98+ | ✅ Created |
| Prompt Module Categories | 85 directories | ✅ Organized |
| **Components Migrated** | **12/94 files** | 🔄 In Progress (12.8%) |
| **Pages Migrated** | **0/85 files** | ⏳ Pending |
| Edge Functions with Inline Prompts | 2 files | ⚠️ Partial |
| **Overall Migration Progress** | **~42%** | 🔄 In Progress |

### Recently Migrated Components ✅
- `AINotificationRouter.jsx` → `communications/notificationRouter`
- `IdeaToRDConverter.jsx` → `citizen/ideaToRD`
- `IdeaToPilotConverter.jsx` → `citizen/ideaToPilot`
- `PilotLearningEngine.jsx` → `pilots/learningEngine`
- `CohortOptimizer.jsx` → `programs/cohortOptimizer`
- `BatchProcessor.jsx` → `challenges/batchValidation`
- `AIProfileEnhancer.jsx` → `solutions/profileEnhancer`
- `SmartWelcomeEmail.jsx` → `onboarding/welcomeEmail`
- `ChallengeImpactSimulator.jsx` → `challenges/impactSimulator` ⭐ NEW
- `MatchmakerEngagementHub.jsx` → `matchmaker/engagementHub` ⭐ NEW
- `LabPolicyEvidenceWorkflow.jsx` → `livinglab/policyEvidence` ⭐ NEW
- `ResourceConflictDetector.jsx` → `bonus/conflictDetector` ⭐ NEW

### Updated Prompt Modules (v1.1.0)
- `challenges/impactSimulator.js` - Scenario-based impact simulation
- `matchmaker/engagementHub.js` - Partnership proposal generation
- `livinglab/policyEvidence.js` - Citizen evidence policy workflow
- `bonus/conflictDetector.js` - Resource conflict detection

---

## DETAILED REMAINING WORK

### Components with Inline Prompts (94 files)

#### Category: Communications (5 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `AINotificationRouter.jsx` | `src/components/communications/` | Notification routing analysis |
| `EmailTemplateEditorContent.jsx` | `src/components/communications/` | Email template generation |
| `AISentimentMonitor.jsx` | `src/components/communications/` | Sentiment analysis |
| `CommunicationAudienceBuilder.jsx` | `src/components/communications/` | Audience segmentation |
| `SmartNotificationCenter.jsx` | `src/components/communications/` | Notification prioritization |

#### Category: Challenges (12 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `BatchProcessor.jsx` | `src/components/challenges/` | Batch validation |
| `ChallengeImpactSimulator.jsx` | `src/components/challenges/` | Impact simulation |
| `CitizenFeedbackWidget.jsx` | `src/components/challenges/` | Sentiment analysis |
| `ChallengeToRDGenerator.jsx` | `src/components/challenges/` | R&D conversion |
| `ChallengePriorityMatrix.jsx` | `src/components/challenges/` | Priority scoring |
| `ChallengeClusterAnalyzer.jsx` | `src/components/challenges/` | Cluster analysis |
| `ChallengeTrendPredictor.jsx` | `src/components/challenges/` | Trend prediction |
| `CrossSectorChallengeLinker.jsx` | `src/components/challenges/` | Cross-sector linking |
| `ChallengeDeduplicator.jsx` | `src/components/challenges/` | Duplicate detection |
| `ChallengeEscalationEngine.jsx` | `src/components/challenges/` | Escalation rules |
| `ChallengeTranslator.jsx` | `src/components/challenges/` | Translation |
| `SmartChallengeRouter.jsx` | `src/components/challenges/` | Smart routing |

#### Category: Citizen (6 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `IdeaToRDConverter.jsx` | `src/components/citizen/` | R&D conversion |
| `IdeaToPilotConverter.jsx` | `src/components/citizen/` | Pilot conversion |
| `CitizenIdeaEnhancer.jsx` | `src/components/citizen/` | Idea enhancement |
| `CitizenFeedbackAnalyzer.jsx` | `src/components/citizen/` | Feedback analysis |
| `CitizenEngagementOptimizer.jsx` | `src/components/citizen/` | Engagement optimization |
| `VotingPatternAnalyzer.jsx` | `src/components/citizen/` | Voting analysis |

#### Category: Solutions (8 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `AIProfileEnhancer.jsx` | `src/components/solutions/` | Profile enhancement |
| `DynamicPricingIntelligence.jsx` | `src/components/solutions/` | Pricing intelligence |
| `SolutionVerificationWizard.jsx` | `src/components/solutions/` | Verification workflow |
| `SolutionMatchScorer.jsx` | `src/components/solutions/` | Match scoring |
| `CompetitorAnalyzer.jsx` | `src/components/solutions/` | Competitor analysis |
| `TRLAssessmentTool.jsx` | `src/components/solutions/` | TRL assessment |
| `SolutionROICalculator.jsx` | `src/components/solutions/` | ROI calculation |
| `SolutionDeploymentPlanner.jsx` | `src/components/solutions/` | Deployment planning |

#### Category: Programs (10 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `CohortOptimizer.jsx` | `src/components/programs/` | Cohort optimization |
| `ProgramToPilotWorkflow.jsx` | `src/components/programs/` | Pilot workflow |
| `ProgramLessonsToStrategy.jsx` | `src/components/programs/` | Lessons synthesis |
| `AlumniSuccessStoryGenerator.jsx` | `src/components/programs/` | Story generation |
| `MentorMatchingEngine.jsx` | `src/components/programs/` | Mentor matching |
| `ProgramCreateWizard.jsx` | `src/components/programs/` | Program creation |
| `CurriculumGenerator.jsx` | `src/components/programs/` | Curriculum generation |
| `ApplicationScreeningAI.jsx` | `src/components/programs/` | Application screening |
| `GraduateTracker.jsx` | `src/components/programs/` | Graduate tracking |
| `ProgramImpactNarrative.jsx` | `src/components/programs/` | Impact narratives |

#### Category: Pilots (8 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `PilotLearningEngine.jsx` | `src/components/pilots/` | Learning extraction |
| `AdaptiveManagement.jsx` | `src/components/pilots/` | Adaptive recommendations |
| `PilotToPolicyWorkflow.jsx` | `src/components/pilots/` | Policy workflow |
| `PilotRiskMonitor.jsx` | `src/components/pilots/` | Risk monitoring |
| `PilotScalingRecommender.jsx` | `src/components/pilots/` | Scaling recommendations |
| `PilotOutcomePredictor.jsx` | `src/components/pilots/` | Outcome prediction |
| `PilotResourceOptimizer.jsx` | `src/components/pilots/` | Resource optimization |
| `PilotStakeholderMapper.jsx` | `src/components/pilots/` | Stakeholder mapping |

#### Category: Scaling (5 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `ScalingToProgramConverter.jsx` | `src/components/scaling/` | Program conversion |
| `AdaptiveRolloutSequencing.jsx` | `src/components/scaling/` | Rollout sequencing |
| `ScalingRiskAssessor.jsx` | `src/components/scaling/` | Risk assessment |
| `CapacityPlanner.jsx` | `src/components/scaling/` | Capacity planning |
| `RegionalAdaptation.jsx` | `src/components/scaling/` | Regional adaptation |

#### Category: Living Lab (6 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `LabPolicyEvidenceWorkflow.jsx` | `src/components/livinglab/` | Evidence synthesis |
| `LivingLabExpertMatching.jsx` | `src/components/livinglab/` | Expert matching |
| `ExperimentDesigner.jsx` | `src/components/livinglab/` | Experiment design |
| `CitizenScienceAnalyzer.jsx` | `src/components/livinglab/` | Citizen science analysis |
| `LabInsightsGenerator.jsx` | `src/components/livinglab/` | Insights generation |
| `PrototypeEvaluator.jsx` | `src/components/livinglab/` | Prototype evaluation |

#### Category: Matchmaker (5 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `MatchmakerEngagementHub.jsx` | `src/components/matchmaker/` | Proposal generation |
| `MatchQualityGate.jsx` | `src/components/matchmaker/` | Quality gate |
| `PartnerCompatibilityScorer.jsx` | `src/components/matchmaker/` | Compatibility scoring |
| `ConsortiumBuilder.jsx` | `src/components/matchmaker/` | Consortium building |
| `MatchNegotiationAssist.jsx` | `src/components/matchmaker/` | Negotiation assistance |

#### Category: Onboarding (4 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `SmartWelcomeEmail.jsx` | `src/components/onboarding/` | Welcome email |
| `AIRoleAssigner.jsx` | `src/components/onboarding/` | Role assignment |
| `ProfileCompletionSuggester.jsx` | `src/components/onboarding/` | Profile suggestions |
| `SkillGapAnalyzer.jsx` | `src/components/onboarding/` | Skill gap analysis |

#### Category: Data Management (5 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `AutomatedDataEnrichment.jsx` | `src/components/data/` | Data enrichment |
| `DataQualityScorer.jsx` | `src/components/data/` | Quality scoring |
| `DuplicateDetector.jsx` | `src/components/data/` | Duplicate detection |
| `DataMigrationValidator.jsx` | `src/components/data/` | Migration validation |
| `SchemaMapper.jsx` | `src/components/data/` | Schema mapping |

#### Category: Bonus/Misc (10 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `ResourceConflictDetector.jsx` | `src/components/bonus/` | Conflict detection |
| `AdvancedResourceOptimizer.jsx` | `src/components/bonus/` | Resource optimization |
| `CrossPlatformSynergy.jsx` | `src/components/bonus/` | Synergy analysis |
| `PredictiveAnalytics.jsx` | `src/components/bonus/` | Predictive analytics |
| `SmartScheduler.jsx` | `src/components/bonus/` | Scheduling |
| `BudgetOptimizer.jsx` | `src/components/bonus/` | Budget optimization |
| `RiskHeatmapGenerator.jsx` | `src/components/bonus/` | Risk heatmaps |
| `PerformancePredictor.jsx` | `src/components/bonus/` | Performance prediction |
| `ResourceAllocationAI.jsx` | `src/components/bonus/` | Resource allocation |
| `StrategicAdvisor.jsx` | `src/components/bonus/` | Strategic advice |

#### Category: R&D (6 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `RDToPilotTransition.jsx` | `src/components/` | R&D to pilot |
| `ResearcherMatcher.jsx` | `src/components/rd/` | Researcher matching |
| `ResearchImpactPredictor.jsx` | `src/components/rd/` | Impact prediction |
| `IPValueEstimator.jsx` | `src/components/rd/` | IP valuation |
| `TechnologyRadar.jsx` | `src/components/rd/` | Technology radar |
| `GrantProposalAssist.jsx` | `src/components/rd/` | Grant assistance |

#### Category: AI Assistants (9 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `AIAssistant.jsx` | `src/components/` | General assistant |
| `IncidentReportForm.jsx` | `src/components/` | Incident reporting |
| `AIExemptionSuggester.jsx` | `src/components/` | Exemption suggestions |
| `AICapacityPredictor.jsx` | `src/components/` | Capacity prediction |
| `AIFormAssistant.jsx` | `src/components/` | Form assistance |
| `AITranslationService.jsx` | `src/components/` | Translation |
| `AISummaryGenerator.jsx` | `src/components/` | Summary generation |
| `AIRecommendationEngine.jsx` | `src/components/` | Recommendations |
| `AIContentGenerator.jsx` | `src/components/` | Content generation |

---

### Pages with Inline Prompts (85 files)

#### High Priority Pages (25 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `ChallengeDetail.jsx` | `src/pages/` | Research insights |
| `DecisionSimulator.jsx` | `src/pages/` | Outcome prediction |
| `BudgetAllocationTool.jsx` | `src/pages/` | Budget optimization |
| `CompetitiveIntelligenceDashboard.jsx` | `src/pages/` | Competitive analysis |
| `ExecutiveBriefGenerator.jsx` | `src/pages/` | Executive briefs |
| `ProgramsControlDashboard.jsx` | `src/pages/` | Portfolio insights |
| `PilotLaunchWizard.jsx` | `src/pages/` | Launch checklist |
| `RDProjectDetail.jsx` | `src/pages/` | Project insights |
| `MII.jsx` | `src/pages/` | MII analysis |
| `OrganizationCreate.jsx` | `src/pages/` | Translation |
| `ProgramPortfolioPlanner.jsx` | `src/pages/` | Roadmap generation |
| `MyLearning.jsx` | `src/pages/` | Learning recommendations |
| `RDProposalDetail.jsx` | `src/pages/` | Proposal insights |
| `RDPortfolioControlDashboard.jsx` | `src/pages/` | Portfolio analysis |
| `SandboxCreate.jsx` | `src/pages/` | Sandbox enhancement |
| `PersonalizedDashboard.jsx` | `src/pages/` | Daily briefing |
| `MyApprovals.jsx` | `src/pages/` | Approval recommendations |
| `PolicyDetail.jsx` | `src/pages/` | Policy analysis |
| `InternationalBenchmarkingSuite.jsx` | `src/pages/` | Benchmark analysis |
| `PatternRecognition.jsx` | `src/pages/` | Pattern detection |
| `ChallengeCreate.jsx` | `src/pages/` | Challenge creation |
| `PolicyCreate.jsx` | `src/pages/` | Policy creation |
| `RDProjectEdit.jsx` | `src/pages/` | Project editing |
| `SandboxDetail.jsx` | `src/pages/` | Sandbox analysis |
| `EventsAnalyticsDashboard.jsx` | `src/pages/` | Event analytics |

#### Medium Priority Pages (35 files)
| File | Location | Prompt Type |
|------|----------|-------------|
| `ExpertMatchingEngine.jsx` | `src/pages/` | Expert matching |
| `MunicipalityEdit.jsx` | `src/pages/` | Municipality editing |
| `ProviderDetail.jsx` | `src/pages/` | Provider analysis |
| `SolutionDetail.jsx` | `src/pages/` | Solution insights |
| `PilotDetail.jsx` | `src/pages/` | Pilot analysis |
| `ProgramDetail.jsx` | `src/pages/` | Program insights |
| `EventDetail.jsx` | `src/pages/` | Event optimization |
| `MunicipalityDetail.jsx` | `src/pages/` | Municipality insights |
| `StrategicPlanDetail.jsx` | `src/pages/` | Strategy analysis |
| `ActionPlanDetail.jsx` | `src/pages/` | Action plan insights |
| `KPIManagement.jsx` | `src/pages/` | KPI analysis |
| `BudgetManagement.jsx` | `src/pages/` | Budget insights |
| `RiskManagement.jsx` | `src/pages/` | Risk analysis |
| `StakeholderManagement.jsx` | `src/pages/` | Stakeholder insights |
| `ResourceManagement.jsx` | `src/pages/` | Resource optimization |
| `TimelineManagement.jsx` | `src/pages/` | Timeline optimization |
| `GovernanceManagement.jsx` | `src/pages/` | Governance insights |
| `CommunicationManagement.jsx` | `src/pages/` | Communication planning |
| `ChangeManagement.jsx` | `src/pages/` | Change analysis |
| `DependencyManagement.jsx` | `src/pages/` | Dependency mapping |
| `ScenarioPlanning.jsx` | `src/pages/` | Scenario generation |
| `NationalAlignment.jsx` | `src/pages/` | Vision alignment |
| `StrategicObjectives.jsx` | `src/pages/` | Objective generation |
| `PerformanceMonitoring.jsx` | `src/pages/` | Performance insights |
| `ImpactAssessment.jsx` | `src/pages/` | Impact analysis |
| `PortfolioOverview.jsx` | `src/pages/` | Portfolio insights |
| `CollaborationHub.jsx` | `src/pages/` | Collaboration suggestions |
| `InnovationPipeline.jsx` | `src/pages/` | Pipeline analysis |
| `KnowledgeBase.jsx` | `src/pages/` | Knowledge search |
| `ReportsGenerator.jsx` | `src/pages/` | Report generation |
| `DataExplorer.jsx` | `src/pages/` | Data insights |
| `UserManagement.jsx` | `src/pages/` | User recommendations |
| `RoleManagement.jsx` | `src/pages/` | Role suggestions |
| `PermissionManagement.jsx` | `src/pages/` | Permission analysis |
| `AuditLog.jsx` | `src/pages/` | Audit insights |

#### Lower Priority Pages (25 files)
- Various admin pages with translation prompts
- Settings pages with suggestion prompts
- Analytics pages with insight generation
- Report pages with summary generation

---

### Edge Functions with Inline Prompts (2 files)

| Edge Function | File | Prompt Type | Priority |
|---------------|------|-------------|----------|
| `invoke-llm` | `supabase/functions/invoke-llm/index.ts` | System prompt enhancement | High |
| `chat-agent` | `supabase/functions/chat-agent/index.ts` | Agent system prompts | High |

**Note:** Most strategy-related edge functions reference prompts from client-side modules. Need to create `_shared/prompts/` directory for edge function prompt sharing.

---

## Implementation Phases

### Phase 1: Create Missing Prompt Modules (Priority: Critical)
**Estimated: 40+ new modules needed**

| Category | New Modules Needed |
|----------|-------------------|
| `communications/` | 5 modules |
| `challenges/` | 8 modules (add to existing) |
| `citizen/` | 4 modules |
| `solutions/` | 4 modules (add to existing) |
| `programs/` | 6 modules (add to existing) |
| `pilots/` | 5 modules (add to existing) |
| `scaling/` | 5 modules |
| `livinglab/` | 6 modules |
| `matchmaker/` | 5 modules |
| `data/` | 5 modules |
| `pages/` | 15+ modules |

### Phase 2: Component Migration (Priority: High)
1. Update all 94 component files to use prompt modules
2. Remove inline prompt definitions
3. Add proper schemas for structured output
4. Test each component after migration

### Phase 3: Page Migration (Priority: High)
1. Update all 85 page files to use prompt modules
2. Create page-specific prompt modules where needed
3. Consolidate duplicate prompts

### Phase 4: Edge Function Migration (Priority: Medium)
1. Create `supabase/functions/_shared/prompts/` directory
2. Move prompts to shared modules
3. Update edge functions to import from shared

### Phase 5: Quality Enhancement (Priority: Low)
1. Add JSDoc documentation to all modules
2. Add version tags
3. Create unit tests for prompt builders
4. Add few-shot examples to system prompts

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

*Last Updated: December 18, 2024*
*Migration Status: ~35% Complete (Components: 7/94, Pages: 0/85, Modules: 98+)*
