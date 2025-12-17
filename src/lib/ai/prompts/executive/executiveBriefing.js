/**
 * Executive Briefing Generator Prompt
 * Used by: ExecutiveBriefingGenerator.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildExecutiveBriefingPrompt = (period, ecosystemData) => {
  const {
    totalChallenges = 0,
    activePilots = 0,
    scaledSolutions = 0,
    municipalityCount = 0,
    averageMII = 0
  } = ecosystemData;

  return `${SAUDI_CONTEXT.COMPACT}

You are generating an executive briefing for Saudi municipal innovation leadership.

## BRIEFING PERIOD: ${period.toUpperCase()}

## ECOSYSTEM SNAPSHOT

- **Total Challenges:** ${totalChallenges}
- **Active Pilots:** ${activePilots}
- **Scaled Solutions:** ${scaledSolutions}
- **Municipalities:** ${municipalityCount}
- **Average MII Score:** ${averageMII.toFixed(1)}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## BRIEFING STRUCTURE

Generate:

1. **Executive Summary** (2-3 key highlights, bilingual EN/AR)
2. **Key Metrics & Trends** (5 statistics with context)
3. **Notable Achievements** (3 major wins)
4. **Areas of Concern** (2-3 challenges requiring attention)
5. **Strategic Recommendations** (3 action items)
6. **Outlook** for next period

Align with Vision 2030 objectives and MoMAH strategic priorities.`;
};

export const executiveBriefingSchema = {
  type: 'object',
  required: ['executive_summary_en', 'executive_summary_ar', 'key_metrics', 'achievements', 'concerns', 'recommendations', 'outlook'],
  properties: {
    executive_summary_en: { type: 'string', description: 'Executive summary in English' },
    executive_summary_ar: { type: 'string', description: 'Executive summary in Arabic (الملخص التنفيذي)' },
    key_metrics: { 
      type: 'array', 
      items: { 
        type: 'object',
        required: ['metric', 'value', 'context'],
        properties: {
          metric: { type: 'string' },
          value: { type: 'string' },
          context: { type: 'string' }
        }
      }
    },
    achievements: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    outlook: { type: 'string' }
  }
};

export const EXECUTIVE_BRIEFING_SYSTEM_PROMPT = `You are a strategic communications specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You create concise, impactful executive briefings that inform leadership decision-making.`;
