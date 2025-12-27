import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

export const RD_CALL_SYSTEM_PROMPT = getSystemPrompt('rd_consultant', `
You are an expert R&D consultant helping to draft professional research calls.
Focus on clarity, alignment with national priorities, and specific evaluation criteria.
${SAUDI_CONTEXT.VISION_2030}
`);

export const rdCallPrompts = {
    enhance: {
        id: 'rd_call_enhance',
        name: 'Enhance Research Call',
        description: 'Generates professional content for R&D calls',
        prompt: (context) => `
Enhance this R&D call with professional content for Saudi municipal innovation:

Title: ${context.formData.title_en}
Current Description: ${context.formData.description_en || 'N/A'}
Current Themes: ${context.formData.research_themes?.map(t => t.theme).join(', ') || 'N/A'}
Call Type: ${context.formData.call_type || 'open_call'}

Generate comprehensive enhanced bilingual content:
1. Improved title (keep essence, make more professional) and tagline (EN + AR)
2. Professional detailed description (EN + AR) - 500+ words explaining scope, importance, alignment with Vision 2030
3. Clear objectives in both languages
4. Enhanced/expanded research themes with descriptions (3-5 themes)
5. Expected outcomes/deliverables (5-7 items)
6. Eligibility criteria (5-7 items)
7. Evaluation criteria with weights (4-5 items, weights sum to 100)
8. Submission requirements (3-5 items)
9. Focus areas/keywords (5-8 items)
`,
        schema: {
            type: 'object',
            properties: {
                title_en: { type: 'string' },
                title_ar: { type: 'string' },
                tagline_en: { type: 'string' },
                tagline_ar: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                objectives_en: { type: 'string' },
                objectives_ar: { type: 'string' },
                expected_outcomes: { type: 'array', items: { type: 'string' } },
                eligibility_criteria: { type: 'array', items: { type: 'string' } },
                research_themes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            theme: { type: 'string' },
                            description: { type: 'string' }
                        }
                    }
                },
                evaluation_criteria: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            criterion: { type: 'string' },
                            description: { type: 'string' },
                            weight: { type: 'number' }
                        }
                    }
                },
                submission_requirements: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            requirement: { type: 'string' },
                            description: { type: 'string' },
                            mandatory: { type: 'boolean' }
                        }
                    }
                },
                focus_areas: { type: 'array', items: { type: 'string' } }
            }
        }
    },
    draft: {
        id: 'rd_call_draft',
        name: 'Draft Research Call',
        description: 'Drafts a complete R&D call from minimal input',
        prompt: (context) => `
Generate a complete R&D call for Saudi municipal innovation based on:
Title: ${context.title_en || ''}
Call Type: ${context.call_type || 'open_call'}

Create comprehensive bilingual content for a professional research funding call. Include:
1. Arabic translation of the title
2. Catchy taglines in both languages
3. Detailed professional descriptions (500+ words each) explaining the call's purpose, scope, and importance
4. Clear objectives in both languages
5. Arabic objectives translation
6. 5-7 eligibility criteria for applicants
7. 5-7 expected outcomes/deliverables
8. 3-5 research themes with descriptions
9. 4-5 evaluation criteria with weights (must sum to 100)
10. 3-5 submission requirements

Make the content specific to Saudi Arabia's municipal innovation context and Vision 2030 goals.
`,
        schema: {
            type: 'object',
            properties: {
                title_ar: { type: 'string' },
                tagline_en: { type: 'string' },
                tagline_ar: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                objectives_en: { type: 'string' },
                objectives_ar: { type: 'string' },
                eligibility_criteria: { type: 'array', items: { type: 'string' } },
                expected_outcomes: { type: 'array', items: { type: 'string' } },
                research_themes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            theme: { type: 'string' },
                            description: { type: 'string' }
                        }
                    }
                },
                evaluation_criteria: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            criterion: { type: 'string' },
                            description: { type: 'string' },
                            weight: { type: 'number' }
                        }
                    }
                },
                submission_requirements: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            requirement: { type: 'string' },
                            description: { type: 'string' },
                            mandatory: { type: 'boolean' }
                        }
                    }
                },
                focus_areas: { type: 'array', items: { type: 'string' } }
            }
        }
    },
    insights: {
        id: 'rd_call_insights',
        name: 'Research Call Insights',
        description: 'Analyzes R&D call and provides strategic insights',
        prompt: (context) => `
Analyze this R&D Call for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Call: ${context.title || 'N/A'}
Type: ${context.callType || 'N/A'}
Status: ${context.status || 'N/A'}
Total Funding: ${context.totalFunding || 'N/A'} SAR
Research Themes: ${context.researchThemes?.map(t => t.theme || t).join(', ') || 'N/A'}
Focus Areas: ${context.focusAreas?.join(', ') || 'N/A'}
Number of Proposals: ${context.proposalCount || 0}
Deadline: ${context.deadline || 'N/A'}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Strategic alignment with Vision 2030
2. Expected research impact
3. Recommendations to attract quality proposals
4. Potential collaboration opportunities with universities/research centers
5. Risk factors and mitigation suggestions
`,
        schema: {
            type: 'object',
            properties: {
                strategic_alignment: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                expected_impact: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                proposal_recommendations: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                collaboration_opportunities: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                risk_mitigation: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                }
            },
            required: ['strategic_alignment', 'expected_impact', 'proposal_recommendations', 'collaboration_opportunities', 'risk_mitigation']
        }
    },
    aggregateInsights: {
        id: 'rd_calls_aggregate_insights',
        name: 'Research Calls Aggregate Insights',
        description: 'Analyzes multiple R&D calls and proposals to provide strategic insights',
        prompt: (context) => `
Analyze these R&D calls for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

R&D Calls: ${JSON.stringify(context.callSummary || [])}

Statistics:
- Total Calls: ${context.stats?.totalCalls || 0}
- Open Calls: ${context.stats?.openCalls || 0}
- Total Proposals: ${context.stats?.totalProposals || 0}
- Approved Proposals: ${context.stats?.approvedProposals || 0}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Research priority alignment with national needs
2. Proposal quality and competitiveness trends
3. Funding allocation optimization
4. Emerging research themes to prioritize
5. Success factors for future calls
`,
        schema: {
            type: 'object',
            properties: {
                research_alignment: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                proposal_trends: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                funding_optimization: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                emerging_themes: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                },
                success_factors: {
                    type: 'array',
                    items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
                }
            }
        }
    }
};
