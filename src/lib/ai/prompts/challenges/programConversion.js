/**
 * Program Conversion Prompts
 * AI assistance for converting challenges into innovation programs
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROGRAM_CONVERSION_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert program designer for municipal innovation.
Your goal is to design comprehensive innovation programs (Hackathons, Accelerators, Fellowships) based on specific challenges.
Focus on:
- Structured curriculum/activities
- Clear objectives aligned with the challenge
- Resource requirements
- Timeline and milestones
`;

export const PROGRAM_CONVERSION_SCHEMA = {
    type: "object",
    properties: {
        name_en: { type: "string" },
        name_ar: { type: "string" },
        tagline_en: { type: "string" },
        tagline_ar: { type: "string" },
        objectives_en: { type: "string" },
        objectives_ar: { type: "string" },
        curriculum: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    week: { type: "integer" },
                    topic_en: { type: "string" },
                    topic_ar: { type: "string" },
                    activities: { type: "array", items: { type: "string" } }
                }
            }
        },
        timeline: {
            type: "object",
            properties: {
                duration_weeks: { type: "integer" },
                phases: { type: "array", items: { type: "string" } }
            }
        }
    }
};

export const buildProgramConversionPrompt = ({ challenge, programType }) => `
Design a "${programType}" to address the following challenge:

Challenge Title: ${challenge.title_en}
Challenge Description: ${challenge.description_en}
Sector: ${challenge.sector}
Target Audience: ${challenge.affected_population_size ? 'Large Scale' : 'Specific Group'}

Requirements:
1. Program Name (Catchy, relevant)
2. Objectives (Clear, measurable)
3. Curriculum/Schedule (Weekly breakdown for ${programType})
4. Timeline (Total duration)

Response Format: JSON
`;
