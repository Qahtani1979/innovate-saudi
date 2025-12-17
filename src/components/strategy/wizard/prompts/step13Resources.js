/**
 * Step 13: Resource Planning
 * AI prompt and schema for generating resource requirements
 */

export const getStep13Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Saudization Requirements: MHRSD quotas for technical positions
- Training Partners: MCIT Digital Academy, SDAIA AI certifications

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Timeline: ${context.startYear}-${context.endYear} (${(wizardData.end_year || 2030) - (wizardData.start_year || 2025)} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## OBJECTIVES (from Step 9):
${context.objectives.map((o, i) => (i + 1) + '. ' + (o.name_en || o.name_ar)).join('\n') || 'Not defined yet'}

## ACTION PLANS (from Step 12):
${(wizardData.action_plans || []).slice(0, 5).map(a => '- ' + (a.name_en || a.name_ar) + ' (' + a.type + ')').join('\n') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate comprehensive resource plan with INNOVATION/R&D RESOURCES.

Provide 4 resource categories:

### 1. HR REQUIREMENTS (8-12 items)
For EACH, provide (bilingual):
- name_en / name_ar: Role/position title
- quantity: Number needed
- cost: Annual cost in SAR
- notes_en / notes_ar: Skills required, hiring timeline

**MUST include Innovation/R&D roles:**
- Data Scientists / ML Engineers
- AI/ML Specialists (SDAIA-certified)
- IoT/Smart City Engineers
- Innovation Program Managers
- R&D Project Coordinators
- Digital Transformation Specialists
- UX Researchers
- Technology Architects

**Standard roles:**
- Project Managers
- Business Analysts
- Software Developers
- System Administrators
- Change Management Specialists

### 2. TECHNOLOGY REQUIREMENTS (8-12 items)
For EACH, provide (bilingual):
- name_en / name_ar: Technology/system name
- quantity: Licenses, units, or capacity
- cost: Total cost in SAR
- notes_en / notes_ar: Vendor, integration needs

**MUST include Innovation/R&D tech:**
- AI/ML Development Platform (Azure ML, AWS SageMaker, Google Vertex)
- Data Analytics Platform (Power BI, Tableau, custom dashboards)
- IoT Platform & Sensors (for smart city pilots)
- Digital Twin Software (for urban simulation)
- Innovation Management System (idea tracking, portfolio)
- Collaboration Tools (for R&D partnerships)
- API Management Platform (for Balady integration)
- Cloud Infrastructure (for AI workloads)

**Standard tech:**
- Enterprise Software Licenses
- Hardware & Devices
- Network Infrastructure
- Security Solutions

### 3. INFRASTRUCTURE REQUIREMENTS (4-8 items)
For EACH, provide (bilingual):
- name_en / name_ar: Infrastructure item
- quantity: Size/capacity
- cost: Capital cost in SAR
- notes_en / notes_ar: Location, timeline

**MUST include Innovation infrastructure:**
- Innovation Lab / Testbed Facility
- Data Center Capacity (for AI/analytics)
- IoT Network Infrastructure (LoRaWAN, 5G)
- Smart City Command Center
- Collaboration Space for R&D teams

**Standard infrastructure:**
- Office Space
- Training Facilities
- Equipment & Vehicles

### 4. BUDGET ALLOCATION (6-10 line items)
For EACH, provide (bilingual):
- name_en / name_ar: Budget category
- quantity: "1" (or number of years)
- cost: Total allocation in SAR
- notes_en / notes_ar: Breakdown, conditions

**MUST include Innovation budget:**
- R&D Investment Fund (3-5% of total budget)
- Innovation Pilots Budget
- Research Partnership Funding (KACST, universities)
- Technology POC Budget
- Innovation Training & Certifications
- Startup/VC Co-investment Fund

**Standard budget:**
- Personnel Costs
- Technology & Licenses
- Infrastructure & Capital
- Operations & Maintenance
- Contingency Reserve (10-15%)

---

## INNOVATION RESOURCE EXAMPLES:

**HR - Innovation Team:**
- "Chief Innovation Officer" - SAR 600,000/year - Lead innovation strategy
- "AI/ML Engineer (SDAIA Certified)" - SAR 400,000/year - 3 needed for ML projects
- "Smart City Solutions Architect" - SAR 450,000/year - IoT & digital twin expertise

**Technology - R&D Platforms:**
- "Azure AI + ML Studio" - SAR 500,000/year - Cloud AI development
- "Innovation Portfolio Management System" - SAR 200,000 - Track pilots & R&D
- "IoT Platform (ThingsBoard/Azure IoT)" - SAR 300,000/year - Smart city sensors

**Infrastructure - Innovation Spaces:**
- "Municipal Innovation Lab" - SAR 2,000,000 - Testbed facility in Riyadh
- "Smart City Command Center" - SAR 5,000,000 - Urban operations center

**Budget - R&D Allocation:**
- "Annual R&D Fund" - SAR 10,000,000/year - Innovation pilots and research
- "KACST Partnership Fund" - SAR 3,000,000 - Co-funded research projects
- "GovTech Accelerator Investment" - SAR 2,000,000 - Startup collaborations

---

## DISTRIBUTION REQUIREMENTS:
- At least 25% of HR should be innovation/tech roles
- At least 30% of technology budget for R&D platforms
- Explicit R&D budget line (3-5% of total)
- Saudization compliance for all positions

Be specific. Use realistic Saudi salary benchmarks and vendor pricing.`;
};

export const step13Schema = {
  type: 'object',
  properties: {
    hr_requirements: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          quantity: { type: 'string' }, 
          cost: { type: 'string' }, 
          notes_en: { type: 'string' }, 
          notes_ar: { type: 'string' } 
        } 
      } 
    },
    technology_requirements: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          quantity: { type: 'string' }, 
          cost: { type: 'string' }, 
          notes_en: { type: 'string' }, 
          notes_ar: { type: 'string' } 
        } 
      } 
    },
    infrastructure_requirements: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          quantity: { type: 'string' }, 
          cost: { type: 'string' }, 
          notes_en: { type: 'string' }, 
          notes_ar: { type: 'string' } 
        } 
      } 
    },
    budget_allocation: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          quantity: { type: 'string' }, 
          cost: { type: 'string' }, 
          notes_en: { type: 'string' }, 
          notes_ar: { type: 'string' } 
        } 
      } 
    }
  }
};
