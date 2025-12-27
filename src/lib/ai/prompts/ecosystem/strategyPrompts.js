import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

const BASE_SYSTEM_PROMPT = getSystemPrompt('FULL', true);

export const STRATEGY_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

You are a Strategic Advisor AI for the Innovate Saudi platform. 
Your goal is to provide strategic insights, identifying gaps, risks, and opportunities in the innovation portfolio.
You must always align with Vision 2030 and MoMAH directives.`;

export const STRATEGY_COPILOT_SYSTEM_PROMPT = `You are a strategic advisor for Saudi municipal innovation, deeply knowledgeable about Vision 2030, municipal governance, and public sector innovation.

EXPERTISE AREAS:
- Budget allocation and financial planning for municipal projects
- Portfolio analysis and optimization
- Strategic planning and roadmap development
- Innovation program management
- Performance measurement and KPIs
- Stakeholder engagement strategies
- Risk assessment and mitigation

CONTEXT:
- You have access to data about challenges, pilots, R&D projects, programs, and strategic plans
- You operate within the Saudi municipal innovation ecosystem
- You understand the regulatory environment and compliance requirements

RESPONSE GUIDELINES:
- Provide specific, actionable advice based on Saudi municipal context
- Use data-driven insights when possible
- Reference relevant Vision 2030 objectives where applicable
- Consider budget constraints and resource allocation
- Recommend measurable outcomes and success metrics
- Be concise but comprehensive
- Support Arabic and English responses based on user's language`;

export const strategyPrompts = {
    copilot: {
        id: 'strategy_copilot',
        name: 'Strategy Copilot',
        description: 'AI-powered strategic advisor for municipal innovation',
        prompt: (context) => `
USER QUESTION:
${context.input}

${context.additionalContext ? `ADDITIONAL CONTEXT:\n${context.additionalContext}` : ''}

Provide specific, actionable advice based on Saudi municipal context. Use data-driven insights when possible.
`,
        schema: {
            type: 'object',
            properties: {
                response: { type: 'string' }
            }
        }
    },
    advisorChat: {
        id: 'strategy_advisor_chat',
        name: 'Strategic Advisor Chat',
        description: 'Main interaction with the strategic advisor',
        prompt: (context) => `
CONTEXT HISTORY:
${context.history}

USER QUERY:
${context.input}

Provide a strategic response based on the context above.
`,
        schema: {
            type: 'object',
            properties: {
                response: { type: 'string' }
            }
        }
    },
    cockpitInsights: {
        id: 'strategy_cockpit_insights',
        name: 'Strategy Cockpit Insights',
        description: 'Analyzes strategic portfolio for insights',
        prompt: (context) => `
Analyze this strategic portfolio for Saudi municipal innovation and provide strategic insights:

Challenges: ${context.challengesCount}
Active Pilots: ${context.activePilots}
Completed: ${context.completedPilots}
At Risk: ${context.atRiskPilots}
Programs: ${context.programsCount}

Portfolio by Sector: ${JSON.stringify(context.portfolioHeatmap)}

Provide insights in format:
1. Strategic focus recommendations for next quarter
2. Portfolio balance and diversification analysis  
3. Risk mitigation priorities
4. Acceleration opportunities
5. Resource reallocation suggestions
`,
        schema: {
            type: 'object',
            properties: {
                strategic_focus: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
                portfolio_balance: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
                risk_priorities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
                acceleration_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
                resource_reallocation: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
            }
        }
    },
    executionInsights: {
        id: 'strategy_execution_insights',
        name: 'Strategic Execution Insights',
        description: 'Analyzes strategic plan execution progress',
        prompt: (context) => `
Analyze strategic plan execution progress and provide actionable insights.

Plan: ${context.activePlan.name_en}
Themes Progress: ${JSON.stringify(context.themeProgress)}
Total Challenges: ${context.totalChallenges}
Active Pilots: ${context.activePilots}
Completed Pilots: ${context.completedPilots}

Provide 3-5 critical insights about:
1. Themes that are behind schedule and recommended actions
2. Opportunities to accelerate progress
3. Resource reallocation suggestions

Be specific and actionable.
`,
        schema: {
            type: "object",
            properties: {
                insights: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string", enum: ["alert", "recommendation", "opportunity"] },
                            title: { type: "string" },
                            description: { type: "string" },
                            action: { type: "string" }
                        }
                    }
                }
            }
        }
    }
};
