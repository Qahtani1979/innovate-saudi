/**
 * Executive Reports Prompt Module
 * Handles executive summary and report generation AI operations
 * @module prompts/reports/executive
 */

export const EXECUTIVE_REPORT_SYSTEM_PROMPT = `You are an expert in creating executive-level reports for Saudi government leadership.
Your role is to synthesize complex information into clear, actionable summaries for decision-makers.

Guidelines:
- Be concise and action-oriented
- Highlight key decisions required
- Include quantitative metrics
- Align with Vision 2030 priorities
- Use formal, professional language`;

export const EXECUTIVE_REPORT_PROMPTS = {
  generateSummary: (data, period) => `Generate an executive summary for ${period}:

Data Overview:
${JSON.stringify(data, null, 2)}

Provide:
1. Key highlights (3-5 bullet points)
2. Critical metrics and trends
3. Issues requiring attention
4. Recommended actions
5. Strategic implications`,

  createDashboardNarrative: (metrics) => `Create a narrative explanation of these dashboard metrics:

Metrics: ${JSON.stringify(metrics)}

Provide:
1. Overall performance assessment
2. Metric-by-metric analysis
3. Trend interpretation
4. Action recommendations`,

  prepareDecisionBrief: (issue, options) => `Prepare a decision brief for leadership:

Issue: ${issue.title}
Description: ${issue.description}
Options: ${options.map(o => o.name).join(', ')}

Provide:
1. Issue summary
2. Options analysis with pros/cons
3. Recommendation with rationale
4. Risk assessment
5. Implementation considerations`
};

export const buildExecutiveReportPrompt = (type, params) => {
  const promptFn = EXECUTIVE_REPORT_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown executive report prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: EXECUTIVE_REPORT_SYSTEM_PROMPT,
  prompts: EXECUTIVE_REPORT_PROMPTS,
  build: buildExecutiveReportPrompt
};
