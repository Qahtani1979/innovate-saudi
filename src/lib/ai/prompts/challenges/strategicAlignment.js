/**
 * Strategic Alignment Prompts
 * AI assistance for aligning challenges with strategic goals
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const STRATEGIC_ALIGNMENT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert strategic planner.
Your goal is to align innovation challenges with national and organizational strategies.
Identify alignment with:
- Vision 2030
- Sector Strategy
- Digital Transformation Goals
`;

export const STRATEGIC_ALIGNMENT_SCHEMA = {
    type: "object",
    properties: {
        alignment_score: { type: "integer" },
        aligned_goals: { type: "array", items: { type: "string" } },
        gap_analysis: { type: "string" },
        recommendations: { type: "array", items: { type: "string" } }
    }
};

export const buildStrategicAlignmentPrompt = (challenge) => `
Analyze the strategic alignment of this challenge.

Challenge: ${challenge.title_en}
Description: ${challenge.description_en}

Analyze alignment with:
1. Vision 2030 Goals
2. Municipal Sector Strategy

Response Format: JSON
`;
