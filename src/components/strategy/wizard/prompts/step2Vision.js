/**
 * Step 2: Vision, Mission & Pillars
 * AI prompt and schema for generating core values and strategic pillars
 */

export const getStep2Prompt = (context, wizardData) => {
  return `You are generating Core Values and Strategic Pillars for a Saudi municipal strategic plan with strong Innovation & R&D focus.

## MoMAH INNOVATION CONTEXT:
- National Innovation Ecosystem: KACST, SDAIA, Monsha'at, Badir, MCIT Digital Gov
- University R&D: KAUST, KFUPM, KSU research chairs, KACST-funded programs
- Tech Partners: STC, Elm, Thiqah, stc solutions, international tech vendors
- Innovation Hubs: NEOM, KAFD Innovation District, Riyadh Technopolis, Wadi Makkah

=== PLAN CONTEXT ===
Plan Name: ${context.planName}${context.planNameAr ? ' (' + context.planNameAr + ')' : ''}
Vision Statement: ${context.vision || 'Not yet defined'}
Mission Statement: ${context.mission || 'Not yet defined'}
Description: ${context.description || 'Not yet defined'}

=== STRATEGIC FOCUS (CRITICAL - USE THESE) ===
Target Sectors: ${context.sectors.length > 0 ? context.sectors.join(', ') : 'General municipal services'}
Strategic Themes: ${context.themes.length > 0 ? context.themes.join(', ') : 'General improvement'}
Focus Technologies: ${context.technologies.length > 0 ? context.technologies.join(', ') : 'General technology adoption'}
Vision 2030 Programs: ${context.vision2030Programs.length > 0 ? context.vision2030Programs.join(', ') : 'General Vision 2030 alignment'}
Target Regions: ${context.regions.length > 0 ? context.regions.join(', ') : 'Kingdom-wide'}

=== DURATION & RESOURCES ===
Timeline: ${context.startYear} - ${context.endYear} (${context.endYear - context.startYear} years)
Budget Range: ${context.budgetRange || 'To be determined'}

=== KEY STAKEHOLDERS ===
${context.stakeholders.length > 0 ? context.stakeholders.map(s => '- ' + (s.name_en || s) + (s.name_ar ? ' (' + s.name_ar + ')' : '')).join('\n') : '- Municipal leadership and citizens'}

=== DISCOVERY INPUTS ===
Key Challenges: ${context.keyChallenges || 'General municipal challenges'}
Available Resources: ${context.availableResources || 'Standard municipal resources'}
Initial Constraints: ${context.initialConstraints || 'Standard constraints'}

=== GENERATION REQUIREMENTS ===

**1. CORE VALUES (Generate exactly 6-7 values)**
Each value MUST have: name_en, name_ar, description_en, description_ar

Requirements:
- Values MUST reflect Saudi government principles and Vision 2030
- At least 2 values should directly relate to the TARGET SECTORS specified
- At least 1 value should relate to the FOCUS TECHNOLOGIES
- **MANDATORY: At least 1 value MUST focus on INNOVATION/R&D:**
  - "Innovation Excellence" - Commitment to continuous R&D, pilot experimentation, and technology leadership
  - "Research & Evidence-Based Decision Making" - Data-driven approach using research partnerships
  - "Technology Leadership" - Pioneering adoption of emerging technologies
- Values should address the KEY CHALLENGES mentioned
- Each description should be 2-3 sentences explaining how this value guides the organization

**2. STRATEGIC PILLARS (Generate exactly 5-6 pillars)**
Each pillar MUST have: name_en, name_ar, description_en, description_ar

CRITICAL REQUIREMENTS:
- Each pillar MUST directly correspond to one or more TARGET SECTORS or STRATEGIC THEMES
- **MANDATORY: At least 1 pillar MUST be INNOVATION/R&D focused:**
  - "Innovation & Research Ecosystem" - Building R&D partnerships, innovation labs, pilot programs
  - "Technology Transformation & Digital Innovation" - AI/ML, IoT, smart city technology adoption
  - "Knowledge & Capability Building" - Research partnerships, tech talent development, innovation culture
- Pillars MUST explicitly incorporate the FOCUS TECHNOLOGIES where relevant
- Pillars MUST align with the specified VISION 2030 PROGRAMS
- Pillars should be designed to address the KEY CHALLENGES
- Pillars should be achievable within the BUDGET RANGE and TIMELINE
- Each description should be 3-4 sentences explaining:
  * What this pillar covers
  * Which sectors/technologies it addresses
  * **How it leverages R&D partnerships and innovation ecosystem**
  * Expected outcomes aligned with Vision 2030

Example innovation pillar:
- "Smart City Innovation & R&D" - Establish municipal innovation lab, partner with KACST/KAUST for applied research, launch IoT pilots, build data analytics capabilities for evidence-based urban planning

Use formal Arabic (فصحى) for Arabic content. Be specific, not generic.`;
};

export const step2Schema = {
  type: 'object',
  properties: {
    core_values: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          description_en: { type: 'string' }, 
          description_ar: { type: 'string' } 
        } 
      } 
    },
    strategic_pillars: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          description_en: { type: 'string' }, 
          description_ar: { type: 'string' } 
        } 
      } 
    }
  }
};
