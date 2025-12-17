/**
 * Step 3: Single Stakeholder Generation Prompt
 * 
 * This prompt is used for the "AI Add One" functionality in Step 3 (Stakeholders)
 * to generate a single unique stakeholder based on current context.
 */

/**
 * Generate the single stakeholder prompt with dynamic context
 * @param {Object} params - Context parameters
 * @returns {string} The complete prompt
 */
export const generateSingleStakeholderPrompt = ({
  context,
  wizardData,
  existingStakeholders = [],
  existingStakeholdersSummary = '',
  typeCoverageSummary = '',
  typeTargetInstruction = '',
  targetType = null
}) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Vision 2030 Programs: Quality of Life Program, Housing Program (70% ownership target), National Transformation Program, Thriving Cities Program
- Innovation Ecosystem: KACST, TAQNIA, Misk Foundation, Monsha'at, Research Chair Programs
- Tech & Innovation Partners: SDAIA, MCIT, STC, stc solutions, Elm, Thiqah, Saudi Venture Capital
- Universities & Research: KSU, KFUPM, KAUST, PNU, KAU, Effat, Alfaisal

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${context.mission}
- Sectors: ${context.sectors?.join(', ') || 'General municipal services'}
- Technologies: ${context.technologies?.join(', ') || 'General'}
- Timeline: ${context.startYear}-${context.endYear}

## EXISTING STAKEHOLDERS - CRITICAL: DO NOT DUPLICATE (${existingStakeholders.length} total):
${existingStakeholdersSummary || 'No existing stakeholders yet'}

**STRICT ANTI-DUPLICATION RULE:**
- You MUST NOT generate a stakeholder with the same or similar name as any existing one
- You MUST NOT generate a stakeholder from the same organization/entity as existing ones
- Each stakeholder name above is FORBIDDEN - do not create variations of these
- If you generate something similar to existing stakeholders, your output will be REJECTED

## CURRENT TYPE COVERAGE:
${typeCoverageSummary}
${typeTargetInstruction}
---

## STAKEHOLDER TYPES:
- GOVERNMENT: Ministries, regulatory bodies, funding agencies, Vision programs
- PRIVATE: Technology vendors, system integrators, startups, contractors
- ACADEMIC: Universities, research centers, innovation hubs
- NGO: Non-profit organizations, international bodies
- COMMUNITY: Citizen groups, professional associations, chambers of commerce
- INTERNATIONAL: Foreign partners, multinational organizations
- INTERNAL: MoMAH departments, Amanat units, municipal staff

## SINGLE-TYPE FOCUS RULE:
- The stakeholder MUST be of EXACTLY ONE type
${targetType ? `- MANDATORY: Use type = "${targetType}"` : '- Must target a DIFFERENT type than majority of existing stakeholders'}

## DIFFERENTIATION REQUIREMENTS:
1. ${targetType ? `MUST target type: ${targetType}` : 'Must target an underrepresented type'}
2. Must be a DIFFERENT organization/entity than existing stakeholders
3. Must bring unique value or perspective to the strategic plan
4. Should fill a gap in stakeholder coverage

## DIFFERENTIATION SCORE (0-100):
- 90-100: Completely unique, addresses untouched stakeholder type
- 70-89: Highly unique, minimal overlap
- 50-69: Moderately unique, some similarity
- Below 50: Too similar to existing stakeholders

## REQUIRED OUTPUT:
- name_en / name_ar: Full organization/role name
- type: ${targetType ? `MUST BE "${targetType}"` : 'GOVERNMENT | PRIVATE | ACADEMIC | NGO | COMMUNITY | INTERNATIONAL | INTERNAL'}
- power: "low" | "medium" | "high"
- interest: "low" | "medium" | "high"
- engagement_level: "inform" | "consult" | "involve" | "collaborate" | "empower"
- influence_strategy_en / influence_strategy_ar: 2-3 sentences on engagement approach
- contact_person_en / contact_person_ar: Suggested role/title for primary contact
- notes_en / notes_ar: Timing, special considerations, relationship notes

Use formal Arabic (فصحى). Be specific to Saudi municipal context.`;
};

/**
 * Schema for single stakeholder response
 */
export const SINGLE_STAKEHOLDER_SCHEMA = {
  type: 'object',
  required: ['stakeholder', 'differentiation_score'],
  properties: {
    stakeholder: {
      type: 'object',
      required: ['name_en', 'name_ar', 'type', 'power', 'interest', 'engagement_level', 'influence_strategy_en', 'influence_strategy_ar', 'contact_person_en', 'contact_person_ar', 'notes_en', 'notes_ar'],
      properties: {
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        type: { type: 'string', enum: ['GOVERNMENT', 'PRIVATE', 'ACADEMIC', 'NGO', 'COMMUNITY', 'INTERNATIONAL', 'INTERNAL'] },
        power: { type: 'string', enum: ['low', 'medium', 'high'] },
        interest: { type: 'string', enum: ['low', 'medium', 'high'] },
        engagement_level: { type: 'string', enum: ['inform', 'consult', 'involve', 'collaborate', 'empower'] },
        influence_strategy_en: { type: 'string' },
        influence_strategy_ar: { type: 'string' },
        contact_person_en: { type: 'string' },
        contact_person_ar: { type: 'string' },
        notes_en: { type: 'string' },
        notes_ar: { type: 'string' }
      },
      additionalProperties: false
    },
    differentiation_score: { type: 'number', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
};

/**
 * System prompt for single stakeholder generation
 */
export const SINGLE_STAKEHOLDER_SYSTEM_PROMPT = 
  'You are a strategic planning AI assistant. Generate exactly ONE unique stakeholder with bilingual content. CRITICAL: Check all existing stakeholders provided and ensure your output is a completely different organization/entity - no similar names or roles. Return valid JSON matching the schema.';

export default {
  generateSingleStakeholderPrompt,
  SINGLE_STAKEHOLDER_SCHEMA,
  SINGLE_STAKEHOLDER_SYSTEM_PROMPT
};
