/**
 * Cross City Learning Prompts
 * AI assistance for identifying shared challenges across cities
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CROSS_CITY_LEARNING_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are a Municipal Knowledge Network Expert.
Identify patterns where this challenge might be relevant to other cities in Saudi Arabia.
Suggest specific cities based on similar demographics or geography.
`;

export const crossCityLearningSchema = {
    type: "object",
    properties: {
        relevant_cities: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    city_name: { type: "string" },
                    relevance_reason: { type: "string" },
                    similarity_score: { type: "number" }
                }
            }
        },
        shared_patterns: { type: "array", items: { type: "string" } }
    }
};

export const buildCrossCityLearningPrompt = (challenge) => `
Analyze cross-city relevance for:
Title: ${challenge.title_en}
Municipality: ${challenge.municipality_id}

Which other Saudi cities face similar specific issues?
Return JSON with relevant_cities and shared_patterns.
`;
