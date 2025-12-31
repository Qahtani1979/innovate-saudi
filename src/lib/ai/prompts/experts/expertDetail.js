/**
 * Expert Analysis AI Prompts
 * @module prompts/experts/expertDetail
 * @version 1.1.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Expert profile analysis prompt template
 */
export const EXPERT_DETAIL_PROMPT_TEMPLATE = (expert, assignments, evaluations) => ({
  prompt: `Analyze this expert profile for optimal assignment matching:

Expert: ${expert.title || ''} ${expert.user_email?.split('@')[0] || ''}
Position: ${expert.position}
Years of Experience: ${expert.years_of_experience || 0}
Verified: ${expert.is_verified ? 'Yes' : 'No'}
Rating: ${expert.expert_rating || 'Not rated'}

Expertise Areas: ${expert.expertise_areas?.join(', ') || 'Not specified'}
Sector Specializations: ${expert.sector_specializations?.join(', ') || 'Not specified'}
Languages: ${expert.languages?.join(', ') || 'Not specified'}

Assignment History:
- Total Assignments: ${assignments?.length || 0}
- Completed: ${assignments?.filter(a => a.status === 'completed').length || 0}

Evaluation Statistics:
- Total Evaluations: ${evaluations?.length || 0}
- Average Score: ${evaluations?.length > 0 ? (evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length).toFixed(1) : 'N/A'}

${SAUDI_CONTEXT.COMPACT}

Provide:
1. Expertise Match Analysis
2. Assignment Type Recommendations
3. Development Opportunities
4. Collaboration Potential
5. Engagement Optimization Suggestions`,
  
  system: `You are an expert management analyst for the Saudi Arabian innovation ecosystem. Optimize expert assignments and development aligned with Vision 2030 expertise needs.`,
  
  schema: {
    type: 'object',
    properties: {
      expertise_match: { type: 'array', items: { type: 'string' }, description: 'Expertise match analysis' },
      expertise_match_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic expertise match' },
      assignment_recommendations: { type: 'array', items: { type: 'string' }, description: 'Assignment type recommendations' },
      assignment_recommendations_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic recommendations' },
      development_opportunities: { type: 'array', items: { type: 'string' }, description: 'Development opportunities' },
      development_opportunities_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic development opportunities' },
      collaboration_potential: { type: 'array', items: { type: 'string' }, description: 'Collaboration potential' },
      collaboration_potential_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic collaboration potential' },
      engagement_optimization: { type: 'array', items: { type: 'string' }, description: 'Engagement optimization suggestions' },
      engagement_optimization_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic engagement optimization' }
    },
    required: ['expertise_match', 'assignment_recommendations', 'development_opportunities', 'collaboration_potential', 'engagement_optimization']
  }
});

export const EXPERT_ANALYSIS_SYSTEM_PROMPT = `You are an expert management analyst for the Saudi Arabian innovation ecosystem. Optimize expert assignments and development aligned with Vision 2030 expertise needs.`;

export default EXPERT_DETAIL_PROMPT_TEMPLATE;
