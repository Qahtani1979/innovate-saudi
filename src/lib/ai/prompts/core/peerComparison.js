/**
 * AI Peer Comparison Prompt
 * Used by: AIPeerComparison.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildPeerComparisonPrompt = (pilot, similarPilots) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing pilot performance for Saudi Arabia's Ministry of Municipalities and Housing innovation ecosystem.

## CURRENT PILOT
- Title: ${pilot.title_en}
- Sector: ${pilot.sector}
- Budget: ${pilot.budget} SAR
- Duration: ${pilot.duration_weeks} weeks
- KPIs: ${JSON.stringify(pilot.kpis)}
- Success Probability: ${pilot.success_probability}%
- Stage: ${pilot.stage}

## PEER PILOTS FOR COMPARISON
${similarPilots.map((p, i) => `
${i + 1}. ${p.title_en}
   - Budget: ${p.budget} SAR
   - Duration: ${p.duration_weeks} weeks
   - Stage: ${p.stage}
   - Success: ${p.success_probability}%
`).join('\n')}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Provide comprehensive peer comparison including:
1. Overall comparison summary (bilingual)
2. Budget position analysis (above/below/average peers)
3. Timeline comparison (faster/slower/average)
4. Success factors from top performers
5. Risk areas identified in peer failures
6. Recommendations for improvement
7. Performance rankings by aspect`;
};

export const peerComparisonSchema = {
  type: "object",
  required: ["summary_en", "summary_ar", "budget_comparison", "timeline_comparison"],
  properties: {
    summary_en: { type: "string", minLength: 100 },
    summary_ar: { type: "string", minLength: 100 },
    budget_comparison: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["above_average", "average", "below_average"] },
        insight_en: { type: "string" },
        insight_ar: { type: "string" }
      }
    },
    timeline_comparison: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["faster", "average", "slower"] },
        insight_en: { type: "string" },
        insight_ar: { type: "string" }
      }
    },
    success_factors_en: { type: "array", items: { type: "string" } },
    success_factors_ar: { type: "array", items: { type: "string" } },
    risk_areas_en: { type: "array", items: { type: "string" } },
    risk_areas_ar: { type: "array", items: { type: "string" } },
    recommendations_en: { type: "array", items: { type: "string" } },
    recommendations_ar: { type: "array", items: { type: "string" } },
    peer_rankings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          aspect_en: { type: "string" },
          aspect_ar: { type: "string" },
          rank: { type: "number" },
          total: { type: "number" }
        }
      }
    }
  }
};

export const PEER_COMPARISON_SYSTEM_PROMPT = `You are an AI performance analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. You compare pilot projects against their peers to identify best practices, success factors, and areas for improvement across the Kingdom's municipal innovation initiatives.`;
