/**
 * Challenge to R&D Conversion Prompts
 * @module challenges/rdConversion
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RD_CONVERSION_SYSTEM_PROMPT = getSystemPrompt('rd_conversion', `
You are an R&D project designer for Saudi municipal innovation.
Your role is to convert complex challenges into structured research and development projects.
Focus on innovation potential, research methodologies, and practical applications.
`);

/**
 * Build R&D conversion prompt
 * @param {Object} params - Challenge data
 * @returns {string} Formatted prompt
 */
export function buildRDConversionPrompt({ challenge, existingRDProjects, researchCapabilities }) {
  return `Convert this challenge into an R&D project proposal:

CHALLENGE: ${challenge?.title_en || challenge?.title || 'Unknown'}
DESCRIPTION: ${challenge?.description_en || challenge?.description || ''}
SECTOR: ${challenge?.sector || 'general'}
ROOT CAUSES: ${(challenge?.root_causes || []).join(', ') || 'Not identified'}
DESIRED OUTCOME: ${challenge?.desired_outcome_en || ''}

EXISTING R&D PROJECTS: ${(existingRDProjects || []).map(p => p.title_en).join(', ') || 'None'}
RESEARCH CAPABILITIES: ${JSON.stringify(researchCapabilities || {})}

Generate:
1. R&D project title (English and Arabic)
2. Research objectives
3. Methodology approach
4. Expected deliverables
5. Timeline estimate
6. Resource requirements
7. Innovation potential score
8. Potential research partners`;
}

export const RD_CONVERSION_SCHEMA = {
  type: "object",
  properties: {
    title_en: { type: "string" },
    title_ar: { type: "string" },
    research_objectives: { type: "array", items: { type: "string" } },
    methodology: { type: "string" },
    deliverables: { type: "array", items: { type: "string" } },
    timeline_months: { type: "number" },
    resource_requirements: { type: "object" },
    innovation_score: { type: "number" },
    potential_partners: { type: "array", items: { type: "string" } }
  },
  required: ["title_en", "research_objectives", "methodology", "deliverables"]
};

export const RD_CONVERSION_PROMPTS = {
  systemPrompt: RD_CONVERSION_SYSTEM_PROMPT,
  buildPrompt: buildRDConversionPrompt,
  schema: RD_CONVERSION_SCHEMA
};
