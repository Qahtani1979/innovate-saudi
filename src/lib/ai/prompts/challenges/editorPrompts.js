/**
 * Challenge Editor Prompts
 * AI assistance for enhancing existing challenge definitions
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CHALLENGE_EDITOR_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert editor for municipal innovation challenges.
Your goal is to refine and enhance challenge descriptions to be:
1. Clear and professional (English & Arabic)
2. Actionable for solvers
3. Aligned with standard innovation terminology
4. Complete with missing metadata (scores, KPIs, etc.)
`;

export const challengeEditorPrompts = {
    enhance: {
        id: 'challenge_enhance',
        name: 'Challenge Enhancement',
        description: 'Improves clarity and completeness of challenge data',
        prompt: (context) => `
Review and enhance the following challenge data.

Current Data:
Title (EN): ${context.formData.title_en}
Title (AR): ${context.formData.title_ar}
Description (EN): ${context.formData.description_en}
Description (AR): ${context.formData.description_ar}
Sector: ${context.sector || 'Unknown'}

Provide improvements for:
1. refined_title_en / refined_title_ar (more professional)
2. improved_description_en / improved_description_ar (clearer, structure)
3. problem_statement_en / problem_statement_ar (if missing or weak)
4. suggested_kpis (if missing)
5. impact & severity scores (estimate based on description)

Response Format: JSON
`,
        schema: {
            type: "object",
            properties: {
                refined_title_en: { type: "string" },
                refined_title_ar: { type: "string" },
                improved_description_en: { type: "string" },
                improved_description_ar: { type: "string" },
                problem_statement_en: { type: "string" },
                problem_statement_ar: { type: "string" },
                severity_score: { type: "integer" },
                impact_score: { type: "integer" },
                suggested_kpis: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name_en: { type: "string" },
                            name_ar: { type: "string" },
                            target: { type: "string" }
                        }
                    }
                }
            }
        }
    }
};
