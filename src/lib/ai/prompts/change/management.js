/**
 * Change Management Prompts
 * @module prompts/change/management
 */

export const changeManagementPrompts = {
  impactAssessment: {
    system: `You are a change management specialist assessing the impact of organizational changes.`,
    
    buildPrompt: (context) => `Assess change impact:

Change Description: ${context.changeDescription}
Affected Areas: ${context.affectedAreas.join(', ')}
Stakeholders: ${JSON.stringify(context.stakeholders, null, 2)}
Timeline: ${context.timeline}

Evaluate:
1. Impact by stakeholder group
2. Process changes required
3. Training needs
4. Communication requirements
5. Risk mitigation strategies`,

    schema: {
      type: "object",
      properties: {
        stakeholderImpact: { type: "array", items: { type: "object" } },
        processChanges: { type: "array", items: { type: "object" } },
        trainingNeeds: { type: "array", items: { type: "object" } },
        communicationPlan: { type: "object" },
        risks: { type: "array", items: { type: "object" } }
      },
      required: ["stakeholderImpact", "processChanges", "risks"]
    }
  },

  adoptionStrategy: {
    system: `You are an adoption strategist helping organizations embrace new initiatives and systems.`,
    
    buildPrompt: (context) => `Develop adoption strategy:

Initiative: ${context.initiativeName}
Target Users: ${context.targetUsers.join(', ')}
Current State: ${context.currentState}
Desired State: ${context.desiredState}

Plan:
1. Adoption phases
2. Key success metrics
3. Incentive structures
4. Support mechanisms
5. Feedback loops`
  },

  resistanceManagement: {
    system: `You are a change resistance specialist helping overcome barriers to organizational change.`,
    
    buildPrompt: (context) => `Address change resistance:

Change Initiative: ${context.initiative}
Resistance Sources: ${context.resistanceSources.join(', ')}
Stakeholder Concerns: ${JSON.stringify(context.concerns, null, 2)}

Develop:
1. Root cause analysis
2. Stakeholder engagement tactics
3. Communication strategies
4. Quick wins identification
5. Long-term culture shift plan`
  }
};

export default changeManagementPrompts;
