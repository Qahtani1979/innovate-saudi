/**
 * Strategy Hooks - Centralized Index
 * ✅ GOLD STANDARD COMPLIANT
 * Last Updated: 2026-01-04
 */

// Phase 1: Pre-Planning Hooks
export { useSwotAnalysis } from './useSwotAnalysis';
export { useStakeholderAnalysis } from './useStakeholderAnalysis';
export { useRiskAssessment } from './useRiskAssessment';
export { useEnvironmentalFactors } from './useEnvironmentalFactors';
export { useStrategyBaselines } from './useStrategyBaselines';
export { useStrategyInputs } from './useStrategyInputs';

// Phase 2: Strategy Creation Hooks
export { useStrategyContext, checkObjectiveSimilarity, buildStrategyContextPrompt } from './useStrategyContext';
export { useStrategyMilestones } from './useStrategyMilestones';
export { useStrategyOwnership } from './useStrategyOwnership';
export { useActionPlans } from './useActionPlans';
export { useNationalAlignments } from './useNationalAlignments';
export { useSectorStrategies } from './useSectorStrategies';
export { useStrategyTemplates } from './useStrategyTemplates';

// Phase 3: Demand-Driven Hooks
export { useDemandQueue } from './useDemandQueue';
export { useGapAnalysis } from './useGapAnalysis';
export { useQueueAutoPopulation } from './useQueueAutoPopulation';
export { useQueueNotifications } from './useQueueNotifications';
export { useEntityGeneration } from './useEntityGeneration';

// Phase 4: Governance Hooks
export { useStrategySignoffs } from './useStrategySignoffs';
export { useStrategyVersions } from './useStrategyVersions';
export { useCommitteeDecisions } from './useCommitteeDecisions';

// Phase 4: AI Hooks
export { useSignoffAI } from './useSignoffAI';
export { useVersionAI } from './useVersionAI';
export { useCommitteeAI } from './useCommitteeAI';
export { useWorkflowAI } from './useWorkflowAI';

// Phase 5: Communication Hooks
export { useCommunicationPlans } from './useCommunicationPlans';
export { useImpactStories } from './useImpactStories';
export { useCommunicationNotifications } from './useCommunicationNotifications';
export { useCommunicationAI } from './useCommunicationAI';
export { useCommunicationAnalytics } from './useCommunicationAnalytics';
export { useCommunicationAudienceStats } from './useCommunicationAudienceStats';
export { useRecipientSelection } from './useRecipientSelection';

// Phase 6: Monitoring Hooks
export { useGlobalTrends, usePolicyDocuments } from './useStrategyTrends';
export { useStrategyImpactStats } from './useStrategyImpactStats';

// Phase 7: Evaluation Hooks
export { useStrategyEvaluation } from './useStrategyEvaluation';

// Phase 8: Recalibration Hooks
export { useStrategyRecalibration } from './useStrategyRecalibration';
export { useStrategyAdjustments } from './useStrategyAdjustments';

// Core Strategy Hooks
export { useStrategyAI } from './useStrategyAI';
export { useStrategyAutomation } from './useStrategyAutomation';
export { useStrategicPlanElements } from './useStrategicPlanElements';
export { useStrategyThemeGenerator } from './useStrategyThemeGenerator';

// Centralized Wizard AI Router
export { 
  useWizardAI, 
  usesSpecializedEdgeFunction, 
  getEdgeFunctionForStep, 
  getPromptKeyForStep,
  SAUDI_CONTEXT 
} from './useWizardAI';

// Utility Hooks
export { useFieldValidation, createValidationRules } from './useFieldValidation';
export { useAutoSaveDraft } from './useAutoSaveDraft';
export { useWizardValidation } from './useWizardValidation';
