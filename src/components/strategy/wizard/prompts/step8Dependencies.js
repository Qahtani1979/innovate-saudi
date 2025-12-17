/**
 * Step 8: Dependencies, Constraints & Assumptions
 * AI prompt and schema for generating dependencies analysis
 */

export const getStep8Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Major Cities: Riyadh, Jeddah, Makkah, Madinah, Dammam, Tabuk, Abha
- Vision 2030 Alignment: Quality of Life Program, Housing Program (70% ownership), National Transformation Program
- Innovation Priorities: AI/ML, IoT, Digital Twins, Blockchain, Smart City Technologies, GovTech, PropTech, CleanTech
- Key Frameworks: National Spatial Strategy, National Housing Strategy, Smart City National Framework
- Key Systems: Balady Platform, Sakani Housing Program, Momra Services, Baladiya Systems
- Sister Ministries: MCIT, MHRSD, MOT, MODON, Royal Commission

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## KEY STAKEHOLDERS (from Step 3):
${(wizardData.stakeholders || []).slice(0, 5).map(s => `- ${s.name_en || s.name_ar} (${s.type})`).join('\n') || 'Not defined yet'}

## IDENTIFIED RISKS (from Step 7):
${(wizardData.risks || []).slice(0, 5).map(r => `- ${r.title_en || r.title_ar} (${r.category})`).join('\n') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate THREE types of items: dependencies, constraints, and assumptions.

---

### PART 1: DEPENDENCIES (8-12 items)

For EACH dependency, provide ALL fields in BOTH English and Arabic:
- name_en / name_ar: Short dependency name (5-10 words)
- type: One of "internal" | "external" | "technical" | "resource"
- source: Where/who the dependency comes from (department, system, stakeholder)
- target: What/who depends on it (initiative, objective, system)
- criticality: "low" | "medium" | "high"

**DEPENDENCY TYPE DISTRIBUTION:**
- internal: 2-3 (cross-department coordination, Amanat approvals, municipal council decisions)
- external: 2-3 (MCIT, MoMAH, SDAIA, third-party vendors, Vision Realization Programs)
- technical: 2-3 (Balady integration, GIS platforms, IoT infrastructure, National Data Governance)
- resource: 2-3 (budget from MOF, specialized staff, Saudization requirements)

**MoMAH-SPECIFIC DEPENDENCY EXAMPLES:**
- INTERNAL: "Amanat Finance Directorate Budget Cycle Approval" - Source: Finance → Target: All capital projects
- EXTERNAL: "SDAIA AI Governance Compliance Certification" - Source: SDAIA → Target: AI-powered services
- EXTERNAL: "Vision 2030 VRP Milestone Alignment" - Source: Vision Realization Office → Target: Strategic initiatives
- TECHNICAL: "Balady National Platform API Integration" - Source: Balady System → Target: E-services
- TECHNICAL: "National Address System (ANSA) Integration" - Source: Saudi Post → Target: Service delivery
- RESOURCE: "MCIT Digital Capacity Building Program Support" - Source: MCIT → Target: Staff training

---

### PART 2: CONSTRAINTS (6-8 items)

For EACH constraint, provide ALL fields in BOTH English and Arabic:
- description_en / description_ar: Clear description of the limitation (1-2 sentences)
- type: One of "budget" | "time" | "resource" | "regulatory" | "technical"
- impact: "low" | "medium" | "high"
- mitigation_en / mitigation_ar: How to work within this constraint (1-2 sentences)

**CONSTRAINT TYPE DISTRIBUTION:**
- budget: 1-2 (MOF allocation cycles, municipal revenue limits, SAR procurement thresholds)
- time: 1-2 (Vision 2030 milestones 2025/2030, NTP deadlines, Quality of Life targets)
- resource: 1-2 (Saudization requirements, skill gaps in emerging tech, MCIT certification needs)
- regulatory: 1-2 (PDPL data protection, CITC telecom regulations, MoMAH building codes)
- technical: 1-2 (legacy Baladiya systems, interoperability with national platforms)

**MoMAH-SPECIFIC CONSTRAINT EXAMPLES:**
- BUDGET: "Annual CAPEX allocation limited by MOF fiscal year cycle and SAR ${wizardData.budget_range || '50M'} ceiling"
- TIME: "All smart city initiatives must demonstrate measurable outcomes by Vision 2030 interim review (2025)"
- REGULATORY: "Digital services must comply with PDPL and SDAIA AI Ethics Principles"
- REGULATORY: "Construction permits must align with updated Saudi Building Code (SBC) requirements"
- TECHNICAL: "Must maintain backward compatibility with existing Balady and Momra legacy systems"
- RESOURCE: "Saudization quota of 70%+ for technical positions per MHRSD requirements"

---

### PART 3: ASSUMPTIONS (6-10 items)

For EACH assumption, provide ALL fields in BOTH English and Arabic:
- statement_en / statement_ar: Clear assumption statement (1 sentence starting with "We assume that...")
- category: One of "operational" | "financial" | "market" | "stakeholder" | "regulatory"
- confidence: "low" | "medium" | "high"
- validation_method_en / validation_method_ar: How to verify this assumption (1 sentence)

**ASSUMPTION CATEGORY DISTRIBUTION:**
- operational: 2-3 (Amanat capacity, municipal staff capabilities, inter-department coordination)
- financial: 1-2 (MOF allocations, Vision Realization Program funding, PPP viability)
- market: 1-2 (citizen digital adoption, private sector participation, technology maturity)
- stakeholder: 1-2 (Royal Court support, ministry coordination, citizen engagement)
- regulatory: 1-2 (policy continuity, regulatory sandbox availability, compliance timelines)

**MoMAH-SPECIFIC ASSUMPTION EXAMPLES:**
- OPERATIONAL: "We assume that Amanat staff can achieve MCIT digital competency certification within 12 months"
- FINANCIAL: "We assume that Vision Realization Program funding will continue through 2030"
- FINANCIAL: "We assume that PPP models will be approved for smart city infrastructure projects"
- MARKET: "We assume that citizen adoption of e-municipal services will reach 80% by 2027"
- STAKEHOLDER: "We assume that SDAIA will provide technical support for AI implementation"
- REGULATORY: "We assume that CITC will approve 5G spectrum allocation for municipal IoT by Q2 2025"

---

Be highly specific to MoMAH's mandate, Vision 2030 alignment, and the Saudi municipal ecosystem. Reference actual systems (Balady, Sakani, ANSA), agencies (SDAIA, MCIT, MoMAH), and frameworks. Avoid generic corporate language.`;
};

export const step8Schema = {
  type: 'object',
  properties: {
    dependencies: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, type: { type: 'string' }, source: { type: 'string' }, target: { type: 'string' }, criticality: { type: 'string' } } } },
    constraints: { type: 'array', items: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, type: { type: 'string' }, impact: { type: 'string' }, mitigation_en: { type: 'string' }, mitigation_ar: { type: 'string' } } } },
    assumptions: { type: 'array', items: { type: 'object', properties: { statement_en: { type: 'string' }, statement_ar: { type: 'string' }, category: { type: 'string' }, confidence: { type: 'string' }, validation_method_en: { type: 'string' }, validation_method_ar: { type: 'string' } } } }
  }
};
