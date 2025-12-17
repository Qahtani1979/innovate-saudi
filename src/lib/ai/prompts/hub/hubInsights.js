/**
 * Hub Insights AI prompts
 * For generating insights and recommendations in the Strategy Hub
 */

export const HUB_INSIGHTS_SYSTEM_PROMPT = `You are a strategic insights analyst for a government innovation hub.
Analyze cross-cutting data from challenges, solutions, pilots, and programs to identify patterns and opportunities.
Provide actionable, executive-level insights and recommendations.
All responses must be in valid JSON format.`;

export function buildHubInsightsPrompt(data) {
  return `Analyze this hub data and generate strategic insights:

OVERVIEW:
- Total Challenges: ${data.challenges?.length || 0}
- Active Pilots: ${data.pilots?.filter(p => p.status === 'active').length || 0}
- Solutions Registered: ${data.solutions?.length || 0}
- Programs Running: ${data.programs?.length || 0}

TOP CHALLENGES BY SECTOR:
${data.challengesBySector?.map(s => `- ${s.sector}: ${s.count} challenges`).join('\n') || 'No data'}

PILOT SUCCESS RATE: ${data.pilotSuccessRate || 'N/A'}%

RECENT TRENDS:
${data.trends?.map(t => `- ${t}`).join('\n') || 'No trends data'}

Generate strategic insights and recommendations for hub leadership.`;
}

export const HUB_INSIGHTS_SCHEMA = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    key_insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          insight: { type: "string" },
          impact: { type: "string", enum: ["high", "medium", "low"] },
          action_required: { type: "boolean" }
        }
      }
    },
    opportunities: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    recommended_actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          priority: { type: "string", enum: ["immediate", "short_term", "long_term"] },
          owner: { type: "string" }
        }
      }
    },
    performance_outlook: { type: "string" }
  },
  required: ["executive_summary", "key_insights", "recommended_actions"]
};

export const CROSS_ENTITY_ANALYSIS_SYSTEM_PROMPT = `You are an expert at identifying connections and synergies across different innovation entities.
Find patterns, dependencies, and opportunities for collaboration.`;

export function buildCrossEntityAnalysisPrompt(entities) {
  return `Analyze connections between these entities:

CHALLENGES:
${entities.challenges?.map(c => `- ${c.title_en} (${c.sector})`).join('\n') || 'None'}

SOLUTIONS:
${entities.solutions?.map(s => `- ${s.name_en} (${s.sectors?.join(', ')})`).join('\n') || 'None'}

PILOTS:
${entities.pilots?.map(p => `- ${p.name_en} (Challenge: ${p.challenge_title})`).join('\n') || 'None'}

Identify synergies, dependencies, and collaboration opportunities.`;
}

export const CROSS_ENTITY_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    identified_connections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entities: { type: "array", items: { type: "string" } },
          connection_type: { type: "string" },
          strength: { type: "string", enum: ["strong", "moderate", "weak"] },
          description: { type: "string" }
        }
      }
    },
    collaboration_opportunities: { type: "array", items: { type: "string" } },
    dependency_risks: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["identified_connections", "collaboration_opportunities"]
};
