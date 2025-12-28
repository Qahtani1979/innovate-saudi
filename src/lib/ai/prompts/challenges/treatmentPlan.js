/**
 * Treatment Plan Prompts
 * AI assistance for defining the innovation treatment plan
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TREATMENT_PLAN_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an Innovation Strategist.
Create a treatment plan for a challenge to guide it from problem to solution.
Define milestones, required resources, and a roadmap.
`;

export const treatmentPlanSchema = {
    type: "object",
    properties: {
        phases: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    duration_weeks: { type: "integer" },
                    objectives: { type: "array", items: { type: "string" } },
                    deliverables: { type: "array", items: { type: "string" } }
                }
            }
        },
        recommended_methodology: { type: "string", enum: ["agile", "waterfall", "design_thinking", "lean_startup"] },
        risk_factors: { type: "array", items: { type: "string" } }
    }
};

export const getTreatmentPlanPrompt = (challenge) => `
Create a treatment plan for:
"${challenge.title_en}"
Track: ${challenge.track || 'General'}

Return JSON with phases, recommended_methodology, and risk_factors.
`;
