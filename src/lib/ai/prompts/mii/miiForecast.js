/**
 * MII Forecasting Engine Prompt
 * Used by: MIIForecastingEngine.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildMIIForecastPrompt = (municipalityData) => {
  const {
    currentScore = 68,
    activePilots = 5,
    plannedInvestments = 'Infrastructure upgrade, 2 new programs',
    historicalTrend = '+3 points/year'
  } = municipalityData || {};

  return `${SAUDI_CONTEXT.COMPACT}

You are forecasting Municipal Innovation Index (MII) scores for a Saudi municipality.

## CURRENT SITUATION

**Current MII Score:** ${currentScore}
**Active Pilots:** ${activePilots}
**Planned Investments:** ${plannedInvestments}
**Historical Trend:** ${historicalTrend}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## FORECASTING REQUIREMENTS

Provide:
1. **Monthly forecast** for the next 12 months
2. **Key drivers** affecting the score trajectory
3. Consider seasonal factors, pilot completion timelines, and investment impacts

Base predictions on:
- Vision 2030 municipal development targets
- Typical pilot success rates (65%)
- Investment ROI timelines
- Regional innovation benchmarks`;
};

export const miiForecastSchema = {
  type: 'object',
  required: ['forecasts', 'drivers'],
  properties: {
    forecasts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['month', 'score'],
        properties: {
          month: { type: 'string', description: 'Month name (e.g., Jan 2025)' },
          score: { type: 'number', description: 'Predicted MII score' }
        }
      }
    },
    drivers: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Key factors driving the forecast'
    }
  }
};

export const MII_FORECAST_SYSTEM_PROMPT = `You are an innovation metrics analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You forecast Municipal Innovation Index (MII) scores based on current initiatives and historical trends.`;
