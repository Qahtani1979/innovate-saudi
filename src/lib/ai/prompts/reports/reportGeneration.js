/**
 * Report Generation AI Prompts
 * @module prompts/reports/reportGeneration
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Executive summary generation prompt
 */
export const EXECUTIVE_SUMMARY_PROMPT_TEMPLATE = (data, reportType) => `
Generate an executive summary for ${reportType} report:

Data Summary:
${JSON.stringify(data, null, 2)}

Report Type: ${reportType}

${SAUDI_CONTEXT}

Generate a bilingual executive summary including:
1. Key Highlights (English & Arabic)
2. Performance Metrics Overview
3. Strategic Alignment Assessment
4. Critical Issues Requiring Attention
5. Recommendations for Leadership
`;

/**
 * Dashboard insights generation prompt
 */
export const DASHBOARD_INSIGHTS_PROMPT_TEMPLATE = (metrics) => `
Generate actionable insights from dashboard metrics:

Metrics:
${JSON.stringify(metrics, null, 2)}

${SAUDI_CONTEXT}

Provide:
1. Key Performance Indicators Analysis
2. Trend Identification
3. Anomaly Detection
4. Comparative Analysis
5. Action Items for Improvement
`;

/**
 * Progress report generation prompt
 */
export const PROGRESS_REPORT_PROMPT_TEMPLATE = (entity, period) => `
Generate a progress report for ${period}:

Entity: ${entity.title_en || entity.name_en || entity.title}
Type: ${entity.entity_type || 'general'}
Status: ${entity.status}
Progress: ${entity.progress_percentage || entity.completion_percentage || 0}%

Key Metrics:
${JSON.stringify(entity.kpis || entity.metrics || {}, null, 2)}

${SAUDI_CONTEXT}

Generate report sections:
1. Executive Overview
2. Progress Against Targets
3. Key Achievements
4. Challenges and Mitigation
5. Next Period Outlook
`;

export const REPORT_GENERATION_SYSTEM_PROMPT = `You are a report writer for Saudi Arabian government and municipal entities. Generate professional, bilingual reports aligned with Vision 2030 reporting standards.`;

export const REPORT_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    summary_en: { type: "string" },
    summary_ar: { type: "string" },
    highlights: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    metrics: { type: "object" }
  },
  required: ["summary_en", "summary_ar"]
};
