/**
 * Pilot pre-flight risk simulation prompts
 * @module pilots/preflightRisk
 */

export const PREFLIGHT_RISK_SYSTEM_PROMPT = `You are a risk assessment expert for Saudi municipal innovation pilots. Simulate launch risks and generate mitigation strategies.`;

export const createPreflightRiskPrompt = (pilot, riskAssessment) => `Generate mitigation strategies for this pilot launch based on risk assessment:

Pilot: ${pilot.title_en}
Sector: ${pilot.sector}
Budget: ${pilot.budget} ${pilot.budget_currency || 'SAR'}
Timeline: ${pilot.start_date} to ${pilot.end_date}

Risk Assessment:
${JSON.stringify(riskAssessment, null, 2)}

Provide mitigation strategies in BOTH English AND Arabic for:
1. High-priority risks
2. Resource constraints
3. Stakeholder concerns
4. Technical challenges
5. Timeline risks`;

export const PREFLIGHT_RISK_SCHEMA = {
  type: 'object',
  properties: {
    mitigation_strategies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_category: { type: 'string' },
          strategy_en: { type: 'string' },
          strategy_ar: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort_level: { type: 'string' },
          timeline: { type: 'string' }
        }
      }
    },
    contingency_plans_en: { type: 'array', items: { type: 'string' } },
    contingency_plans_ar: { type: 'array', items: { type: 'string' } },
    launch_readiness_score: { type: 'number' }
  }
};

export const createTeamCompositionPrompt = (challenge, formData) => `Generate an optimal team composition for this pilot project:
Challenge: ${challenge?.title_en || 'TBD'}
Sector: ${formData.sector}
Description: ${formData.description_en}
Budget: ${formData.budget} ${formData.budget_currency || 'SAR'}

Suggest team roles with:
1. Role title (bilingual)
2. Required skills
3. FTE allocation
4. Justification`;

export const TEAM_COMPOSITION_SCHEMA = {
  type: 'object',
  properties: {
    team_roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role_en: { type: 'string' },
          role_ar: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
          fte: { type: 'number' },
          justification: { type: 'string' }
        }
      }
    },
    total_fte: { type: 'number' },
    budget_allocation: { type: 'object' }
  }
};

export const createStakeholderIdentificationPrompt = (challenge, formData) => `Identify key stakeholders for this municipal innovation pilot:
Challenge: ${challenge?.title_en || 'TBD'}
Sector: ${formData.sector}
Municipality: ${formData.municipality_name || 'TBD'}
Description: ${formData.description_en}

Identify stakeholders with:
1. Stakeholder name/type (bilingual)
2. Role in pilot
3. Interest level
4. Influence level
5. Engagement strategy`;

export const STAKEHOLDER_SCHEMA = {
  type: 'object',
  properties: {
    stakeholders: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          role: { type: 'string' },
          interest_level: { type: 'string', enum: ['high', 'medium', 'low'] },
          influence_level: { type: 'string', enum: ['high', 'medium', 'low'] },
          engagement_strategy: { type: 'string' }
        }
      }
    }
  }
};

export const createTechStackPrompt = (formData, solution) => `Recommend technology stack for this pilot:
Description: ${formData.description_en}
Solution: ${solution?.name_en || 'TBD'}
Sector: ${formData.sector}
Budget: ${formData.budget} ${formData.budget_currency || 'SAR'}

Recommend:
1. Core technologies
2. Integration requirements
3. Infrastructure needs
4. Security considerations`;

export const TECH_STACK_SCHEMA = {
  type: 'object',
  properties: {
    core_technologies: { type: 'array', items: { type: 'string' } },
    integrations: { type: 'array', items: { type: 'string' } },
    infrastructure: { type: 'object' },
    security_requirements: { type: 'array', items: { type: 'string' } }
  }
};

export const createBudgetOptimizationPrompt = (formData) => `Optimize budget allocation for this pilot:
Total Budget: ${formData.budget} ${formData.budget_currency || 'SAR'}
Description: ${formData.description_en}
Timeline: ${formData.start_date} to ${formData.end_date}
Sector: ${formData.sector}

Provide optimized allocation for:
1. Personnel costs
2. Technology/equipment
3. Operations
4. Contingency
5. Monitoring & evaluation`;

export const BUDGET_OPTIMIZATION_SCHEMA = {
  type: 'object',
  properties: {
    allocations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category_en: { type: 'string' },
          category_ar: { type: 'string' },
          amount: { type: 'number' },
          percentage: { type: 'number' },
          justification: { type: 'string' }
        }
      }
    },
    optimization_notes: { type: 'array', items: { type: 'string' } },
    risk_buffer_recommendation: { type: 'number' }
  }
};
