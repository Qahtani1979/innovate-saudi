/**
 * AI Collaboration Suggester Prompt
 * Suggests potential collaboration opportunities based on entity context
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields, scoreField } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generate collaboration suggestions prompt
 * @param {string} entityType - Type of entity (pilot, challenge, solution, etc.)
 * @param {Object} entityData - Entity details
 * @param {Object} relatedEntities - Related entities for context
 * @returns {string} Complete prompt
 */
export function getCollaborationSuggesterPrompt(entityType, entityData, relatedEntities = {}) {
  const entityDetails = entityData ? `
ENTITY DETAILS:
- Type: ${entityType}
- Title: ${entityData.title_en || entityData.title_ar || entityData.name || 'Not specified'}
- Sector: ${entityData.sector || entityData.sector_id || 'Not specified'}
- Status: ${entityData.status || entityData.stage || 'Active'}
- Description: ${entityData.description_en || entityData.description_ar || 'Not provided'}
- Municipality: ${entityData.municipality_id || 'National scope'}
- Tags/Keywords: ${entityData.tags?.join(', ') || entityData.keywords?.join(', ') || 'None'}
` : `Entity Type: ${entityType}`;

  return `${SAUDI_CONTEXT.FULL}

${SAUDI_CONTEXT.INNOVATION}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

COLLABORATION OPPORTUNITY ANALYSIS FOR MoMAH:

${entityDetails}

${relatedEntities.organizations ? `
POTENTIAL PARTNER ORGANIZATIONS:
${relatedEntities.organizations.slice(0, 10).map(o => `- ${o.name_en || o.name}: ${o.type || 'Organization'}`).join('\n')}
` : ''}

${relatedEntities.similarEntities ? `
SIMILAR ENTITIES (potential synergies):
${relatedEntities.similarEntities.slice(0, 5).map(e => `- ${e.title_en || e.name}: ${e.sector || 'Multi-sector'}`).join('\n')}
` : ''}

IDENTIFY 3-5 COLLABORATION OPPORTUNITIES:

Consider these collaboration types:
1. KNOWLEDGE PARTNERS: Universities, research centers (KAUST, KFUPM, KACST)
2. TECHNOLOGY PROVIDERS: PropTech, GovTech, ConTech companies
3. IMPLEMENTATION PARTNERS: Municipalities, Amanats with relevant experience
4. FUNDING PARTNERS: REDF, NHC, SRC, private investors
5. INNOVATION ECOSYSTEM: Monsha'at, Badir, startup accelerators

For each suggestion provide:
- Partner type and name
- Specific collaboration rationale (why this partnership makes sense)
- Expected value creation (what both parties gain)
- Confidence score (0-100) based on alignment strength
- Recommended next steps

CRITICAL: All text must be bilingual (English + Arabic formal MSA).
Focus on partnerships that accelerate Vision 2030 goals.`;
}

/**
 * Collaboration suggester response schema
 */
export const collaborationSuggesterSchema = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          partner_type: { 
            type: 'string', 
            enum: ['knowledge', 'technology', 'implementation', 'funding', 'ecosystem'],
            description: 'Type of collaboration partner'
          },
          partner_name_en: { type: 'string', description: 'Partner organization name (English)' },
          partner_name_ar: { type: 'string', description: 'Partner organization name (Arabic)' },
          ...flatBilingualFields('rationale', 'Why this partnership makes strategic sense'),
          ...flatBilingualFields('value_proposition', 'Expected value for both parties'),
          ...flatBilingualFields('next_steps', 'Recommended initial actions'),
          confidence: scoreField(0, 100),
          alignment_areas: {
            type: 'array',
            items: { type: 'string' },
            description: 'Areas of strategic alignment'
          }
        },
        required: ['partner_type', 'partner_name_en', 'partner_name_ar', 'rationale_en', 'rationale_ar', 'confidence']
      },
      minItems: 3,
      maxItems: 5
    },
    overall_collaboration_potential_en: { type: 'string', description: 'Summary of collaboration potential (English)' },
    overall_collaboration_potential_ar: { type: 'string', description: 'Summary of collaboration potential (Arabic)' }
  },
  required: ['suggestions']
};

export default { getCollaborationSuggesterPrompt, collaborationSuggesterSchema };
