/**
 * Network Intelligence Analysis Prompts
 * AI-powered network pattern detection and collaboration analysis
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const NETWORK_INTELLIGENCE_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are an innovation network intelligence analyst. Detect collaboration patterns, identify network gaps, and recommend strategic partnerships for Saudi municipal innovation ecosystems.`;

export const NETWORK_INTELLIGENCE_PROMPT_TEMPLATE = (data = {}) => `Analyze the innovation network and detect patterns:

Organizations: ${data.organizationCount || 0}
Active Pilots: ${data.pilotCount || 0}
R&D Projects: ${data.rdProjectCount || 0}

Sample Collaboration Data:
${JSON.stringify(data.collaborationData || [], null, 2)}

Provide:
1. Top 5 most connected organizations (centrality analysis)
2. Emerging collaboration clusters (which orgs work together frequently)
3. Network gaps (sectors/cities lacking connections)
4. Strategic connector recommendations (who to introduce to whom)
5. Collaboration health score (0-100)`;

export const NETWORK_INTELLIGENCE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    top_connectors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          organization: { type: "string" },
          connection_count: { type: "number" },
          influence_score: { type: "number" }
        }
      }
    },
    clusters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          cluster_name: { type: "string" },
          members: { type: "array", items: { type: "string" } },
          focus: { type: "string" }
        }
      }
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          issue: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    },
    introductions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          party_a: { type: "string" },
          party_b: { type: "string" },
          synergy: { type: "string" }
        }
      }
    },
    health_score: { type: "number" }
  }
};

export default {
  NETWORK_INTELLIGENCE_SYSTEM_PROMPT,
  NETWORK_INTELLIGENCE_PROMPT_TEMPLATE,
  NETWORK_INTELLIGENCE_RESPONSE_SCHEMA
};
