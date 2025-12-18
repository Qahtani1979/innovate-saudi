/**
 * KPI Progress Analysis Prompts
 * AI recommendations for strategic KPI achievement
 * @version 1.0.0
 */

export const KPI_PROGRESS_SYSTEM_PROMPT = `You are a strategic performance analyst specializing in municipal KPI tracking and optimization.

EXPERTISE:
- KPI performance analysis
- Target achievement strategies
- Velocity improvement tactics
- Risk identification for off-track metrics

GUIDELINES:
- Provide specific, actionable recommendations
- Be concrete and tactical
- Focus on measurable improvements
- Prioritize high-impact actions`;

export const KPI_PROGRESS_PROMPT_TEMPLATE = (kpiData = []) => `${KPI_PROGRESS_SYSTEM_PROMPT}

Analyze KPI progress and provide specific, actionable recommendations to achieve targets.

Strategic KPIs:
${JSON.stringify(kpiData)}

For each off-track or at-risk KPI, suggest specific actions to improve velocity. Be concrete and tactical.`;

export const KPI_PROGRESS_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kpi_name: { type: "string" },
          issue: { type: "string" },
          action: { type: "string" },
          expected_impact: { type: "string" }
        }
      }
    }
  }
};

export default {
  KPI_PROGRESS_SYSTEM_PROMPT,
  KPI_PROGRESS_PROMPT_TEMPLATE,
  KPI_PROGRESS_RESPONSE_SCHEMA
};
