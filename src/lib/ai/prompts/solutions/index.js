/**
 * Solutions AI prompts index
 * @version 1.4.0
 */

export {
  SOLUTION_MATCHING_SYSTEM_PROMPT,
  buildSolutionMatchingPrompt,
  SOLUTION_MATCHING_SCHEMA,
  SOLUTION_EVALUATION_SYSTEM_PROMPT,
  buildSolutionEvaluationPrompt,
  SOLUTION_EVALUATION_SCHEMA
} from './solutionMatching';

export {
  DEPLOYMENT_SUCCESS_SYSTEM_PROMPT,
  buildDeploymentSuccessPrompt,
  DEPLOYMENT_SUCCESS_SCHEMA,
  SOLUTION_ROI_SYSTEM_PROMPT,
  buildSolutionROIPrompt,
  SOLUTION_ROI_SCHEMA,
  IDEA_TO_SOLUTION_SYSTEM_PROMPT,
  buildIdeaToSolutionPrompt,
  IDEA_TO_SOLUTION_SCHEMA
} from './deploymentSuccess';

export {
  SOLUTION_TO_PILOT_SYSTEM_PROMPT,
  createSolutionToPilotPrompt,
  SOLUTION_TO_PILOT_SCHEMA
} from './solutionToPilot';

export {
  CONTRACT_TEMPLATE_SYSTEM_PROMPT,
  buildContractTemplatePrompt,
  CONTRACT_TEMPLATE_SCHEMA,
  CONTRACT_TEMPLATE_PROMPTS
} from './contractTemplate';

export {
  MARKET_INTELLIGENCE_SYSTEM_PROMPT,
  buildMarketIntelligencePrompt,
  MARKET_INTELLIGENCE_SCHEMA,
  MARKET_INTELLIGENCE_PROMPTS
} from './marketIntelligence';
