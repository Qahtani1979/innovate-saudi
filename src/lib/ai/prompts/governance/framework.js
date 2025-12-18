/**
 * Governance Framework Prompts
 * @module prompts/governance/framework
 */

export const governancePrompts = {
  policyDevelopment: {
    system: `You are a policy development specialist creating governance frameworks for municipal operations.`,
    
    buildPrompt: (context) => `Develop policy:

Policy Area: ${context.policyArea}
Objectives: ${context.objectives.join(', ')}
Stakeholders: ${context.stakeholders.join(', ')}
Existing Policies: ${context.existingPolicies.join(', ')}

Create:
1. Policy statement
2. Scope and applicability
3. Roles and responsibilities
4. Compliance requirements
5. Review mechanisms`,

    schema: {
      type: "object",
      properties: {
        policyStatement: { type: "string" },
        scope: { type: "object" },
        roles: { type: "array", items: { type: "object" } },
        compliance: { type: "object" },
        reviewProcess: { type: "object" }
      },
      required: ["policyStatement", "scope", "roles"]
    }
  },

  decisionFramework: {
    system: `You are a governance expert designing decision-making frameworks for municipal organizations.`,
    
    buildPrompt: (context) => `Design decision framework:

Decision Type: ${context.decisionType}
Authority Levels: ${context.authorityLevels.join(', ')}
Criteria: ${context.criteria.join(', ')}
Stakeholders: ${context.stakeholders.join(', ')}

Define:
1. Decision authority matrix
2. Escalation procedures
3. Documentation requirements
4. Transparency measures
5. Appeal processes`
  },

  accountabilityMapping: {
    system: `You are an accountability specialist mapping responsibilities across municipal structures.`,
    
    buildPrompt: (context) => `Map accountability:

Function: ${context.functionName}
Roles: ${JSON.stringify(context.roles, null, 2)}
Objectives: ${context.objectives.join(', ')}

Create:
1. RACI matrix
2. Reporting lines
3. Performance expectations
4. Consequence framework
5. Continuous improvement loop`
  }
};

export default governancePrompts;
