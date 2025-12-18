/**
 * ROI Calculator Prompts
 * @module finance/roiCalculator
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ROI_CALCULATOR_SYSTEM_PROMPT = getSystemPrompt('finance_roi_analysis');

export const buildROICalculatorPrompt = (inputs) => `Calculate expected ROI and impact for this initiative:

Type: ${inputs.type}
Budget: ${inputs.budget} SAR
Sector: ${inputs.sector}
Duration: ${inputs.duration_months} months
Expected Outcome: ${inputs.expected_outcome}

Based on similar initiatives in municipal innovation, provide:
1. Expected ROI (%)
2. Payback period (months)
3. Impact score (0-100)
4. Cost per citizen served (SAR)
5. Benchmark comparison (how does this compare to similar initiatives)
6. Risk factors (3 key risks)

Be realistic and data-driven.`;

export const ROI_CALCULATOR_SCHEMA = {
  type: "object",
  properties: {
    roi_percentage: { type: "number" },
    payback_months: { type: "number" },
    impact_score: { type: "number" },
    cost_per_citizen: { type: "number" },
    benchmark: { type: "string" },
    risks: { type: "array", items: { type: "string" } }
  },
  required: ['roi_percentage', 'payback_months', 'impact_score']
};

export const ROI_CALCULATOR_PROMPTS = {
  systemPrompt: ROI_CALCULATOR_SYSTEM_PROMPT,
  buildPrompt: buildROICalculatorPrompt,
  schema: ROI_CALCULATOR_SCHEMA
};

export default ROI_CALCULATOR_PROMPTS;
