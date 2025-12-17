/**
 * What-If Simulator Prompt
 * Used by: WhatIfSimulator.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildWhatIfSimulatorPrompt = (sectorNames, allocationText) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are simulating budget reallocation impacts for Saudi Arabia's municipal innovation ecosystem.

## SIMULATION PARAMETERS

### Sectors Included
${sectorNames.join(', ')}

### Proposed Budget Allocation
${allocationText}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## PREDICTION REQUIREMENTS
Predict the impact on these key performance indicators:
1. Pilot Success Rate (current baseline: 65%)
2. Solutions Deployed (current baseline: 45)
3. Average MII Score (current baseline: 72)
4. R&D to Pilot Conversion Rate (current baseline: 28%)

For each KPI provide:
- KPI name (bilingual)
- Current value
- Predicted value after reallocation
- Percentage change

Base predictions on:
- Sector priorities in Vision 2030
- Historical performance patterns
- Resource optimization principles`;
};

export const whatIfSimulatorSchema = {
  type: 'object',
  required: ['kpi_changes'],
  properties: {
    kpi_changes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['kpi_en', 'kpi_ar', 'current', 'predicted', 'change_percent'],
        properties: {
          kpi_en: { type: 'string' },
          kpi_ar: { type: 'string' },
          current: { type: 'number' },
          predicted: { type: 'number' },
          change_percent: { type: 'number' }
        }
      }
    }
  }
};

export const WHAT_IF_SIMULATOR_SYSTEM_PROMPT = `You are a strategic planning analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You simulate the impact of budget reallocations across sectors to help decision-makers optimize resource allocation for maximum innovation outcomes.`;
