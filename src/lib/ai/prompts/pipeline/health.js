/**
 * Pipeline Health AI Prompts
 * Prompts for analyzing innovation pipeline health
 * @module ai/prompts/pipeline/health
 * @version 1.1.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Pipeline Health Analysis Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const PIPELINE_HEALTH_ANALYSIS_PROMPT_TEMPLATE = ({
  stages,
  conversionRate,
  scalingRate,
  totalSolutions,
  expertUtilization,
  pendingAssignments,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT.FULL}

Analyze this innovation pipeline health and provide recommendations:

Pipeline stages: ${JSON.stringify(stages)}
Conversion rate (Challenge→Pilot): ${conversionRate}%
Scaling rate (Pilot→Scaled): ${scalingRate}%
Total solutions: ${totalSolutions}
Expert utilization: ${expertUtilization || 'N/A'}%
Pending expert assignments: ${pendingAssignments || 'N/A'}

Provide:
1. Overall pipeline health score (0-100)
2. Top 3 bottlenecks identified
3. Recommended actions to improve flow
4. Risk areas requiring attention

Consider Saudi municipal innovation context and Vision 2030 alignment.`,
  system: `You are a Saudi municipal innovation pipeline analyst. Provide actionable insights to improve innovation flow and identify bottlenecks.`,
  schema: {
    type: 'object',
    properties: {
      health_score: { 
        type: 'number',
        description: 'Overall pipeline health score from 0-100'
      },
      bottlenecks: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Top 3 identified bottlenecks'
      },
      bottlenecks_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic bottlenecks'
      },
      recommendations: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Recommended actions to improve pipeline flow'
      },
      recommendations_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic recommendations'
      },
      risks: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Risk areas requiring attention'
      },
      risks_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic risks'
      }
    },
    required: ['health_score', 'bottlenecks', 'recommendations', 'risks']
  }
});

/**
 * Pipeline Stage Analysis Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const PIPELINE_STAGE_ANALYSIS_PROMPT_TEMPLATE = ({
  stageName,
  itemCount,
  avgTimeInStage,
  transitionRate,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT.COMPACT}

Analyze this pipeline stage performance:

Stage: ${stageName}
Items in stage: ${itemCount}
Average time in stage: ${avgTimeInStage || 'N/A'} days
Transition rate to next stage: ${transitionRate || 'N/A'}%

Provide:
1. Stage efficiency assessment
2. Improvement recommendations
3. Resource allocation suggestions`,
  system: `You are a Saudi municipal innovation pipeline analyst specializing in stage optimization.`,
  schema: {
    type: 'object',
    properties: {
      efficiency_score: { type: 'number', description: 'Stage efficiency score 0-100' },
      assessment: { type: 'string', description: 'Stage efficiency assessment' },
      assessment_ar: { type: 'string', description: 'Arabic assessment' },
      improvements: { type: 'array', items: { type: 'string' }, description: 'Improvement recommendations' },
      improvements_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic improvements' },
      resource_suggestions: { type: 'array', items: { type: 'string' }, description: 'Resource allocation suggestions' },
      resource_suggestions_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic resource suggestions' }
    },
    required: ['efficiency_score', 'assessment', 'improvements', 'resource_suggestions']
  }
});

export default {
  PIPELINE_HEALTH_ANALYSIS_PROMPT_TEMPLATE,
  PIPELINE_STAGE_ANALYSIS_PROMPT_TEMPLATE
};
