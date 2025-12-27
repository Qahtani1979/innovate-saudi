
import { getSystemPrompt } from '@/lib/saudiContext';

const SANDBOX_SYSTEM_PROMPT = getSystemPrompt('innovation-consultant');

export const sandboxPrompts = {
    // 1. Detail Analysis
    detailAnalysis: {
        system: SANDBOX_SYSTEM_PROMPT + `
You are a regulatory sandbox analyst specializing in Saudi Arabian innovation ecosystems. 
Provide strategic insights for optimizing sandbox operations aligned with Vision 2030 regulatory innovation goals.`,
        prompt: (context) => `Analyze this regulatory sandbox for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Sandbox: ${context.sandbox.name}
Domain: ${context.sandbox.domain}
Status: ${context.sandbox.status}
Capacity: ${context.sandbox.capacity}
Current Projects: ${context.sandbox.current_projects || 0}
Utilization: ${((context.sandbox.current_projects || 0) / (context.sandbox.capacity || 1) * 100).toFixed(0)}%
Success Rate: ${context.sandbox.success_rate || 'N/A'}%
Available Exemptions: ${context.sandbox.exemptions_granted?.length || 0}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Capacity optimization recommendations
2. Regulatory risk assessment
3. Success factors for sandbox pilots
4. Potential new pilot opportunities
5. Resource allocation suggestions`,
        schema: {
            type: 'object',
            properties: {
                capacity_optimization: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                regulatory_risks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                success_factors: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                pilot_opportunities: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                },
                resource_allocation: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            en: { type: 'string' },
                            ar: { type: 'string' }
                        }
                    }
                }
            },
            required: ['capacity_optimization', 'regulatory_risks', 'success_factors', 'pilot_opportunities', 'resource_allocation']
        }
    },

    // 2. Creation Enhancement
    // 2. Editor / Enhancement
    editor: {
        system: SANDBOX_SYSTEM_PROMPT + `
You are a regulatory sandbox design expert for Saudi municipal innovation.
Expertise: Regulatory frameworks, Innovation testing, Exemptions, Safety protocols.`,
        prompt: (context) => `Enhance this regulatory sandbox proposal:

Sandbox Name: ${context.name_en}
Domain: ${context.domain}
Current Description: ${context.description_en || 'N/A'}

Provide bilingual enhancements:
1. Professional tagline (AR + EN)
2. Expanded description highlighting regulatory innovation (AR + EN)
3. Clear objectives for regulatory testing (AR + EN)
4. Suggested exemption categories (3-5 items)
5. Safety protocol recommendations`,
        schema: {
            type: 'object',
            properties: {
                tagline_en: { type: 'string' },
                tagline_ar: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                objectives_en: { type: 'string' },
                objectives_ar: { type: 'string' },
                exemption_suggestions: { type: 'array', items: { type: 'string' } }
            },
            required: ['tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar', 'exemption_suggestions']
        }
    },

    // 3. Capacity Analysis
    capacityAnalysis: {
        system: SANDBOX_SYSTEM_PROMPT + `
You are a capacity planning specialist for Saudi innovation infrastructure.
Analyze utilization data to identify bottlenecks and improved resource allocation.`,
        prompt: (context) => `Analyze the capacity state of the ecosystem:

Sandboxes: ${context.sandboxesCount} (Active: ${context.activeSandboxes})
Total Capacity: ${context.totalCapacity} projects
Occupied Slots: ${context.occupiedSlots}
Living Labs: ${context.livingLabsCount} (Capacity: ${context.livingLabsCapacity})
Pilots Needing Facilities: ${context.pilotsNeedingFacilities}

Identify specific bottlenecks and propose an expansion plan to meet demand.`,
        schema: {
            type: 'object',
            properties: {
                bottlenecks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            issue_en: { type: 'string' },
                            issue_ar: { type: 'string' },
                            severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                            recommendation_en: { type: 'string' },
                            recommendation_ar: { type: 'string' }
                        }
                    }
                },
                expansion_plan: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            location_en: { type: 'string' },
                            location_ar: { type: 'string' },
                            type: { type: 'string' },
                            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                            capacity: { type: 'number' },
                            timeline: { type: 'string' }
                        }
                    }
                }
            },
            required: ['bottlenecks', 'expansion_plan']
        }
    },
    // 4. Capacity Prediction (Single Sandbox)
    capacityPrediction: {
        system: SANDBOX_SYSTEM_PROMPT + `
You are an AI capacity planning specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. 
You analyze sandbox utilization patterns and predict future demand to optimize resource allocation across the Kingdom's 13 regions and 300+ municipalities.`,
        prompt: (context) => `Analyze the capacity and utilization of these innovation sandboxes and living labs:

## SANDBOX DETAILS
- Name: ${context.sandbox.name_en}
- Domain: ${context.sandbox.domain}
- Current Capacity: ${context.sandbox.capacity}
- Current Usage: ${context.sandbox.current_pilots}

## HISTORICAL DATA
- Total Applications: ${context.historicalData.length}
- Active Projects: ${context.historicalData.filter(a => a.status === 'active').length}
- Completed Projects: ${context.historicalData.filter(a => a.status === 'completed').length}

## RECENT APPLICATIONS
${JSON.stringify(context.historicalData.slice(-10).map(a => ({
            title: a.project_title,
            duration_months: a.duration_months,
            start_date: a.start_date,
            status: a.status
        })), null, 2)}

## ANALYSIS REQUIREMENTS
Provide a comprehensive 6-month capacity forecast including:
1. Monthly demand predictions with confidence levels
2. Peak demand periods identification
3. Capacity utilization forecast percentage
4. Capacity adjustment recommendations
5. Resource allocation suggestions
6. Potential bottleneck predictions
7. Key insights for planning`,
        schema: {
            type: "object",
            required: ["forecast_6_months", "capacity_recommendation", "insights_en", "insights_ar"],
            properties: {
                forecast_6_months: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            month: { type: "string" },
                            predicted_demand: { type: "number" },
                            confidence: { type: "string", enum: ["low", "medium", "high"] },
                            capacity_available: { type: "number" }
                        }
                    }
                },
                peak_periods_en: { type: "array", items: { type: "string" } },
                peak_periods_ar: { type: "array", items: { type: "string" } },
                utilization_forecast: { type: "number", minimum: 0, maximum: 100 },
                capacity_recommendation: { type: "string", enum: ["increase", "maintain", "optimize"] },
                recommended_capacity: { type: "number" },
                resource_allocation_en: { type: "array", items: { type: "string" } },
                resource_allocation_ar: { type: "array", items: { type: "string" } },
                potential_bottlenecks_en: { type: "array", items: { type: "string" } },
                potential_bottlenecks_ar: { type: "array", items: { type: "string" } },
                insights_en: { type: "array", items: { type: "string" } },
                insights_ar: { type: "array", items: { type: "string" } }
            }
        }
    }
};
