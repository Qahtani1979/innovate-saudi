/**
 * Partnership Analysis AI Prompts
 * Centralized prompts for partnership evaluation and management
 * @module partnerships/partnershipAnalysis
 */

export const PARTNERSHIP_ANALYSIS_SYSTEM_PROMPT = `You are an expert partnership analyst for Saudi Arabian innovation ecosystems.

PARTNERSHIP FRAMEWORK:
1. Partner Assessment
   - Capability alignment
   - Strategic fit
   - Cultural compatibility
   - Track record

2. Value Analysis
   - Mutual benefits
   - Resource contribution
   - Risk sharing
   - Growth potential

3. Relationship Health
   - Engagement level
   - Communication quality
   - Conflict resolution
   - Trust metrics

4. Optimization
   - Performance gaps
   - Enhancement opportunities
   - Expansion potential
   - Exit considerations

CONTEXT:
- Saudi partnership regulations
- Vision 2030 collaboration goals
- Arabic/English bilingual support`;

export const PARTNERSHIP_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    partnership_score: { type: "number" },
    partnership_health: { type: "string", enum: ["excellent", "good", "fair", "poor"] },
    strategic_alignment: { type: "number" },
    value_delivery: {
      type: "object",
      properties: {
        our_contribution: { type: "array", items: { type: "string" } },
        partner_contribution: { type: "array", items: { type: "string" } },
        mutual_value: { type: "string" }
      }
    },
    relationship_metrics: {
      type: "object",
      properties: {
        engagement_score: { type: "number" },
        communication_quality: { type: "number" },
        trust_level: { type: "number" }
      }
    },
    opportunities: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["partnership_score", "partnership_health", "strategic_alignment"]
};

export const buildPartnershipAnalysisPrompt = (partnershipData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze partnership:

PARTNER: ${partnershipData.partnerName || 'Not specified'}
TYPE: ${partnershipData.type || 'Strategic'}
DURATION: ${partnershipData.duration || 'Not specified'}
STATUS: ${partnershipData.status || 'Active'}

OBJECTIVES:
${partnershipData.objectives?.map(o => `- ${o}`).join('\n') || 'Not specified'}

JOINT INITIATIVES: ${partnershipData.initiatives || 0}
TOTAL VALUE: ${partnershipData.value || 'N/A'} SAR

RECENT ACTIVITIES:
${partnershipData.activities?.slice(0, 5).map(a => `- ${a}`).join('\n') || 'None recorded'}

Provide comprehensive partnership analysis with optimization recommendations.`;
};

export const PARTNERSHIP_ANALYSIS_PROMPTS = {
  system: PARTNERSHIP_ANALYSIS_SYSTEM_PROMPT,
  schema: PARTNERSHIP_ANALYSIS_SCHEMA,
  buildPrompt: buildPartnershipAnalysisPrompt
};

export default PARTNERSHIP_ANALYSIS_PROMPTS;
