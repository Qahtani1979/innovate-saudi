/**
 * Shared Saudi Arabia / MoMAH Context for AI Prompts
 * Centralized context to ensure consistent AI outputs across all components
 * @version 1.1.0
 */

/**
 * Comprehensive Saudi context for AI prompts.
 *
 * NOTE:
 * - Many prompt files historically referenced additional snippet keys.
 * - To avoid leaking "undefined" into prompts, we keep backward-compatible snippet keys and
 *   provide a safe fallback for unknown keys.
 */
const SAUDI_CONTEXT_RAW = {
  /**
   * Full detailed context - use for complex generation tasks
   */
  FULL: `MoMAH (Ministry of Municipalities and Housing) oversees:
- 13 administrative regions, 285+ municipalities, 17 Amanats
- Municipal services: waste, lighting, parks, markets, permits, inspections
- Housing programs: Sakani, Wafi, Ejar, Mulkiya, REDF, NHC
- Vision 2030: Quality of Life, Housing (70% ownership), NTP, Thriving Cities
- Innovation: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, ConTech
- Partners: KACST, SDAIA, MCIT, KAUST, KFUPM, Monsha'at
- Systems: Balady Platform, Sakani, ANSA, Baladiya, Mostadam`,

  /**
   * Compact context - use for simpler tasks with token limits
   */
  COMPACT: `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities. Programs: Sakani, Wafi, Ejar.
Innovation: KACST, SDAIA, MCIT. Platforms: Balady, Sakani, Mostadam.`,

  /**
   * Innovation-focused context - use for R&D, pilots, technology assessments
   */
  INNOVATION: `CRITICAL: Include innovation/R&D focus in all outputs.
- Technologies: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, ConTech
- Innovation Partners: KACST, SDAIA, KAUST, KFUPM, Monsha'at, Badir Program
- PropTech: BIM, modular construction, 3D printing, smart homes
- Metrics: Pilot success rates, technology adoption %, R&D investment %
- Green Building: Mostadam certification, energy efficiency, sustainability`,

  /**
   * Housing-focused context - use for housing programs and initiatives
   */
  HOUSING: `Housing Mandate (Critical Priority):
- Goal: 70% homeownership by 2030 (from 47% baseline)
- Programs: Sakani (subsidies), Wafi (off-plan), Ejar (rental), Mulkiya (ownership)
- Finance: REDF mortgages, SRC refinancing
- Stakeholders: NHC, REDF, SRC, developers, PropTech startups
- Innovation: BIM, modular, 3D printing, smart homes, Mostadam green buildings`,

  /**
   * Municipal operations context - use for municipal services and governance
   */
  MUNICIPAL: `Municipal Operations:
- Services: Waste, lighting, parks, markets, drainage, permits, inspections
- Platforms: Balady (citizen services), unified CRM
- Governance: Amanat (17 major cities), municipalities (285+), districts
- Compliance: Saudi Building Code, fire safety, accessibility standards
- Investment: PPP, concessions, asset commercialization`,

  // ----------------------------
  // Backward-compatible snippets
  // ----------------------------

  /**
   * Used by legacy prompts that embed a Vision 2030 block explicitly.
   */
  VISION_2030: `VISION 2030 ALIGNMENT (CRITICAL):
- Prioritize Quality of Life improvements, Thriving Cities, sustainability, and digital transformation.
- Recommend measurable outcomes (KPIs), clear ownership, and realistic timelines.
- Use formal Saudi government tone and contextually appropriate terminology.`,

  /**
   * Used by legacy R&D prompts.
   */
  TECHNOLOGY_PRIORITIES: `TECHNOLOGY PRIORITIES:
- AI/ML (computer vision, predictive analytics, NLP)
- IoT & Smart Infrastructure
- Digital Twins & GIS-enabled urban planning
- GovTech service digitization and automation
- PropTech/ConTech (BIM, modular construction, 3D printing)
- Cybersecurity and data governance`,

  /**
   * Used by legacy policy prompts.
   */
  GOVERNMENT_TONE: `TONE (CRITICAL):
- Write in a formal, professional Saudi government style.
- Be precise, actionable, and decision-oriented.
- Avoid speculation; state assumptions explicitly when needed.`,

  /**
   * Used by legacy ecosystem prompts.
   */
  MUNICIPAL_CONTEXT: `MUNICIPAL CONTEXT:
- Saudi municipalities deliver frontline services (waste, permits, inspections, parks, lighting).
- Consider governance structure (Amanat/municipalities), regional variation, and operational constraints.
- Recommend implementable steps and accountability.`,

  /**
   * Used by legacy technology prompts.
   */
  SMART_CITIES_FOCUS: `SMART CITIES FOCUS:
- Emphasize interoperability, data platforms, sensor networks, and citizen experience.
- Consider digital twin use cases, predictive maintenance, and service optimization.
- Include security, privacy, and responsible AI considerations.`,
};

/**
 * Exported context object.
 *
 * Any unknown key returns an empty string to prevent "undefined"/"[object Object]" from
 * leaking into prompt templates.
 */
export const SAUDI_CONTEXT = new Proxy(SAUDI_CONTEXT_RAW, {
  get(target, prop) {
    if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(target, prop)) {
      return target[prop];
    }
    return '';
  }
});

/**
 * Language requirements for AI outputs
 */
export const LANGUAGE_REQUIREMENTS = {
  BILINGUAL: `LANGUAGE REQUIREMENTS (CRITICAL):
- Generate ALL text fields in both English and Arabic
- Use formal Modern Standard Arabic (فصحى) for Arabic content
- Arabic fields must use _ar suffix, English fields use _en suffix
- Arabic text must be culturally appropriate for Saudi government context
- Maintain consistent terminology across both languages`,

  ARABIC_ONLY: `LANGUAGE: Generate in Arabic only using formal Modern Standard Arabic (فصحى).
Content must be culturally appropriate for Saudi government context.`,

  ENGLISH_ONLY: `LANGUAGE: Generate in English only.
Use formal, professional language appropriate for government documentation.`
};

/**
 * Get system prompt with context.
 *
 * Backward compatibility:
 * - New/Preferred: getSystemPrompt('FULL'|'COMPACT'|'INNOVATION'|'HOUSING'|'MUNICIPAL', boolean)
 * - Legacy: getSystemPrompt('persona_key', 'extra instructions...')
 * - Legacy: getSystemPrompt('persona_key', 'extra instructions...', false)
 */
export function getSystemPrompt(contextOrPersona = 'FULL', arg2 = true, arg3) {
  const contextOrPersonaStr = typeof contextOrPersona === 'string' ? contextOrPersona : 'FULL';

  const isContextKey = Object.prototype.hasOwnProperty.call(SAUDI_CONTEXT_RAW, contextOrPersonaStr);
  const contextType = isContextKey ? contextOrPersonaStr : 'FULL';
  const persona = isContextKey ? '' : contextOrPersonaStr;

  let bilingual = true;
  let extraInstructions = '';

  if (typeof arg2 === 'boolean') {
    bilingual = arg2;
    extraInstructions = typeof arg3 === 'string' ? arg3 : '';
  } else if (typeof arg2 === 'string') {
    extraInstructions = arg2;
    bilingual = typeof arg3 === 'boolean' ? arg3 : true;
  } else {
    bilingual = true;
    extraInstructions = typeof arg3 === 'string' ? arg3 : '';
  }

  const context = SAUDI_CONTEXT_RAW[contextType] || SAUDI_CONTEXT_RAW.FULL;
  const langReq = bilingual ? LANGUAGE_REQUIREMENTS.BILINGUAL : '';

  const personaBlock = persona
    ? `\nROLE/FOCUS:\n- ${persona}\n`
    : '';

  const extraBlock = extraInstructions?.trim()
    ? `\nADDITIONAL INSTRUCTIONS:\n${extraInstructions.trim()}\n`
    : '';

  return `You are an expert AI assistant for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${context}

${langReq}${personaBlock}${extraBlock}
Provide accurate, actionable, and contextually relevant responses aligned with Saudi Vision 2030 objectives.`;
}

/**
 * Build prompt with Saudi context
 * @param {string} basePrompt - The base prompt text
 * @param {Object} options - Configuration options
 * @returns {string} Complete prompt with context
 */
export function buildPromptWithContext(basePrompt, options = {}) {
  const {
    contextType = 'FULL',
    includeBilingual = true,
    includeInnovation = false,
    additionalContext = ''
  } = options;

  let contextBlock = SAUDI_CONTEXT_RAW[contextType] || SAUDI_CONTEXT_RAW.FULL;

  if (includeInnovation && contextType !== 'INNOVATION') {
    contextBlock += '\n\n' + SAUDI_CONTEXT_RAW.INNOVATION;
  }

  const langBlock = includeBilingual ? LANGUAGE_REQUIREMENTS.BILINGUAL : '';

  return `CONTEXT:
${contextBlock}

${langBlock}

${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n\n` : ''}REQUEST:
${basePrompt}`;
}

export default SAUDI_CONTEXT;

