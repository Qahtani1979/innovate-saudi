/**
 * Capacity Optimizer Prompt
 * Analyzes lab usage patterns and provides optimization recommendations
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build capacity optimization prompt
 */
export function buildCapacityOptimizerPrompt(livingLab, bookingsCount, projectsCount) {
  return `${SAUDI_CONTEXT}

You are an AI capacity optimization specialist for Saudi Arabian living labs.

LIVING LAB DETAILS:
- Name: ${livingLab?.name_en || 'Unknown Lab'}
- Type: ${livingLab?.type || 'General'}
- Status: ${livingLab?.status || 'Active'}
- Available Equipment: ${livingLab?.equipment_catalog?.length || 0} items
- Total Bookings: ${bookingsCount || 0}
- Active Projects: ${projectsCount || 0}
- Max Capacity: ${livingLab?.max_capacity || 'Not specified'}

TASK: Analyze lab capacity utilization and provide optimization recommendations.

PROVIDE:
1. Current utilization rate estimate (0-100%)
2. Peak usage periods (days/times)
3. Underutilized resources
4. Capacity expansion recommendations
5. Scheduling optimization suggestions
6. Resource allocation improvements

${LANGUAGE_REQUIREMENTS}

Consider Saudi work week (Sunday-Thursday) and local operational patterns.`;
}

/**
 * Get response schema for capacity optimizer
 */
export function getCapacityOptimizerSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      utilization_rate: { type: 'number', description: 'Current utilization percentage' },
      peak_periods: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Peak usage times'
      },
      peak_periods_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic peak periods'
      },
      underutilized: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Underutilized resources'
      },
      underutilized_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic underutilized list'
      },
      expansion_recommendations: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Expansion suggestions'
      },
      expansion_recommendations_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic expansion suggestions'
      },
      scheduling_tips: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Scheduling optimization tips'
      },
      scheduling_tips_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic scheduling tips'
      },
      allocation_improvements: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Resource allocation improvements'
      },
      allocation_improvements_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic allocation improvements'
      }
    },
    required: ['utilization_rate', 'peak_periods', 'underutilized', 'expansion_recommendations', 'scheduling_tips', 'allocation_improvements']
  });
}

export const CAPACITY_OPTIMIZER_SYSTEM_PROMPT = `You are an AI capacity optimization specialist for Saudi Arabian living labs. You analyze usage patterns and provide actionable recommendations to maximize lab efficiency and resource utilization. Always provide bilingual responses.`;
