/**
 * Organization Detail AI Prompts
 * @module prompts/organizations/organizationDetail
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Organization analysis prompt template
 */
export const ORGANIZATION_DETAIL_PROMPT_TEMPLATE = (organization, stats) => ({
  prompt: `Analyze this organization for Saudi innovation ecosystem engagement:

Organization: ${organization.name_en}
Type: ${organization.org_type}
Partner Status: ${organization.is_partner ? 'Active Partner' : 'Not a Partner'}
Verified: ${organization.is_verified ? 'Yes' : 'No'}
Location: ${organization.location || 'Not specified'}
Sectors: ${organization.sectors?.join(', ') || 'Not specified'}

Statistics:
- Solutions: ${stats?.solutions || 0}
- Active Pilots: ${stats?.activePilots || 0}
- Completed Pilots: ${stats?.completedPilots || 0}
- Success Rate: ${stats?.successRate || 0}%

${SAUDI_CONTEXT}

Provide:
1. Partnership Potential Assessment
2. Innovation Capability Analysis
3. Collaboration Recommendations
4. Sector Alignment Opportunities
5. Growth Strategy Suggestions`,
  
  system: `You are an organization analyst for the Saudi Arabian innovation ecosystem. Evaluate organizations for partnership potential and ecosystem integration aligned with Vision 2030.`,
  
  schema: {
    type: 'object',
    properties: {
      partnership_potential: { type: 'number' },
      capability_assessment: { type: 'array', items: { type: 'string' } },
      collaboration_recommendations: { type: 'array', items: { type: 'string' } },
      sector_opportunities: { type: 'array', items: { type: 'string' } },
      growth_strategies: { type: 'array', items: { type: 'string' } }
    }
  }
});

export const ORGANIZATION_ANALYSIS_SYSTEM_PROMPT = `You are an organization analyst for the Saudi Arabian innovation ecosystem. Evaluate organizations for partnership potential and ecosystem integration aligned with Vision 2030.`;

export default ORGANIZATION_DETAIL_PROMPT_TEMPLATE;
