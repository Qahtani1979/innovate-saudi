/**
 * Scaling Insights Prompts
 * For generating national scaling strategy insights
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SCALING_INSIGHTS_PROMPTS = {
  systemPrompt: getSystemPrompt('scaling_insights'),
  
  buildPrompt: (completedPilots, scaledPilots) => `Analyze the national scaling pipeline and provide strategic insights:

CURRENT PIPELINE STATUS:
- Pilots Ready to Scale: ${completedPilots.length}
- Already Scaled: ${scaledPilots.length}

COMPLETED PILOTS SUMMARY:
${completedPilots.slice(0, 15).map(p => `- ${p.title_en}
  Sector: ${p.sector || 'General'}
  Success Probability: ${p.success_probability || 'N/A'}%
  Municipality: ${p.municipality_name || 'Unknown'}
  Budget: ${p.budget || 'Unknown'} SAR`).join('\n')}

PROVIDE STRATEGIC INSIGHTS:

1. PRIORITY PILOTS FOR NATIONAL SCALING
   - Which pilots should be prioritized and why
   - Impact potential assessment
   - Resource requirements

2. GEOGRAPHIC SCALING RECOMMENDATIONS
   - Which cities/regions to target first
   - Regional readiness considerations
   - Clustering opportunities

3. SECTOR-BASED SCALING OPPORTUNITIES
   - Cross-sector synergies
   - Sector-specific scaling patterns
   - Priority sectors for Vision 2030 alignment

4. BUDGET OPTIMIZATION STRATEGIES
   - Cost-sharing opportunities
   - Phased rollout recommendations
   - Efficiency improvements

5. RISK MITIGATION FOR NATIONAL ROLLOUT
   - Common failure patterns to avoid
   - Success factors to replicate
   - Governance recommendations`,

  schema: {
    type: 'object',
    properties: {
      priority_pilots: { 
        type: 'array', 
        items: { type: 'string' },
        description: "Priority pilots for scaling with reasoning"
      },
      geographic_strategy: { 
        type: 'array', 
        items: { type: 'string' },
        description: "Geographic scaling recommendations"
      },
      sector_opportunities: { 
        type: 'array', 
        items: { type: 'string' },
        description: "Sector-based opportunities"
      },
      budget_optimization: { 
        type: 'array', 
        items: { type: 'string' },
        description: "Budget optimization strategies"
      },
      risk_mitigation: { 
        type: 'array', 
        items: { type: 'string' },
        description: "Risk mitigation strategies"
      }
    },
    required: ['priority_pilots', 'geographic_strategy', 'sector_opportunities', 'budget_optimization', 'risk_mitigation']
  }
};

export default SCALING_INSIGHTS_PROMPTS;
