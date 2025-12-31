/**
 * Municipality Analysis AI Prompts
 * @module prompts/municipalities/municipalityAnalysis
 * @version 1.1.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Municipality performance analysis prompt
 */
export const MUNICIPALITY_PERFORMANCE_PROMPT_TEMPLATE = (municipality, stats) => `
Analyze municipality performance and innovation readiness:

Municipality: ${municipality.name_en}
Arabic Name: ${municipality.name_ar}
Region: ${municipality.region_name || 'Not specified'}
Population: ${municipality.population || 'Not specified'}

Statistics:
- Active Challenges: ${stats?.challenges || 0}
- Running Pilots: ${stats?.pilots || 0}
- Deployed Solutions: ${stats?.solutions || 0}
- Innovation Score: ${stats?.innovation_score || 'N/A'}

${SAUDI_CONTEXT.MUNICIPAL}

Analyze:
1. Innovation Maturity Assessment
2. Challenge Resolution Efficiency
3. Resource Utilization
4. Citizen Engagement Level
5. Vision 2030 Alignment Score
6. Recommendations for Improvement
`;

/**
 * Municipality benchmarking prompt
 */
export const MUNICIPALITY_BENCHMARK_PROMPT_TEMPLATE = (municipalities) => `
Benchmark these municipalities for innovation performance:

${municipalities.map((m, i) => `
Municipality ${i + 1}: ${m.name_en}
- Population: ${m.population || 'N/A'}
- Innovation Score: ${m.innovation_score || 'N/A'}
- Active Projects: ${m.active_projects || 0}
- Budget Utilization: ${m.budget_utilization || 'N/A'}%
`).join('\n')}

${SAUDI_CONTEXT.MUNICIPAL}

Provide:
1. Comparative Rankings
2. Best Practices Identification
3. Performance Gaps
4. Knowledge Transfer Opportunities
5. Collaborative Recommendations
`;

export const MUNICIPALITY_ANALYSIS_SYSTEM_PROMPT = `You are a municipal performance analyst for Saudi Arabian municipalities. Provide strategic analysis and benchmarking aligned with Vision 2030 municipal development goals.`;

export const MUNICIPALITY_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    innovationScore: { type: "number", description: 'Innovation maturity score 0-100' },
    maturityLevel: { type: "string", enum: ['emerging', 'developing', 'established', 'advanced', 'leading'], description: 'Maturity level' },
    strengths: { type: "array", items: { type: "string" }, description: 'Key strengths' },
    strengths_ar: { type: "array", items: { type: "string" }, description: 'Arabic strengths' },
    weaknesses: { type: "array", items: { type: "string" }, description: 'Areas for improvement' },
    weaknesses_ar: { type: "array", items: { type: "string" }, description: 'Arabic weaknesses' },
    recommendations: { type: "array", items: { type: "string" }, description: 'Recommendations' },
    recommendations_ar: { type: "array", items: { type: "string" }, description: 'Arabic recommendations' },
    vision2030Score: { type: "number", description: 'Vision 2030 alignment score 0-100' }
  },
  required: ["innovationScore", "maturityLevel", "strengths", "weaknesses", "recommendations", "vision2030Score"]
};
