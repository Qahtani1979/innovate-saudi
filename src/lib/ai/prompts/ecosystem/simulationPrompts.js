/**
 * Strategy Simulation & Timeline Prompts (Consolidated)
 * @module ecosystem/simulationPrompts
 * @version 1.0.0
 * Merges: whatIfSimulator, timeline, dependencies
 */

import { getSystemPrompt, SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

// ==================== WHAT-IF SIMULATOR ====================

export const WHAT_IF_SIMULATOR_SYSTEM_PROMPT = `You are a strategic planning analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You simulate the impact of budget reallocations across sectors to help decision-makers optimize resource allocation for maximum innovation outcomes.`;

export const buildWhatIfSimulatorPrompt = (sectorNames, allocationText) => {
    return `${SAUDI_CONTEXT.COMPACT}

You are simulating budget reallocation impacts for Saudi Arabia's municipal innovation ecosystem.

## SIMULATION PARAMETERS

### Sectors Included
${sectorNames.join(', ')}

### Proposed Budget Allocation
${allocationText}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## PREDICTION REQUIREMENTS
Predict the impact on these key performance indicators:
1. Pilot Success Rate (current baseline: 65%)
2. Solutions Deployed (current baseline: 45)
3. Average MII Score (current baseline: 72)
4. R&D to Pilot Conversion Rate (current baseline: 28%)

For each KPI provide:
- KPI name (bilingual)
- Current value
- Predicted value after reallocation
- Percentage change

Base predictions on:
- Sector priorities in Vision 2030
- Historical performance patterns
- Resource optimization principles`;
};

export const whatIfSimulatorSchema = {
    type: 'object',
    required: ['kpi_changes'],
    properties: {
        kpi_changes: {
            type: 'array',
            items: {
                type: 'object',
                required: ['kpi_en', 'kpi_ar', 'current', 'predicted', 'change_percent'],
                properties: {
                    kpi_en: { type: 'string' },
                    kpi_ar: { type: 'string' },
                    current: { type: 'number' },
                    predicted: { type: 'number' },
                    change_percent: { type: 'number' }
                }
            }
        }
    }
};

// ==================== TIMELINE GENERATOR ====================

export const TIMELINE_SYSTEM_PROMPT = getSystemPrompt('timeline', true) + `
You are a project planning specialist for Saudi municipal strategic initiatives.
Your role is to create realistic implementation timelines with phases, milestones, and critical paths.
Consider Vision 2030 alignment and municipal fiscal year cycles.
`;

export function buildTimelinePrompt({ objectives, actionPlans, startDate, endDate }) {
    return `Generate strategic implementation timeline in BOTH English and Arabic:

Objectives: ${objectives?.length || 0} objectives defined
Action Plans: ${actionPlans?.length || 0} action plans
Start Date: ${startDate || 'To be determined'}
End Date: ${endDate || 'To be determined'}

Create timeline with:
1. Implementation phases (with dates)
2. Key milestones for each phase
3. Critical path identification
4. Dependencies between phases
5. Risk buffer periods
6. Review checkpoints
7. Go/no-go decision points`;
}

export const TIMELINE_SCHEMA = {
    type: "object",
    properties: {
        phases: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    phase_name_en: { type: "string" },
                    phase_name_ar: { type: "string" },
                    start_date: { type: "string" },
                    end_date: { type: "string" },
                    duration_weeks: { type: "number" },
                    objectives: { type: "array", items: { type: "string" } },
                    deliverables: { type: "array", items: { type: "string" } }
                }
            }
        },
        milestones: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    milestone_en: { type: "string" },
                    milestone_ar: { type: "string" },
                    date: { type: "string" },
                    phase: { type: "string" },
                    is_critical: { type: "boolean" }
                }
            }
        },
        critical_path: { type: "array", items: { type: "string" } },
        risk_periods: { type: "array", items: { type: "string" } },
        review_checkpoints: { type: "array", items: { type: "string" } }
    }
};

export const TIMELINE_PROMPTS = {
    systemPrompt: TIMELINE_SYSTEM_PROMPT,
    buildPrompt: buildTimelinePrompt,
    schema: TIMELINE_SCHEMA
};

// ==================== DEPENDENCIES ANALYSIS ====================

export const DEPENDENCIES_SYSTEM_PROMPT = getSystemPrompt('dependencies', true) + `
You are a strategic planning specialist for Saudi municipal innovation.
Your role is to identify dependencies, constraints, and assumptions for strategic initiatives.
Consider internal and external dependencies, resource constraints, and critical success factors.
`;

export function buildDependenciesPrompt({ objectives, actionPlans, organizationContext }) {
    return `Analyze strategic dependencies in BOTH English and Arabic:

Objectives: ${objectives?.map(o => o.title_en).join(', ') || 'Not specified'}
Action Plans: ${actionPlans?.map(a => a.title_en).join(', ') || 'Not specified'}
Organization: ${organizationContext || 'Municipal entity'}

Identify:
1. Internal dependencies (between objectives/action plans)
2. External dependencies (partners, vendors, government)
3. Resource dependencies (budget, staff, technology)
4. Timeline dependencies (sequential requirements)
5. Constraints and limitations
6. Key assumptions
7. Critical success factors`;
}

export const DEPENDENCIES_SCHEMA = {
    type: "object",
    properties: {
        internal_dependencies: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    from: { type: "string" },
                    to: { type: "string" },
                    type: { type: "string" },
                    description_en: { type: "string" },
                    description_ar: { type: "string" }
                }
            }
        },
        external_dependencies: { type: "array", items: { type: "string" } },
        resource_dependencies: { type: "array", items: { type: "string" } },
        constraints: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    constraint_en: { type: "string" },
                    constraint_ar: { type: "string" },
                    impact: { type: "string" }
                }
            }
        },
        assumptions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    assumption_en: { type: "string" },
                    assumption_ar: { type: "string" },
                    risk_if_invalid: { type: "string" }
                }
            }
        },
        critical_success_factors: { type: "array", items: { type: "string" } }
    }
};

export const DEPENDENCIES_PROMPTS = {
    systemPrompt: DEPENDENCIES_SYSTEM_PROMPT,
    buildPrompt: buildDependenciesPrompt,
    schema: DEPENDENCIES_SCHEMA
};
