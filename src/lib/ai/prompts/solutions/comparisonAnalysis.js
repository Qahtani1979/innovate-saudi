/**
 * Solution Comparison AI Prompts
 * Centralized prompts for solution comparison and selection
 * @module solutions/comparisonAnalysis
 */

export const SOLUTION_COMPARISON_SYSTEM_PROMPT = `You are an expert solution analyst for Saudi Arabian government technology procurement.

COMPARISON FRAMEWORK:
1. Feature Analysis
   - Capability matching
   - Technical specifications
   - Integration requirements
   - Scalability assessment

2. Value Assessment
   - Total cost of ownership
   - ROI projection
   - Time-to-value
   - Risk-adjusted returns

3. Vendor Evaluation
   - Track record
   - Local presence
   - Support capabilities
   - Financial stability

4. Fit Analysis
   - Requirements alignment
   - Cultural fit
   - Compliance readiness
   - Vision 2030 contribution

CONTEXT:
- Saudi government procurement regulations
- Local content requirements
- Arabic/English bilingual support`;

export const SOLUTION_COMPARISON_SCHEMA = {
  type: "object",
  properties: {
    recommended_solution: { type: "string" },
    confidence_score: { type: "number" },
    comparison_matrix: {
      type: "array",
      items: {
        type: "object",
        properties: {
          solution_name: { type: "string" },
          overall_score: { type: "number" },
          feature_score: { type: "number" },
          value_score: { type: "number" },
          vendor_score: { type: "number" },
          fit_score: { type: "number" }
        }
      }
    },
    key_differentiators: {
      type: "array",
      items: {
        type: "object",
        properties: {
          solution: { type: "string" },
          differentiator: { type: "string" },
          impact: { type: "string" }
        }
      }
    },
    risk_analysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          solution: { type: "string" },
          risks: { type: "array", items: { type: "string" } },
          mitigations: { type: "array", items: { type: "string" } }
        }
      }
    },
    recommendation_rationale: { type: "string" },
    alternative_considerations: { type: "array", items: { type: "string" } }
  },
  required: ["recommended_solution", "confidence_score", "comparison_matrix"]
};

export const buildSolutionComparisonPrompt = (solutions, requirements, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Compare solutions for selection:

REQUIREMENTS:
${requirements?.map(r => `- ${r}`).join('\n') || 'Not specified'}

SOLUTIONS TO COMPARE:
${solutions?.map((s, i) => `
Solution ${i + 1}: ${s.name}
- Provider: ${s.provider}
- Price: ${s.price} SAR
- Features: ${s.features?.join(', ') || 'N/A'}
- Deployments: ${s.deployments || 0}
- Rating: ${s.rating || 'N/A'}/5
`).join('\n') || 'No solutions provided'}

Provide comprehensive comparison with clear recommendation and rationale.`;
};

export const SOLUTION_COMPARISON_PROMPTS = {
  system: SOLUTION_COMPARISON_SYSTEM_PROMPT,
  schema: SOLUTION_COMPARISON_SCHEMA,
  buildPrompt: buildSolutionComparisonPrompt
};

export default SOLUTION_COMPARISON_PROMPTS;
