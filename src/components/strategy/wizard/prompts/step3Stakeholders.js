/**
 * Step 3: Stakeholder Analysis
 * AI prompt and schema for generating stakeholder mapping
 */

export const getStep3Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Vision 2030 Programs: Quality of Life, Housing (70% ownership), NTP, Thriving Cities
- Innovation Ecosystem: KACST, TAQNIA, Misk Foundation, Monsha'at, Research Chair Programs
- Tech & Innovation Partners: SDAIA, MCIT, STC, stc solutions, Elm, Thiqah, Saudi Venture Capital
- Universities & Research: KSU, KFUPM, KAUST, PNU, KAU, Effat, Alfaisal
- Innovation Hubs: NEOM, The Line, Oxagon, KAFD Innovation District, Riyadh Technopolis
- Incubators/Accelerators: Badir, Flat6Labs, 500 Global, Wadi Makkah
- Key Systems: Balady Platform, Sakani, ANSA, Absher, Etimad

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}${context.planNameAr ? ` (${context.planNameAr})` : ''}
- Vision: ${context.vision || 'Not yet defined'}
- Mission: ${context.mission || 'Not yet defined'}
- Target Sectors: ${context.sectors.length > 0 ? context.sectors.join(', ') : 'General municipal services'}
- Strategic Themes: ${context.themes.length > 0 ? context.themes.join(', ') : 'General improvement'}
- Focus Technologies: ${context.technologies.length > 0 ? context.technologies.join(', ') : 'General technology'}
- Vision 2030 Programs: ${context.vision2030Programs.length > 0 ? context.vision2030Programs.join(', ') : 'General Vision 2030'}
- Target Regions: ${context.regions.length > 0 ? context.regions.join(', ') : 'Kingdom-wide'}
- Timeline: ${context.startYear} - ${context.endYear}
- Budget Range: ${context.budgetRange || 'To be determined'}

## EXISTING QUICK STAKEHOLDERS:
${context.stakeholders.length > 0 ? context.stakeholders.map(s => `- ${s.name_en || s}${s.name_ar ? ` (${s.name_ar})` : ''}`).join('\n') : '- None specified yet'}

## DISCOVERY INPUTS:
- Key Challenges: ${context.keyChallenges || 'General challenges'}
- Available Resources: ${context.availableResources || 'Standard resources'}
- Initial Constraints: ${context.initialConstraints || 'Standard constraints'}

---

## REQUIREMENTS:

### PART 1: STAKEHOLDERS (Generate 14-18 stakeholders)

Each stakeholder MUST have ALL fields (bilingual):
- name_en / name_ar: Full organization/role name
- type: GOVERNMENT | PRIVATE | ACADEMIC | NGO | COMMUNITY | INTERNATIONAL | INTERNAL
- power: low | medium | high
- interest: low | medium | high
- engagement_level: inform | consult | involve | collaborate | empower
- influence_strategy_en / influence_strategy_ar: 2-3 sentences on engagement approach
- contact_person_en / contact_person_ar: Suggested role/title for primary contact
- notes_en / notes_ar: Timing, special considerations, relationship notes

**MANDATORY DISTRIBUTION:**

**GOVERNMENT (4-5 stakeholders):**
- Vision Realization Programs (VRO, NTP PMO)
- Regulatory bodies (MoMAH, CITC, PDPL Authority)
- Funding agencies (MOF, PIF, NDF)
- Sister ministries (MCIT, MHRSD, MOT)

**INNOVATION & R&D (3-4 stakeholders) - CRITICAL:**
- Research institutions: KACST, KAUST Research Office, university research centers
- Innovation agencies: SDAIA, Monsha'at Innovation, Research Products Development Company (RPDC)
- Tech incubators: Badir Program, Wadi Makkah Ventures, KAUST Innovation
- National labs: National Center for AI, Cyber Security Center

**PRIVATE SECTOR & TECH (3-4 stakeholders):**
- Technology vendors for focus technologies (${context.technologies.join(', ') || 'AI, IoT, etc.'})
- System integrators: Elm, Thiqah, stc solutions
- PropTech/GovTech startups relevant to sectors
- International tech partners (if applicable)

**ACADEMIC (2-3 stakeholders):**
- Leading universities: KSU, KFUPM, KAUST for research partnerships
- Research chairs aligned with plan focus
- Student innovation programs (Misk, Monsha'at Youth)

**COMMUNITY & INTERNAL (2-3 stakeholders):**
- Citizen groups, professional associations
- Municipal departments, Amanat innovation units
- Chamber of Commerce, industry associations

**POWER/INTEREST MATRIX:**
- 3-4 High Power + High Interest (Manage Closely)
- 3-4 High Power + Low/Medium Interest (Keep Satisfied)
- 3-4 Low/Medium Power + High Interest (Keep Informed)
- 3-4 Low Power + Low Interest (Monitor)

---

### PART 2: STAKEHOLDER ENGAGEMENT PLAN (Bilingual)

Generate comprehensive engagement plan:
- stakeholder_engagement_plan_en: 3-5 paragraphs in English
- stakeholder_engagement_plan_ar: 3-5 paragraphs in Arabic (formal فصحى)

Must include:
1. Overall engagement philosophy with emphasis on innovation co-creation
2. Communication cadence for different stakeholder types
3. Key engagement milestones (${context.startYear}-${context.endYear})
4. Innovation partnership mechanisms (R&D collaborations, pilot partnerships, knowledge transfer)
5. Feedback mechanisms and resistance mitigation

---

## INNOVATION STAKEHOLDER EXAMPLES:

**R&D Partners:**
- "King Abdulaziz City for Science and Technology (KACST)" - National R&D coordination, technology transfer
- "KAUST Innovation & Economic Development" - Deep tech research, startup ecosystem
- "SDAIA National Center for AI" - AI research, ethics, governance

**Tech Innovation:**
- "Badir Program for Technology Incubators" - Startup incubation, municipal tech solutions
- "Monsha'at SME Innovation Programs" - SME tech adoption, innovation funding
- "Saudi Venture Capital Company" - Innovation investment, growth capital

**Academic Research:**
- "KSU Smart Cities Research Chair" - Urban innovation research
- "KFUPM Center for Environment & Water" - Sustainability research
- "Research Products Development Company (RPDC)" - University research commercialization

Be specific to plan context. Reference actual Saudi innovation ecosystem entities.`;
};

export const step3Schema = {
  type: 'object',
  properties: {
    stakeholders: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          type: { type: 'string' }, 
          power: { type: 'string' }, 
          interest: { type: 'string' }, 
          engagement_level: { type: 'string' }, 
          influence_strategy_en: { type: 'string' },
          influence_strategy_ar: { type: 'string' },
          contact_person_en: { type: 'string' },
          contact_person_ar: { type: 'string' },
          notes_en: { type: 'string' },
          notes_ar: { type: 'string' }
        } 
      } 
    },
    stakeholder_engagement_plan_en: { type: 'string' },
    stakeholder_engagement_plan_ar: { type: 'string' }
  }
};
