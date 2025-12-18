/**
 * Governance Analysis Prompts
 * AI prompts for governance evaluation and improvement
 * @module prompts/governance/governanceAnalysis
 */

export const GOVERNANCE_ASSESSMENT_PROMPT = {
  id: 'governance_assessment',
  version: '1.0.0',
  category: 'governance',
  system: `You are a governance specialist with expertise in public sector and municipal governance.
Evaluate governance frameworks against international standards and Saudi Vision 2030 goals.
Provide actionable recommendations for improving transparency, accountability, and efficiency.`,
  template: `Assess governance framework:

Organization: {{organizationName}}
Current Framework: {{currentFramework}}
Key Policies: {{policies}}
Decision-Making Structure: {{decisionStructure}}
Oversight Mechanisms: {{oversightMechanisms}}
Recent Audits: {{auditFindings}}

Evaluate against:
- Transparency standards
- Accountability mechanisms
- Stakeholder engagement
- Risk management
- Compliance effectiveness`,
  schema: {
    type: 'object',
    properties: {
      overallScore: { type: 'number', minimum: 0, maximum: 100 },
      dimensionScores: {
        type: 'object',
        properties: {
          transparency: { type: 'number' },
          accountability: { type: 'number' },
          stakeholderEngagement: { type: 'number' },
          riskManagement: { type: 'number' },
          compliance: { type: 'number' }
        }
      },
      strengths: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            area: { type: 'string' },
            description: { type: 'string' },
            evidence: { type: 'string' }
          }
        }
      },
      gaps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            area: { type: 'string' },
            issue: { type: 'string' },
            risk: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            recommendation: { type: 'string' }
          }
        }
      },
      improvementPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            priority: { type: 'number' },
            action: { type: 'string' },
            timeline: { type: 'string' },
            owner: { type: 'string' },
            resources: { type: 'string' }
          }
        }
      }
    },
    required: ['overallScore', 'dimensionScores', 'gaps', 'improvementPlan']
  }
};

export const POLICY_COMPLIANCE_PROMPT = {
  id: 'policy_compliance',
  version: '1.0.0',
  category: 'governance',
  system: `You are a policy compliance expert.
Analyze organizational practices against established policies and regulations.
Identify compliance gaps and provide remediation strategies aligned with Saudi regulations.`,
  template: `Analyze policy compliance:

Policy Name: {{policyName}}
Policy Requirements: {{requirements}}
Current Practices: {{currentPractices}}
Audit Findings: {{auditFindings}}
Regulatory Context: {{regulations}}

Provide compliance assessment with remediation roadmap.`,
  schema: {
    type: 'object',
    properties: {
      complianceStatus: { type: 'string', enum: ['compliant', 'partially_compliant', 'non_compliant'] },
      complianceScore: { type: 'number', minimum: 0, maximum: 100 },
      requirementAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            requirement: { type: 'string' },
            status: { type: 'string', enum: ['met', 'partial', 'not_met'] },
            evidence: { type: 'string' },
            gap: { type: 'string' }
          }
        }
      },
      remediationPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            gap: { type: 'string' },
            action: { type: 'string' },
            deadline: { type: 'string' },
            responsible: { type: 'string' }
          }
        }
      },
      riskExposure: {
        type: 'object',
        properties: {
          legal: { type: 'string' },
          financial: { type: 'string' },
          reputational: { type: 'string' }
        }
      }
    },
    required: ['complianceStatus', 'complianceScore', 'requirementAnalysis']
  }
};

export const STAKEHOLDER_GOVERNANCE_PROMPT = {
  id: 'stakeholder_governance',
  version: '1.0.0',
  category: 'governance',
  system: `You are a stakeholder governance specialist.
Design effective stakeholder engagement and governance structures.
Consider Saudi cultural context and Vision 2030 citizen participation goals.`,
  template: `Design stakeholder governance for:

Project/Initiative: {{projectName}}
Key Stakeholders: {{stakeholders}}
Current Engagement: {{currentEngagement}}
Decision Rights: {{decisionRights}}
Communication Channels: {{channels}}

Create governance structure with RACI matrix.`,
  schema: {
    type: 'object',
    properties: {
      governanceStructure: {
        type: 'object',
        properties: {
          steeringCommittee: {
            type: 'object',
            properties: {
              composition: { type: 'array', items: { type: 'string' } },
              frequency: { type: 'string' },
              authority: { type: 'array', items: { type: 'string' } }
            }
          },
          workingGroups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                focus: { type: 'string' },
                members: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      raciMatrix: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            activity: { type: 'string' },
            responsible: { type: 'string' },
            accountable: { type: 'string' },
            consulted: { type: 'array', items: { type: 'string' } },
            informed: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      engagementPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stakeholder: { type: 'string' },
            interest: { type: 'string' },
            influence: { type: 'string' },
            strategy: { type: 'string' },
            frequency: { type: 'string' }
          }
        }
      }
    },
    required: ['governanceStructure', 'raciMatrix', 'engagementPlan']
  }
};

export default {
  GOVERNANCE_ASSESSMENT_PROMPT,
  POLICY_COMPLIANCE_PROMPT,
  STAKEHOLDER_GOVERNANCE_PROMPT
};
