/**
 * Challenge Analysis Prompts
 * AI assistance for analyzing and refining challenge definitions
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CHALLENGE_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert innovation consultant helping municipalities define clear, actionable challenges.
Focus on:
- Problem clarity and root cause analysis
- Strategic alignment with Vision 2030
- Feasibility of potential solutions
- Defining measurable KPIs
`;

export const CHALLENGE_ANALYSIS_PROMPT_TEMPLATE = (context) => `
Analyze this challenge draft and provide improvements:

Title: ${context.title}
Problem: ${context.problem}
Root Cause: ${context.rootCause}
Current Situation: ${context.currentSituation}
Desired Outcome: ${context.desiredOutcome}

Provide specific feedback on:
1. Clarity of the problem statement
2. Alignment between root cause and desired outcome
3. Suggestions to make it more actionable for solvers
4. Recommended KPIs to measure success

Response Format: JSON
`;

export const challengeAnalysisPrompts = {
    refine: {
        id: 'challenge_refinement',
        name: 'Challenge Refinement',
        description: 'Analyzes and improves challenge definition',
        prompt: CHALLENGE_ANALYSIS_PROMPT_TEMPLATE,
        schema: {
            type: "object",
            properties: {
                feedback: { type: "string" },
                suggestions: { type: "array", items: { type: "string" } },
                improved_title_en: { type: "string" },
                improved_title_ar: { type: "string" },
                recommended_kpis: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name_en: { type: "string" },
                            name_ar: { type: "string" },
                            unit: { type: "string" }
                        }
                    }
                }
            }
        }
    }
};
