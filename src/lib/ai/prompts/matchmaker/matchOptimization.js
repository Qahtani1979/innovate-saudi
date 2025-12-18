/**
 * Matchmaker Optimization AI Prompts
 * Centralized prompts for challenge-solution matching optimization
 * @module matchmaker/matchOptimization
 */

export const MATCH_OPTIMIZATION_SYSTEM_PROMPT = `You are an expert matchmaking advisor for the Saudi innovation ecosystem.

MATCHING FRAMEWORK:
1. Compatibility Assessment
   - Technical fit analysis
   - Sector alignment
   - Scale appropriateness
   - Budget compatibility

2. Success Prediction
   - Historical success patterns
   - Risk factor analysis
   - Implementation complexity
   - Stakeholder readiness

3. Recommendation Generation
   - Ranked match suggestions
   - Alternative options
   - Gap identification
   - Enhancement suggestions

4. Value Analysis
   - Expected ROI
   - Time-to-value
   - Resource efficiency
   - Strategic alignment

CONTEXT:
- Saudi government procurement guidelines
- Vision 2030 innovation priorities
- Municipal governance requirements
- Arabic/English bilingual support`;

export const MATCH_OPTIMIZATION_SCHEMA = {
  type: "object",
  properties: {
    match_quality: {
      type: "number",
      description: "Overall match quality score (0-100)"
    },
    compatibility_breakdown: {
      type: "object",
      properties: {
        technical_fit: { type: "number" },
        sector_alignment: { type: "number" },
        scale_match: { type: "number" },
        budget_fit: { type: "number" },
        timeline_compatibility: { type: "number" }
      }
    },
    success_probability: {
      type: "number",
      description: "Predicted success probability (0-100)"
    },
    risk_factors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          factor: { type: "string" },
          severity: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    },
    value_proposition: {
      type: "object",
      properties: {
        expected_roi: { type: "string" },
        time_to_value: { type: "string" },
        cost_savings: { type: "string" },
        efficiency_gains: { type: "string" }
      }
    },
    recommended_actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          priority: { type: "string" },
          owner: { type: "string" },
          timeline: { type: "string" }
        }
      }
    },
    alternative_matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          solution_name: { type: "string" },
          match_score: { type: "number" },
          key_strengths: { type: "array", items: { type: "string" } }
        }
      }
    },
    gaps_identified: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["match_quality", "compatibility_breakdown", "success_probability"]
};

export const buildMatchOptimizationPrompt = (challenge, solution, language = 'en') => {
  const langInstruction = language === 'ar' 
    ? 'Respond in Arabic.' 
    : 'Respond in English.';

  return `${langInstruction}

Analyze match quality between:

CHALLENGE:
- Title: ${challenge.title_en || challenge.title}
- Sector: ${challenge.sector || 'Not specified'}
- Municipality: ${challenge.municipality || 'Not specified'}
- Budget: ${challenge.budget || 'N/A'} SAR
- Priority: ${challenge.priority || 'Medium'}
- Requirements: ${challenge.requirements?.join(', ') || 'Not specified'}

SOLUTION:
- Name: ${solution.name_en || solution.name}
- Provider: ${solution.provider || 'Not specified'}
- Type: ${solution.type || 'Not specified'}
- Price: ${solution.price || 'N/A'} SAR
- Capabilities: ${solution.capabilities?.join(', ') || 'Not specified'}
- Past deployments: ${solution.deployments || 0}

MATCHING CONTEXT:
- Similar past matches: ${challenge.similarMatches || 0}
- Success rate for sector: ${challenge.sectorSuccessRate || 'N/A'}%

Provide comprehensive match analysis with success prediction and optimization recommendations.`;
};

export const MATCH_OPTIMIZATION_PROMPTS = {
  system: MATCH_OPTIMIZATION_SYSTEM_PROMPT,
  schema: MATCH_OPTIMIZATION_SCHEMA,
  buildPrompt: buildMatchOptimizationPrompt
};

export default MATCH_OPTIMIZATION_PROMPTS;
