/**
 * Publication Analyzer Prompts
 * AI-powered analysis of researcher publications for expertise extraction
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PUBLICATION_ANALYZER_SYSTEM_PROMPT = getSystemPrompt('publication_analyzer', `
You are an academic publication analyst for Saudi Arabia's municipal innovation ecosystem.
Your role is to analyze research publications and extract expertise, themes, and potential applications.
Focus on municipal relevance, Vision 2030 alignment, and practical implementation potential.
`);

/**
 * Build publication analysis prompt
 * @param {Array} publications - List of publications to analyze
 * @param {Object} researcherContext - Researcher context
 * @returns {string} Formatted prompt
 */
export function buildPublicationAnalyzerPrompt(publications, researcherContext = {}) {
  return `Analyze these publications to extract expertise and municipal relevance:

RESEARCHER CONTEXT:
Institution: ${researcherContext.institution || 'Unknown'}
Current Research Areas: ${researcherContext.research_areas?.join(', ') || 'Not specified'}

PUBLICATIONS TO ANALYZE:
${publications.slice(0, 20).map((pub, i) => `
${i + 1}. "${pub.title}"
   Authors: ${pub.authors?.join(', ') || 'Unknown'}
   Year: ${pub.year || 'Unknown'}
   Journal/Conference: ${pub.venue || 'Unknown'}
   Abstract: ${pub.abstract?.slice(0, 300) || 'No abstract'}...
   Citations: ${pub.citations || 0}
`).join('\n') || 'No publications provided'}

Extract:
1. Key expertise areas across all publications
2. Research themes and trends
3. Municipal service relevance mapping
4. Potential pilot/innovation applications
5. Collaboration synergies with municipal challenges`;
}

export const PUBLICATION_ANALYZER_SCHEMA = {
  type: "object",
  properties: {
    expertise_areas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area_en: { type: "string" },
          area_ar: { type: "string" },
          confidence: { type: "number" },
          publication_count: { type: "number" },
          key_contributions: { type: "array", items: { type: "string" } }
        }
      }
    },
    research_themes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          theme_en: { type: "string" },
          theme_ar: { type: "string" },
          evolution: { type: "string" },
          recent_focus: { type: "boolean" }
        }
      }
    },
    municipal_relevance: {
      type: "array",
      items: {
        type: "object",
        properties: {
          service_area: { type: "string" },
          relevance_score: { type: "number" },
          application_potential: { type: "string" },
          related_publications: { type: "array", items: { type: "string" } }
        }
      }
    },
    pilot_applications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          application_en: { type: "string" },
          application_ar: { type: "string" },
          feasibility: { type: "string" },
          trl_estimate: { type: "number" }
        }
      }
    },
    collaboration_synergies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          challenge_type: { type: "string" },
          expertise_match: { type: "string" },
          potential_contribution: { type: "string" }
        }
      }
    }
  },
  required: ["expertise_areas", "research_themes", "municipal_relevance"]
};

export const PUBLICATION_ANALYZER_PROMPTS = {
  systemPrompt: PUBLICATION_ANALYZER_SYSTEM_PROMPT,
  buildPrompt: buildPublicationAnalyzerPrompt,
  schema: PUBLICATION_ANALYZER_SCHEMA
};

export default PUBLICATION_ANALYZER_PROMPTS;
