/**
 * Compliance Monitoring Prompts
 * AI prompts for compliance tracking and regulatory adherence
 * @module prompts/compliance/complianceMonitoring
 */

export const COMPLIANCE_CHECK_PROMPT = {
  id: 'compliance_check',
  version: '1.0.0',
  category: 'compliance',
  system: `You are a compliance monitoring specialist with expertise in Saudi Arabian regulations.
Evaluate organizational practices against regulatory requirements and internal policies.
Identify compliance risks and provide actionable remediation guidance.
Consider MOMRA, MISA, and other relevant Saudi regulatory frameworks.`,
  template: `Perform compliance check:

Regulation/Policy: {{regulation}}
Requirements: {{requirements}}
Current State: {{currentState}}
Evidence Collected: {{evidence}}
Previous Findings: {{previousFindings}}
Risk Appetite: {{riskAppetite}}

Assess compliance status and provide remediation roadmap.`,
  schema: {
    type: 'object',
    properties: {
      overallStatus: { type: 'string', enum: ['compliant', 'partially_compliant', 'non_compliant', 'unknown'] },
      complianceScore: { type: 'number', minimum: 0, maximum: 100 },
      requirementChecks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            requirement: { type: 'string' },
            status: { type: 'string', enum: ['met', 'partial', 'not_met', 'not_applicable'] },
            evidence: { type: 'string' },
            gap: { type: 'string' },
            riskLevel: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
          }
        }
      },
      findings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['violation', 'gap', 'observation', 'recommendation'] },
            description: { type: 'string' },
            impact: { type: 'string' },
            rootCause: { type: 'string' }
          }
        }
      },
      remediationPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            finding: { type: 'string' },
            action: { type: 'string' },
            responsible: { type: 'string' },
            deadline: { type: 'string' },
            resources: { type: 'string' }
          }
        }
      },
      riskExposure: {
        type: 'object',
        properties: {
          regulatory: { type: 'string' },
          financial: { type: 'string' },
          operational: { type: 'string' },
          reputational: { type: 'string' }
        }
      }
    },
    required: ['overallStatus', 'complianceScore', 'requirementChecks', 'findings']
  }
};

export const REGULATORY_UPDATE_PROMPT = {
  id: 'regulatory_update',
  version: '1.0.0',
  category: 'compliance',
  system: `You are a regulatory intelligence specialist.
Track and analyze regulatory changes affecting organizations.
Provide impact assessments and implementation guidance for Saudi regulatory updates.`,
  template: `Analyze regulatory update:

Regulation: {{regulationName}}
Issuing Authority: {{authority}}
Change Summary: {{changeSummary}}
Effective Date: {{effectiveDate}}
Current Compliance Status: {{currentStatus}}
Affected Operations: {{affectedOps}}

Assess impact and provide implementation roadmap.`,
  schema: {
    type: 'object',
    properties: {
      changeAnalysis: {
        type: 'object',
        properties: {
          changeType: { type: 'string', enum: ['new', 'amendment', 'repeal', 'clarification'] },
          significance: { type: 'string', enum: ['major', 'moderate', 'minor'] },
          keyChanges: { type: 'array', items: { type: 'string' } }
        }
      },
      impactAssessment: {
        type: 'object',
        properties: {
          affectedAreas: { type: 'array', items: { type: 'string' } },
          operationalImpact: { type: 'string' },
          financialImpact: { type: 'string' },
          timelineImpact: { type: 'string' }
        }
      },
      gapAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            requirement: { type: 'string' },
            currentState: { type: 'string' },
            requiredState: { type: 'string' },
            gap: { type: 'string' },
            effort: { type: 'string' }
          }
        }
      },
      implementationRoadmap: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            phase: { type: 'number' },
            activities: { type: 'array', items: { type: 'string' } },
            deadline: { type: 'string' },
            owner: { type: 'string' }
          }
        }
      }
    },
    required: ['changeAnalysis', 'impactAssessment', 'implementationRoadmap']
  }
};

export const AUDIT_PREPARATION_PROMPT = {
  id: 'audit_preparation',
  version: '1.0.0',
  category: 'compliance',
  system: `You are an audit preparation specialist.
Help organizations prepare for compliance audits and assessments.
Ensure documentation completeness and evidence organization.`,
  template: `Prepare for audit:

Audit Type: {{auditType}}
Auditor: {{auditor}}
Scope: {{scope}}
Previous Audit Findings: {{previousFindings}}
Available Documentation: {{documentation}}
Timeline: {{timeline}}

Create audit preparation checklist and readiness assessment.`,
  schema: {
    type: 'object',
    properties: {
      readinessScore: { type: 'number', minimum: 0, maximum: 100 },
      preparationChecklist: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            item: { type: 'string' },
            status: { type: 'string', enum: ['complete', 'in_progress', 'not_started'] },
            owner: { type: 'string' },
            dueDate: { type: 'string' }
          }
        }
      },
      documentationGaps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            document: { type: 'string' },
            requirement: { type: 'string' },
            action: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      },
      potentialFindings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            area: { type: 'string' },
            risk: { type: 'string' },
            mitigationAction: { type: 'string' }
          }
        }
      },
      interviewPrep: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            topic: { type: 'string' },
            likelyQuestions: { type: 'array', items: { type: 'string' } },
            keyPoints: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    required: ['readinessScore', 'preparationChecklist', 'documentationGaps']
  }
};

export default {
  COMPLIANCE_CHECK_PROMPT,
  REGULATORY_UPDATE_PROMPT,
  AUDIT_PREPARATION_PROMPT
};
