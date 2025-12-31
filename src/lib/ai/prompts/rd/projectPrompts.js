import { getSystemPrompt, SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const RD_PROJECT_SYSTEM_PROMPT = getSystemPrompt('INNOVATION', true) + `

You are an expert R&D analyst specializing in research and development projects for Saudi Arabia's innovation ecosystem.

${SAUDI_CONTEXT.INNOVATION}

Analyze R&D projects with focus on:
- Research methodology and approach
- Innovation potential and IP value
- Commercialization pathway
- Resource requirements and timeline
- Collaboration opportunities
- Alignment with national priorities
`;

export const rdProjectPrompts = {
    detailInsights: {
        id: 'rd_project_detail_insights',
        name: 'Research Project Analysis',
        description: 'Analyzes R&D project details and provides comprehensive insights',
        prompt: (context) => `
Analyze this R&D project and provide comprehensive insights:

PROJECT DETAILS:
- Title: ${context.project.title_en || context.project.title}
- Status: ${context.project.status}
- Phase: ${context.project.phase || 'Not specified'}
- Start Date: ${context.project.start_date || 'Not set'}
- End Date: ${context.project.end_date || 'Not set'}
- Budget: ${context.project.budget ? `SAR ${context.project.budget.toLocaleString()}` : 'Not specified'}
- Research Area: ${context.project.research_area || 'Not specified'}

OBJECTIVES:
${context.project.objectives ? JSON.stringify(context.project.objectives, null, 2) : 'Not defined'}

METHODOLOGY:
${context.project.methodology || 'Not documented'}

EXPECTED OUTCOMES:
${context.project.expected_outcomes ? JSON.stringify(context.project.expected_outcomes, null, 2) : 'Not defined'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Provide:
1. Research Quality Assessment
2. Innovation Potential Analysis
3. Commercialization Pathway
4. Resource Optimization Recommendations
5. Collaboration Opportunities
`,
        schema: {
            type: "object",
            properties: {
                strategic_alignment: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] }
                },
                trl_recommendations: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] }
                },
                pilot_applications: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] }
                },
                collaboration_opportunities: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] }
                },
                risk_mitigation: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] }
                }
            },
            required: ['strategic_alignment', 'trl_recommendations', 'pilot_applications', 'collaboration_opportunities', 'risk_mitigation']
        }
    },
    portfolioAnalysis: {
        id: 'rd_portfolio_analysis',
        name: 'Research Portfolio Analysis',
        description: 'Analyzes the entire R&D portfolio for gaps and opportunities',
        prompt: (context) => `
Analyze R&D portfolio:

Total projects: ${context.projects.length}
Active: ${context.activeProjects.length}
Publications: ${context.totalPublications}
Patents: ${context.totalPatents}
Avg TRL gain: ${Math.round(context.avgTRLGain * 10) / 10}

Research areas: ${JSON.stringify(context.chartData)}

Provide:
1. Portfolio diversity assessment
2. Research gaps to address
3. Commercialization potential (TRL advancement)
4. Recommendations for next R&D calls
`,
        schema: {
            type: 'object',
            properties: {
                diversity_score: { type: 'number' },
                gaps: { type: 'array', items: { type: 'string' } },
                commercialization_opportunities: { type: 'array', items: { type: 'string' } },
                call_recommendations: { type: 'array', items: { type: 'string' } }
            },
            required: ['diversity_score', 'gaps', 'commercialization_opportunities', 'call_recommendations']
        }
    },
    portfolioPlanner: {
        id: 'rd_portfolio_planner',
        name: 'Research Portfolio Planner',
        description: 'Creates strategic R&D portfolio plan based on gaps',
        prompt: (context) => `
Create a strategic R&D portfolio plan for Saudi municipal innovation:

Current State:
- Active R&D Projects: ${context.projects.length}
- R&D Calls: ${context.calls.length}
- Unaddressed Challenges: ${context.gapChallenges.length}
- Challenges by sector: ${context.challenges.slice(0, 10).map(c => `${c.sector}: ${c.title_en}`).join('; ')}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Generate bilingual recommendations for:
1. Recommended R&D calls for next 12 months (3-5 calls)
2. Budget allocation across research themes
3. Priority research areas based on challenge gaps
4. Timeline for call launches
5. Expected TRL progression targets

Each recommendation should include English and Arabic versions.
`,
        schema: {
            type: 'object',
            properties: {
                recommended_calls: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title_en: { type: 'string' },
                            title_ar: { type: 'string' },
                            focus_area_en: { type: 'string' },
                            focus_area_ar: { type: 'string' },
                            budget: { type: 'number' },
                            timeline_en: { type: 'string' },
                            timeline_ar: { type: 'string' },
                            expected_projects: { type: 'number' },
                            priority: { type: 'string' }
                        },
                        required: ['title_en', 'title_ar', 'budget', 'priority']
                    }
                },
                research_themes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            theme_en: { type: 'string' },
                            theme_ar: { type: 'string' },
                            budget_percentage: { type: 'number' },
                            rationale_en: { type: 'string' },
                            rationale_ar: { type: 'string' }
                        },
                        required: ['theme_en', 'theme_ar', 'budget_percentage']
                    }
                },
                portfolio_balance: {
                    type: 'object',
                    properties: {
                        short_term_percentage: { type: 'number' },
                        long_term_percentage: { type: 'number' },
                        justification_en: { type: 'string' },
                        justification_ar: { type: 'string' }
                    },
                    required: ['short_term_percentage', 'long_term_percentage']
                }
            },
            required: ['recommended_calls', 'research_themes', 'portfolio_balance']
        }
    }
};
