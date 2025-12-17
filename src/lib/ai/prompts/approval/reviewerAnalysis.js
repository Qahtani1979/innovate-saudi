/**
 * Reviewer Analysis Prompts
 * AI-assisted review and decision support for approval reviewers
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS, getSystemPrompt } from '@/lib/saudiContext';
import { buildBilingualResponseSchema } from '../../bilingualSchemaBuilder';

/**
 * System prompt for reviewer analysis
 */
export const REVIEWER_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('reviewer_analysis', `
You are an AI assistant for Saudi municipal innovation platform approval reviews.

CORE RESPONSIBILITIES:
1. Conduct risk assessment for submissions
2. Verify regulatory compliance
3. Identify concerns and potential issues
4. Provide decision recommendations with rationale
5. Reference similar cases for context

${LANGUAGE_REQUIREMENTS}

REVIEW GUIDELINES:
- Assess risk objectively with clear scoring
- Verify compliance with Saudi regulations
- Consider Vision 2030 strategic alignment
- Provide balanced, actionable recommendations
- Support decisions with clear rationale
`);

/**
 * Build reviewer analysis prompt
 * @param {Object} params - Analysis parameters
 * @returns {string} Formatted prompt
 */
export function buildReviewerAnalysisPrompt({ 
  gateName, 
  gateConfig, 
  entityType, 
  entityData,
  approvalRequest 
}) {
  return `
🚨🚨🚨 CRITICAL BILINGUAL REQUIREMENT 🚨🚨🚨

You MUST return ALL text fields in BILINGUAL format: {"en": "English", "ar": "العربية"}

❌ WRONG - DO NOT RETURN THIS:
{
  "compliance_details": "The proposal aligns with the Municipalities Law",
  "concerns": ["Initial costs may be high", "Potential pushback from businesses"],
  "decision_rationale": "The benefits outweigh the identified risks"
}

✅ CORRECT - YOU MUST RETURN THIS:
{
  "compliance_details": {
    "en": "The proposal aligns with the Municipalities Law and the Saudi Traffic Law. All regulatory citations have been verified as accurate, and no legal conflicts were detected.",
    "ar": "المقترح يتوافق مع نظام البلديات وقانون المرور السعودي. تم التحقق من دقة جميع الاستشهادات التنظيمية، ولم يتم اكتشاف أي تعارضات قانونية."
  },
  "concerns": [
    {
      "en": "Potential resistance from local businesses affected by sidewalk regulations",
      "ar": "مقاومة محتملة من الشركات المحلية المتأثرة بأنظمة الأرصفة"
    },
    {
      "en": "Implementation and monitoring of compliance might require additional resources",
      "ar": "قد يتطلب التنفيذ ومراقبة الامتثال موارد إضافية"
    }
  ],
  "decision_rationale": {
    "en": "While the policy has significant implications for improving pedestrian safety, potential challenges in stakeholder acceptance and resource allocation necessitate a conditional approval",
    "ar": "على الرغم من أن السياسة لها آثار كبيرة على تحسين سلامة المشاة، فإن التحديات المحتملة في قبول أصحاب المصلحة وتخصيص الموارد تستلزم موافقة مشروطة"
  }
}

Gate: ${gateName} (${gateConfig.label?.ar || gateName})
Gate Type: ${gateConfig.type}
Entity: ${entityType}
Reviewer Role: ${gateConfig.requiredRole}

Reviewer Checklist Items (BILINGUAL - use these exact texts):
${JSON.stringify(gateConfig.reviewerChecklistItems, null, 2)}

Self-Check Items (BILINGUAL - reference these):
${JSON.stringify(gateConfig.selfCheckItems, null, 2)}

Entity Data:
${JSON.stringify(entityData, null, 2)}

Requester Self-Check Data:
${JSON.stringify(approvalRequest?.self_check_data || {}, null, 2)}

IMPORTANT: When referencing checklist items in your response, use the EXACT bilingual format shown above.

YOU MUST RETURN THIS EXACT JSON STRUCTURE:

{
  "risk_score": 30,
  "risk_level": "medium",
  "compliance_check": true,
  "compliance_details": {"en": "...", "ar": "..."},
  "concerns": [
    {"en": "...", "ar": "..."},
    {"en": "...", "ar": "..."}
  ],
  "recommendations": [
    {"en": "...", "ar": "..."},
    {"en": "...", "ar": "..."}
  ],
  "similar_cases": [
    {
      "case": {"en": "...", "ar": "..."},
      "outcome": {"en": "...", "ar": "..."},
      "relevance": {"en": "...", "ar": "..."}
    }
  ],
  "suggested_decision": "approve",
  "decision_rationale": {"en": "...", "ar": "..."},
  "review_summary": {"en": "...", "ar": "..."}
}

NEVER use plain strings. EVERY text field MUST be {"en": "...", "ar": "..."}.
Write professional formal Arabic for Saudi government officials.
  `;
}

/**
 * Response schema for reviewer analysis
 */
export const REVIEWER_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    risk_score: { type: 'number' },
    risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    compliance_check: { type: 'boolean' },
    compliance_details: { 
      type: 'object',
      properties: {
        en: { type: 'string' },
        ar: { type: 'string' }
      }
    },
    concerns: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    },
    recommendations: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    },
    similar_cases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          case: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          },
          outcome: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          },
          relevance: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          }
        }
      }
    },
    suggested_decision: { 
      type: 'string',
      enum: ['approve', 'reject', 'conditional', 'request_info']
    },
    decision_rationale: { 
      type: 'object',
      properties: {
        en: { type: 'string' },
        ar: { type: 'string' }
      }
    },
    review_summary: { 
      type: 'object',
      properties: {
        en: { type: 'string' },
        ar: { type: 'string' }
      }
    }
  }
};
