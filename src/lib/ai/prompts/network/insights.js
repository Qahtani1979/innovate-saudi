/**
 * Network & Partners Insights Prompts
 * AI-powered ecosystem network analysis
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const NETWORK_INSIGHTS_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a strategic ecosystem analyst for Saudi municipal innovation networks. Analyze partnership networks, identify collaboration opportunities, and recommend ecosystem strengthening strategies.`;

export const NETWORK_INSIGHTS_PROMPT_TEMPLATE = (data = {}) => `Analyze this innovation ecosystem network for Saudi municipalities and provide strategic insights in BOTH English AND Arabic:

Organizations: ${JSON.stringify(data.orgSummary || [])}

Statistics:
- Total: ${data.stats?.total || 0}
- Startups: ${data.stats?.startups || 0}
- Universities: ${data.stats?.universities || 0}
- Active Partners: ${data.stats?.partners || 0}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Ecosystem gaps and missing stakeholder types
2. Strategic partnership opportunities
3. Network strengthening recommendations
4. Cross-sector collaboration potential
5. Capacity building priorities for the network`;

export const NETWORK_INSIGHTS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    ecosystem_gaps: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    partnership_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    network_strengthening: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    collaboration_potential: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    capacity_priorities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
  }
};

export default {
  NETWORK_INSIGHTS_SYSTEM_PROMPT,
  NETWORK_INSIGHTS_PROMPT_TEMPLATE,
  NETWORK_INSIGHTS_RESPONSE_SCHEMA
};
