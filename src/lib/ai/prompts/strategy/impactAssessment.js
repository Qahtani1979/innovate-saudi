/**
 * Strategy Impact Assessment Prompts
 * AI assistance for assessing strategic impact
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IMPACT_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert socio-economic analyst.
Your goal is to assess the potential impact of strategic adjustments.
Analyze:
- Socio-economic benefits
- Strategic goal alignment
- Implementation feasibility
`;

export const IMPACT_ASSESSMENT_SCHEMA = {
    type: "object",
    properties: {
        impact_score: { type: "integer" },
        benefits: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } },
        recommendation: { type: "string" }
    }
};

export const buildImpactAssessmentPrompt = ({ strategy, adjustment }) => `
Assess the impact of the following adjustment:

Strategy: ${strategy.title_en}
Adjustment: ${adjustment.description}

Requirements:
1. Estimate socio-economic impact.
2. Identify potential risks.
3. Provide a recommendation (Proceed/Revise/Reject).

Response Format: JSON
`;
