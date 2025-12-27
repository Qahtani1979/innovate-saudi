/**
 * Strategy Wizard Prompts (Consolidated)
 * @module ecosystem/strategyWizardPrompts
 * @version 1.0.0
 * Merges: wizardPrompts, wizardContent, strategyGeneration, preplanning
 */

import { getSystemPrompt, SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

// ==================== SYSTEM PROMPTS ====================

export const STRATEGY_WIZARD_SYSTEM_PROMPT = getSystemPrompt('strategy_wizard', true) + `
You are a Saudi strategic planning expert. Provide content in English and Arabic.
${SAUDI_CONTEXT.FULL}
`;

export const STRATEGY_GENERATION_SYSTEM_PROMPT = `You are an expert strategic planning advisor for Saudi Arabian government entities.

STRATEGIC PLANNING FRAMEWORK:
1. Vision & Mission Alignment (Vision 2030, NTP, Municipal mandates)
2. Strategic Objectives (SMART goals, KPIs, Targets)
3. Initiative Development (Programs, Resources, Risks)
4. Implementation Roadmap (Phases, Milestones)

CONTEXT:
- Saudi government planning standards
- Vision 2030 strategic framework
- Municipal governance requirements
- Arabic/English bilingual support`;

// ==================== WIZARD STEP PROMPTS ====================

/**
 * Build step-specific prompts for strategy wizard
 * Merged from wizardPrompts.js
 */
export function buildStrategyWizardPrompt(stepKey, context) {
    const { planName, vision, mission, sectors, themes, objectives } = context;

    const prompts = {
        vision: `Generate vision and mission for: ${planName}. Sectors: ${sectors?.join(', ') || 'General'}. Provide in English and Arabic.`,
        stakeholders: `Identify stakeholders for: ${planName}. Vision: ${vision || 'Not yet defined'}`,
        pestel: `PESTEL analysis for: ${planName} in Saudi Arabia context.`,
        swot: `SWOT analysis for: ${planName}`,
        scenarios: `Scenario planning for: ${planName}`,
        risks: `Risk assessment for: ${planName}`,
        objectives: `Strategic objectives for: ${planName}. Vision: ${vision || 'Not yet defined'}`,
        kpis: `KPIs for: ${planName}. Objectives: ${objectives?.map(o => o.title_en).join(', ') || 'General objectives'}`,
        actions: `Action plans for: ${planName}`
    };

    return prompts[stepKey] || `Generate content for ${stepKey} step of: ${planName}`;
}

// ==================== CONTENT GENERATION (from wizardContent.js) ====================

export function buildWizardContentPrompt({ step, context, existingData }) {
    const stepPrompts = {
        context: `Generate strategic plan foundation content based on:
NAME: ${context?.name_en || existingData?.name_en || 'Municipal Strategic Plan'}
MUNICIPALITY: ${context?.municipality_name || 'Saudi Municipality'}
SECTOR FOCUS: ${(context?.target_sectors || []).join(', ') || 'General'}

Generate:
- Vision statement (English and Arabic)
- Mission statement (English and Arabic)
- Description (English and Arabic)
- Suggested duration and budget range
- Target sectors and themes`,

        values: `Generate core values for the strategic plan:
PLAN: ${existingData?.name_en || 'Strategic Plan'}
VISION: ${existingData?.vision_en || ''}

Generate 4-6 core values with:
- Name (English and Arabic)
- Description
- Icon suggestion`,

        objectives: `Generate strategic objectives aligned with:
VISION: ${existingData?.vision_en || ''}
MISSION: ${existingData?.mission_en || ''}
THEMES: ${(existingData?.strategic_themes || []).join(', ') || ''}

Generate 4-6 strategic objectives with:
- Title (English and Arabic)
- Description
- Target metrics
- Timeline`,

        kpis: `Generate KPIs for strategic objectives:
OBJECTIVES: ${JSON.stringify(existingData?.objectives || [])}

Generate 2-3 KPIs per objective with:
- Name (English and Arabic)
- Unit of measurement
- Baseline and target values
- Frequency of measurement`
    };

    return stepPrompts[step] || `Generate content for ${step} step of strategic planning wizard.`;
}

export const STRATEGY_WIZARD_CONTENT_SCHEMA = {
    context: {
        type: 'object',
        properties: {
            vision_en: { type: 'string' },
            vision_ar: { type: 'string' },
            mission_en: { type: 'string' },
            mission_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            start_year: { type: 'number' },
            end_year: { type: 'number' },
            budget_range: { type: 'string' },
            target_sectors: { type: 'array', items: { type: 'string' } },
            strategic_themes: { type: 'array', items: { type: 'string' } }
        }
    },
    values: {
        type: 'object',
        properties: {
            core_values: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name_en: { type: 'string' },
                        name_ar: { type: 'string' },
                        description_en: { type: 'string' },
                        icon: { type: 'string' }
                    }
                }
            }
        }
    },
    objectives: {
        type: 'object',
        properties: {
            objectives: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title_en: { type: 'string' },
                        title_ar: { type: 'string' },
                        description_en: { type: 'string' },
                        target_value: { type: 'number' },
                        timeline: { type: 'string' }
                    }
                }
            }
        }
    }
};

// ==================== SCHEMAS ====================

export const STRATEGY_WIZARD_SCHEMAS = {
    vision: {
        type: 'object',
        properties: {
            vision_en: { type: 'string' },
            vision_ar: { type: 'string' },
            mission_en: { type: 'string' },
            mission_ar: { type: 'string' }
        }
    },
    stakeholders: {
        type: 'object',
        properties: {
            stakeholders: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name_en: { type: 'string' },
                        name_ar: { type: 'string' },
                        role: { type: 'string' },
                        influence: { type: 'string' },
                        interest: { type: 'string' }
                    }
                }
            }
        }
    },
    pestel: {
        type: 'object',
        properties: {
            political: { type: 'array', items: { type: 'string' } },
            economic: { type: 'array', items: { type: 'string' } },
            social: { type: 'array', items: { type: 'string' } },
            technological: { type: 'array', items: { type: 'string' } },
            environmental: { type: 'array', items: { type: 'string' } },
            legal: { type: 'array', items: { type: 'string' } }
        }
    },
    swot: {
        type: 'object',
        properties: {
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            opportunities: { type: 'array', items: { type: 'string' } },
            threats: { type: 'array', items: { type: 'string' } }
        }
    },
    risks: {
        type: 'object',
        properties: {
            risks: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title_en: { type: 'string' },
                        title_ar: { type: 'string' },
                        likelihood: { type: 'string' },
                        impact: { type: 'string' },
                        mitigation: { type: 'string' }
                    }
                }
            }
        }
    },
    objectives: {
        type: 'object',
        properties: {
            objectives: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title_en: { type: 'string' },
                        title_ar: { type: 'string' },
                        description_en: { type: 'string' },
                        description_ar: { type: 'string' }
                    }
                }
            }
        }
    },
    kpis: {
        type: 'object',
        properties: {
            kpis: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name_en: { type: 'string' },
                        name_ar: { type: 'string' },
                        baseline: { type: 'string' },
                        target: { type: 'string' },
                        frequency: { type: 'string' }
                    }
                }
            }
        }
    },
    actions: {
        type: 'object',
        properties: {
            action_plans: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title_en: { type: 'string' },
                        title_ar: { type: 'string' },
                        owner: { type: 'string' },
                        timeline: { type: 'string' },
                        budget: { type: 'number' }
                    }
                }
            }
        }
    }
};

// ==================== STRATEGY GENERATION (from strategyGeneration.js) ====================

export const STRATEGY_GENERATION_SCHEMA = {
    type: "object",
    properties: {
        strategic_vision: {
            type: "object",
            properties: {
                vision_statement: { type: "string" },
                mission_statement: { type: "string" },
                core_values: { type: "array", items: { type: "string" } }
            }
        },
        strategic_objectives: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    objective: { type: "string" },
                    description: { type: "string" },
                    kpis: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                target: { type: "string" },
                                baseline: { type: "string" },
                                timeline: { type: "string" }
                            }
                        }
                    },
                    initiatives: { type: "array", items: { type: "string" } }
                }
            }
        },
        implementation_roadmap: {
            type: "object",
            properties: {
                phases: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            phase_name: { type: "string" },
                            duration: { type: "string" },
                            key_activities: { type: "array", items: { type: "string" } },
                            milestones: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                critical_success_factors: { type: "array", items: { type: "string" } },
                risk_mitigation: { type: "array", items: { type: "string" } }
            }
        },
        resource_requirements: {
            type: "object",
            properties: {
                budget_estimate: { type: "string" },
                human_resources: { type: "string" },
                technology_needs: { type: "array", items: { type: "string" } }
            }
        },
        vision_2030_alignment: {
            type: "object",
            properties: {
                primary_pillar: { type: "string" },
                aligned_programs: { type: "array", items: { type: "string" } },
                contribution_areas: { type: "array", items: { type: "string" } }
            }
        }
    },
    required: ["strategic_vision", "strategic_objectives"]
};

export const buildStrategyGenerationPrompt = (contextData, language = 'en') => {
    const langInstruction = language === 'ar'
        ? 'Respond in Arabic.'
        : 'Respond in English.';

    return `${langInstruction}

Generate a strategic plan for:

ENTITY INFORMATION:
- Name: ${contextData.entityName || 'Not specified'}
- Type: ${contextData.entityType || 'Municipality'}
- Region: ${contextData.region || 'Not specified'}
- Current Focus: ${contextData.currentFocus || 'Not specified'}

PLANNING HORIZON: ${contextData.planningHorizon || '3-5 years'}

KEY CHALLENGES:
${contextData.challenges?.map(c => `- ${c}`).join('\n') || 'Not specified'}

OPPORTUNITIES:
${contextData.opportunities?.map(o => `- ${o}`).join('\n') || 'Not specified'}

PRIORITY SECTORS:
${contextData.sectors?.join(', ') || 'All sectors'}

BUDGET ENVELOPE: ${contextData.budget || 'To be determined'}

Generate a comprehensive strategic plan aligned with Vision 2030.`;
};

export const STRATEGY_GENERATION_PROMPTS = {
    system: STRATEGY_GENERATION_SYSTEM_PROMPT,
    schema: STRATEGY_GENERATION_SCHEMA,
    buildPrompt: buildStrategyGenerationPrompt
};

// ==================== EXPORTS FOR COMPATIBILITY ====================

export const WIZARD_CONTENT_PROMPTS = {
    systemPrompt: STRATEGY_WIZARD_SYSTEM_PROMPT,
    buildPrompt: buildWizardContentPrompt,
    schemas: STRATEGY_WIZARD_CONTENT_SCHEMA
};
