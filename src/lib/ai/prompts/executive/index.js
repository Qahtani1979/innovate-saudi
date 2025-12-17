/**
 * Executive Module AI Prompts Index
 * @version 1.0.0
 */

export { 
  buildRiskForecastPrompt, 
  riskForecastSchema, 
  RISK_FORECAST_SYSTEM_PROMPT 
} from './riskForecast';

export { 
  buildExecutiveBriefingPrompt, 
  executiveBriefingSchema, 
  EXECUTIVE_BRIEFING_SYSTEM_PROMPT 
} from './executiveBriefing';

export { 
  buildPriorityRecommendationsPrompt, 
  priorityRecommendationsSchema, 
  PRIORITY_RECOMMENDATIONS_SYSTEM_PROMPT 
} from './priorityRecommendations';

export const EXECUTIVE_PROMPTS = {
  riskForecast: {
    promptFn: 'buildRiskForecastPrompt',
    schema: 'riskForecastSchema',
    description: 'Forecasts strategic risks in innovation ecosystem'
  },
  executiveBriefing: {
    promptFn: 'buildExecutiveBriefingPrompt',
    schema: 'executiveBriefingSchema',
    description: 'Generates executive briefings'
  },
  priorityRecommendations: {
    promptFn: 'buildPriorityRecommendationsPrompt',
    schema: 'priorityRecommendationsSchema',
    description: 'Recommends strategic priorities'
  }
};

export default EXECUTIVE_PROMPTS;
