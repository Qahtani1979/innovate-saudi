/**
 * AI Capacity Predictor Prompt
 * Used by: AICapacityPredictor.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildCapacityPredictorPrompt = (sandbox, historicalData) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing sandbox capacity for Saudi Arabia's Ministry of Municipalities and Housing innovation ecosystem.

## SANDBOX DETAILS
- Name: ${sandbox.name_en}
- Domain: ${sandbox.domain}
- Current Capacity: ${sandbox.capacity}
- Current Usage: ${sandbox.current_pilots}

## HISTORICAL DATA
- Total Applications: ${historicalData.length}
- Active Projects: ${historicalData.filter(a => a.status === 'active').length}
- Completed Projects: ${historicalData.filter(a => a.status === 'completed').length}

## RECENT APPLICATIONS
${JSON.stringify(historicalData.slice(-10).map(a => ({
  title: a.project_title,
  duration_months: a.duration_months,
  start_date: a.start_date,
  status: a.status
})), null, 2)}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Provide a comprehensive 6-month capacity forecast including:
1. Monthly demand predictions with confidence levels
2. Peak demand periods identification
3. Capacity utilization forecast percentage
4. Capacity adjustment recommendations
5. Resource allocation suggestions
6. Potential bottleneck predictions
7. Key insights for planning`;
};

export const capacityPredictorSchema = {
  type: "object",
  required: ["forecast_6_months", "capacity_recommendation", "insights_en", "insights_ar"],
  properties: {
    forecast_6_months: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "string" },
          predicted_demand: { type: "number" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          capacity_available: { type: "number" }
        }
      }
    },
    peak_periods_en: { type: "array", items: { type: "string" } },
    peak_periods_ar: { type: "array", items: { type: "string" } },
    utilization_forecast: { type: "number", minimum: 0, maximum: 100 },
    capacity_recommendation: { type: "string", enum: ["increase", "maintain", "optimize"] },
    recommended_capacity: { type: "number" },
    resource_allocation_en: { type: "array", items: { type: "string" } },
    resource_allocation_ar: { type: "array", items: { type: "string" } },
    potential_bottlenecks_en: { type: "array", items: { type: "string" } },
    potential_bottlenecks_ar: { type: "array", items: { type: "string" } },
    insights_en: { type: "array", items: { type: "string" } },
    insights_ar: { type: "array", items: { type: "string" } }
  }
};

export const CAPACITY_PREDICTOR_SYSTEM_PROMPT = `You are an AI capacity planning specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. You analyze sandbox utilization patterns and predict future demand to optimize resource allocation across the Kingdom's 13 regions and 300+ municipalities.`;
