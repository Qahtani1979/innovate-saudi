/**
 * Case Study Generator Prompts
 * Centralized prompts for case study generation
 * @module strategy/caseStudy
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for case study generation
 */
export const CASE_STUDY_SYSTEM_PROMPT = getSystemPrompt('strategy_case_study');

/**
 * Build prompt for generating comprehensive case study
 * @param {Object} entity - Entity data (pilot, solution, challenge, etc.)
 * @param {string} entityType - Type of entity
 * @returns {string} Formatted prompt
 */
export const buildCaseStudyPrompt = (entity, entityType) => `Generate a comprehensive case study for this municipal innovation ${entityType}:

Entity Details:
- Title: ${entity.title_en || entity.name_en}
- Description: ${entity.description_en || ''}
- Sector: ${entity.sector || ''}
- Status: ${entity.status || ''}
- Challenge Description: ${entity.problem_statement_en || entity.current_situation_en || ''}
- Solution: ${entity.desired_outcome_en || entity.solution_summary || ''}
- Impact: ${JSON.stringify(entity.kpis || entity.outcomes || [])}
- Lessons Learned: ${JSON.stringify(entity.lessons_learned || [])}

Create a professional case study with the following sections (in BOTH English and Arabic):
1. Executive Summary (2-3 sentences)
2. Challenge Description (what problem was addressed)
3. Solution Approach (what was implemented)
4. Implementation Process (key steps taken)
5. Results & Impact (measurable outcomes)
6. Key Success Factors (what made it work)
7. Lessons Learned (what can be replicated)
8. Recommendations (for similar initiatives)

Make it suitable for publication and knowledge sharing across Saudi municipalities.`;

/**
 * JSON schema for case study response
 */
export const CASE_STUDY_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    executive_summary_en: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    challenge_description_en: { type: 'string' },
    challenge_description_ar: { type: 'string' },
    solution_approach_en: { type: 'string' },
    solution_approach_ar: { type: 'string' },
    implementation_en: { type: 'string' },
    implementation_ar: { type: 'string' },
    results_en: { type: 'string' },
    results_ar: { type: 'string' },
    success_factors_en: { type: 'array', items: { type: 'string' } },
    success_factors_ar: { type: 'array', items: { type: 'string' } },
    lessons_learned_en: { type: 'array', items: { type: 'string' } },
    lessons_learned_ar: { type: 'array', items: { type: 'string' } },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    tags: { type: 'array', items: { type: 'string' } }
  }
};

/**
 * Build prompt for mini case study (quick summary)
 * @param {Object} entity - Entity data
 * @param {string} entityType - Type of entity
 * @returns {string} Formatted prompt
 */
export const buildMiniCaseStudyPrompt = (entity, entityType) => `Generate a brief case study summary for this ${entityType}:

Title: ${entity.title_en || entity.name_en}
Description: ${entity.description_en || ''}
Status: ${entity.status || ''}

Create a 100-word summary covering:
1. Challenge addressed
2. Solution implemented
3. Key results

Provide in BOTH English AND Arabic.`;

/**
 * JSON schema for mini case study
 */
export const MINI_CASE_STUDY_SCHEMA = {
  type: 'object',
  properties: {
    summary_en: { type: 'string' },
    summary_ar: { type: 'string' },
    key_result: { type: 'string' }
  }
};

/**
 * Case study prompts namespace
 */
export const CASE_STUDY_PROMPTS = {
  systemPrompt: CASE_STUDY_SYSTEM_PROMPT,
  buildPrompt: buildCaseStudyPrompt,
  schema: CASE_STUDY_SCHEMA,
  buildMiniPrompt: buildMiniCaseStudyPrompt,
  miniSchema: MINI_CASE_STUDY_SCHEMA
};

export default CASE_STUDY_PROMPTS;
