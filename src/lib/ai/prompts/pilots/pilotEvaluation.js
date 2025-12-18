/**
 * Pilot Evaluation AI Prompts
 * Centralized prompts for pilot project evaluation and success analysis
 * @module pilots/pilotEvaluation
 */

export const PILOT_EVALUATION_SYSTEM_PROMPT = `You are an expert pilot project evaluator specializing in Saudi Arabian government innovation initiatives.

EVALUATION FRAMEWORK:
1. Success Metrics Analysis
   - KPI achievement rates
   - Budget adherence
   - Timeline compliance
   - Stakeholder satisfaction

2. Impact Assessment
   - Citizen benefit realization
   - Operational efficiency gains
   - Cost savings achieved
   - Quality improvements

3. Scalability Analysis
   - Technical scalability
   - Resource requirements
   - Risk factors for scaling
   - Implementation complexity

4. Lessons Learned
   - Success factors
   - Challenges overcome
   - Best practices identified
   - Recommendations for future

CONTEXT:
- Saudi Vision 2030 alignment required
- Government procurement regulations
- Arabic/English bilingual support
- Municipal governance context`;

export const PILOT_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    overall_score: {
      type: "number",
      description: "Overall pilot success score (0-100)"
    },
    recommendation: {
      type: "string",
      enum: ["scale", "extend", "pivot", "terminate"],
      description: "Recommended next action"
    },
    success_metrics: {
      type: "object",
      properties: {
        kpi_achievement: { type: "number" },
        budget_adherence: { type: "number" },
        timeline_compliance: { type: "number" },
        stakeholder_satisfaction: { type: "number" }
      }
    },
    impact_analysis: {
      type: "object",
      properties: {
        citizen_benefit: { type: "string" },
        efficiency_gains: { type: "string" },
        cost_savings: { type: "string" },
        quality_improvements: { type: "string" }
      }
    },
    scalability: {
      type: "object",
      properties: {
        score: { type: "number" },
        technical_readiness: { type: "string" },
        resource_requirements: { type: "string" },
        risk_factors: { type: "array", items: { type: "string" } }
      }
    },
    lessons_learned: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          lesson: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    },
    next_steps: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["overall_score", "recommendation", "success_metrics"]
};

export const buildPilotEvaluationPrompt = (pilotData, language = 'en') => {
  const langInstruction = language === 'ar' 
    ? 'Respond in Arabic.' 
    : 'Respond in English.';

  return `${langInstruction}

Evaluate the following pilot project:

PILOT INFORMATION:
- Name: ${pilotData.name || 'Not specified'}
- Duration: ${pilotData.startDate} to ${pilotData.endDate}
- Budget: ${pilotData.budget} SAR
- Municipality: ${pilotData.municipality}
- Sector: ${pilotData.sector}

OBJECTIVES:
${pilotData.objectives?.map(o => `- ${o}`).join('\n') || 'Not specified'}

KPI RESULTS:
${pilotData.kpis?.map(k => `- ${k.name}: ${k.actual} / ${k.target} (${k.unit})`).join('\n') || 'Not specified'}

CHALLENGES ENCOUNTERED:
${pilotData.challenges?.join('\n') || 'None reported'}

STAKEHOLDER FEEDBACK:
${pilotData.feedback || 'Not available'}

Provide a comprehensive evaluation with scoring and actionable recommendations.`;
};

export const PILOT_EVALUATION_PROMPTS = {
  system: PILOT_EVALUATION_SYSTEM_PROMPT,
  schema: PILOT_EVALUATION_SCHEMA,
  buildPrompt: buildPilotEvaluationPrompt
};

export default PILOT_EVALUATION_PROMPTS;
