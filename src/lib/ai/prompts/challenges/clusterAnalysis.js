/**
 * Challenge Cluster Analysis Prompts
 * @module challenges/clusterAnalysis
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CLUSTER_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('cluster_analysis', `
You are a challenge clustering specialist for Saudi municipal innovation.
Your role is to identify patterns, group related challenges, and discover systemic issues.
Consider cross-sector dependencies and root cause relationships.
`);

/**
 * Build cluster analysis prompt
 * @param {Object} params - Challenges data
 * @returns {string} Formatted prompt
 */
export function buildClusterAnalysisPrompt({ challenges, existingClusters }) {
  return `Analyze and cluster these municipal challenges:

CHALLENGES (${challenges?.length || 0} total):
${(challenges || []).slice(0, 20).map((c, i) => 
  `${i + 1}. [${c.code || c.id}] ${c.title_en || c.title} | Sector: ${c.sector || 'N/A'} | Status: ${c.status || 'N/A'}`
).join('\n')}

EXISTING CLUSTERS: ${JSON.stringify(existingClusters || [])}

Identify:
1. Thematic clusters (challenges sharing common themes)
2. Causal clusters (challenges with shared root causes)
3. Geographic clusters (location-based patterns)
4. Systemic issues (underlying problems affecting multiple challenges)
5. Cross-sector patterns
6. Recommended intervention points`;
}

export const CLUSTER_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    thematic_clusters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          challenge_ids: { type: "array", items: { type: "string" } },
          common_themes: { type: "array", items: { type: "string" } }
        }
      }
    },
    causal_clusters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          root_cause: { type: "string" },
          challenge_ids: { type: "array", items: { type: "string" } }
        }
      }
    },
    systemic_issues: { type: "array", items: { type: "string" } },
    intervention_points: { type: "array", items: { type: "string" } }
  },
  required: ["thematic_clusters", "systemic_issues"]
};

export const CLUSTER_ANALYSIS_PROMPTS = {
  systemPrompt: CLUSTER_ANALYSIS_SYSTEM_PROMPT,
  buildPrompt: buildClusterAnalysisPrompt,
  schema: CLUSTER_ANALYSIS_SCHEMA
};
