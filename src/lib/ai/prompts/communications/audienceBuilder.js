/**
 * Audience Builder Prompts
 * @module communications/audienceBuilder
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const AUDIENCE_BUILDER_SYSTEM_PROMPT = getSystemPrompt('audience_builder', `
You are an audience segmentation specialist for Saudi Arabia's municipal innovation platform.
Your role is to help build targeted audience segments for communications campaigns.
Consider demographics, engagement history, and regional preferences.
`);

export function buildAudienceBuilderPrompt({ campaign, availableSegments, goals }) {
  return `Build optimal audience segments for this campaign:

CAMPAIGN: ${campaign.name || 'Unnamed Campaign'}
TYPE: ${campaign.type || 'General'}
GOALS: ${goals?.join(', ') || 'Maximize engagement'}

AVAILABLE SEGMENTS (${availableSegments?.length || 0}):
${availableSegments?.slice(0, 10).map(s => `- ${s.name}: ${s.size} contacts`).join('\n') || 'No segments available'}

Recommend:
1. Primary target audience
2. Secondary audiences
3. Exclusion criteria
4. Personalization recommendations
5. Optimal send times by segment
6. Expected engagement rates`;
}

export const AUDIENCE_BUILDER_SCHEMA = {
  type: "object",
  properties: {
    primary_audience: {
      type: "object",
      properties: {
        segments: { type: "array", items: { type: "string" } },
        estimated_size: { type: "number" },
        rationale: { type: "string" }
      }
    },
    secondary_audiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          segments: { type: "array", items: { type: "string" } },
          estimated_size: { type: "number" },
          priority: { type: "number" }
        }
      }
    },
    exclusions: { type: "array", items: { type: "string" } },
    personalization_tips: { type: "array", items: { type: "string" } },
    optimal_send_times: {
      type: "array",
      items: {
        type: "object",
        properties: {
          segment: { type: "string" },
          best_time: { type: "string" },
          timezone: { type: "string" }
        }
      }
    },
    expected_engagement: { type: "number" }
  },
  required: ["primary_audience", "expected_engagement"]
};

export const AUDIENCE_BUILDER_PROMPTS = {
  systemPrompt: AUDIENCE_BUILDER_SYSTEM_PROMPT,
  buildPrompt: buildAudienceBuilderPrompt,
  schema: AUDIENCE_BUILDER_SCHEMA
};
