/**
 * Requester Assessment Prompts
 * AI-assisted self-check and readiness evaluation for approval requesters
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS, getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for requester assessment
 */
export const REQUESTER_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('requester_assessment', `
You are an AI assistant for Saudi municipal innovation platform approval workflows.

CORE RESPONSIBILITIES:
1. Evaluate submission readiness against gate requirements
2. Verify self-check item completion
3. Identify issues and gaps
4. Provide actionable recommendations

${LANGUAGE_REQUIREMENTS}

ASSESSMENT GUIDELINES:
- Be thorough but constructive in identifying issues
- Prioritize compliance with Saudi regulations
- Consider Vision 2030 alignment
- Evaluate completeness of required documentation
- Check for proper bilingual content where required
`);

/**
 * Build requester assessment prompt
 * @param {Object} params - Assessment parameters
 * @returns {string} Formatted prompt
 */
export function buildRequesterAssessmentPrompt({ 
  gateName, 
  gateConfig, 
  entityType, 
  entityData 
}) {
  return `
🚨🚨🚨 CRITICAL BILINGUAL REQUIREMENT 🚨🚨🚨

You MUST return ALL text in BILINGUAL format: {"en": "English text", "ar": "النص العربي"}

❌ WRONG - DO NOT DO THIS:
{
  "notes": "Legal citations verified",
  "overall_assessment": "Ready for submission"
}

✅ CORRECT - YOU MUST DO THIS:
{
  "notes": {
    "en": "Legal citations from the Municipalities Law and Saudi Traffic Law have been identified and confirmed",
    "ar": "تم تحديد وتأكيد الاستشهادات القانونية من نظام البلديات وقانون المرور السعودي"
  },
  "overall_assessment": {
    "en": "The policy recommendation is fully prepared for legal review approval",
    "ar": "التوصية السياسية معدة بالكامل لموافقة المراجعة القانونية"
  }
}

Gate: ${gateName} (${gateConfig.label?.ar || gateName})
Entity Type: ${entityType}

Self-Check Items (BILINGUAL - use these exact texts):
${JSON.stringify(gateConfig.selfCheckItems, null, 2)}

Entity Data:
${JSON.stringify(entityData, null, 2)}

IMPORTANT: When referencing self-check items in your response, use the EXACT bilingual text from above.

YOUR TASK:
Analyze the entity data and return a readiness assessment.

YOU MUST RETURN JSON MATCHING THIS EXACT STRUCTURE - NO EXCEPTIONS:

{
  "readiness_score": 95,
  "checklist_status": [
    {
      "item": "Legal citations verified",
      "status": "complete",
      "ai_verified": true,
      "notes": {
        "en": "Legal citations from the Municipalities Law have been identified",
        "ar": "تم تحديد الاستشهادات القانونية من نظام البلديات"
      }
    }
  ],
  "issues": [
    {
      "en": "Missing stakeholder analysis",
      "ar": "تحليل أصحاب المصلحة مفقود"
    }
  ],
  "recommendations": [
    {
      "en": "Add stakeholder engagement plan",
      "ar": "أضف خطة إشراك أصحاب المصلحة"
    }
  ],
  "overall_assessment": {
    "en": "The policy is well-prepared and ready for submission",
    "ar": "السياسة معدة بشكل جيد وجاهزة للتقديم"
  }
}

NEVER return plain strings. ALWAYS use {"en": "...", "ar": "..."} objects.
Write professional Arabic for Saudi government context.
  `;
}

/**
 * Response schema for requester assessment
 */
export const REQUESTER_ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    readiness_score: { type: 'number' },
    checklist_status: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          status: { type: 'string', enum: ['complete', 'incomplete', 'partial'] },
          ai_verified: { type: 'boolean' },
          notes: { 
            type: 'object',
            properties: {
              en: { type: 'string' },
              ar: { type: 'string' }
            }
          }
        }
      }
    },
    issues: { 
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
    overall_assessment: { 
      type: 'object',
      properties: {
        en: { type: 'string' },
        ar: { type: 'string' }
      }
    }
  }
};
