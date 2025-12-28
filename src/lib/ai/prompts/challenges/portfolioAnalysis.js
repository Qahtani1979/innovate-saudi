/**
 * Challenge Portfolio Analysis Prompts
 * Strategic insights for challenge management
 */

export const CHALLENGE_PORTFOLIO_SYSTEM_PROMPT = `You are an expert innovation consultant analyzing a portfolio of Saudi municipal challenges.
Your goal is to identify strategic patterns, opportunities, and risks across the challenge portfolio.
`;

export const CHALLENGE_PORTFOLIO_PROMPT_TEMPLATE = (challenges) => `
Analyze the following top priority municipal challenges and provide strategic insights.

CONTEXT:
${challenges.map(c => `
ID: ${c.code}
Title: ${c.title_en}
Sector: ${c.sector}
Priority: ${c.priority}
Description: ${c.description_en}
`).join('\n---\n')}

Provide specific, actionable insights in the following categories:
1. Common Patterns: Recurring themes or issues across challenges
2. Priority Sectors: Which sectors need most attention and why
3. Systemic Solutions: Solutions that could address multiple challenges
4. Risk Alerts: Potential implementation risks or strategic gaps
5. Quick Wins: Challenges that can be addressed immediately with high impact
6. Strategic Recommendations: High-level advice for the portfolio manager
7. Coordination Opportunities: Where different municipalities/departments should collaborate
8. Technology Opportunities: Emerging tech that could solve these challenges

Ensure all insights are provided in both English and Arabic where specified in the schema.
`;

export const CHALLENGE_PORTFOLIO_RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
        patterns: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                }
            }
        },
        priority_sectors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    sector: { type: 'string' },
                    reason_en: { type: 'string' },
                    reason_ar: { type: 'string' }
                }
            }
        },
        systemic_solutions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                }
            }
        },
        risk_alerts: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                }
            }
        },
        quick_wins: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    challenge_code: { type: 'string' },
                    approach_en: { type: 'string' },
                    approach_ar: { type: 'string' }
                }
            }
        },
        recommendations_en: { type: 'string' },
        recommendations_ar: { type: 'string' },
        coordination_opportunities: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                }
            }
        },
        technology_opportunities: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    en: { type: 'string' },
                    ar: { type: 'string' }
                }
            }
        }
    }
};
