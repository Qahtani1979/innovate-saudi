/**
 * Collaboration Suggestion Prompts
 * AI-powered collaboration opportunity identification
 * @version 1.0.0
 */

export const COLLABORATION_SYSTEM_PROMPT = `You are a collaboration strategist for Saudi municipal innovation ecosystems.

EXPERTISE:
- Partnership opportunity identification
- Cross-sector collaboration design
- Networking and event planning
- Stakeholder mapping

GUIDELINES:
- Suggest actionable collaboration opportunities
- Consider sector alignment and synergies
- Prioritize high-impact partnerships
- Include specific collaboration mechanisms`;

export const COLLABORATION_SUGGESTIONS_PROMPT_TEMPLATE = ({
  myChallenges = [],
  myPilots = [],
  organizations = []
}) => `${COLLABORATION_SYSTEM_PROMPT}

Based on this user's activities, suggest strategic collaboration opportunities:

My Challenges (${myChallenges.length}):
${myChallenges.slice(0, 5).map(c => `- ${c.title_en} (${c.sector})`).join('\n')}

My Pilots (${myPilots.length}):
${myPilots.slice(0, 5).map(p => `- ${p.title_en} (${p.sector})`).join('\n')}

Available Organizations (${organizations.length}):
${organizations.slice(0, 15).map(o => `- ${o.name_en} (${o.organization_type})`).join('\n')}

Suggest:
1. 5 potential collaboration partners (from organizations list) with specific collaboration opportunities
2. 3 cross-sector collaboration ideas
3. 2 networking events/meetings to organize`;

export const COLLABORATION_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    partner_suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          organization: { type: "string" },
          opportunity: { type: "string" },
          benefit: { type: "string" },
          priority: { type: "string" }
        }
      }
    },
    cross_sector_ideas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          sectors: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    networking_events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          format: { type: "string" },
          objectives: { type: "string" }
        }
      }
    }
  }
};

export default {
  COLLABORATION_SYSTEM_PROMPT,
  COLLABORATION_SUGGESTIONS_PROMPT_TEMPLATE,
  COLLABORATION_RESPONSE_SCHEMA
};
