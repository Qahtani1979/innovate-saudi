/**
 * Reprioritization Prompts
 * AI assistance for prioritizing strategic objectives
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const REPRIORITIZER_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert strategic planner and decision analyst.
Your goal is to prioritize strategic objectives based on:
- Strategic Importance (Weight)
- Resource Availability
- Quick Win Potential
- Risk Level
- Stakeholder Demand
`;

export const REPRIORITIZER_SCHEMA = {
    type: "object",
    properties: {
        suggested_order: { type: "array", items: { type: "string" } },
        top_3_reasoning: { type: "array", items: { type: "string" } },
        deprioritize: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    reason: { type: "string" }
                }
            }
        }
    }
};

export const buildReprioritizerPrompt = (items) => `
Analyze and re-prioritize the following objectives.

Objectives:
${JSON.stringify(items.map(i => ({
    name: i.name,
    importance: i.strategicImportance,
    resources: i.resourceAvailability,
    quick_win: i.quickWinPotential,
    risk: i.riskLevel,
    stakeholders: i.stakeholderDemand
})), null, 2)}

Requirements:
1. Suggest an optimal order (Name list)
2. Explain top 3 choices
3. Identify items to deprioritize (Low impact/High risk/Low resources)

Response Format: JSON
`;
