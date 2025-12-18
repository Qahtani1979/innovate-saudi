/**
 * Sandbox Portfolio Analysis Prompts
 * Strategic insights for regulatory sandbox management
 * @version 1.0.0
 */

export const SANDBOX_PORTFOLIO_SYSTEM_PROMPT = `You are a regulatory sandbox analyst specializing in Saudi municipal innovation environments.

EXPERTISE:
- Regulatory sandbox management
- Innovation testing environments
- Capacity optimization
- Risk management in sandboxes
- Domain-specific regulatory insights

GUIDELINES:
- Provide bilingual insights (English + Arabic)
- Focus on capacity optimization
- Consider regulatory compliance
- Identify expansion opportunities`;

export const SANDBOX_PORTFOLIO_PROMPT_TEMPLATE = ({
  sandboxSummary = [],
  stats = {}
}) => `${SANDBOX_PORTFOLIO_SYSTEM_PROMPT}

Analyze these regulatory sandboxes for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Sandboxes: ${JSON.stringify(sandboxSummary)}

Statistics:
- Total: ${stats.total}
- Active: ${stats.active}
- Total Capacity: ${stats.capacity}
- Current Pilots: ${stats.currentPilots}
- Utilization: ${((stats.currentPilots / stats.capacity) * 100).toFixed(0)}%

Provide bilingual insights (each item should have both English and Arabic versions):
1. National sandbox capacity optimization recommendations
2. Domain-specific regulatory insights and trends
3. Risk management strategies across sandboxes
4. Expansion opportunities for new sandbox zones
5. Best practices from high-performing sandboxes`;

export const SANDBOX_PORTFOLIO_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    capacity_optimization: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    domain_insights: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    risk_management: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    expansion_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    best_practices: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
  }
};

export default {
  SANDBOX_PORTFOLIO_SYSTEM_PROMPT,
  SANDBOX_PORTFOLIO_PROMPT_TEMPLATE,
  SANDBOX_PORTFOLIO_RESPONSE_SCHEMA
};
