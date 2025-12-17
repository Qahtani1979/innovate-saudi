/**
 * Step 15: Governance Structure
 * AI prompt and schema for generating governance framework
 */

export const getStep15Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation Governance.

## MoMAH GOVERNANCE CONTEXT:
- Executive: Minister, Deputy Ministers, Assistant Deputy Ministers
- Regional: 13 Regional Amanats, 285+ Municipalities
- Vision 2030: Vision Realization Programs (VRP), Performance Management
- Innovation Ecosystem: SDAIA, KACST, MCIT Digital Gov coordination

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Timeline: ${wizardData.start_year}-${wizardData.end_year}
- Objectives: ${(wizardData.objectives || []).length} defined
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## KEY STAKEHOLDERS (from Step 3):
${(wizardData.stakeholders || []).filter(s => s.power === 'high').slice(0, 5).map(s => '- ' + (s.name_en || s.name_ar) + ' (' + s.type + ')').join('\n') || 'Not defined'}

---

## REQUIREMENTS:
Generate comprehensive governance structure with INNOVATION OVERSIGHT.

### 1. COMMITTEES (Generate 4-6 committees)
For EACH committee, provide ALL these bilingual fields:
- name_en: Committee name in English
- name_ar: Committee name in Arabic
- type: "steering" | "executive" | "technical" | "advisory" | "innovation"
- chair_role_en: Position of committee chair in English
- chair_role_ar: Position of committee chair in Arabic
- members: Array of member roles (4-8 members as strings)
- meeting_frequency: "weekly" | "bi-weekly" | "monthly" | "quarterly"
- responsibilities_en: Key responsibilities in English (3-5 bullet points)
- responsibilities_ar: Key responsibilities in Arabic (3-5 bullet points)

**MANDATORY: Include INNOVATION COMMITTEE:**
- "Innovation & R&D Steering Committee" - Oversees pilot portfolio, R&D partnerships, technology adoption decisions
- Chair: Chief Innovation Officer or Deputy Minister for Digital
- Members: MUST include SDAIA liaison, KACST representative, university research partner, tech vendor representative
- Responsibilities: Pilot approval, R&D budget allocation, innovation KPI tracking, technology roadmap oversight

**Other required committees:**
- Executive Steering Committee (overall strategy)
- Technical Implementation Committee
- Stakeholder Advisory Committee
- Risk & Compliance Committee (include AI ethics, data governance)

### 2. ROLES (Generate 8-12 key roles)
For EACH role, provide ALL these bilingual fields:
- title_en: Role title in English
- title_ar: Role title in Arabic
- type: "executive" | "management" | "specialist" | "coordinator"
- department_en: Department/unit in English
- department_ar: Department/unit in Arabic
- key_responsibilities_en: 3-5 responsibilities in English
- key_responsibilities_ar: 3-5 responsibilities in Arabic
- reports_to_en: Reporting line in English
- reports_to_ar: Reporting line in Arabic

**MANDATORY INNOVATION ROLES:**
- "Chief Innovation Officer" / "رئيس الابتكار" - Leads innovation strategy, R&D partnerships, pilot portfolio
- "Innovation Program Manager" / "مدير برنامج الابتكار" - Manages pilot execution, tracks innovation KPIs
- "AI/Data Governance Lead" / "قائد حوكمة الذكاء الاصطناعي والبيانات" - Ensures SDAIA compliance, data ethics, AI governance
- "R&D Partnership Coordinator" / "منسق شراكات البحث والتطوير" - Manages KACST/university relationships
- "Technology Transfer Officer" / "مسؤول نقل التقنية" - Handles IP, commercialization, knowledge transfer

### 3. DASHBOARDS (Generate 3-5 dashboards)
For EACH dashboard, provide ALL these bilingual fields:
- name_en: Dashboard name in English
- name_ar: Dashboard name in Arabic
- type: "executive" | "operational" | "innovation" | "kpi" | "risk"
- description_en: Dashboard description in English
- description_ar: Dashboard description in Arabic
- key_metrics_en: Key metrics displayed in English
- key_metrics_ar: Key metrics displayed in Arabic
- update_frequency: "daily" | "weekly" | "monthly"
- audience_en: Target audience in English
- audience_ar: Target audience in Arabic

**MUST include Innovation Dashboard:**
- Monthly Innovation Dashboard: Pilot status, R&D metrics, technology adoption
- Innovation KPI Tracking: R&D ROI, partnership health, capability progress

### 4. RACI MATRIX (Generate 6-8 decision areas)
For EACH decision area, provide ALL these bilingual fields:
- area: Decision area code (strategic_decisions, budget_allocation, technology_adoption, pilot_approval, vendor_selection, rd_partnerships, hiring, policy_changes)
- responsible_en: Who does the work (in English)
- responsible_ar: Who does the work (in Arabic)
- accountable_en: Who is ultimately answerable (in English)
- accountable_ar: Who is ultimately answerable (in Arabic)
- consulted_en: Who provides input (in English)
- consulted_ar: Who provides input (in Arabic)
- informed_en: Who is kept updated (in English)
- informed_ar: Who is kept updated (in Arabic)

### 5. ESCALATION PATH (Generate 4-6 escalation levels as STRUCTURED OBJECTS)
For EACH escalation level, provide ALL these fields:
- level: Number (1-6) indicating escalation order
- role_en: Role/position title in English (e.g., "Project Manager")
- role_ar: Role/position title in Arabic (e.g., "مدير المشروع")
- timeframe_en: When to escalate in English (e.g., "Within 24 hours")
- timeframe_ar: When to escalate in Arabic (e.g., "خلال 24 ساعة")
- description_en: What triggers this escalation in English (e.g., "Initial issue handling and first response")
- description_ar: What triggers this escalation in Arabic (e.g., "المعالجة الأولية للمشكلة والاستجابة الأولى")

**EXAMPLE ESCALATION PATH (Return as array of objects with ALL fields):**
[
  { "level": 1, "role_en": "Project Manager", "role_ar": "مدير المشروع", "timeframe_en": "Within 24 hours", "timeframe_ar": "خلال 24 ساعة", "description_en": "Initial issue handling and first response", "description_ar": "المعالجة الأولية للمشكلة والاستجابة الأولى" },
  { "level": 2, "role_en": "Department Director", "role_ar": "مدير الإدارة", "timeframe_en": "Within 48 hours", "timeframe_ar": "خلال 48 ساعة", "description_en": "Unresolved operational issues requiring departmental decision", "description_ar": "المشاكل التشغيلية غير المحلولة التي تتطلب قراراً إدارياً" },
  { "level": 3, "role_en": "General Manager", "role_ar": "المدير العام", "timeframe_en": "Within 72 hours", "timeframe_ar": "خلال 72 ساعة", "description_en": "Cross-department issues or resource conflicts", "description_ar": "المشاكل بين الإدارات أو تعارض الموارد" },
  { "level": 4, "role_en": "Deputy Minister", "role_ar": "وكيل الوزارة", "timeframe_en": "Within 1 week", "timeframe_ar": "خلال أسبوع واحد", "description_en": "Strategic or policy issues requiring executive decision", "description_ar": "المسائل الاستراتيجية أو السياسية التي تتطلب قراراً تنفيذياً" },
  { "level": 5, "role_en": "Minister", "role_ar": "الوزير", "timeframe_en": "Within 2 weeks", "timeframe_ar": "خلال أسبوعين", "description_en": "Critical organizational matters with ministry-wide impact", "description_ar": "المسائل التنظيمية الحرجة ذات التأثير على مستوى الوزارة" }
]

---

## INNOVATION GOVERNANCE EXAMPLES:

**Innovation Committee:**
- "Innovation & Digital Transformation Committee"
- Chair: Assistant Deputy Minister for Innovation
- Members: CIO, SDAIA Liaison, KACST Rep, Innovation Manager, Tech Vendor Rep, University Research Partner
- Frequency: Monthly
- Responsibilities:
  * Approve/reject pilot proposals and R&D projects
  * Allocate innovation budget and track ROI
  * Review technology adoption decisions
  * Oversee AI/ML governance and ethics compliance
  * Monitor innovation KPIs and partnership health

**Innovation Roles:**
- Chief Innovation Officer: Reports to Deputy Minister, leads innovation strategy
- Innovation Program Manager: Reports to CIO, manages pilot portfolio
- AI Ethics Officer: Reports to Chief Data Officer, ensures SDAIA compliance

Be specific to Saudi municipal governance context. Reference actual roles, agencies, and frameworks.`;
};

export const step15Schema = {
  type: 'object',
  properties: {
    committees: { 
      type: 'array', 
      items: { 
        type: 'object',
        required: ['name_en', 'name_ar', 'type', 'chair_role_en', 'chair_role_ar', 'responsibilities_en', 'responsibilities_ar'],
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          type: { type: 'string' },
          chair_role_en: { type: 'string' },
          chair_role_ar: { type: 'string' },
          meeting_frequency: { type: 'string' }, 
          responsibilities_en: { type: 'string' }, 
          responsibilities_ar: { type: 'string' }, 
          members: { type: 'array', items: { type: 'string' } } 
        } 
      } 
    },
    roles: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title_en', 'title_ar', 'type', 'department_en', 'department_ar', 'key_responsibilities_en', 'key_responsibilities_ar', 'reports_to_en', 'reports_to_ar'],
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          type: { type: 'string' },
          department_en: { type: 'string' },
          department_ar: { type: 'string' },
          key_responsibilities_en: { type: 'string' },
          key_responsibilities_ar: { type: 'string' },
          reports_to_en: { type: 'string' },
          reports_to_ar: { type: 'string' }
        }
      }
    },
    dashboards: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name_en', 'name_ar', 'type', 'description_en', 'description_ar', 'key_metrics_en', 'key_metrics_ar', 'audience_en', 'audience_ar'],
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          type: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          key_metrics_en: { type: 'string' },
          key_metrics_ar: { type: 'string' },
          update_frequency: { type: 'string' },
          audience_en: { type: 'string' },
          audience_ar: { type: 'string' }
        }
      }
    },
    raci_matrix: {
      type: 'array',
      items: {
        type: 'object',
        required: ['area', 'responsible_en', 'responsible_ar', 'accountable_en', 'accountable_ar', 'consulted_en', 'consulted_ar', 'informed_en', 'informed_ar'],
        properties: {
          area: { type: 'string' },
          responsible_en: { type: 'string' },
          responsible_ar: { type: 'string' },
          accountable_en: { type: 'string' },
          accountable_ar: { type: 'string' },
          consulted_en: { type: 'string' },
          consulted_ar: { type: 'string' },
          informed_en: { type: 'string' },
          informed_ar: { type: 'string' }
        }
      }
    },
    escalation_path: {
      type: 'array',
      items: {
        type: 'object',
        required: ['level', 'role_en', 'role_ar', 'timeframe_en', 'timeframe_ar', 'description_en', 'description_ar'],
        properties: {
          level: { type: 'number' },
          role_en: { type: 'string' },
          role_ar: { type: 'string' },
          timeframe_en: { type: 'string' },
          timeframe_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      }
    },
    reporting_frequency: { type: 'string' }
  }
};
