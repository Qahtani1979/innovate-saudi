/**
 * Training and capacity building prompts
 * @module training/capacity
 */

export const TRAINING_SYSTEM_PROMPT = `You are an expert in designing training programs and capacity building initiatives for Saudi municipal innovation.`;

export const createTrainingPlanPrompt = (topic, audience, duration) => `Design a training plan:

Topic: ${topic}
Target Audience: ${audience}
Duration: ${duration}

Provide in BOTH English AND Arabic:
1. Learning objectives
2. Module breakdown
3. Assessment methods
4. Resources needed
5. Success metrics`;

export const TRAINING_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    learning_objectives_en: { type: 'array', items: { type: 'string' } },
    learning_objectives_ar: { type: 'array', items: { type: 'string' } },
    modules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          module_title_en: { type: 'string' },
          module_title_ar: { type: 'string' },
          duration: { type: 'string' },
          topics: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    assessment_methods: { type: 'array', items: { type: 'string' } },
    resources_needed: { type: 'array', items: { type: 'string' } },
    success_metrics: { type: 'array', items: { type: 'string' } }
  }
};

export const createCapacityAssessmentPrompt = (team, capabilities) => `Assess team capacity and recommend improvements:

Team Profile: ${JSON.stringify(team)}
Current Capabilities: ${JSON.stringify(capabilities)}

Provide:
1. Capacity gaps identified
2. Skill development priorities
3. Training recommendations
4. Timeline for improvement`;

export const CAPACITY_ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    capacity_gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gap_en: { type: 'string' },
          gap_ar: { type: 'string' },
          severity: { type: 'string' },
          impact: { type: 'string' }
        }
      }
    },
    skill_priorities_en: { type: 'array', items: { type: 'string' } },
    skill_priorities_ar: { type: 'array', items: { type: 'string' } },
    training_recommendations: { type: 'array', items: { type: 'string' } },
    improvement_timeline: { type: 'string' }
  }
};
