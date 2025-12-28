/**
 * Impact Report Prompts
 * AI assistance for generating impact reports
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IMPACT_REPORT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert impact analyst.
Your goal is to generate comprehensive impact reports for completed innovation challenges.
Focus on:
- Quantitative Metrics (ROI, Usage)
- Qualitative Benefits (User Satisfaction)
- Strategic Alignment
- Future Scalability
`;

export const IMPACT_REPORT_SCHEMA = {
    type: "object",
    properties: {
        impact_summary: { type: "string" },
        metrics_highlight: { type: "array", items: { type: "string" } },
        roi_analysis: { type: "string" },
        scalability_potential: { type: "string" }
    }
};

export const buildImpactReportPrompt = ({ challenge, pilots, contracts }) => `
Generate an impact report for the following completed challenge:

Challenge: ${challenge.title_en}
Description: ${challenge.description_en}

Pilots Conducted: ${pilots.length}
Contracts Awarded: ${contracts.length}

Requirements:
1. Summary of Impact
2. Metrics Calculation (Estimate ROI if data missing)
3. Scalability Assessment

Response Format: JSON
`;
