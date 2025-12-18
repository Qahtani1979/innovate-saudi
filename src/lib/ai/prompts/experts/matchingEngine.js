/**
 * Expert Matching Engine Prompt Module
 * AI-powered expert assignment with workload balancing
 * @module prompts/experts/matchingEngine
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Schema for expert matching response
 */
export const EXPERT_MATCHING_SCHEMA = {
  type: 'object',
  properties: {
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          expert_email: { type: 'string' },
          match_score: { type: 'number' },
          reason: { type: 'string' },
          availability_ok: { type: 'boolean' },
          potential_conflict: { type: 'boolean' }
        }
      }
    }
  }
};

/**
 * Expert matching prompt template
 * @param {Object} context - Matching context
 * @returns {string} Formatted prompt
 */
export function EXPERT_MATCHING_PROMPT_TEMPLATE(context) {
  const { entityType, entityDesc, entitySector, expertsInfo } = context;
  
  return `Match experts to this ${entityType}:

Entity: ${entityDesc.substring(0, 400)}
Sector: ${entitySector}

Available Experts:
${expertsInfo}

Return top 10 most relevant experts considering:
1. Expertise-entity alignment
2. Sector specialization match
3. Availability (prefer experts with >5h/month available)
4. Past performance (rating if >0)

Include match scores (0-100) and reasons.`;
}

/**
 * Format expert info for matching
 * @param {Array} experts - Expert profiles
 * @param {Object} workload - Expert workload map
 * @returns {string} Formatted expert list
 */
export function formatExpertsForMatching(experts, workload) {
  return experts
    .filter(e => e.is_active && e.is_verified)
    .map(e => {
      const currentWorkload = workload[e.user_email] || 0;
      const availableHours = Math.max(0, (e.availability_hours_per_month || 20) - currentWorkload);
      return `- ${e.user_email}: ${e.expertise_areas?.join(', ')} | Sectors: ${e.sector_specializations?.join(', ')} | Available: ${availableHours}h/month`;
    })
    .join('\n');
}

/**
 * Expert matching system prompt
 */
export const EXPERT_MATCHING_SYSTEM_PROMPT = `You are an expert assignment coordinator for Saudi Arabia's municipal innovation ecosystem.

Your role is to match the most suitable experts to evaluation tasks based on:
- Expertise alignment with entity requirements
- Sector specialization relevance
- Current workload and availability
- Past performance and ratings
- Potential conflicts of interest

Provide accurate match scores and clear reasoning for each recommendation.`;

export default {
  EXPERT_MATCHING_PROMPT_TEMPLATE,
  EXPERT_MATCHING_SCHEMA,
  EXPERT_MATCHING_SYSTEM_PROMPT,
  formatExpertsForMatching
};
