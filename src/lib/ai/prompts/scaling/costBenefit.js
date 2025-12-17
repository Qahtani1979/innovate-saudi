/**
 * Cost-Benefit Analyzer Prompts
 * For analyzing cost-benefit of scaling solutions
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const COST_BENEFIT_PROMPTS = {
  systemPrompt: getSystemPrompt('scaling_cost_benefit'),
  
  buildPrompt: (pilot, targetMunicipalities) => `Calculate cost-benefit analysis for scaling pilot:

SOURCE PILOT: ${pilot.title_en}
- Current budget: ${pilot.budget || 0} SAR
- Duration: ${pilot.duration_weeks || 'Unknown'} weeks
- Sector: ${pilot.sector || 'General'}
- Current results: ${pilot.kpis?.map(k => `${k.name}: ${k.current}/${k.target}`).join(', ') || 'Not specified'}

TARGET SCALE: ${targetMunicipalities.length} municipalities
${targetMunicipalities.slice(0, 5).map(m => `- ${m.name_en} (Pop: ${m.population})`).join('\n')}

ESTIMATE THE FOLLOWING:

1. TOTAL DEPLOYMENT COST
   - Initial setup per municipality
   - Training and change management
   - Infrastructure upgrades
   - Ongoing operations (annual)

2. EXPECTED ANNUAL BENEFITS
   - Cost savings
   - Efficiency gains
   - Service quality improvements
   - Citizen satisfaction impact

3. FINANCIAL METRICS
   - Break-even point (months)
   - 3-year ROI percentage
   - Cost per municipality
   - Cost per citizen served

4. VARIANCE ANALYSIS
   - Best case scenario
   - Worst case scenario

5. CASHFLOW PROJECTION
   - Monthly costs and benefits for 36 months

Consider Saudi municipal context, Vision 2030 priorities, and typical government scaling patterns.`,

  schema: {
    type: "object",
    properties: {
      total_cost: { 
        type: "number",
        description: "Total deployment cost in SAR"
      },
      annual_benefit: { 
        type: "number",
        description: "Expected annual benefit in SAR"
      },
      break_even_months: { 
        type: "number",
        description: "Months to break even"
      },
      three_year_roi: { 
        type: "number",
        description: "ROI percentage over 3 years"
      },
      cost_per_municipality: { 
        type: "number",
        description: "Average cost per municipality in SAR"
      },
      benefit_variance: {
        type: "object",
        properties: {
          best_case: { type: "number" },
          worst_case: { type: "number" }
        },
        required: ["best_case", "worst_case"]
      },
      cashflow_projection: {
        type: "array",
        items: {
          type: "object",
          properties: {
            month: { type: "number" },
            cost: { type: "number" },
            benefit: { type: "number" }
          },
          required: ["month", "cost", "benefit"]
        }
      }
    },
    required: ["total_cost", "annual_benefit", "break_even_months", "three_year_roi", "cost_per_municipality", "benefit_variance", "cashflow_projection"]
  }
};

export default COST_BENEFIT_PROMPTS;
