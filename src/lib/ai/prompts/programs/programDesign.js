/**
 * Program Design AI prompts
 * For designing new programs based on strategic objectives
 */

export const PROGRAM_DESIGN_SYSTEM_PROMPT = `You are a program design expert for government innovation programs.
Your role is to help design comprehensive programs that address strategic objectives.
Provide practical, actionable program structures with clear phases, outcomes, and resource requirements.
All responses must be in valid JSON format.`;

export function buildProgramDesignPrompt(objective, context = {}) {
  const contextInfo = context.existingPrograms 
    ? `\nExisting programs to consider: ${JSON.stringify(context.existingPrograms)}`
    : '';
  
  return `Design a comprehensive program to achieve this strategic objective:

Objective: ${objective.title_en || objective.description_en}
${objective.kpis ? `KPIs: ${JSON.stringify(objective.kpis)}` : ''}
${objective.timeline ? `Timeline: ${objective.timeline}` : ''}
${contextInfo}

Provide a structured program design with phases, activities, resources, and success metrics.`;
}

export const PROGRAM_DESIGN_SCHEMA = {
  type: "object",
  properties: {
    program_name_en: { type: "string" },
    program_name_ar: { type: "string" },
    description_en: { type: "string" },
    description_ar: { type: "string" },
    phases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          duration_months: { type: "number" },
          activities: { type: "array", items: { type: "string" } },
          deliverables: { type: "array", items: { type: "string" } },
          resources_required: { type: "array", items: { type: "string" } }
        }
      }
    },
    success_metrics: { type: "array", items: { type: "string" } },
    estimated_budget: { type: "string" },
    key_stakeholders: { type: "array", items: { type: "string" } },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          risk: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    }
  },
  required: ["program_name_en", "description_en", "phases", "success_metrics"]
};

export const PROGRAM_OPTIMIZATION_SYSTEM_PROMPT = `You are a program optimization specialist.
Analyze program performance data and provide actionable recommendations.
Focus on improving efficiency, impact, and resource utilization.`;

export function buildProgramOptimizationPrompt(program, performanceData) {
  return `Analyze this program and suggest optimizations:

Program: ${program.name_en}
Current Status: ${program.status}
Budget Utilization: ${performanceData.budgetUtilization || 'N/A'}%
Milestone Completion: ${performanceData.milestoneCompletion || 'N/A'}%
Stakeholder Satisfaction: ${performanceData.satisfaction || 'N/A'}/5

Challenges: ${performanceData.challenges?.join(', ') || 'None reported'}

Provide specific, actionable optimization recommendations.`;
}

export const PROGRAM_OPTIMIZATION_SCHEMA = {
  type: "object",
  properties: {
    overall_assessment: { type: "string" },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          current_state: { type: "string" },
          recommendation: { type: "string" },
          expected_impact: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    },
    quick_wins: { type: "array", items: { type: "string" } },
    resource_reallocation: { type: "string" }
  },
  required: ["overall_assessment", "recommendations"]
};
