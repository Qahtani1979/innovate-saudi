/**
 * Taxonomy Builder Prompts
 * AI assistance for defining sectors, subsectors, and services
 */

export const TAXONOMY_SYSTEM_PROMPT = `You are a taxonomy expert for municipal government services.
Your role is to help structure a comprehensive catalog of services, sectors, and subsectors.
Focus on standardizing terminology and identifying gaps in service coverage.`;

export const TAXONOMY_PROMPTS = {
    suggestions: {
        id: 'taxonomy_suggestions',
        name: 'Taxonomy Suggestions',
        description: 'Suggests improvements and additions to the taxonomy',
        prompt: (context) => `
Analyze the current taxonomy structure and provide suggestions.

Context:
- Sectors: ${context.sectors.map(s => s.name_en).join(', ')}
- Subsectors Count: ${context.subsectorsCount}
- Services Count: ${context.servicesCount}

Provide 3 types of suggestions:
1. Missing essential sectors for a municipal government
2. Subsectors that should be added to existing sectors
3. Gaps in service coverage

Response Format: JSON
`,
        schema: {
            type: "object",
            properties: {
                missing_sectors: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name_en: { type: "string" },
                            name_ar: { type: "string" },
                            reason: { type: "string" }
                        }
                    }
                },
                suggested_subsectors: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            sector: { type: "string" },
                            name_en: { type: "string" },
                            name_ar: { type: "string" }
                        }
                    }
                },
                service_gaps: {
                    type: "array",
                    items: { type: "string" }
                }
            }
        }
    }
};

export const taxonomyPrompts = TAXONOMY_PROMPTS;
