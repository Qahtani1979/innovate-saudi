/**
 * Strategy Wizard Prompts
 * @module strategy/wizard
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const STRATEGY_WIZARD_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are an expert in Saudi Arabian strategic planning and Vision 2030. Generate professional content in both English and Arabic. Use formal language appropriate for government documents.`;

export const STRATEGY_CREATE_SYSTEM_PROMPT = 'You are a Saudi strategic planning expert. Provide content in English and Arabic.';

export const buildStrategyWizardPrompts = (context) => ({
  vision: `Generate vision and mission statements for: ${context.planName}`,
  stakeholders: `Identify stakeholders for: ${context.planName}`,
  pestel: `PESTEL analysis for: ${context.planName}`,
  swot: `SWOT analysis for: ${context.planName}`,
  scenarios: `Scenario planning for: ${context.planName}`,
  risks: `Risk assessment for: ${context.planName}`,
  objectives: `Strategic objectives for: ${context.planName}. Vision: ${context.vision}`,
  kpis: `KPIs for: ${context.planName}. Objectives: ${context.objectives?.map(o => o.title_en).join(', ') || ''}`,
  actions: `Action plans for: ${context.planName}`
});

export const buildStrategyWizardPrompt = (stepKey, context) => {
  const prompts = buildStrategyWizardPrompts(context);
  return prompts[stepKey] || `Generate content for ${stepKey} step of: ${context.planName}`;
};

export const STRATEGY_WIZARD_PROMPTS = {
  wrapper: {
    systemPrompt: STRATEGY_WIZARD_SYSTEM_PROMPT,
    buildPrompt: buildStrategyWizardPrompt
  },
  create: {
    systemPrompt: STRATEGY_CREATE_SYSTEM_PROMPT,
    buildPrompt: buildStrategyWizardPrompt
  }
};

export default STRATEGY_WIZARD_PROMPTS;
