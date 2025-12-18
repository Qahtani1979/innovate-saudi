/**
 * Collaboration Facilitation Prompts
 * @module prompts/collaboration/facilitator
 */

export const collaborationPrompts = {
  partnershipAnalysis: {
    system: `You are a partnership analysis expert identifying synergies and collaboration opportunities between organizations.`,
    
    buildPrompt: (context) => `Analyze partnership potential:

Organization A: ${JSON.stringify(context.organizationA, null, 2)}
Organization B: ${JSON.stringify(context.organizationB, null, 2)}
Collaboration Context: ${context.context}

Evaluate:
1. Synergy areas
2. Complementary capabilities
3. Potential challenges
4. Collaboration models
5. Success factors`,

    schema: {
      type: "object",
      properties: {
        synergyScore: { type: "number" },
        synergyAreas: { type: "array", items: { type: "object" } },
        challenges: { type: "array", items: { type: "object" } },
        recommendedModel: { type: "string" },
        successFactors: { type: "array", items: { type: "string" } }
      },
      required: ["synergyScore", "synergyAreas", "recommendedModel"]
    }
  },

  stakeholderMapping: {
    system: `You are a stakeholder mapping specialist helping identify and engage key partners effectively.`,
    
    buildPrompt: (context) => `Map stakeholders for initiative:

Initiative: ${context.initiativeName}
Objectives: ${context.objectives.join(', ')}
Known Stakeholders: ${JSON.stringify(context.knownStakeholders, null, 2)}

Identify:
1. Key stakeholder categories
2. Influence/interest matrix
3. Engagement strategies
4. Communication priorities
5. Relationship building actions`
  },

  conflictResolution: {
    system: `You are a conflict resolution expert helping navigate disagreements in collaborative initiatives.`,
    
    buildPrompt: (context) => `Analyze and resolve conflict:

Parties Involved: ${context.parties.join(', ')}
Conflict Description: ${context.conflictDescription}
History: ${context.history}
Stakes: ${context.stakes}

Provide:
1. Root cause analysis
2. Common ground identification
3. Resolution options
4. Recommended approach
5. Prevention strategies`
  }
};

export default collaborationPrompts;
