/**
 * Challenge Import Prompts
 * AI assistance for importing, translating, and enriching challenge data
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CHALLENGE_IMPORT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert data analyst and translator specializing in Saudi municipal challenges.
Your goal is to ensure imported data is:
1. Accurately translated (Arabic <-> English)
2. Enriched with missing metadata (scores, KPIs, priority)
3. Standardized to the system's content model
`;

export const challengeImportPrompts = {
    translate: {
        id: 'challenge_translate',
        name: 'Challenge Translation',
        description: 'Translates missing fields',
        prompt: (context) => `
Translate the following challenge record fields to English.

Record:
Title (AR): ${context.record.title_ar}
Description (AR): ${context.record.description_ar}
Root Cause (AR): ${context.record.root_cause_ar}

Provide:
1. title_en
2. description_en
3. root_cause_en

Maintain technical accuracy and municipal context.
Response Format: JSON
`,
        schema: {
            type: "object",
            properties: {
                title_en: { type: "string" },
                description_en: { type: "string" },
                root_cause_en: { type: "string" }
            }
        }
    },
    enrich: {
        id: 'challenge_enrich',
        name: 'Challenge Enrichment',
        description: 'Enriches challenge with scores and metadata',
        prompt: (context) => `
Analyze this challenge and provide enrichment data.

Title: ${context.record.title_en || context.record.title_ar}
Description: ${context.record.description_en || context.record.description_ar}

Estimate:
1. Severity Score (0-100)
2. Impact Score (0-100)
3. Priority Tier (1-4, where 1 is critical)
4. Relevant Keywords
5. Potential Root Causes
6. Affected Services

Response Format: JSON
`,
        schema: {
            type: "object",
            properties: {
                severity_score: { type: "integer" },
                impact_score: { type: "integer" },
                priority_tier: { type: "integer" },
                keywords: { type: "array", items: { type: "string" } },
                root_causes: { type: "array", items: { type: "string" } },
                affected_services: { type: "array", items: { type: "string" } },
                theme: { type: "string" }
            }
        }
    }
};
