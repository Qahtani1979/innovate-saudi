/**
 * Strategy Wizard AI Prompts Index
 * Exports all step prompts and schemas for the strategic plan wizard
 * 
 * Structure:
 * - Steps 1-17: Full AI generation prompts with schemas
 * - Step 9 Single: "AI Add One" functionality for single objective generation
 * - Step 18: Review step (no AI prompts, uses AIStrategicPlanAnalyzer)
 */

// Step prompts (1-17)
export { getStep1Prompt, step1Schema } from './step1Context';
export { getStep2Prompt, step2Schema } from './step2Vision';
export { getStep3Prompt, step3Schema } from './step3Stakeholders';
export { getStep4Prompt, step4Schema } from './step4Pestel';
export { getStep5Prompt, step5Schema } from './step5Swot';
export { getStep6Prompt, step6Schema } from './step6Scenarios';
export { getStep7Prompt, step7Schema } from './step7Risks';
export { getStep8Prompt, step8Schema } from './step8Dependencies';
export { getStep9Prompt, step9Schema } from './step9Objectives';
export { getStep10Prompt, step10Schema } from './step10National';
export { getStep11Prompt, step11Schema } from './step11Kpis';
export { getStep12Prompt, step12Schema } from './step12Actions';
export { getStep13Prompt, step13Schema } from './step13Resources';
export { getStep14Prompt, step14Schema } from './step14Timeline';
export { getStep15Prompt, step15Schema } from './step15Governance';
export { getStep16Prompt, step16Schema } from './step16Communication';
export { getStep17Prompt, step17Schema } from './step17Change';

// Step 9 Single Objective ("AI Add One" functionality)
export { 
  generateSingleObjectivePrompt,
  SINGLE_OBJECTIVE_SCHEMA,
  SINGLE_OBJECTIVE_SYSTEM_PROMPT 
} from './step9ObjectivesSingle';

// Step 18 Review (documentation only, no prompts)
export { STEP18_REVIEW } from './step18Review';

/**
 * Step mapping for quick lookup
 */
export const STEP_PROMPT_MAP = {
  1: { key: 'context', getPrompt: 'getStep1Prompt', schema: 'step1Schema' },
  2: { key: 'vision', getPrompt: 'getStep2Prompt', schema: 'step2Schema' },
  3: { key: 'stakeholders', getPrompt: 'getStep3Prompt', schema: 'step3Schema' },
  4: { key: 'pestel', getPrompt: 'getStep4Prompt', schema: 'step4Schema' },
  5: { key: 'swot', getPrompt: 'getStep5Prompt', schema: 'step5Schema' },
  6: { key: 'scenarios', getPrompt: 'getStep6Prompt', schema: 'step6Schema' },
  7: { key: 'risks', getPrompt: 'getStep7Prompt', schema: 'step7Schema' },
  8: { key: 'dependencies', getPrompt: 'getStep8Prompt', schema: 'step8Schema' },
  9: { key: 'objectives', getPrompt: 'getStep9Prompt', schema: 'step9Schema', hasSingle: true },
  10: { key: 'national', getPrompt: 'getStep10Prompt', schema: 'step10Schema' },
  11: { key: 'kpis', getPrompt: 'getStep11Prompt', schema: 'step11Schema' },
  12: { key: 'actions', getPrompt: 'getStep12Prompt', schema: 'step12Schema' },
  13: { key: 'resources', getPrompt: 'getStep13Prompt', schema: 'step13Schema' },
  14: { key: 'timeline', getPrompt: 'getStep14Prompt', schema: 'step14Schema' },
  15: { key: 'governance', getPrompt: 'getStep15Prompt', schema: 'step15Schema' },
  16: { key: 'communication', getPrompt: 'getStep16Prompt', schema: 'step16Schema' },
  17: { key: 'change', getPrompt: 'getStep17Prompt', schema: 'step17Schema' },
  18: { key: 'review', hasPrompt: false, note: 'Uses AIStrategicPlanAnalyzer' },
};

/**
 * Get prompt function and schema for a given step number
 */
export const getStepPromptConfig = (stepNumber) => {
  return STEP_PROMPT_MAP[stepNumber] || null;
};

/**
 * Check if a step has AI generation capabilities
 */
export const stepHasAI = (stepNumber) => {
  const config = STEP_PROMPT_MAP[stepNumber];
  return config && config.hasPrompt !== false;
};
