/**
 * Challenge Intake Prompts
 * AI assistance for converting raw problem descriptions into structured challenges
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CHALLENGE_INTAKE_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Innovation Challenge Architect.
Your goal is to parse raw problem descriptions into structured, actionable challenges.
Identify:
1. The Core Sector
2. Keywords for matching
3. Root Causes (5 Whys analysis)
4. Measurable KPIs
5. Follow-up questions to clarify ambiguity
`;

export const challengeIntakeSchema = {
    type: "object",
    properties: {
        sector: { type: "string" },
        keywords: { type: "array", items: { type: "string" } },
        root_causes: { type: "array", items: { type: "string" } },
        suggested_kpis: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    baseline: { type: "string" },
                    target: { type: "string" }
                }
            }
        },
        follow_up_questions: { type: "array", items: { type: "string" } }
    }
};

export const getChallengeIntakePrompt = (description) => `
Analyze this problem description and structure it:
"${description}"

Return JSON with sector, keywords, root_causes, suggested_kpis, and follow_up_questions.
`;
