/**
 * Validation and Verification Prompts
 * @module prompts/validation/checks
 */

export const validationPrompts = {
  dataValidation: {
    system: `You are a data validation specialist ensuring data integrity and accuracy in municipal systems.`,
    
    buildPrompt: (context) => `Validate data:

Data Type: ${context.dataType}
Data Sample: ${JSON.stringify(context.dataSample, null, 2)}
Validation Rules: ${context.rules.join(', ')}
Context: ${context.context}

Check:
1. Format compliance
2. Value range validity
3. Referential integrity
4. Business rule compliance
5. Anomaly detection`,

    schema: {
      type: "object",
      properties: {
        isValid: { type: "boolean" },
        errors: { type: "array", items: { type: "object" } },
        warnings: { type: "array", items: { type: "object" } },
        suggestions: { type: "array", items: { type: "string" } }
      },
      required: ["isValid", "errors"]
    }
  },

  contentVerification: {
    system: `You are a content verification specialist ensuring accuracy and appropriateness of municipal content.`,
    
    buildPrompt: (context) => `Verify content:

Content: ${context.content}
Content Type: ${context.contentType}
Guidelines: ${context.guidelines.join(', ')}
Audience: ${context.audience}

Verify:
1. Factual accuracy
2. Policy alignment
3. Tone appropriateness
4. Accessibility compliance
5. Cultural sensitivity`
  },

  processVerification: {
    system: `You are a process verification expert ensuring workflows follow established procedures.`,
    
    buildPrompt: (context) => `Verify process execution:

Process: ${context.processName}
Steps Executed: ${JSON.stringify(context.stepsExecuted, null, 2)}
Expected Flow: ${context.expectedFlow.join(' -> ')}
Outputs: ${JSON.stringify(context.outputs, null, 2)}

Validate:
1. Step sequence correctness
2. Required approvals obtained
3. Documentation completeness
4. Output quality
5. Compliance status`
  }
};

export default validationPrompts;
