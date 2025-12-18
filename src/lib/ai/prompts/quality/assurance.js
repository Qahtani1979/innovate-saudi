/**
 * Quality Assurance Prompts
 * @module prompts/quality/assurance
 */

export const qualityAssurancePrompts = {
  dataQuality: {
    system: `You are a data quality analyst ensuring accuracy and completeness of municipal data systems.`,
    
    buildPrompt: (context) => `Assess data quality:

Dataset: ${context.datasetName}
Sample Data: ${JSON.stringify(context.sampleData, null, 2)}
Expected Schema: ${JSON.stringify(context.expectedSchema, null, 2)}
Quality Rules: ${context.qualityRules.join(', ')}

Evaluate:
1. Completeness score
2. Accuracy assessment
3. Consistency check
4. Timeliness analysis
5. Improvement recommendations`,

    schema: {
      type: "object",
      properties: {
        overallScore: { type: "number" },
        completeness: { type: "number" },
        accuracy: { type: "number" },
        consistency: { type: "number" },
        issues: { type: "array", items: { type: "object" } },
        recommendations: { type: "array", items: { type: "string" } }
      },
      required: ["overallScore", "issues", "recommendations"]
    }
  },

  processQuality: {
    system: `You are a process quality expert evaluating operational effectiveness and efficiency.`,
    
    buildPrompt: (context) => `Evaluate process quality:

Process: ${context.processName}
Steps: ${JSON.stringify(context.steps, null, 2)}
Performance Metrics: ${JSON.stringify(context.metrics, null, 2)}
Standards: ${context.standards.join(', ')}

Analyze:
1. Process efficiency
2. Bottleneck identification
3. Error rates and causes
4. Compliance with standards
5. Optimization opportunities`
  },

  deliverableQuality: {
    system: `You are a deliverable quality reviewer ensuring outputs meet requirements and standards.`,
    
    buildPrompt: (context) => `Review deliverable quality:

Deliverable: ${context.deliverableName}
Requirements: ${JSON.stringify(context.requirements, null, 2)}
Actual Output: ${context.actualOutput}
Acceptance Criteria: ${context.acceptanceCriteria.join(', ')}

Assess:
1. Requirements compliance
2. Quality gaps
3. Acceptance status
4. Remediation needs
5. Quality improvement suggestions`
  }
};

export default qualityAssurancePrompts;
