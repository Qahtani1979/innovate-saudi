/**
 * Step 7: Single Risk Generation Prompt
 * 
 * This prompt is used for the "AI Add One" functionality in Step 7 (Risks)
 * to generate a single unique risk based on current context.
 */

/**
 * Generate the single risk prompt with dynamic context
 * @param {Object} params - Context parameters
 * @returns {string} The complete prompt
 */
export const generateSingleRiskPrompt = ({
  context,
  wizardData,
  existingRisks = [],
  existingRisksSummary = '',
  categoryCoverageSummary = '',
  categoryTargetInstruction = '',
  targetCategory = null
}) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Vision 2030 Programs: Quality of Life Program, Housing Program, National Transformation Program
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Tech Infrastructure: Balady, Sakani, ANSA, national data platforms
- Regulatory Framework: PDPL, SDAIA AI Ethics, CITC, cybersecurity laws

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors?.join(', ') || 'General'}
- Timeline: ${context.startYear}-${context.endYear}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## SWOT WEAKNESSES & THREATS:
- Weaknesses: ${(wizardData.swot?.weaknesses || []).slice(0, 3).map(w => w.text_en).join('; ') || 'Not defined'}
- Threats: ${(wizardData.swot?.threats || []).slice(0, 3).map(t => t.text_en).join('; ') || 'Not defined'}

## EXISTING RISKS - CRITICAL: DO NOT DUPLICATE (${existingRisks.length} total):
${existingRisksSummary || 'No existing risks yet'}

**STRICT ANTI-DUPLICATION RULE:**
- You MUST NOT generate a risk with the same or similar title as any existing risk
- You MUST NOT generate a risk covering the same topic/area as existing ones
- Each risk title above is FORBIDDEN - do not create variations of these
- If you generate something similar to existing risks, your output will be REJECTED

## CURRENT CATEGORY COVERAGE:
${categoryCoverageSummary}
${categoryTargetInstruction}
---

## RISK CATEGORIES:
- STRATEGIC: Vision 2030 misalignment, stakeholder conflicts, strategic direction changes
- OPERATIONAL: Capacity gaps, coordination failures, resource constraints
- FINANCIAL: Budget overruns, funding delays, ROI uncertainty
- REGULATORY: PDPL non-compliance, policy changes, permit issues
- TECHNOLOGY: System integration failures, cybersecurity, tech obsolescence
- INNOVATION: Pilot failures, R&D partner dependency, talent drain, scaling issues
- REPUTATIONAL: Public perception, media coverage, trust erosion
- POLITICAL: Leadership changes, inter-ministry conflicts, priority shifts
- ENVIRONMENTAL: Sustainability failures, climate impacts, resource depletion

## SINGLE-CATEGORY FOCUS RULE:
- The risk MUST focus on EXACTLY ONE category
${targetCategory ? `- MANDATORY: Use category = "${targetCategory}"` : '- Must target an underrepresented category'}

## DIFFERENTIATION REQUIREMENTS:
1. ${targetCategory ? `MUST target category: ${targetCategory}` : 'Must target an underrepresented category'}
2. Must address a DIFFERENT risk than existing ones
3. Must be relevant to the plan's specific context
4. Should fill a gap in risk coverage

## DIFFERENTIATION SCORE (0-100):
- 90-100: Completely unique, addresses untouched risk area
- 70-89: Highly unique, minimal overlap
- 50-69: Moderately unique, some similarity
- Below 50: Too similar to existing risks

## REQUIRED OUTPUT:
- title_en / title_ar: Short risk title (5-10 words)
- description_en / description_ar: Detailed description (2-3 sentences)
- category: ${targetCategory ? `MUST BE "${targetCategory}"` : 'STRATEGIC | OPERATIONAL | FINANCIAL | REGULATORY | TECHNOLOGY | INNOVATION | REPUTATIONAL | POLITICAL | ENVIRONMENTAL'}
- likelihood: "low" | "medium" | "high"
- impact: "low" | "medium" | "high"
- mitigation_strategy_en / mitigation_strategy_ar: Preventive actions (2-3 sentences)
- contingency_plan_en / contingency_plan_ar: Response if risk occurs (2-3 sentences)
- owner: Role/department responsible

Use formal Arabic (فصحى). Be specific to Saudi municipal context and the plan's focus areas.`;
};

/**
 * Schema for single risk response
 */
export const SINGLE_RISK_SCHEMA = {
  type: 'object',
  required: ['risk', 'differentiation_score'],
  properties: {
    risk: {
      type: 'object',
      required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'category', 'likelihood', 'impact', 'mitigation_strategy_en', 'mitigation_strategy_ar', 'contingency_plan_en', 'contingency_plan_ar', 'owner'],
      properties: {
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        description_ar: { type: 'string' },
        category: { type: 'string', enum: ['STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'REGULATORY', 'TECHNOLOGY', 'INNOVATION', 'REPUTATIONAL', 'POLITICAL', 'ENVIRONMENTAL'] },
        likelihood: { type: 'string', enum: ['low', 'medium', 'high'] },
        impact: { type: 'string', enum: ['low', 'medium', 'high'] },
        mitigation_strategy_en: { type: 'string' },
        mitigation_strategy_ar: { type: 'string' },
        contingency_plan_en: { type: 'string' },
        contingency_plan_ar: { type: 'string' },
        owner: { type: 'string' }
      },
      additionalProperties: false
    },
    differentiation_score: { type: 'number', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
};

/**
 * System prompt for single risk generation
 */
export const SINGLE_RISK_SYSTEM_PROMPT = 
  'You are a strategic planning AI assistant. Generate exactly ONE unique risk with bilingual content. CRITICAL: Check all existing risks provided and ensure your output is completely different - no similar titles, topics, or areas. Return valid JSON matching the schema.';

export default {
  generateSingleRiskPrompt,
  SINGLE_RISK_SCHEMA,
  SINGLE_RISK_SYSTEM_PROMPT
};
