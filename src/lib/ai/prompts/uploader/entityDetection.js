/**
 * Entity Detection Prompts
 * AI-powered entity type detection for data uploads
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for entity detection
 */
export const ENTITY_DETECTION_SYSTEM_PROMPT = getSystemPrompt('entity_detection', `
You are a data classification expert for Saudi municipal innovation platform.

CLASSIFICATION GUIDELINES:
1. Analyze data structures and column headers
2. Match patterns to known entity schemas
3. Consider Saudi municipal context
4. Provide confidence scores for suggestions
5. Explain reasoning for each classification
`);

/**
 * Entity type definitions for detection
 */
export const ENTITY_TYPE_DEFINITIONS = `
Available entity types:
- challenges: Municipal challenges with fields like title_en, title_ar, description_en, status, priority, sector, municipality_id
- solutions: Innovative solutions with fields like name_en, name_ar, description_en, solution_type, maturity_level, provider_id
- pilots: Pilot projects with fields like title_en, title_ar, sector (required), stage, status, start_date, end_date, budget, municipality_id (required), challenge_id (required)
- programs: Innovation programs with fields like name_en, name_ar, description_en, program_type, status, start_date, end_date, budget
- municipalities: Cities with fields like name_en, name_ar, region_id, population, area
- organizations: Companies with fields like name_en, name_ar, organization_type, website, email
- providers: Solution providers with fields like name_en, name_ar, provider_type, website_url, contact_email, country
- case_studies: Success stories with title_en, description_en, challenge_description, solution_description, results_achieved
- rd_projects: Research projects with title_en, description_en, project_type, status, budget
- rd_calls: Research funding calls with title_en, description_en, call_type, status, budget
- events: Events and conferences with title_en, event_type, start_date, end_date, location
- living_labs: Innovation labs with name_en, domain, status, location, contact_name, contact_email, municipality_id
- sandboxes: Regulatory sandboxes with name (required), description, domain, status, start_date, end_date, capacity, municipality_id
- contracts: Agreements with title_en, contract_code, contract_type, contract_value, provider_id
- budgets: Budget allocations with name_en, budget_code, total_amount, allocated_amount, fiscal_year
- sectors: Industry sectors with name_en, name_ar, description_en, code
- regions: Geographic regions with name_en, name_ar, code
- cities: Cities data with name_en, name_ar, region_id, municipality_id, population
- strategic_plans: Strategic planning with name_en, description_en, vision_en, status, start_year, end_year, municipality_id
- tags: Taxonomy tags with name_en, name_ar, category, color
- kpi_references: KPI definitions with name_en, code, description_en, unit, category, target_value
- citizen_ideas: Citizen ideas with title, description, category, status, municipality_id
`;

/**
 * Build entity detection prompt
 * @param {Object} params - Detection parameters
 * @returns {string} Formatted prompt
 */
export function buildEntityDetectionPrompt({ headers, sampleData }) {
  return `Analyze this data and determine which entity type it belongs to.

${ENTITY_TYPE_DEFINITIONS}

Data headers: ${headers.join(', ')}
Sample rows: ${JSON.stringify(sampleData, null, 2)}

Return the top 3 most likely entity types with confidence scores.`;
}

/**
 * Response schema for entity detection
 */
export const ENTITY_DETECTION_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entity_type: { type: 'string' },
          confidence: { type: 'number' },
          reason: { type: 'string' }
        }
      }
    }
  }
};
