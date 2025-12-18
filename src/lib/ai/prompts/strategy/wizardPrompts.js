/**
 * Strategy Create Wizard Prompts
 * AI prompts for strategy wizard step generation
 * @version 1.0.0
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const STRATEGY_WIZARD_SYSTEM_PROMPT = getSystemPrompt('strategy_wizard', `
You are a Saudi strategic planning expert. Provide content in English and Arabic.
${SAUDI_CONTEXT.FULL}
`);

/**
 * Build step-specific prompts for strategy wizard
 */
export function buildStrategyWizardPrompt(stepKey, context) {
  const { planName, vision, mission, sectors, themes, objectives } = context;
  
  const prompts = {
    vision: `Generate vision and mission for: ${planName}. Sectors: ${sectors?.join(', ') || 'General'}. Provide in English and Arabic.`,
    stakeholders: `Identify stakeholders for: ${planName}. Vision: ${vision || 'Not yet defined'}`,
    pestel: `PESTEL analysis for: ${planName} in Saudi Arabia context.`,
    swot: `SWOT analysis for: ${planName}`,
    scenarios: `Scenario planning for: ${planName}`,
    risks: `Risk assessment for: ${planName}`,
    objectives: `Strategic objectives for: ${planName}. Vision: ${vision || 'Not yet defined'}`,
    kpis: `KPIs for: ${planName}. Objectives: ${objectives?.map(o => o.title_en).join(', ') || 'General objectives'}`,
    actions: `Action plans for: ${planName}`
  };
  
  return prompts[stepKey] || `Generate content for ${stepKey} step of: ${planName}`;
}

export const STRATEGY_WIZARD_SCHEMAS = {
  vision: {
    type: 'object',
    properties: {
      vision_en: { type: 'string' },
      vision_ar: { type: 'string' },
      mission_en: { type: 'string' },
      mission_ar: { type: 'string' }
    }
  },
  stakeholders: {
    type: 'object',
    properties: {
      stakeholders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name_en: { type: 'string' },
            name_ar: { type: 'string' },
            role: { type: 'string' },
            influence: { type: 'string' },
            interest: { type: 'string' }
          }
        }
      }
    }
  },
  pestel: {
    type: 'object',
    properties: {
      political: { type: 'array', items: { type: 'string' } },
      economic: { type: 'array', items: { type: 'string' } },
      social: { type: 'array', items: { type: 'string' } },
      technological: { type: 'array', items: { type: 'string' } },
      environmental: { type: 'array', items: { type: 'string' } },
      legal: { type: 'array', items: { type: 'string' } }
    }
  },
  swot: {
    type: 'object',
    properties: {
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
      opportunities: { type: 'array', items: { type: 'string' } },
      threats: { type: 'array', items: { type: 'string' } }
    }
  },
  risks: {
    type: 'object',
    properties: {
      risks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            likelihood: { type: 'string' },
            impact: { type: 'string' },
            mitigation: { type: 'string' }
          }
        }
      }
    }
  },
  objectives: {
    type: 'object',
    properties: {
      objectives: {
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
  },
  kpis: {
    type: 'object',
    properties: {
      kpis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name_en: { type: 'string' },
            name_ar: { type: 'string' },
            baseline: { type: 'string' },
            target: { type: 'string' },
            frequency: { type: 'string' }
          }
        }
      }
    }
  },
  actions: {
    type: 'object',
    properties: {
      action_plans: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            owner: { type: 'string' },
            timeline: { type: 'string' },
            budget: { type: 'number' }
          }
        }
      }
    }
  }
};
