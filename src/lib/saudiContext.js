/**
 * Shared Saudi Arabia / MoMAH Context for AI Prompts
 * Centralized context to ensure consistent AI outputs across all components
 * @version 1.0.0
 */

/**
 * Comprehensive Saudi context for AI prompts
 * Used across all AI-powered components for consistency
 */
export const SAUDI_CONTEXT = {
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
- Investment: PPP, concessions, asset commercialization`
};

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
 * Get system prompt with context
 * @param {string} contextType - 'FULL' | 'COMPACT' | 'INNOVATION' | 'HOUSING' | 'MUNICIPAL'
 * @param {boolean} bilingual - Whether to include bilingual requirements
 * @returns {string} System prompt
 */
export function getSystemPrompt(contextType = 'FULL', bilingual = true) {
  const context = SAUDI_CONTEXT[contextType] || SAUDI_CONTEXT.FULL;
  const langReq = bilingual ? LANGUAGE_REQUIREMENTS.BILINGUAL : '';
  
  return `You are an expert AI assistant for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${context}

${langReq}

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

  let contextBlock = SAUDI_CONTEXT[contextType] || SAUDI_CONTEXT.FULL;
  
  if (includeInnovation && contextType !== 'INNOVATION') {
    contextBlock += '\n\n' + SAUDI_CONTEXT.INNOVATION;
  }

  const langBlock = includeBilingual ? LANGUAGE_REQUIREMENTS.BILINGUAL : '';

  return `CONTEXT:
${contextBlock}

${langBlock}

${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n\n` : ''}REQUEST:
${basePrompt}`;
}

export default SAUDI_CONTEXT;
