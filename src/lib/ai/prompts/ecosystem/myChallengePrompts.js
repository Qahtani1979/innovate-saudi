
import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

const MY_CHALLENGES_SYSTEM_PROMPT = getSystemPrompt('municipal_advisor', `
You are a Saudi municipal innovation advisor. Provide actionable, concise suggestions for improving challenge outcomes. Focus on practical next steps.
${SAUDI_CONTEXT.VISION_2030}
`);

const BASE_SYSTEM_PROMPT = getSystemPrompt('FULL', true);

export const myChallengePrompts = {
    quickSuggestion: {
        system: MY_CHALLENGES_SYSTEM_PROMPT,
        prompt: (context) => `
Analyze this municipal challenge and provide quick actionable suggestions:

Title: ${context.title || 'N/A'}
Description: ${context.description?.substring(0, 200) || 'N/A'}
Status: ${context.status || 'N/A'}
Sector: ${context.sector || 'N/A'}

Provide:
1. Next recommended action
2. Priority level suggestion (keep/increase/decrease)
3. Track recommendation (pilot/r_and_d/program/procurement/policy)
4. One quick improvement tip

Consider Saudi Vision 2030 alignment and municipal context.
`,
        schema: {
            type: 'object',
            properties: {
                next_action: {
                    type: 'string',
                    description: 'Recommended next action for this challenge'
                },
                priority_suggestion: {
                    type: 'string',
                    enum: ['keep', 'increase', 'decrease'],
                    description: 'Whether to keep, increase, or decrease priority'
                },
                track_recommendation: {
                    type: 'string',
                    enum: ['pilot', 'r_and_d', 'program', 'procurement', 'policy'],
                    description: 'Recommended track for this challenge'
                },
                improvement_tip: {
                    type: 'string',
                    description: 'One quick tip to improve the challenge'
                }
            },
            required: ['next_action', 'priority_suggestion', 'track_recommendation', 'improvement_tip']
        }
    },
    portfolioAnalysis: {
        system: MY_CHALLENGES_SYSTEM_PROMPT,
        prompt: (context) => `
Analyze this user's challenge portfolio:

Total Challenges: ${context.totalCount}
Status Breakdown: ${JSON.stringify(context.statusBreakdown)}
Sector Breakdown: ${JSON.stringify(context.sectorBreakdown)}

Challenge Summaries:
${context.challenges?.slice(0, 10).map(c => `- ${c.title_en} (${c.status}, ${c.sector})`).join('\n')}

Provide:
1. Portfolio health assessment
2. Focus recommendations
3. Key actions to take
4. Potential synergies between challenges
`,
        schema: {
            type: 'object',
            properties: {
                portfolio_health: {
                    type: 'object',
                    properties: {
                        score: { type: 'number' },
                        assessment: { type: 'string' }
                    }
                },
                focus_recommendations: {
                    type: 'array',
                    items: { type: 'string' }
                },
                key_actions: {
                    type: 'array',
                    items: { type: 'string' }
                },
                synergies: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        }
    },
    analysis: {
        id: 'challenge_analysis',
        name: 'Challenge Deep Analysis',
        description: 'Deep analysis of challenge root causes, impact, and solution pathways',
        system: BASE_SYSTEM_PROMPT + `
You are an expert challenge analyst specializing in Saudi Arabia's municipal and government sector challenges.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.MUNICIPAL_CONTEXT}

Analyze challenges with focus on:
- Root cause analysis
- Impact assessment
- Stakeholder mapping
- Solution pathway identification
- Resource requirements
- Timeline estimation`,
        prompt: (context) => `Analyze this challenge and provide comprehensive insights:

CHALLENGE DETAILS:
- Title: ${context.title_en || context.title}
- Code: ${context.code || 'Not assigned'}
- Status: ${context.status || 'Not specified'}
- Priority: ${context.priority || 'Not set'}
- Category: ${context.category || 'Not categorized'}
- Sector: ${context.sector || 'Not specified'}

PROBLEM STATEMENT:
${context.problem_statement_en || context.description_en || 'Not provided'}

ROOT CAUSES:
${context.root_causes ? context.root_causes.join(', ') : 'Not identified'}

AFFECTED POPULATION:
${context.affected_population_size ? `${context.affected_population_size.toLocaleString()} people` : 'Not estimated'}

CURRENT SITUATION:
${context.current_situation_en || 'Not documented'}

DESIRED OUTCOME:
${context.desired_outcome_en || 'Not defined'}

Provide:
1. Challenge Assessment
2. Root Cause Analysis
3. Impact Analysis
4. Solution Pathways
5. Implementation Recommendations`,
        schema: {
            type: "object",
            properties: {
                assessment: {
                    type: "object",
                    properties: {
                        severity_score: { type: "number", minimum: 1, maximum: 10 },
                        urgency_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        complexity: { type: "string", enum: ["simple", "moderate", "complex", "highly_complex"] },
                        key_findings: { type: "array", items: { type: "string" } }
                    }
                },
                root_cause_analysis: {
                    type: "object",
                    properties: {
                        primary_causes: { type: "array", items: { type: "string" } },
                        contributing_factors: { type: "array", items: { type: "string" } },
                        systemic_issues: { type: "array", items: { type: "string" } }
                    }
                },
                impact_analysis: {
                    type: "object",
                    properties: {
                        affected_stakeholders: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    stakeholder: { type: "string" },
                                    impact_level: { type: "string", enum: ["high", "medium", "low"] },
                                    impact_description: { type: "string" }
                                }
                            }
                        },
                        economic_impact: { type: "string" },
                        social_impact: { type: "string" },
                        service_impact: { type: "string" }
                    }
                },
                solution_pathways: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            pathway: { type: "string" },
                            approach: { type: "string" },
                            feasibility: { type: "string", enum: ["high", "medium", "low"] },
                            estimated_timeline: { type: "string" },
                            estimated_cost: { type: "string" },
                            success_probability: { type: "number", minimum: 0, maximum: 100 }
                        }
                    }
                },
                recommendations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            priority: { type: "number", minimum: 1, maximum: 5 },
                            recommendation: { type: "string" },
                            rationale: { type: "string" },
                            quick_win: { type: "boolean" }
                        }
                    }
                },
                next_steps: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            step: { type: "string" },
                            owner: { type: "string" },
                            timeline: { type: "string" }
                        }
                    }
                }
            },
            required: ["assessment", "root_cause_analysis", "solution_pathways", "recommendations"]
        }
    },
    matching: {
        id: 'challenge_matching',
        name: 'Challenge Matching',
        description: 'Match challenges with appropriate solutions',
        system: BASE_SYSTEM_PROMPT + `
You are an expert in matching challenges with appropriate solutions.
${SAUDI_CONTEXT.VISION_2030}

Identify the best-fit solutions based on challenge requirements.`,
        prompt: (context) => `Match this challenge with the most suitable solutions:

CHALLENGE:
${JSON.stringify(context.challenge, null, 2)}

AVAILABLE SOLUTIONS:
${JSON.stringify(context.solutions, null, 2)}

Provide matching analysis with confidence scores.`,
        schema: {
            type: "object",
            properties: {
                matches: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            solution_id: { type: "string" },
                            solution_name: { type: "string" },
                            match_score: { type: "number", minimum: 0, maximum: 100 },
                            match_rationale: { type: "string" },
                            implementation_considerations: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                recommendation: {
                    type: "object",
                    properties: {
                        top_recommendation: { type: "string" },
                        rationale: { type: "string" }
                    }
                }
            },
            required: ["matches", "recommendation"]
        }
    }
};
