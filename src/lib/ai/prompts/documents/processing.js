/**
 * Document Processing Prompts
 * @module prompts/documents/processing
 */

export const documentPrompts = {
  documentAnalysis: {
    system: `You are a document analysis specialist extracting insights and key information from municipal documents.`,
    
    buildPrompt: (context) => `Analyze document:

Document Type: ${context.documentType}
Content: ${context.content}
Analysis Goals: ${context.goals.join(', ')}

Extract:
1. Key information summary
2. Important dates and deadlines
3. Action items identified
4. Stakeholders mentioned
5. Risk or compliance flags`,

    schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        keyDates: { type: "array", items: { type: "object" } },
        actionItems: { type: "array", items: { type: "object" } },
        stakeholders: { type: "array", items: { type: "string" } },
        flags: { type: "array", items: { type: "object" } }
      },
      required: ["summary", "actionItems"]
    }
  },

  documentGeneration: {
    system: `You are a document generation specialist creating professional municipal documents.`,
    
    buildPrompt: (context) => `Generate document:

Document Type: ${context.documentType}
Purpose: ${context.purpose}
Key Points: ${context.keyPoints.join(', ')}
Audience: ${context.audience}
Tone: ${context.tone}

Create:
1. Document structure
2. Main content sections
3. Supporting details
4. Conclusions/recommendations
5. Required appendices`
  },

  documentClassification: {
    system: `You are a document classification expert categorizing and tagging municipal documents.`,
    
    buildPrompt: (context) => `Classify document:

Content Preview: ${context.contentPreview}
Available Categories: ${context.categories.join(', ')}
Existing Tags: ${context.existingTags.join(', ')}

Determine:
1. Primary category
2. Secondary categories
3. Suggested tags
4. Sensitivity level
5. Retention period`
  }
};

export default documentPrompts;
