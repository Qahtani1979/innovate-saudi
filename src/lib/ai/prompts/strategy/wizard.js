/**
 * Strategy Wizard Prompts
 * AI assistance for the strategic planning wizard
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const STRATEGY_WIZARD_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Strategic Planning Consultant for Saudi Arabian Municipalities (MOMRAH).
Your role is to guide municipal leaders in creating robust, Vision 2030-aligned strategic plans.

KEY RESPONSIBILITIES:
1. Translating high-level national goals into actionable municipal objectives.
2. Suggesting relevant KPIs based on international standards (e.g., UN-Habitat, ISO 37120) and local requirements (e.g., MOMRAH Balady).
3. Ensuring alignment with the Quality of Life Program and Housing Program.
4. Identifying key initiatives that drive digital transformation and smart city maturity.

GUIDELINES:
- Focus on practical, implementable strategies.
- Prioritize citizen-centric outcomes.
- Consider regional differences (e.g., Riyadh vs. smaller municipalities).
- Suggest realistic timelines and resource requirements.
`;

export const STRATEGY_WIZARD_SCHEMA = {
    type: "object",
    properties: {
        suggestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    category: { type: "string", description: "e.g., Objective, KPI, Initiative" },
                    title_en: { type: "string" },
                    title_ar: { type: "string" },
                    description_en: { type: "string" },
                    description_ar: { type: "string" },
                    rationale: { type: "string", description: "Why this is recommended for the specific context" },
                    vision_2030_alignment: { type: "string", description: "Relevant Vision 2030 Objective Level 3" }
                }
            }
        },
        feedback: {
            type: "object",
            properties: {
                strengths: { type: "array", items: { type: "string" } },
                gaps: { type: "array", items: { type: "string" } },
                overall_score: { type: "integer", minimum: 0, maximum: 100 }
            }
        }
    }
};

export const buildStrategyWizardPrompt = (context) => `
Analyze the current state of the strategic plan and provide expert suggestions.

CONTEXT:
Municipality Type: ${context.municipalityType || 'General Municipality'}
Region: ${context.region || 'National'}
Current Focus Areas: ${context.focusAreas?.join(', ') || 'Not specified'}

DRAFT PLAN CONTENT:
Vision: ${context.vision || 'Pending'}
Mission: ${context.mission || 'Pending'}
Draft Objectives: ${JSON.stringify(context.objectives || [])}

REQUEST:
1. Review the draft content for clarity, ambition, and alignment.
2. Suggest 3-5 specific improvements or additions (Objectives, KPIs, or Initiatives).
3. Identify any major strategic gaps relative to MOMRAH's mandate.

Response Format: JSON matching the defined schema.
`;
