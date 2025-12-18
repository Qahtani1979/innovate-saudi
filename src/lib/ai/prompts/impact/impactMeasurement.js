/**
 * Impact Measurement AI Prompts
 * Centralized prompts for impact analysis and measurement
 * @module impact/impactMeasurement
 */

export const IMPACT_MEASUREMENT_SYSTEM_PROMPT = `You are an expert impact analyst for Saudi Arabian government innovation initiatives.

IMPACT FRAMEWORK:
1. Social Impact
   - Citizen benefit
   - Quality of life
   - Accessibility
   - Equity outcomes

2. Economic Impact
   - Cost savings
   - Revenue generation
   - Job creation
   - GDP contribution

3. Environmental Impact
   - Sustainability
   - Resource efficiency
   - Carbon footprint
   - Green outcomes

4. Governance Impact
   - Efficiency gains
   - Transparency
   - Service quality
   - Stakeholder satisfaction

CONTEXT:
- Saudi Vision 2030 KPIs
- UN SDG alignment
- Arabic/English bilingual support`;

export const IMPACT_MEASUREMENT_SCHEMA = {
  type: "object",
  properties: {
    overall_impact_score: { type: "number" },
    impact_rating: { type: "string", enum: ["transformational", "significant", "moderate", "limited"] },
    social_impact: {
      type: "object",
      properties: {
        score: { type: "number" },
        beneficiaries: { type: "number" },
        key_outcomes: { type: "array", items: { type: "string" } }
      }
    },
    economic_impact: {
      type: "object",
      properties: {
        score: { type: "number" },
        value_created: { type: "string" },
        jobs_created: { type: "number" },
        roi: { type: "string" }
      }
    },
    environmental_impact: {
      type: "object",
      properties: {
        score: { type: "number" },
        sustainability_contribution: { type: "string" },
        resource_savings: { type: "string" }
      }
    },
    sdg_alignment: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sdg: { type: "string" },
          contribution: { type: "string" }
        }
      }
    },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["overall_impact_score", "impact_rating"]
};

export const buildImpactMeasurementPrompt = (initiativeData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Measure impact for:

INITIATIVE: ${initiativeData.name || 'Not specified'}
TYPE: ${initiativeData.type || 'Project'}
DURATION: ${initiativeData.duration || 'Not specified'}
INVESTMENT: ${initiativeData.investment || 'N/A'} SAR

OUTCOMES ACHIEVED:
${initiativeData.outcomes?.map(o => `- ${o}`).join('\n') || 'Not specified'}

BENEFICIARIES: ${initiativeData.beneficiaries || 'N/A'}
GEOGRAPHIC SCOPE: ${initiativeData.scope || 'Not specified'}

Provide comprehensive impact measurement with SDG alignment.`;
};

export const IMPACT_MEASUREMENT_PROMPTS = {
  system: IMPACT_MEASUREMENT_SYSTEM_PROMPT,
  schema: IMPACT_MEASUREMENT_SCHEMA,
  buildPrompt: buildImpactMeasurementPrompt
};

export default IMPACT_MEASUREMENT_PROMPTS;
