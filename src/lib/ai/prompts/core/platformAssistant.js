/**
 * Platform AI Assistant Prompts
 * General-purpose platform assistant with strategic awareness
 * @module core/platformAssistant
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for platform assistant
 */
export const PLATFORM_ASSISTANT_SYSTEM_PROMPT = getSystemPrompt('platform_assistant', `
You are the Saudi Innovates Platform AI Assistant with semantic search AND STRATEGIC AWARENESS.
You help users navigate the platform, understand their data, and make strategic decisions.

Core capabilities:
- Semantic search across all platform entities
- Strategic alignment recommendations
- Entity linking suggestions
- Bilingual support (Arabic/English)

Response guidelines:
- Be concise and actionable
- Reference specific entities and pages when relevant
- Consider strategic alignment in all recommendations
- Use bilingual responses when helpful
`);

/**
 * Build platform assistant prompt with context
 * @param {Object} context - Current context
 * @param {string} context.page - Current page name
 * @param {Object} context.platformData - Platform data summary
 * @param {Object} context.strategicContext - Strategic context
 * @param {string} userQuestion - User's question
 * @returns {string} Complete prompt
 */
export function buildPlatformAssistantPrompt(context, userQuestion) {
  const { page, platformData, strategicContext } = context;
  
  return `Context: User is on page "${page}".

STRATEGIC CONTEXT (IMPORTANT - Use this to guide recommendations):
- Active Strategic Plans: ${strategicContext?.active_plan_names?.join(', ') || 'None'}
- Strategy Alignment: ${strategicContext?.strategy_alignment_percentage || 0}% of challenges are strategy-derived
- Strategy-derived entities: ${strategicContext?.strategy_derived_challenges || 0} challenges, ${strategicContext?.strategy_derived_pilots || 0} pilots, ${strategicContext?.strategy_derived_programs || 0} programs

Platform Data: ${JSON.stringify(platformData)}

User question: ${userQuestion}

Provide:
- Context-aware, actionable guidance with STRATEGIC ALIGNMENT recommendations
- When relevant, suggest linking entities to strategic plans
- Recommend strategic objectives that align with user's query
- Search platform data when relevant
- Suggest specific pages or entities
- Be concise and bilingual when helpful (AR/EN)
- If user asks about strategy, reference the active plans and alignment metrics`;
}

/**
 * Quick action prompts for the assistant
 */
export const QUICK_ACTIONS = {
  summarize: {
    en: 'Summarize this page',
    ar: 'لخص هذه الصفحة',
    prompt: 'Summarize the current page content'
  },
  improve: {
    en: 'Suggest improvements',
    ar: 'اقترح تحسينات',
    prompt: 'Suggest improvements for this item'
  },
  findSimilar: {
    en: 'Find similar items',
    ar: 'ابحث عن مشابهات',
    prompt: 'Find similar challenges or solutions'
  },
  generateReport: {
    en: 'Generate report',
    ar: 'أنشئ تقرير',
    prompt: 'Generate a summary report'
  },
  strategicAlignment: {
    en: 'Strategic alignment',
    ar: 'التوافق الاستراتيجي',
    prompt: 'How does this align with our strategic plans? What objectives should this be linked to?'
  },
  strategyGaps: {
    en: 'Strategy gaps',
    ar: 'فجوات الاستراتيجية',
    prompt: 'What are the current gaps in strategic alignment across our challenges and pilots?'
  }
};

export default {
  PLATFORM_ASSISTANT_SYSTEM_PROMPT,
  buildPlatformAssistantPrompt,
  QUICK_ACTIONS
};
