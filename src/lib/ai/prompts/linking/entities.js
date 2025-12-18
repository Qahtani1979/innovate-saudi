/**
 * Entity Linking Prompts
 * @module prompts/linking/entities
 */

export const linkingPrompts = {
  entityRelationship: {
    system: `You are an entity relationship specialist identifying connections between municipal entities.`,
    
    buildPrompt: (context) => `Analyze entity relationships:

Primary Entity: ${JSON.stringify(context.primaryEntity, null, 2)}
Related Entities: ${JSON.stringify(context.relatedEntities, null, 2)}
Relationship Types: ${context.relationshipTypes.join(', ')}

Identify:
1. Direct relationships
2. Indirect connections
3. Strength of relationships
4. Dependency mapping
5. Impact analysis`,

    schema: {
      type: "object",
      properties: {
        relationships: { type: "array", items: { type: "object" } },
        dependencies: { type: "array", items: { type: "object" } },
        impactScore: { type: "number" },
        recommendations: { type: "array", items: { type: "string" } }
      },
      required: ["relationships", "dependencies"]
    }
  },

  crossReferencing: {
    system: `You are a cross-referencing specialist linking related information across systems.`,
    
    buildPrompt: (context) => `Cross-reference entities:

Source: ${context.source}
Target Systems: ${context.targetSystems.join(', ')}
Match Criteria: ${context.matchCriteria.join(', ')}

Find:
1. Matching entities
2. Confidence scores
3. Data discrepancies
4. Merge recommendations
5. Update priorities`
  },

  duplicationDetection: {
    system: `You are a duplication detection specialist identifying redundant entries in municipal data.`,
    
    buildPrompt: (context) => `Detect duplicates:

Dataset: ${context.datasetName}
Sample Records: ${JSON.stringify(context.sampleRecords, null, 2)}
Matching Fields: ${context.matchingFields.join(', ')}

Identify:
1. Potential duplicates
2. Similarity scores
3. Master record recommendation
4. Merge strategy
5. Data quality issues`
  }
};

export default linkingPrompts;
