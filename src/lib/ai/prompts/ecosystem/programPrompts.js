import { getSystemPrompt, SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

const PROGRAM_SYSTEM_PROMPT = getSystemPrompt('INNOVATION', true) + `

You are an expert innovation consultant for Saudi municipal programs.
`;

const INSIGHTS_SYSTEM_PROMPT = getSystemPrompt('INNOVATION', true) + `

You are a program effectiveness analyst for Saudi municipal innovation programs. 
Analyze program performance, identify patterns, and recommend optimization strategies.
`;

export const programPrompts = {
    // 1. Detail Analysis
    detailAnalysis: {
        system: PROGRAM_SYSTEM_PROMPT + `
You are an expert program analyst specializing in innovation and capacity building.
Focus on: Effectiveness, Engagement, Outcomes, Scaling, and Partnerships.`,
        prompt: (context) => `Analyze this program and provide comprehensive strategic insights in BOTH English AND Arabic:

PROGRAM DETAILS:
- Name: ${context.program.name_en || context.program.name}
- Type: ${context.program.program_type || 'Not specified'}
- Status: ${context.program.status}
- Budget: ${context.program.budget ? `SAR ${context.program.budget.toLocaleString()}` : 'Not specified'}
- Participants: ${context.program.participant_count || 0}
- Outcomes: ${JSON.stringify(context.program.outcomes || {})}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Effectiveness Assessment
2. Engagement Recommendations
3. Outcome Optimization
4. Scaling Potential Assessment
5. Partnership Opportunities`,
        schema: {
            type: 'object',
            properties: {
                effectiveness: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        },
                        required: ['en', 'ar']
                    }
                },
                engagement_recommendations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        },
                        required: ['en', 'ar']
                    }
                },
                outcome_optimization: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        },
                        required: ['en', 'ar']
                    }
                },
                scaling_potential: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        },
                        required: ['en', 'ar']
                    }
                },
                partnership_opportunities: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        },
                        required: ['en', 'ar']
                    }
                }
            },
            required: ['effectiveness', 'engagement_recommendations', 'outcome_optimization', 'scaling_potential', 'partnership_opportunities']
        }
    },

    // 2. Editor / Enhancement
    editor: {
        system: PROGRAM_SYSTEM_PROMPT + `
You are an expert program designer for municipal innovation.
Focus on creating engaging, clear, and impact-oriented program descriptions.`,
        prompt: (context) => `Enhance this program description with professional, detailed bilingual content:

Program: ${context.name_en}
Type: ${context.program_type}
Current Description: ${context.description_en || 'N/A'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Generate comprehensive bilingual (English + Arabic) content:
1. Improved names (EN + AR)
2. Compelling taglines (EN + AR)
3. Detailed descriptions (EN + AR) - 250+ words each
4. Program objectives (EN + AR)`,
        schema: {
            type: 'object',
            properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                tagline_en: { type: 'string' },
                tagline_ar: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                objectives_en: { type: 'string' },
                objectives_ar: { type: 'string' }
            },
            required: ['name_en', 'name_ar', 'tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar']
        }
    },

    // 3. Ecosystem Insights
    insights: {
        system: INSIGHTS_SYSTEM_PROMPT,
        prompt: (data) => `Analyze these innovation programs for Saudi municipalities and provide strategic insights in BOTH English AND Arabic:

Programs: ${JSON.stringify(data.programSummary || [])}

Statistics:
- Total: ${data.stats?.total || 0}
- Active: ${data.stats?.active || 0}
- Completed: ${data.stats?.completed || 0}
- Total Participants: ${data.stats?.participants || 0}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Program effectiveness patterns across different types
2. Participant engagement optimization strategies
3. Outcome improvement recommendations
4. Recommendations for new program types or focus areas
5. Partnership and collaboration opportunities`,
        schema: {
            type: 'object',
            properties: {
                effectiveness_patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] } },
                engagement_optimization: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] } },
                outcome_improvements: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] } },
                new_program_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] } },
                partnership_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } }, required: ['en', 'ar'] } }
            },
            required: ['effectiveness_patterns', 'engagement_optimization', 'outcome_improvements', 'new_program_recommendations', 'partnership_opportunities']
        }
    }
};
