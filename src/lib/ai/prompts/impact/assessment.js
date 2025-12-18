/**
 * Impact Assessment Prompts
 * @module prompts/impact/assessment
 */

export const impactAssessmentPrompts = {
  socialImpact: {
    system: `You are a social impact analyst specializing in evaluating the societal effects of municipal initiatives in Saudi Arabia.`,
    
    buildPrompt: (context) => `Assess social impact:

Initiative: ${context.initiativeName}
Description: ${context.description}
Target Population: ${JSON.stringify(context.targetPopulation, null, 2)}
Implementation Data: ${JSON.stringify(context.implementationData, null, 2)}

Evaluate:
1. Direct beneficiary impact
2. Community-wide effects
3. Quality of life improvements
4. Social equity considerations
5. Long-term societal benefits`,

    schema: {
      type: "object",
      properties: {
        overallScore: { type: "number" },
        beneficiaryImpact: { type: "object" },
        communityEffects: { type: "array", items: { type: "object" } },
        equityAnalysis: { type: "object" },
        recommendations: { type: "array", items: { type: "string" } }
      },
      required: ["overallScore", "beneficiaryImpact", "recommendations"]
    }
  },

  economicImpact: {
    system: `You are an economic impact analyst evaluating the financial and economic effects of municipal projects.`,
    
    buildPrompt: (context) => `Analyze economic impact:

Project: ${context.projectName}
Investment: ${context.investment}
Timeline: ${context.timeline}
Economic Data: ${JSON.stringify(context.economicData, null, 2)}

Calculate:
1. Return on investment
2. Job creation potential
3. Local economic multiplier
4. Cost-benefit analysis
5. Long-term economic sustainability`
  },

  environmentalImpact: {
    system: `You are an environmental impact specialist assessing ecological effects of development initiatives.`,
    
    buildPrompt: (context) => `Evaluate environmental impact:

Initiative: ${context.initiativeName}
Location: ${context.location}
Scope: ${context.scope}
Environmental Data: ${JSON.stringify(context.environmentalData, null, 2)}

Assess:
1. Carbon footprint
2. Resource consumption
3. Ecosystem effects
4. Sustainability alignment
5. Mitigation recommendations`
  }
};

export default impactAssessmentPrompts;
