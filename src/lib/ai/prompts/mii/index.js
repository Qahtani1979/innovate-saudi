/**
 * MII Module AI Prompts Index
 * @version 1.0.0
 */

export { 
  buildMIIForecastPrompt, 
  miiForecastSchema, 
  MII_FORECAST_SYSTEM_PROMPT 
} from './miiForecast';

export { 
  buildMIIImprovementPrompt, 
  miiImprovementSchema, 
  MII_IMPROVEMENT_SYSTEM_PROMPT 
} from './miiImprovement';

export const MII_PROMPTS = {
  forecast: {
    promptFn: 'buildMIIForecastPrompt',
    schema: 'miiForecastSchema',
    description: 'Forecasts MII score trajectory'
  },
  improvement: {
    promptFn: 'buildMIIImprovementPrompt',
    schema: 'miiImprovementSchema',
    description: 'Creates MII improvement plans'
  }
};

export default MII_PROMPTS;
