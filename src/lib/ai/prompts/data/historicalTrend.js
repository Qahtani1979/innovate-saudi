/**
 * Historical Trend Analyzer Prompt
 * Used by: HistoricalTrendAnalyzer.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildHistoricalTrendPrompt = (metric, trends) => {
  const values = trends.slice(0, 10).map(t => t.metric_value).join(', ');
  
  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing historical trends for Saudi municipal innovation metrics.

## TREND DATA

### Metric
${metric}

### Data Points
${trends.length} entries

### Recent Values
${values}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Identify:
1. Overall trend (increasing/decreasing/stable)
2. Rate of change
3. Anomalies or inflection points
4. Forecast for next quarter
5. Recommendations based on trend

Focus on actionable insights for municipal innovation planning.`;
};

export const historicalTrendSchema = {
  type: 'object',
  required: ['trend_direction', 'forecast'],
  properties: {
    trend_direction: { type: 'string' },
    rate_of_change: { type: 'string' },
    anomalies: { type: 'array', items: { type: 'string' } },
    forecast: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'string' } }
  }
};

export const HISTORICAL_TREND_SYSTEM_PROMPT = `You are a data analytics specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You analyze historical trends in innovation metrics to identify patterns, anomalies, and provide forecasts for strategic planning.`;
