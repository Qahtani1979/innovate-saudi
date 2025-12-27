/**
 * Solution Enhancement Prompts
 * @version 1.0.0
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

// 1. System Prompt
export const SOLUTION_CONSULTANT_SYSTEM_PROMPT = getSystemPrompt('solution_consultant', `
You are an expert innovation consultant specializing in Saudi Arabia's municipal sector.
Your goal is to refine innovation solutions to align with professional standards and Vision 2030.
${SAUDI_CONTEXT.VISION_2030}
`);

// 2. Enhancement Prompt
export const enhancementPrompts = {
    enhanceDetails: {
        id: 'solution_enhancer_details',
        name: 'Solution Detail Enhancer',
        description: 'Refines solution title, description, and metadata',

        prompt: (context) => `
Analyze this innovation solution and provide BILINGUAL (Arabic + English) structured output.

Current data:
Name EN: ${context.formData.name_en}
Name AR: ${context.formData.name_ar}
Description EN: ${context.formData.description_en}
Description AR: ${context.formData.description_ar}
Provider: ${context.formData.provider_name}

${context.challenges && context.challenges.length > 0 ? `
Available Challenges (analyze and match to this solution):
${context.challenges.slice(0, 20).map(c => `
- Code: ${c.code}
  Title: ${c.title_en}
  Sector: ${c.sector}
  Description: ${c.description_en?.substring(0, 150)}
`).join('\n')}

Task: Analyze the solution and identify which challenges it could address.
Return an array of challenge codes that match.
` : ''}

Generate comprehensive enhancement:
1. Refined names (AR + EN) - concise, professional
2. Improved descriptions (AR + EN) - detailed, 200+ words
3. Taglines (AR + EN) - catchy one-liners
4. Value proposition - clear benefit statement
5. Features (5-8 key features)
6. Use cases (3-5 use cases with title, description, sector)
7. Technology stack (array of technologies used)
8. Sectors (array of applicable sectors)
9. TRL level (1-9)
10. Matched challenge codes (if applicable)
`,
        schema: {
            type: 'object',
            properties: {
                refined_name_en: { type: 'string' },
                refined_name_ar: { type: 'string' },
                improved_description_en: { type: 'string' },
                improved_description_ar: { type: 'string' },
                tagline_en: { type: 'string' },
                tagline_ar: { type: 'string' },
                value_proposition: { type: 'string' },
                features: { type: 'array', items: { type: 'string' } },
                use_cases: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            sector: { type: 'string' }
                        }
                    }
                },
                technology_stack: { type: 'array', items: { type: 'string' } },
                sectors: { type: 'array', items: { type: 'string' } },
                trl: { type: 'number' },
                matched_challenge_codes: { type: 'array', items: { type: 'string' } }
            }
        }
    }
};
