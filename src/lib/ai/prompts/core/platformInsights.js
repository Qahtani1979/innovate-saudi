/**
 * Platform Insights Widget Prompts
 * @module core/platformInsights
 */

export const PLATFORM_INSIGHTS_SYSTEM_PROMPT = `You are a strategic analyst for Saudi municipal innovation platforms. Generate actionable insights from platform data to guide decision-making and identify opportunities.`;

export const buildPlatformInsightsPrompt = (sectorCounts, statusCounts, totalEntities) => `Analyze platform trends and generate 3 strategic insights:

Sector distribution: ${JSON.stringify(sectorCounts)}
Status distribution: ${JSON.stringify(statusCounts)}
Total entities: ${totalEntities}

Provide insights in BOTH English AND Arabic:
1. Key trend observation
2. Opportunity identification
3. Recommended action`;

export const PLATFORM_INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          type: { type: 'string', enum: ['trend', 'opportunity', 'action', 'warning'] },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
        },
        required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'type']
      },
      minItems: 3,
      maxItems: 5
    },
    overall_health_score: { type: 'number', minimum: 0, maximum: 100 },
    summary_en: { type: 'string' },
    summary_ar: { type: 'string' }
  },
  required: ['insights', 'overall_health_score']
};
