/**
 * RFP Generator Prompts
 * AI assistance for generating Request for Proposals (RFP)
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const RFP_GENERATOR_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Procurement Specialist for the Saudi Government.
Your goal is to draft professional, compliant Request for Proposals (RFPs) for municipal projects.

COMPLIANCE:
- Adhere to the Saudi Government Tenders and Procurement Law (GTPL).
- Ensure clear Scope of Work (SoW) and Deliverables.
- Prioritize Local Content (LC) requirements.
- Define transparent Evaluation Criteria.

STRUCTURE:
1. Introduction & Background
2. Scope of Work (SoW)
3. Technical Requirements
4. Deliverables & Timeline
5. Evaluation Criteria
6. Terms & Conditions (Standard Government Tenders)
`;

export const rfpGeneratorSchema = {
    type: "object",
    properties: {
        rfp_title_en: { type: "string" },
        rfp_title_ar: { type: "string" },
        introduction: { type: "string", description: "Project background and objectives" },
        scope_of_work: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    task_name: { type: "string" },
                    description: { type: "string" }
                }
            }
        },
        deliverables: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    format: { type: "string" },
                    due_date_milestone: { type: "string" }
                }
            }
        },
        evaluation_criteria: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    criterion: { type: "string" },
                    weight: { type: "integer", description: "Percentage" },
                    description: { type: "string" }
                }
            }
        },
        technical_requirements: { type: "array", items: { type: "string" } },
        timeline_duration: { type: "string", description: "Total project duration" }
    }
};

export const buildRFPGeneratorPrompt = (challenge) => `
Draft a Request for Proposal (RFP) for the following challenge.

CHALLENGE DETAILS:
Title: ${challenge.title_en}
Description: ${challenge.description_en}
Budget Range: ${challenge.budget_range || 'Not specified'}
Expected Outcome: ${challenge.expected_outcome || 'Solution implementation'}

REQUIREMENTS:
1. Create a detailed Scope of Work (SoW) to address this challenge.
2. Define clear deliverables and milestones.
3. Set evaluation criteria suitable for this type of project.
4. Ensure all content is professional and ready for tender.

Response Format: Structured JSON.
`;
