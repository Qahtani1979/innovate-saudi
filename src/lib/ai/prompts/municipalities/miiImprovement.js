/**
 * MII Improvement Recommendations Prompts
 * @module municipalities/miiImprovement
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MII_IMPROVEMENT_SYSTEM_PROMPT = getSystemPrompt('mii_improvement', `
You are an innovation performance advisor for Saudi Arabian municipalities.
Your role is to analyze Municipal Innovation Index (MII) scores and provide actionable improvement recommendations.
Consider Vision 2030 alignment, regional context, and resource constraints when making recommendations.
`);

/**
 * Build MII improvement analysis prompt
 * @param {Object} params - Municipality performance data
 * @returns {string} Formatted prompt
 */
export function buildMIIImprovementPrompt({ municipality, metrics, benchmarks }) {
  const metricsList = metrics?.map(m => 
    `- ${m.category}: ${m.score}/100 (Region avg: ${m.regional_avg || 'N/A'})`
  ).join('\n') || 'No metrics available';

  return `Analyze this municipality's innovation performance and provide improvement recommendations:

Municipality: ${municipality?.name_en || 'Unknown'}
Region: ${municipality?.region_name || 'Unknown'}
Population: ${municipality?.population?.toLocaleString() || 'N/A'}
Current MII Score: ${municipality?.mii_score || 'N/A'}

PERFORMANCE METRICS:
${metricsList}

REGIONAL BENCHMARKS:
${JSON.stringify(benchmarks || {}, null, 2)}

Provide:
1. Strength areas to leverage
2. Priority improvement areas
3. Quick wins (achievable in 3 months)
4. Strategic initiatives (6-12 months)
5. Resource requirements estimate`;
}

export const MII_IMPROVEMENT_SCHEMA = {
  type: "object",
  properties: {
    strengths: {
      type: "array",
      items: { type: "string" }
    },
    priority_improvements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          current_score: { type: "number" },
          target_score: { type: "number" },
          gap: { type: "number" }
        }
      }
    },
    quick_wins: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          impact: { type: "string" },
          timeline: { type: "string" }
        }
      }
    },
    strategic_initiatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          initiative: { type: "string" },
          description: { type: "string" },
          resources_needed: { type: "string" },
          expected_impact: { type: "number" }
        }
      }
    },
    summary: { type: "string" }
  },
  required: ["strengths", "priority_improvements", "quick_wins", "strategic_initiatives"]
};

export const MII_IMPROVEMENT_PROMPTS = {
  systemPrompt: MII_IMPROVEMENT_SYSTEM_PROMPT,
  buildPrompt: buildMIIImprovementPrompt,
  schema: MII_IMPROVEMENT_SCHEMA
};
