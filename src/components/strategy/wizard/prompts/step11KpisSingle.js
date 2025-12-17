/**
 * Step 11: Single KPI Generation Prompt
 * 
 * This prompt is used for the "AI Add One" functionality in Step 11 (KPIs)
 * to generate a single unique KPI based on current context.
 */

/**
 * Generate the single KPI prompt with dynamic context
 * @param {Object} params - Context parameters
 * @returns {string} The complete prompt
 */
export const generateSingleKpiPrompt = ({
  context,
  wizardData,
  existingKpis = [],
  existingKpisSummary = '',
  categoryCoverageSummary = '',
  categoryTargetInstruction = '',
  targetCategory = null,
  targetObjectiveIndex = null
}) => {
  const objectives = context.objectives || [];
  
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) specializing in SMART KPI development.

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Key Systems: Balady, Sakani, ANSA, national data platforms

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## OBJECTIVES:
${objectives.map((o, i) => `${i}. ${o.name_en || o.name_ar} (${o.sector_code || 'General'}, ${o.priority || 'medium'} priority)`).join('\n') || 'Not defined yet'}

## EXISTING KPIs - CRITICAL: DO NOT DUPLICATE (${existingKpis.length} total):
${existingKpisSummary || 'No existing KPIs yet'}

**STRICT ANTI-DUPLICATION RULE:**
- You MUST NOT generate a KPI measuring the same thing as any existing KPI
- You MUST NOT generate a KPI with the same or similar name as existing ones
- Each KPI name above is FORBIDDEN - do not create variations of these
- Check both the metric being measured AND the name to avoid overlap
- If you generate something similar to existing KPIs, your output will be REJECTED

## CURRENT CATEGORY COVERAGE:
${categoryCoverageSummary}
${categoryTargetInstruction}
---

## KPI CATEGORIES:
- outcome: Lagging indicators measuring final results (satisfaction scores, quality ratings)
- output: Lagging indicators measuring deliverables (projects delivered, units completed)
- process: Leading indicators predicting performance (processing times, efficiency ratios)
- input: Leading indicators measuring resources (training hours, budget utilized)

## SINGLE-CATEGORY FOCUS RULE:
- The KPI MUST be of EXACTLY ONE category
${targetCategory ? `- MANDATORY: Use category = "${targetCategory}"` : '- Should balance existing category distribution'}
${targetObjectiveIndex !== null ? `- MANDATORY: Link to objective_index = ${targetObjectiveIndex}` : '- Must link to a valid objective index (0-based)'}

## DIFFERENTIATION REQUIREMENTS:
1. ${targetCategory ? `MUST target category: ${targetCategory}` : 'Should target underrepresented category'}
2. Must measure something DIFFERENT than existing KPIs
3. Must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound
4. Should fill a gap in KPI coverage

## DIFFERENTIATION SCORE (0-100):
- 90-100: Completely unique, measures untouched area
- 70-89: Highly unique, minimal overlap
- 50-69: Moderately unique, some similarity
- Below 50: Too similar to existing KPIs

## REQUIRED OUTPUT (BILINGUAL):
- name_en / name_ar: Specific, measurable KPI name (avoid vague terms)
- category: ${targetCategory ? `MUST BE "${targetCategory}"` : '"outcome" | "output" | "process" | "input"'}
- unit_en / unit_ar: Measurement unit in both languages (e.g., "%" / "٪", "days" / "أيام")
- baseline_value: Current/starting value (be specific)
- target_value: Target to achieve by end of plan
- objective_index: ${targetObjectiveIndex !== null ? `MUST BE ${targetObjectiveIndex}` : 'Which objective this KPI measures (0-based index)'}
- frequency: "monthly" | "quarterly" | "biannual" | "annual"
- data_source_en / data_source_ar: Specific system/platform (e.g., "Balady Platform" / "منصة بلدي")
- data_collection_method_en / data_collection_method_ar: How data will be collected (e.g., "Automated API" / "واجهة برمجة آلية")
- owner_en / owner_ar: Role/department responsible (e.g., "Digital Transformation Office" / "مكتب التحول الرقمي")
- milestones: Array of year-by-year targets from ${context.startYear} to ${context.endYear}

## MILESTONE FORMAT:
[
  { "year": ${context.startYear}, "target": "value" },
  { "year": ${context.startYear + 1}, "target": "value" },
  ...
  { "year": ${context.endYear}, "target": "value" }
]

## DATA SOURCES (be specific, BILINGUAL):
- "Balady Platform Analytics" / "تحليلات منصة بلدي"
- "Citizen Pulse Survey System" / "نظام استطلاع نبض المواطن"
- "SDAIA AI Governance Dashboard" / "لوحة حوكمة الذكاء الاصطناعي - سدايا"
- "Municipal ERP/Finance System" / "نظام تخطيط موارد البلدية"
- "IoT Command Center Platform" / "منصة مركز قيادة إنترنت الأشياء"
- "HR LMS" / "نظام إدارة التعلم للموارد البشرية"
- "Innovation Portfolio Tracker" / "متتبع محفظة الابتكار"

Use formal Arabic (فصحى). Be specific to Saudi municipal context. Ensure SMART criteria compliance.`;
};

/**
 * Schema for single KPI response
 */
export const SINGLE_KPI_SCHEMA = {
  type: 'object',
  required: ['kpi', 'differentiation_score'],
  properties: {
    kpi: {
      type: 'object',
      required: ['name_en', 'name_ar', 'category', 'unit_en', 'unit_ar', 'baseline_value', 'target_value', 'objective_index', 'frequency', 'data_source_en', 'data_source_ar', 'data_collection_method_en', 'data_collection_method_ar', 'owner_en', 'owner_ar', 'milestones'],
      properties: {
        name_en: { type: 'string' },
        name_ar: { type: 'string' },
        category: { type: 'string', enum: ['outcome', 'output', 'process', 'input'] },
        unit_en: { type: 'string' },
        unit_ar: { type: 'string' },
        baseline_value: { type: 'string' },
        target_value: { type: 'string' },
        objective_index: { type: 'number' },
        frequency: { type: 'string', enum: ['monthly', 'quarterly', 'biannual', 'annual'] },
        data_source_en: { type: 'string' },
        data_source_ar: { type: 'string' },
        data_collection_method_en: { type: 'string' },
        data_collection_method_ar: { type: 'string' },
        owner_en: { type: 'string' },
        owner_ar: { type: 'string' },
        milestones: { 
          type: 'array', 
          items: { 
            type: 'object', 
            properties: { 
              year: { type: 'number' }, 
              target: { type: 'string' } 
            } 
          } 
        }
      },
      additionalProperties: false
    },
    differentiation_score: { type: 'number', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
};

/**
 * System prompt for single KPI generation
 */
export const SINGLE_KPI_SYSTEM_PROMPT = 
  'You are a strategic planning AI assistant. Generate exactly ONE unique SMART KPI with bilingual content. CRITICAL: Check all existing KPIs provided and ensure your output measures something completely different - no similar metrics, names, or measurement areas. Return valid JSON matching the schema.';

export default {
  generateSingleKpiPrompt,
  SINGLE_KPI_SCHEMA,
  SINGLE_KPI_SYSTEM_PROMPT
};
