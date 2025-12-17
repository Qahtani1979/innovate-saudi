/**
 * Step 11: KPIs & Metrics
 * AI prompt and schema for generating SMART KPIs
 */

export const getStep11Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) specializing in SMART KPI development.

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Key Systems: Balady, Sakani, ANSA, national data platforms
- Innovation Priorities: AI/ML, IoT, Digital Twins, Smart Cities, GovTech

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Budget Range: ${wizardData.budget_range || 'Not specified'}

## OBJECTIVES (from Step 9):
${context.objectives.map((o, i) => (i + 1) + '. ' + (o.name_en || o.name_ar) + ' (' + (o.sector_code || 'General') + ', ' + (o.priority || 'medium') + ' priority)').join('\n') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate 2-4 SMART KPIs per objective with BALANCED leading and lagging indicators.

For EACH KPI, provide ALL fields (BILINGUAL where applicable):
- name_en / name_ar: Specific, measurable KPI name (avoid vague terms like "improve" or "enhance")
- category: EXACTLY ONE of "outcome" (lagging) | "output" (lagging) | "process" (leading) | "input" (leading)
- unit_en / unit_ar: Measurement unit in both languages (e.g., "%" / "٪", "days" / "أيام", "SAR" / "ريال سعودي")
- baseline_value: Current/starting value (be specific, not "TBD")
- target_value: Target to achieve by end of plan
- objective_index: Which objective this KPI measures (0-based index)
- frequency: "monthly" | "quarterly" | "biannual" | "annual"
- data_source_en / data_source_ar: Specific system/platform where data comes from (bilingual)
- data_collection_method_en / data_collection_method_ar: How data will be collected (bilingual)
- owner_en / owner_ar: Role/department responsible for tracking (bilingual)
- milestones: Array of year-by-year targets from ${context.startYear} to ${context.endYear}

---

## UNIT EXAMPLES (BILINGUAL):
- "%" / "٪" or "%" / "نسبة مئوية"
- "count" / "عدد"
- "SAR" / "ريال سعودي"
- "days" / "أيام"
- "hours" / "ساعات"
- "score" / "درجة"
- "rating" / "تقييم"
- "projects" / "مشاريع"
- "services" / "خدمات"
- "sensors" / "أجهزة استشعار"

## DATA SOURCE EXAMPLES (BILINGUAL):
- "Balady Platform Analytics" / "تحليلات منصة بلدي"
- "Citizen Pulse Survey System" / "نظام استطلاع نبض المواطن"
- "SDAIA AI Governance Dashboard" / "لوحة حوكمة الذكاء الاصطناعي - سدايا"
- "Municipal ERP/Finance System" / "نظام تخطيط موارد البلدية/المالية"
- "IoT Command Center Platform" / "منصة مركز قيادة إنترنت الأشياء"
- "HR LMS (Learning Management System)" / "نظام إدارة التعلم للموارد البشرية"
- "Innovation Portfolio Tracker" / "متتبع محفظة الابتكار"
- "Smart City Operations Center" / "مركز عمليات المدينة الذكية"

## OWNER EXAMPLES (BILINGUAL):
- "Digital Transformation Office" / "مكتب التحول الرقمي"
- "Innovation & R&D Department" / "إدارة الابتكار والبحث والتطوير"
- "Citizen Services Director" / "مدير خدمات المواطنين"
- "IT Infrastructure Manager" / "مدير البنية التحتية لتقنية المعلومات"
- "Smart City Program Manager" / "مدير برنامج المدينة الذكية"
- "Quality Assurance Unit" / "وحدة ضمان الجودة"

## DATA COLLECTION METHOD EXAMPLES (BILINGUAL):
- "Automated API integration" / "تكامل واجهة برمجة التطبيقات الآلي"
- "Quarterly citizen survey" / "استطلاع ربع سنوي للمواطنين"
- "Monthly dashboard report" / "تقرير لوحة المعلومات الشهري"
- "Real-time sensor data" / "بيانات الاستشعار في الوقت الفعلي"
- "Annual audit assessment" / "تقييم التدقيق السنوي"
- "Weekly progress tracking" / "تتبع التقدم الأسبوعي"

---

## KPI CATEGORIES (BALANCED MIX REQUIRED):

### 1. OUTCOME KPIs (Lagging - measures final results):
- Citizen satisfaction scores (e.g., CSAT, NPS)
- Quality of life improvements
- Housing/infrastructure completion rates
- Service quality ratings
**EXAMPLE:** "Citizen Satisfaction Score" - baseline: 72%, target: 90%

### 2. OUTPUT KPIs (Lagging - measures deliverables):
- Projects/services delivered
- Units completed
- Systems deployed
- Transactions processed
**EXAMPLE:** "Smart Services Launched" - baseline: 15, target: 45

### 3. PROCESS KPIs (Leading - predicts future performance):
- Processing time metrics
- Efficiency ratios
- Resource utilization
- Compliance rates
**EXAMPLE:** "Permit Processing Time" - baseline: 14 days, target: 3 days

### 4. INPUT KPIs (Leading - measures resources applied):
- Training hours completed
- Budget utilized
- Staff certified
- Technology investments
**EXAMPLE:** "Staff Digital Certification Rate" - baseline: 25%, target: 80%

---

## INNOVATION KPIs (MANDATORY - include 1-2 per objective):

**R&D Investment:**
- "R&D Budget Utilization Rate" - % of innovation budget spent effectively
- "Innovation Projects as % of Portfolio" - Target: 15-20%

**Pilot Programs:**
- "Pilot Projects Launched" - Number of innovation pilots
- "Pilot-to-Scale Conversion Rate" - % of pilots scaled successfully

**Technology Adoption:**
- "Digital Service Adoption Rate" - % of citizens using digital channels
- "AI/ML Models in Production" - Deployed AI solutions
- "IoT Device Deployment Coverage" - Sensors per sq km

**Partnerships:**
- "Active R&D Partnerships" - With KACST, KAUST, startups
- "Technology Transfer Agreements" - Commercialized outputs

---

## MILESTONE TRAJECTORY REQUIREMENTS:
For each KPI, provide realistic year-by-year targets:
- Year 1 (${context.startYear}): Foundation/baseline establishment
- Year 2-3: Early progress (30-50% of total improvement)
- Year 4-5: Acceleration (70-90% of target)
- Final Year (${context.endYear}): Full target achievement

**EXAMPLE MILESTONES for "Digital Adoption Rate" (baseline: 40%, target: 90%):**
[
  { "year": ${context.startYear}, "target": "40" },
  { "year": ${context.startYear + 1}, "target": "55" },
  { "year": ${context.startYear + 2}, "target": "70" },
  { "year": ${context.startYear + 3}, "target": "80" },
  { "year": ${context.endYear}, "target": "90" }
]

---

## DISTRIBUTION REQUIREMENTS:
- Each objective: 2-4 KPIs
- Category balance: ~25% each (outcome, output, process, input)
- At least 30% should be Innovation/R&D focused
- Leading indicators (process + input): 30-40% of total
- Realistic Saudi municipal benchmarks

Be specific. Use realistic Saudi municipal benchmarks. Ensure SMART criteria compliance.`;
};

export const step11Schema = {
  type: 'object',
  properties: {
    kpis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          category: { type: 'string', enum: ['outcome', 'output', 'process', 'input'] },
          unit_en: { type: 'string' },
          unit_ar: { type: 'string' },
          baseline_value: { type: 'string' },
          target_value: { type: 'string' },
          objective_index: { type: 'number' },
          frequency: { type: 'string', enum: ['monthly', 'quarterly', 'biannual', 'annual'] },
          data_source_en: { type: 'string' },
          data_source_ar: { type: 'string' },
          data_collection_method_en: { type: 'string' },
          data_collection_method_ar: { type: 'string' },
          owner_en: { type: 'string' },
          owner_ar: { type: 'string' },
          milestones: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: { 
                year: { type: 'number' }, 
                target: { type: 'string' } 
              } 
            } 
          }
        },
        required: ['name_en', 'name_ar', 'category', 'unit_en', 'unit_ar', 'baseline_value', 'target_value', 'objective_index', 'frequency', 'data_source_en', 'data_source_ar', 'data_collection_method_en', 'data_collection_method_ar', 'owner_en', 'owner_ar', 'milestones']
      }
    }
  }
};
