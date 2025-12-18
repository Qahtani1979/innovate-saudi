/**
 * Compliance Reports Prompt Module
 * Handles compliance reporting and audit AI operations
 * @module prompts/reports/compliance
 */

export const COMPLIANCE_REPORT_SYSTEM_PROMPT = `You are an expert in Saudi government compliance and regulatory reporting.
Your role is to analyze compliance status and generate reports for regulatory requirements.

Guidelines:
- Reference specific regulations and standards
- Identify gaps and non-compliance issues
- Provide remediation recommendations
- Ensure accuracy and completeness
- Use formal regulatory language`;

export const COMPLIANCE_REPORT_PROMPTS = {
  assessCompliance: (entity, requirements) => `Assess compliance status for this entity:

Entity: ${entity.name}
Type: ${entity.type}
Requirements: ${requirements.map(r => r.name).join(', ')}

Provide:
1. Compliance score (percentage)
2. Met requirements
3. Gap areas
4. Critical issues
5. Remediation timeline`,

  generateAuditReport: (auditData) => `Generate an audit report based on findings:

Audit Scope: ${auditData.scope}
Period: ${auditData.period}
Findings: ${JSON.stringify(auditData.findings)}

Provide:
1. Executive summary
2. Methodology overview
3. Detailed findings
4. Risk ratings
5. Recommendations
6. Management response requirements`,

  trackRegulatory: (regulations, status) => `Track regulatory compliance across these regulations:

Regulations: ${regulations.map(r => r.name).join(', ')}
Current Status: ${JSON.stringify(status)}

Provide:
1. Compliance matrix
2. Deadline tracking
3. Risk areas
4. Priority actions`
};

export const buildCompliancePrompt = (type, params) => {
  const promptFn = COMPLIANCE_REPORT_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown compliance report prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: COMPLIANCE_REPORT_SYSTEM_PROMPT,
  prompts: COMPLIANCE_REPORT_PROMPTS,
  build: buildCompliancePrompt
};
