/**
 * Document Generation Prompt Module
 * Handles document creation and formatting AI operations
 * @module prompts/documents/generation
 */

export const DOCUMENT_GEN_SYSTEM_PROMPT = `You are an expert in government document creation and formatting.
Your role is to generate professional documents following government standards.

Guidelines:
- Follow official document templates
- Use formal language appropriate for government
- Support bilingual documents (Arabic/English)
- Ensure accessibility compliance`;

export const DOCUMENT_GEN_PROMPTS = {
  generateReport: (data, template) => `Generate a formal report:

Report Type: ${template.type}
Data: ${JSON.stringify(data)}
Format: ${template.format || 'Standard'}
Language: ${template.language || 'English'}

Create:
1. Executive summary
2. Main body sections
3. Data visualizations descriptions
4. Conclusions
5. Recommendations`,

  createProposal: (project, requirements) => `Create project proposal:

Project: ${project.name}
Objectives: ${project.objectives?.join(', ')}
Requirements: ${JSON.stringify(requirements)}

Generate:
1. Project overview
2. Scope and objectives
3. Methodology
4. Timeline and milestones
5. Budget estimate
6. Risk assessment
7. Expected outcomes`,

  draftPolicy: (topic, context) => `Draft policy document:

Topic: ${topic}
Context: ${context}
Scope: ${context.scope || 'National'}

Create:
1. Policy statement
2. Purpose and objectives
3. Scope and applicability
4. Key provisions
5. Implementation guidelines
6. Monitoring and evaluation`
};

export const buildDocumentGenPrompt = (type, params) => {
  const promptFn = DOCUMENT_GEN_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown document generation prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: DOCUMENT_GEN_SYSTEM_PROMPT,
  prompts: DOCUMENT_GEN_PROMPTS,
  build: buildDocumentGenPrompt
};
