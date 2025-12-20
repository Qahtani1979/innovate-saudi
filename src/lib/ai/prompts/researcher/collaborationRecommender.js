/**
 * Researcher Collaboration Recommender Prompts
 * AI-powered recommendations for research collaborations
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const COLLABORATION_RECOMMENDER_SYSTEM_PROMPT = getSystemPrompt('researcher_collaboration', `
You are a research collaboration specialist for Saudi Arabia's municipal innovation platform.
Your role is to recommend strategic collaborations between researchers, municipalities, and startups.
Focus on complementary expertise, shared research interests, and high-impact collaboration potential.
`);

/**
 * Build collaboration recommendation prompt
 * @param {Object} researcher - Current researcher profile
 * @param {Array} potentialCollaborators - List of potential collaborators
 * @param {Array} activeProjects - Active R&D projects in the platform
 * @returns {string} Formatted prompt
 */
export function buildCollaborationRecommenderPrompt(researcher, potentialCollaborators = [], activeProjects = []) {
  return `Recommend collaborations for this researcher:

RESEARCHER SEEKING COLLABORATION:
Name: ${researcher.name_en || researcher.full_name_en || 'Unknown'}
Institution: ${researcher.institution || 'Not specified'}
Research Areas: ${researcher.research_areas?.join(', ') || 'General'}
Expertise: ${researcher.expertise_keywords?.join(', ') || 'Not specified'}
Collaboration Interests: ${researcher.collaboration_interests?.join(', ') || 'Open to all'}
Past Collaborations: ${researcher.collaboration_count || 0}

POTENTIAL COLLABORATORS:
${potentialCollaborators.slice(0, 15).map(c => `
- ${c.name_en || c.full_name_en}: ${c.institution || 'Unknown institution'}
  Research: ${c.research_areas?.join(', ') || 'General'}
  Expertise: ${c.expertise_keywords?.slice(0, 5).join(', ') || 'N/A'}
`).join('\n') || 'No collaborators available'}

ACTIVE R&D PROJECTS (Collaboration Opportunities):
${activeProjects.slice(0, 10).map(p => `
- ${p.title_en}: ${p.research_area || 'General'} (${p.status || 'active'})
  Looking for: ${p.collaboration_needs?.join(', ') || 'Team members'}
`).join('\n') || 'No active projects'}

Recommend:
1. Top 5 researcher collaborators with match scores
2. Top 3 project collaboration opportunities
3. Suggested collaboration types
4. Potential joint research topics`;
}

export const COLLABORATION_RECOMMENDER_SCHEMA = {
  type: "object",
  properties: {
    researcher_matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          collaborator_name: { type: "string" },
          institution: { type: "string" },
          match_score: { type: "number" },
          complementary_expertise: { type: "array", items: { type: "string" } },
          collaboration_reason_en: { type: "string" },
          collaboration_reason_ar: { type: "string" },
          suggested_topics: { type: "array", items: { type: "string" } }
        }
      }
    },
    project_opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          project_title: { type: "string" },
          role_suggestion: { type: "string" },
          fit_score: { type: "number" },
          contribution_areas: { type: "array", items: { type: "string" } }
        }
      }
    },
    collaboration_types: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type_en: { type: "string" },
          type_ar: { type: "string" },
          description: { type: "string" },
          recommended: { type: "boolean" }
        }
      }
    },
    joint_research_topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic_en: { type: "string" },
          topic_ar: { type: "string" },
          impact_potential: { type: "string" },
          relevance_to_vision2030: { type: "string" }
        }
      }
    }
  },
  required: ["researcher_matches", "project_opportunities"]
};

export const COLLABORATION_RECOMMENDER_PROMPTS = {
  systemPrompt: COLLABORATION_RECOMMENDER_SYSTEM_PROMPT,
  buildPrompt: buildCollaborationRecommenderPrompt,
  schema: COLLABORATION_RECOMMENDER_SCHEMA
};

export default COLLABORATION_RECOMMENDER_PROMPTS;
