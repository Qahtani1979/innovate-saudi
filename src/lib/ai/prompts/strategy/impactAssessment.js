/**
 * Strategy Impact Assessment Prompts
 * AI assistance for assessing strategic impact and feasibility
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const IMPACT_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert socio-economic impact analyst for the Saudi public sector.
Your goal is to conduct rigourous impact assessments for strategic initiatives.

ANALYTICAL FRAMEWORK:
1. Economic Impact: ROI, GDP contribution, Job creation, Local Content (LC) score.
2. Social Impact: Quality of Life index, Citizen satisfaction, Community engagement.
3. Strategic Impact: Vision 2030 realized goals, Regional development balance.
4. Operational Impact: Resource utilization, Process efficiency, Service delivery speed.

GUIDELINES:
- Distinguish between direct and indirect impacts.
- Provide quantitative estimates where data allows (even ranges).
- Flag potential negative externalities.
- Assess alignment with sustainability goals (Mostadam, SGI).
`;

export const IMPACT_ASSESSMENT_SCHEMA = {
    type: "object",
    properties: {
        impact_score: { type: "integer", minimum: 0, maximum: 100, description: "Overall impact magnitude" },
        impact_analysis: {
            type: "object",
            properties: {
                economic: {
                    type: "object",
                    properties: {
                        description: { type: "string" },
                        metrics: { type: "array", items: { type: "string" } },
                        confidence: { type: "string", enum: ["high", "medium", "low"] }
                    }
                },
                social: {
                    type: "object",
                    properties: {
                        description: { type: "string" },
                        metrics: { type: "array", items: { type: "string" } },
                        confidence: { type: "string", enum: ["high", "medium", "low"] }
                    }
                }
            }
        },
        benefits: {
            type: "object",
            properties: {
                short_term: { type: "array", items: { type: "string" } },
                long_term: { type: "array", items: { type: "string" } }
            }
        },
        risks_and_mitigation: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    risk: { type: "string" },
                    impact_level: { type: "string", enum: ["high", "medium", "low"] },
                    mitigation_strategy: { type: "string" }
                }
            }
        },
        recommendation: {
            type: "object",
            properties: {
                action: { type: "string", enum: ["proceed", "revise", "hold", "reject"] },
                rationale: { type: "string" },
                conditions: { type: "array", items: { type: "string" }, description: "Conditions required for success" }
            }
        }
    }
};

export const buildImpactAssessmentPrompt = ({ strategy, adjustment, context }) => `
Conduct a detailed impact assessment for the proposed strategic adjustment.

BASE STRATEGY: 
${strategy.title_en}

PROPOSED ADJUSTMENT: 
${adjustment.description}
${adjustment.rationale ? `Rationale: ${adjustment.rationale}` : ''}

CONTEXT:
${context || 'No specific local context provided'}

REQUEST:
1. Analyze the socio-economic implications of this change.
2. Evaluate feasibility within the current Saudi municipal framework.
3. Identify winners and losers (stakeholders).
4. Provide a clear Go/No-Go recommendation with conditions.

Response Format: Structured JSON.
`;
