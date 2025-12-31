/**
 * Multi-Lab Collaboration Finder Prompt
 * Identifies equipment sharing and research collaboration opportunities between labs
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build collaboration finder prompt
 */
export function buildCollaborationFinderPrompt(currentLab, otherLabs) {
  const labsContext = otherLabs.slice(0, 10).map(l => 
    `- ${l.name_en}: ${l.research_themes?.join(', ') || 'General research'}`
  ).join('\n');

  return `${SAUDI_CONTEXT.INNOVATION}

You are an AI research collaboration specialist for Saudi Arabia's municipal living labs network.

CURRENT LAB: ${currentLab?.name_en || 'Unknown Lab'}
- Research Focus: ${currentLab?.research_themes?.join(', ') || 'Not specified'}
- Equipment Available: ${currentLab?.equipment?.map(e => e.name || e).join(', ') || 'Standard lab equipment'}
- Location: ${currentLab?.municipality || 'Saudi Arabia'}

OTHER LABS IN NETWORK:
${labsContext}

TASK: Identify top 5 collaboration opportunities between the current lab and other labs.

COLLABORATION TYPES TO CONSIDER:
1. Equipment Sharing - Lab A has equipment Lab B needs
2. Expertise Exchange - Complementary research areas
3. Joint Research Projects - Combined capabilities
4. Resource Optimization - Shared resources reduce costs

${LANGUAGE_REQUIREMENTS.BILINGUAL}

For each opportunity, provide:
- Partner lab name
- Type of collaboration
- Description of the opportunity
- Expected benefits
- Synergy score (0-100 based on alignment)`;
}

/**
 * Get response schema for collaboration finder
 */
export function getCollaborationFinderSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      opportunities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            partner_lab: { type: 'string', description: 'Name of partner lab' },
            partner_lab_ar: { type: 'string', description: 'Arabic name of partner lab' },
            opportunity_type: { type: 'string', description: 'Type of collaboration' },
            opportunity_type_ar: { type: 'string', description: 'Arabic type' },
            description: { type: 'string', description: 'English description' },
            description_ar: { type: 'string', description: 'Arabic description' },
            benefit: { type: 'string', description: 'Expected benefit' },
            benefit_ar: { type: 'string', description: 'Arabic benefit' },
            synergy_score: { type: 'number', description: 'Alignment score 0-100' }
          },
          required: ['partner_lab', 'opportunity_type', 'description', 'synergy_score']
        }
      }
    },
    required: ['opportunities']
  });
}

export const COLLABORATION_FINDER_SYSTEM_PROMPT = `You are an AI research collaboration specialist for Saudi Arabia's municipal living labs network. You identify synergies between labs to maximize research impact and resource utilization. Always provide bilingual responses.`;
