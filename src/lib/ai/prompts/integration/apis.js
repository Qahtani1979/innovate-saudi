/**
 * Integration and API Prompts
 * @module prompts/integration/apis
 */

export const integrationPrompts = {
  apiDesign: {
    system: `You are an API design specialist creating well-structured interfaces for municipal systems integration.`,
    
    buildPrompt: (context) => `Design API integration:

System A: ${context.systemA}
System B: ${context.systemB}
Data to Exchange: ${JSON.stringify(context.dataExchange, null, 2)}
Requirements: ${context.requirements.join(', ')}

Define:
1. API endpoints
2. Data mappings
3. Authentication approach
4. Error handling
5. Rate limiting strategy`,

    schema: {
      type: "object",
      properties: {
        endpoints: { type: "array", items: { type: "object" } },
        dataMappings: { type: "object" },
        authApproach: { type: "string" },
        errorHandling: { type: "object" },
        rateLimiting: { type: "object" }
      },
      required: ["endpoints", "dataMappings", "authApproach"]
    }
  },

  dataMapping: {
    system: `You are a data mapping specialist ensuring accurate data transformation between systems.`,
    
    buildPrompt: (context) => `Create data mapping:

Source Schema: ${JSON.stringify(context.sourceSchema, null, 2)}
Target Schema: ${JSON.stringify(context.targetSchema, null, 2)}
Transformation Rules: ${context.rules.join(', ')}

Generate:
1. Field mappings
2. Transformation logic
3. Validation rules
4. Default values
5. Error handling`
  },

  systemConnectivity: {
    system: `You are a system integration architect planning connectivity between municipal systems.`,
    
    buildPrompt: (context) => `Plan system connectivity:

Systems: ${JSON.stringify(context.systems, null, 2)}
Integration Goals: ${context.goals.join(', ')}
Constraints: ${context.constraints.join(', ')}

Architect:
1. Integration topology
2. Data flow patterns
3. Security considerations
4. Failover strategies
5. Monitoring requirements`
  }
};

export default integrationPrompts;
