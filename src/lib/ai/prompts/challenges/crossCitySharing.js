/**
 * Cross City Sharing Prompts
 * AI assistance for sharing solutions between cities
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CROSS_CITY_SHARING_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are a Solution Transferability Expert.
Analyze this solution and determine how it can be adapted for other cities.
Identify adaptation requirements and potential barriers.
`;

export const crossCitySharingSchema = {
    type: "object",
    properties: {
        adaptability_score: { type: "integer", minimum: 0, maximum: 100 },
        adaptation_requirements: { type: "array", items: { type: "string" } },
        target_city_profiles: {
            type: "array",
            items: { type: "string", description: "e.g., Coastal cities, Industrial cities" }
        }
    }
};

export const buildCrossCitySharingPrompt = (solution) => `
Analyze transferability of this solution:
"${solution.title}"
Context: ${solution.context}

Return JSON with adaptability_score, adaptation_requirements, and target_city_profiles.
`;
