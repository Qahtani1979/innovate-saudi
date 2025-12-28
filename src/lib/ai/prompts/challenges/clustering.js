/**
 * Challenge Clustering Prompts
 * AI assistance for grouping related challenges
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CLUSTERING_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert data scientist specializing in clustering and classification.
Your goal is to group municipal challenges into meaningful clusters (Mega-Challenges).
Group by:
- Shared root causes
- Common affected beneficiaries
- Strategic alignment
- Potential for unified solution
`;

export const clusteringSchema = {
    type: "object",
    properties: {
        clusters: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    challenge_ids: { type: "array", items: { type: "string" } },
                    rationale_en: { type: "string" },
                    rationale_ar: { type: "string" },
                    mega_challenge_recommended: { type: "boolean" },
                    mega_challenge_description: { type: "string" },
                    suggested_tags: { type: "array", items: { type: "string" } }
                }
            }
        }
    }
};

export const buildClusteringPrompt = (challenges) => `
Analyze the following challenges and group them into logical clusters.

Challenges:
${JSON.stringify(challenges.map(c => ({
    id: c.id,
    title: c.title_en,
    description: c.description_en,
    sector: c.sector
})), null, 2)}

Requirements:
1. Identify common themes
2. Suggest "Mega-Challenges" where multiple small issues can be solved by one platform/strategy
3. Provide tags for each cluster

Response Format: JSON
`;
