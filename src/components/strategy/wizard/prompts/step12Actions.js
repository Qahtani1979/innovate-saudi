/**
 * Step 12: Action Plans
 * AI prompt and schema for generating action plans and initiatives
 */

export const getStep12Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, Badir, university research
- Tech Partners: Elm, Thiqah, stc solutions, international vendors
- Key Systems: Balady, Sakani, ANSA, Baladiya platforms

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## OBJECTIVES (from Step 9):
${context.objectives.map((o, i) => (i + 1) + '. ' + (o.name_en || o.name_ar) + ' (' + (o.sector_code || 'General') + ')').join('\n') || 'Not defined yet'}

## KEY RISKS (from Step 7):
${(wizardData.risks || []).filter(r => r.impact === 'high').slice(0, 3).map(r => '- ' + (r.title_en || r.title_ar)).join('\n') || 'Not assessed'}

---

## REQUIREMENTS:
Generate 2-4 action plans per objective, including INNOVATION/R&D ACTIONS.

For EACH action plan, provide ALL fields (BILINGUAL where applicable):
- name_en / name_ar: Clear action name
- description_en / description_ar: Detailed description (2-3 sentences)
- objective_index: Which objective this supports (0-based index)
- type: "challenge" | "pilot" | "program" | "campaign" | "event" | "policy" | "rd_call" | "partnership" | "living_lab"
- priority: "high" | "medium" | "low"
- budget_estimate: Estimated cost in SAR
- start_date: Planned start (YYYY-MM format)
- end_date: Planned end (YYYY-MM format)
- owner_en / owner_ar: Role/department responsible (bilingual, e.g., "Digital Transformation Office" / "مكتب التحول الرقمي")
- deliverables: Array of objects with text_en and text_ar (e.g., [{"text_en": "Pilot report", "text_ar": "تقرير تجريبي"}])
- dependencies: Array of objects with text_en and text_ar (e.g., [{"text_en": "Budget approval", "text_ar": "موافقة الميزانية"}])
- innovation_impact: 1-4 scale (4 = transformational innovation)
- success_criteria_en / success_criteria_ar: How success will be measured
- should_create_entity: Boolean - whether to create as formal entity in system

---

## ACTION TYPES (MUST include mix):

### INITIATIVES (Strategic):
- Large-scale transformation programs
- Multi-year strategic efforts
- Cross-department coordination

### PROGRAMS (Ongoing):
- Continuous improvement efforts
- Capacity building programs
- Service enhancement programs

### PROJECTS (Defined scope):
- Specific deliverable focus
- Clear start/end dates
- Measurable outputs

### PILOTS (CRITICAL - include for innovation objectives):
- **Technology Pilots**: Test new tech before full deployment
- **Process Pilots**: Trial new workflows in limited scope
- **Service Pilots**: Beta test citizen services
- **AI/ML Pilots**: Validate ML models with real data

### R&D PROJECTS (MANDATORY - include 1-2 per technology-focused objective):
- **Research Partnerships**: Collaborative R&D with KACST, KAUST, universities
- **Technology Assessments**: Evaluate emerging tech for municipal use
- **Proof of Concepts**: Validate technical feasibility
- **Innovation Labs**: Establish testbed environments
- **Knowledge Transfer**: Import expertise from research partners

---

## INNOVATION ACTION EXAMPLES:

**AI/ML Projects:**
- "AI-Powered Permit Processing POC" - Partner with SDAIA for automated permit review
- "Predictive Maintenance ML Model" - R&D with KFUPM for infrastructure monitoring

**IoT/Smart City:**
- "Smart Parking Pilot" - Deploy sensors in 3 districts, measure adoption
- "Environmental Monitoring Network" - IoT air/water quality sensors

**Digital Transformation:**
- "Balady Integration Sprint" - API development for legacy system connectivity
- "Citizen App 2.0 Beta" - UX research and pilot with citizen focus groups

**Innovation Capacity:**
- "Municipal Innovation Lab Setup" - Establish dedicated innovation space
- "GovTech Accelerator Partnership" - Collaborate with Badir/Flat6Labs
- "Staff Innovation Challenge" - Internal hackathon program

**Research Partnerships:**
- "Smart Cities Research Chair" - Co-fund with KSU/KFUPM
- "KAUST Urban Analytics MOU" - Data sharing for urban research
- "International Best Practice Study" - Benchmark against global smart cities

---

## DISTRIBUTION REQUIREMENTS:
- Each objective: 2-4 actions
- At least 25% should be pilots or R&D projects
- Mix of quick wins (6 months) and strategic initiatives (2+ years)
- Budget estimates should be realistic for Saudi municipal context

Be specific. Reference actual Saudi systems, agencies, and partners.`;
};

export const step12Schema = {
  type: 'object',
  properties: {
    action_plans: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          objective_index: { type: 'number' },
          type: { 
            type: 'string',
            enum: ['challenge', 'pilot', 'program', 'campaign', 'event', 'policy', 'rd_call', 'partnership', 'living_lab']
          },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          budget_estimate: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          owner_en: { type: 'string' },
          owner_ar: { type: 'string' },
          deliverables: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                text_en: { type: 'string' },
                text_ar: { type: 'string' }
              },
              required: ['text_en', 'text_ar']
            } 
          },
          dependencies: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                text_en: { type: 'string' },
                text_ar: { type: 'string' }
              },
              required: ['text_en', 'text_ar']
            } 
          },
          innovation_impact: { type: 'number', minimum: 1, maximum: 4 },
          success_criteria_en: { type: 'string' },
          success_criteria_ar: { type: 'string' },
          should_create_entity: { type: 'boolean' }
        },
        required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'objective_index', 'type', 'priority', 'budget_estimate', 'start_date', 'end_date', 'owner_en', 'owner_ar', 'deliverables', 'dependencies', 'innovation_impact', 'success_criteria_en', 'success_criteria_ar', 'should_create_entity']
      }
    }
  }
};
