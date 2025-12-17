/**
 * Causal Graph Visualizer AI Prompt
 * Analyzes challenge root causes and builds causal relationships
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generates prompt for causal graph analysis
 * @param {Object} challenge - Challenge data
 * @returns {string} Formatted prompt
 */
export function getCausalGraphPrompt(challenge) {
  return `${SAUDI_CONTEXT.MUNICIPAL}

Analyze this municipal challenge and build a causal graph showing root causes, intermediate factors, and the main problem.

CHALLENGE:
- Title: ${challenge.title_en}
- Description: ${challenge.description_en || 'Not provided'}
- Current Root Causes: ${JSON.stringify(challenge.root_causes || [])}
- Sector: ${challenge.sector}

Create a hierarchical causal structure:
1. DEEP ROOT CAUSES: Fundamental systemic issues (infrastructure, policy, funding)
2. INTERMEDIATE FACTORS: Contributing causes that amplify the problem
3. DIRECT CAUSES: Immediate triggers visible to citizens
4. RELATIONSHIPS: How causes connect with strength indicators

Consider Saudi municipal context:
- Regional infrastructure variations
- Population growth patterns
- Climate and environmental factors
- Governance and coordination challenges`;
}

/**
 * JSON schema for causal graph response
 */
export const causalGraphSchema = {
  type: 'object',
  properties: {
    deep_roots: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cause: { type: 'string' },
          impact_level: { 
            type: 'string',
            enum: ['high', 'medium', 'low']
          }
        },
        required: ['cause', 'impact_level']
      },
      description: 'Fundamental systemic causes'
    },
    intermediate: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          factor: { type: 'string' },
          connected_to: { 
            type: 'array', 
            items: { type: 'string' }
          }
        },
        required: ['factor']
      },
      description: 'Contributing intermediate factors'
    },
    direct_causes: {
      type: 'array',
      items: { type: 'string' },
      description: 'Immediate visible causes'
    },
    relationships: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          strength: { 
            type: 'string',
            enum: ['strong', 'moderate', 'weak']
          }
        },
        required: ['from', 'to', 'strength']
      },
      description: 'Causal relationships between factors'
    }
  },
  required: ['deep_roots', 'intermediate', 'direct_causes', 'relationships']
};

export default { getCausalGraphPrompt, causalGraphSchema };
