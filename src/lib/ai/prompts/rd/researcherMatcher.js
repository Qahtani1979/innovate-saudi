/**
 * Researcher-Municipality Matcher Prompts
 * For matching researchers with municipalities based on challenges and expertise
 */

import { getSystemPrompt } from '@/lib/saudiContext';
import { buildBilingualSchema } from '../../bilingualSchemaBuilder';

export const RESEARCHER_MATCHER_PROMPTS = {
  systemPrompt: getSystemPrompt('rd_researcher_matcher'),
  
  buildPrompt: (researcherProfile, challenges) => `Match this researcher with municipalities that have challenges aligned with their expertise:

RESEARCHER PROFILE:
Name: ${researcherProfile.full_name_en}
Name (AR): ${researcherProfile.full_name_ar || 'N/A'}
Institution: ${researcherProfile.institution_en || 'Independent'}
Research Areas: ${researcherProfile.research_areas?.join(', ') || 'General'}
Expertise Keywords: ${researcherProfile.expertise_keywords?.join(', ') || 'N/A'}
Publications: ${researcherProfile.publication_count || 0}
Previous Collaborations: ${researcherProfile.collaboration_count || 0}

AVAILABLE CHALLENGES BY MUNICIPALITY:
${challenges.slice(0, 25).map(c => `- Municipality: ${c.municipality_id}
  Challenge: ${c.title_en}
  Sector: ${c.sector}
  Priority: ${c.priority}`).join('\n\n')}

Find TOP 5 municipalities with the best matching opportunities:

For each match, provide:
1. Municipality name
2. Number of relevant challenges
3. Match score (0-100)
4. Why this is a good match (expertise alignment)
5. Specific collaboration opportunity

Consider:
- Research area overlap with challenges
- Sector relevance
- Potential impact on municipal services
- Feasibility of collaboration`,

  schema: buildBilingualSchema({
    type: "object",
    properties: {
      matches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            municipality: { type: "string" },
            municipality_ar: { type: "string" },
            challenge_count: { type: "number" },
            match_score: { type: "number" },
            reason: { type: "string" },
            reason_ar: { type: "string" },
            opportunity: { type: "string" },
            opportunity_ar: { type: "string" }
          },
          required: ["municipality", "challenge_count", "match_score", "reason", "opportunity"]
        }
      }
    },
    required: ["matches"]
  })
};

export default RESEARCHER_MATCHER_PROMPTS;
