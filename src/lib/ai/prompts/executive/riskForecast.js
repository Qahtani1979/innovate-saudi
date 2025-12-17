/**
 * AI Risk Forecasting Prompt
 * Used by: AIRiskForecasting.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildRiskForecastPrompt = (activePilots, criticalChallenges, highBudgetPilots) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing the Saudi municipal innovation ecosystem to forecast strategic risks.

## CURRENT STATE

**Active Pilots:** ${activePilots}
**Critical Challenges:** ${criticalChallenges}
**High-Budget Pilots (>5M SAR):** ${highBudgetPilots}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## RISK ANALYSIS REQUIREMENTS

Identify **5 strategic risks** with:

1. **Risk Title:** Clear, actionable description
2. **Severity:** critical / high / medium
3. **Probability:** Percentage likelihood (0-100%)
4. **Early Warning Indicators:** 2-3 observable signals
5. **Recommended Mitigation Actions:** 2-3 specific steps
6. **Timeline:** When risk might materialize (weeks/months)
7. **Affected Areas:** Sectors, municipalities, or programs impacted

Consider:
- Budget overruns and resource constraints
- Implementation delays and technical challenges
- Stakeholder alignment and political factors
- Market and vendor dependencies
- Regulatory and compliance issues`;
};

export const riskForecastSchema = {
  type: 'object',
  required: ['risks'],
  properties: {
    risks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'severity', 'probability', 'early_indicators', 'mitigation', 'timeline', 'affected_areas'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium'] },
          probability: { type: 'string' },
          early_indicators: { type: 'array', items: { type: 'string' } },
          mitigation: { type: 'array', items: { type: 'string' } },
          timeline: { type: 'string' },
          affected_areas: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};

export const RISK_FORECAST_SYSTEM_PROMPT = `You are a strategic risk analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You identify and forecast risks in the municipal innovation ecosystem to enable proactive mitigation.`;
