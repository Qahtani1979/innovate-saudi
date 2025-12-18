/**
 * Competitor Analysis AI Prompts
 * Analyzes competitive landscape for solutions
 * @module solutions/competitor
 */

export const COMPETITOR_ANALYSIS_SYSTEM_PROMPT = `You are an expert in competitive analysis for Saudi Arabian government technology solutions.

ANALYSIS FRAMEWORK:
1. Market Positioning
   - Competitor identification
   - Market share analysis
   - Positioning strategy
   - Differentiation factors

2. Feature Comparison
   - Functionality mapping
   - Capability gaps
   - Unique strengths
   - Innovation level

3. Pricing Intelligence
   - Pricing models
   - Value proposition
   - Cost comparison
   - ROI analysis

4. Strategic Insights
   - Competitive advantages
   - Market opportunities
   - Threat assessment
   - Recommendations

CONTEXT:
- Saudi government procurement landscape
- Local vs international providers
- Arabic/English bilingual support`;

export const COMPETITOR_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    competitive_position: { type: "string", enum: ["leader", "challenger", "follower", "niche"] },
    market_analysis: {
      type: "object",
      properties: {
        total_competitors: { type: "number" },
        market_size: { type: "string" },
        growth_rate: { type: "string" }
      }
    },
    competitors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          market_share: { type: "number" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          pricing_model: { type: "string" },
          threat_level: { type: "string" }
        }
      }
    },
    feature_comparison: {
      type: "array",
      items: {
        type: "object",
        properties: {
          feature: { type: "string" },
          our_solution: { type: "string" },
          competitor_avg: { type: "string" },
          advantage: { type: "boolean" }
        }
      }
    },
    differentiation_opportunities: { type: "array", items: { type: "string" } },
    strategic_recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["competitive_position", "competitors"]
};

export const buildCompetitorAnalysisPrompt = (solutionData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze competitive landscape for:

SOLUTION: ${solutionData.name || 'Not specified'}
CATEGORY: ${solutionData.category || 'Technology'}
SECTOR: ${solutionData.sector || 'Government'}

KEY FEATURES:
${solutionData.features?.map(f => `- ${f}`).join('\n') || 'Not specified'}

PRICING: ${solutionData.pricing || 'Not disclosed'}

KNOWN COMPETITORS:
${solutionData.knownCompetitors?.map(c => `- ${c}`).join('\n') || 'Not specified'}

TARGET MARKET:
${solutionData.targetMarket || 'Saudi government entities'}

Provide comprehensive competitive analysis with strategic recommendations.`;
};

export const COMPETITOR_ANALYSIS_PROMPTS = {
  system: COMPETITOR_ANALYSIS_SYSTEM_PROMPT,
  schema: COMPETITOR_ANALYSIS_SCHEMA,
  buildPrompt: buildCompetitorAnalysisPrompt
};

export default COMPETITOR_ANALYSIS_PROMPTS;
