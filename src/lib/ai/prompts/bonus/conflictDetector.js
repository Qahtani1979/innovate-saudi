/**
 * Resource Conflict Detector Prompts
 * @module bonus/conflictDetector
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CONFLICT_DETECTOR_SYSTEM_PROMPT = getSystemPrompt('conflict_detector', `
You are a resource conflict analysis specialist for Saudi Arabia's municipal innovation platform.
Your role is to detect and analyze resource conflicts across pilots, programs, and initiatives.
Identify scheduling conflicts, budget overlaps, personnel constraints, and infrastructure bottlenecks.
`);

/**
 * Build conflict detection prompt
 * @param {Object} params - Active entities data
 * @returns {string} Formatted prompt
 */
export function buildConflictDetectorPrompt({ activePilots, activePrograms, activeRD }) {
  return `Analyze resource conflicts across platform:

ACTIVE PILOTS (${activePilots?.length || 0}):
${activePilots?.slice(0, 5).map(p => 
  `${p.title_en} - ${p.team?.length || 0} team, ${p.budget || 0} SAR, ${p.municipality_id}`
).join('\n') || 'None'}

ACTIVE PROGRAMS (${activePrograms?.length || 0}):
${activePrograms?.slice(0, 5).map(p => 
  `${p.name_en} - ${p.participant_count || 0} participants`
).join('\n') || 'None'}

ACTIVE R&D (${activeRD?.length || 0}):
${activeRD?.slice(0, 5).map(r => 
  `${r.title_en} - ${r.budget || 0} SAR`
).join('\n') || 'None'}

Detect:
1. Team member over-allocation (same person on 3+ projects)
2. Budget conflicts (municipality exceeding capacity)
3. Timeline overlaps (same sandbox/lab double-booked)
4. Expertise gaps (high-demand skills bottlenecks)`;
}

export const CONFLICT_DETECTOR_SCHEMA = {
  type: 'object',
  properties: {
    team_conflicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          person: { type: 'string' },
          assigned_to: { type: 'array', items: { type: 'string' } },
          severity: { type: 'string' }
        }
      }
    },
    budget_conflicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          municipality: { type: 'string' },
          total_allocated: { type: 'number' },
          capacity: { type: 'number' },
          overage: { type: 'number' }
        }
      }
    },
    timeline_conflicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          resource: { type: 'string' },
          overlapping_items: { type: 'array', items: { type: 'string' } },
          dates: { type: 'string' }
        }
      }
    },
    recommendations: { type: 'array', items: { type: 'string' } }
  },
  required: ['recommendations']
};

export const CONFLICT_DETECTOR_PROMPTS = {
  systemPrompt: CONFLICT_DETECTOR_SYSTEM_PROMPT,
  buildPrompt: buildConflictDetectorPrompt,
  schema: CONFLICT_DETECTOR_SCHEMA
};
