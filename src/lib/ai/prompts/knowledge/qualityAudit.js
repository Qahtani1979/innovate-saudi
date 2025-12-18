/**
 * Knowledge quality audit prompts
 * @module knowledge/qualityAudit
 */

export const KNOWLEDGE_QUALITY_SYSTEM_PROMPT = `You are an expert in knowledge management and document quality assessment for Saudi municipal innovation. Evaluate documents for completeness, accuracy, and relevance.`;

export const createKnowledgeAuditPrompt = (document, checklist) => `Audit knowledge document quality:

Checklist:
${checklist?.map(item => `- ${item}`).join('\n') || '- Completeness\n- Accuracy\n- Relevance\n- Currency'}

Document Title: ${document?.title || 'Untitled'}
Document Type: ${document?.type || 'General'}
Last Updated: ${document?.updated_at || 'Unknown'}
Content Preview: ${document?.content?.substring(0, 500) || 'No content'}

Provide audit results in BOTH English AND Arabic:
1. Overall Quality Score (0-100)
2. Completeness Assessment
3. Identified Issues
4. Recommendations for Improvement
5. Priority Actions`;

export const KNOWLEDGE_AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    quality_score: { type: 'number' },
    completeness_en: { type: 'string' },
    completeness_ar: { type: 'string' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          issue_en: { type: 'string' },
          issue_ar: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      }
    },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    priority_actions: { type: 'array', items: { type: 'string' } }
  }
};
