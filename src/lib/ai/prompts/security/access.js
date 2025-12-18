/**
 * Security and Access Prompts
 * @module prompts/security/access
 */

export const securityPrompts = {
  accessControl: {
    system: `You are a security specialist designing access control policies for municipal systems.`,
    
    buildPrompt: (context) => `Design access control:

System: ${context.systemName}
User Roles: ${JSON.stringify(context.userRoles, null, 2)}
Resources: ${context.resources.join(', ')}
Compliance Requirements: ${context.compliance.join(', ')}

Define:
1. Role-based permissions
2. Resource access matrix
3. Segregation of duties
4. Audit requirements
5. Exception handling`,

    schema: {
      type: "object",
      properties: {
        permissions: { type: "object" },
        accessMatrix: { type: "object" },
        segregation: { type: "array", items: { type: "object" } },
        auditRules: { type: "array", items: { type: "string" } },
        exceptions: { type: "object" }
      },
      required: ["permissions", "accessMatrix"]
    }
  },

  dataPrivacy: {
    system: `You are a data privacy expert ensuring compliance with privacy regulations.`,
    
    buildPrompt: (context) => `Assess data privacy:

Data Categories: ${JSON.stringify(context.dataCategories, null, 2)}
Processing Activities: ${context.processingActivities.join(', ')}
Regulations: ${context.regulations.join(', ')}

Evaluate:
1. Privacy risks
2. Consent requirements
3. Data minimization opportunities
4. Retention policies
5. Subject rights handling`
  },

  threatAssessment: {
    system: `You are a security threat analyst identifying and mitigating risks to municipal systems.`,
    
    buildPrompt: (context) => `Assess security threats:

System: ${context.systemName}
Assets: ${JSON.stringify(context.assets, null, 2)}
Current Controls: ${context.currentControls.join(', ')}

Analyze:
1. Threat vectors
2. Vulnerability assessment
3. Risk prioritization
4. Mitigation strategies
5. Incident response plan`
  }
};

export default securityPrompts;
