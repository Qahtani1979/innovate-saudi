/**
 * Step 10: National Alignment
 * AI prompt and schema for generating national framework alignments
 */

export const getStep10Prompt = (context, wizardData) => {
  // Build objectives list with names for AI context
  const objectivesList = (wizardData.objectives || []).map((o, i) => ({
    index: i,
    name_en: o.name_en || o.name_ar || `Objective ${i + 1}`,
    name_ar: o.name_ar || o.name_en || `هدف ${i + 1}`,
    sector_code: o.sector_code || 'General',
    priority: o.priority || 'medium'
  }));

  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation & R&D alignment with national frameworks.

## MoMAH NATIONAL ALIGNMENT CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities, Fiscal Balance
- National Innovation Strategy: KACST coordination, SDAIA AI strategy, MCIT digital transformation
- R&D National Frameworks: National Science & Technology Policy, Innovation Ecosystem Strategy
- Key Agencies: Vision Realization Programs, SDAIA, KACST, MCIT, Ministry of Economy & Planning

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'AI_ML, IOT, DIGITAL_TWINS'}
- Vision 2030 Programs Selected: ${(wizardData.vision_2030_programs || []).join(', ') || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}

## OBJECTIVES TO ALIGN (from Step 9):
${objectivesList.map(o => `- Index ${o.index}: "${o.name_en}" (Sector: ${o.sector_code}, Priority: ${o.priority})`).join('\n') || 'No objectives defined yet'}

---

## REQUIREMENTS:
Generate national alignment mappings for each objective to Vision 2030 and Innovation frameworks.

For EACH alignment, you MUST provide ALL of these fields:
- objective_index: The index of the objective (0-based integer matching the list above)
- objective_name: The exact name of the objective in English (copy from objectives list above)
- goal_code: Vision 2030 program code (e.g., "QOL", "HSG", "NTP", "TRC", "INN")
- target_code: Specific target code within the program (e.g., "QOL_1", "HSG_2", "TRC_3")
- innovation_alignment: How this supports national innovation goals (1 sentence)

### VISION 2030 GOAL CODES AND TARGETS:

**Quality of Life Program (QOL):**
- QOL_1: Improve livability of Saudi cities
- QOL_2: Enhance environmental sustainability
- QOL_3: Develop cultural and entertainment options
- QOL_4: Promote sports and healthy lifestyles

**Housing Program (HSG):**
- HSG_1: Increase home ownership to 70%
- HSG_2: Improve housing quality and affordability
- HSG_3: Develop real estate sector

**National Transformation Program (NTP):**
- NTP_1: Government effectiveness and efficiency
- NTP_2: Digital transformation of government services
- NTP_3: Private sector enablement
- NTP_4: Labor market development

**Thriving Cities Program (TRC):**
- TRC_1: Urban development and planning
- TRC_2: Municipal infrastructure improvement
- TRC_3: Smart city implementation
- TRC_4: Sustainable urban development

**National Innovation & Technology (INN):**
- INN_1: R&D investment and capability building
- INN_2: Technology adoption and digital transformation
- INN_3: AI and emerging technology deployment (SDAIA)
- INN_4: Innovation ecosystem and partnerships
- INN_5: Tech talent development and Saudization

### ALIGNMENT REQUIREMENTS:
1. Each objective MUST have at least 1-3 alignments to relevant targets
2. Innovation/technology objectives MUST align to INN codes
3. Each alignment needs a clear innovation_alignment statement
4. The goal_code must be extracted from target_code (e.g., "QOL" from "QOL_1")
5. Prioritize alignments that strengthen R&D and technology adoption

### INNOVATION ALIGNMENT EXAMPLES:
- "Supports national AI strategy through SDAIA-compliant municipal AI deployment"
- "Advances R&D ecosystem through partnership with KACST research programs"
- "Enables technology transfer from pilot programs to scaled municipal solutions"
- "Builds digital capabilities aligned with MCIT national digital transformation"
- "Supports smart city framework implementation in line with Thriving Cities program"

Return alignments as an array under the "alignments" key with ALL required fields for each alignment.`;
};

export const step10Schema = {
  type: 'object',
  properties: {
    alignments: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          objective_index: { type: 'number', description: 'Zero-based index of the objective' }, 
          objective_name: { type: 'string', description: 'Name of the objective in English' },
          goal_code: { type: 'string', description: 'Vision 2030 program code (QOL, HSG, NTP, TRC, INN)' }, 
          target_code: { type: 'string', description: 'Specific target code (e.g., QOL_1, TRC_3)' }, 
          innovation_alignment: { type: 'string', description: 'How this supports national innovation goals' } 
        },
        required: ['objective_index', 'objective_name', 'goal_code', 'target_code', 'innovation_alignment']
      } 
    }
  },
  required: ['alignments']
};
