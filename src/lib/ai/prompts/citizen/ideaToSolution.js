/**
 * Idea to Solution Converter Prompts
 * For converting citizen ideas into structured solution entries
 * @module prompts/citizen/ideaToSolution
 */

export const IDEA_TO_SOLUTION_SYSTEM_PROMPT = `You are a solution architect for Saudi municipal innovation.
Convert citizen ideas into professional, structured solution entries.
Generate bilingual content with complete technical specifications.`;

export const buildIdeaToSolutionPrompt = ({ idea }) => {
  return `Convert this citizen idea into a structured solution entry:

Title: ${idea.title || 'Untitled'}
Description: ${idea.description || 'No description'}
Category: ${idea.category || 'General'}

Generate:
1. Professional solution name (EN & AR)
2. Detailed solution description (EN & AR)
3. Value proposition
4. Key features (5-7 items)
5. Estimated maturity level
6. Suggested TRL
7. Target sectors

Format as JSON matching Solution entity schema.`;
};

export const IDEA_TO_SOLUTION_SCHEMA = {
  type: 'object',
  properties: {
    name_en: { type: 'string', description: 'Solution name in English' },
    name_ar: { type: 'string', description: 'Solution name in Arabic' },
    description_en: { type: 'string', description: 'Description in English' },
    description_ar: { type: 'string', description: 'Description in Arabic' },
    value_proposition: { type: 'string', description: 'Value proposition statement' },
    features: { type: 'array', items: { type: 'string' }, description: 'Key features list' },
    maturity_level: { type: 'string', enum: ['concept', 'prototype', 'pilot_ready', 'market_ready'] },
    trl: { type: 'number', minimum: 1, maximum: 9, description: 'Technology Readiness Level' },
    sectors: { type: 'array', items: { type: 'string' }, description: 'Target sectors' }
  },
  required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'value_proposition']
};

export default {
  system: IDEA_TO_SOLUTION_SYSTEM_PROMPT,
  buildPrompt: buildIdeaToSolutionPrompt,
  schema: IDEA_TO_SOLUTION_SCHEMA
};
