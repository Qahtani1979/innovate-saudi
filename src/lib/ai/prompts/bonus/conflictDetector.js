/**
 * Resource Conflict Detector Prompts
 * @module bonus/conflictDetector
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CONFLICT_DETECTOR_SYSTEM_PROMPT = getSystemPrompt('conflict_detector', `
You are a resource conflict analysis specialist for Saudi Arabia's municipal innovation platform.
Your role is to detect and analyze resource conflicts across pilots, programs, and initiatives.
Identify scheduling conflicts, budget overlaps, personnel constraints, and infrastructure bottlenecks.
`);

export function buildConflictDetectorPrompt({ activePilots, activePrograms, resources }) {
  return `Analyze resource conflicts across platform:

ACTIVE PILOTS (${activePilots?.length || 0}):
${activePilots?.slice(0, 10).map((p, i) => `${i+1}. ${p.title_en} - ${p.status}`).join('\n') || 'None'}

ACTIVE PROGRAMS (${activePrograms?.length || 0}):
${activePrograms?.slice(0, 10).map((p, i) => `${i+1}. ${p.name_en} - ${p.status}`).join('\n') || 'None'}

RESOURCES:
${JSON.stringify(resources || {}).substring(0, 500)}

Detect:
1. Scheduling conflicts (overlapping timelines)
2. Budget conflicts (competing for same funds)
3. Personnel conflicts (shared team members)
4. Infrastructure bottlenecks
5. Risk level for each conflict
6. Resolution recommendations`;
}

export const CONFLICT_DETECTOR_SCHEMA = {
  type: 'object',
  properties: {
    conflicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          conflict_type: { type: 'string', enum: ['scheduling', 'budget', 'personnel', 'infrastructure'] },
          entities_involved: { type: 'array', items: { type: 'string' } },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          description: { type: 'string' },
          impact: { type: 'string' },
          resolution: { type: 'string' }
        }
      }
    },
    overall_risk_score: { type: 'number', minimum: 0, maximum: 100 },
    priority_resolutions: { type: 'array', items: { type: 'string' } },
    resource_recommendations: { type: 'array', items: { type: 'string' } }
  },
  required: ['conflicts', 'overall_risk_score']
};

export const CONFLICT_DETECTOR_PROMPTS = {
  systemPrompt: CONFLICT_DETECTOR_SYSTEM_PROMPT,
  buildPrompt: buildConflictDetectorPrompt,
  schema: CONFLICT_DETECTOR_SCHEMA
};
