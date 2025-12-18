/**
 * Proposal to R&D Converter Prompts
 * @module citizen/proposalToRD
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROPOSAL_TO_RD_SYSTEM_PROMPT = getSystemPrompt('citizen_proposal_rd');

export const buildProposalToRDPrompt = (proposal) => `Convert this innovation proposal into an R&D research project.

PROPOSAL:
${proposal.title_en}
${proposal.description_en}
Implementation Plan: ${proposal.implementation_plan_en}
Sector: ${proposal.sector || 'General'}

Generate R&D project structure:
- Research questions (3-5 specific questions)
- Methodology (detailed research approach in both AR and EN)
- Expected outputs (publications, data, tools - bilingual)
- Research themes/keywords`;

export const PROPOSAL_TO_RD_SCHEMA = {
  type: "object",
  properties: {
    title_en: { type: "string" },
    title_ar: { type: "string" },
    abstract_en: { type: "string" },
    abstract_ar: { type: "string" },
    methodology_en: { type: "string" },
    methodology_ar: { type: "string" },
    expected_outputs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          output_en: { type: "string" },
          output_ar: { type: "string" },
          type: { type: "string" }
        }
      }
    },
    research_themes: { type: "array", items: { type: "string" } }
  },
  required: ['title_en', 'abstract_en', 'methodology_en']
};

export const PROPOSAL_TO_RD_PROMPTS = {
  systemPrompt: PROPOSAL_TO_RD_SYSTEM_PROMPT,
  buildPrompt: buildProposalToRDPrompt,
  schema: PROPOSAL_TO_RD_SCHEMA
};

export default PROPOSAL_TO_RD_PROMPTS;
