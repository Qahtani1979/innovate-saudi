/**
 * Success Pattern Analyzer AI Prompt
 * Analyzes successful pilots to identify winning patterns
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generates prompt for success pattern analysis
 * @param {string} sector - The sector to analyze
 * @param {Array} pilots - Array of successful pilot data
 * @returns {string} Formatted prompt
 */
export function getSuccessPatternPrompt(sector, pilots) {
  const pilotSummaries = pilots.slice(0, 10).map(p => `
PILOT: ${p.title_en}
Team Size: ${p.team?.length || 'N/A'}
Budget: ${p.budget || 'N/A'} SAR
Duration: ${p.duration_weeks || 'N/A'} weeks
KPIs Achieved: ${p.kpis?.filter(k => k.status === 'achieved').length}/${p.kpis?.length}
TRL: ${p.trl_start} → ${p.trl_current}`).join('\n');

  return `${SAUDI_CONTEXT.MUNICIPAL}

Analyze success patterns from ${pilots.length} successful pilots in the ${sector} sector.

PILOT DATA:
${pilotSummaries}

Identify:
1. COMMON SUCCESS FACTORS: Team structure, budget ranges, methodologies
2. OPTIMAL TEAM SIZE: Based on successful outcomes
3. TYPICAL DURATION: Average weeks for successful completion
4. BUDGET EFFICIENCY: Patterns in budget allocation
5. KEY METHODOLOGIES: What approaches worked best
6. CRITICAL SUCCESS CRITERIA: Must-have elements

Provide a replication template for future pilots in this sector.`;
}

/**
 * JSON schema for success pattern response
 */
export const successPatternSchema = {
  type: 'object',
  properties: {
    optimal_team_size: { 
      type: 'string',
      description: 'Recommended team size range'
    },
    avg_duration_weeks: { 
      type: 'number',
      description: 'Average duration for success'
    },
    avg_budget_range: { 
      type: 'string',
      description: 'Typical budget range'
    },
    common_methodologies: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Frequently used methodologies'
    },
    success_factors: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Key success factors'
    },
    critical_criteria: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Critical success criteria'
    },
    replication_template: { 
      type: 'string',
      description: 'Template for replicating success'
    }
  },
  required: ['optimal_team_size', 'avg_duration_weeks', 'success_factors']
};

export default { getSuccessPatternPrompt, successPatternSchema };
