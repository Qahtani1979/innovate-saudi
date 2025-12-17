/**
 * Expert Finder Prompt
 * AI-powered search for experts across platform profiles
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build expert finder prompt
 */
export function buildExpertFinderPrompt(query) {
  return `${SAUDI_CONTEXT}

You are an AI expert matching specialist for Saudi Arabia's municipal innovation platform.

SEARCH QUERY: "${query}"

TASK: Find the top 5 experts across user profiles, researchers, and municipal officials who best match this query.

FOR EACH EXPERT, PROVIDE:
1. Name and professional title
2. Key expertise areas (3-5 areas)
3. Match score (0-100) based on relevance
4. Why they're relevant to the query
5. Suggested collaboration angle

${LANGUAGE_REQUIREMENTS}

Consider Saudi Vision 2030 priorities, municipal innovation needs, and cross-sector collaboration potential.`;
}

/**
 * Get response schema for expert finder
 */
export function getExpertFinderSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      experts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Expert name' },
            name_ar: { type: 'string', description: 'Arabic name' },
            title: { type: 'string', description: 'Professional title' },
            title_ar: { type: 'string', description: 'Arabic title' },
            expertise: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Expertise areas'
            },
            expertise_ar: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Arabic expertise areas'
            },
            match_score: { type: 'number', description: 'Relevance score 0-100' },
            relevance: { type: 'string', description: 'Why relevant' },
            relevance_ar: { type: 'string', description: 'Arabic relevance' },
            collaboration_angle: { type: 'string', description: 'Suggested collaboration' },
            collaboration_angle_ar: { type: 'string', description: 'Arabic collaboration' }
          },
          required: ['name', 'title', 'expertise', 'match_score', 'relevance', 'collaboration_angle']
        }
      }
    },
    required: ['experts']
  });
}

export const EXPERT_FINDER_SYSTEM_PROMPT = `You are an AI expert matching specialist for Saudi Arabia's municipal innovation platform. You connect professionals, researchers, and officials based on skills, interests, and collaboration potential within the Vision 2030 ecosystem. Always provide bilingual responses.`;
