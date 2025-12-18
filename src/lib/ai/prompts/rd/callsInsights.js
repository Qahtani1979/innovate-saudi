/**
 * R&D Calls Insights Prompts
 * AI-powered insights for research and development calls
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const RD_CALLS_INSIGHTS_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a strategic research advisor analyzing R&D calls and proposals for Saudi municipal innovation. Provide actionable insights in both English and Arabic.`;

export const RD_CALLS_INSIGHTS_PROMPT_TEMPLATE = (data = {}) => `Analyze these R&D calls for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

R&D Calls: ${JSON.stringify(data.callSummary || [])}

Statistics:
- Total Calls: ${data.stats?.totalCalls || 0}
- Open Calls: ${data.stats?.openCalls || 0}
- Total Proposals: ${data.stats?.totalProposals || 0}
- Approved Proposals: ${data.stats?.approvedProposals || 0}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Research priority alignment with national needs
2. Proposal quality and competitiveness trends
3. Funding allocation optimization
4. Emerging research themes to prioritize
5. Success factors for future calls`;

export const RD_CALLS_INSIGHTS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    research_alignment: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    proposal_trends: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    funding_optimization: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    emerging_themes: { 
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
    }
  }
};

export default {
  RD_CALLS_INSIGHTS_SYSTEM_PROMPT,
  RD_CALLS_INSIGHTS_PROMPT_TEMPLATE,
  RD_CALLS_INSIGHTS_RESPONSE_SCHEMA
};
