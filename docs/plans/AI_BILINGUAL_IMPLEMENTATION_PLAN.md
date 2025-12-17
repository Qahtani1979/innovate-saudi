# AI Bilingual Implementation Plan - Standardization Strategy

**Generated:** 2025-12-17  
**Last Updated:** 2025-12-17  
**Status:** IN PROGRESS (21% Complete)  
**Goal:** Extend Strategy Wizard's proven AI pattern to entire platform

---

## 📊 IMPLEMENTATION STATUS SUMMARY

| Metric | Value | Progress |
|--------|-------|----------|
| **Total AI Components** | 248 | - |
| **Refactored Components** | 53 | 21% |
| **Pending Components** | 195 | 79% |
| **Prompt Modules Created** | 15 | - |
| **Prompt Files Created** | 80 | - |

---

## Current State Analysis

### ✅ EXISTING INFRASTRUCTURE (Do NOT Rebuild)

| Component | Location | Status |
|-----------|----------|--------|
| Base AI Hook | `src/hooks/useAIWithFallback.js` | ✅ Complete |
| Saudi Context | `src/lib/saudiContext.js` | ✅ Complete |
| Bilingual Schema Builder | `src/lib/ai/bilingualSchemaBuilder.js` | ✅ Complete |
| AI Status Display | `src/components/ai/AIStatusIndicator.jsx` | ✅ Complete |
| Strategy Wizard Prompts | `src/components/strategy/wizard/prompts/` (24 files) | ✅ Complete |
| Centralized Prompts | `src/lib/ai/prompts/` (15 modules) | ✅ Complete |
| Specialized Edge Functions | 16 strategy-* functions | ✅ Complete |

### ✅ COMPLETED PROMPT MODULES (15/15)

| Module | Location | Files | Components |
|--------|----------|-------|------------|
| Foundation | `src/lib/ai/prompts/` | 6 | N/A (utilities) |
| Strategy Wizard | `src/lib/ai/prompts/strategy/` | 6 | 6 |
| Portfolio | `src/lib/ai/prompts/portfolio/` | 3 | 3 |
| Events | `src/lib/ai/prompts/events/` | 3 | 3 |
| Challenges | `src/lib/ai/prompts/challenges/` | 5 | 5 |
| Pilots | `src/lib/ai/prompts/pilots/` | 4 | 4 |
| Matchmaker | `src/lib/ai/prompts/matchmaker/` | 4 | 4 |
| Sandbox | `src/lib/ai/prompts/sandbox/` | 3 | 3 |
| R&D | `src/lib/ai/prompts/rd/` | 4 | 4 |
| Scaling | `src/lib/ai/prompts/scaling/` | 3 | 3 |
| Solution | `src/lib/ai/prompts/solution/` | 5 | 5 |
| Citizen | `src/lib/ai/prompts/citizen/` | 4 | 4 |
| Living Lab | `src/lib/ai/prompts/livinglab/` | 4 | 4 |
| Profiles | `src/lib/ai/prompts/profiles/` | 3 | 3 |
| Programs | `src/lib/ai/prompts/programs/` | 3 | 3 |

### ✅ REFACTORED COMPONENTS (53 Files)

Components that have been successfully refactored to use centralized prompts:

#### Portfolio Module (3 files)
- `src/components/portfolio/PilotPortfolioOptimizer.jsx` ✅
- `src/components/portfolio/StrategicGapAnalyzer.jsx` ✅
- `src/components/portfolio/WhatIfScenarioModeler.jsx` ✅

#### Events Module (3 files)
- `src/components/events/EventProgramGenerator.jsx` ✅
- `src/components/events/SpeakerRecommendationEngine.jsx` ✅
- `src/components/events/EventImpactPredictor.jsx` ✅

#### Challenges Module (5 files)
- `src/components/challenges/AIChallengeIntakeWizard.jsx` ✅
- `src/components/challenges/InnovationFramingGenerator.jsx` ✅
- `src/components/challenges/AIScoringSuggester.jsx` ✅
- `src/components/challenges/ChallengeSimilarityDetector.jsx` ✅
- `src/components/challenges/CrossChallengeAnalytics.jsx` ✅

#### Pilots Module (4 files)
- `src/components/pilots/ScalingReadiness.jsx` ✅
- `src/components/pilots/PilotSuccessPredictor.jsx` ✅
- `src/components/pilots/MilestoneAIGenerator.jsx` ✅
- `src/components/pilots/PilotRiskAssessment.jsx` ✅

#### Matchmaker Module (4 files)
- `src/components/matchmaker/MultiPartyMatchmaker.jsx` ✅
- `src/components/matchmaker/EnhancedMatchingEngine.jsx` ✅
- `src/components/matchmaker/MatchScoreExplainer.jsx` ✅
- `src/components/matchmaker/StrategicPartnershipAdvisor.jsx` ✅

#### Sandbox Module (3 files)
- `src/components/sandbox/SandboxCreateWizard.jsx` ✅
- `src/components/sandbox/SandboxExitRecommendation.jsx` ✅
- `src/components/sandbox/RegulatoryGapAnalyzer.jsx` ✅

#### R&D Module (4 files)
- `src/components/rd/AIProposalWriter.jsx` ✅
- `src/components/rd/AIProposalScorer.jsx` ✅
- `src/components/rd/RDImpactProjector.jsx` ✅
- `src/components/rd/ResearcherMatchingEngine.jsx` ✅

#### Scaling Module (3 files)
- `src/components/scaling/RolloutRiskPredictor.jsx` ✅
- `src/components/scaling/ScalingCostEstimator.jsx` ✅
- `src/components/scaling/AdaptiveRolloutPlanner.jsx` ✅

#### Solution Module (5 files)
- `src/components/solutions/SolutionSuccessPredictor.jsx` ✅
- `src/components/solutions/AIPricingSuggester.jsx` ✅
- `src/components/solutions/CompetitorAnalyzer.jsx` ✅
- `src/components/solutions/SolutionEnhancementEngine.jsx` ✅
- `src/components/solutions/MarketFitAnalyzer.jsx` ✅

#### Citizen Module (4 files)
- `src/components/citizen/ContentModerationAI.jsx` ✅
- `src/components/citizen/PublicFeedbackAggregator.jsx` ✅
- `src/components/citizen/IdeaEnhancementEngine.jsx` ✅
- `src/components/citizen/CitizenSentimentDashboard.jsx` ✅

#### Living Lab Module (4 files)
- `src/components/livinglab/MultiLabCollaborationEngine.jsx` ✅
- `src/components/livinglab/LabToPilotTransition.jsx` ✅
- `src/components/livinglab/LivingLabCreateWizard.jsx` ✅
- `src/components/livinglabs/AICapacityOptimizer.jsx` ✅

#### Profiles Module (3 files)
- `src/components/profiles/ProfileCompletionAI.jsx` ✅
- `src/components/profiles/ExpertFinder.jsx` ✅
- `src/components/profiles/CredentialVerificationAI.jsx` ✅

#### Programs Module (3 files)
- `src/components/programs/ImpactStoryGenerator.jsx` ✅
- `src/components/programs/AICurriculumGenerator.jsx` ✅
- `src/components/programs/AIProgramSuccessPredictor.jsx` ✅

#### AI Core Module (5 files)
- `src/components/ai/AIEventOptimizer.jsx` ✅
- `src/components/ai/AIAnalyticsHelper.jsx` ✅
- `src/components/ai/AIRecommendationEngine.jsx` ✅
- `src/components/ai/AIInsightGenerator.jsx` ✅
- `src/components/ai/AIStatusIndicator.jsx` ✅

---

### ❌ COMPONENTS PENDING REFACTORING (195 Files)

Components still using inline prompts that need to be refactored:

#### Root-Level Components (15 files) - HIGH PRIORITY
| File | Current Issue |
|------|---------------|
| `src/components/AICapacityPredictor.jsx` | Inline prompt, no centralized schema |
| `src/components/AIExemptionSuggester.jsx` | Inline prompt |
| `src/components/AIFormAssistant.jsx` | Inline prompt, complex schema |
| `src/components/AIPeerComparison.jsx` | Inline prompt |
| `src/components/AIPerformanceMonitor.jsx` | Inline prompt |
| `src/components/AISafetyProtocolGenerator.jsx` | Inline prompt |
| `src/components/AISuccessPredictor.jsx` | Inline prompt |
| `src/components/RDToPilotTransition.jsx` | Inline prompt |
| `src/components/RDTRLAdvancement.jsx` | Inline prompt |
| `src/components/LivingLabExpertMatching.jsx` | Inline prompt |
| `src/components/IncidentReportForm.jsx` | Inline prompt |
| `src/components/SemanticSearch.jsx` | Inline prompt |
| `src/components/SmartRecommendation.jsx` | Inline prompt |
| `src/components/CrossEntityRecommender.jsx` | Inline prompt |
| `src/components/DuplicateDetection.jsx` | Inline prompt |

#### Strategy Module (10 files)
| File | Current Issue |
|------|---------------|
| `src/components/strategy/wizard/StrategyWizardWrapper.jsx` | Inline prompts in generateAI function |
| `src/components/strategy/preplanning/StrategyInputCollector.jsx` | Inline prompt |
| `src/components/strategy/preplanning/RiskAssessmentBuilder.jsx` | Inline prompt |
| `src/components/strategy/preplanning/EnvironmentalScanWizard.jsx` | Inline prompt |
| `src/components/strategy/preplanning/StakeholderMappingWizard.jsx` | Inline prompt |
| `src/components/strategy/ActionPlanAIAssistant.jsx` | Inline prompt |
| `src/components/strategy/StrategyAIAdvisor.jsx` | Inline prompt |
| `src/components/strategy/StrategyProgressTracker.jsx` | Inline prompt |
| `src/components/strategy/ObjectiveAIEnhancer.jsx` | Inline prompt |
| `src/components/strategy/KPIRecommendationEngine.jsx` | Inline prompt |

#### Solutions Module - Remaining (8 files)
| File | Current Issue |
|------|---------------|
| `src/components/solutions/SolutionRecommendationEngine.jsx` | Inline prompt |
| `src/components/solutions/RealTimeMarketIntelligence.jsx` | Inline prompt |
| `src/components/solutions/AIProfileEnhancer.jsx` | Inline prompt |
| `src/components/solutions/SolutionMarketIntelligence.jsx` | Inline prompt |
| `src/components/solutions/SolutionCreateWizard.jsx` | Inline prompt |
| `src/components/solutions/SolutionVerificationWizard.jsx` | Inline prompt |
| `src/components/solutions/SolutionCaseStudyWizard.jsx` | Inline prompt |
| `src/components/solutions/SolutionDeploymentTracker.jsx` | Inline prompt |

#### Challenges Module - Remaining (8 files)
| File | Current Issue |
|------|---------------|
| `src/components/challenges/ChallengeRFPGenerator.jsx` | Inline prompt |
| `src/components/challenges/BatchProcessor.jsx` | Inline prompt |
| `src/components/challenges/ChallengeTrackAssignmentDecision.jsx` | Inline prompt |
| `src/components/challenges/KPIBenchmarkData.jsx` | Inline prompt |
| `src/components/challenges/ImpactReportGenerator.jsx` | Inline prompt |
| `src/components/challenges/CrossCityLearning.jsx` | Inline prompt |
| `src/components/challenges/AIRelatedEntities.jsx` | Inline prompt |
| `src/components/challenges/ChallengePrioritizationMatrix.jsx` | Inline prompt |

#### Taxonomy Module (4 files)
| File | Current Issue |
|------|---------------|
| `src/components/taxonomy/TaxonomyWizard.jsx` | Inline prompt, complex schema |
| `src/components/taxonomy/SectorBenchmarkingDashboard.jsx` | Inline prompt |
| `src/components/taxonomy/AITaxonomySuggester.jsx` | Inline prompt |
| `src/components/taxonomy/ServiceMappingAI.jsx` | Inline prompt |

#### MII Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/mii/MIIForecastingEngine.jsx` | Inline prompt |
| `src/components/mii/MIIComponentAnalyzer.jsx` | Inline prompt |
| `src/components/mii/MIIRecommendationEngine.jsx` | Inline prompt |

#### Executive Module (5 files)
| File | Current Issue |
|------|---------------|
| `src/components/executive/AIRiskForecasting.jsx` | Inline prompt |
| `src/components/executive/StrategicBriefingGenerator.jsx` | Inline prompt |
| `src/components/executive/ExecutiveDashboardAI.jsx` | Inline prompt |
| `src/components/executive/DecisionSupportAI.jsx` | Inline prompt |
| `src/components/executive/PolicyImpactAnalyzer.jsx` | Inline prompt |

#### Communications Module (4 files)
| File | Current Issue |
|------|---------------|
| `src/components/communications/CampaignAIHelpers.jsx` | Multiple inline prompts |
| `src/components/communications/EmailContentGenerator.jsx` | Inline prompt |
| `src/components/communications/NotificationTemplateAI.jsx` | Inline prompt |
| `src/components/communications/AnnouncementDraftAI.jsx` | Inline prompt |

#### Collaboration Module (4 files)
| File | Current Issue |
|------|---------------|
| `src/components/collaboration/PartnershipProposalWizard.jsx` | Inline prompt |
| `src/components/collaboration/CollaborationMatchmaker.jsx` | Inline prompt |
| `src/components/collaboration/MeetingAgendaGenerator.jsx` | Inline prompt |
| `src/components/collaboration/ConsensusBuilder.jsx` | Inline prompt |

#### Partnerships Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/partnerships/AIAgreementGenerator.jsx` | Inline prompt |
| `src/components/partnerships/PartnershipEvaluator.jsx` | Inline prompt |
| `src/components/partnerships/MOUDraftingAI.jsx` | Inline prompt |

#### Approval Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/approval/ReviewerAI.jsx` | Inline prompt, complex bilingual |
| `src/components/approval/ApprovalRecommendationAI.jsx` | Inline prompt |
| `src/components/approval/AutoApprovalRulesAI.jsx` | Inline prompt |

#### Bonus Module (2 files)
| File | Current Issue |
|------|---------------|
| `src/components/bonus/SuccessPlaybookGenerator.jsx` | Inline prompt |
| `src/components/bonus/BestPracticeExtractor.jsx` | Inline prompt |

#### Content Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/content/TranslationWorkflow.jsx` | Inline prompt |
| `src/components/content/ContentEnhancerAI.jsx` | Inline prompt |
| `src/components/content/SEOOptimizer.jsx` | Inline prompt |

#### Translation Module (2 files)
| File | Current Issue |
|------|---------------|
| `src/components/translation/AutoTranslator.jsx` | Inline prompt |
| `src/components/translation/BatchTranslator.jsx` | Inline prompt |

#### Data Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/data/AutomatedDataEnrichment.jsx` | Inline prompt |
| `src/components/data/DataQualityAnalyzer.jsx` | Inline prompt |
| `src/components/data/DataClassificationAI.jsx` | Inline prompt |

#### AI Uploader Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/ai-uploader/steps/StepEntityDetection.jsx` | Inline prompt |
| `src/components/ai-uploader/steps/StepDataMapping.jsx` | Inline prompt |
| `src/components/ai-uploader/steps/StepValidation.jsx` | Inline prompt |

#### Living Lab Module - Remaining (4 files)
| File | Current Issue |
|------|---------------|
| `src/components/livinglab/LabToPilotTransitionWizard.jsx` | Inline prompt |
| `src/components/livinglab/ResearchImpactAnalyzer.jsx` | Inline prompt |
| `src/components/livinglab/EquipmentOptimizer.jsx` | Inline prompt |
| `src/components/livinglab/CollaborationFinder.jsx` | Inline prompt |

#### Matchmaker Module - Remaining (4 files)
| File | Current Issue |
|------|---------------|
| `src/components/matchmaker/AutomatedMatchNotifier.jsx` | Inline prompt |
| `src/components/matchmaker/ProposalGeneratorDialog.jsx` | Inline prompt |
| `src/components/matchmaker/MatchFeedbackAnalyzer.jsx` | Inline prompt |
| `src/components/matchmaker/ProviderCapabilityScorer.jsx` | Inline prompt |

#### Programs Module - Remaining (6 files)
| File | Current Issue |
|------|---------------|
| `src/components/programs/AIDropoutPredictor.jsx` | Mock analysis, needs real AI |
| `src/components/programs/CrossProgramSynergy.jsx` | Inline prompt |
| `src/components/programs/MentorMatchingEngine.jsx` | Inline prompt |
| `src/components/programs/AlumniSuccessStoryGenerator.jsx` | Inline prompt |
| `src/components/programs/AIAlumniSuggester.jsx` | Inline prompt |
| `src/components/programs/AICohortOptimizerWidget.jsx` | Inline prompt |
| `src/components/programs/ProgramToPilotWorkflow.jsx` | Inline prompt |

#### Workflows Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/workflows/AIWorkflowOptimizer.jsx` | Inline prompt |
| `src/components/workflows/WorkflowAutomationAI.jsx` | Inline prompt |
| `src/components/workflows/ProcessMiningAI.jsx` | Inline prompt |

#### Reports Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/reports/ReportGeneratorAI.jsx` | Inline prompt |
| `src/components/reports/InsightExtractor.jsx` | Inline prompt |
| `src/components/reports/ExecutiveSummaryAI.jsx` | Inline prompt |

#### Analytics Module (4 files)
| File | Current Issue |
|------|---------------|
| `src/components/analytics/PredictiveAnalyticsEngine.jsx` | Inline prompt |
| `src/components/analytics/AnomalyDetectionAI.jsx` | Inline prompt |
| `src/components/analytics/TrendAnalyzer.jsx` | Inline prompt |
| `src/components/analytics/BenchmarkComparator.jsx` | Inline prompt |

#### Knowledge Module (3 files)
| File | Current Issue |
|------|---------------|
| `src/components/knowledge/KnowledgeGraphBuilder.jsx` | Inline prompt |
| `src/components/knowledge/DocumentSummarizer.jsx` | Inline prompt |
| `src/components/knowledge/FAQGenerator.jsx` | Inline prompt |

#### Other Modules (~70 files)
Additional files in: `evaluation/`, `gates/`, `kpi/`, `monitoring/`, `onboarding/`, `performance/`, `policy/`, `provider/`, `sandboxes/`, `training/`, `voice/`, and other directories.

---

### Problem Pattern (Current State)
```javascript
// ❌ CURRENT: Inline prompt, no Saudi context, no bilingual schema
const result = await invokeAI({
  prompt: `Portfolio optimization analysis...`,  // Inline!
  response_json_schema: {
    properties: {
      accelerate: { type: 'array' },  // Not bilingual!
      portfolio_health_score: { type: 'number' }
    }
  }
});
```

### Target Pattern (Refactored State)
```javascript
// ✅ TARGET: Extracted prompt, Saudi context, bilingual schema
import { getPortfolioOptimizerPrompt, portfolioOptimizerSchema } from '@/lib/ai/prompts/portfolio';
import { getSystemPrompt } from '@/lib/saudiContext';

const result = await invokeAI({
  prompt: getPortfolioOptimizerPrompt(context, pilots, relatedEntities),
  response_json_schema: portfolioOptimizerSchema,
  system_prompt: getSystemPrompt('INNOVATION')
});
```

---

## Remaining Implementation Phases

### Phase 16: Root-Level AI Components (15 files)
**Priority:** HIGH - These are standalone components used across the platform

| Component | New Prompt Location |
|-----------|---------------------|
| `AICapacityPredictor.jsx` | `src/lib/ai/prompts/core/capacityPredictor.js` |
| `AIExemptionSuggester.jsx` | `src/lib/ai/prompts/core/exemptionSuggester.js` |
| `AIFormAssistant.jsx` | `src/lib/ai/prompts/core/formAssistant.js` |
| `AIPeerComparison.jsx` | `src/lib/ai/prompts/core/peerComparison.js` |
| ... (11 more) | |

### Phase 17: Strategy Module (10 files)
| Component | New Prompt Location |
|-----------|---------------------|
| `StrategyWizardWrapper.jsx` | Already has `prompts/` - needs cleanup |
| `StrategyInputCollector.jsx` | `src/lib/ai/prompts/strategy/inputCollector.js` |
| `RiskAssessmentBuilder.jsx` | `src/lib/ai/prompts/strategy/riskAssessment.js` |
| ... (7 more) | |

### Phase 18: Solutions Remaining (8 files)
### Phase 19: Challenges Remaining (8 files)
### Phase 20: Taxonomy & MII (7 files)
### Phase 21: Executive & Communications (9 files)
### Phase 22: Collaboration & Partnerships (7 files)
### Phase 23: Approval & Content (8 files)
### Phase 24: Data & AI Uploader (6 files)
### Phase 25: Programs Remaining (7 files)
### Phase 26: Workflows & Reports (6 files)
### Phase 27: Analytics & Knowledge (7 files)
### Phase 28: Remaining Modules (~70 files)

---

## PREVIOUSLY COMPLETED Implementation Phases

### Phase 1: Extract Shared Saudi Context (Day 1) ✅ COMPLETE

**Task:** Move `SAUDI_CONTEXT` from `useWizardAI.js` to shared location.

```
NEW: src/lib/saudiContext.js
```

```javascript
// src/lib/saudiContext.js
export const SAUDI_CONTEXT = {
  FULL: `MoMAH (Ministry of Municipalities and Housing) oversees...`,
  COMPACT: `MoMAH - Saudi Ministry of Municipalities & Housing...`,
  INNOVATION: `CRITICAL: Include innovation/R&D focus...`,
  HOUSING: `Housing Mandate (Critical Priority)...`,
  MUNICIPAL: `Municipal Operations...`
};

export const injectSaudiContext = (prompt, contextType = 'FULL') => {
  return `${SAUDI_CONTEXT[contextType]}\n\n${prompt}`;
};
```

---

### Phase 2: Portfolio Module (Days 2-3) - 9 Components

| Component | New Prompt File | Key Changes |
|-----------|-----------------|-------------|
| `PilotPortfolioOptimizer.jsx` | `prompts/portfolioOptimizer.js` | Extract inline prompt, add bilingual schema |
| `StrategicGapAnalyzer.jsx` | `prompts/strategicGapAnalyzer.js` | Add `_en`/`_ar` fields |
| `WhatIfScenarioModeler.jsx` | `prompts/whatIfScenario.js` | Inject Saudi context |
| `PortfolioGovernancePanel.jsx` | `prompts/portfolioGovernance.js` | Add related entities |
| `EnhancedPortfolioView.jsx` | `prompts/enhancedPortfolio.js` | Bilingual recommendations |
| `InnovationPipelineFunnel.jsx` | `prompts/innovationPipeline.js` | Sector context |
| `TimelineGanttView.jsx` | `prompts/timelineAnalysis.js` | Milestone localization |
| `ResourceAllocationOptimizer.jsx` | `prompts/resourceAllocation.js` | Budget context |
| `RiskMitigationPlanner.jsx` | `prompts/riskMitigation.js` | Risk taxonomy |

**Directory Structure:**
```
src/components/portfolio/prompts/
├── index.js
├── portfolioOptimizer.js
├── strategicGapAnalyzer.js
├── whatIfScenario.js
└── ... (9 files)
```

---

### Phase 3: Pilot Module (Days 4-6) - 18 Components

| Component | New Prompt File |
|-----------|-----------------|
| `PilotDetailCard.jsx` | `prompts/pilotDetails.js` |
| `PilotKPISetup.jsx` | `prompts/pilotKpis.js` |
| `PilotMilestoneTracker.jsx` | `prompts/pilotMilestones.js` |
| `PilotRiskAssessment.jsx` | `prompts/pilotRisks.js` |
| `PilotTechnologyStack.jsx` | `prompts/pilotTechnology.js` |
| `PilotEvaluationPanel.jsx` | `prompts/pilotEvaluation.js` |
| `PilotScalingReadiness.jsx` | `prompts/pilotScalingReadiness.js` |
| `PilotBenchmarking.jsx` | `prompts/pilotBenchmarking.js` |
| `PolicyWorkflowCard.jsx` | `prompts/policyWorkflow.js` |
| ... (18 total) | |

---

### Phase 4: Matchmaker Module (Days 7-8) - 12 Components

| Component | New Prompt File |
|-----------|-----------------|
| `ProviderPerformanceScorecard.jsx` | `prompts/providerScorecard.js` |
| `AutomatedMatchNotifier.jsx` | `prompts/matchNotification.js` |
| `ProposalGeneratorDialog.jsx` | `prompts/proposalGeneration.js` |
| `PartnershipAgreementPreview.jsx` | `prompts/partnershipAgreement.js` |
| `MultiPartyConsortiumBuilder.jsx` | `prompts/multiPartyConsortium.js` |
| ... (12 total) | |

---

### Phase 5: Sandbox & R&D Modules (Days 9-10) - 14 Components

**Sandbox (7):** `SandboxEnhancement`, `SandboxEvaluation`, `RegulatoryGapAnalyzer`, etc.
**R&D (7):** `ProposalScoring`, `PortfolioPlanning`, `MultiInstitutionCollaboration`, etc.

---

### Phase 6: Remaining Modules (Days 11-14) - 32 Components

- **Challenge:** 6 components
- **Solution:** 6 components  
- **Scaling:** 8 components
- **Citizen:** 8 components
- **Analysis:** 4 components

---

### Phase 7: New AI Features (Days 15-18) - 15 Components

Components currently WITHOUT AI that will GET AI capabilities:

| Component | New AI Feature |
|-----------|----------------|
| `CitizenFeedbackLoop.jsx` | Sentiment analysis |
| `ConsensusScoreDisplay.jsx` | Consensus optimization |
| `FeedbackAggregator.jsx` | Theme extraction |
| `ClassificationDashboard.jsx` | Auto-categorization |
| `TRLAssessmentWorkflow.jsx` | TRL level recommendation |
| `MergeDuplicatesDialog.jsx` | AI merge suggestions |
| ... (15 total) | |

---

## Standard Prompt File Template

```javascript
// src/components/[module]/prompts/[feature].js

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * [Feature Name] AI Prompt
 * @param {Object} context - User/plan context
 * @param {Object} primaryData - Main entity data
 * @param {Object} relatedEntities - Related entity data
 */
export const get[Feature]Prompt = (context, primaryData, relatedEntities = {}) => {
  const { sector, municipality, challenge } = relatedEntities;
  
  return `${SAUDI_CONTEXT.COMPACT}

## CONTEXT
- Entity: ${primaryData.title_en} | ${primaryData.title_ar || ''}
- Sector: ${sector?.name_en || 'General'} | ${sector?.name_ar || ''}
- Municipality: ${municipality?.name_en || 'N/A'}

## DATA
${JSON.stringify(primaryData, null, 2)}

## REQUIREMENTS
Generate bilingual output with _en and _ar suffixes for all text fields.
Arabic must be formal فصحى suitable for government documents.`;
};

export const [feature]Schema = {
  type: 'object',
  properties: {
    recommendation_en: { type: 'string' },
    recommendation_ar: { type: 'string' },
    score: { type: 'number' },
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      }
    }
  }
};
```

---

## Entity Dependencies & Multi-Entity Context

### CRITICAL: Prompts Require Multi-Entity Data

Many AI prompts require data from MULTIPLE entities as input. The prompt files must accept all necessary entity data as parameters.

### Complete Entity Dependency Map

| Prompt File | Primary Entity | Required Related Entities | Fields Used from Each Entity |
|-------------|---------------|---------------------------|------------------------------|
| **sandbox/sandboxEnhancement.js** | `sandbox` | `sector`, `city`, `municipality`, `organization` | sector: name_en/ar, code; city: name_en/ar; municipality: name_en/ar; org: name_en/ar, type |
| **sandbox/sandboxEvaluation.js** | `sandbox` | `sandbox_applications[]`, `sandbox_incidents[]`, `regulatory_exemptions[]` | applications: count, status; incidents: severity; exemptions: regulation, status |
| **pilot/pilotDetails.js** | `pilot` | `challenge`, `solution`, `sector`, `municipality`, `strategic_plan` | challenge: title_en/ar, description, sector; solution: name_en/ar; sector: name_en/ar |
| **pilot/pilotKpis.js** | `pilot` | `challenge`, `sector`, `kpi_references[]` | challenge: kpis (JSON); sector: typical KPIs; kpi_refs: unit, measurement |
| **pilot/pilotMilestones.js** | `pilot` | `challenge`, `solution` | challenge: timeline_estimate; solution: implementation_time |
| **pilot/pilotRisks.js** | `pilot` | `challenge`, `sector`, `municipality` | challenge: constraints; sector: typical risks; municipality: capacity |
| **pilot/pilotTechnology.js** | `pilot` | `solution`, `challenge` | solution: technology_stack, features; challenge: required_technologies |
| **pilot/pilotEvaluation.js** | `pilot` | `pilot_kpis[]`, `pilot_kpi_datapoints[]`, `stakeholder_feedback[]`, `pilot_expenses[]` | kpis: current/target; datapoints: values; feedback: ratings; expenses: amounts |
| **pilot/pilotScalingReadiness.js** | `pilot` | `pilot_kpis[]`, `municipality`, `strategic_plan`, `solution` | kpis: achievement %; municipality: capacity; plan: objectives |
| **pilot/pilotBenchmarking.js** | `pilot` | `pilots[]` (similar), `sector`, `municipality` | other pilots: same sector, KPI achievements |
| **matchmaker/proposalGeneration.js** | `matchmaker_application` | `challenge`, `organization`, `solutions[]`, `provider` | challenge: full details; org: capabilities; solutions: features |
| **matchmaker/partnershipAgreement.js** | `matchmaker_application` | `challenge`, `organization`, `municipality`, `pilot` (new) | all entity titles/names for legal document |
| **matchmaker/multiPartyConsortium.js** | `challenge` | `organizations[]`, `providers[]`, `solutions[]` | challenge: requirements; orgs: capabilities; providers: expertise |
| **matchmaker/strategicChallengeMapping.js** | `challenge` | `strategic_plans[]`, `objectives[]`, `sectors[]` | plans: vision, objectives; sectors: priorities |
| **matchmaker/failedMatchLearning.js** | `challenge_solution_matches[]` | `challenges[]`, `solutions[]`, `organizations[]` | matches: rejection reasons, scores |
| **matchmaker/engagementQuality.js** | `matchmaker_application` | `engagement_history[]`, `challenge`, `organization` | history: meetings, documents, dates |
| **scaling/costBenefitAnalysis.js** | `pilot` | `municipalities[]` (targets), `pilot_kpis[]`, `pilot_expenses[]` | pilot: budget, results; municipalities: population, capacity |
| **scaling/programConversion.js** | `pilot` | `challenge`, `solution`, `pilot_kpis[]`, `stakeholder_feedback[]`, `lessons_learned` | pilot: full evaluation; challenge: sector; kpis: achievements |
| **scaling/adaptiveRollout.js** | `scaling_plan` | `pilot`, `municipalities[]`, `regions[]` | pilot: results; municipalities: readiness scores |
| **challenge/challengeEnhancement.js** | `challenge` | `sector`, `municipality`, `region`, `service` | sector: name_en/ar, description; municipality: name_en/ar; region: name_en/ar |
| **challenge/challengeImpact.js** | `challenge` | `municipality`, `sector`, `related_pilots[]` | challenge: scores, population; municipality: population; pilots: results |
| **challenge/challengeToRD.js** | `challenge` | `strategic_plan`, `sector`, `rd_calls[]` (existing) | challenge: problem, requirements; plan: objectives; sector: priorities |
| **solution/solutionEnhancement.js** | `solution` | `sectors[]`, `organization`, `solution_cases[]` | sectors: names; org: type; cases: results |
| **solution/contractGeneration.js** | `solution` | `challenge`, `organization`, `pilot`, `municipality` | all parties for contract terms |
| **rd/proposalScoring.js** | `rd_proposal` | `rd_call`, `organization`, `researcher_profiles[]` | call: criteria; org: track record; researchers: publications |
| **rd/portfolioPlanning.js** | `rd_projects[]` | `strategic_plans[]`, `sectors[]`, `budgets[]` | projects: status, budget; plans: objectives; budgets: allocation |
| **rd/multiInstitutionCollaboration.js** | `rd_project` | `organizations[]` (research), `researcher_profiles[]`, `living_labs[]` | project: title_en/ar, focus_area, research_areas; orgs: name_en/ar, capabilities; researchers: expertise |
| **citizen/ideaClassification.js** | `citizen_idea` | `sectors[]`, `challenges[]` (similar), `citizen_ideas[]` (history) | idea: content, title, location; sectors: name_en/ar, code; challenges: title_en/ar, category |
| **analysis/roiCalculation.js** | varies | `pilot` OR `program` OR `scaling_plan`, `pilot_kpis[]`, `pilot_expenses[]`, `municipality`, `sector` | costs, benefits, population, sector benchmarks |
| **analysis/duplicateDetection.js** | entity[] | same entity type records | titles, descriptions, embeddings |
| **communication/partnershipProposal.js** | `partnership` | `organization`, `strategic_plan`, `municipality` | partnership: type, objectives; org: capabilities |
| **livinglab/collaboration.js** | `living_lab` | `living_labs[]`, `equipment[]`, `research_themes[]` | labs: focus areas, equipment; themes: overlap |
| **pilots/policyWorkflow.js** | `pilot` | `pilot_kpis[]`, `lessons_learned[]`, `sector`, `municipality` | pilot: evaluation; kpis: results; lessons: insights |
| **sandbox/regulatoryGap.js** | `sandbox_application` | `sandbox`, `sector`, `regulations[]` | app: description; sandbox: framework; regulations: requirements |
| **matchmaker/enhancedMatching.js** | `matchmaker_application` | `challenges[]`, `preferences` | app: org details, sectors, score; challenges: code, title, sector, priority, score |
| **scaling/rolloutRiskPrediction.js** | `pilot` | `municipality` (source), `targetMunicipalities[]`, `sector` | pilot: title, kpis; municipalities: names, populations; sector: typical risks |
| **executive/briefingGeneration.js** | `ecosystem` (aggregated) | `challenges[]`, `pilots[]`, `municipalities[]` | counts, stage filtering, mii_scores |

### NEW: Priority 4-9 Entity Dependencies (35 additional prompts)

| Prompt File | Primary Entity | Required Related Entities | Fields Used from Each Entity |
|-------------|---------------|---------------------------|------------------------------|
| **ai/collaborationSuggestion.js** | `entity` | `entities[]`, `users[]`, `partnerships[]` | entity: type, sector; users: expertise; partnerships: history |
| **ai/conflictDetection.js** | `schedule` | `schedules[]`, `resources[]`, `events[]` | schedule: time, resource; resources: availability; events: timing |
| **ai/eventOptimization.js** | `event` | `attendees[]`, `venue`, `agenda[]` | event: type, capacity; attendees: preferences; venue: facilities |
| **ai/promptLocalization.js** | `prompt` | `targetLanguage`, `context` | prompt: content; context: domain, formality |
| **ai/voiceNLU.js** | `transcript` | `userIntent`, `entities` | transcript: text; intent: action; entities: parameters |
| **citizen/prioritySorting.js** | `ideas[]` | `votes[]`, `categories[]`, `municipality` | ideas: title, votes; categories: priority; municipality: focus areas |
| **citizen/proposalScreening.js** | `proposal` | `criteria[]`, `similarProposals[]` | proposal: content; criteria: requirements; similar: scores |
| **citizen/ideasAnalytics.js** | `ideas[]` | `sectors[]`, `trends[]`, `municipality` | ideas: category, votes; sectors: name; trends: growth |
| **citizen/contentModeration.js** | `content` | `rules[]`, `flagHistory[]` | content: text; rules: patterns; history: decisions |
| **citizen/ideaToProposal.js** | `idea` | `sector`, `municipality`, `templates[]` | idea: title, description; sector: name; templates: structure |
| **citizen/ideaToChallenge.js** | `idea` | `sector`, `challenges[]`, `strategicPlans[]` | idea: details; challenges: similar; plans: objectives |
| **citizen/ideaToPilot.js** | `idea` | `challenge`, `solution`, `municipality` | idea: scope; challenge: linked; solution: features |
| **citizen/ideaToRD.js** | `idea` | `sector`, `rdCalls[]`, `researchThemes[]` | idea: innovation; calls: criteria; themes: areas |
| **citizen/ideaToSolution.js** | `idea` | `sector`, `existingSolutions[]` | idea: features; sector: needs; solutions: gaps |
| **rd/proposalAutoScoring.js** | `proposal` | `rdCall`, `criteria[]`, `historicalScores[]` | proposal: all fields; call: weights; history: benchmarks |
| **rd/proposalWriting.js** | `rdCall` | `organization`, `researchers[]`, `templates[]` | call: requirements; org: capabilities; researchers: expertise |
| **rd/researcherMatching.js** | `challenge` | `researchers[]`, `municipalities[]`, `expertiseAreas[]` | challenge: needs; researchers: skills; municipalities: priorities |
| **rd/reputationScoring.js** | `researcher` | `publications[]`, `projects[]`, `citations` | researcher: profile; publications: impact; projects: outcomes |
| **rd/rdToPilot.js** | `rdProject` | `findings[]`, `municipality`, `sector` | project: outputs; findings: validations; municipality: needs |
| **rd/rdToPolicy.js** | `rdProject` | `findings[]`, `sector`, `regulations[]` | project: recommendations; sector: context; regulations: gaps |
| **rd/rdToSolution.js** | `rdProject` | `outputs[]`, `trlAssessment`, `sector` | project: deliverables; trl: level; sector: market |
| **rd/startupSpinoff.js** | `rdProject` | `ipAssets[]`, `market`, `fundingOptions[]` | project: commercializable; ip: patents; market: opportunity |
| **matchmaker/successPrediction.js** | `match` | `historicalMatches[]`, `organization`, `challenge` | match: score; history: outcomes; org: track record |
| **matchmaker/engagementQuality.js** | `engagements[]` | `milestones[]`, `communications[]` | engagements: status; milestones: completion; comms: frequency |
| **matchmaker/marketIntelligence.js** | `sector` | `solutions[]`, `providers[]`, `trends[]` | sector: landscape; solutions: features; providers: capabilities |
| **matchmaker/portfolioIntelligence.js** | `provider` | `solutions[]`, `matches[]`, `performance[]` | provider: portfolio; matches: success rate; performance: metrics |
| **expert/expertMatching.js** | `challenge` | `experts[]`, `expertise[]`, `availability[]` | challenge: needs; experts: skills; availability: schedule |
| **livinglab/ecosystemAnalysis.js** | `livingLabs[]` | `equipment[]`, `researchThemes[]`, `collaborations[]` | labs: capabilities; equipment: types; themes: focus |
| **taxonomy/taxonomyGeneration.js** | `domain` | `sectors[]`, `services[]`, `existingTaxonomy` | domain: scope; sectors: hierarchy; existing: structure |
| **policy/similarityDetection.js** | `policy` | `policies[]`, `embeddings` | policy: content; policies: existing; embeddings: vectors |
| **policy/policyToProgram.js** | `policy` | `sector`, `municipality`, `existingPrograms[]` | policy: mandates; sector: context; programs: gaps |
| **knowledge/learningPath.js** | `userRole` | `goal`, `documents[]`, `completedModules[]` | role: level; goal: target; docs: topics; completed: progress |
| **recommendations/contextualRecommendation.js** | `context` | `userHistory[]`, `availableActions[]` | context: current state; history: patterns; actions: options |
| **profiles/credentialVerification.js** | `credential` | `issuerDatabase[]`, `verificationRules[]` | credential: claims; issuers: trusted; rules: validation |
| **profiles/expertSearch.js** | `query` | `experts[]`, `expertise[]`, `availability[]` | query: terms; experts: profiles; expertise: areas |
| **workflows/workflowOptimization.js** | `workflow` | `historicalData[]`, `bottlenecks[]` | workflow: steps; history: durations; bottlenecks: identified |
| **solutions/collaborationNetwork.js** | `provider` | `solutions[]`, `partners[]`, `synergies[]` | provider: offerings; solutions: complementary; partners: potential |

### NEW: Priority 10 Entity Dependencies (15 additional prompts - Components Getting AI)

| Prompt File | Primary Entity | Required Related Entities | Fields Used from Each Entity |
|-------------|---------------|---------------------------|------------------------------|
| **citizen/feedbackSentiment.js** | `feedback[]` | `entity`, `historicalSentiment[]`, `categories[]` | feedback: text, rating, date; entity: type, title; history: trends |
| **citizen/consensusScoring.js** | `evaluations[]` | `criteria[]`, `evaluators[]`, `weights[]` | evaluations: scores, comments; criteria: thresholds; evaluators: expertise |
| **citizen/feedbackAggregation.js** | `feedbacks[]` | `topics[]`, `sentiments[]`, `timeRange` | feedbacks: all; topics: taxonomy; sentiments: scores |
| **citizen/alignmentScoring.js** | `stakeholders[]` | `positions[]`, `requirements[]`, `gaps[]` | stakeholders: influence, stance; positions: priorities; requirements: criteria |
| **citizen/votePatternAnalysis.js** | `votes[]` | `ideas[]`, `voterProfiles[]`, `timePatterns[]` | votes: timestamps, weights; ideas: category; profiles: history |
| **matchmaker/autoClassification.js** | `applications[]` | `criteria[]`, `historicalClassifications[]` | applications: content; criteria: rules; history: accuracy |
| **matchmaker/rubricScoring.js** | `application` | `rubric`, `evaluatorHistory[]`, `benchmarks[]` | application: sections; rubric: criteria, weights; history: patterns |
| **matchmaker/preScreening.js** | `application` | `checklist[]`, `redFlags[]`, `autoRejectRules[]` | application: all fields; checklist: requirements; flags: patterns |
| **rd/trlAssessment.js** | `rdProject` | `evidence[]`, `trlCriteria[]`, `assessmentHistory[]` | project: outputs, demos; evidence: documents; criteria: per-level |
| **rd/proposalAssistance.js** | `proposal` | `rdCall`, `sectionTemplates[]`, `bestPractices[]` | proposal: draft sections; call: requirements; templates: structure |
| **rd/policyImpactPrediction.js** | `rdProject` | `policies[]`, `impactMetrics[]`, `implementationData[]` | project: findings; policies: gaps; metrics: measurement |
| **rd/citationAnalysis.js** | `publications[]` | `citations[]`, `researcher`, `fieldBenchmarks[]` | publications: venue, year; citations: count, sources; benchmarks: norms |
| **utility/duplicateMerging.js** | `entities[]` | `similarities[]`, `mergeHistory[]`, `conflictRules[]` | entities: all fields; similarities: scores; history: decisions |
| **utility/templateGeneration.js** | `context` | `templates[]`, `responseHistory[]`, `personalization[]` | context: entity, action; templates: content; history: effectiveness |
| **utility/slaRiskPrediction.js** | `slaItems[]` | `history[]`, `workload[]`, `capacity[]` | items: deadline, priority; history: completion rates; workload: current |

```javascript
// PRIMARY: pilot
const pilotData = {
  title_en, title_ar, tagline_en, tagline_ar,
  budget, duration_weeks, stage,
  sector, // string - for benchmark lookup
  kpis: [{ name, name_ar, current_value, target, unit, baseline }],
  success_probability, risk_level
};

// RELATED: targetMunicipalities[]
const municipalityData = {
  id, name_en, name_ar,
  population, budget_capacity, // for scaling calculations
  innovation_readiness_score, // if available
  region_id // for regional grouping
};

// RELATED: pilot_expenses[]
const expenseData = {
  expense_type, amount, currency, category,
  description // for cost breakdown
};

// RELATED: sector (for benchmarks)
const sectorData = {
  name_en, name_ar, code,
  typical_roi_range, average_payback_months // benchmark data
};
```

#### matchmaker/partnershipAgreement.js
```javascript
// PRIMARY: matchmaker_application
const applicationData = {
  organization_name_en, organization_name_ar,
  organization_id, match_score, stage,
  proposal_summary, value_proposition,
  proposed_approach, implementation_timeline
};

// RELATED: challenge
const challengeData = {
  title_en, title_ar, description_en, description_ar,
  sector, municipality_id, budget_estimate,
  kpis // for success criteria
};

// RELATED: organization
const organizationData = {
  name_en, name_ar, org_type,
  capabilities, sectors,
  contact_email, website
};

// RELATED: municipality
const municipalityData = {
  name_en, name_ar,
  region_id // for legal jurisdiction
};

// RELATED: solution (if available)
const solutionData = {
  name_en, name_ar, features,
  pricing_model, implementation_time
};
```

#### citizen/ideaClassification.js
```javascript
// PRIMARY: citizen_idea
const ideaData = {
  id, title, description, // note: not bilingual in current schema
  category, location, tags,
  municipality_id, user_id,
  image_url, votes_count
};

// RELATED: sectors[] (for classification taxonomy)
const sectorsData = [
  { id, name_en, name_ar, code, description_en, description_ar }
];

// RELATED: challenges[] (for similarity detection)
const similarChallengesData = [
  { id, title_en, title_ar, category, sector, municipality_id, keywords }
];

// RELATED: citizen_ideas[] (for spam pattern detection)
const historicalIdeasData = [
  { id, title, status, votes_count, user_id } // last 100 ideas
];
```

#### rd/multiInstitutionCollaboration.js
```javascript
// PRIMARY: rd_project
const projectData = {
  id, title_en, title_ar,
  focus_area, research_areas, // arrays
  budget, stage, timeline,
  lead_institution_id, research_methodology
};

// RELATED: organizations[] (type=research_institution)
const researchInstitutionsData = [
  { id, name_en, name_ar, org_type, capabilities, sectors, is_active }
];

// RELATED: researcher_profiles[]
const researchersData = [
  { id, name, expertise_areas, publications, institution_id }
];

// RELATED: living_labs[] (for equipment/facilities)
const livingLabsData = [
  { id, name_en, name_ar, research_themes, focus_areas, equipment_types }
];
```

#### analysis/roiCalculation.js
```javascript
// PRIMARY: pilot | program | scaling_plan (based on initiativeType)
const initiativeData = {
  // Common fields
  id, budget, duration_weeks_or_months, sector, status,
  
  // Pilot-specific
  title_en, title_ar, hypothesis, success_probability,
  kpis: [{ name, current_value, target }],
  
  // Program-specific  
  name_en, name_ar, program_type, participants_count,
  
  // Scaling-specific
  source_pilot_id, target_municipalities, rollout_phases
};

// RELATED: pilot_expenses[] or program_expenses
const expensesData = [
  { expense_type, amount, category }
];

// RELATED: municipality (for population impact)
const municipalityData = {
  name_en, name_ar, population,
  budget_capacity
};

// RELATED: sector (for benchmarks)
const sectorData = {
  name_en, name_ar, code,
  typical_roi_range, industry_benchmarks
};

// RELATED: pilot_kpis[] (for outcome measurement)
const kpisData = [
  { name, name_ar, baseline, current_value, target, unit }
];
```

#### matchmaker/enhancedMatching.js
```javascript
// PRIMARY: matchmaker_application
const applicationData = {
  organization_name_en, organization_name_ar,
  sectors: [], // array of sector codes
  geographic_scope: [], // array of region codes
  company_stage, // startup, growth, established
  evaluation_score: { total_score }, // nested object
  collaboration_approach
};

// RELATED: challenges[] (filtered list for matching)
const challengesData = [
  { 
    id, code, title_en, title_ar,
    sector, priority, overall_score,
    municipality_id, status // for filtering
  }
];

// RELATED: preferences (user input)
const preferencesData = {
  preferred_sectors: [],
  preferred_regions: [],
  min_score, max_matches,
  include_tier_1_only
};
```

#### scaling/rolloutRiskPrediction.js
```javascript
// PRIMARY: pilot
const pilotData = {
  title_en, title_ar,
  municipality_id, // needs lookup for name
  duration_weeks, stage,
  kpis: [{ name, current }] // nested JSON
};

// RELATED: municipality (original pilot location)
const sourceMunicipalityData = {
  id, name_en, name_ar,
  population, region_id
};

// RELATED: targetMunicipalities[]
const targetMunicipalitiesData = [
  { id, name_en, name_ar, population, region_id, innovation_readiness_score }
];

// RELATED: sector (for risk patterns)
const sectorData = {
  name_en, name_ar, code,
  typical_risks // if available
};
```

#### executive/briefingGeneration.js
```javascript
// PRIMARY: ecosystem snapshot (aggregated data)
const ecosystemData = {
  challenges_count: challenges.length,
  active_pilots_count: pilots.filter(p => p.stage === 'active').length,
  scaled_solutions_count: pilots.filter(p => p.stage === 'scaled').length,
  municipalities_count: municipalities.length,
  average_mii_score // calculated
};

// RELATED: challenges[] (for counts/status)
const challengesData = [
  { id, status, priority, sector, created_at }
];

// RELATED: pilots[] (for counts/stage filtering)
const pilotsData = [
  { id, stage, sector, success_probability, created_at }
];

// RELATED: municipalities[] (for MII scores)
const municipalitiesData = [
  { id, name_en, name_ar, mii_score }
];

// RELATED: period (user selection)
const period = 'monthly' | 'weekly' | 'quarterly';
```

#### pilot/benchmarking.js
```javascript
// PRIMARY: pilot
const pilotData = {
  id, title_en, title_ar,
  sector, // for finding similar pilots
  duration_months, budget_allocated,
  overall_score, status
};

// RELATED: similarPilots[] (same sector, completed)
const similarPilotsData = [
  { 
    id, title_en, sector,
    duration_months, budget_allocated,
    overall_score, status // must be 'completed'
  }
];

// NOTE: Filtering logic for similar pilots:
// - Same sector as current pilot
// - Different ID (exclude self)
// - Status = 'completed'
// - Limit to 10 records
```

### Entity Field Extraction Requirements

#### Primary Entity: `challenge`
```javascript
// Fields commonly needed by AI prompts
const challengeContext = {
  // Core bilingual fields
  title_en: challenge.title_en,
  title_ar: challenge.title_ar,
  description_en: challenge.description_en,
  description_ar: challenge.description_ar,
  problem_statement_en: challenge.problem_statement_en,
  problem_statement_ar: challenge.problem_statement_ar,
  
  // Metadata for AI context
  sector: challenge.sector,
  sector_id: challenge.sector_id,
  category: challenge.category,
  priority: challenge.priority,
  status: challenge.status,
  budget_estimate: challenge.budget_estimate,
  impact_score: challenge.impact_score,
  severity_score: challenge.severity_score,
  affected_population_size: challenge.affected_population_size,
  
  // JSON fields (need parsing)
  kpis: challenge.kpis,
  stakeholders: challenge.stakeholders,
  constraints: challenge.constraints,
  root_causes: challenge.root_causes,
  
  // Foreign keys (need lookups)
  municipality_id: challenge.municipality_id,
  region_id: challenge.region_id,
  strategic_plan_ids: challenge.strategic_plan_ids
};
```

#### Primary Entity: `pilot`
```javascript
const pilotContext = {
  // Core bilingual fields
  title_en: pilot.title_en,
  title_ar: pilot.title_ar,
  tagline_en: pilot.tagline_en,
  tagline_ar: pilot.tagline_ar,
  description_en: pilot.description_en,
  description_ar: pilot.description_ar,
  objective_en: pilot.objective_en,
  objective_ar: pilot.objective_ar,
  
  // Pilot-specific fields
  hypothesis: pilot.hypothesis,
  methodology: pilot.methodology,
  scope: pilot.scope,
  duration_weeks: pilot.duration_weeks,
  budget: pilot.budget,
  stage: pilot.stage,
  success_probability: pilot.success_probability,
  risk_level: pilot.risk_level,
  
  // JSON fields
  kpis: pilot.kpis,
  milestones: pilot.milestones,
  risks: pilot.risks,
  team: pilot.team,
  technology_stack: pilot.technology_stack,
  lessons_learned: pilot.lessons_learned,
  
  // Evaluation fields
  evaluation_summary_en: pilot.evaluation_summary_en,
  evaluation_summary_ar: pilot.evaluation_summary_ar,
  
  // Foreign keys
  challenge_id: pilot.challenge_id,
  solution_id: pilot.solution_id,
  municipality_id: pilot.municipality_id,
  strategic_plan_ids: pilot.strategic_plan_ids
};
```

#### Primary Entity: `matchmaker_application`
```javascript
const applicationContext = {
  // Organization info (embedded or lookup)
  organization_name_en: application.organization_name_en,
  organization_name_ar: application.organization_name_ar,
  organization_id: application.organization_id,
  
  // Match context
  match_type: application.match_type,
  match_score: application.match_score,
  stage: application.stage,
  
  // Proposal details
  proposal_summary: application.proposal_summary,
  value_proposition: application.value_proposition,
  
  // Foreign keys
  challenge_id: application.challenge_id,
  solution_id: application.solution_id
};
```

### Prompt Function Signature Pattern

All prompt functions MUST follow this pattern to accept multi-entity data:

```javascript
/**
 * @param {Object} context - Saudi context and bilingual instructions
 * @param {Object} primaryData - The main entity data (pilot, challenge, etc.)
 * @param {Object} relatedEntities - All related entity data needed
 */
export const getPromptName = (context, primaryData, relatedEntities = {}) => {
  const {
    challenge,      // Related challenge
    solution,       // Related solution
    sector,         // Sector lookup
    municipality,   // Municipality lookup
    organization,   // Organization lookup
    kpis,           // Array of KPI records
    feedbacks,      // Array of feedback records
    strategicPlan,  // Related strategic plan
    // ... other entities as needed
  } = relatedEntities;
  
  return `You are a ${role} for Saudi Arabia's MoMAH...
  
  ## PRIMARY ENTITY: ${entityType}
  ${formatPrimaryEntityDetails(primaryData)}
  
  ## RELATED CONTEXT
  ### Challenge
  - Title: ${challenge?.title_en || 'N/A'} | ${challenge?.title_ar || ''}
  - Sector: ${challenge?.sector || sector?.name_en || 'N/A'}
  
  ### Solution
  - Name: ${solution?.name_en || 'N/A'} | ${solution?.name_ar || ''}
  
  ### Municipality
  - Name: ${municipality?.name_en || 'N/A'} | ${municipality?.name_ar || ''}
  - Population: ${municipality?.population || 'N/A'}
  
  ## KPIs (${kpis?.length || 0} defined)
  ${kpis?.map(k => `- ${k.name}: ${k.current}/${k.target} ${k.unit}`).join('\n') || 'None defined'}
  
  ${context.BILINGUAL_INSTRUCTIONS}
  
  ## GENERATE BILINGUAL OUTPUT
  ...`;
};
```

---

## Database Schema Analysis

### Complete Table-by-Field Bilingual Requirements

#### 1. **challenges** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES - max 100 chars |
| `title_ar` | text | YES - max 100 chars |
| `tagline_en` | text | YES - 15-20 words |
| `tagline_ar` | text | YES - 15-20 words |
| `description_en` | text | YES - 200+ words |
| `description_ar` | text | YES - 200+ words |
| `problem_statement_en` | text | YES |
| `problem_statement_ar` | text | YES |
| `current_situation_en` | text | YES |
| `current_situation_ar` | text | YES |
| `desired_outcome_en` | text | YES |
| `desired_outcome_ar` | text | YES |
| `root_cause_en` | text | YES |
| `root_cause_ar` | text | YES |
| Additional: `sector`, `category`, `priority`, `status`, `kpis` (JSON), `stakeholders` (JSON)

#### 2. **pilots** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES - max 80 chars |
| `title_ar` | text | YES - max 80 chars |
| `tagline_en` | text | YES - 15-20 words |
| `tagline_ar` | text | YES - 15-20 words |
| `description_en` | text | YES - 200+ words |
| `description_ar` | text | YES - 200+ words |
| `objective_en` | text | YES |
| `objective_ar` | text | YES |
| Additional: `hypothesis`, `methodology`, `scope`, `kpis` (JSON), `milestones` (JSON), `risks` (JSON), `team` (JSON), `technology_stack` (JSON)
| Evaluation: `evaluation_summary_en`, `evaluation_summary_ar`, `ai_insights`, `success_probability`, `risk_level`, `recommendation`

#### 3. **sandboxes** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name` | text | YES (name_en) |
| `name_ar` | text | YES |
| `description` | text | YES (description_en) |
| `description_ar` | text | YES |
| Additional: `domain`, `capacity`, `status`, `regulatory_framework` (JSON), `exemptions_granted` (array)

**NOTE:** Sandboxes table uses `name`/`description` not `name_en`/`description_en` - code must map accordingly!

#### 4. **solutions** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name_en` | text | YES |
| `name_ar` | text | YES |
| `tagline_en` | text | YES |
| `tagline_ar` | text | YES |
| `description_en` | text | YES - 200+ words |
| `description_ar` | text | YES - 200+ words |
| `value_proposition` | text | YES |
| Additional: `features` (array), `sectors` (array), `trl`, `pricing_model`, `certifications` (JSON)

#### 5. **programs** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name_en` | text | YES |
| `name_ar` | text | YES |
| `tagline_en` | text | YES |
| `tagline_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| `objectives_en` | text | YES |
| `objectives_ar` | text | YES |
| Additional: `program_type`, `curriculum` (JSON), `benefits` (JSON), `eligibility_criteria` (array)

#### 6. **rd_calls** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| Additional: `call_type`, `focus_areas` (array), `eligibility_criteria` (JSON), `evaluation_criteria` (JSON)

#### 7. **rd_projects** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| `objectives_en` | text | YES |
| `objectives_ar` | text | YES |
| Additional: `research_areas` (array), `methodology`, `expected_outputs` (JSON), `deliverables` (JSON)

#### 8. **events** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| Additional: `event_type`, `venue_name`, `agenda` (JSON), `speakers` (JSON)

#### 9. **contracts** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| Additional: `contract_type`, `terms_and_conditions`, `deliverables` (JSON), `milestones` (JSON)

#### 10. **communication_plans** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name_en` | text | YES |
| `name_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| `master_narrative_en` | text | YES |
| `master_narrative_ar` | text | YES |
| Additional: `key_messages` (JSON), `channel_strategy` (JSON), `content_calendar` (JSON)

#### 11. **case_studies** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| Additional: `challenge_description`, `solution_description`, `results_achieved`, `lessons_learned`, `metrics` (JSON)

#### 12. **scaling_plans** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| Additional: `strategy`, `phases` (JSON), `success_metrics` (JSON), `integration_requirements` (array)

#### 13. **pilot_kpis** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name` | text | YES (name_en equivalent) |
| `name_ar` | text | YES |
| `description` | text | For context |
| Additional: `baseline`, `target`, `unit`, `measurement_frequency`

---

## Taxonomy & Context Data

### Available Lookup Tables for AI Context Injection

```javascript
// These can be fetched and injected into AI prompts for context
const TAXONOMY_TABLES = {
  // Core Reference Data
  'sectors': { fields: ['id', 'code', 'name_en', 'name_ar', 'description_en', 'description_ar'] },
  'subsectors': { fields: ['id', 'code', 'name_en', 'name_ar', 'sector_id'] },
  'services': { fields: ['id', 'code', 'name_en', 'name_ar', 'sector_id', 'subsector_id'] },
  'regions': { fields: ['id', 'code', 'name_en', 'name_ar'] },
  'cities': { fields: ['id', 'name_en', 'name_ar', 'region_id', 'municipality_id'] },
  
  // Strategic Taxonomy
  'lookup_strategic_themes': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'icon'] 
  },
  'lookup_technologies': { 
    fields: ['code', 'name_en', 'name_ar', 'category', 'description_en', 'description_ar'] 
  },
  'lookup_vision_programs': { 
    fields: ['code', 'name_en', 'name_ar', 'official_url', 'description_en'] 
  },
  'lookup_stakeholder_types': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar'] 
  },
  'lookup_risk_categories': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar'] 
  },
  'lookup_governance_roles': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar'] 
  }
};
```

### Saudi Context Constants (For All AI Prompts)

```javascript
export const SAUDI_CONTEXT = {
  FULL: `
## SAUDI ARABIA MUNICIPAL INNOVATION CONTEXT

### Ministry of Municipalities and Housing (MoMAH)
MoMAH oversees 285+ municipalities across 13 regions, managing urban development,
infrastructure, and municipal services for 35+ million residents.

### Vision 2030 Alignment
All outputs must support Saudi Vision 2030 objectives:
- Quality of Life Program (جودة الحياة)
- National Transformation Program
- Smart Cities Initiative
- Municipal Excellence Program
- Sustainability & Environment goals

### Key Partners in Innovation Ecosystem
- MCIT (Ministry of Communications): Digital transformation
- SDAIA: AI and data governance
- KAUST, KACST: Research partnerships
- NEOM, Red Sea Project: Mega project innovation
- Saudi Venture Capital Company
- Monsha'at (SME Authority)

### Cultural Requirements
- Use formal Arabic (فصحى) for all Arabic content
- Align with Saudi government communication standards
- Respect local customs and Islamic principles
- Bilingual outputs for diverse stakeholder engagement
`,

  COMPACT: `Saudi MoMAH innovation platform supporting Vision 2030. 
Partners: MCIT, SDAIA, KAUST. Use formal Arabic (فصحى) for government documents.
Align with Quality of Life Program and Municipal Excellence initiatives.`
};

// Regulatory context for sandbox prompts
export const REGULATORY_CONTEXT = `
### Saudi Regulatory Framework
- Municipal and Rural Affairs regulations
- PDPL (Personal Data Protection Law) compliance
- CITC telecommunications regulations
- Environmental regulations (PME)
- Building and construction codes
- Commercial licensing requirements`;

// Sector-specific contexts
export const SECTOR_CONTEXTS = {
  SMART_CITIES: `Smart Cities: IoT infrastructure, 5G networks, data platforms, AI services`,
  ENVIRONMENT: `Environment: Waste management, air quality, green spaces, sustainability`,
  INFRASTRUCTURE: `Infrastructure: Roads, utilities, public facilities, maintenance`,
  CITIZEN_SERVICES: `Citizen Services: Digital services, permits, complaints, engagement`
};
```

---

## Component Implementation Patterns

### How Components Should Fetch & Pass Multi-Entity Data

Components must fetch ALL related entities before invoking AI. This ensures prompts have complete context.

### Pattern 1: PilotConversionWizard (Application → Pilot Conversion)

**Current Code (BEFORE):**
```javascript
// ❌ INCOMPLETE - Missing entity context
export default function PilotConversionWizard({ application, challenge, onClose }) {
  const generatePartnershipAgreement = async () => {
    const { success, data } = await invokeAI({
      prompt: `Generate a partnership agreement...
        PROVIDER: ${application.organization_name_en}
        CHALLENGE: ${challenge?.title_en}
        ...`,
      response_json_schema: { /* inline schema */ }
    });
  };
}
```

**Updated Code (AFTER):**
```javascript
// ✅ COMPLETE - Fetches all required entities, uses separated prompt
import { getPartnershipAgreementPrompt, partnershipAgreementSchema } from '@/lib/ai/prompts/matchmaker';
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '@/lib/ai/prompts/saudiContext';

export default function PilotConversionWizard({ application, challenge, onClose }) {
  // Fetch related entities
  const { data: organization } = useQuery({
    queryKey: ['organization', application?.organization_id],
    queryFn: () => base44.entities.Organization.get(application.organization_id),
    enabled: !!application?.organization_id
  });
  
  const { data: municipality } = useQuery({
    queryKey: ['municipality', challenge?.municipality_id],
    queryFn: () => base44.entities.Municipality.get(challenge.municipality_id),
    enabled: !!challenge?.municipality_id
  });
  
  const { data: sector } = useQuery({
    queryKey: ['sector', challenge?.sector_id],
    queryFn: () => base44.entities.Sector.get(challenge.sector_id),
    enabled: !!challenge?.sector_id
  });

  const generatePartnershipAgreement = async () => {
    const context = { SAUDI_CONTEXT: SAUDI_CONTEXT.COMPACT, BILINGUAL_INSTRUCTIONS };
    
    const relatedEntities = {
      challenge: {
        title_en: challenge?.title_en,
        title_ar: challenge?.title_ar,
        description_en: challenge?.description_en,
        sector: challenge?.sector
      },
      organization: {
        name_en: organization?.name_en,
        name_ar: organization?.name_ar,
        organization_type: organization?.organization_type,
        capabilities: organization?.capabilities
      },
      municipality: {
        name_en: municipality?.name_en,
        name_ar: municipality?.name_ar
      },
      sector: {
        name_en: sector?.name_en,
        name_ar: sector?.name_ar
      }
    };
    
    const { success, data } = await invokeAI({
      prompt: getPartnershipAgreementPrompt(context, pilotData, relatedEntities),
      response_json_schema: partnershipAgreementSchema
    });
    // Handle result...
  };
}
```

### Pattern 2: ScalingCostBenefitAnalyzer (Multi-Municipality Context)

**Updated Code:**
```javascript
import { getCostBenefitAnalysisPrompt, costBenefitAnalysisSchema } from '@/lib/ai/prompts/scaling';

export default function ScalingCostBenefitAnalyzer({ pilot, targetMunicipalities }) {
  // Fetch pilot KPIs
  const { data: pilotKpis = [] } = useQuery({
    queryKey: ['pilot-kpis', pilot?.id],
    queryFn: () => base44.entities.PilotKPI.filter({ pilot_id: pilot.id }),
    enabled: !!pilot?.id
  });
  
  // Fetch pilot expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['pilot-expenses', pilot?.id],
    queryFn: () => base44.entities.PilotExpense.filter({ pilot_id: pilot.id }),
    enabled: !!pilot?.id
  });
  
  // Fetch challenge details
  const { data: challenge } = useQuery({
    queryKey: ['challenge', pilot?.challenge_id],
    queryFn: () => base44.entities.Challenge.get(pilot.challenge_id),
    enabled: !!pilot?.challenge_id
  });

  const analyzeCostBenefit = async () => {
    const relatedEntities = {
      challenge,
      kpis: pilotKpis.map(k => ({
        name_en: k.name,
        name_ar: k.name_ar,
        baseline: k.baseline,
        current: k.current_value,
        target: k.target,
        unit: k.unit
      })),
      expenses: expenses.map(e => ({
        category: e.category,
        amount: e.amount,
        description: e.description
      })),
      targetMunicipalities: targetMunicipalities.map(m => ({
        name_en: m.name_en,
        name_ar: m.name_ar,
        population: m.population,
        region: m.region_id
      }))
    };
    
    const result = await invokeAI({
      prompt: getCostBenefitAnalysisPrompt(context, pilot, relatedEntities),
      response_json_schema: costBenefitAnalysisSchema
    });
  };
}
```

### Pattern 3: MultiLabCollaborationEngine (Cross-Entity Comparison)

**Updated Code:**
```javascript
import { getMultiLabCollaborationPrompt, multiLabCollaborationSchema } from '@/lib/ai/prompts/livinglab';

export default function MultiLabCollaborationEngine({ currentLabId }) {
  // Fetch all labs
  const { data: labs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: () => base44.entities.LivingLab.list()
  });
  
  // Fetch equipment for current lab
  const { data: equipment = [] } = useQuery({
    queryKey: ['lab-equipment', currentLabId],
    queryFn: () => base44.entities.LivingLabResource.filter({ living_lab_id: currentLabId }),
    enabled: !!currentLabId
  });

  const currentLab = labs.find(l => l.id === currentLabId);
  const otherLabs = labs.filter(l => l.id !== currentLabId);

  const findCollaborations = async () => {
    const relatedEntities = {
      currentLab: {
        name_en: currentLab?.name_en,
        name_ar: currentLab?.name_ar,
        research_themes: currentLab?.research_themes,
        equipment: equipment.map(e => ({
          name: e.name,
          type: e.resource_type
        })),
        focus_areas: currentLab?.focus_areas
      },
      otherLabs: otherLabs.slice(0, 10).map(l => ({
        id: l.id,
        name_en: l.name_en,
        name_ar: l.name_ar,
        research_themes: l.research_themes,
        focus_areas: l.focus_areas,
        location: l.location
      }))
    };
    
    const result = await invokeAI({
      prompt: getMultiLabCollaborationPrompt(context, currentLab, relatedEntities),
      response_json_schema: multiLabCollaborationSchema
    });
  };
}
```

### Pattern 4: PilotToPolicyWorkflow (Pilot + Evaluation Data)

**Updated Code:**
```javascript
import { getPilotToPolicyPrompt, pilotToPolicySchema } from '@/lib/ai/prompts/pilot';

export default function PilotToPolicyWorkflow({ pilot, onClose }) {
  // Fetch pilot KPIs with datapoints
  const { data: kpis = [] } = useQuery({
    queryKey: ['pilot-kpis', pilot?.id],
    queryFn: async () => {
      const kpiList = await base44.entities.PilotKPI.filter({ pilot_id: pilot.id });
      // Fetch datapoints for each KPI
      const withDatapoints = await Promise.all(kpiList.map(async (kpi) => {
        const datapoints = await base44.entities.PilotKPIDatapoint.filter({ pilot_kpi_id: kpi.id });
        return { ...kpi, datapoints };
      }));
      return withDatapoints;
    },
    enabled: !!pilot?.id
  });
  
  // Fetch stakeholder feedback
  const { data: feedback = [] } = useQuery({
    queryKey: ['stakeholder-feedback', pilot?.id],
    queryFn: () => base44.entities.StakeholderFeedback.filter({ entity_id: pilot.id, entity_type: 'pilot' }),
    enabled: !!pilot?.id
  });
  
  // Fetch municipality
  const { data: municipality } = useQuery({
    queryKey: ['municipality', pilot?.municipality_id],
    queryFn: () => base44.entities.Municipality.get(pilot.municipality_id),
    enabled: !!pilot?.municipality_id
  });
  
  // Fetch sector
  const { data: sector } = useQuery({
    queryKey: ['sector-by-name', pilot?.sector],
    queryFn: () => base44.entities.Sector.filter({ name_en: pilot.sector }).then(r => r[0]),
    enabled: !!pilot?.sector
  });

  const generateAI = async () => {
    const relatedEntities = {
      kpis: kpis.map(k => ({
        name_en: k.name,
        name_ar: k.name_ar,
        baseline: k.baseline,
        current: k.current_value,
        target: k.target,
        achievement_percentage: k.target ? ((k.current_value || 0) / k.target * 100) : 0,
        trend: k.datapoints?.slice(-5).map(d => d.value)
      })),
      feedback: feedback.map(f => ({
        rating: f.rating,
        feedback_text: f.feedback_text,
        stakeholder_type: f.stakeholder_type
      })),
      municipality: {
        name_en: municipality?.name_en,
        name_ar: municipality?.name_ar
      },
      sector: {
        name_en: sector?.name_en,
        name_ar: sector?.name_ar
      },
      lessonsLearned: pilot?.lessons_learned
    };
    
    const result = await invokeAI({
      prompt: getPilotToPolicyPrompt(context, pilot, relatedEntities),
      response_json_schema: pilotToPolicySchema
    });
  };
}
```

### Utility Hook: useEntityRelations

Create a reusable hook for fetching common entity relations:

```javascript
// src/hooks/useEntityRelations.js
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useEntityRelations(entityType, entityId, entityData) {
  // Fetch sector
  const { data: sector } = useQuery({
    queryKey: ['sector', entityData?.sector_id],
    queryFn: () => base44.entities.Sector.get(entityData.sector_id),
    enabled: !!entityData?.sector_id
  });
  
  // Fetch municipality
  const { data: municipality } = useQuery({
    queryKey: ['municipality', entityData?.municipality_id],
    queryFn: () => base44.entities.Municipality.get(entityData.municipality_id),
    enabled: !!entityData?.municipality_id
  });
  
  // Fetch challenge (for pilots)
  const { data: challenge } = useQuery({
    queryKey: ['challenge', entityData?.challenge_id],
    queryFn: () => base44.entities.Challenge.get(entityData.challenge_id),
    enabled: !!entityData?.challenge_id && entityType === 'pilot'
  });
  
  // Fetch solution (for pilots)
  const { data: solution } = useQuery({
    queryKey: ['solution', entityData?.solution_id],
    queryFn: () => base44.entities.Solution.get(entityData.solution_id),
    enabled: !!entityData?.solution_id && entityType === 'pilot'
  });
  
  // Fetch strategic plans
  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans', entityData?.strategic_plan_ids],
    queryFn: async () => {
      if (!entityData?.strategic_plan_ids?.length) return [];
      return Promise.all(
        entityData.strategic_plan_ids.map(id => 
          base44.entities.StrategicPlan.get(id)
        )
      );
    },
    enabled: !!entityData?.strategic_plan_ids?.length
  });
  
  return {
    sector,
    municipality,
    challenge,
    solution,
    strategicPlans,
    isLoading: false // Combine loading states as needed
  };
}
```

---

## Prompt File Structure (NEW FILES TO CREATE)

### Directory Structure

Following the Strategy Wizard pattern, create these new prompt directories and files:

```
src/lib/ai/prompts/
├── index.js                          # Central export for all domain prompts
├── saudiContext.js                   # Shared Saudi/MoMAH context constants
├── bilingualSchemaBuilder.js         # Helper utilities for schema building
│
├── sandbox/
│   ├── index.js                      # Export all sandbox prompts
│   ├── sandboxEnhancement.js         # getSandboxEnhancementPrompt + sandboxEnhancementSchema
│   └── sandboxEvaluation.js          # getSandboxEvaluationPrompt + sandboxEvaluationSchema
│
├── pilot/
│   ├── index.js                      # Export all pilot prompts
│   ├── pilotDetails.js               # getPilotDetailsPrompt + pilotDetailsSchema
│   ├── pilotKpis.js                  # getPilotKpisPrompt + pilotKpisSchema
│   ├── pilotMilestones.js            # getPilotMilestonesPrompt + pilotMilestonesSchema
│   ├── pilotRisks.js                 # getPilotRisksPrompt + pilotRisksSchema
│   ├── pilotTechnology.js            # getPilotTechnologyPrompt + pilotTechnologySchema
│   ├── pilotEngagement.js            # getPilotEngagementPrompt + pilotEngagementSchema
│   ├── pilotEvaluation.js            # getPilotEvaluationPrompt + pilotEvaluationSchema
│   ├── pilotBenchmarking.js          # getPilotBenchmarkingPrompt + pilotBenchmarkingSchema
│   └── pilotScalingReadiness.js      # getPilotScalingReadinessPrompt + pilotScalingReadinessSchema
│
├── matchmaker/
│   ├── index.js                      # Export all matchmaker prompts
│   ├── proposalGeneration.js         # getProposalGenerationPrompt + proposalGenerationSchema
│   ├── partnershipAgreement.js       # getPartnershipAgreementPrompt + partnershipAgreementSchema
│   ├── multiPartyConsortium.js       # getMultiPartyConsortiumPrompt + multiPartyConsortiumSchema
│   ├── strategicChallengeMapping.js  # getStrategicChallengeMappingPrompt + strategicChallengeMappingSchema
│   ├── failedMatchLearning.js        # getFailedMatchLearningPrompt + failedMatchLearningSchema
│   ├── partnershipOrchestration.js   # getPartnershipOrchestrationPrompt + partnershipOrchestrationSchema
│   └── enhancedMatching.js           # getEnhancedMatchingPrompt + enhancedMatchingSchema
│
├── scaling/
│   ├── index.js                      # Export all scaling prompts
│   ├── costBenefitAnalysis.js        # getCostBenefitAnalysisPrompt + costBenefitAnalysisSchema
│   ├── programConversion.js          # getProgramConversionPrompt + programConversionSchema
│   ├── adaptiveRollout.js            # getAdaptiveRolloutPrompt + adaptiveRolloutSchema
│   └── rolloutRiskPrediction.js      # getRolloutRiskPredictionPrompt + rolloutRiskPredictionSchema
│
├── executive/
│   ├── index.js                      # Export all executive prompts
│   └── briefingGeneration.js         # getBriefingGenerationPrompt + briefingGenerationSchema
│
├── challenge/
│   ├── index.js                      # Export all challenge prompts
│   ├── challengeEnhancement.js       # getChallengeEnhancementPrompt + challengeEnhancementSchema
│   └── challengeToRD.js              # getChallengeToRDPrompt + challengeToRDSchema
│
├── solution/
│   ├── index.js                      # Export all solution prompts
│   ├── solutionEnhancement.js        # getSolutionEnhancementPrompt + solutionEnhancementSchema
│   └── contractGeneration.js         # getContractGenerationPrompt + contractGenerationSchema
│
├── rd/
│   ├── index.js                      # Export all R&D prompts
│   ├── proposalScoring.js            # getProposalScoringPrompt + proposalScoringSchema
│   ├── proposalAutoScoring.js        # getProposalAutoScoringPrompt + proposalAutoScoringSchema (NEW)
│   ├── proposalWriting.js            # getProposalWritingPrompt + proposalWritingSchema (NEW)
│   ├── researcherMatching.js         # getResearcherMatchingPrompt + researcherMatchingSchema (NEW)
│   ├── reputationScoring.js          # getReputationScoringPrompt + reputationScoringSchema (NEW)
│   ├── rdToPilot.js                  # getRDToPilotPrompt + rdToPilotSchema (NEW)
│   ├── rdToPolicy.js                 # getRDToPolicyPrompt + rdToPolicySchema (NEW)
│   ├── rdToSolution.js               # getRDToSolutionPrompt + rdToSolutionSchema (NEW)
│   ├── startupSpinoff.js             # getStartupSpinoffPrompt + startupSpinoffSchema (NEW)
│   ├── ipCommercialization.js        # getIPCommercializationPrompt + ipCommercializationSchema
│   ├── portfolioPlanning.js          # getPortfolioPlanningPrompt + portfolioPlanningSchema
│   └── multiInstitutionCollaboration.js  # getMultiInstitutionCollaborationPrompt + multiInstitutionCollaborationSchema
│
├── citizen/
│   ├── index.js                      # Export all citizen prompts
│   ├── ideaClassification.js         # getIdeaClassificationPrompt + ideaClassificationSchema
│   ├── prioritySorting.js            # getPrioritySortingPrompt + prioritySortingSchema (NEW)
│   ├── proposalScreening.js          # getProposalScreeningPrompt + proposalScreeningSchema (NEW)
│   ├── ideasAnalytics.js             # getIdeasAnalyticsPrompt + ideasAnalyticsSchema (NEW)
│   ├── contentModeration.js          # getContentModerationPrompt + contentModerationSchema (NEW)
│   ├── ideaToProposal.js             # getIdeaToProposalPrompt + ideaToProposalSchema (NEW)
│   ├── ideaToChallenge.js            # getIdeaToChallengePrompt + ideaToChallengeSchema (NEW)
│   ├── ideaToPilot.js                # getIdeaToPilotPrompt + ideaToPilotSchema (NEW)
│   ├── ideaToRD.js                   # getIdeaToRDPrompt + ideaToRDSchema (NEW)
│   └── ideaToSolution.js             # getIdeaToSolutionPrompt + ideaToSolutionSchema (NEW)
│
├── analysis/
│   ├── index.js                      # Export all analysis prompts
│   ├── roiCalculation.js             # getROICalculationPrompt + roiCalculationSchema
│   ├── duplicateDetection.js         # getDuplicateDetectionPrompt + duplicateDetectionSchema
│   ├── trendAnalysis.js              # getTrendAnalysisPrompt + trendAnalysisSchema
│   ├── eventCorrelation.js           # getEventCorrelationPrompt + eventCorrelationSchema
│   ├── attendancePrediction.js       # getAttendancePredictionPrompt + attendancePredictionSchema
│   └── eventROI.js                   # getEventROIPrompt + eventROISchema
│
├── ai/                               # NEW DIRECTORY
│   ├── index.js                      # Export all AI core prompts
│   ├── collaborationSuggestion.js    # getCollaborationSuggestionPrompt + collaborationSuggestionSchema
│   ├── conflictDetection.js          # getConflictDetectionPrompt + conflictDetectionSchema
│   ├── eventOptimization.js          # getEventOptimizationPrompt + eventOptimizationSchema
│   ├── promptLocalization.js         # getPromptLocalizationPrompt + promptLocalizationSchema
│   └── voiceNLU.js                   # getVoiceNLUPrompt + voiceNLUSchema
│
├── matchmaker/
│   ├── index.js                      # Export all matchmaker prompts (EXPANDED)
│   ├── proposalGeneration.js         # getProposalGenerationPrompt + proposalGenerationSchema
│   ├── partnershipAgreement.js       # getPartnershipAgreementPrompt + partnershipAgreementSchema
│   ├── multiPartyConsortium.js       # getMultiPartyConsortiumPrompt + multiPartyConsortiumSchema
│   ├── strategicChallengeMapping.js  # getStrategicChallengeMappingPrompt + strategicChallengeMappingSchema
│   ├── failedMatchLearning.js        # getFailedMatchLearningPrompt + failedMatchLearningSchema
│   ├── partnershipOrchestration.js   # getPartnershipOrchestrationPrompt + partnershipOrchestrationSchema
│   ├── enhancedMatching.js           # getEnhancedMatchingPrompt + enhancedMatchingSchema
│   ├── successPrediction.js          # getSuccessPredictionPrompt + successPredictionSchema (NEW)
│   ├── engagementQuality.js          # getEngagementQualityPrompt + engagementQualitySchema (NEW)
│   ├── marketIntelligence.js         # getMarketIntelligencePrompt + marketIntelligenceSchema (NEW)
│   └── portfolioIntelligence.js      # getPortfolioIntelligencePrompt + portfolioIntelligenceSchema (NEW)
│
├── expert/                           # NEW DIRECTORY
│   ├── index.js                      # Export all expert prompts
│   └── expertMatching.js             # getExpertMatchingPrompt + expertMatchingSchema
│
├── livinglab/                        # NEW DIRECTORY
│   ├── index.js                      # Export all living lab prompts
│   ├── ecosystemAnalysis.js          # getEcosystemAnalysisPrompt + ecosystemAnalysisSchema
│   └── collaboration.js              # getLivingLabCollaborationPrompt + livingLabCollaborationSchema
│
├── taxonomy/                         # NEW DIRECTORY
│   ├── index.js                      # Export all taxonomy prompts
│   └── taxonomyGeneration.js         # getTaxonomyGenerationPrompt + taxonomyGenerationSchema
│
├── policy/                           # NEW DIRECTORY
│   ├── index.js                      # Export all policy prompts
│   ├── similarityDetection.js        # getSimilarityDetectionPrompt + similarityDetectionSchema
│   └── policyToProgram.js            # getPolicyToProgramPrompt + policyToProgramSchema
│
├── knowledge/                        # NEW DIRECTORY
│   ├── index.js                      # Export all knowledge prompts
│   └── learningPath.js               # getLearningPathPrompt + learningPathSchema
│
├── recommendations/                  # NEW DIRECTORY
│   ├── index.js                      # Export all recommendation prompts
│   └── contextualRecommendation.js   # getContextualRecommendationPrompt + contextualRecommendationSchema
│
├── profiles/                         # NEW DIRECTORY
│   ├── index.js                      # Export all profile prompts
│   ├── credentialVerification.js     # getCredentialVerificationPrompt + credentialVerificationSchema
│   └── expertSearch.js               # getExpertSearchPrompt + expertSearchSchema
│
├── workflows/                        # NEW DIRECTORY
│   ├── index.js                      # Export all workflow prompts
│   └── workflowOptimization.js       # getWorkflowOptimizationPrompt + workflowOptimizationSchema
│
├── solutions/                        # NEW DIRECTORY (separate from solution/)
│   ├── index.js                      # Export all solutions prompts
│   └── collaborationNetwork.js       # getCollaborationNetworkPrompt + collaborationNetworkSchema
│
├── utility/                          # NEW DIRECTORY (Priority 10)
│   ├── index.js                      # Export all utility prompts
│   ├── duplicateMerging.js           # getDuplicateMergingPrompt + duplicateMergingSchema
│   ├── templateGeneration.js         # getTemplateGenerationPrompt + templateGenerationSchema
│   └── slaRiskPrediction.js          # getSlaRiskPredictionPrompt + slaRiskPredictionSchema
│
└── communication/
    ├── index.js                      # Export all communication prompts
    ├── emailTemplate.js              # getEmailTemplatePrompt + emailTemplateSchema
    └── partnershipProposal.js        # getPartnershipProposalPrompt + partnershipProposalSchema
```

**Note:** Priority 10 prompts are distributed across existing directories:
- `citizen/` gains: `feedbackSentiment.js`, `consensusScoring.js`, `feedbackAggregation.js`, `alignmentScoring.js`, `votePatternAnalysis.js`
- `matchmaker/` gains: `autoClassification.js`, `rubricScoring.js`, `preScreening.js`
- `rd/` gains: `trlAssessment.js`, `proposalAssistance.js`, `policyImpactPrediction.js`, `citationAnalysis.js`
- `utility/` (new): `duplicateMerging.js`, `templateGeneration.js`, `slaRiskPrediction.js`

### Total New Files: 98 prompt files (15 additional from Priority 10)

---

## Files Requiring Updates (Component Changes)

After extracting prompts, components need minimal changes - just import and use the prompt functions.

### Priority 1: High-Impact User-Facing Pages (6 files)

| # | Component File | Prompt File(s) to Create | Changes in Component |
|---|------|-------------------|-------------------|
| 1 | `src/pages/SandboxCreate.jsx` | `sandbox/sandboxEnhancement.js` | Replace inline prompt with: `import { getSandboxEnhancementPrompt, sandboxEnhancementSchema } from '@/lib/ai/prompts/sandbox'` |
| 2 | `src/pages/PilotEdit.jsx` | `pilot/*.js` (7 files) | Replace 7 inline prompts with imports from `@/lib/ai/prompts/pilot` |
| 3 | `src/pages/SolutionChallengeMatcher.jsx` | `matchmaker/proposalGeneration.js` | Import from `@/lib/ai/prompts/matchmaker` |
| 4 | `src/pages/EmailTemplateManager.jsx` | `communication/emailTemplate.js` | Import from `@/lib/ai/prompts/communication` |
| 5 | `src/pages/RDPortfolioPlanner.jsx` | `rd/portfolioPlanning.js` | Import from `@/lib/ai/prompts/rd` |
| 6 | `src/pages/RiskPortfolio.jsx` | `analysis/riskAnalysis.js` | Import from `@/lib/ai/prompts/analysis` |

### Priority 2: Workflow Components (23 files)

| # | Component File | Prompt File(s) to Create | Changes in Component |
|---|------|----------------|------------------|
| 1 | `src/components/sandbox/SandboxCreateWizard.jsx` | Uses `sandbox/sandboxEnhancement.js` | Import prompt, remove inline code |
| 2 | `src/components/matchmaker/PilotConversionWizard.jsx` | `matchmaker/partnershipAgreement.js` | Import prompt, remove inline code |
| 3 | `src/components/matchmaker/MultiPartyMatchmaker.jsx` | `matchmaker/multiPartyConsortium.js` | Import prompt, remove inline code |
| 4 | `src/components/matchmaker/StrategicChallengeMapper.jsx` | `matchmaker/strategicChallengeMapping.js` | Import prompt, remove inline code |
| 5 | `src/components/matchmaker/FailedMatchLearningEngine.jsx` | `matchmaker/failedMatchLearning.js` | Import prompt, remove inline code |
| 6 | `src/components/scaling/ScalingToProgramConverter.jsx` | `scaling/programConversion.js` | Import prompt, remove inline code |
| 7 | `src/components/scaling/ScalingCostBenefitAnalyzer.jsx` | `scaling/costBenefitAnalysis.js` | Import prompt, remove inline code |
| 8 | `src/components/scaling/AdaptiveRolloutSequencing.jsx` | `scaling/adaptiveRollout.js` | Import prompt, remove inline code |
| 9 | `src/components/challenges/ChallengeToRDWizard.jsx` | `challenge/challengeToRD.js` | Import prompt, remove inline code |
| 10 | `src/components/pilots/SuccessPatternAnalyzer.jsx` | `pilot/successPattern.js` | Import prompt, remove inline code |
| 11 | `src/components/pilots/ScalingReadiness.jsx` | `pilot/pilotScalingReadiness.js` | Import prompt, remove inline code |
| 12 | `src/components/pilots/PilotBenchmarking.jsx` | `pilot/pilotBenchmarking.js` | Import prompt, remove inline code |
| 13 | `src/components/solutions/ContractGeneratorWizard.jsx` | `solution/contractGeneration.js` | Import prompt, remove inline code |
| 14 | `src/components/collaboration/PartnershipProposalWizard.jsx` | `communication/partnershipProposal.js` | Import prompt, remove inline code |
| 15 | `src/components/rd/RDProposalAIScorerWidget.jsx` | `rd/proposalScoring.js` | Import prompt, remove inline code |
| 16 | `src/components/rd/IPCommercializationTracker.jsx` | `rd/ipCommercialization.js` | Import prompt, remove inline code |
| 17 | `src/components/rd/MultiInstitutionCollaboration.jsx` | `rd/multiInstitutionCollaboration.js` | Import prompt, fetch rd_project + orgs + researchers |
| 18 | `src/components/citizen/AIIdeaClassifier.jsx` | `citizen/ideaClassification.js` | Import prompt, fetch sectors taxonomy + similar challenges |
| 19 | `src/components/onboarding/FirstActionRecommender.jsx` | `onboarding/actionRecommendation.js` | Import prompt, remove inline code |
| 20 | `src/components/partnerships/PartnershipOrchestrator.jsx` | `matchmaker/partnershipOrchestration.js` | Add AI prompt for partnership scoring |
| 21 | `src/components/matchmaker/EnhancedMatchingEngine.jsx` | `matchmaker/enhancedMatching.js` | Import prompt, fetch challenges for matching |
| 22 | `src/components/scaling/RolloutRiskPredictor.jsx` | `scaling/rolloutRiskPrediction.js` | Import prompt, fetch source municipality |
| 23 | `src/components/executive/ExecutiveBriefingGenerator.jsx` | `executive/briefingGeneration.js` | Import prompt, aggregate ecosystem data |

### Priority 3: Analysis Components (10 files)

| # | Component File | Prompt File(s) to Create | Changes in Component |
|---|------|------------|------------------|
| 1 | `src/components/data/DuplicateRecordDetector.jsx` | `analysis/duplicateDetection.js` | Import prompt, remove inline code |
| 2 | `src/components/ROICalculator.jsx` | `analysis/roiCalculation.js` | Import prompt, remove inline code |
| 3 | `src/components/ai/AIProgramEventCorrelator.jsx` | `analysis/eventCorrelation.js` | Import prompt, remove inline code |
| 4 | `src/components/ai/AIAttendancePredictor.jsx` | `analysis/attendancePrediction.js` | Import prompt, remove inline code |
| 5 | `src/components/ai/AIEventROIPredictor.jsx` | `analysis/eventROI.js` | Import prompt, remove inline code |
| 6 | `src/components/ai/AISectorTrendAnalyzer.jsx` | `analysis/trendAnalysis.js` | Import prompt, remove inline code |
| 7 | `src/components/strategy/CollaborationMapper.jsx` | `strategy/collaborationMapping.js` | Import prompt, remove inline code |
| 8 | `src/components/strategy/cascade/StrategyChallengeGenerator.jsx` | Verify uses extracted prompts | Verify import pattern |
| 9 | `src/components/strategy/cascade/StrategyToEventGenerator.jsx` | Verify uses extracted prompts | Verify import pattern |
| 10 | `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx` | Verify uses extracted prompts | Verify import pattern |

### Priority 4: AI Core Components (5 files) - NEW

| # | Component File | Prompt File(s) to Create | Entity Dependencies |
|---|------|------------|------------------|
| 1 | `src/components/ai/AICollaborationSuggester.jsx` | `ai/collaborationSuggestion.js` | `entities[]`, `users[]`, `partnerships[]` |
| 2 | `src/components/ai/AIConflictDetector.jsx` | `ai/conflictDetection.js` | `schedules[]`, `resources[]`, `events[]` |
| 3 | `src/components/ai/AIEventOptimizer.jsx` | `ai/eventOptimization.js` | `event`, `attendees[]`, `venue`, `agenda[]` |
| 4 | `src/components/ai/AIPromptLocalizer.jsx` | `ai/promptLocalization.js` | `prompt`, `targetLanguage`, `context` |
| 5 | `src/components/ai/VoiceNLUPanel.jsx` | `ai/voiceNLU.js` | `transcript`, `userIntent`, `entities` |

### Priority 5: Citizen AI Converters (9 files) - NEW

| # | Component File | Prompt File(s) to Create | Entity Dependencies |
|---|------|------------|------------------|
| 1 | `src/components/citizen/AIPrioritySorter.jsx` | `citizen/prioritySorting.js` | `ideas[]`, `votes[]`, `categories[]` |
| 2 | `src/components/citizen/AIProposalScreening.jsx` | `citizen/proposalScreening.js` | `proposal`, `criteria[]`, `similarProposals[]` |
| 3 | `src/components/citizen/AdvancedIdeasAnalytics.jsx` | `citizen/ideasAnalytics.js` | `ideas[]`, `sectors[]`, `trends[]` |
| 4 | `src/components/citizen/ContentModerationAI.jsx` | `citizen/contentModeration.js` | `content`, `rules[]`, `flagHistory[]` |
| 5 | `src/components/citizen/IdeaToProposalConverter.jsx` | `citizen/ideaToProposal.js` | `idea`, `sector`, `municipality`, `templates[]` |
| 6 | `src/components/citizen/IdeaToChallengeConverter.jsx` | `citizen/ideaToChallenge.js` | `idea`, `sector`, `challenges[]` (similar), `strategicPlans[]` |
| 7 | `src/components/citizen/IdeaToPilotConverter.jsx` | `citizen/ideaToPilot.js` | `idea`, `challenge`, `solution`, `municipality` |
| 8 | `src/components/citizen/IdeaToRDConverter.jsx` | `citizen/ideaToRD.js` | `idea`, `sector`, `rdCalls[]`, `researchThemes[]` |
| 9 | `src/components/citizen/IdeaToSolutionConverter.jsx` | `citizen/ideaToSolution.js` | `idea`, `sector`, `existingSolutions[]` |

### Priority 6: R&D AI Components (8 files) - NEW

| # | Component File | Prompt File(s) to Create | Entity Dependencies |
|---|------|------------|------------------|
| 1 | `src/components/rd/AIProposalScorer.jsx` | `rd/proposalAutoScoring.js` | `proposal`, `rdCall`, `evaluationCriteria[]`, `historicalScores[]` |
| 2 | `src/components/rd/AIProposalWriter.jsx` | `rd/proposalWriting.js` | `rdCall`, `organization`, `researcherProfiles[]`, `templates[]` |
| 3 | `src/components/rd/ResearcherMunicipalityMatcher.jsx` | `rd/researcherMatching.js` | `researchers[]`, `municipalities[]`, `challenges[]`, `expertiseAreas[]` |
| 4 | `src/components/rd/ResearcherReputationScoring.jsx` | `rd/reputationScoring.js` | `researcher`, `publications[]`, `projects[]`, `citations` |
| 5 | `src/components/rd/RDToPilotTransition.jsx` | `rd/rdToPilot.js` | `rdProject`, `findings[]`, `municipality`, `sector` |
| 6 | `src/components/rd/RDToPolicyConverter.jsx` | `rd/rdToPolicy.js` | `rdProject`, `findings[]`, `sector`, `regulations[]` |
| 7 | `src/components/rd/RDToSolutionConverter.jsx` | `rd/rdToSolution.js` | `rdProject`, `outputs[]`, `trlAssessment`, `sector` |
| 8 | `src/components/rd/RDToStartupSpinoff.jsx` | `rd/startupSpinoff.js` | `rdProject`, `ipAssets[]`, `market`, `fundingOptions[]` |

### Priority 7: Matchmaker Intelligence (4 files) - NEW

| # | Component File | Prompt File(s) to Create | Entity Dependencies |
|---|------|------------|------------------|
| 1 | `src/components/matchmaker/AIMatchSuccessPredictor.jsx` | `matchmaker/successPrediction.js` | `match`, `historicalMatches[]`, `organization`, `challenge` |
| 2 | `src/components/matchmaker/EngagementQualityAnalytics.jsx` | `matchmaker/engagementQuality.js` | `engagements[]`, `milestones[]`, `communications[]` |
| 3 | `src/components/matchmaker/MatchmakerMarketIntelligence.jsx` | `matchmaker/marketIntelligence.js` | `sector`, `solutions[]`, `providers[]`, `trends[]` |
| 4 | `src/components/matchmaker/ProviderPortfolioIntelligence.jsx` | `matchmaker/portfolioIntelligence.js` | `provider`, `solutions[]`, `matches[]`, `performance[]` |

### Priority 8: Pages with AI (5 files) - NEW

| # | Component File | Prompt File(s) to Create | Entity Dependencies |
|---|------|------------|------------------|
| 1 | `src/pages/ExpertMatchingEngine.jsx` | `expert/expertMatching.js` | `challenge`, `experts[]`, `expertise[]`, `availability[]` |
| 2 | `src/pages/LivingLabs.jsx` | `livinglab/ecosystemAnalysis.js` | `livingLabs[]`, `equipment[]`, `researchThemes[]`, `collaborations[]` |
| 3 | `src/components/taxonomy/TaxonomyWizard.jsx` | `taxonomy/taxonomyGeneration.js` | `sectors[]`, `services[]`, `existingTaxonomy` |
| 4 | `src/components/policy/SimilarPolicyDetector.jsx` | `policy/similarityDetection.js` | `policy`, `policies[]`, `embeddings` |
| 5 | `src/components/policy/PolicyToProgramConverter.jsx` | `policy/policyToProgram.js` | `policy`, `sector`, `municipality`, `existingPrograms[]` |

### Priority 9: Knowledge & Utility AI (6 files) - NEW

| # | Component File | Prompt File(s) to Create | Entity Dependencies |
|---|------|------------|------------------|
| 1 | `src/components/knowledge/AILearningPathGenerator.jsx` | `knowledge/learningPath.js` | `userRole`, `goal`, `documents[]`, `completedModules[]` |
| 2 | `src/components/SmartRecommendation.jsx` | `recommendations/contextualRecommendation.js` | `context`, `userHistory[]`, `availableActions[]` |
| 3 | `src/components/profiles/CredentialVerificationAI.jsx` | `profiles/credentialVerification.js` | `credential`, `issuerDatabase[]`, `verificationRules[]` |
| 4 | `src/components/profiles/ExpertFinder.jsx` | `profiles/expertSearch.js` | `query`, `experts[]`, `expertise[]`, `availability[]` |
| 5 | `src/components/workflows/AIWorkflowOptimizer.jsx` | `workflows/workflowOptimization.js` | `workflow`, `historicalData[]`, `bottlenecks[]` |
| 6 | `src/components/solutions/ProviderCollaborationNetwork.jsx` | `solutions/collaborationNetwork.js` | `provider`, `solutions[]`, `partners[]`, `synergies[]` |

### Priority 10: New AI Features - Components Without AI (15 files) - NEW

These components currently lack AI but would significantly benefit from it. Adding AI will enhance user experience and automation.

#### Citizen Engagement AI (5 files)

| # | Component File | Prompt File(s) to Create | Entity Dependencies | AI Feature |
|---|------|------------|------------------|------------|
| 1 | `src/components/citizen/CitizenFeedbackLoop.jsx` | `citizen/feedbackSentiment.js` | `feedback[]`, `entity`, `historicalSentiment[]` | Sentiment analysis, theme extraction |
| 2 | `src/components/citizen/MultiEvaluatorConsensus.jsx` | `citizen/consensusScoring.js` | `evaluations[]`, `criteria[]`, `evaluators[]` | AI consensus building, outlier detection |
| 3 | `src/components/citizen/PublicFeedbackAggregator.jsx` | `citizen/feedbackAggregation.js` | `feedbacks[]`, `topics[]`, `sentiments[]` | Theme clustering, insight extraction |
| 4 | `src/components/citizen/StakeholderAlignmentGate.jsx` | `citizen/alignmentScoring.js` | `stakeholders[]`, `positions[]`, `requirements[]` | Alignment gap analysis, recommendation |
| 5 | `src/components/citizen/VotingSystemBackend.jsx` | `citizen/votePatternAnalysis.js` | `votes[]`, `ideas[]`, `voterProfiles[]` | Pattern detection, manipulation detection |

#### Matchmaker Enhancement AI (3 files)

| # | Component File | Prompt File(s) to Create | Entity Dependencies | AI Feature |
|---|------|------------|------------------|------------|
| 1 | `src/components/matchmaker/ClassificationDashboard.jsx` | `matchmaker/autoClassification.js` | `applications[]`, `criteria[]`, `historicalClassifications[]` | Auto-categorization, priority scoring |
| 2 | `src/components/matchmaker/EvaluationRubrics.jsx` | `matchmaker/rubricScoring.js` | `application`, `rubric`, `evaluatorHistory[]` | AI scoring assistance, consistency check |
| 3 | `src/components/matchmaker/ScreeningChecklist.jsx` | `matchmaker/preScreening.js` | `application`, `checklist[]`, `redFlags[]` | Auto pre-screening, risk flagging |

#### R&D Enhancement AI (4 files)

| # | Component File | Prompt File(s) to Create | Entity Dependencies | AI Feature |
|---|------|------------|------------------|------------|
| 1 | `src/components/rd/TRLAssessmentWorkflow.jsx` | `rd/trlAssessment.js` | `rdProject`, `evidence[]`, `trlCriteria[]` | AI TRL level recommendation |
| 2 | `src/components/rd/CollaborativeProposalEditor.jsx` | `rd/proposalAssistance.js` | `proposal`, `rdCall`, `sectionTemplates[]` | AI writing assistance, gap analysis |
| 3 | `src/components/rd/PolicyImpactTracker.jsx` | `rd/policyImpactPrediction.js` | `rdProject`, `policies[]`, `impactMetrics[]` | Impact prediction, policy gap analysis |
| 4 | `src/components/rd/PublicationTracker.jsx` | `rd/citationAnalysis.js` | `publications[]`, `citations[]`, `researcher` | Citation prediction, impact scoring |

#### Utility Enhancement AI (3 files)

| # | Component File | Prompt File(s) to Create | Entity Dependencies | AI Feature |
|---|------|------------|------------------|------------|
| 1 | `src/components/citizen/MergeDuplicatesDialog.jsx` | `utility/duplicateMerging.js` | `entities[]`, `similarities[]`, `mergeHistory[]` | AI merge suggestions, conflict resolution |
| 2 | `src/components/citizen/ResponseTemplates.jsx` | `utility/templateGeneration.js` | `context`, `templates[]`, `responseHistory[]` | AI template suggestions, personalization |
| 3 | `src/components/citizen/SLATracker.jsx` | `utility/slaRiskPrediction.js` | `slaItems[]`, `history[]`, `workload[]` | SLA breach prediction, prioritization |

---

## Detailed Prompt File Specifications

Following the Strategy Wizard pattern, all prompts are extracted to separate files. Below are the complete file specifications.

### 1. src/lib/ai/prompts/sandbox/sandboxEnhancement.js

```javascript
/**
 * Sandbox Enhancement AI Prompt
 * Used by: SandboxCreate.jsx, SandboxCreateWizard.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getSandboxEnhancementPrompt = (context) => {
  return `You are a regulatory sandbox expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${SAUDI_CONTEXT.COMPACT}

## CURRENT SANDBOX DATA
Name: ${context.name_en || 'Not provided'}
Name (Arabic): ${context.name_ar || 'Not provided'}
Domain: ${context.domain || 'Not specified'}
City: ${context.city?.name_en || 'Not selected'} / ${context.city?.name_ar || ''}
Managing Organization: ${context.organization?.name_en || 'Not selected'}
Current Description: ${context.description_en || 'Not provided'}

${BILINGUAL_INSTRUCTIONS}

## SPECIFIC REQUIREMENTS
Generate enhanced content for regulatory sandbox proposal:
1. Taglines: Compelling 10-15 word taglines suitable for Saudi government announcements
2. Descriptions: Comprehensive narratives (150+ words each language)
3. Objectives: Clear regulatory testing objectives aligned with Saudi innovation policy
4. Exemption Suggestions: Recommended regulatory exemptions for the sandbox

## REGULATORY CONTEXT
${SAUDI_CONTEXT.REGULATORY}`;
};

export const sandboxEnhancementSchema = {
  type: 'object',
  required: ['tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar'],
  properties: {
    tagline_en: { type: 'string', description: 'Compelling tagline in English (10-15 words)' },
    tagline_ar: { type: 'string', description: 'شعار مقنع بالعربية (10-15 كلمة)' },
    description_en: { type: 'string', minLength: 150, description: 'Comprehensive description in English' },
    description_ar: { type: 'string', minLength: 150, description: 'وصف شامل بالعربية' },
    objectives_en: { type: 'string', description: 'Clear regulatory testing objectives' },
    objectives_ar: { type: 'string', description: 'أهداف اختبار تنظيمية واضحة' },
    exemption_suggestions: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Recommended regulatory exemptions for sandbox'
    }
  }
};
```

**Component Usage (SandboxCreate.jsx):**
```javascript
import { getSandboxEnhancementPrompt, sandboxEnhancementSchema } from '@/lib/ai/prompts/sandbox';

const handleAIEnhancement = async () => {
  const context = {
    name_en: formData.name_en,
    name_ar: formData.name_ar,
    domain: formData.domain,
    city: cities.find(c => c.id === formData.city_id),
    organization: organizations.find(o => o.id === formData.organization_id),
    description_en: formData.description_en
  };
  
  const result = await invokeAI({
    prompt: getSandboxEnhancementPrompt(context),
    response_json_schema: sandboxEnhancementSchema
  });
  // ... handle result
};
```

---

### 2. src/lib/ai/prompts/pilot/pilotDetails.js

```javascript
/**
 * Pilot Details Enhancement AI Prompt
 * Used by: PilotEdit.jsx (section: 'details')
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getPilotDetailsPrompt = (context, pilotData) => {
  return `You are a pilot program expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${SAUDI_CONTEXT.COMPACT}

## CURRENT PILOT DATA
Title: ${pilotData.title_en} | ${pilotData.title_ar || 'N/A'}
Sector: ${context.sector?.name_en || pilotData.sector} | ${context.sector?.name_ar || ''}
Challenge: ${context.challenge?.title_en || 'Not linked'}
Description (EN): ${pilotData.description_en?.substring(0, 300) || 'N/A'}
Description (AR): ${pilotData.description_ar?.substring(0, 300) || 'N/A'}
Objective: ${pilotData.objective_en || 'N/A'}
Hypothesis: ${pilotData.hypothesis || 'N/A'}
Methodology: ${pilotData.methodology || 'N/A'}

${BILINGUAL_INSTRUCTIONS}

## SPECIFIC REQUIREMENTS
Enhance ALL text fields in BOTH English AND Arabic (فصحى formal):
- Titles: Compelling, sector-specific (max 80 chars each)
- Taglines: Memorable summaries (15-20 words each)
- Descriptions: Detailed narratives (200+ words each language)
- Objectives: Clear, measurable goals with bilingual text
- Hypothesis: Scientific format hypothesis statement
- Methodology: Step-by-step approach description
- Scope: Clear boundaries and limitations`;
};

export const pilotDetailsSchema = {
  type: 'object',
  required: ['title_en', 'title_ar', 'tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objective_en', 'objective_ar'],
  properties: {
    title_en: { type: 'string', maxLength: 80, description: 'Pilot title in English' },
    title_ar: { type: 'string', maxLength: 80, description: 'عنوان التجربة بالعربية' },
    tagline_en: { type: 'string', description: 'Memorable tagline in English (15-20 words)' },
    tagline_ar: { type: 'string', description: 'شعار تعريفي بالعربية (15-20 كلمة)' },
    description_en: { type: 'string', minLength: 200, description: 'Detailed description in English' },
    description_ar: { type: 'string', minLength: 200, description: 'وصف تفصيلي بالعربية' },
    objective_en: { type: 'string', description: 'Clear objective in English' },
    objective_ar: { type: 'string', description: 'هدف واضح بالعربية' },
    hypothesis: { type: 'string', description: 'Scientific hypothesis statement' },
    methodology: { type: 'string', description: 'Step-by-step methodology' },
    scope: { type: 'string', description: 'Pilot scope and boundaries' }
  }
};
```

---

### 3. src/lib/ai/prompts/pilot/pilotKpis.js

```javascript
/**
 * Pilot KPIs Generation AI Prompt
 * Used by: PilotEdit.jsx (section: 'kpis')
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getPilotKpisPrompt = (context, pilotData) => {
  return `You are a KPI specialist for Saudi municipal innovation pilots.

${SAUDI_CONTEXT.COMPACT}

## PILOT CONTEXT
Title: ${pilotData.title_en} | ${pilotData.title_ar || ''}
Sector: ${context.sector?.name_en || pilotData.sector}
Objective: ${pilotData.objective_en}
Duration: ${pilotData.duration_weeks || 12} weeks

${BILINGUAL_INSTRUCTIONS}

## SPECIFIC REQUIREMENTS
Generate 5-7 measurable KPIs for this pilot:
- Each KPI must have bilingual name and description
- Include baseline, target, and measurement frequency
- Balance outcome KPIs and process KPIs
- Align with Vision 2030 municipal excellence metrics
- Consider Saudi-specific data availability`;
};

export const pilotKpisSchema = {
  type: 'object',
  required: ['kpis'],
  properties: {
    kpis: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name_en', 'name_ar', 'baseline', 'target', 'unit'],
        properties: {
          name_en: { type: 'string', description: 'KPI name in English' },
          name_ar: { type: 'string', description: 'اسم المؤشر بالعربية' },
          description_en: { type: 'string', description: 'KPI description in English' },
          description_ar: { type: 'string', description: 'وصف المؤشر بالعربية' },
          baseline: { type: 'number', description: 'Current baseline value' },
          target: { type: 'number', description: 'Target value to achieve' },
          unit: { type: 'string', description: 'Measurement unit' },
          measurement_frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'quarterly'] }
        }
      }
    }
  }
};
```

---

### 4. src/lib/ai/prompts/pilot/index.js

```javascript
/**
 * Pilot Prompts Index
 * Exports all pilot-related prompts and schemas
 */
export { getPilotDetailsPrompt, pilotDetailsSchema } from './pilotDetails';
export { getPilotKpisPrompt, pilotKpisSchema } from './pilotKpis';
export { getPilotMilestonesPrompt, pilotMilestonesSchema } from './pilotMilestones';
export { getPilotRisksPrompt, pilotRisksSchema } from './pilotRisks';
export { getPilotTechnologyPrompt, pilotTechnologySchema } from './pilotTechnology';
export { getPilotEngagementPrompt, pilotEngagementSchema } from './pilotEngagement';
export { getPilotEvaluationPrompt, pilotEvaluationSchema } from './pilotEvaluation';
export { getPilotBenchmarkingPrompt, pilotBenchmarkingSchema } from './pilotBenchmarking';
export { getPilotScalingReadinessPrompt, pilotScalingReadinessSchema } from './pilotScalingReadiness';

// Prompt map for dynamic section loading (like Strategy Wizard)
export const PILOT_PROMPT_MAP = {
  details: { promptKey: 'getPilotDetailsPrompt', schemaKey: 'pilotDetailsSchema' },
  kpis: { promptKey: 'getPilotKpisPrompt', schemaKey: 'pilotKpisSchema' },
  milestones: { promptKey: 'getPilotMilestonesPrompt', schemaKey: 'pilotMilestonesSchema' },
  risks: { promptKey: 'getPilotRisksPrompt', schemaKey: 'pilotRisksSchema' },
  technology: { promptKey: 'getPilotTechnologyPrompt', schemaKey: 'pilotTechnologySchema' },
  engagement: { promptKey: 'getPilotEngagementPrompt', schemaKey: 'pilotEngagementSchema' },
  evaluation: { promptKey: 'getPilotEvaluationPrompt', schemaKey: 'pilotEvaluationSchema' }
};
```

---

### 5. src/lib/ai/prompts/matchmaker/partnershipAgreement.js

```javascript
/**
 * Partnership Agreement Generation AI Prompt
 * Used by: PilotConversionWizard.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getPartnershipAgreementPrompt = (context) => {
  return `You are a legal document specialist for Saudi municipal innovation partnerships.

${SAUDI_CONTEXT.COMPACT}

## PARTNERSHIP CONTEXT
Provider: ${context.organization?.name_en} | ${context.organization?.name_ar || ''}
Challenge: ${context.challenge?.title_en} | ${context.challenge?.title_ar || ''}
Municipality: ${context.municipality?.name_en || 'TBD'}
Pilot Objective: ${context.objective_en}
Duration: ${context.duration_weeks} weeks
Budget: ${context.budget} SAR

${BILINGUAL_INSTRUCTIONS}

## AGREEMENT SECTIONS (Bilingual Required)
Generate professional MOU content with ALL sections in BOTH English AND Arabic (فصحى formal):

1. Parties and Background (الأطراف والخلفية)
2. Scope of Collaboration (نطاق التعاون)
3. Roles and Responsibilities (الأدوار والمسؤوليات)
4. Duration and Milestones (المدة والمعالم الرئيسية)
5. Budget and Resource Allocation (الميزانية وتخصيص الموارد)
6. IP and Data Ownership (الملكية الفكرية وملكية البيانات)
7. Success Criteria (معايير النجاح)
8. Exit Clauses (بنود الخروج)

## LEGAL CONTEXT
Follow Saudi commercial contract standards.
Reference relevant Saudi municipal procurement regulations.
Align with MoMAH partnership frameworks.`;
};

export const partnershipAgreementSchema = {
  type: 'object',
  required: ['agreement_en', 'agreement_ar', 'key_terms_en', 'key_terms_ar'],
  properties: {
    agreement_en: { type: 'string', description: 'Full agreement text in English' },
    agreement_ar: { type: 'string', description: 'نص الاتفاقية الكامل بالعربية' },
    key_terms_en: { type: 'array', items: { type: 'string' }, description: 'Key terms summary in English' },
    key_terms_ar: { type: 'array', items: { type: 'string' }, description: 'ملخص البنود الرئيسية بالعربية' },
    effective_date: { type: 'string' },
    termination_conditions_en: { type: 'string' },
    termination_conditions_ar: { type: 'string' }
  }
};
```

---

### 6. src/lib/ai/prompts/citizen/ideaClassification.js

```javascript
/**
 * Citizen Idea Classification AI Prompt
 * Used by: AIIdeaClassifier.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getIdeaClassificationPrompt = (context) => {
  return `You are a citizen engagement specialist for Saudi municipal services.

${SAUDI_CONTEXT.COMPACT}

## IDEA DETAILS
Title: ${context.title}
Content: ${context.content || context.description || 'No description'}
Location: ${context.location || 'Not specified'}
Category: ${context.category || 'Not specified'}

${BILINGUAL_INSTRUCTIONS}

## CLASSIFICATION REQUIREMENTS
Analyze and classify this citizen idea with bilingual outputs:

1. Primary sector (use codes: ${SAUDI_CONTEXT.SECTORS.map(s => s.code).join(', ')})
2. Sector names in both languages
3. Keywords in BOTH English AND Arabic (5-10 relevant terms each)
4. Is it spam/low-quality? (true/false with reason)
5. Sentiment (positive_suggestion, neutral, complaint, urgent_issue)
6. Similar existing challenges (if any patterns detected)
7. Recommended priority (high/medium/low) with bilingual justification
8. Quality assessment (0-100 score)

## CONTEXT
Ideas should align with Quality of Life Program and municipal service improvement.
Consider Vision 2030 goals in classification.`;
};

export const ideaClassificationSchema = {
  type: 'object',
  required: ['sector', 'sector_en', 'sector_ar', 'keywords_en', 'keywords_ar', 'is_spam', 'sentiment', 'priority', 'quality_score'],
  properties: {
    sector: { type: 'string', description: 'Sector code' },
    sector_en: { type: 'string', description: 'Sector name in English' },
    sector_ar: { type: 'string', description: 'اسم القطاع بالعربية' },
    keywords_en: { type: 'array', items: { type: 'string' }, description: 'English keywords (5-10)' },
    keywords_ar: { type: 'array', items: { type: 'string' }, description: 'كلمات مفتاحية بالعربية (5-10)' },
    is_spam: { type: 'boolean' },
    spam_reason: { type: 'string', description: 'Reason if spam detected' },
    sentiment: { type: 'string', enum: ['positive_suggestion', 'neutral', 'complaint', 'urgent_issue'] },
    similar_patterns: { type: 'array', items: { type: 'string' } },
    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
    priority_justification_en: { type: 'string' },
    priority_justification_ar: { type: 'string' },
    quality_score: { type: 'number', minimum: 0, maximum: 100 }
  }
};
```

---

### 7. src/lib/ai/prompts/analysis/roiCalculation.js

```javascript
/**
 * ROI Calculation AI Prompt
 * Used by: ROICalculator.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getROICalculationPrompt = (context) => {
  return `You are a financial analyst for Saudi municipal innovation initiatives.

${SAUDI_CONTEXT.COMPACT}

## INITIATIVE DETAILS
Type: ${context.type}
Budget: ${context.budget} SAR
Sector: ${context.sector}
Duration: ${context.duration_months} months
Expected Outcome: ${context.expected_outcome}
Municipality: ${context.municipality?.name_en || 'All municipalities'}
Population Affected: ${context.population_affected || 'Not specified'}

${BILINGUAL_INSTRUCTIONS}

## CALCULATION REQUIREMENTS
Calculate expected ROI with bilingual outputs:
1. Cost-benefit analysis in SAR
2. Break-even timeline
3. 3-year projected ROI percentage
4. Risk-adjusted returns
5. Benchmark comparison (similar Saudi initiatives)
6. Key assumptions and risks
7. Bilingual executive summary and recommendation

Consider Saudi-specific factors:
- Vision 2030 strategic alignment bonus
- Municipal co-funding opportunities
- Digital transformation multipliers`;
};

export const roiCalculationSchema = {
  type: 'object',
  required: ['roi_percentage', 'break_even_months', 'npv', 'summary_en', 'summary_ar'],
  properties: {
    roi_percentage: { type: 'number', description: '3-year ROI percentage' },
    break_even_months: { type: 'number', description: 'Months to break even' },
    npv: { type: 'number', description: 'Net Present Value in SAR' },
    total_benefit: { type: 'number', description: 'Total projected benefit in SAR' },
    benefit_breakdown: {
      type: 'object',
      properties: {
        cost_savings: { type: 'number' },
        efficiency_gains: { type: 'number' },
        citizen_value: { type: 'number' },
        strategic_value: { type: 'number' }
      }
    },
    benchmark_comparison: { type: 'string', description: 'Comparison with similar initiatives' },
    key_assumptions: { type: 'array', items: { type: 'string' } },
    key_risks_en: { type: 'array', items: { type: 'string' } },
    key_risks_ar: { type: 'array', items: { type: 'string' } },
    summary_en: { type: 'string', description: 'Executive summary in English' },
    summary_ar: { type: 'string', description: 'ملخص تنفيذي بالعربية' },
    recommendation_en: { type: 'string' },
    recommendation_ar: { type: 'string' }
  }
};
```

---

### 8. src/lib/ai/prompts/scaling/costBenefitAnalysis.js

```javascript
/**
 * Scaling Cost-Benefit Analysis AI Prompt
 * Used by: ScalingCostBenefitAnalyzer.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getCostBenefitAnalysisPrompt = (context) => {
  return `You are a scaling strategist for Saudi municipal innovation programs.

${SAUDI_CONTEXT.COMPACT}

## PILOT DETAILS
Title: ${context.pilot?.title_en} | ${context.pilot?.title_ar || ''}
Current Budget: ${context.pilot?.budget} ${context.pilot?.budget_currency || 'SAR'}
Current Results: ${context.pilot?.kpis?.map(k => \`\${k.name}: \${k.current_value || k.current}\`).join(', ')}
Target Municipalities: ${context.targetMunicipalities?.length || 0} cities
Municipality Names: ${context.targetMunicipalities?.map(m => m.name_en).join(', ')}

${BILINGUAL_INSTRUCTIONS}

## ANALYSIS REQUIREMENTS
For scaling to ${context.targetMunicipalities?.length || 'multiple'} Saudi municipalities, estimate:
1. Total deployment cost (SAR)
2. Expected annual benefits (cost savings, efficiency gains)
3. Break-even point (months)
4. 3-year ROI percentage
5. Cost per municipality
6. Benefit variance (best/worst case scenarios)
7. Bilingual investment summary and recommendation

## SAUDI CONTEXT
Consider Saudi municipal procurement timelines.
Factor in Vision 2030 municipal transformation costs.
Account for regional variations across Saudi regions.`;
};

export const costBenefitAnalysisSchema = {
  type: 'object',
  required: ['total_cost', 'annual_benefit', 'break_even_months', 'three_year_roi'],
  properties: {
    total_cost: { type: 'number', description: 'Total deployment cost in SAR' },
    annual_benefit: { type: 'number', description: 'Annual benefit in SAR' },
    break_even_months: { type: 'number' },
    three_year_roi: { type: 'number' },
    cost_per_municipality: { type: 'number' },
    benefit_variance: {
      type: 'object',
      properties: {
        best_case: { type: 'number' },
        worst_case: { type: 'number' }
      }
    },
    investment_summary_en: { type: 'string', description: 'Investment summary in English' },
    investment_summary_ar: { type: 'string', description: 'ملخص الاستثمار بالعربية' },
    recommendation_en: { type: 'string' },
    recommendation_ar: { type: 'string' },
    cashflow_projection: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          month: { type: 'number' },
          cost: { type: 'number' },
          benefit: { type: 'number' }
        }
      }
    }
  }
};
```

---

### 9. src/lib/ai/prompts/index.js (Central Export)

```javascript
/**
 * Central AI Prompts Index
 * Exports all domain prompts for easy importing
 */

// Sandbox prompts
export * from './sandbox';

// Pilot prompts
export * from './pilot';

// Matchmaker prompts
export * from './matchmaker';

// Scaling prompts
export * from './scaling';

// Challenge prompts
export * from './challenge';

// Solution prompts
export * from './solution';

// R&D prompts
export * from './rd';

// Citizen prompts
export * from './citizen';

// Analysis prompts
export * from './analysis';

// Communication prompts
export * from './communication';

// Shared context
export { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from './saudiContext';
```

---

## Infrastructure Files

### 1. Create: src/lib/ai/saudiContext.js

```javascript
/**
 * Saudi Arabia / MoMAH Context Constants for AI Prompts
 */

export const SAUDI_CONTEXT = {
  FULL: `
## SAUDI ARABIA MUNICIPAL INNOVATION CONTEXT

### Ministry of Municipalities and Housing (MoMAH)
وزارة الشؤون البلدية والقروية والإسكان
MoMAH oversees 285+ municipalities across 13 regions, managing urban development,
infrastructure, and municipal services for 35+ million residents.

### Vision 2030 Alignment
All outputs must support Saudi Vision 2030 objectives:
- Quality of Life Program (برنامج جودة الحياة)
- National Transformation Program (برنامج التحول الوطني)
- Smart Cities Initiative
- Municipal Excellence Program
- Sustainability & Environmental Goals

### Key Partners in Innovation Ecosystem
- MCIT (Ministry of Communications): Digital transformation
- SDAIA: AI and data governance
- KAUST, KACST: Research partnerships
- NEOM, Red Sea Project: Mega project innovation
- Saudi Venture Capital Company
- Monsha'at (SME Authority)

### Cultural & Language Requirements
- Use formal Arabic (الفصحى) for all Arabic content
- Align with Saudi government communication standards
- Respect local customs and Islamic principles
- Provide bilingual outputs for diverse stakeholder engagement
`,

  COMPACT: `Saudi MoMAH innovation platform supporting Vision 2030. 
Partners: MCIT, SDAIA, KAUST. Use formal Arabic (فصحى) for government documents.
Align with Quality of Life Program and Municipal Excellence initiatives.`,

  REGULATORY: `Saudi regulatory sandbox framework aligned with:
- MCIT Digital Regulations
- CITC Telecommunications Standards
- SDAIA Data & AI Governance
- Municipal Excellence Guidelines`,

  SECTORS: [
    { code: 'transport', name_en: 'Transport & Mobility', name_ar: 'النقل والتنقل' },
    { code: 'environment', name_en: 'Environment & Sustainability', name_ar: 'البيئة والاستدامة' },
    { code: 'urban_design', name_en: 'Urban Design & Planning', name_ar: 'التصميم والتخطيط الحضري' },
    { code: 'digital_services', name_en: 'Digital Municipal Services', name_ar: 'الخدمات البلدية الرقمية' },
    { code: 'utilities', name_en: 'Utilities & Infrastructure', name_ar: 'المرافق والبنية التحتية' },
    { code: 'public_safety', name_en: 'Public Safety', name_ar: 'السلامة العامة' },
    { code: 'parks_recreation', name_en: 'Parks & Recreation', name_ar: 'الحدائق والترفيه' },
    { code: 'housing', name_en: 'Housing & Construction', name_ar: 'الإسكان والبناء' }
  ]
};

export const BILINGUAL_INSTRUCTIONS = `
## BILINGUAL OUTPUT REQUIREMENTS
Generate ALL text content in BOTH English AND Arabic:
- English: Professional, clear, suitable for international stakeholders
- Arabic: Formal Arabic (فصحى) suitable for Saudi government documents
- Ensure semantic equivalence between languages
- Use proper Arabic grammar and professional terminology
`;

export default SAUDI_CONTEXT;
```

### 2. Create: src/lib/ai/bilingualSchemaBuilder.js

```javascript
/**
 * Helper functions for building consistent bilingual JSON schemas
 */

/**
 * Creates a bilingual text field pair
 * @param {string} fieldName - Base field name (without _en/_ar suffix)
 * @param {object} options - Additional schema options
 */
export function bilingualTextField(fieldName, options = {}) {
  const { minLength, maxLength, description } = options;
  
  const baseProps = { type: 'string' };
  if (minLength) baseProps.minLength = minLength;
  if (maxLength) baseProps.maxLength = maxLength;
  
  return {
    [`${fieldName}_en`]: {
      ...baseProps,
      description: description || `${fieldName} in English`
    },
    [`${fieldName}_ar`]: {
      ...baseProps,
      description: `${fieldName} بالعربية`
    }
  };
}

/**
 * Creates a bilingual array field pair
 * @param {string} fieldName - Base field name
 * @param {object} itemSchema - Schema for array items
 */
export function bilingualArrayField(fieldName, itemSchema = { type: 'string' }) {
  return {
    [`${fieldName}_en`]: {
      type: 'array',
      items: itemSchema,
      description: `${fieldName} in English`
    },
    [`${fieldName}_ar`]: {
      type: 'array',
      items: itemSchema,
      description: `${fieldName} بالعربية`
    }
  };
}

/**
 * Creates a complete bilingual schema for common entity types
 * @param {string} entityType - Type of entity (pilot, sandbox, challenge, etc.)
 */
export function entityBilingualSchema(entityType) {
  const schemas = {
    pilot: {
      type: 'object',
      required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'objective_en', 'objective_ar'],
      properties: {
        ...bilingualTextField('title', { maxLength: 80 }),
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 150 }),
        ...bilingualTextField('objective'),
        hypothesis: { type: 'string' },
        methodology: { type: 'string' },
        scope: { type: 'string' }
      }
    },
    sandbox: {
      type: 'object',
      required: ['tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar'],
      properties: {
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 150 }),
        ...bilingualTextField('objectives'),
        exemption_suggestions: { type: 'array', items: { type: 'string' } }
      }
    },
    challenge: {
      type: 'object',
      required: ['title_en', 'title_ar', 'description_en', 'description_ar'],
      properties: {
        ...bilingualTextField('title', { maxLength: 100 }),
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 200 }),
        ...bilingualTextField('problem_statement'),
        ...bilingualTextField('desired_outcome')
      }
    },
    program: {
      type: 'object',
      required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar'],
      properties: {
        ...bilingualTextField('name'),
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 150 }),
        ...bilingualTextField('objectives')
      }
    }
  };
  
  return schemas[entityType] || null;
}

export default { bilingualTextField, bilingualArrayField, entityBilingualSchema };
```

---

## Testing & Verification

### Pre-Implementation Checklist

- [ ] Review each file's current AI prompt structure
- [ ] Identify all text fields that need bilingual output
- [ ] Map AI output fields to database columns
- [ ] Ensure schema enforces required bilingual fields

### Post-Implementation Verification

For each updated file, verify:

1. **Prompt Structure**
   - [ ] Includes SAUDI_CONTEXT or equivalent
   - [ ] Specifies bilingual requirements explicitly
   - [ ] Uses formal Arabic (فصحى) instruction

2. **Schema Completeness**
   - [ ] All text fields have `_en` and `_ar` pairs
   - [ ] Required array includes all bilingual pairs
   - [ ] Description fields are bilingual

3. **Database Mapping**
   - [ ] Output fields match database column names
   - [ ] Special cases handled (e.g., sandboxes.name vs name_en)
   - [ ] JSON fields properly structured

4. **UI Integration**
   - [ ] Both languages displayed where appropriate
   - [ ] RTL support for Arabic content
   - [ ] Language toggle works correctly

### Testing Script Template

```javascript
// Test bilingual AI output for [Component Name]
describe('Bilingual AI Output', () => {
  it('should return both _en and _ar fields', async () => {
    const result = await invokeAI({ prompt: testPrompt, schema: testSchema });
    
    expect(result.success).toBe(true);
    expect(result.data.title_en).toBeDefined();
    expect(result.data.title_ar).toBeDefined();
    expect(result.data.title_ar).toMatch(/[\u0600-\u06FF]/); // Contains Arabic
  });
});
```

---

## Implementation Priority & Timeline (EXPANDED)

### Phase 1: Infrastructure (Day 1)
- [ ] Create `src/lib/ai/prompts/saudiContext.js`
- [ ] Create `src/lib/ai/prompts/bilingualSchemaBuilder.js`
- [ ] Update existing prompt files to use shared context

### Phase 2: High-Priority Pages (Days 2-3)
- [ ] `SandboxCreate.jsx`
- [ ] `PilotEdit.jsx` (7 sections)
- [ ] `SolutionChallengeMatcher.jsx`
- [ ] `EmailTemplateManager.jsx`
- [ ] `RDPortfolioPlanner.jsx`
- [ ] `RiskPortfolio.jsx`

### Phase 3: Workflow Components (Days 4-6)
- [ ] All 23 workflow components listed in Priority 2
- [ ] Focus on matcher, scaling, and collaboration components

### Phase 4: Analysis Components (Days 7-8)
- [ ] All 10 analysis components listed in Priority 3
- [ ] Strategy cascade verification

### Phase 5: AI Core & Citizen Components (Days 9-11) - NEW
- [ ] 5 AI core components (Priority 4)
- [ ] 9 Citizen AI converters (Priority 5)
- [ ] Create all citizen/ prompt files

### Phase 6: R&D, Matchmaker & Utility Components (Days 12-15) - NEW
- [ ] 8 R&D AI components (Priority 6)
- [ ] 4 Matchmaker intelligence components (Priority 7)
- [ ] 5 Pages with AI (Priority 8)
- [ ] 6 Knowledge & utility AI (Priority 9)
- [ ] Final verification and testing

---

## Detailed Prompt Specifications for NEW Components

### citizen/ideaToChallenge.js
```javascript
/**
 * Citizen Idea to Challenge Conversion Prompt
 * Used by: IdeaToChallengeConverter.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getIdeaToChallengePrompt = (context, idea, relatedEntities = {}) => {
  const { sector, similarChallenges = [], strategicPlans = [] } = relatedEntities;
  
  return `You are a municipal innovation expert for Saudi Arabia's MoMAH.

${SAUDI_CONTEXT.COMPACT}

## CITIZEN IDEA TO CONVERT
Title: ${idea.title || 'Untitled'}
Description: ${idea.description || 'No description'}
Category: ${idea.category || 'Uncategorized'}
Location: ${idea.municipality_id ? 'Specified' : 'General'}
Tags: ${idea.tags?.join(', ') || 'None'}
Votes: ${idea.votes_count || 0}

## SECTOR CONTEXT
Sector: ${sector?.name_en || 'General'} | ${sector?.name_ar || ''}
Description: ${sector?.description_en || ''}

## SIMILAR EXISTING CHALLENGES (${similarChallenges.length} found)
${similarChallenges.slice(0, 5).map(c => 
  `- ${c.title_en} (${c.status}) - ${c.sector}`
).join('\n') || 'No similar challenges found'}

## STRATEGIC ALIGNMENT
${strategicPlans.map(p => `- ${p.name_en}: ${p.vision?.substring(0, 100)}...`).join('\n') || 'No linked plans'}

${BILINGUAL_INSTRUCTIONS}

## GENERATE CHALLENGE STRUCTURE
Convert this citizen idea into a formal municipal challenge with:
1. Professional bilingual titles (formal tone)
2. Problem statement in both languages
3. Current situation analysis
4. Desired outcomes
5. Estimated impact and priority
6. Suggested sector and category`;
};

export const ideaToChallengeSchema = {
  type: 'object',
  required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'problem_statement_en', 'problem_statement_ar'],
  properties: {
    title_en: { type: 'string', maxLength: 100, description: 'Professional challenge title' },
    title_ar: { type: 'string', maxLength: 100, description: 'عنوان التحدي الرسمي' },
    tagline_en: { type: 'string', description: 'Brief impactful tagline' },
    tagline_ar: { type: 'string', description: 'شعار موجز ومؤثر' },
    description_en: { type: 'string', minLength: 150, description: 'Comprehensive challenge description' },
    description_ar: { type: 'string', minLength: 150, description: 'وصف شامل للتحدي' },
    problem_statement_en: { type: 'string', description: 'Clear problem statement' },
    problem_statement_ar: { type: 'string', description: 'بيان المشكلة الواضح' },
    current_situation_en: { type: 'string', description: 'Current state analysis' },
    current_situation_ar: { type: 'string', description: 'تحليل الوضع الحالي' },
    desired_outcome_en: { type: 'string', description: 'Expected outcomes' },
    desired_outcome_ar: { type: 'string', description: 'النتائج المتوقعة' },
    suggested_sector: { type: 'string', description: 'Recommended sector' },
    suggested_category: { type: 'string', description: 'Recommended category' },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    estimated_impact_score: { type: 'number', minimum: 0, maximum: 100 }
  }
};
```

### rd/rdToPilot.js
```javascript
/**
 * R&D Project to Pilot Transition Prompt
 * Used by: RDToPilotTransition.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getRDToPilotPrompt = (context, rdProject, relatedEntities = {}) => {
  const { findings = [], municipality, sector } = relatedEntities;
  
  return `You are an innovation transfer specialist for Saudi Arabia's MoMAH.

${SAUDI_CONTEXT.COMPACT}

## R&D PROJECT DETAILS
Title: ${rdProject.title_en || ''} | ${rdProject.title_ar || ''}
Focus Area: ${rdProject.focus_area || 'General'}
Research Areas: ${rdProject.research_areas?.join(', ') || 'Not specified'}
Stage: ${rdProject.stage || 'Unknown'}
TRL Level: ${rdProject.trl || 'Not assessed'}

## KEY FINDINGS (${findings.length} total)
${findings.slice(0, 5).map(f => 
  `- ${f.title}: ${f.summary?.substring(0, 100)}...`
).join('\n') || 'No findings documented'}

## TARGET MUNICIPALITY
${municipality?.name_en || 'Not selected'} | ${municipality?.name_ar || ''}
Population: ${municipality?.population || 'N/A'}

## SECTOR CONTEXT
${sector?.name_en || 'General'} | ${sector?.name_ar || ''}

${BILINGUAL_INSTRUCTIONS}

## GENERATE PILOT PROPOSAL
Design a pilot project to test the R&D findings in a real municipal environment:
1. Clear hypothesis based on research findings
2. Measurable KPIs aligned with research outcomes
3. Realistic timeline and milestones
4. Risk assessment based on TRL level
5. Success criteria for scaling decision`;
};

export const rdToPilotSchema = {
  type: 'object',
  required: ['title_en', 'title_ar', 'hypothesis', 'objective_en', 'objective_ar'],
  properties: {
    title_en: { type: 'string', maxLength: 80, description: 'Pilot title' },
    title_ar: { type: 'string', maxLength: 80, description: 'عنوان التجربة' },
    tagline_en: { type: 'string', description: 'Brief tagline' },
    tagline_ar: { type: 'string', description: 'شعار موجز' },
    hypothesis: { type: 'string', description: 'Research-based hypothesis to test' },
    objective_en: { type: 'string', description: 'Pilot objectives' },
    objective_ar: { type: 'string', description: 'أهداف التجربة' },
    methodology: { type: 'string', description: 'Testing methodology' },
    duration_weeks: { type: 'number', minimum: 4, maximum: 52 },
    kpis: { 
      type: 'array', 
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          name_ar: { type: 'string' },
          baseline: { type: 'number' },
          target: { type: 'number' },
          unit: { type: 'string' }
        }
      }
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          likelihood: { type: 'string', enum: ['low', 'medium', 'high'] },
          mitigation_en: { type: 'string' },
          mitigation_ar: { type: 'string' }
        }
      }
    },
    success_criteria_en: { type: 'string' },
    success_criteria_ar: { type: 'string' }
  }
};
```

### matchmaker/successPrediction.js
```javascript
/**
 * Match Success Prediction Prompt
 * Used by: AIMatchSuccessPredictor.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getSuccessPredictionPrompt = (context, match, relatedEntities = {}) => {
  const { historicalMatches = [], organization, challenge } = relatedEntities;
  
  return `You are a matchmaking analytics expert for Saudi Arabia's MoMAH innovation platform.

${SAUDI_CONTEXT.COMPACT}

## CURRENT MATCH
Match Score: ${match.match_score || 'Not scored'}
Stage: ${match.stage || 'Initial'}

## ORGANIZATION PROFILE
Name: ${organization?.name_en || ''} | ${organization?.name_ar || ''}
Type: ${organization?.org_type || 'Unknown'}
Sectors: ${organization?.sectors?.join(', ') || 'Not specified'}
Previous Matches: ${organization?.previous_matches_count || 0}

## CHALLENGE DETAILS
Title: ${challenge?.title_en || ''} | ${challenge?.title_ar || ''}
Sector: ${challenge?.sector || 'General'}
Priority: ${challenge?.priority || 'medium'}
Budget: ${challenge?.budget_estimate || 'Not specified'}

## HISTORICAL MATCH OUTCOMES (${historicalMatches.length} total)
Success Rate: ${historicalMatches.filter(m => m.outcome === 'success').length / historicalMatches.length * 100 || 0}%
${historicalMatches.slice(0, 10).map(m => 
  `- ${m.organization_type} + ${m.challenge_sector}: ${m.outcome} (Score: ${m.final_score})`
).join('\n')}

${BILINGUAL_INSTRUCTIONS}

## PREDICT SUCCESS FACTORS
Analyze this match and predict:
1. Success probability (0-100%)
2. Key success factors
3. Risk factors that could derail the match
4. Recommendations to improve success likelihood
5. Expected time to successful outcome`;
};

export const successPredictionSchema = {
  type: 'object',
  required: ['success_probability', 'success_factors', 'risk_factors'],
  properties: {
    success_probability: { type: 'number', minimum: 0, maximum: 100 },
    confidence_level: { type: 'string', enum: ['low', 'medium', 'high'] },
    success_factors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          factor_en: { type: 'string' },
          factor_ar: { type: 'string' },
          weight: { type: 'number' }
        }
      }
    },
    risk_factors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      }
    },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    expected_duration_weeks: { type: 'number' },
    similar_successful_matches: { type: 'number' }
  }
};
```

---

## Detailed Prompt Specifications for Priority 10 (NEW AI Features)

### citizen/feedbackSentiment.js
```javascript
/**
 * Citizen Feedback Sentiment Analysis Prompt
 * Used by: CitizenFeedbackLoop.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getFeedbackSentimentPrompt = (context, feedbacks, relatedEntities = {}) => {
  const { entity, historicalSentiment = [] } = relatedEntities;
  
  return `You are a citizen engagement analyst for Saudi Arabia's MoMAH.

${SAUDI_CONTEXT.COMPACT}

## ENTITY CONTEXT
Type: ${entity?.type || 'Unknown'}
Title: ${entity?.title_en || ''} | ${entity?.title_ar || ''}

## FEEDBACK TO ANALYZE (${feedbacks.length} items)
${feedbacks.slice(0, 20).map((f, i) => 
  `${i+1}. [Rating: ${f.rating}/5] "${f.feedback_text?.substring(0, 200)}..."`
).join('\n')}

## HISTORICAL SENTIMENT TRENDS
${historicalSentiment.slice(0, 5).map(h => 
  `- ${h.period}: ${h.average_sentiment} (${h.feedback_count} responses)`
).join('\n') || 'No historical data'}

${BILINGUAL_INSTRUCTIONS}

## ANALYZE AND PROVIDE:
1. Overall sentiment score (0-100)
2. Key themes extracted (bilingual)
3. Positive highlights
4. Areas of concern
5. Recommended actions (bilingual)
6. Trend comparison with historical data`;
};

export const feedbackSentimentSchema = {
  type: 'object',
  required: ['sentiment_score', 'themes', 'summary_en', 'summary_ar'],
  properties: {
    sentiment_score: { type: 'number', minimum: 0, maximum: 100 },
    sentiment_label: { type: 'string', enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'] },
    themes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          theme_en: { type: 'string' },
          theme_ar: { type: 'string' },
          frequency: { type: 'number' },
          sentiment: { type: 'string' }
        }
      }
    },
    positive_highlights_en: { type: 'array', items: { type: 'string' } },
    positive_highlights_ar: { type: 'array', items: { type: 'string' } },
    concerns_en: { type: 'array', items: { type: 'string' } },
    concerns_ar: { type: 'array', items: { type: 'string' } },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    summary_en: { type: 'string' },
    summary_ar: { type: 'string' },
    trend_direction: { type: 'string', enum: ['improving', 'stable', 'declining'] }
  }
};
```

### rd/trlAssessment.js
```javascript
/**
 * TRL Assessment AI Prompt
 * Used by: TRLAssessmentWorkflow.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getTRLAssessmentPrompt = (context, rdProject, relatedEntities = {}) => {
  const { evidence = [], trlCriteria = [], assessmentHistory = [] } = relatedEntities;
  
  return `You are a Technology Readiness Level (TRL) assessment expert for Saudi R&D projects.

${SAUDI_CONTEXT.COMPACT}

## R&D PROJECT DETAILS
Title: ${rdProject.title_en || ''} | ${rdProject.title_ar || ''}
Focus Area: ${rdProject.focus_area || 'General'}
Current Stage: ${rdProject.stage || 'Unknown'}
Claimed TRL: ${rdProject.trl || 'Not specified'}

## EVIDENCE PROVIDED (${evidence.length} items)
${evidence.map(e => 
  `- ${e.type}: ${e.title} (${e.date})`
).join('\n') || 'No evidence submitted'}

## TRL CRITERIA (Saudi Standards)
${trlCriteria.map(c => 
  `TRL ${c.level}: ${c.description_en}`
).join('\n')}

## PREVIOUS ASSESSMENTS
${assessmentHistory.slice(0, 3).map(a => 
  `- ${a.date}: TRL ${a.level} by ${a.assessor}`
).join('\n') || 'First assessment'}

${BILINGUAL_INSTRUCTIONS}

## ASSESS AND PROVIDE:
1. Recommended TRL level (1-9)
2. Evidence gaps for each criterion
3. Justification for the assessment (bilingual)
4. Steps to reach next TRL level
5. Risk factors that could affect progression`;
};

export const trlAssessmentSchema = {
  type: 'object',
  required: ['recommended_trl', 'justification_en', 'justification_ar'],
  properties: {
    recommended_trl: { type: 'number', minimum: 1, maximum: 9 },
    confidence_level: { type: 'string', enum: ['low', 'medium', 'high'] },
    justification_en: { type: 'string', minLength: 100 },
    justification_ar: { type: 'string', minLength: 100 },
    evidence_assessment: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          status: { type: 'string', enum: ['met', 'partial', 'not_met'] },
          gap_description_en: { type: 'string' },
          gap_description_ar: { type: 'string' }
        }
      }
    },
    next_level_steps_en: { type: 'array', items: { type: 'string' } },
    next_level_steps_ar: { type: 'array', items: { type: 'string' } },
    risk_factors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          impact: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      }
    },
    estimated_time_to_next_trl: { type: 'string' }
  }
};
```

### utility/slaRiskPrediction.js
```javascript
/**
 * SLA Risk Prediction AI Prompt
 * Used by: SLATracker.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getSlaRiskPredictionPrompt = (context, slaItems, relatedEntities = {}) => {
  const { history = [], workload = [], capacity = [] } = relatedEntities;
  
  return `You are an SLA compliance analyst for Saudi Arabia's MoMAH.

${SAUDI_CONTEXT.COMPACT}

## ACTIVE SLA ITEMS (${slaItems.length} total)
${slaItems.map(s => 
  `- ${s.title}: Due ${s.deadline} | Priority: ${s.priority} | Progress: ${s.progress}%`
).join('\n')}

## HISTORICAL PERFORMANCE
On-time rate: ${history.filter(h => h.completed_on_time).length / history.length * 100 || 0}%
Average delay: ${history.reduce((acc, h) => acc + (h.delay_days || 0), 0) / history.length || 0} days

## CURRENT WORKLOAD
${workload.map(w => 
  `- ${w.team}: ${w.active_items} active, ${w.capacity}% capacity`
).join('\n') || 'No workload data'}

${BILINGUAL_INSTRUCTIONS}

## PREDICT AND PROVIDE:
1. Risk score for each SLA item (0-100)
2. Items likely to breach SLA
3. Root causes for potential breaches
4. Recommended prioritization (bilingual)
5. Mitigation actions (bilingual)`;
};

export const slaRiskPredictionSchema = {
  type: 'object',
  required: ['overall_risk_score', 'at_risk_items', 'recommendations_en', 'recommendations_ar'],
  properties: {
    overall_risk_score: { type: 'number', minimum: 0, maximum: 100 },
    at_risk_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item_id: { type: 'string' },
          risk_score: { type: 'number' },
          predicted_delay_days: { type: 'number' },
          root_cause_en: { type: 'string' },
          root_cause_ar: { type: 'string' }
        }
      }
    },
    priority_reorder: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item_id: { type: 'string' },
          new_priority: { type: 'number' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' }
        }
      }
    },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    capacity_alerts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          team: { type: 'string' },
          alert_en: { type: 'string' },
          alert_ar: { type: 'string' }
        }
      }
    }
  }
};
```

---

## Summary - CURRENT STATUS

### 📊 Overall Progress

| Metric | Completed | Remaining | Progress |
|--------|-----------|-----------|----------|
| **AI Components** | 53 | 195 | 21% |
| **Prompt Modules** | 15 | 13 | 54% |
| **Prompt Files** | 80 | ~120 | 40% |

### ✅ Completed Phases (1-15)

| Phase | Module | Status | Files |
|-------|--------|--------|-------|
| 1 | Foundation/Infrastructure | ✅ Complete | 6 files |
| 2 | Strategy Wizard | ✅ Complete | 6 files |
| 3 | Portfolio | ✅ Complete | 3 files |
| 4 | Events | ✅ Complete | 3 files |
| 5 | Challenges | ✅ Complete | 5 files |
| 6 | Pilots | ✅ Complete | 4 files |
| 7 | Matchmaker | ✅ Complete | 4 files |
| 8 | Sandbox | ✅ Complete | 3 files |
| 9 | R&D | ✅ Complete | 4 files |
| 10 | Scaling | ✅ Complete | 3 files |
| 11 | Solution | ✅ Complete | 5 files |
| 12 | Citizen | ✅ Complete | 4 files |
| 13 | Living Lab | ✅ Complete | 4 files |
| 14 | Profiles | ✅ Complete | 3 files |
| 15 | Programs | ✅ Complete | 3 files |

### ❌ Pending Phases (16-28)

| Phase | Module | Status | Est. Files |
|-------|--------|--------|------------|
| 16 | Root-Level Components | ⏳ Pending | 15 files |
| 17 | Strategy (remaining) | ⏳ Pending | 10 files |
| 18 | Solutions (remaining) | ⏳ Pending | 8 files |
| 19 | Challenges (remaining) | ⏳ Pending | 8 files |
| 20 | Taxonomy & MII | ⏳ Pending | 7 files |
| 21 | Executive & Communications | ⏳ Pending | 9 files |
| 22 | Collaboration & Partnerships | ⏳ Pending | 7 files |
| 23 | Approval & Content | ⏳ Pending | 8 files |
| 24 | Data & AI Uploader | ⏳ Pending | 6 files |
| 25 | Programs (remaining) | ⏳ Pending | 7 files |
| 26 | Workflows & Reports | ⏳ Pending | 6 files |
| 27 | Analytics & Knowledge | ⏳ Pending | 7 files |
| 28 | Other Modules | ⏳ Pending | ~70 files |

### Key Patterns to Follow

1. ✅ Always include `getSystemPrompt()` from `@/lib/saudiContext`
2. ✅ Enforce bilingual fields in schema with `required` array
3. ✅ Map output directly to database column names
4. ✅ Use formal Arabic (فصحى) specification
5. ✅ Include minLength for description fields (150+ words)
6. ✅ Fetch ALL related entities before invoking AI
7. ✅ Pass complete relatedEntities object to prompt functions
8. ✅ Add `useAIWithFallback` hook to all AI components
9. ✅ Include `AIStatusIndicator` for user feedback
10. ✅ Import prompts from `@/lib/ai/prompts/[module]/`

### New Prompt Modules Needed

```
src/lib/ai/prompts/
├── core/              # NEW - for root-level components
├── taxonomy/          # NEW
├── mii/               # NEW
├── executive/         # NEW
├── communications/    # NEW
├── collaboration/     # NEW
├── partnerships/      # NEW
├── approval/          # NEW
├── content/           # NEW
├── translation/       # NEW
├── data/              # NEW
├── workflows/         # NEW
├── reports/           # NEW
├── analytics/         # NEW
└── knowledge/         # NEW
```

---

## Changelog

### Version 5.0 (2025-12-17) - CURRENT STATUS UPDATE
- Updated status from "Ready for Implementation" to "IN PROGRESS (21%)"
- Added detailed list of 53 refactored components
- Added detailed list of 195 pending components by module
- Added progress tracking tables
- Updated phase structure (Phases 1-15 complete, 16-28 pending)
- Added new prompt modules needed section

### Version 4.0 (2025-12-17)
- Initial fully expanded plan with 100% coverage
- Defined all prompt file templates
- Mapped entity dependencies

---

*Document Version: 5.0 (STATUS UPDATE - 21% COMPLETE)*  
*Last Updated: 2025-12-17*  
*Refactored: 53/248 components (21%)*  
*Prompt Modules: 15 complete, ~13 remaining*
