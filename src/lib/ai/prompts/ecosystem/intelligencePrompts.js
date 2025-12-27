import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

const BASE_SYSTEM_PROMPT = getSystemPrompt('FULL', true);

// Competition & Intelligence Prompts
export const intelligencePrompts = {
    competitiveAnalysis: {
        id: 'competitive_analysis',
        name: 'Competitive Analysis',
        description: 'Analyzes competitive landscape for Saudi municipal innovation',
        system: BASE_SYSTEM_PROMPT + `
You are a global smart city competitive analyst specializing in Saudi Arabia's municipal innovation ecosystem.
Provide actionable insights that leverage Saudi's unique position and resources.`,
        prompt: (context) => `
Analyze competitive landscape for Saudi municipal innovation:

Competitors: ${JSON.stringify(context.competitors)}
Key Metrics Comparison: ${JSON.stringify(context.metrics || {})}
Saudi Current Position: ${JSON.stringify(context.saudiPosition || {})}

Provide:
1. Strengths where Saudi leads or can leverage unique advantages
2. Critical gaps vs best-in-class global smart cities
3. Best practices to adopt from leading cities
4. Strategic recommendations aligned with Vision 2030`,
        schema: {
            type: 'object',
            properties: {
                strengths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Areas where Saudi leads or has advantages'
                },
                gaps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Critical gaps vs best-in-class cities'
                },
                best_practices: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Best practices to adopt from leading cities'
                },
                recommendations: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Strategic recommendations for improvement'
                }
            },
            required: ['strengths', 'gaps', 'best_practices', 'recommendations']
        }
    },
    benchmarkComparison: {
        id: 'benchmark_comparison',
        name: 'Benchmark Comparison',
        description: 'Compare innovation performance between two cities',
        system: BASE_SYSTEM_PROMPT + `
You are a municipal innovation benchmarking expert.`,
        prompt: (context) => `
Compare innovation performance between two cities:

City 1: ${context.city1?.name || 'N/A'} - Metrics: ${JSON.stringify(context.city1?.metrics || {})}
City 2: ${context.city2?.name || 'N/A'} - Metrics: ${JSON.stringify(context.city2?.metrics || {})}

Provide detailed comparison and actionable insights for Saudi municipalities.`,
        schema: {
            type: 'object',
            properties: {
                comparison_summary: { type: 'string' },
                city1_strengths: { type: 'array', items: { type: 'string' } },
                city2_strengths: { type: 'array', items: { type: 'string' } },
                lessons_for_saudi: { type: 'array', items: { type: 'string' } }
            }
        }
    }
};
