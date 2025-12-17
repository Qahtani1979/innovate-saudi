/**
 * Step 9: Single Objective Generation Prompt
 * 
 * This prompt is used for the "AI Add One" functionality in Step 9 (Objectives)
 * to generate a single unique strategic objective based on current context.
 */

/**
 * Generate the single objective prompt with dynamic context
 * @param {Object} params - Context parameters
 * @returns {string} The complete prompt
 */
export const generateSingleObjectivePrompt = ({
  context,
  wizardData,
  existingObjectives = [],
  existingObjectivesSummary = '',
  sectorCoverageSummary = '',
  sectorTargetInstruction = '',
  targetSector = null,
  taxonomySectorList = '',
  taxonomySectorCodes = []
}) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Vision 2030 Programs: Quality of Life Program, Housing Program (70% ownership target), National Transformation Program, Thriving Cities Program
- Innovation Priorities: AI/ML, IoT, Digital Twins, Blockchain, Smart City Technologies
- Key Frameworks: National Spatial Strategy, National Housing Strategy, Smart City National Framework
- Key Systems: Balady Platform, Sakani Housing Program, ANSA (National Address)

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${context.mission}
- Available Sectors: ${taxonomySectorList || 'General sectors'}
- Technologies: ${context.technologies?.join(', ') || 'General'}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)

## STRATEGIC PILLARS:
${(wizardData.strategic_pillars || []).map((p, i) => `${i + 1}. ${p.name_en || p.name_ar}`).join('\n') || 'Not defined yet'}

## KEY SWOT INSIGHTS:
- Strengths: ${(wizardData.swot?.strengths || []).filter(s => s.priority === 'high').slice(0, 2).map(s => s.text_en).join('; ') || 'Not analyzed'}
- Opportunities: ${(wizardData.swot?.opportunities || []).filter(o => o.priority === 'high').slice(0, 2).map(o => o.text_en).join('; ') || 'Not analyzed'}

## EXISTING OBJECTIVES - CRITICAL: DO NOT DUPLICATE (${existingObjectives.length} total):
${existingObjectivesSummary || 'No existing objectives yet'}

**STRICT ANTI-DUPLICATION RULE:**
- You MUST NOT generate an objective with the same or similar title/scope as any existing one
- You MUST NOT generate an objective covering the same strategic theme as existing ones
- Each objective title above is FORBIDDEN - do not create variations of these
- Check both English AND Arabic titles to avoid duplicates in either language
- If you generate something similar to existing objectives, your output will be REJECTED

## CURRENT SECTOR COVERAGE:
${sectorCoverageSummary}
${sectorTargetInstruction}
---

## CRITICAL: THIS MUST BE A HIGH-LEVEL STRATEGIC OBJECTIVE

**Strategic Objectives are NOT:**
- ❌ Specific projects or solutions (e.g., "Install 500 solar panels")
- ❌ Technical implementations (e.g., "Deploy AI chatbot for citizen inquiries")
- ❌ Operational tasks (e.g., "Train 100 staff on new system")
- ❌ Single initiatives (e.g., "Launch mobile app for permits")

**Strategic Objectives ARE:**
- ✅ Broad organizational goals that guide multiple initiatives
- ✅ Outcome-focused rather than activity-focused
- ✅ Achievable through multiple projects and programs
- ✅ Aligned with national vision and long-term transformation

## HIGH-LEVEL STRATEGIC OBJECTIVE EXAMPLES:

**CORRECT Strategic Level:**
- "Achieve 95% Digital Service Adoption Across Municipal Services" (DIGITAL_SERVICES)
- "Establish Kingdom-wide Smart City Infrastructure Framework" (SMART_CITIES)
- "Attain 70% Citizen Satisfaction in Municipal Service Delivery" (CITIZEN_SERVICES)
- "Develop Comprehensive Sustainable Urban Environment Standards" (ENVIRONMENT)
- "Create Integrated Regional Housing Development Ecosystem" (HOUSING)
- "Build National Municipal Data Governance and Analytics Capability" (DIGITAL_SERVICES)
- "Achieve Zero-Waste Operations in 5 Major Metropolitan Areas" (ENVIRONMENT)
- "Establish Municipal Innovation Excellence Centers Across All Regions" (SMART_CITIES)

**WRONG - Too Tactical (AVOID):**
- ❌ "Implement IoT sensors in Riyadh traffic lights" (too specific)
- ❌ "Create AI chatbot for building permits" (single solution)
- ❌ "Train staff on Balady platform" (operational task)

---

## SINGLE-SECTOR FOCUS RULE:
- The objective MUST focus on EXACTLY ONE sector
- DO NOT mix multiple sectors in the same objective
- Title, description, and outcomes must ALL relate to the SAME sector_code
${targetSector ? `- MANDATORY: Use sector_code = "${targetSector}"` : ''}

## DIFFERENTIATION REQUIREMENTS:
1. ${targetSector ? `MUST target sector: ${targetSector}` : 'Must target a DIFFERENT sector than majority of existing objectives'}
2. Must address a DIFFERENT strategic theme or approach
3. Must not overlap significantly with any existing objective's scope
4. Should fill a gap in the strategic plan coverage
5. Must be HIGH-LEVEL STRATEGIC (not tactical/solution-level)
6. Must focus on EXACTLY ONE sector (no mixing)

## DIFFERENTIATION SCORE (0-100):
- 90-100: Completely unique, addresses untouched sector, truly strategic level
- 70-89: Highly unique, minimal overlap, proper strategic scope
- 50-69: Moderately unique, some thematic similarity
- Below 50: Too similar or too tactical

## REQUIRED OUTPUT:
- name_en / name_ar: HIGH-LEVEL strategic objective title (5-12 words)
- description_en / description_ar: Strategic description explaining broad outcomes and alignment (3-5 sentences)
- sector_code: ${targetSector ? `MUST BE "${targetSector}"` : `EXACTLY ONE of: ${taxonomySectorCodes.join(' | ') || 'URBAN_PLANNING | HOUSING | INFRASTRUCTURE | ENVIRONMENT | SMART_CITIES | DIGITAL_SERVICES'}`}
- priority: "high" | "medium" | "low"

Use formal Arabic (فصحى). Generate a TRUE STRATEGIC OBJECTIVE, not a tactical solution.`;
};

/**
 * Schema for single objective response
 */
export const SINGLE_OBJECTIVE_SCHEMA = {
  type: 'object',
  required: ['objective', 'differentiation_score'],
  properties: {
    objective: {
      type: 'object',
      required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'sector_code', 'priority'],
      properties: {
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' },
        description_ar: { type: 'string' },
        sector_code: { type: 'string' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] }
      },
      additionalProperties: false
    },
    differentiation_score: { type: 'number', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
};

/**
 * System prompt for single objective generation
 */
export const SINGLE_OBJECTIVE_SYSTEM_PROMPT = 
  'You are a strategic planning AI assistant. Generate exactly ONE unique strategic objective with bilingual content. CRITICAL: Check all existing objectives provided and ensure your output covers a completely different strategic area - no similar titles, themes, or scope. Return valid JSON matching the schema.';

export default {
  generateSingleObjectivePrompt,
  SINGLE_OBJECTIVE_SCHEMA,
  SINGLE_OBJECTIVE_SYSTEM_PROMPT
};
