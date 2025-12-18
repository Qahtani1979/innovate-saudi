/**
 * Search and Discovery Prompts
 * @module prompts/search/discovery
 */

export const searchPrompts = {
  semanticSearch: {
    system: `You are a semantic search specialist helping users find relevant information across municipal knowledge bases.`,
    
    buildPrompt: (context) => `Enhance search query:

User Query: ${context.userQuery}
Context: ${context.context}
Available Domains: ${context.domains.join(', ')}

Provide:
1. Query expansion terms
2. Semantic alternatives
3. Related concepts
4. Filter suggestions
5. Result ranking criteria`,

    schema: {
      type: "object",
      properties: {
        expandedTerms: { type: "array", items: { type: "string" } },
        semanticAlternatives: { type: "array", items: { type: "string" } },
        relatedConcepts: { type: "array", items: { type: "string" } },
        suggestedFilters: { type: "object" },
        rankingCriteria: { type: "array", items: { type: "string" } }
      },
      required: ["expandedTerms", "relatedConcepts"]
    }
  },

  contentDiscovery: {
    system: `You are a content discovery specialist helping users explore relevant municipal resources.`,
    
    buildPrompt: (context) => `Discover related content:

Current Content: ${context.currentContent}
User Profile: ${context.userProfile}
Exploration Goals: ${context.goals.join(', ')}

Recommend:
1. Related documents
2. Similar initiatives
3. Expert contacts
4. Learning resources
5. Collaboration opportunities`
  },

  knowledgeGraphing: {
    system: `You are a knowledge graph specialist mapping relationships between municipal entities and concepts.`,
    
    buildPrompt: (context) => `Map knowledge relationships:

Central Entity: ${context.centralEntity}
Entity Type: ${context.entityType}
Known Connections: ${JSON.stringify(context.knownConnections, null, 2)}

Identify:
1. Direct relationships
2. Indirect connections
3. Dependency chains
4. Influence patterns
5. Gap opportunities`
  }
};

export default searchPrompts;
