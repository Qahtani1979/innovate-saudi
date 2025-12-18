/**
 * Approval Workflow Prompt Module
 * Handles approval process and decision support AI operations
 * @module prompts/workflow/approval
 */

export const APPROVAL_WORKFLOW_SYSTEM_PROMPT = `You are an expert in government approval processes and decision-making workflows.
Your role is to assist in analyzing approval requests and providing decision support.

Guidelines:
- Ensure compliance with approval policies
- Consider all stakeholder perspectives
- Provide balanced recommendations
- Maintain transparency in reasoning
- Support efficient decision-making`;

export const APPROVAL_WORKFLOW_PROMPTS = {
  analyzeRequest: (request) => `Analyze this approval request:

Request Type: ${request.type}
Requester: ${request.requester}
Description: ${request.description}
Amount/Scope: ${request.amount || request.scope || 'Not specified'}

Evaluate:
1. Completeness of request
2. Policy compliance
3. Risk assessment
4. Stakeholder impact
5. Recommendation (Approve/Reject/Request More Info)`,

  routeApproval: (request, approvers) => `Determine the appropriate approval routing:

Request: ${request.title}
Type: ${request.type}
Value: ${request.value || 'N/A'}
Available Approvers: ${approvers.map(a => a.name).join(', ')}

Determine:
1. Required approval level
2. Routing sequence
3. Parallel vs sequential approvals
4. Escalation path
5. Timeline expectations`,

  summarizeForApprover: (request, context) => `Create an approval summary for decision-maker:

Request: ${request.title}
Context: ${context}
History: ${request.history || 'New request'}

Provide:
1. One-paragraph summary
2. Key decision factors
3. Risk considerations
4. Recommendation with confidence level`
};

export const buildApprovalPrompt = (type, params) => {
  const promptFn = APPROVAL_WORKFLOW_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown approval workflow prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: APPROVAL_WORKFLOW_SYSTEM_PROMPT,
  prompts: APPROVAL_WORKFLOW_PROMPTS,
  build: buildApprovalPrompt
};
