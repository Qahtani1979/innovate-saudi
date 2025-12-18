/**
 * Program Analysis AI Prompts
 * @module prompts/programs/programAnalysis
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Program performance analysis prompt
 */
export const PROGRAM_PERFORMANCE_PROMPT_TEMPLATE = (program) => `
Analyze this program's performance and impact:

Program: ${program.title_en || program.title}
Status: ${program.status || 'active'}
Budget: ${program.budget || 'Not specified'} SAR
Timeline: ${program.start_date} to ${program.end_date}
Completion: ${program.completion_percentage || 0}%

Objectives:
${program.objectives?.map(o => `- ${o}`).join('\n') || 'Not specified'}

KPIs:
${JSON.stringify(program.kpis || {}, null, 2)}

${SAUDI_CONTEXT}

Provide:
1. Performance Assessment (score 0-100)
2. Goal Achievement Analysis
3. Risk Factors
4. Recommendations for Improvement
5. Vision 2030 Alignment Score
`;

/**
 * Program comparison prompt
 */
export const PROGRAM_COMPARISON_PROMPT_TEMPLATE = (programs) => `
Compare these programs for strategic decision-making:

${programs.map((p, i) => `
Program ${i + 1}: ${p.title_en || p.title}
- Budget: ${p.budget || 'N/A'} SAR
- Status: ${p.status}
- Completion: ${p.completion_percentage || 0}%
- ROI: ${p.roi || 'Not calculated'}
`).join('\n')}

${SAUDI_CONTEXT}

Compare:
1. Cost Effectiveness
2. Impact Potential
3. Resource Utilization
4. Strategic Value
5. Scalability
`;

export const PROGRAM_ANALYSIS_SYSTEM_PROMPT = `You are a program management analyst for Saudi Arabian government initiatives. Evaluate programs against Vision 2030 objectives and provide strategic recommendations.`;

export const PROGRAM_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    performanceScore: { type: "number" },
    goalAchievement: { type: "string" },
    risks: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    vision2030Score: { type: "number" }
  },
  required: ["performanceScore", "recommendations"]
};
