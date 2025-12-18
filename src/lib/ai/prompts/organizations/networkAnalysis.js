/**
 * Organization network analysis prompts
 * @module organizations/networkAnalysis
 */

export const NETWORK_ANALYSIS_SYSTEM_PROMPT = `You are an expert in organizational network analysis for Saudi municipal innovation ecosystems. Analyze collaboration patterns, partnership opportunities, and strategic positioning.`;

export const createNetworkAnalysisPrompt = (organization, stats) => `Analyze the network position and collaboration opportunities for this organization:

Organization: ${organization.name_en}
Type: ${organization.org_type}
Sector: ${organization.sector || 'Multi-sector'}
Capabilities: ${organization.capabilities?.join(', ') || 'N/A'}
Current Partners: ${stats?.partnerCount || 0}
Active Pilots: ${stats?.pilotCount || 0}
Solutions: ${stats?.solutionCount || 0}

Provide analysis in BOTH English AND Arabic:
1. Network Position Assessment
2. Collaboration Gap Analysis
3. Strategic Partnership Recommendations (3-5 specific organizations)
4. Capability Alignment Opportunities
5. Growth Path Suggestions`;

export const NETWORK_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    position_assessment_en: { type: 'string' },
    position_assessment_ar: { type: 'string' },
    collaboration_gaps_en: { type: 'array', items: { type: 'string' } },
    collaboration_gaps_ar: { type: 'array', items: { type: 'string' } },
    partnership_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          org_type: { type: 'string' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' }
        }
      }
    },
    growth_suggestions_en: { type: 'array', items: { type: 'string' } },
    growth_suggestions_ar: { type: 'array', items: { type: 'string' } }
  }
};
