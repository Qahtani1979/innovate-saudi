/**
 * Auto Risk Router Prompt
 * Assesses if entity requires sandbox testing before deployment
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for risk routing assessment
 * @param {Object} params - Assessment parameters
 * @param {Object} params.entity - Entity to assess
 * @param {string} params.entityType - Type of entity
 * @returns {string} Formatted prompt
 */
export function getAutoRiskRouterPrompt({ entity, entityType }) {
  const typeSpecificInfo = entityType === 'challenge' 
    ? `Severity: ${entity.severity_score || 'N/A'}`
    : entityType === 'pilot'
    ? `Budget: ${entity.budget || 'N/A'}, TRL: ${entity.trl_start || 'N/A'}`
    : entityType === 'solution'
    ? `Maturity: ${entity.maturity_level || 'N/A'}, TRL: ${entity.trl || 'N/A'}`
    : '';

  return `${SAUDI_CONTEXT.COMPACT}

You are an AI system assessing sandbox routing for Saudi municipal innovations.

Assess if this ${entityType} requires sandbox testing before full deployment:

ENTITY DETAILS:
- Title: ${entity.title_en || entity.name_en || 'Unknown'}
- Description: ${entity.description_en || entity.abstract_en || 'Not provided'}
- Sector: ${entity.sector || entity.sectors?.join(', ') || 'Not specified'}
${typeSpecificInfo}

RISK EVALUATION REQUIRED:

1. REGULATORY RISK (0-100)
   Potential conflicts with existing regulations

2. SAFETY RISK (0-100)
   Public safety concerns

3. PUBLIC IMPACT RISK (0-100)
   Risk of negative public impact

4. TECHNICAL RISK (0-100)
   Technical complexity and failure risk

5. OVERALL RISK (0-100)
   Composite risk score

6. RECOMMENDATION
   - sandbox_required: High risk, must test first
   - sandbox_recommended: Moderate risk, testing advised
   - direct_pilot: Low risk, can proceed directly

7. REASONING
   Brief explanation for the recommendation

8. RECOMMENDED SANDBOXES
   If sandbox needed, suggest applicable sandbox types`;
}

/**
 * Schema for risk routing assessment
 */
export const autoRiskRouterSchema = createBilingualSchema({
  name: "risk_routing_assessment",
  description: "Risk assessment for sandbox routing decisions",
  properties: {
    regulatory_risk: { type: "number", description: "Regulatory risk score (0-100)" },
    safety_risk: { type: "number", description: "Safety risk score (0-100)" },
    public_impact_risk: { type: "number", description: "Public impact risk score (0-100)" },
    technical_risk: { type: "number", description: "Technical risk score (0-100)" },
    overall_risk: { type: "number", description: "Overall composite risk score (0-100)" },
    recommendation: { 
      type: "string", 
      description: "Recommendation: sandbox_required, sandbox_recommended, or direct_pilot" 
    },
    reasoning: { type: "string", description: "Explanation for the recommendation" },
    recommended_sandboxes: {
      type: "array",
      items: { type: "string" },
      description: "Suggested sandbox types if needed"
    }
  },
  required: ["regulatory_risk", "safety_risk", "public_impact_risk", "technical_risk", "overall_risk", "recommendation", "reasoning"]
});
