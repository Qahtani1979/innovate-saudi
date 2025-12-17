/**
 * Competitive Analysis Widget Prompt
 * Used by: CompetitiveAnalysisWidget.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildCompetitiveAnalysisWidgetPrompt = (solution, competitors) => {
  const competitorList = (competitors || []).map((c, i) => 
    `${i+1}. ${c.name_en} (${c.provider_name}) - ${c.maturity_level}, TRL ${c.trl}`
  ).join('\n') || 'No direct competitors identified';

  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing the competitive landscape for a solution in Saudi Arabia's municipal innovation market.

## SOLUTION DETAILS
- Name: ${solution?.name_en}
- Provider: ${solution?.provider_name}
- TRL: ${solution?.trl}
- Maturity: ${solution?.maturity_level}
- Sectors: ${solution?.sectors?.join(', ')}

## COMPETITORS IDENTIFIED
${competitorList}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS

1. **Key Differentiators** (3-5 unique advantages)
   - What makes this solution stand out?

2. **Competitive Positioning Strategy**
   - How should this solution position itself?

3. **Market Gaps**
   - What opportunities does this solution fill?

4. **Pricing Strategy Recommendations**
   - Competitive pricing approach

5. **Target Municipality Recommendations**
   - Which municipalities are best fit?`;
};

export const competitiveAnalysisWidgetSchema = {
  type: 'object',
  required: ['differentiators', 'positioning'],
  properties: {
    differentiators: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    positioning: { 
      type: 'object', 
      properties: { 
        en: { type: 'string' }, 
        ar: { type: 'string' } 
      } 
    },
    market_gaps: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    pricing_strategy: { 
      type: 'object', 
      properties: { 
        en: { type: 'string' }, 
        ar: { type: 'string' } 
      } 
    },
    target_municipalities: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    }
  }
};

export const COMPETITIVE_ANALYSIS_WIDGET_SYSTEM_PROMPT = `You are a market intelligence analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. You analyze competitive landscapes and provide strategic positioning advice for municipal technology solutions.`;
