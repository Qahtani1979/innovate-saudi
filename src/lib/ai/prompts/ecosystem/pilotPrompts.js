
import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

const PILOT_SYSTEM_PROMPT = getSystemPrompt('innovation_consultant', `
You are an expert innovation consultant helping to refine pilot project details for Saudi Municipalities.
${SAUDI_CONTEXT.VISION_2030}
`);

// Helper for editor context
const buildEditorContext = (c) => `
CONTEXT - Pilot Information:
Title: ${c.formData.title_en} | ${c.formData.title_ar || ''}
Challenge: ${c.challenge?.title_en || 'N/A'}
Solution: ${c.solution?.name_en || 'N/A'}
Municipality: ${c.municipality?.name_en || 'N/A'}
Sector: ${c.formData.sector}
Stage: ${c.formData.stage}
Description: ${c.formData.description_en?.substring(0, 200)}

Generate BILINGUAL (Arabic + English) content for Saudi municipal innovation pilot.
`;

export const pilotPrompts = {
    // 1. Detail Analysis
    detailAnalysis: {
        system: `You are an expert pilot program analyst specializing in Saudi Arabia's Vision 2030 innovation initiatives.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.MUNICIPAL_CONTEXT}

Analyze pilot programs with focus on:
- Progress against milestones and KPIs
- Risk assessment and mitigation strategies
- Resource utilization efficiency
- Stakeholder engagement effectiveness
- Scalability potential assessment
- Lessons learned and best practices

Provide actionable recommendations for pilot optimization.`,
        prompt: (pilot) => `Analyze this pilot program and provide comprehensive insights:

PILOT DETAILS:
- Title: ${pilot.title_en || pilot.title}
- Status: ${pilot.status}
- Phase: ${pilot.current_phase || 'Not specified'}
- Start Date: ${pilot.start_date || 'Not set'}
- End Date: ${pilot.end_date || 'Not set'}
- Budget: ${pilot.budget ? `SAR ${pilot.budget.toLocaleString()}` : 'Not specified'}
- Location: ${pilot.location || 'Not specified'}

OBJECTIVES:
${pilot.objectives ? JSON.stringify(pilot.objectives, null, 2) : 'Not defined'}

SUCCESS METRICS:
${pilot.success_metrics ? JSON.stringify(pilot.success_metrics, null, 2) : 'Not defined'}

CURRENT PROGRESS:
${pilot.progress_percentage ? `${pilot.progress_percentage}%` : 'Not tracked'}

Provide:
1. Progress Assessment (current status vs planned)
2. Risk Analysis (identified risks and mitigation)
3. Performance Insights (KPI trends)
4. Stakeholder Impact Analysis
5. Recommendations for Improvement
6. Scalability Assessment`,
        schema: {
            type: "object",
            properties: {
                progress_assessment: {
                    type: "object",
                    properties: {
                        overall_status: { type: "string", enum: ["on_track", "at_risk", "delayed", "ahead"] },
                        completion_estimate: { type: "number" },
                        key_achievements: { type: "array", items: { type: "string" } },
                        pending_milestones: { type: "array", items: { type: "string" } }
                    }
                },
                risk_analysis: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            risk: { type: "string" },
                            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                            likelihood: { type: "string", enum: ["unlikely", "possible", "likely", "certain"] },
                            mitigation: { type: "string" }
                        }
                    }
                },
                performance_insights: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            metric: { type: "string" },
                            trend: { type: "string", enum: ["improving", "stable", "declining"] },
                            insight: { type: "string" }
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
                            expected_impact: { type: "string" }
                        }
                    }
                },
                scalability_assessment: {
                    type: "object",
                    properties: {
                        readiness_score: { type: "number", minimum: 1, maximum: 10 },
                        scale_potential: { type: "string", enum: ["high", "medium", "low"] },
                        prerequisites: { type: "array", items: { type: "string" } },
                        recommended_approach: { type: "string" }
                    }
                }
            },
            required: ["progress_assessment", "risk_analysis", "recommendations"]
        }
    },

    // 2. Lessons Learned
    lessonsAnalysis: {
        system: `You are an expert in capturing and documenting lessons learned from pilot programs.
${SAUDI_CONTEXT.VISION_2030}

Focus on extracting actionable insights that can benefit future initiatives.`,
        prompt: (pilot) => `Extract lessons learned from this pilot program:

PILOT: ${pilot.title_en || pilot.title}
STATUS: ${pilot.status}
DURATION: ${pilot.start_date} to ${pilot.end_date || 'ongoing'}

CHALLENGES ENCOUNTERED:
${pilot.challenges ? JSON.stringify(pilot.challenges, null, 2) : 'Not documented'}

OUTCOMES:
${pilot.outcomes ? JSON.stringify(pilot.outcomes, null, 2) : 'Not documented'}

Generate comprehensive lessons learned.`,
        schema: {
            type: "object",
            properties: {
                successes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            area: { type: "string" },
                            lesson: { type: "string" },
                            replicability: { type: "string", enum: ["high", "medium", "low"] }
                        }
                    }
                },
                challenges: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            challenge: { type: "string" },
                            lesson: { type: "string" },
                            prevention_strategy: { type: "string" }
                        }
                    }
                },
                recommendations_for_future: {
                    type: "array",
                    items: { type: "string" }
                }
            },
            required: ["successes", "challenges", "recommendations_for_future"]
        }
    },

    // 3. Editor Prompts
    editor: {
        // 3.1 Technology
        technology: {
            id: 'pilot_technology',
            system: PILOT_SYSTEM_PROMPT,
            prompt: (c) => `
      ${buildEditorContext(c)}

      Current Stack: ${JSON.stringify(c.formData.technology_stack)}
      Solution: ${c.solution?.name_en}
      Budget: ${c.formData.budget}

      Recommend comprehensive technology stack (8-12 items) covering:
      - Hardware (sensors, devices, infrastructure)
      - Software (platforms, applications, tools)
      - Data & Analytics
      - Communication & Networking
      - Security & Compliance

      For each: category, technology, version, purpose`,
            schema: {
                type: 'object',
                properties: {
                    technology_stack: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                category: { type: 'string' },
                                technology: { type: 'string' },
                                version: { type: 'string' },
                                purpose: { type: 'string' }
                            }
                        }
                    }
                },
                required: ['technology_stack']
            }
        },

        // 3.2 Engagement
        engagement: {
            id: 'pilot_engagement',
            system: PILOT_SYSTEM_PROMPT,
            prompt: (c) => `
      ${buildEditorContext(c)}

      Municipality: ${c.municipality?.name_en}
      Target Population: ${JSON.stringify(c.formData.target_population)}

      Generate public engagement strategy with:
      1. Realistic community session targets
      2. Feedback collection goals
      3. Expected satisfaction scores
      4. Anticipated media coverage (5-8 outlets with dates and sentiment)`,
            schema: {
                type: 'object',
                properties: {
                    public_engagement: {
                        type: 'object',
                        properties: {
                            community_sessions: { type: 'number' },
                            feedback_collected: { type: 'number' },
                            satisfaction_score: { type: 'number' }
                        }
                    },
                    media_coverage: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                outlet: { type: 'string' },
                                date: { type: 'string' },
                                url: { type: 'string' },
                                sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] }
                            }
                        }
                    }
                },
                required: ['public_engagement', 'media_coverage']
            }
        },

        // 3.3 Details
        details: {
            id: 'pilot_details',
            system: PILOT_SYSTEM_PROMPT,
            prompt: (c) => `
      ${buildEditorContext(c)}

      Current data:
      Title EN: ${c.formData.title_en}
      Title AR: ${c.formData.title_ar || ''}
      Description EN: ${c.formData.description_en || ''}
      Description AR: ${c.formData.description_ar || ''}
      Objective EN: ${c.formData.objective_en || ''}
      Objective AR: ${c.formData.objective_ar || ''}

      Enhance: refined titles, taglines, detailed descriptions (200+ words each), clear objectives, hypothesis, methodology, scope.`,
            schema: {
                type: 'object',
                properties: {
                    title_en: { type: 'string' },
                    title_ar: { type: 'string' },
                    tagline_en: { type: 'string' },
                    tagline_ar: { type: 'string' },
                    description_en: { type: 'string' },
                    description_ar: { type: 'string' },
                    objective_en: { type: 'string' },
                    objective_ar: { type: 'string' },
                    hypothesis: { type: 'string' },
                    methodology: { type: 'string' },
                    scope: { type: 'string' }
                },
                required: ['title_en', 'title_ar', 'tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objective_en', 'objective_ar']
            }
        },

        // 3.4 KPIs
        kpis: {
            id: 'pilot_kpis',
            system: PILOT_SYSTEM_PROMPT,
            prompt: (c) => `
      ${buildEditorContext(c)}

      Generate 5-8 comprehensive KPIs with:
      - Bilingual names
      - Realistic baseline values
      - Ambitious but achievable targets
      - Appropriate units
      - Measurement frequency`,
            schema: {
                type: 'object',
                properties: {
                    kpis: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                baseline: { type: 'string' },
                                target: { type: 'string' },
                                unit: { type: 'string' },
                                measurement_frequency: { type: 'string' },
                                data_source: { type: 'string' }
                            }
                        }
                    }
                },
                required: ['kpis']
            }
        },

        // 3.5 Timeline
        timeline: {
            id: 'pilot_timeline',
            system: PILOT_SYSTEM_PROMPT,
            prompt: (c) => `
      ${buildEditorContext(c)}

      Duration: ${c.formData.duration_weeks} weeks
      Start: ${c.formData.timeline?.pilot_start || 'TBD'}

      Generate 6-10 realistic milestones with:
      - Bilingual names and descriptions
      - Evenly distributed dates
      - Key deliverables (EN + AR arrays)`,
            schema: {
                type: 'object',
                properties: {
                    milestones: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                name_ar: { type: 'string' },
                                description: { type: 'string' },
                                description_ar: { type: 'string' },
                                due_date: { type: 'string' },
                                deliverables: { type: 'array', items: { type: 'string' } },
                                deliverables_ar: { type: 'array', items: { type: 'string' } },
                                status: { type: 'string' }
                            }
                        }
                    }
                },
                required: ['milestones']
            }
        },

        // 3.6 Risks
        risks: {
            id: 'pilot_risks',
            system: PILOT_SYSTEM_PROMPT,
            prompt: (c) => `
      ${buildEditorContext(c)}

      Generate 4-6 specific risks with:
      - Clear risk descriptions
      - Probability (low/medium/high)
      - Impact (low/medium/high)
      - Detailed mitigation strategies
      - Safety protocols (5-8 items)
      - Regulatory exemptions if needed`,
            schema: {
                type: 'object',
                properties: {
                    risks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                risk: { type: 'string' },
                                probability: { type: 'string' },
                                impact: { type: 'string' },
                                mitigation: { type: 'string' },
                                status: { type: 'string' }
                            }
                        }
                    },
                    safety_protocols: { type: 'array', items: { type: 'string' } },
                    regulatory_exemptions: { type: 'array', items: { type: 'string' } }
                },
                required: ['risks', 'safety_protocols']
            }
        },

        // 3.7 Evaluation
        evaluation: {
            id: 'pilot_evaluation',
            system: PILOT_SYSTEM_PROMPT,
            prompt: (c) => `
      ${buildEditorContext(c)}

      Current: TRL ${c.formData.trl_start || 4} → ${c.formData.trl_target || 7}

      Generate evaluation content:
      - Bilingual evaluation summaries (150+ words)
      - AI insights
      - Success probability (0-100)
      - Risk level assessment
      - Recommendation (scale/iterate/pivot/terminate/pending)`,
            schema: {
                type: 'object',
                properties: {
                    evaluation_summary_en: { type: 'string' },
                    evaluation_summary_ar: { type: 'string' },
                    ai_insights: { type: 'string' },
                    success_probability: { type: 'number' },
                    risk_level: { type: 'string' },
                    recommendation: { type: 'string' }
                },
                required: ['evaluation_summary_en', 'evaluation_summary_ar', 'success_probability', 'recommendation']
            }
        }
    }
};
