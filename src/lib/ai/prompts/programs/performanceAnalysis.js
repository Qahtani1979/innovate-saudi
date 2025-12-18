/**
 * Program Performance AI Prompts
 * Centralized prompts for program effectiveness analysis
 * @module programs/performanceAnalysis
 */

export const PROGRAM_PERFORMANCE_SYSTEM_PROMPT = `You are an expert program analyst for Saudi Arabian government innovation programs.

ANALYSIS FRAMEWORK:
1. Performance Metrics
   - KPI achievement rates
   - Budget utilization
   - Timeline adherence
   - Participant satisfaction

2. Impact Assessment
   - Beneficiary outcomes
   - Economic impact
   - Social benefits
   - Innovation advancement

3. Efficiency Analysis
   - Resource optimization
   - Process effectiveness
   - Cost-benefit ratio
   - Value delivery

4. Recommendations
   - Improvement areas
   - Best practices
   - Scaling potential
   - Risk mitigation

CONTEXT:
- Saudi Vision 2030 alignment
- Government program standards
- Arabic/English bilingual support`;

export const PROGRAM_PERFORMANCE_SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    performance_rating: { type: "string", enum: ["excellent", "good", "satisfactory", "needs_improvement", "critical"] },
    kpi_summary: {
      type: "object",
      properties: {
        achieved: { type: "number" },
        on_track: { type: "number" },
        at_risk: { type: "number" },
        missed: { type: "number" }
      }
    },
    budget_analysis: {
      type: "object",
      properties: {
        utilization_rate: { type: "number" },
        variance: { type: "string" },
        forecast: { type: "string" }
      }
    },
    impact_metrics: {
      type: "object",
      properties: {
        beneficiaries_reached: { type: "number" },
        satisfaction_score: { type: "number" },
        outcomes_achieved: { type: "array", items: { type: "string" } }
      }
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          recommendation: { type: "string" },
          priority: { type: "string" },
          expected_impact: { type: "string" }
        }
      }
    }
  },
  required: ["overall_score", "performance_rating", "kpi_summary"]
};

export const buildProgramPerformancePrompt = (programData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze program performance:

PROGRAM: ${programData.name || 'Not specified'}
STATUS: ${programData.status || 'Active'}
DURATION: ${programData.startDate} to ${programData.endDate}
BUDGET: ${programData.budget} SAR (${programData.budgetUtilized}% utilized)

KPIs:
${programData.kpis?.map(k => `- ${k.name}: ${k.actual}/${k.target} (${k.unit})`).join('\n') || 'Not specified'}

PARTICIPANTS: ${programData.participants || 0}
PROJECTS: ${programData.projectCount || 0}

Provide comprehensive performance analysis with actionable recommendations.`;
};

export const PROGRAM_PERFORMANCE_PROMPTS = {
  system: PROGRAM_PERFORMANCE_SYSTEM_PROMPT,
  schema: PROGRAM_PERFORMANCE_SCHEMA,
  buildPrompt: buildProgramPerformancePrompt
};

export default PROGRAM_PERFORMANCE_PROMPTS;
