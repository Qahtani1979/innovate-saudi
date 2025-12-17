/**
 * Step 12: Single Action Plan Generation Prompt
 * 
 * This prompt is used for the "AI Add One" functionality in Step 12 (Actions)
 * to generate a single unique action plan based on current context.
 */

/**
 * Generate the single action prompt with dynamic context
 * @param {Object} params - Context parameters
 * @returns {string} The complete prompt
 */
export const generateSingleActionPrompt = ({
  context,
  wizardData,
  existingActions = [],
  existingActionsSummary = '',
  typeCoverageSummary = '',
  typeTargetInstruction = '',
  targetType = null,
  targetObjectiveIndex = null
}) => {
  const objectives = context.objectives || [];
  
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, Badir, university research
- Tech Partners: Elm, Thiqah, stc solutions, international vendors
- Key Systems: Balady, Sakani, ANSA, Baladiya platforms

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## OBJECTIVES:
${objectives.map((o, i) => `${i}. ${o.name_en || o.name_ar} (${o.sector_code || 'General'})`).join('\n') || 'Not defined yet'}

## KEY RISKS:
${(wizardData.risks || []).filter(r => r.impact === 'high').slice(0, 3).map(r => '- ' + (r.title_en || r.title_ar)).join('\n') || 'Not assessed'}

## EXISTING ACTIONS (${existingActions.length} total):
${existingActionsSummary || 'No existing actions yet'}

## CURRENT TYPE COVERAGE:
${typeCoverageSummary}
${typeTargetInstruction}
---

## ACTION TYPES:
- challenge: Innovation challenges, competitions, hackathons
- pilot: Small-scale tests, proof of concepts, beta programs
- program: Ongoing continuous improvement efforts
- campaign: Awareness, adoption, communication campaigns
- event: Workshops, conferences, training events
- policy: Policy development, regulatory changes
- rd_call: Research & development calls, grants
- partnership: Strategic alliances, MOUs, collaborations
- living_lab: Real-world testbed environments

## SINGLE-TYPE FOCUS RULE:
- The action MUST be of EXACTLY ONE type
${targetType ? `- MANDATORY: Use type = "${targetType}"` : '- Should balance existing type distribution'}
${targetObjectiveIndex !== null ? `- MANDATORY: Link to objective_index = ${targetObjectiveIndex}` : '- Must link to a valid objective index (0-based)'}

## DIFFERENTIATION REQUIREMENTS:
1. ${targetType ? `MUST target type: ${targetType}` : 'Should target underrepresented type'}
2. Must be a DIFFERENT action than existing ones
3. Must directly support its linked objective
4. Should fill a gap in action coverage

## DIFFERENTIATION SCORE (0-100):
- 90-100: Completely unique, addresses untouched action area
- 70-89: Highly unique, minimal overlap
- 50-69: Moderately unique, some similarity
- Below 50: Too similar to existing actions

## REQUIRED OUTPUT:
- name_en / name_ar: Clear action name
- description_en / description_ar: Detailed description (2-3 sentences)
- objective_index: ${targetObjectiveIndex !== null ? `MUST BE ${targetObjectiveIndex}` : 'Which objective this supports (0-based index)'}
- type: ${targetType ? `MUST BE "${targetType}"` : '"challenge" | "pilot" | "program" | "campaign" | "event" | "policy" | "rd_call" | "partnership" | "living_lab"'}
- priority: "high" | "medium" | "low"
- budget_estimate: Estimated cost in SAR (e.g., "500000" for 500K SAR)
- start_date: Planned start (YYYY-MM format)
- end_date: Planned end (YYYY-MM format)
- owner: Role/department responsible
- deliverables: Array of 3-5 specific outputs
- dependencies: Array of 1-3 prerequisites
- innovation_impact: 1-4 scale (1=minimal, 4=transformational)
- success_criteria_en / success_criteria_ar: How success will be measured
- should_create_entity: Boolean - whether to create as formal entity in system

## BUDGET GUIDELINES:
- Small pilot: 100,000 - 500,000 SAR
- Medium program: 500,000 - 2,000,000 SAR
- Large initiative: 2,000,000 - 10,000,000 SAR
- Major project: 10,000,000+ SAR

Use formal Arabic (فصحى). Be specific to Saudi municipal context and reference actual Saudi systems, agencies, and partners.`;
};

/**
 * Schema for single action response
 */
export const SINGLE_ACTION_SCHEMA = {
  type: 'object',
  required: ['action', 'differentiation_score'],
  properties: {
    action: {
      type: 'object',
      required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'objective_index', 'type', 'priority', 'budget_estimate', 'start_date', 'end_date', 'owner', 'deliverables', 'dependencies', 'innovation_impact', 'success_criteria_en', 'success_criteria_ar', 'should_create_entity'],
      properties: {
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        description_en: { type: 'string' },
        description_ar: { type: 'string' },
        objective_index: { type: 'number' },
        type: { 
          type: 'string',
          enum: ['challenge', 'pilot', 'program', 'campaign', 'event', 'policy', 'rd_call', 'partnership', 'living_lab']
        },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        budget_estimate: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
        owner: { type: 'string' },
        deliverables: { type: 'array', items: { type: 'string' } },
        dependencies: { type: 'array', items: { type: 'string' } },
        innovation_impact: { type: 'number', minimum: 1, maximum: 4 },
        success_criteria_en: { type: 'string' },
        success_criteria_ar: { type: 'string' },
        should_create_entity: { type: 'boolean' }
      },
      additionalProperties: false
    },
    differentiation_score: { type: 'number', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
};

/**
 * System prompt for single action generation
 */
export const SINGLE_ACTION_SYSTEM_PROMPT = 
  'You are a strategic planning AI assistant. Generate exactly ONE unique action plan with bilingual content. Return valid JSON matching the schema.';

export default {
  generateSingleActionPrompt,
  SINGLE_ACTION_SCHEMA,
  SINGLE_ACTION_SYSTEM_PROMPT
};
