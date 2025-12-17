/**
 * Step 10: National Alignment
 * AI prompt and schema for generating national framework alignments
 */

export const getStep10Prompt = (context, wizardData) => {
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

## OBJECTIVES (from Step 9):
${(wizardData.objectives || []).map((o, i) => i + '. ' + (o.name_en || o.name_ar || 'Objective') + ' (' + (o.sector_code || 'General') + ', ' + (o.priority || 'medium') + ')').join('\n') || 'No objectives defined yet'}

---

## REQUIREMENTS:
Generate national alignment mappings for each objective to Vision 2030 and Innovation frameworks.

For EACH objective, provide:
- objective_index: Index of the objective (0-based)
- goal_code: Vision 2030 goal/program code (see list below)
- target_code: Specific target within the goal
- innovation_alignment: How this supports national innovation goals (1 sentence)

### VISION 2030 GOAL CODES:
**Quality of Life Program:**
- QOL_1: Improve livability of Saudi cities
- QOL_2: Enhance environmental sustainability
- QOL_3: Develop cultural and entertainment options
- QOL_4: Promote sports and healthy lifestyles

**Housing Program:**
- HSG_1: Increase home ownership to 70%
- HSG_2: Improve housing quality and affordability
- HSG_3: Develop real estate sector

**National Transformation Program (NTP):**
- NTP_1: Government effectiveness and efficiency
- NTP_2: Digital transformation of government services
- NTP_3: Private sector enablement
- NTP_4: Labor market development

**Thriving Cities Program:**
- TRC_1: Urban development and planning
- TRC_2: Municipal infrastructure improvement
- TRC_3: Smart city implementation
- TRC_4: Sustainable urban development

**National Innovation & Technology:**
- INN_1: R&D investment and capability building
- INN_2: Technology adoption and digital transformation
- INN_3: AI and emerging technology deployment (SDAIA)
- INN_4: Innovation ecosystem and partnerships
- INN_5: Tech talent development and Saudization

### ALIGNMENT REQUIREMENTS:
1. Each objective MUST align to at least one Vision 2030 goal
2. Innovation/technology objectives MUST align to INN codes
3. Each objective should have a clear innovation_alignment statement
4. Prioritize alignments that strengthen R&D and technology adoption

### INNOVATION ALIGNMENT EXAMPLES:
- "Supports national AI strategy through SDAIA-compliant municipal AI deployment"
- "Advances R&D ecosystem through partnership with KACST research programs"
- "Enables technology transfer from pilot programs to scaled municipal solutions"
- "Builds digital capabilities aligned with MCIT national digital transformation"
- "Supports smart city framework implementation in line with Thriving Cities program"

Return alignments as an array under the "alignments" key with proper objective_index, goal_code, target_code, and innovation_alignment for each mapping.`;
};

export const step10Schema = {
  type: 'object',
  properties: {
    alignments: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          objective_index: { type: 'number' }, 
          goal_code: { type: 'string' }, 
          target_code: { type: 'string' }, 
          innovation_alignment: { type: 'string' } 
        } 
      } 
    }
  }
};
