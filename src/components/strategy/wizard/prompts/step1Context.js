/**
 * Step 1: Context & Discovery
 * AI prompt and schema for generating strategic plan context
 */

export const getStep1Prompt = (context) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation & R&D.

## MoMAH INNOVATION CONTEXT:
- National Innovation Ecosystem: KACST, SDAIA, MCIT Digital Gov, Monsha'at, Badir Program
- University R&D Partners: KAUST, KFUPM, KSU research chairs, university innovation centers
- Tech Infrastructure: National Data Management Office, CITC, cloud platforms, 5G networks
- Innovation Programs: Regulatory sandboxes, GovTech initiatives, AI Strategy, National Industrial Strategy
- R&D Funding: SIDF, Monsha'at, Saudi Venture Capital, PIF technology investments

Generate comprehensive context and discovery content for this Saudi municipal strategic plan:
Plan Name (English): ${context.planName}

Based on the plan name, suggest appropriate values for ALL of the following with STRONG INNOVATION/R&D FOCUS:

1. ARABIC TITLE:
- name_ar: Arabic translation of the plan title

2. VISION & MISSION (in both English and Arabic):
- vision_en, vision_ar: MUST include innovation/technology leadership element
- mission_en, mission_ar: MUST reference R&D, emerging technologies, or innovation
- description_en, description_ar: Include how innovation drives the strategy

**VISION EXAMPLES with Innovation:**
- "To be a pioneering municipality leveraging AI and emerging technologies for sustainable, citizen-centric urban development"
- "To transform municipal services through innovation, R&D partnerships, and smart city solutions"

**MISSION EXAMPLES with Innovation:**
- "Drive municipal excellence through technology adoption, R&D collaboration, and continuous innovation"
- "Deliver world-class services by fostering an innovation ecosystem with KACST, SDAIA, and university partners"

3. DURATION & RESOURCES:
- start_year: Suggested start year (2024-2027)
- end_year: Suggested end year (2027-2035)
- budget_range: One of: "<10M", "10-50M", "50-100M", "100-500M", ">500M"

4. TARGET SECTORS (select relevant codes - MUST include SMART_CITIES or DIGITAL_SERVICES):
Codes: URBAN_PLANNING, HOUSING, INFRASTRUCTURE, ENVIRONMENT, SMART_CITIES, DIGITAL_SERVICES, CITIZEN_SERVICES, RURAL_DEVELOPMENT, PUBLIC_SPACES, WATER_RESOURCES, TRANSPORTATION, HERITAGE
- target_sectors: Array of sector codes (MUST include at least one innovation-related sector)

5. STRATEGIC THEMES (select relevant codes - MUST include INNOVATION and DIGITAL_TRANSFORMATION):
Codes: DIGITAL_TRANSFORMATION, SUSTAINABILITY, CITIZEN_EXPERIENCE, INNOVATION, GOVERNANCE, ECONOMIC_ENABLEMENT, QUALITY_OF_LIFE, OPERATIONAL_EXCELLENCE
- strategic_themes: Array of theme codes (MANDATORY: include INNOVATION and DIGITAL_TRANSFORMATION)

6. FOCUS TECHNOLOGIES (select 3-5 relevant codes - CRITICAL for Innovation):
Codes: AI_ML, IOT, BLOCKCHAIN, DIGITAL_TWINS, DRONES, 5G_6G, ROBOTICS, AR_VR, BIM, CLEANTECH
- focus_technologies: Array of technology codes (MUST select at least 3 emerging technologies)

7. VISION 2030 PROGRAMS (select relevant codes):
Codes: QUALITY_OF_LIFE, HOUSING, NTP, THRIVING_CITIES, FISCAL_BALANCE, PRIVATIZATION, DARP
- vision_2030_programs: Array of program codes

8. TARGET REGIONS (select relevant codes or leave empty for kingdom-wide):
Codes: RIYADH, MAKKAH, MADINAH, EASTERN, ASIR, TABUK, HAIL, NORTHERN_BORDERS, JAZAN, NAJRAN, AL_BAHA, AL_JOUF, QASSIM
- target_regions: Array of region codes

9. KEY STAKEHOLDERS (bilingual - MUST include Innovation stakeholders):
- quick_stakeholders: Array of 8-12 objects with name_en and name_ar
**MANDATORY Innovation Stakeholders (include at least 3):**
- KACST (King Abdulaziz City for Science & Technology)
- SDAIA (Saudi Data & AI Authority)
- MCIT Digital Government
- University R&D Partner (KAUST, KFUPM, KSU)
- Technology Vendor Partner
- Innovation/Tech Incubator (Badir, Monsha'at)

10. DISCOVERY INPUTS (all bilingual - with Innovation focus):
- key_challenges_en, key_challenges_ar: MUST mention technology adoption, innovation capacity, or digital transformation challenges
- available_resources_en, available_resources_ar: MUST mention R&D partnerships, tech infrastructure, innovation funding
- initial_constraints_en, initial_constraints_ar: MUST mention innovation-related constraints (talent, technology, regulatory)

**KEY CHALLENGES EXAMPLES:**
- "Limited AI/ML expertise within municipal workforce; need for R&D partnership acceleration"
- "Legacy systems hindering smart city integration; technology vendor dependency"

**AVAILABLE RESOURCES EXAMPLES:**
- "Access to SDAIA AI frameworks; KACST research partnerships; Balady digital platform"
- "MCIT digital training programs; PPP opportunities with tech vendors; innovation lab space"

**CONSTRAINTS EXAMPLES:**
- "Saudization requirements for tech roles; PDPL compliance timeline; limited pilot testing infrastructure"

Use formal language appropriate for Saudi government documents with strong Innovation/R&D emphasis.`;
};

export const step1Schema = {
  type: 'object',
  required: [
    'name_ar',
    'vision_en',
    'vision_ar',
    'mission_en',
    'mission_ar',
    'description_en',
    'description_ar',
    'start_year',
    'end_year',
    'budget_range',
    'target_sectors',
    'strategic_themes',
    'focus_technologies',
    'vision_2030_programs',
    'target_regions',
    'quick_stakeholders',
    'key_challenges_en',
    'key_challenges_ar',
    'available_resources_en',
    'available_resources_ar',
    'initial_constraints_en',
    'initial_constraints_ar'
  ],
  properties: {
    name_ar: { type: 'string' },
    vision_en: { type: 'string' },
    vision_ar: { type: 'string' },
    mission_en: { type: 'string' },
    mission_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    start_year: { type: 'integer' },
    end_year: { type: 'integer' },
    budget_range: { type: 'string' },
    target_sectors: { type: 'array', items: { type: 'string' } },
    strategic_themes: { type: 'array', items: { type: 'string' } },
    focus_technologies: { type: 'array', items: { type: 'string' } },
    vision_2030_programs: { type: 'array', items: { type: 'string' } },
    target_regions: { type: 'array', items: { type: 'string' } },
    quick_stakeholders: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' } 
        } 
      } 
    },
    key_challenges_en: { type: 'string' },
    key_challenges_ar: { type: 'string' },
    available_resources_en: { type: 'string' },
    available_resources_ar: { type: 'string' },
    initial_constraints_en: { type: 'string' },
    initial_constraints_ar: { type: 'string' }
  }
};
