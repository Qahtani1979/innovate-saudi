/**
 * Living Lab Detail AI Prompts
 * @module prompts/livinglabs/livingLabDetail
 * @version 1.1.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Living Lab analysis prompt template
 */
export const LIVING_LAB_DETAIL_PROMPT_TEMPLATE = (lab) => ({
  prompt: `Analyze this Living Lab facility and provide strategic insights:

Living Lab: ${lab.name_en}
Type: ${lab.type}
Status: ${lab.status}
Capacity: ${lab.capacity}
Current Projects: ${lab.current_projects || 0}
Completed Projects: ${lab.total_completed_projects || 0}
Focus Areas: ${lab.focus_areas?.join(', ') || 'Not specified'}
Equipment Count: ${lab.equipment?.length || 0}

${SAUDI_CONTEXT.INNOVATION}

Provide:
1. Capacity Utilization Analysis
2. Research Focus Recommendations
3. Equipment Optimization
4. Collaboration Opportunities
5. Strategic Alignment with Vision 2030`,
  
  system: `You are a Living Lab operations analyst specializing in Saudi Arabian research and innovation facilities. Provide strategic recommendations for optimizing lab operations and research output.`,
  
  schema: {
    type: 'object',
    properties: {
      capacity_analysis: { type: 'array', items: { type: 'string' }, description: 'Capacity utilization analysis' },
      capacity_analysis_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic capacity analysis' },
      research_focus: { type: 'array', items: { type: 'string' }, description: 'Research focus recommendations' },
      research_focus_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic research focus' },
      equipment_optimization: { type: 'array', items: { type: 'string' }, description: 'Equipment optimization suggestions' },
      equipment_optimization_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic equipment optimization' },
      collaboration_opportunities: { type: 'array', items: { type: 'string' }, description: 'Collaboration opportunities' },
      collaboration_opportunities_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic collaboration opportunities' },
      strategic_alignment: { type: 'array', items: { type: 'string' }, description: 'Vision 2030 alignment' },
      strategic_alignment_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic strategic alignment' }
    },
    required: ['capacity_analysis', 'research_focus', 'equipment_optimization', 'collaboration_opportunities', 'strategic_alignment']
  }
});

export const LIVING_LAB_ANALYSIS_SYSTEM_PROMPT = `You are a Living Lab operations analyst specializing in Saudi Arabian research and innovation facilities. Provide strategic recommendations for optimizing lab operations and research output.`;

export default LIVING_LAB_DETAIL_PROMPT_TEMPLATE;
