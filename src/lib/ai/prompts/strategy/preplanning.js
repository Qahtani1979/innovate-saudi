/**
 * Pre-planning Strategy Prompts
 * AI assistance for environmental scanning and strategic context analysis
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ENVIRONMENTAL_SCAN_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert strategic analyst specializing in PESTLE analysis for Saudi Arabia's municipal sector.
Your goal is to identify key environmental factors that impact strategic planning.
Analyze factors across:
- Political (Policies, Regulations, Vision 2030)
- Economic (Budget, Investment, Inflation)
- Social (Demographics, Citizen behavior)
- Technological (Smart Cities, AI, Digital Transformation)
- Legal (Municipal Laws, Compliance)
- Environmental (Sustainability, Climate Change)
`;

export const ENVIRONMENTAL_SCAN_SCHEMA = {
    type: "object",
    properties: {
        factors: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    category: { type: "string", enum: ["political", "economic", "social", "technological", "legal", "environmental"] },
                    title_en: { type: "string" },
                    title_ar: { type: "string" },
                    description_en: { type: "string" },
                    description_ar: { type: "string" },
                    impact_type: { type: "string", enum: ["opportunity", "threat"] },
                    impact_level: { type: "string", enum: ["high", "medium", "low"] },
                    trend: { type: "string", enum: ["increasing", "stable", "decreasing"] }
                }
            }
        }
    }
};

export const buildEnvironmentalScanPrompt = () => `
Conduct a comprehensive PESTLE analysis for the current municipal strategic planning cycle in Saudi Arabia.

Identify at least 1 key factor for each category (Political, Economic, Social, Technological, Legal, Environmental).
Focus on:
1. Vision 2030 alignment
2. Recent regulatory changes
3. Emerging technologies in urban management
4. Sustainability goals


Response Format: JSON returning an array of factors.
`;

export const SWOT_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert strategic consultant.
Your goal is to conduct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for a municipal strategy.
Consider internal capabilities and external market factors.
`;

export const SWOT_ANALYSIS_SCHEMA = {
    type: "object",
    properties: {
        swot_items: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    type: { type: "string", enum: ["strength", "weakness", "opportunity", "threat"] },
                    title_en: { type: "string" },
                    title_ar: { type: "string" },
                    description_en: { type: "string" },
                    description_ar: { type: "string" },
                    impact_level: { type: "string", enum: ["high", "medium", "low"] }
                }
            }
        },
        strategic_implications: { type: "string" }
    }
};

export const buildSWOTAnalysisPrompt = (context) => `
Conduct a SWOT analysis based on the following context:

Vision: ${context.vision || 'Not specified'}
Mission: ${context.mission || 'Not specified'}
Sectors: ${context.sectors?.join(', ') || 'General Municipal'}

Requirements:
1. Identify 3-5 items for each SWOT category.
2. Focus on actionable insights.


Response Format: JSON
`;

export const STAKEHOLDER_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert stakeholder engagement strategist.
Your goal is to identify and analyze key stakeholders for a municipal strategy.
Assess:
- Power (influence)
- Interest (concern)
- Engagement strategy
`;

export const STAKEHOLDER_ANALYSIS_SCHEMA = {
    type: "object",
    properties: {
        stakeholders: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name_en: { type: "string" },
                    name_ar: { type: "string" },
                    type: { type: "string", enum: ["government", "private", "citizen", "non_profit"] },
                    power: { type: "string", enum: ["high", "medium", "low"] },
                    interest: { type: "string", enum: ["high", "medium", "low"] },
                    engagement_strategy: { type: "string" }
                }
            }
        }
    }
};

export const buildStakeholderAnalysisPrompt = (context) => `
Analyze key stakeholders for:

Vision: ${context.vision || 'Not specified'}
Sectors: ${context.sectors?.join(', ') || 'General'}

Requirements:
1. Identify 5-7 key stakeholders.
2. Classify by type, power, and interest.
3. Suggest engagement strategy.

Response Format: JSON
`;

export const RISK_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert risk manager for municipal projects.
Your goal is to identify and assess risks for a strategic plan.
Analyze:
- Risk Categories (Operational, Financial, Reputation, etc.)
- Impact & Probability
- Mitigation Strategies
`;

export const RISK_ASSESSMENT_SCHEMA = {
    type: "object",
    properties: {
        risks: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    category: { type: "string" },
                    description_en: { type: "string" },
                    description_ar: { type: "string" },
                    probability: { type: "string", enum: ["high", "medium", "low"] },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                    mitigation_en: { type: "string" },
                    mitigation_ar: { type: "string" }
                }
            }
        }
    }
};

export const buildRiskAssessmentPrompt = (context) => `
Conduct a risk assessment for:

Vision: ${context.vision || 'Not specified'}
Strategic Goals: ${context.goals?.map(g => g.title).join(', ') || 'Not specified'}

Requirements:
1. Identify 5-7 key risks.
2. Provide mitigation strategies for each.

Response Format: JSON
`;

export const STRATEGY_INPUT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert interviewer for strategic planning.
Your goal is to generate interview questions to gather input from stakeholders.
Target specific insights based on the stakeholder's role.
`;

export const STRATEGY_INPUT_SCHEMA = {
    type: "object",
    properties: {
        questions: {
            type: "array",
            items: { type: "string" }
        },
        focus_areas: {
            type: "array",
            items: { type: "string" }
        }
    }
};

export const buildStrategyInputPrompt = (context) => `
Generate structured interview questions for:

Role: ${context.role || 'Stakeholder'}
Topic: ${context.topic || 'General Strategy'}

Requirements:
1. 3-5 open-ended questions.
2. Focus on uncovering opportunities and challenges.

Response Format: JSON
`;
