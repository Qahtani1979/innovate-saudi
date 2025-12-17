/**
 * Step 5: SWOT Analysis
 * AI prompt and schema for generating SWOT analysis
 */

export const getStep5Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university research centers
- R&D Infrastructure: KAUST, KFUPM, national labs, innovation hubs, tech incubators
- Digital Platforms: Balady, Sakani, ANSA, Absher integration

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Sectors: ${context.sectors.join(', ')}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}
- Stakeholder Count: ${(wizardData.stakeholders || []).length}

## PESTEL INSIGHTS (from Step 4):
- Key Political: ${(wizardData.pestel?.political || []).slice(0, 2).map(f => f.factor_en).join('; ') || 'Not analyzed'}
- Key Technological: ${(wizardData.pestel?.technological || []).slice(0, 2).map(f => f.factor_en).join('; ') || 'Not analyzed'}

---

## REQUIREMENTS:
Generate items for ALL 4 SWOT categories. Each category MUST have 5-7 items.

For EACH item, provide (bilingual):
- text_en / text_ar: SWOT item description (1-2 sentences)
- priority: "low" | "medium" | "high"

---

## CATEGORY GUIDANCE WITH INNOVATION/R&D FOCUS:

### STRENGTHS (Internal positive - include 1-2 innovation-related):
**Standard:**
- Government support and Vision 2030 alignment
- Digital infrastructure (Balady, national platforms)
- Financial resources and funding access
- Strategic geographic advantages
- Existing partnerships

**Innovation-Specific (MUST include):**
- Access to national R&D infrastructure (KACST, KAUST, KFUPM)
- Established innovation partnerships (SDAIA, tech vendors)
- Digital transformation experience and capabilities
- Innovation budget allocation or R&D funding access
- Pilot program experience and testbed availability
- Technology talent pool and training programs

### WEAKNESSES (Internal negative - include 1-2 innovation-related):
**Standard:**
- Capacity or skill gaps
- Legacy systems and processes
- Resource constraints
- Coordination challenges
- Data management issues

**Innovation-Specific (MUST include):**
- Limited R&D experience or innovation capacity
- Shortage of specialized tech talent (AI, IoT, data science)
- Weak innovation culture or risk aversion
- Insufficient pilot/experimentation infrastructure
- Technology vendor dependency
- Knowledge transfer gaps from research to operations

### OPPORTUNITIES (External positive - include 2-3 innovation-related):
**Standard:**
- Vision 2030 funding and programs
- Regional economic development
- Demographic dividend (youth population)
- International partnerships

**Innovation-Specific (MUST include):**
- National innovation funding (SIDF, Monsha'at, VC ecosystem)
- University research partnerships and knowledge transfer
- GovTech/PropTech startup ecosystem growth
- SDAIA AI adoption support and frameworks
- Innovation sandbox and regulatory flexibility
- Technology transfer from NEOM, megaprojects
- Open innovation platforms and hackathons
- International R&D collaboration opportunities

### THREATS (External negative - include 1-2 innovation-related):
**Standard:**
- Economic volatility
- Regulatory changes
- Environmental challenges
- Public expectation management

**Innovation-Specific (MUST include):**
- Rapid technology obsolescence
- Cybersecurity threats and data breaches
- AI ethics and governance risks
- Innovation talent competition (brain drain)
- Technology vendor lock-in risks
- R&D project failure and sunk costs
- Disruptive technology from competitors

---

## DISTRIBUTION REQUIREMENTS:
- Each category: mix of high, medium, low priorities
- At least 2 HIGH priority items per category
- EXPLICIT innovation/R&D items in each category as specified above

Be specific to Saudi municipal context. Reference actual systems, programs, and ecosystem players.`;
};

export const step5Schema = {
  type: 'object',
  properties: {
    strengths: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } },
    weaknesses: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } },
    opportunities: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } },
    threats: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } }
  }
};
