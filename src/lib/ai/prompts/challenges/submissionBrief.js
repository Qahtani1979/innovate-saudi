/**
 * Submission Brief Prompts
 * AI assistance for creating submission briefs
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SUBMISSION_BRIEF_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert innovation evaluator.
Your goal is to summarize a challenge submission into a concise brief for reviewers.
Analyze:
- Clarity of problem statement
- Evidence provided
- Impact potential
- Complexity and Feasibility
`;

export const SUBMISSION_BRIEF_SCHEMA = {
    type: "object",
    properties: {
        executive_summary_en: { type: "string" },
        executive_summary_ar: { type: "string" },
        key_highlights: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    en: { type: "string" },
                    ar: { type: "string" }
                }
            }
        },
        complexity: { type: "string", enum: ["high", "medium", "low"] },
        complexity_reason_en: { type: "string" },
        complexity_reason_ar: { type: "string" },
        estimated_review_days: { type: "integer" }
    }
};

export const createSubmissionBriefPrompt = (challenge) => `
Create a submission brief for the following challenge:

Title: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}

Requirements:
1. Executive Summary (Concise overview)
2. Key Highlights (3-5 bullet points)
3. Complexity Assessment with reasoning

Response Format: JSON
`;
