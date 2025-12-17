/**
 * Step 4: PESTEL Analysis
 * AI prompt and schema for generating PESTEL environmental analysis
 */

export const getStep4Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT Digital Government, Monsha'at
- R&D Infrastructure: KAUST, KFUPM, national research centers, innovation hubs
- Key Initiatives: Saudi Green Initiative, National Industrial Strategy, Digital Government Strategy

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Sectors: ${context.sectors.join(', ')}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}

---

## REQUIREMENTS:
Generate factors for ALL 6 PESTEL categories. Each category MUST have 3-4 factors.

For EACH factor, provide ALL fields (bilingual):
- factor_en / factor_ar: Factor name/description
- impact: "low" | "medium" | "high"
- trend: "declining" | "stable" | "growing"
- timeframe: "short_term" | "medium_term" | "long_term"
- implications_en / implications_ar: Strategic implications (1-2 sentences)

---

## CATEGORY GUIDANCE WITH INNOVATION/R&D FOCUS:

### 1. POLITICAL:
- Vision 2030 governance and VRP oversight
- Municipal reform agenda and decentralization
- Innovation policy support (regulatory sandboxes, innovation zones)
- Public-private partnership frameworks
- R&D funding prioritization in national budgets

### 2. ECONOMIC:
- Economic diversification beyond oil (NIDLP targets)
- PIF and sovereign wealth investment in innovation
- PPP opportunities for municipal innovation
- Venture capital and startup ecosystem growth
- R&D tax incentives and innovation funding programs
- Budget allocation for digital transformation

### 3. SOCIAL:
- Youth population and digital natives (70% under 35)
- Rising citizen expectations for smart services
- Innovation culture and entrepreneurship mindset
- Talent availability for emerging technologies
- Public acceptance of AI and automation
- Research talent retention and attraction

### 4. TECHNOLOGICAL (CRITICAL - INCLUDE R&D):
- AI/ML maturity and SDAIA governance framework
- IoT infrastructure readiness (5G, LoRaWAN)
- Cloud adoption and data center availability
- Digital twins and simulation capabilities
- R&D infrastructure (labs, testbeds, innovation centers)
- Technology transfer mechanisms (KACST, universities)
- Open innovation platforms and APIs
- Cybersecurity capabilities and threats

### 5. ENVIRONMENTAL:
- Saudi Green Initiative commitments
- Circular economy and waste innovation
- Water technology and desalination R&D
- Clean energy transition and solar adoption
- Climate adaptation technologies
- Green building standards and innovation

### 6. LEGAL:
- PDPL data protection compliance
- AI ethics and governance regulations (SDAIA)
- Intellectual property and patent frameworks
- Cybersecurity law requirements
- Procurement regulations for innovation
- Open data and government transparency mandates

---

## DISTRIBUTION REQUIREMENTS:
- Each category: mix of high, medium, low impacts
- Each category: variety of trends (declining, stable, growing)
- Each category: mix of timeframes
- TECHNOLOGICAL category: At least 2 factors explicitly about R&D/innovation infrastructure

Be specific to Saudi Arabia. Reference actual programs, agencies, and frameworks.`;
};

export const step4Schema = {
  type: 'object',
  properties: {
    political: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
    economic: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
    social: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
    technological: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
    environmental: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
    legal: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } }
  }
};
