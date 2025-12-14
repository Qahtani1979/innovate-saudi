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

// Phase 7: Evaluation Hooks
export { useStrategyEvaluation } from './useStrategyEvaluation';
