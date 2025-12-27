
import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

const TECHNOLOGY_SYSTEM_PROMPT = getSystemPrompt('technology_strategist', `
You are an expert Technology Strategist for Saudi Arabia's Ministry of Municipalities and Housing using the AI Maturity Model (AMM).
Your goal is to guide the adoption of emerging technologies (AI, IoT, Digital Twins, Blockchain) across the municipal ecosystem.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.SMART_CITIES_FOCUS}
`);

export const technologyPrompts = {
    generateRoadmap: {
        system: TECHNOLOGY_SYSTEM_PROMPT,
        prompt: (context) => `
Generate a comprehensive Technology Adoption Roadmap for Saudi Municipalities:

CURRENT LANDSCAPE:
- Pilot Technologies: ${context.pilotTech || 'None'}
- Solution Technologies: ${context.solutionTech || 'None'}
- R&D Focus Areas: ${context.rdFocus || 'None'}

Create a 3-horizon roadmap (Emerging, Maturing, Mainstream) tailored to Saudi Smart City goals.

For each technology found or suggested, provide:
1. Technology Name (Bilingual)
2. Priority Level (High/Medium/Low) based on Vision 2030 alignment
3. Use Cases (Bilingual) specific to municipal services
4. Adoption Timeline (e.g., "0-12 months", "1-2 years")
5. Sector alignment
`,
        schema: {
            type: "object",
            required: ["emerging_tech", "maturing_tech", "mainstream_tech", "sector_tech_map"],
            properties: {
                emerging_tech: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["tech_name_en", "tech_name_ar", "priority", "use_cases_en", "use_cases_ar", "timeline"],
                        properties: {
                            tech_name_en: { type: "string" },
                            tech_name_ar: { type: "string" },
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                            use_cases_en: { type: "string" },
                            use_cases_ar: { type: "string" },
                            timeline: { type: "string" },
                            sectors: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                maturing_tech: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["tech_name_en", "tech_name_ar", "current_stage", "next_steps_en", "next_steps_ar"],
                        properties: {
                            tech_name_en: { type: "string" },
                            tech_name_ar: { type: "string" },
                            current_stage: { type: "string" },
                            pilots_count: { type: "number" },
                            next_steps_en: { type: "string" },
                            next_steps_ar: { type: "string" }
                        }
                    }
                },
                mainstream_tech: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["tech_name_en", "tech_name_ar", "deployment_readiness", "scaling_plan_en", "scaling_plan_ar"],
                        properties: {
                            tech_name_en: { type: "string" },
                            tech_name_ar: { type: "string" },
                            deployment_readiness: { type: "string" },
                            scaling_plan_en: { type: "string" },
                            scaling_plan_ar: { type: "string" }
                        }
                    }
                },
                sector_tech_map: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            sector_en: { type: "string" },
                            sector_ar: { type: "string" },
                            priority_technologies: { type: "array", items: { type: "string" } },
                            investment_recommendation: { type: "string" }
                        }
                    }
                }
            }
        }
    }
};

// Exports for compatibility
export const TECHNOLOGY_ROADMAP_SYSTEM_PROMPT = TECHNOLOGY_SYSTEM_PROMPT;
export const technologyRoadmapPrompts = {
    generate: {
        ...technologyPrompts.generateRoadmap,
        // Adapt old builder signature if needed, but we keep it clean here
    }
};
