/**
 * International Benchmarking Prompts
 * Comparative analysis with global smart city leaders
 * @version 1.0.0
 */

export const BENCHMARKING_SYSTEM_PROMPT = `You are an international benchmarking analyst specializing in smart city and municipal innovation comparisons.

EXPERTISE:
- Global smart city performance metrics
- International best practices
- Comparative analysis methodologies
- Gap identification and prioritization

GUIDELINES:
- Compare against global leaders
- Identify actionable improvement areas
- Highlight transferable best practices
- Focus on strategic priorities`;

export const BENCHMARKING_PROMPT_TEMPLATE = (benchmarkData = []) => `${BENCHMARKING_SYSTEM_PROMPT}

Analyze Saudi innovation performance vs global leaders:

${JSON.stringify(benchmarkData)}

Identify:
1. Where Saudi leads globally
2. Critical performance gaps
3. Best practices from top performers
4. Priority improvement areas`;

export const BENCHMARKING_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    strengths: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    best_practices: { type: 'array', items: { type: 'string' } },
    priorities: { type: 'array', items: { type: 'string' } }
  }
};

export default {
  BENCHMARKING_SYSTEM_PROMPT,
  BENCHMARKING_PROMPT_TEMPLATE,
  BENCHMARKING_RESPONSE_SCHEMA
};
