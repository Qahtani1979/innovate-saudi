/**
 * Matchmaker Notification AI prompts
 * For automated notifications and deal flow
 */

export const MATCH_NOTIFIER_SYSTEM_PROMPT = `You are a business development specialist for innovation matching.
Compose personalized, professional emails about new matches.
Focus on value proposition and next steps.
All responses must be in valid JSON format.`;

export function buildMatchNotifierPrompt(provider, challenge, match) {
  return `Generate personalized email to startup about new match:

PROVIDER: ${provider.name_en}
Specialization: ${provider.specialization || 'Innovation solutions'}

CHALLENGE: ${challenge.title_en}
Municipality: ${challenge.municipality}
Sector: ${challenge.sector}

MATCH SCORE: ${match.score}%
Match Reasons: ${match.reasons?.join(', ') || 'Strong alignment'}

Create a compelling, professional email that highlights the opportunity.`;
}

export const MATCH_NOTIFIER_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string" },
    greeting: { type: "string" },
    body: { type: "string" },
    call_to_action: { type: "string" },
    closing: { type: "string" }
  },
  required: ["subject", "body", "call_to_action"]
};

export const DEAL_FLOW_SYSTEM_PROMPT = `You are a deal flow analyst for innovation partnerships.
Predict deal outcomes and identify bottlenecks in the matching process.
Provide actionable insights to accelerate successful partnerships.`;

export function buildDealFlowPrompt(matches, historicalData) {
  return `Analyze deal flow and predict outcomes:

ACTIVE MATCHES:
${matches?.map(m => `- ${m.provider} ↔ ${m.challenge}: Stage ${m.stage}, Score ${m.score}%`).join('\n') || 'No active matches'}

HISTORICAL SUCCESS RATE: ${historicalData?.successRate || 'N/A'}%
AVERAGE TIME TO CLOSE: ${historicalData?.avgTimeToClose || 'N/A'} days

Identify deals likely to close, at-risk deals, and bottlenecks.`;
}

export const DEAL_FLOW_SCHEMA = {
  type: "object",
  properties: {
    pipeline_health: { type: "string", enum: ["healthy", "moderate", "at_risk"] },
    likely_to_close: {
      type: "array",
      items: {
        type: "object",
        properties: {
          match_id: { type: "string" },
          probability: { type: "number" },
          estimated_close_date: { type: "string" }
        }
      }
    },
    at_risk_deals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          match_id: { type: "string" },
          risk_factors: { type: "array", items: { type: "string" } },
          recommended_action: { type: "string" }
        }
      }
    },
    bottlenecks: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["pipeline_health", "likely_to_close"]
};

export const PROVIDER_RANKING_SYSTEM_PROMPT = `You are a vendor evaluation specialist.
Rank providers based on capability, track record, and fit.
Provide objective, data-driven rankings.`;

export function buildProviderRankingPrompt(challenge, providers) {
  return `Rank providers for this challenge:

CHALLENGE: ${challenge.title_en}
Requirements: ${challenge.requirements?.join(', ') || 'Not specified'}
Budget: ${challenge.budget_estimate || 'Flexible'}
Timeline: ${challenge.timeline || 'Standard'}

PROVIDERS:
${providers?.map((p, i) => `${i + 1}. ${p.name_en}
   - TRL: ${p.trl}
   - Experience: ${p.experience_years} years
   - Rating: ${p.rating}/5`).join('\n') || 'No providers'}

Rank providers with detailed scoring and rationale.`;
}

export const PROVIDER_RANKING_SCHEMA = {
  type: "object",
  properties: {
    rankings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          provider_name: { type: "string" },
          rank: { type: "number" },
          overall_score: { type: "number" },
          scores: {
            type: "object",
            properties: {
              capability: { type: "number" },
              experience: { type: "number" },
              value: { type: "number" },
              fit: { type: "number" }
            }
          },
          strengths: { type: "array", items: { type: "string" } },
          concerns: { type: "array", items: { type: "string" } }
        }
      }
    },
    recommendation: { type: "string" }
  },
  required: ["rankings", "recommendation"]
};
