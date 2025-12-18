/**
 * Pilot creation wizard prompts
 * @module pilots/pilotCreate
 */

export const PILOT_CREATE_SYSTEM_PROMPT = `You are an expert in designing municipal innovation pilots for Saudi Arabia aligned with Vision 2030.`;

export const createPilotTeamPrompt = (challenge, formData) => `Generate an optimal team composition for this pilot project:
Challenge: ${challenge?.title_en || 'TBD'}
Sector: ${formData.sector}
Description: ${formData.description_en}
Budget: ${formData.budget} ${formData.budget_currency || 'SAR'}
Timeline: ${formData.start_date} to ${formData.end_date}

Suggest team roles with:
1. Role title (bilingual EN/AR)
2. Required skills
3. FTE allocation
4. Justification for inclusion`;

export const PILOT_TEAM_SCHEMA = {
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
    team_structure_notes: { type: 'string' }
  }
};

export const createPilotStakeholderPrompt = (challenge, formData) => `Identify key stakeholders for this municipal innovation pilot:
Challenge: ${challenge?.title_en || 'TBD'}
Sector: ${formData.sector}
Municipality: ${formData.municipality_name || 'TBD'}
Description: ${formData.description_en}

Identify stakeholders with:
1. Stakeholder name/type (bilingual)
2. Role in pilot
3. Interest level (high/medium/low)
4. Influence level (high/medium/low)
5. Engagement strategy`;

export const PILOT_STAKEHOLDER_SCHEMA = {
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
          engagement_strategy_en: { type: 'string' },
          engagement_strategy_ar: { type: 'string' }
        }
      }
    }
  }
};

export const createPilotTechStackPrompt = (formData, solution) => `Recommend technology stack for this pilot:
Description: ${formData.description_en}
Solution: ${solution?.name_en || 'TBD'}
Sector: ${formData.sector}
Budget: ${formData.budget} ${formData.budget_currency || 'SAR'}

Recommend:
1. Core technologies
2. Integration requirements  
3. Infrastructure needs
4. Security considerations
5. Scalability approach`;

export const PILOT_TECH_STACK_SCHEMA = {
  type: 'object',
  properties: {
    core_technologies: { type: 'array', items: { type: 'string' } },
    integrations: { type: 'array', items: { type: 'string' } },
    infrastructure: {
      type: 'object',
      properties: {
        hosting: { type: 'string' },
        database: { type: 'string' },
        cloud_services: { type: 'array', items: { type: 'string' } }
      }
    },
    security_requirements: { type: 'array', items: { type: 'string' } },
    scalability_notes: { type: 'string' }
  }
};

export const createPilotBudgetPrompt = (formData) => `Optimize budget allocation for this pilot:
Total Budget: ${formData.budget} ${formData.budget_currency || 'SAR'}
Description: ${formData.description_en}
Timeline: ${formData.start_date} to ${formData.end_date}
Sector: ${formData.sector}

Provide optimized allocation for:
1. Personnel costs (%)
2. Technology/equipment (%)
3. Operations (%)
4. Contingency (%)
5. Monitoring & evaluation (%)

Include justification for each allocation.`;

export const PILOT_BUDGET_SCHEMA = {
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
    optimization_notes: { type: 'string' },
    risk_buffer_pct: { type: 'number' }
  }
};
