/**
 * Policy Analysis Prompt Module
 * Prompts for AI-powered policy analysis on detail pages
 * @module prompts/policy/analysis
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Policy analysis prompt with bilingual output
 */
export const POLICY_ANALYSIS_DETAIL_PROMPT = {
  system: `You are an AI policy analyst specializing in Saudi municipal governance.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.GOVERNMENT_TONE}

Analyze policies with:
- Bilingual output (English and Arabic)
- Complexity assessment
- Stakeholder impact analysis
- International precedents
- Implementation barriers and mitigations`,
  
  schema: {
    type: 'object',
    properties: {
      complexity: { type: 'string' },
      complexity_reason: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      },
      stakeholder_impact: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      },
      barriers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { 
              type: 'object',
              properties: { en: { type: 'string' }, ar: { type: 'string' } }
            },
            description: { 
              type: 'object',
              properties: { en: { type: 'string' }, ar: { type: 'string' } }
            }
          }
        }
      },
      success_probability: { type: 'number' },
      success_reasoning: { 
        type: 'object',
        properties: { en: { type: 'string' }, ar: { type: 'string' } }
      },
      international_precedents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            city: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
            country: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
            outcome: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
          }
        }
      },
      quick_wins: { 
        type: 'array', 
        items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
      },
      long_term_benefits: { 
        type: 'array', 
        items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
      },
      mitigation_strategies: { 
        type: 'array', 
        items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
      }
    }
  }
};

/**
 * Template for policy analysis prompt
 */
export const POLICY_ANALYSIS_DETAIL_PROMPT_TEMPLATE = (policy) => ({
  ...POLICY_ANALYSIS_DETAIL_PROMPT,
  prompt: `🚨 MANDATORY: ALL text must be bilingual {"en": "...", "ar": "..."}

Policy: ${policy.title_en}
Recommendation: ${policy.recommendation_text_en}
Arabic: ${policy.recommendation_text_ar}
Framework: ${policy.regulatory_framework}

YOU MUST return this EXACT structure with bilingual text:

{
  "complexity": "medium",
  "complexity_reason": {
    "en": "Requires coordination between multiple stakeholders...",
    "ar": "يتطلب التنسيق بين عدة أصحاب مصلحة..."
  },
  "stakeholder_impact": {
    "en": "Affects local businesses and citizens...",
    "ar": "يؤثر على الشركات المحلية والمواطنين..."
  },
  "barriers": [
    {
      "type": {"en": "Financial", "ar": "مالي"},
      "description": {"en": "High costs", "ar": "تكاليف عالية"}
    }
  ],
  "success_probability": 75,
  "success_reasoning": {
    "en": "Strong legal framework...",
    "ar": "إطار قانوني قوي..."
  },
  "international_precedents": [
    {
      "city": {"en": "Dubai", "ar": "دبي"},
      "country": {"en": "UAE", "ar": "الإمارات"},
      "outcome": {"en": "40% reduction", "ar": "انخفاض 40%"}
    }
  ],
  "quick_wins": [
    {"en": "Awareness campaign", "ar": "حملة توعية"}
  ],
  "long_term_benefits": [
    {"en": "Safer cities", "ar": "مدن أكثر أماناً"}
  ],
  "mitigation_strategies": [
    {"en": "Phased rollout", "ar": "نشر تدريجي"}
  ]
}`
});

export default {
  POLICY_ANALYSIS_DETAIL_PROMPT,
  POLICY_ANALYSIS_DETAIL_PROMPT_TEMPLATE
};
