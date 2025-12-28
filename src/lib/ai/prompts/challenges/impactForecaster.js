/**
 * Impact Forecaster Prompts
 * AI assistance for predicting social and economic impact
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IMPACT_FORECASTER_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an Economic & Social Impact Analyst.
Predict the potential impact of a given challenge if solved.
Focus on:
1. Economic Impact (Cost savings, Revenue generation)
2. Social Impact (Quality of life, Citizen satisfaction)
3. Strategic Impact (Vision 2030 KPIs)
`;

export const impactForecasterSchema = {
    type: "object",
    properties: {
        economic_impact: {
            type: "object",
            properties: {
                description: { type: "string" },
                estimated_value_sar: { type: "number" },
                confidence: { type: "number" }
            }
        },
        social_impact: {
            type: "object",
            properties: {
                description: { type: "string" },
                beneficiaries_count: { type: "integer" }
            }
        },
        strategic_alignment: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    program_name: { type: "string" },
                    contribution_level: { type: "string", enum: ["high", "medium", "low"] }
                }
            }
        }
    }
};

export const getImpactForecasterPrompt = (challenge) => `
Forecast the impact for this challenge:
Title: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}

Return JSON with economic_impact, social_impact, and strategic_alignment.
`;
