/**
 * R&D to Solution Converter Prompts
 * AI-powered commercialization profile generation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RD_SOLUTION_CONVERTER_SYSTEM_PROMPT = getSystemPrompt('rd_solution_converter', `
You are an R&D commercialization expert for Saudi municipal innovation.

COMMERCIALIZATION GUIDELINES:
1. Transform research into market-ready solutions
2. Highlight practical municipal applications
3. Create compelling value propositions
4. Generate bilingual content (English and Arabic)
`);

export function buildRDSolutionConverterPrompt(rdProject) {
  return `You are an R&D commercialization expert. Generate a commercial solution profile from this research project:

Research Title: ${rdProject.title_en}
Abstract: ${rdProject.abstract_en}
Research Area: ${rdProject.research_area_en}
Current TRL: ${rdProject.trl_current}
Outputs: ${JSON.stringify(rdProject.expected_outputs || [])}
Publications: ${JSON.stringify(rdProject.publications || [])}

Generate:
1. Commercial tagline (EN + AR)
2. Market-ready description (EN + AR)
3. Value proposition (why municipalities/companies should adopt)
4. 3-5 practical use cases with sectors
5. Pricing model recommendation
6. Technical specifications summary

Be compelling and highlight practical municipal applications.`;
}

export const RD_SOLUTION_CONVERTER_SCHEMA = {
  type: 'object',
  properties: {
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    value_proposition: { type: 'string' },
    use_cases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          sector: { type: 'string' },
          description: { type: 'string' }
        }
      }
    },
    pricing_model: { type: 'string' },
    technical_specifications: { type: 'object' }
  }
};

// IP Commercialization Tracker
export const IP_COMMERCIALIZATION_SYSTEM_PROMPT = getSystemPrompt('ip_commercialization', `
You are an IP commercialization analyst for Saudi research institutions.

ASSESSMENT CRITERIA:
1. Commercial potential scoring
2. Pathway recommendations (startup, licensing, tech transfer)
3. Market size estimation
4. Timeline to market analysis
`);

export function buildIPCommercializationPrompt(project) {
  return `Analyze commercialization potential for this R&D project:

Title: ${project.title_en}
Research Area: ${project.research_area_en}
TRL: ${project.trl_current}
Patents: ${project.patents?.length || 0}
Publications: ${project.publications?.length || 0}
Outputs: ${project.expected_outputs?.map(o => o.output_en).join(', ')}

Assess:
1. Commercial potential (0-100)
2. Recommended pathway (startup formation, licensing, tech transfer)
3. Market size estimate
4. Potential licensees (startup types)
5. Timeline to market`;
}

export const IP_COMMERCIALIZATION_SCHEMA = {
  type: "object",
  properties: {
    commercial_score: { type: "number" },
    pathway: { type: "string" },
    market_size: { type: "string" },
    potential_licensees: { type: "array", items: { type: "string" } },
    timeline: { type: "string" },
    next_steps: { type: "array", items: { type: "string" } }
  }
};
