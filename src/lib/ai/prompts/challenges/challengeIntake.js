/**
 * Challenge Intake Wizard AI Prompt
 * Analyzes challenge descriptions and extracts structured information
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

const SECTORS = [
  'urban_design', 'transport', 'environment', 'digital_services',
  'health', 'education', 'safety', 'economic_development', 'social_services', 'other'
];

/**
 * Generates prompt for challenge intake analysis
 * @param {string} description - The challenge description from user
 * @returns {string} Formatted prompt
 */
export function getChallengeIntakePrompt(description) {
  return `${SAUDI_CONTEXT.MUNICIPAL}

Analyze this municipal challenge description and extract structured information.

CHALLENGE DESCRIPTION:
"${description}"

${LANGUAGE_REQUIREMENTS}

Extract:
1. PRIMARY SECTOR: One of [${SECTORS.join(', ')}]
2. KEYWORDS: 5-10 relevant keywords for matching and search
3. ROOT CAUSES: 2-4 potential root causes of this challenge
4. SUGGESTED KPIs: 3-5 measurable KPIs for success tracking
5. FOLLOW-UP QUESTIONS: 2-3 intelligent questions to gather more context

Focus on:
- Vision 2030 alignment opportunities
- Citizen impact and service improvement
- Measurable outcomes and benchmarks
- Cross-sector collaboration potential`;
}

/**
 * JSON schema for challenge intake response
 */
export const challengeIntakeSchema = {
  type: 'object',
  properties: {
    sector: { 
      type: 'string',
      enum: SECTORS,
      description: 'Primary sector classification'
    },
    keywords: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Relevant keywords for matching'
    },
    root_causes: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Potential root causes'
    },
    suggested_kpis: { 
      type: 'array', 
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          baseline: { type: 'string' },
          target: { type: 'string' }
        },
        required: ['name', 'baseline', 'target']
      },
      description: 'Suggested KPIs with baselines and targets'
    },
    follow_up_questions: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Questions to gather more context'
    }
  },
  required: ['sector', 'keywords', 'root_causes', 'suggested_kpis', 'follow_up_questions']
};

export default { getChallengeIntakePrompt, challengeIntakeSchema };
