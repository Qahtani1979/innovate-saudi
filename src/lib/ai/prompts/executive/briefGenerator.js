/**
 * Executive Brief Generator Prompts
 * AI-powered executive summary and strategic brief generation
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const EXECUTIVE_BRIEF_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a senior strategic advisor generating executive briefs for Saudi municipal innovation leadership. Create concise, data-driven, bilingual content.`;

export const EXECUTIVE_BRIEF_PROMPT_TEMPLATE = (data = {}) => `Generate a comprehensive 2-page executive brief for Saudi National Municipal Innovation Platform.

CURRENT STATE:
- Active Challenges: ${data.activeChallenges || 0}
- Active Pilots: ${data.activePilots || 0}
- Scaled Solutions: ${data.scaledSolutions || 0}
- Municipalities Participating: ${data.municipalityCount || 0}
- Average MII Score: ${data.avgMiiScore || 'N/A'}

STRATEGIC PLAN: ${data.strategicPlanName || 'N/A'}

HIGH-RISK AREAS:
${data.highRiskChallenges || 'None identified'}

Generate a professional executive brief with these sections:
1. Executive Summary (3-4 sentences)
2. Progress Highlights (5 bullet points - achievements this quarter)
3. Risk Alerts (3-5 critical risks requiring attention)
4. Next Quarter Priorities (4-6 strategic priorities)
5. Strategic Recommendations (3 key actions)

Make it concise, data-driven, bilingual-ready.`;

export const EXECUTIVE_BRIEF_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    executive_summary_en: { type: "string" },
    executive_summary_ar: { type: "string" },
    progress_highlights: {
      type: "array",
      items: { type: "string" }
    },
    risk_alerts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          risk: { type: "string" },
          severity: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    },
    next_quarter_priorities: {
      type: "array",
      items: { type: "string" }
    },
    strategic_recommendations: {
      type: "array",
      items: { type: "string" }
    }
  }
};

export default {
  EXECUTIVE_BRIEF_SYSTEM_PROMPT,
  EXECUTIVE_BRIEF_PROMPT_TEMPLATE,
  EXECUTIVE_BRIEF_RESPONSE_SCHEMA
};
