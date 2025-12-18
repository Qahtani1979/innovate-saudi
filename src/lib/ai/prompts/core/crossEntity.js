/**
 * Cross-entity recommendation prompts
 * @module core/crossEntity
 */

export const CROSS_ENTITY_SYSTEM_PROMPT = `You are an expert in analyzing relationships between municipal innovation entities (challenges, solutions, pilots, R&D projects) for Saudi Arabia.`;

export const createCrossEntityPrompt = (sourceType, sourceEntity, targetTypes) => `Analyze and recommend related entities for this ${sourceType}:

Source Entity:
${JSON.stringify(sourceEntity, null, 2)}

Target Entity Types: ${targetTypes.join(', ')}

Provide recommendations:
1. Most relevant matches by entity type
2. Relevance score (0-100)
3. Collaboration opportunities
4. Strategic alignment assessment`;

export const CROSS_ENTITY_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entity_type: { type: 'string' },
          entity_id: { type: 'string' },
          entity_title: { type: 'string' },
          relevance_score: { type: 'number' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' },
          collaboration_opportunity: { type: 'string' }
        }
      }
    },
    strategic_alignment_en: { type: 'string' },
    strategic_alignment_ar: { type: 'string' }
  }
};

export const createEntityMatchingPrompt = (entity, candidates) => `Match this entity with the most suitable candidates:

Entity to Match:
${JSON.stringify(entity, null, 2)}

Candidates:
${JSON.stringify(candidates, null, 2)}

Rank candidates by:
1. Relevance score (0-100)
2. Compatibility assessment
3. Success probability`;

export const ENTITY_MATCHING_SCHEMA = {
  type: 'object',
  properties: {
    ranked_matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          candidate_id: { type: 'string' },
          relevance_score: { type: 'number' },
          compatibility_en: { type: 'string' },
          compatibility_ar: { type: 'string' },
          success_probability: { type: 'number' }
        }
      }
    }
  }
};
