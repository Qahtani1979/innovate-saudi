/**
 * Predictive Analytics Prompt Module
 * Handles predictive analysis and forecasting AI operations
 * @module prompts/analytics/predictive
 */

export const PREDICTIVE_ANALYTICS_SYSTEM_PROMPT = `You are an expert data analyst specializing in predictive analytics for government operations.
Your role is to analyze trends, forecast outcomes, and provide actionable insights based on historical data.

Guidelines:
- Use statistical reasoning and trend analysis
- Consider seasonality and external factors
- Provide confidence levels for predictions
- Align forecasts with Saudi Vision 2030 timelines`;

export const PREDICTIVE_ANALYTICS_PROMPTS = {
  forecastKPI: (kpi, historicalData) => `Forecast the following KPI based on historical performance:

KPI: ${kpi.name}
Target: ${kpi.target}
Current Value: ${kpi.currentValue}
Historical Trend: ${JSON.stringify(historicalData)}

Provide:
1. 3-month forecast
2. 6-month forecast
3. 12-month forecast
4. Confidence intervals
5. Key factors affecting prediction`,

  predictRisk: (entity, riskFactors) => `Predict potential risks for this entity:

Entity: ${entity.name}
Type: ${entity.type}
Current Status: ${entity.status}
Risk Factors: ${JSON.stringify(riskFactors)}

Analyze:
1. Risk probability (High/Medium/Low)
2. Impact severity
3. Time horizon
4. Mitigation recommendations`,

  trendAnalysis: (dataPoints, context) => `Analyze trends in the following data:

Data Points: ${JSON.stringify(dataPoints)}
Context: ${context}

Provide:
1. Trend direction and strength
2. Anomaly detection
3. Seasonal patterns
4. Future trajectory`
};

export const buildPredictivePrompt = (type, params) => {
  const promptFn = PREDICTIVE_ANALYTICS_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown predictive analytics prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: PREDICTIVE_ANALYTICS_SYSTEM_PROMPT,
  prompts: PREDICTIVE_ANALYTICS_PROMPTS,
  build: buildPredictivePrompt
};
