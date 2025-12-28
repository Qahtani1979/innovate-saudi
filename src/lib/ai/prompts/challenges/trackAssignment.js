/**
 * Track Assignment Prompts
 * AI assistance for assigning treatment tracks to challenges
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const TRACK_ASSIGNMENT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Innovation Portfolio Manager.
Your goal is to assign the optimal "Treatment Track" to minimize risk and maximize impact.

TRACK DEFINITIONS:
1. Pilot (Testing): Solution exists (TRL 7+) but needs validation in local context.
2. R&D (Research): No clear solution exists (TRL 1-6). Scientific research needed.
3. Program (Accelerator): Issue requires ecosystem building or capability development.
4. Procurement (Direct): Proven commercial solution exists off-the-shelf.
5. Policy (Regulation): Root cause is regulatory/legal, not technical.

CRITERIA:
- Technology Readiness Level (TRL)
- Risk Profile
- Time to Impact
- Budget Availability
`;

export const TRACK_ASSIGNMENT_SCHEMA = {
    type: "object",
    properties: {
        recommended_track: {
            type: "string",
            enum: ["pilot", "r_and_d", "program", "procurement", "policy"]
        },
        confidence_score: { type: "integer", minimum: 0, maximum: 100 },
        track_analysis: {
            type: "object",
            properties: {
                trl_assessment: { type: "string", description: "Estimated TRL level" },
                market_maturity: { type: "string", enum: ["emerging", "growth", "mature"] },
                regulatory_complexity: { type: "string", enum: ["high", "medium", "low"] }
            }
        },
        alternatives: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    track: { type: "string" },
                    pros: { type: "string" },
                    cons: { type: "string" }
                }
            }
        },
        resource_requirements: { type: "array", items: { type: "string" } }
    }
};

export const buildTrackAssignmentPrompt = ({ challenge }) => `
Assign a treatment track for this challenge.

CHALLENGE: 
${challenge.title_en}
${challenge.description_en}

CONTEXT:
Budget: ${challenge.budget || 'Unknown'}
Desired Timeline: ${challenge.timeline || 'Unknown'}

REQUEST:
1. Evaluate the Technology Readiness Level (TRL) implied by the problem.
2. Assess market availability of solutions.
3. Recommend the single best track.
4. Provide resource requirements for that track.

Response Format: Structured JSON.
`;
