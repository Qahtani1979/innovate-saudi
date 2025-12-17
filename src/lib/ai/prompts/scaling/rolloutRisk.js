/**
 * Rollout Risk Predictor Prompts
 * For predicting risks in scaling rollout
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ROLLOUT_RISK_PROMPTS = {
  systemPrompt: getSystemPrompt('scaling_rollout_risk'),
  
  buildPrompt: (pilot, targetMunicipalities) => `Predict scaling rollout risks:

SOURCE PILOT: ${pilot.title_en}
- Original municipality: ${pilot.municipality_id}
- Success metrics: ${pilot.kpis?.map(k => `${k.name}: ${k.current}/${k.target}`).join(', ') || 'Not specified'}
- Duration: ${pilot.duration_weeks || 'Unknown'} weeks
- Sector: ${pilot.sector || 'General'}
- Budget: ${pilot.budget || 'Unknown'} SAR

TARGET MUNICIPALITIES (${targetMunicipalities.length}):
${targetMunicipalities.slice(0, 10).map(m => `- ${m.name_en} (Population: ${m.population}, MII: ${m.mii_score})`).join('\n')}

RISK DIMENSIONS TO ANALYZE (Score 0-100, higher = more risk):

1. TECHNICAL COMPLEXITY
   - Integration challenges
   - System compatibility
   - Infrastructure gaps

2. CHANGE MANAGEMENT
   - Organizational resistance
   - Process adaptation
   - Staff buy-in

3. RESOURCE AVAILABILITY
   - Skilled personnel
   - Equipment/materials
   - Support capacity

4. POLITICAL/STAKEHOLDER
   - Leadership support
   - Inter-agency coordination
   - Public acceptance

5. BUDGET OVERRUNS
   - Cost estimation accuracy
   - Funding sustainability
   - Contingency needs

Provide overall risk score, risk level, dimension scores, top specific risks with probability/impact, and mitigation strategies.`,

  schema: {
    type: "object",
    properties: {
      overall_risk_score: { 
        type: "number",
        description: "Overall risk score 0-100"
      },
      risk_level: { 
        type: "string",
        description: "low / medium / high / critical"
      },
      dimension_scores: {
        type: "object",
        properties: {
          technical: { type: "number" },
          change_management: { type: "number" },
          resources: { type: "number" },
          political: { type: "number" },
          budget: { type: "number" }
        },
        required: ["technical", "change_management", "resources", "political", "budget"]
      },
      top_risks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            risk: { type: "string" },
            probability: { type: "string" },
            impact: { type: "string" }
          },
          required: ["risk", "probability", "impact"]
        }
      },
      mitigation_strategies: { 
        type: "array", 
        items: { type: "string" }
      }
    },
    required: ["overall_risk_score", "risk_level", "dimension_scores", "top_risks", "mitigation_strategies"]
  }
};

export default ROLLOUT_RISK_PROMPTS;
