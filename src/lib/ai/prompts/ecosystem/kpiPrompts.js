import { getSystemPrompt } from '@/lib/saudiContext';

export const KPI_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert in Performance Management and KPIs for Saudi municipal projects.
Focus on:
- Vision 2030 alignment
- Measurable outcomes
- Data availability
- Performance forecasting
`;

export const kpiPrompts = {
    strategicInsights: {
        id: 'kpi_strategic_insights',
        name: 'Strategic KPI Insights',
        description: 'Analyze KPI performance',
        prompt: (context) => `Analyze these KPIs and provide strategic insights:
        ${JSON.stringify(context, null, 2)}
        Suggest improvements.`,
        schema: {
            type: 'object',
            properties: {
                insights: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
            }
        }
    }
};
