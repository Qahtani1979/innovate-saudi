/**
 * Cross Entity Recommender Prompts
 * Centralized prompts for AI-powered entity recommendations
 * @module recommendations/crossEntity
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for cross-entity recommendations
 */
export const CROSS_ENTITY_SYSTEM_PROMPT = getSystemPrompt('recommendations_cross_entity');

/**
 * Build prompt for cross-entity recommendations
 * @param {Object} sourceEntity - Source entity data
 * @param {string} sourceType - Type of source entity
 * @param {Object} availableEntities - Available entities to match
 * @returns {string} Formatted prompt
 */
export const buildCrossEntityPrompt = (sourceEntity, sourceType, availableEntities) => {
  const context = `
Source: ${sourceType}
Title: ${sourceEntity.title_en || sourceEntity.name_en}
Description: ${sourceEntity.description_en || sourceEntity.abstract_en || ''}
Sector: ${sourceEntity.sector || sourceEntity.research_area || ''}
${sourceType === 'Challenge' ? `Root Cause: ${sourceEntity.root_cause_en || ''}` : ''}
${sourceType === 'Pilot' ? `Success Probability: ${sourceEntity.success_probability}%` : ''}
${sourceType === 'RDProject' ? `TRL: ${sourceEntity.trl_current}` : ''}
  `;

  return `Analyze and recommend related entities for this ${sourceType}:

${context}

Available entities to match:
${availableEntities.rdCalls?.length ? `R&D Calls: ${availableEntities.rdCalls.slice(0, 10).map(c => `${c.title_en} (${c.call_type})`).join(', ')}` : ''}
${availableEntities.rdProjects?.length ? `R&D Projects: ${availableEntities.rdProjects.slice(0, 10).map(p => `${p.title_en} (TRL ${p.trl_current})`).join(', ')}` : ''}
${availableEntities.pilots?.length ? `Pilots: ${availableEntities.pilots.slice(0, 10).map(p => `${p.title_en} (${p.sector})`).join(', ')}` : ''}
${availableEntities.challenges?.length ? `Challenges: ${availableEntities.challenges.slice(0, 10).map(c => `${c.title_en} (${c.sector})`).join(', ')}` : ''}

Return top 3-5 recommendations for EACH entity type with:
- Entity ID (match from the provided lists)
- Match score (0-100)
- Reason for match (bilingual EN/AR)
- Recommended action (bilingual EN/AR)`;
};

/**
 * JSON schema for cross-entity recommendations
 */
export const CROSS_ENTITY_SCHEMA = {
  type: 'object',
  properties: {
    rdcall_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entity_id: { type: 'string' },
          match_score: { type: 'number' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' },
          action_en: { type: 'string' },
          action_ar: { type: 'string' }
        }
      }
    },
    rdproject_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entity_id: { type: 'string' },
          match_score: { type: 'number' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' },
          action_en: { type: 'string' },
          action_ar: { type: 'string' }
        }
      }
    },
    pilot_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entity_id: { type: 'string' },
          match_score: { type: 'number' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' },
          action_en: { type: 'string' },
          action_ar: { type: 'string' }
        }
      }
    },
    challenge_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entity_id: { type: 'string' },
          match_score: { type: 'number' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' },
          action_en: { type: 'string' },
          action_ar: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Cross entity prompts namespace
 */
export const CROSS_ENTITY_PROMPTS = {
  systemPrompt: CROSS_ENTITY_SYSTEM_PROMPT,
  buildPrompt: buildCrossEntityPrompt,
  schema: CROSS_ENTITY_SCHEMA
};

export default CROSS_ENTITY_PROMPTS;
