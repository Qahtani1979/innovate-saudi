/**
 * Compliance Assessment AI Prompts
 * Centralized prompts for compliance analysis and audit
 * @module compliance/complianceAssessment
 */

export const COMPLIANCE_ASSESSMENT_SYSTEM_PROMPT = `You are an expert compliance analyst for Saudi Arabian government entities.

COMPLIANCE FRAMEWORK:
1. Regulatory Analysis
   - Applicable regulations
   - Compliance requirements
   - Reporting obligations
   - Certification needs

2. Gap Assessment
   - Current state analysis
   - Requirement mapping
   - Gap identification
   - Priority ranking

3. Remediation Planning
   - Action items
   - Resource needs
   - Timeline estimation
   - Risk mitigation

4. Monitoring
   - Compliance metrics
   - Audit schedules
   - Reporting requirements
   - Continuous improvement

CONTEXT:
- Saudi regulatory framework
- Vision 2030 compliance standards
- Arabic/English bilingual support`;

export const COMPLIANCE_ASSESSMENT_SCHEMA = {
  type: "object",
  properties: {
    compliance_score: { type: "number" },
    compliance_status: { type: "string", enum: ["compliant", "partially_compliant", "non_compliant"] },
    requirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          regulation: { type: "string" },
          requirement: { type: "string" },
          status: { type: "string" },
          gap: { type: "string" },
          remediation: { type: "string" }
        }
      }
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          gap: { type: "string" },
          severity: { type: "string" },
          action_required: { type: "string" }
        }
      }
    },
    action_plan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          priority: { type: "string" },
          owner: { type: "string" },
          deadline: { type: "string" }
        }
      }
    }
  },
  required: ["compliance_score", "compliance_status", "requirements"]
};

export const buildComplianceAssessmentPrompt = (entityData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Assess compliance for:

ENTITY: ${entityData.name || 'Not specified'}
TYPE: ${entityData.type || 'Organization'}
SECTOR: ${entityData.sector || 'Government'}

APPLICABLE REGULATIONS:
${entityData.regulations?.map(r => `- ${r}`).join('\n') || 'Standard government regulations'}

CURRENT CERTIFICATIONS:
${entityData.certifications?.map(c => `- ${c}`).join('\n') || 'None listed'}

LAST AUDIT: ${entityData.lastAudit || 'Not available'}
AUDIT FINDINGS: ${entityData.auditFindings || 0}

Provide comprehensive compliance assessment with remediation plan.`;
};

export const COMPLIANCE_ASSESSMENT_PROMPTS = {
  system: COMPLIANCE_ASSESSMENT_SYSTEM_PROMPT,
  schema: COMPLIANCE_ASSESSMENT_SCHEMA,
  buildPrompt: buildComplianceAssessmentPrompt
};

export default COMPLIANCE_ASSESSMENT_PROMPTS;
