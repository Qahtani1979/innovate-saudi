/**
 * Document Review Prompt Module
 * Handles document analysis and review AI operations
 * @module prompts/documents/review
 */

export const DOCUMENT_REVIEW_SYSTEM_PROMPT = `You are an expert in document review and quality assurance.
Your role is to analyze documents for completeness, accuracy, and compliance.

Guidelines:
- Check against standards and templates
- Identify gaps and inconsistencies
- Provide constructive feedback
- Ensure regulatory compliance`;

export const DOCUMENT_REVIEW_PROMPTS = {
  reviewDocument: (document, standards) => `Review this document:

Document Type: ${document.type}
Content Summary: ${document.summary}
Standards: ${standards.join(', ')}

Evaluate:
1. Completeness check
2. Accuracy assessment
3. Compliance status
4. Quality score
5. Improvement recommendations`,

  checkCompliance: (document, regulations) => `Check document compliance:

Document: ${document.name}
Applicable Regulations: ${regulations.join(', ')}
Submission Context: ${document.context || 'Standard review'}

Verify:
1. Required elements present
2. Format compliance
3. Content requirements
4. Missing items
5. Remediation steps`,

  summarizeDocument: (document, audience) => `Summarize this document for ${audience}:

Document: ${document.name}
Length: ${document.length} pages
Type: ${document.type}

Provide:
1. Key points (5-7 bullets)
2. Main conclusions
3. Action items
4. Critical dates/deadlines
5. Stakeholder implications`
};

export const buildDocumentReviewPrompt = (type, params) => {
  const promptFn = DOCUMENT_REVIEW_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown document review prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: DOCUMENT_REVIEW_SYSTEM_PROMPT,
  prompts: DOCUMENT_REVIEW_PROMPTS,
  build: buildDocumentReviewPrompt
};
