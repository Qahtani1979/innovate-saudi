/**
 * Strategy Wizard AI Prompts Index
 * Exports all step prompts and schemas for the strategic plan wizard
 */

export { getStep1Prompt, step1Schema } from './step1Context';
export { getStep2Prompt, step2Schema } from './step2Vision';
export { getStep3Prompt, step3Schema } from './step3Stakeholders';
export { getStep4Prompt, step4Schema } from './step4Pestel';
export { getStep5Prompt, step5Schema } from './step5Swot';
export { getStep6Prompt, step6Schema } from './step6Scenarios';
export { getStep7Prompt, step7Schema } from './step7Risks';
export { getStep8Prompt, step8Schema } from './step8Dependencies';

// Steps 9-17 prompts will be added in subsequent updates
// For now, they remain inline in StrategyWizardWrapper.jsx

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
};
