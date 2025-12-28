/**
 * Strategy Adjustment Prompts
 * AI assistance for justifying and analyzing strategic changes
 */

import { getSystemPrompt } from '@/lib/saudiContext';

// Justification Prompts
export const ADJUSTMENT_JUSTIFICATION_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert strategic consultant.
Your goal is to draft professional justifications for changes to strategic plans.
Focus on:
- Alignment with organizational goals
- Response to external factors (PESTLE)
- Resource optimization
`;

export const ADJUSTMENT_JUSTIFICATION_SCHEMA = {
    type: "object",
    properties: {
        justification: { type: "string" }
    }
};

export const buildAdjustmentJustificationPrompt = (data) => `
Draft a justification for the following strategic change:

Element: ${data.elementName} (${data.elementType})
Change: ${data.changeType}
Current: ${data.currentValue}
New: ${data.newValue}

Requirement: Professional, concise, and persuasive.
Response Format: JSON
`;

// Impact Analysis Prompts
export const ADJUSTMENT_IMPACT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert risk and impact analyst.
Your goal is to analyze the downstream effects of strategic changes.
Assess impact on:
- Budget
- Timeline
- Stakeholders
- Risks
`;

export const ADJUSTMENT_IMPACT_SCHEMA = {
    type: "object",
    properties: {
        recommended_level: { type: "string", enum: ["high", "medium", "low"] },
        budget_impact: { type: "string" },
        timeline_impact: { type: "string" },
        affected_entities: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } }
    }
};

export const buildAdjustmentImpactPrompt = (data) => `
Analyze the impact of this change:

Element: ${data.elementName}
Change: ${data.changeType} (${data.currentValue} -> ${data.newValue})
Justification: ${data.justification}

Analyze:
1. Impact Level (High/Medium/Low)
2. Budget & Timeline implications
3. Risks

Response Format: JSON
`;
