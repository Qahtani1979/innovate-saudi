/**
 * Workflow Automation Prompt Module
 * Handles workflow automation and process optimization AI operations
 * @module prompts/workflow/automation
 */

export const WORKFLOW_AUTOMATION_SYSTEM_PROMPT = `You are an expert in workflow automation and process optimization for government operations.
Your role is to analyze workflows, identify automation opportunities, and design efficient processes.

Guidelines:
- Focus on efficiency and error reduction
- Consider integration requirements
- Ensure compliance with regulations
- Minimize manual intervention
- Maintain audit trails`;

export const WORKFLOW_AUTOMATION_PROMPTS = {
  analyzeProcess: (process) => `Analyze this workflow process for automation opportunities:

Process: ${process.name}
Steps: ${process.steps?.join(' → ') || 'Not defined'}
Current Duration: ${process.duration || 'Unknown'}
Pain Points: ${process.painPoints?.join(', ') || 'Not specified'}

Provide:
1. Automation potential (High/Medium/Low)
2. Specific automation opportunities
3. Expected time savings
4. Implementation complexity
5. Prerequisites`,

  designAutomation: (workflow, constraints) => `Design an automated workflow:

Workflow: ${workflow.name}
Current Process: ${workflow.currentProcess}
Constraints: ${JSON.stringify(constraints)}

Provide:
1. Automated workflow diagram
2. Trigger conditions
3. Decision points
4. Exception handling
5. Integration requirements
6. Monitoring approach`,

  optimizeExisting: (workflow, metrics) => `Optimize this existing automated workflow:

Workflow: ${workflow.name}
Current Performance: ${JSON.stringify(metrics)}
Issues: ${workflow.issues?.join(', ') || 'None reported'}

Recommend:
1. Performance improvements
2. Bottleneck resolutions
3. Error handling enhancements
4. Scalability improvements`
};

export const buildWorkflowPrompt = (type, params) => {
  const promptFn = WORKFLOW_AUTOMATION_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown workflow automation prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: WORKFLOW_AUTOMATION_SYSTEM_PROMPT,
  prompts: WORKFLOW_AUTOMATION_PROMPTS,
  build: buildWorkflowPrompt
};
