/**
 * RFP Generator Prompts
 * AI assistance for creating Requests for Proposals (RFPs)
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RFP_GENERATOR_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert procurement specialist.
Your goal is to draft clear, comprehensive Requests for Proposals (RFPs) for innovation challenges.
Ensure compliance with procurement regulations and best practices.
Structure:
- Scope of Work
- Technical Requirements
- Evaluation Criteria
`;

export const rfpGeneratorSchema = {
    type: "object",
    properties: {
        rfp_title: { type: "string" },
        scope_of_work: { type: "string" },
        technical_requirements: { type: "array", items: { type: "string" } },
        evaluation_criteria: { type: "array", items: { type: "string" } },
        timeline_weeks: { type: "integer" }
    }
};

export const buildRFPGeneratorPrompt = (challenge) => `
Draft an RFP for the following challenge:

Title: ${challenge.title_en}
Description: ${challenge.description_en}
Objectives: ${challenge.objectives || 'Not specified'}

Requirements:
1. Detailed Scope of Work
2. Specific Technical Requirements
3. Clear Evaluation Criteria

Response Format: JSON
`;
