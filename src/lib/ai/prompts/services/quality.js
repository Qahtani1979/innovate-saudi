/**
 * Service Quality Prompt Module
 * Handles service quality assessment and improvement AI operations
 * @module prompts/services/quality
 */

export const SERVICE_QUALITY_SYSTEM_PROMPT = `You are an expert in government service quality management.
Your role is to assess service delivery quality and recommend improvements.

Guidelines:
- Focus on citizen satisfaction
- Apply service quality frameworks
- Align with Saudi government service standards
- Consider accessibility requirements
- Promote continuous improvement`;

export const SERVICE_QUALITY_PROMPTS = {
  assessService: (service) => `Assess the quality of this government service:

Service: ${service.name}
Type: ${service.type}
Channel: ${service.channel || 'Multi-channel'}
Current Metrics: ${JSON.stringify(service.metrics || {})}

Evaluate:
1. Service quality score
2. Citizen satisfaction assessment
3. Efficiency metrics
4. Accessibility rating
5. Improvement priorities`,

  analyzeFeedback: (feedback) => `Analyze citizen feedback for service improvement:

Feedback Volume: ${feedback.count} responses
Positive Rate: ${feedback.positiveRate}%
Common Themes: ${feedback.themes?.join(', ')}
Sample Comments: ${feedback.samples?.join('; ')}

Provide:
1. Sentiment analysis
2. Key issues identified
3. Praise areas
4. Priority actions
5. Response recommendations`,

  designImprovement: (service, issues) => `Design service improvement plan:

Service: ${service.name}
Identified Issues: ${issues.join(', ')}
Budget Available: ${service.improvementBudget || 'Limited'}

Provide:
1. Improvement initiatives
2. Quick wins
3. Long-term enhancements
4. Resource requirements
5. Expected impact
6. Implementation timeline`
};

export const buildServiceQualityPrompt = (type, params) => {
  const promptFn = SERVICE_QUALITY_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown service quality prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: SERVICE_QUALITY_SYSTEM_PROMPT,
  prompts: SERVICE_QUALITY_PROMPTS,
  build: buildServiceQualityPrompt
};
