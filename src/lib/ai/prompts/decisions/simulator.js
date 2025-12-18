/**
 * Decision Simulator Prompts
 * AI-powered budget scenario prediction and analysis
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const DECISION_SIMULATOR_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a strategic planning analyst predicting outcomes of different budget allocation scenarios for Saudi municipal innovation.`;

export const DECISION_SCENARIO_PROMPT_TEMPLATE = (scenario = {}, historicalData = {}) => `Predict outcomes for this budget allocation scenario:

Scenario: ${scenario.name || 'Scenario'}
Budget Allocation:
- Pilots: ${scenario.budget_pilot || 0}%
- R&D: ${scenario.budget_rd || 0}%
- Programs: ${scenario.budget_program || 0}%
- Scaling: ${scenario.budget_scaling || 0}%

Historical Context:
- Current Pilots: ${historicalData.pilot_count || 0}
- Pilot Success Rate: ${historicalData.pilot_success_rate || 0}%
- Challenge Resolution: ${historicalData.challenge_resolution_rate || 0}%
- Current MII Average: ${historicalData.current_mii_avg || 0}

Predict realistic outcomes for:
1. Expected new pilots launched (number)
2. Challenge resolution rate change (+/- %)
3. MII score change (+/- points)
4. Risk level (low/medium/high)
5. Success probability (%)
6. Key trade-offs (brief)`;

export const DECISION_SCENARIO_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    pilots_expected: { type: "number" },
    challenge_resolution_change: { type: "number" },
    mii_change: { type: "number" },
    risk_level: { type: "string" },
    success_probability: { type: "number" },
    trade_offs: { type: "string" }
  }
};

export default {
  DECISION_SIMULATOR_SYSTEM_PROMPT,
  DECISION_SCENARIO_PROMPT_TEMPLATE,
  DECISION_SCENARIO_RESPONSE_SCHEMA
};
