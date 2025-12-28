/**
 * Impact Report Prompts
 * AI assistance for generating comprehensive impact reports
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const IMPACT_REPORT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Impact Storyteller for the public sector.
Your goal is to transform dry data into compelling narratives of success.

FOCUS AREAS:
1. Human Impact: How did this improve lives?
2. Efficiency: Time/Money saved for the municipality.
3. Innovation: What new capabilities were built?
4. Scalability: Potential for national rollout.

GUIDELINES:
- Use data to support the story, not just as a list.
- Highlight "Before vs. After" scenarios.
- Align with Vision 2030 Quality of Life indicators.
`;

export const IMPACT_REPORT_SCHEMA = {
    type: "object",
    properties: {
        executive_summary: { type: "string" },
        impact_metrics: {
            type: "object",
            properties: {
                roi_percentage: { type: "string" },
                cost_savings: { type: "string" },
                citizens_impacted: { type: "string" },
                satisfaction_improvement: { type: "string" }
            }
        },
        success_story: {
            type: "object",
            properties: {
                title: { type: "string" },
                narrative: { type: "string", description: "300-word compelling story" },
                key_quote_draft: { type: "string", description: "Draft quote for a stakeholder" }
            }
        },
        visual_assets_suggestions: {
            type: "array",
            items: { type: "string", description: "e.g., 'Bar chart showing 50% reduction in wait time'" }
        },
        strategic_alignment_highlight: { type: "string" },
        scalability_roadmap: { type: "array", items: { type: "string" } }
    }
};

export const buildImpactReportPrompt = ({ challenge, pilots, contracts }) => `
Generate an impact report for this completed challenge.

CHALLENGE: ${challenge.title_en}
OUTCOME: ${challenge.status}

DATA:
Pilots: ${pilots.length}
Contracts: ${contracts.length}
Key Metrics: ${JSON.stringify(challenge.impact_metrics || {})}

REQUEST:
1. Draft an Executive Summary suitable for senior leadership.
2. Create a "Success Story" narrative focusing on human impact.
3. Suggest visual assets to visualize the data.
4. Highlight alignment with Vision 2030 targets.

Response Format: Structured JSON.
`;
