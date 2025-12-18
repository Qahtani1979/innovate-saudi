/**
 * Strategy Generation AI Prompts
 * Centralized prompts for strategic planning and initiative development
 * @module strategy/strategyGeneration
 */

export const STRATEGY_GENERATION_SYSTEM_PROMPT = `You are an expert strategic planning advisor for Saudi Arabian government entities.

STRATEGIC PLANNING FRAMEWORK:
1. Vision & Mission Alignment
   - Saudi Vision 2030 pillars
   - National transformation programs
   - Sector-specific objectives
   - Municipal mandates

2. Strategic Objectives
   - SMART goal formulation
   - KPI definition
   - Target setting
   - Timeline planning

3. Initiative Development
   - Program design
   - Resource allocation
   - Risk mitigation
   - Stakeholder engagement

4. Implementation Roadmap
   - Phase planning
   - Milestone definition
   - Dependency mapping
   - Success criteria

CONTEXT:
- Saudi government planning standards
- Vision 2030 strategic framework
- Municipal governance requirements
- Arabic/English bilingual support`;

export const STRATEGY_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    strategic_vision: {
      type: "object",
      properties: {
        vision_statement: { type: "string" },
        mission_statement: { type: "string" },
        core_values: { type: "array", items: { type: "string" } }
      }
    },
    strategic_objectives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          objective: { type: "string" },
          description: { type: "string" },
          kpis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                target: { type: "string" },
                baseline: { type: "string" },
                timeline: { type: "string" }
              }
            }
          },
          initiatives: { type: "array", items: { type: "string" } }
        }
      }
    },
    implementation_roadmap: {
      type: "object",
      properties: {
        phases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phase_name: { type: "string" },
              duration: { type: "string" },
              key_activities: { type: "array", items: { type: "string" } },
              milestones: { type: "array", items: { type: "string" } }
            }
          }
        },
        critical_success_factors: { type: "array", items: { type: "string" } },
        risk_mitigation: { type: "array", items: { type: "string" } }
      }
    },
    resource_requirements: {
      type: "object",
      properties: {
        budget_estimate: { type: "string" },
        human_resources: { type: "string" },
        technology_needs: { type: "array", items: { type: "string" } }
      }
    },
    vision_2030_alignment: {
      type: "object",
      properties: {
        primary_pillar: { type: "string" },
        aligned_programs: { type: "array", items: { type: "string" } },
        contribution_areas: { type: "array", items: { type: "string" } }
      }
    }
  },
  required: ["strategic_vision", "strategic_objectives"]
};

export const buildStrategyGenerationPrompt = (contextData, language = 'en') => {
  const langInstruction = language === 'ar' 
    ? 'Respond in Arabic.' 
    : 'Respond in English.';

  return `${langInstruction}

Generate a strategic plan for:

ENTITY INFORMATION:
- Name: ${contextData.entityName || 'Not specified'}
- Type: ${contextData.entityType || 'Municipality'}
- Region: ${contextData.region || 'Not specified'}
- Current Focus: ${contextData.currentFocus || 'Not specified'}

PLANNING HORIZON: ${contextData.planningHorizon || '3-5 years'}

KEY CHALLENGES:
${contextData.challenges?.map(c => `- ${c}`).join('\n') || 'Not specified'}

OPPORTUNITIES:
${contextData.opportunities?.map(o => `- ${o}`).join('\n') || 'Not specified'}

PRIORITY SECTORS:
${contextData.sectors?.join(', ') || 'All sectors'}

BUDGET ENVELOPE: ${contextData.budget || 'To be determined'}

Generate a comprehensive strategic plan aligned with Vision 2030.`;
};

export const STRATEGY_GENERATION_PROMPTS = {
  system: STRATEGY_GENERATION_SYSTEM_PROMPT,
  schema: STRATEGY_GENERATION_SCHEMA,
  buildPrompt: buildStrategyGenerationPrompt
};

export default STRATEGY_GENERATION_PROMPTS;
