/**
 * Track Assignment Prompts
 * AI assistance for assigning treatment tracks to challenges
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TRACK_ASSIGNMENT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert challenge manager.
Your goal is to assign the optimal "Treatment Track" for a given challenge.
Tracks:
- pilot (Testing a solution in real environment)
- r_and_d (Research needed for new technology)
- program (Training/Accelerator needed)
- procurement (Direct purchase of existing solution)
- policy (Regulatory change needed)
`;

export const TRACK_ASSIGNMENT_SCHEMA = {
    type: "object",
    properties: {
        recommended_track: { type: "string", enum: ["pilot", "r_and_d", "program", "procurement", "policy"] },
        confidence: { type: "integer" },
        reasoning: { type: "array", items: { type: "string" } }
    }
};

export const buildTrackAssignmentPrompt = ({ challenge }) => `
Analyze this challenge and recommend a treatment track.

Challenge: ${challenge.title_en}
Description: ${challenge.description_en}

Analyze:
1. Technology Maturity (TRL)
2. Regulatory dependencies
3. Market availability of solutions

Response Format: JSON
`;
