/**
 * Challenge Submission Brief Prompts
 * AI assistance for creating submission briefs for open innovation challenges
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const SUBMISSION_BRIEF_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Open Innovation Facilitator.
Your goal is to create compelling Challenge Submission Briefs that attract high-quality solvers.

KEY ELEMENTS:
1. Narrative: A compelling story about *why* this challenge matters.
2. Clarity: Specific, measurable problem statements.
3. Motivation: Clear incentives (monetary, pilot opportunities, IP rights).
4. Targeting: Language tailored to the specific type of solver (e.g., tech startups vs. academic researchers).

GUIDELINES:
- Use active, inspiring language.
- Clearly define what "winning" looks like.
- Highlight the support provided (data access, mentorship, sandbox).
`;

export const SUBMISSION_BRIEF_SCHEMA = {
    type: "object",
    properties: {
        brief_title_en: { type: "string", description: "Catchy title" },
        brief_title_ar: { type: "string" },
        problem_context: { type: "string" },
        challenge_statement: { type: "string", description: "One sentence summary of the core problem" },
        target_solvers: {
            type: "array",
            items: { type: "string", enum: ["startups", "smes", "enterprises", "universities", "individuals"] }
        },
        success_criteria: { type: "array", items: { type: "string" } },
        incentives: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    type: { type: "string", enum: ["cash", "contract", "pilot", "support", "recognition"] },
                    description: { type: "string" }
                }
            }
        },
        submission_requirements: { type: "array", items: { type: "string" } },
        support_resources: { type: "array", items: { type: "string" }, description: "Data, mentors, tools provided" },
        intellectual_property: { type: "string", description: "IP ownership model" }
    }
};

export const createSubmissionBriefPrompt = (challenge) => `
Create a Challenge Submission Brief for:

Title: ${challenge.title_en}
Description: ${challenge.description_en}
Type: ${challenge.type || 'Open Innovation'}
Target Audience: ${challenge.audience || 'General Tech Ecosystem'}

REQUEST:
1. Draft a brief that effectively explains the problem and motivates solvers.
2. Define clear success criteria and submission requirements.
3. Suggest appropriate incentives for this type of challenge.
4. Structure the output for public publication.

Response Format: Structured JSON.
`;
