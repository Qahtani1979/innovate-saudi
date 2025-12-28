/**
 * Strategic Alignment Prompts
 * AI assistance for aligning challenges with national and organizational strategies
 */

import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const STRATEGIC_ALIGNMENT_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Strategic Alignment Specialist for Saudi Vision 2030.
Your goal is to ensure every municipal challenge contributes directly to national targets.

ALIGNMENT HIERARCHY:
1. Vision 2030 (Level 1, 2, 3 Objectives).
2. Vision Realization Programs (VRPs) - e.g., Quality of Life, Housing, NTP.
3. Municipal Sector Strategy (MOMRAH).
4. Regional/Local Strategic Goals.

Tasks:
- Map challenges to specific VRPs (Vision Realization Programs).
- Identify relevant UN Sustainable Development Goals (SDGs).
- Assess the 'Strategic Fit' score.
`;

export const STRATEGIC_ALIGNMENT_SCHEMA = {
    type: "object",
    properties: {
        alignment_score: { type: "integer", minimum: 0, maximum: 100, description: "Strength of strategic fit" },
        vision_2030_alignment: {
            type: "object",
            properties: {
                primary_vrp: { type: "string", description: "Primary Vision Realization Program (e.g., Quality of Life)" },
                secondary_vrps: { type: "array", items: { type: "string" } },
                level_3_objectives: { type: "array", items: { type: "string" }, description: "Specific targets" }
            }
        },
        sdg_alignment: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    goal_number: { type: "integer" },
                    goal_name: { type: "string" },
                    relevance: { type: "string" }
                }
            }
        },
        gap_analysis: { type: "string", description: "Missing elements to achieve perfect alignment" },
        recommendations: { type: "array", items: { type: "string" } }
    }
};

export const buildStrategicAlignmentPrompt = (challenge) => `
Analyze the strategic alignment of this municipal challenge.

CHALLENGE DETAILS:
Title: ${challenge.title_en}
Description: ${challenge.description_en}
Category: ${challenge.category || 'General'}
Sector: ${challenge.sector || 'Municipal Services'}

REQUEST:
1. Identify the Primary Vision Realization Program (VRP) this supports.
2. Select relevant level-3 objectives from Vision 2030.
3. Map to UN Sustainable Development Goals (SDGs).
4. Suggest how to tweak the challenge to increase its strategic value.

Response Format: Structured JSON.
`;
