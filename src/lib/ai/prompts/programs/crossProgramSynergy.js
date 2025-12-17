/**
 * Cross-Program Synergy Prompt
 * Used by: CrossProgramSynergy.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildCrossProgramSynergyPrompt = (programs) => {
  const programList = programs?.length > 0 
    ? programs.map(p => `- ${p.name_en} (${p.participants_count || 0} participants, focus: ${p.focus_area || 'general'})`).join('\n')
    : `- AI Accelerator (15 startups, focus: smart city AI)
- GovTech Fellowship (12 participants, focus: digital services)
- Civic Innovation Hackathon (8 teams, focus: community solutions)`;

  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing innovation programs for Saudi Arabia's Ministry of Municipalities and Housing to find collaboration opportunities.

## ACTIVE PROGRAMS
${programList}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Identify synergies across programs:
1. Potential cross-program collaborations (bilingual)
2. Shared resource opportunities (bilingual)
3. Joint events or showcases (bilingual)
4. Knowledge transfer opportunities (bilingual)
5. Combined impact potential`;
};

export const crossProgramSynergySchema = {
  type: "object",
  required: ["collaborations_en", "collaborations_ar", "shared_resources_en", "shared_resources_ar"],
  properties: {
    collaborations_en: { type: "array", items: { type: "string" } },
    collaborations_ar: { type: "array", items: { type: "string" } },
    shared_resources_en: { type: "array", items: { type: "string" } },
    shared_resources_ar: { type: "array", items: { type: "string" } },
    joint_events_en: { type: "array", items: { type: "string" } },
    joint_events_ar: { type: "array", items: { type: "string" } },
    knowledge_transfer_en: { type: "array", items: { type: "string" } },
    knowledge_transfer_ar: { type: "array", items: { type: "string" } },
    combined_impact_en: { type: "string" },
    combined_impact_ar: { type: "string" }
  }
};

export const CROSS_PROGRAM_SYNERGY_SYSTEM_PROMPT = `You are a program coordination specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. You identify synergies and collaboration opportunities across multiple innovation programs to maximize impact and resource efficiency.`;
