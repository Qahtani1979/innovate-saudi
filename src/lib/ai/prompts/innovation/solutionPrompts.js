
import { getSystemPrompt } from '@/lib/saudiContext';

// Base system prompt for Solution experts
export const SOLUTION_SYSTEM_PROMPT = getSystemPrompt('FULL', true);

export const solutionPrompts = {
    // 1. Solution Detail Analysis
    detailAnalysis: {
        system: SOLUTION_SYSTEM_PROMPT + `
You are an expert solution analyst specializing in technology and innovation solutions for Saudi Arabia's public sector.
Focus on:
- Technical feasibility and maturity
- Implementation requirements
- Cost-benefit analysis
- Risk assessment
- Alignment with Vision 2030 objectives
- Scalability and sustainability`,
        prompt: (context) => `Analyze this solution and provide comprehensive insights:

SOLUTION DETAILS:
- Name: ${context.solution.name_en || context.solution.name}
- Category: ${context.solution.category || 'Not specified'}
- Provider: ${context.solution.provider_name || 'Not specified'}
- Status: ${context.solution.status || 'Not specified'}
- Maturity Level: ${context.solution.maturity_level || 'Not assessed'}

DESCRIPTION:
${context.solution.description_en || context.solution.description || 'Not provided'}

TECHNICAL SPECIFICATIONS:
${context.solution.technical_specs ? JSON.stringify(context.solution.technical_specs, null, 2) : 'Not provided'}

IMPLEMENTATION DETAILS:
- Timeline: ${context.solution.implementation_timeline || 'Not specified'}
- Cost Range: ${context.solution.cost_range || 'Not specified'}
- Requirements: ${context.solution.requirements ? JSON.stringify(context.solution.requirements) : 'Not specified'}

Provide:
1. Solution Assessment
2. Implementation Readiness
3. Cost-Benefit Analysis
4. Risk Assessment
5. Recommendations`,
        schema: {
            type: "object",
            properties: {
                assessment: {
                    type: "object",
                    properties: {
                        overall_score: { type: "number", minimum: 1, maximum: 10 },
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                        vision_alignment: { type: "string", enum: ["high", "medium", "low"] }
                    }
                },
                implementation_readiness: {
                    type: "object",
                    properties: {
                        readiness_level: { type: "string", enum: ["ready", "near_ready", "needs_preparation", "not_ready"] },
                        prerequisites: { type: "array", items: { type: "string" } },
                        estimated_timeline: { type: "string" },
                        resource_requirements: { type: "array", items: { type: "string" } }
                    }
                },
                cost_benefit: {
                    type: "object",
                    properties: {
                        roi_estimate: { type: "string" },
                        payback_period: { type: "string" },
                        benefits: { type: "array", items: { type: "string" } },
                        costs: { type: "array", items: { type: "string" } }
                    }
                },
                risks: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            risk: { type: "string" },
                            impact: { type: "string", enum: ["low", "medium", "high"] },
                            mitigation: { type: "string" }
                        }
                    }
                },
                recommendations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                            recommendation: { type: "string" },
                            rationale: { type: "string" }
                        }
                    }
                }
            },
            required: ["assessment", "implementation_readiness", "recommendations"]
        }
    },

    // 2. Portfolio Analysis
    portfolioAnalysis: {
        system: SOLUTION_SYSTEM_PROMPT + `
You are a solution marketplace analyst specializing in Saudi municipal innovation ecosystems.
EXPERTISE:
- Solution portfolio assessment
- Provider ecosystem analysis
- Technology adoption strategies
- Market development
- Scaling recommendations

GUIDELINES:
- Provide bilingual insights (English + Arabic for each item)
- Focus on actionable market intelligence
- Consider Saudi municipal context
- Emphasize deployment and scaling potential`,
        prompt: (context) => `Analyze this solution portfolio for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Solutions: ${JSON.stringify(context.solutionSummary)}

Statistics:
- Total Solutions: ${context.totalSolutions}
- Market Ready: ${context.marketReadyCount}
- From Startups: ${context.startupCount}
- Average Deployments: ${context.avgDeployments}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Solution landscape gaps and opportunities
2. Provider ecosystem health assessment
3. Deployment acceleration strategies
4. High-potential solutions for scaling
5. Market development recommendations`,
        schema: {
            type: 'object',
            properties: {
                landscape_gaps: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                ecosystem_health: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                deployment_strategies: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                high_potential_solutions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                market_development: {
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
        }
    },

    // 3. Competitive Analysis
    competitiveAnalysis: {
        system: SOLUTION_SYSTEM_PROMPT + `
You are an expert solution analyst.
Expertise: Competitive Analysis, Market Positioning, Feature Comparison.`,
        prompt: (context) => `Perform competitive analysis for this solution in BOTH English and Arabic:

Solution: ${context.solution?.name_en || 'Unknown'}
Provider: ${context.solution?.provider_name || 'Unknown'}
Maturity: ${context.solution?.maturity_level || 'N/A'}
Pricing: ${context.solution?.pricing_model || 'N/A'}
Features: ${context.solution?.features?.join(', ') || 'None specified'}
Sectors: ${context.solution?.sectors?.join(', ') || 'None specified'}
Success Rate: ${context.solution?.success_rate || 0}%
Deployment Count: ${context.solution?.deployment_count || 0}

Competitors:
${context.competitors.map(c =>
            `- ${c.name_en} (${c.provider_name}): ${c.maturity_level}, ${c.pricing_model}, Success: ${c.success_rate || 0}%`
        ).join('\n') || 'No direct competitors identified'}

Provide bilingual analysis:
1. Market positioning (strengths/weaknesses vs competitors)
2. Unique differentiators
3. Pricing competitiveness
4. Target market fit
5. Recommendations for improvement
6. Competitive score (0-100)`,
        schema: {
            type: 'object',
            properties: {
                positioning: {
                    type: 'object',
                    properties: { en: { type: 'string' }, ar: { type: 'string' } }
                },
                differentiators: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: { en: { type: 'string' }, ar: { type: 'string' } }
                    }
                },
                pricing_analysis: {
                    type: 'object',
                    properties: { en: { type: 'string' }, ar: { type: 'string' } }
                },
                market_fit: {
                    type: 'object',
                    properties: { en: { type: 'string' }, ar: { type: 'string' } }
                },
                recommendations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: { en: { type: 'string' }, ar: { type: 'string' } }
                    }
                },
                competitive_score: { type: 'number' },
                strengths: { type: 'array', items: { type: 'string' } },
                weaknesses: { type: 'array', items: { type: 'string' } },
                opportunities: { type: 'array', items: { type: 'string' } },
                threats: { type: 'array', items: { type: 'string' } }
            }
        }
    },

    // 4. Success Prediction
    successPrediction: {
        system: SOLUTION_SYSTEM_PROMPT + `
You are an expert AI Pilot Success Predictor.
Expertise: Historical Pattern Analysis, Risk Assessment, Municipal Success Factors.`,
        prompt: (context) => `Predict the success probability of this solution in a municipal pilot based on historical patterns.

SOLUTION:
Name: ${context.solution?.name_en || 'Unknown'}
Provider: ${context.solution?.provider_name || 'Unknown'} (${context.solution?.provider_type || 'N/A'})
Maturity: ${context.solution?.maturity_level || 'N/A'}
TRL: ${context.solution?.trl || 'N/A'}
Deployment Count: ${context.solution?.deployment_count || 0}
Success Rate: ${context.solution?.success_rate || 0}%
Average Rating: ${context.solution?.average_rating || 'N/A'}
Total Reviews: ${context.solution?.total_reviews || 0}

${context.challenge ? `CHALLENGE:
Title: ${context.challenge.title_en || context.challenge.title_ar}
Sector: ${context.challenge.sector || 'N/A'}
Priority: ${context.challenge.priority || 'N/A'}
Impact Score: ${context.challenge.impact_score || 'N/A'}
Affected Population: ${context.challenge.affected_population_size || 'N/A'}` : 'No specific challenge context provided'}

Analyze:
1. Success probability (0-100%) with confidence interval
2. Key success factors (what increases odds)
3. Risk factors (what decreases odds)
4. Similar successful patterns from historical data
5. Recommended preparation steps
6. Timeline prediction (best/likely/worst case)
7. Budget risk assessment

Provide data-driven prediction with specific reasoning.`,
        schema: {
            type: 'object',
            properties: {
                success_probability: { type: 'number' },
                confidence_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                success_factors: { type: 'array', items: { type: 'string' } },
                risk_factors: { type: 'array', items: { type: 'string' } },
                similar_patterns: { type: 'array', items: { type: 'string' } },
                preparation_steps: { type: 'array', items: { type: 'string' } },
                timeline_prediction: {
                    type: 'object',
                    properties: {
                        best_case_months: { type: 'number' },
                        likely_months: { type: 'number' },
                        worst_case_months: { type: 'number' }
                    }
                },
                budget_risk: { type: 'string', enum: ['low', 'medium', 'high'] },
                overall_recommendation: { type: 'string' },
                key_milestones: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            milestone: { type: 'string' },
                            timeline: { type: 'string' },
                            critical: { type: 'boolean' }
                        }
                    }
                }
            }
        }
    },
    // 5. Automated Matching / Proposal Generation
    automatedMatching: {
        system: SOLUTION_SYSTEM_PROMPT + `
You are an expert Proposal Generator for government challenges.
Focus on: Technical alignment, impact outcomes, and budget efficiency.`,
        prompt: (context) => `Generate a comprehensive proposal for this solution to address this challenge.

SOLUTION:
Name: ${context.solution.name_en}
Provider: ${context.solution.provider_name}
Description: ${context.solution.description_en}
Features: ${context.solution.features?.join(', ') || 'N/A'}
Maturity: ${context.solution.maturity_level}
TRL: ${context.solution.trl || 'N/A'}
Deployments: ${context.solution.deployment_count || 0}
Success Rate: ${context.solution.success_rate || 0}%

CHALLENGE:
Title: ${context.challenge.title_en}
Description: ${context.challenge.description_en}
Sector: ${context.challenge.sector}
Priority: ${context.challenge.priority}
Budget: ${context.challenge.budget_estimate || 'N/A'} SAR

Generate bilingual (English + Arabic) proposal:
1. Executive Summary (why this solution fits)
2. Technical Approach (how it addresses the challenge)
3. Implementation Plan (timeline, phases)
4. Expected Outcomes (KPIs, impact)
5. Budget Breakdown
6. Risk Mitigation
7. Provider Qualifications

Be persuasive and detailed.`,
        schema: {
            type: 'object',
            properties: {
                proposal_title_en: { type: 'string' },
                proposal_title_ar: { type: 'string' },
                executive_summary_en: { type: 'string' },
                executive_summary_ar: { type: 'string' },
                technical_approach_en: { type: 'string' },
                implementation_plan_en: { type: 'string' },
                expected_outcomes: { type: 'array', items: { type: 'string' } },
                budget_breakdown: { type: 'array', items: { type: 'object' } },
                risk_mitigation: { type: 'array', items: { type: 'string' } },
                qualifications_summary: { type: 'string' }
            }
        }
    },
    // 6. Matching Challenges for Startup
    matchingChallenges: {
        system: SOLUTION_SYSTEM_PROMPT + `
You are an expert Matchmaker for government challenges.
Focus on: Capability alignment, scaling potential, and sector fit.`,
        prompt: (context) => `Analyze this startup and suggest matching challenges:
Startup: ${context.startup.name_en}
Sectors: ${context.startup.sectors?.join(', ')}
Solutions: ${context.solutions.map(s => s.name_en).join(', ')}
Stage: ${context.startup.stage}

Find 5 best-matching challenges from the platform that align with their capabilities.`,
        schema: {
            type: 'object',
            properties: {
                matches: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            challenge_title: { type: 'string' },
                            sector: { type: 'string' },
                            match_score: { type: 'number' },
                            reasoning: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
};
