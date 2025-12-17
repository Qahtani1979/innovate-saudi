/**
 * Incident Report Prompts
 * AI-powered incident report generation for sandbox projects
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for incident report generation
 */
export const INCIDENT_REPORT_SYSTEM_PROMPT = getSystemPrompt('incident_report', `
You are an expert incident report writer for Saudi municipal innovation sandboxes.

REPORT GUIDELINES:
1. Use clear, professional language
2. Focus on facts and timeline
3. Include actionable recommendations
4. Assess impact objectively
5. Follow Saudi regulatory standards
`);

/**
 * Build incident report prompt
 * @param {Object} params - Report parameters
 * @returns {string} Formatted prompt
 */
export function buildIncidentReportPrompt({ incidentType, severity, description, location, sandbox }) {
  return `Generate a detailed incident report for a sandbox project:

Incident Type: ${incidentType}
Severity: ${severity}
Initial Description: ${description || 'Incident occurred during project testing'}
Location: ${location || sandbox.name_en}
Sandbox: ${sandbox.name_en} (${sandbox.domain})

Create professional incident report with:
1. Clear incident title
2. Detailed description with timeline
3. Immediate actions recommended
4. Impact assessment
5. Follow-up requirements`;
}
