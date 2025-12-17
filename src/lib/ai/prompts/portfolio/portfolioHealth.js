/**
 * Portfolio Health Monitor AI Prompt
 * Analyzes innovation portfolio balance, pipeline health, and risk areas
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields, priorityField, scoreField } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generate portfolio health analysis prompt
 * @param {Object} portfolioData - Portfolio statistics
 * @param {Object} relatedEntities - Related entity details
 * @returns {string} Complete prompt
 */
export function getPortfolioHealthPrompt(portfolioData, relatedEntities = {}) {
  const { challenges, pilots, programs, rdProjects } = portfolioData;
  const sectors = [...new Set(challenges?.map(c => c.sector).filter(Boolean))];
  
  return `${SAUDI_CONTEXT.FULL}

${SAUDI_CONTEXT.INNOVATION}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

ANALYZE INNOVATION PORTFOLIO HEALTH FOR MoMAH:

CURRENT PORTFOLIO STATUS:
- CHALLENGES: ${challenges?.length || 0} total
  - Approved: ${challenges?.filter(c => c.status === 'approved').length || 0}
  - In Treatment: ${challenges?.filter(c => c.status === 'in_treatment').length || 0}
  - Pending: ${challenges?.filter(c => c.status === 'pending').length || 0}

- PILOTS: ${pilots?.length || 0} total
  - Active: ${pilots?.filter(p => p.stage === 'active').length || 0}
  - Preparation: ${pilots?.filter(p => p.stage === 'preparation').length || 0}
  - Scaled: ${pilots?.filter(p => p.stage === 'scaled').length || 0}
  - Completed: ${pilots?.filter(p => p.stage === 'completed').length || 0}

- PROGRAMS: ${programs?.length || 0} active capacity building programs

- R&D PROJECTS: ${rdProjects?.length || 0} innovation research projects

SECTOR DISTRIBUTION: ${sectors.join(', ') || 'Not specified'}

${relatedEntities.municipalities ? `MUNICIPALITIES INVOLVED: ${relatedEntities.municipalities.length}` : ''}

ANALYZE AND PROVIDE:
1. Overall portfolio health assessment (excellent/good/fair/poor)
2. Health score (0-100) based on balance, pipeline flow, and risk exposure
3. Balance score (0-100) measuring sector/geographic diversity
4. Pipeline flow assessment - are challenges converting to pilots effectively?
5. Risk areas - identify stagnant items, bottlenecks, or concentration risks
6. Strengths - what is working well in the portfolio
7. Strategic recommendations - 3-5 actionable improvements

CRITICAL: All text fields must be bilingual (English + Arabic). Use formal Modern Standard Arabic.
Focus on Vision 2030 alignment and national impact metrics.`;
}

/**
 * Portfolio health analysis response schema
 */
export const portfolioHealthSchema = {
  type: 'object',
  properties: {
    overall_health: { 
      type: 'string', 
      enum: ['excellent', 'good', 'fair', 'poor'],
      description: 'Overall portfolio health status'
    },
    health_score: scoreField(0, 100),
    balance_score: scoreField(0, 100),
    pipeline_flow_en: { type: 'string', description: 'Pipeline flow assessment (English)' },
    pipeline_flow_ar: { type: 'string', description: 'Pipeline flow assessment (Arabic)' },
    risk_areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...flatBilingualFields('text', 'Risk area description'),
          severity: priorityField(['critical', 'high', 'medium', 'low'])
        },
        required: ['text_en', 'text_ar', 'severity']
      },
      description: 'Identified risk areas in the portfolio'
    },
    strengths: {
      type: 'array',
      items: {
        type: 'object',
        properties: flatBilingualFields('text', 'Strength description'),
        required: ['text_en', 'text_ar']
      },
      description: 'Portfolio strengths'
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...flatBilingualFields('title', 'Recommendation title'),
          ...flatBilingualFields('description', 'Recommendation details'),
          priority: priorityField(),
          impact_area: { type: 'string', enum: ['balance', 'pipeline', 'risk', 'resources', 'alignment'] }
        },
        required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'priority']
      },
      description: 'Strategic recommendations for portfolio improvement'
    },
    vision_2030_alignment_score: scoreField(0, 100)
  },
  required: ['overall_health', 'health_score', 'balance_score', 'risk_areas', 'strengths', 'recommendations']
};

export default { getPortfolioHealthPrompt, portfolioHealthSchema };
