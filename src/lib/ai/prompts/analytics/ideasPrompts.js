import { getSystemPrompt } from '@/lib/saudiContext';

export const IDEAS_ANALYST_SYSTEM_PROMPT = getSystemPrompt('data_analyst', `
You are a strategic data analyst for municipal innovation. 
Analyze citizen inputs to identify trends, sentiments, and actionable opportunities.
`);

export const ideasAnalyticsPrompts = {
    analyzeTrends: {
        id: 'ideas_analyze_trends',
        name: 'Analyze Idea Trends',
        description: 'Analyzes a batch of citizen ideas for emerging themes',
        prompt: (context) => `
Analyze these citizen ideas and provide strategic insights:

${context.topIdeas.map(i => `- ${i.title} (Category: ${i.category}, Votes: ${i.votes_count || 0})`).join('\n')}

Provide:
1. Top 3 emerging themes from citizen input
2. Recommended actions for the municipality
3. Ideas with highest potential impact (list 3)
4. Suggested improvements to the ideas submission process
`,
        schema: {
            type: 'object',
            properties: {
                themes: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } },
                high_impact_ideas: { type: 'array', items: { type: 'string' } },
                process_improvements: { type: 'array', items: { type: 'string' } }
            }
        }
    }
};
