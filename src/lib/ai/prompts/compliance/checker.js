/**
 * Compliance Checking Prompts
 * @module prompts/compliance/checker
 */

export const compliancePrompts = {
  regulatoryCheck: {
    system: `You are a compliance expert specializing in Saudi Arabian municipal regulations and governance requirements.`,
    
    buildPrompt: (context) => `Check regulatory compliance:

Entity Type: ${context.entityType}
Entity Details: ${JSON.stringify(context.entityDetails, null, 2)}
Applicable Regulations: ${context.regulations.join(', ')}
Current Status: ${context.currentStatus}

Evaluate:
1. Compliance status for each regulation
2. Non-compliance issues identified
3. Risk level assessment
4. Required remediation actions
5. Compliance timeline recommendations`,

    schema: {
      type: "object",
      properties: {
        overallStatus: { type: "string", enum: ["compliant", "partial", "non_compliant"] },
        complianceDetails: { type: "array", items: { type: "object" } },
        issues: { type: "array", items: { type: "object" } },
        riskLevel: { type: "string" },
        remediationPlan: { type: "array", items: { type: "object" } }
      },
      required: ["overallStatus", "complianceDetails", "riskLevel"]
    }
  },

  auditPreparation: {
    system: `You are an audit preparation specialist helping organizations prepare for compliance audits.`,
    
    buildPrompt: (context) => `Prepare for compliance audit:

Audit Type: ${context.auditType}
Audit Date: ${context.auditDate}
Scope: ${context.scope}
Previous Findings: ${JSON.stringify(context.previousFindings, null, 2)}

Generate:
1. Pre-audit checklist
2. Documentation requirements
3. Key areas of focus
4. Risk mitigation steps
5. Staff preparation guidelines`
  },

  policyAlignment: {
    system: `You are a policy alignment expert ensuring organizational activities align with established policies.`,
    
    buildPrompt: (context) => `Check policy alignment:

Activity: ${context.activityDescription}
Applicable Policies: ${JSON.stringify(context.policies, null, 2)}
Organization Context: ${context.organizationContext}

Assess:
1. Alignment with each policy
2. Potential conflicts
3. Required approvals
4. Documentation needs
5. Recommendations for alignment`
  }
};

export default compliancePrompts;
