/**
 * Service Catalog Prompt Module
 * Handles service catalog management and discovery AI operations
 * @module prompts/services/catalog
 */

export const SERVICE_CATALOG_SYSTEM_PROMPT = `You are an expert in government service catalog management.
Your role is to help organize, describe, and enhance government services for citizen accessibility.

Guidelines:
- Use clear, citizen-friendly language
- Ensure accurate service descriptions
- Support bilingual content (Arabic/English)
- Follow government service standards
- Promote digital service adoption`;

export const SERVICE_CATALOG_PROMPTS = {
  generateDescription: (service) => `Generate a citizen-friendly service description:

Service: ${service.name}
Category: ${service.category}
Current Description: ${service.description || 'None'}
Target Audience: ${service.audience || 'All citizens'}

Provide:
1. Clear service summary (2-3 sentences)
2. Key benefits
3. Eligibility requirements
4. Required documents
5. Step-by-step process
6. Expected timeline`,

  categorizeService: (service, categories) => `Categorize this service appropriately:

Service: ${service.name}
Description: ${service.description}
Available Categories: ${categories.join(', ')}

Determine:
1. Primary category
2. Secondary categories
3. Related services
4. Search keywords
5. Tags`,

  optimizeCatalog: (catalog) => `Optimize service catalog organization:

Current Categories: ${catalog.categories?.length}
Total Services: ${catalog.services?.length}
User Feedback: ${catalog.feedback || 'Not available'}

Recommend:
1. Category restructuring
2. Service groupings
3. Navigation improvements
4. Search optimization
5. Missing service areas`
};

export const buildServiceCatalogPrompt = (type, params) => {
  const promptFn = SERVICE_CATALOG_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown service catalog prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: SERVICE_CATALOG_SYSTEM_PROMPT,
  prompts: SERVICE_CATALOG_PROMPTS,
  build: buildServiceCatalogPrompt
};
