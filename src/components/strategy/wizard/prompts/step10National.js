/**
 * Step 10: National Alignment
 * AI prompt and schema for generating national framework alignments
 */

export const getStep10Prompt = (context, wizardData) => {
  // Build objectives list with names for AI context
  const objectivesList = (wizardData.objectives || []).map((o, i) => ({
    index: i,
    name_en: o.name_en || o.name_ar || `Objective ${i + 1}`,
    name_ar: o.name_ar || o.name_en || `هدف ${i + 1}`,
    sector_code: o.sector_code || 'General',
    priority: o.priority || 'medium'
  }));

  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation & R&D alignment with national frameworks.

## MoMAH NATIONAL ALIGNMENT CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities, Fiscal Balance
- National Innovation Strategy: KACST coordination, SDAIA AI strategy, MCIT digital transformation
- R&D National Frameworks: National Science & Technology Policy, Innovation Ecosystem Strategy
- Key Agencies: Vision Realization Programs, SDAIA, KACST, MCIT, Ministry of Economy & Planning

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'AI_ML, IOT, DIGITAL_TWINS'}
- Vision 2030 Programs Selected: ${(wizardData.vision_2030_programs || []).join(', ') || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}

## OBJECTIVES TO ALIGN (from Step 9):
${objectivesList.map(o => `- Index ${o.index}: "${o.name_en}" / "${o.name_ar}" (Sector: ${o.sector_code}, Priority: ${o.priority})`).join('\n') || 'No objectives defined yet'}

---

## REQUIREMENTS:
Generate national alignment mappings for each objective to Vision 2030 and Innovation frameworks.

For EACH alignment, you MUST provide ALL of these fields (BILINGUAL):
- objective_index: The index of the objective (0-based integer matching the list above)
- objective_name_en: The exact name of the objective in English (copy from objectives list above)
- objective_name_ar: The exact name of the objective in Arabic (copy from objectives list above)
- goal_code: Vision 2030 program code (e.g., "QOL", "HSG", "NTP", "TRC", "INN")
- target_code: Specific target code within the program (e.g., "QOL_1", "HSG_2", "TRC_3")
- innovation_alignment_en: How this supports national innovation goals in English (1-2 sentences)
- innovation_alignment_ar: How this supports national innovation goals in Arabic (1-2 sentences, formal فصحى)

### VISION 2030 GOAL CODES AND TARGETS:

**Quality of Life Program (QOL) - برنامج جودة الحياة:**
- QOL_1: Improve livability of Saudi cities / تحسين جودة الحياة في المدن السعودية
- QOL_2: Enhance environmental sustainability / تعزيز الاستدامة البيئية
- QOL_3: Develop cultural and entertainment options / تطوير الخيارات الثقافية والترفيهية
- QOL_4: Promote sports and healthy lifestyles / تعزيز الرياضة وأنماط الحياة الصحية

**Housing Program (HSG) - برنامج الإسكان:**
- HSG_1: Increase home ownership to 70% / زيادة نسبة تملك المساكن إلى 70%
- HSG_2: Improve housing quality and affordability / تحسين جودة الإسكان والقدرة على تحمل التكاليف
- HSG_3: Develop real estate sector / تطوير القطاع العقاري

**National Transformation Program (NTP) - برنامج التحول الوطني:**
- NTP_1: Government effectiveness and efficiency / فعالية وكفاءة الحكومة
- NTP_2: Digital transformation of government services / التحول الرقمي للخدمات الحكومية
- NTP_3: Private sector enablement / تمكين القطاع الخاص
- NTP_4: Labor market development / تطوير سوق العمل

**Thriving Cities Program (TRC) - برنامج المدن المزدهرة:**
- TRC_1: Urban development and planning / التطوير والتخطيط العمراني
- TRC_2: Municipal infrastructure improvement / تحسين البنية التحتية البلدية
- TRC_3: Smart city implementation / تطبيق المدن الذكية
- TRC_4: Sustainable urban development / التنمية الحضرية المستدامة

**National Innovation & Technology (INN) - الابتكار والتقنية الوطنية:**
- INN_1: R&D investment and capability building / الاستثمار في البحث والتطوير وبناء القدرات
- INN_2: Technology adoption and digital transformation / تبني التقنية والتحول الرقمي
- INN_3: AI and emerging technology deployment (SDAIA) / نشر الذكاء الاصطناعي والتقنيات الناشئة
- INN_4: Innovation ecosystem and partnerships / منظومة الابتكار والشراكات
- INN_5: Tech talent development and Saudization / تطوير الكفاءات التقنية والتوطين

### ALIGNMENT REQUIREMENTS:
1. Each objective MUST have at least 1-3 alignments to relevant targets
2. Innovation/technology objectives MUST align to INN codes
3. Each alignment needs BILINGUAL innovation_alignment statements
4. The goal_code must be extracted from target_code (e.g., "QOL" from "QOL_1")
5. Prioritize alignments that strengthen R&D and technology adoption

### INNOVATION ALIGNMENT EXAMPLES (BILINGUAL):
- EN: "Supports national AI strategy through SDAIA-compliant municipal AI deployment"
  AR: "يدعم الاستراتيجية الوطنية للذكاء الاصطناعي من خلال نشر حلول الذكاء الاصطناعي البلدية المتوافقة مع سدايا"

- EN: "Advances R&D ecosystem through partnership with KACST research programs"
  AR: "يعزز منظومة البحث والتطوير من خلال الشراكة مع برامج مدينة الملك عبدالعزيز للعلوم والتقنية"

- EN: "Enables technology transfer from pilot programs to scaled municipal solutions"
  AR: "يمكّن نقل التقنية من البرامج التجريبية إلى الحلول البلدية الموسعة"

Return alignments as an array under the "alignments" key with ALL required fields for each alignment.`;
};

export const step10Schema = {
  type: 'object',
  properties: {
    alignments: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          objective_index: { type: 'number', description: 'Zero-based index of the objective' }, 
          objective_name_en: { type: 'string', description: 'Name of the objective in English' },
          objective_name_ar: { type: 'string', description: 'Name of the objective in Arabic' },
          goal_code: { type: 'string', description: 'Vision 2030 program code (QOL, HSG, NTP, TRC, INN)' }, 
          target_code: { type: 'string', description: 'Specific target code (e.g., QOL_1, TRC_3)' }, 
          innovation_alignment_en: { type: 'string', description: 'How this supports national innovation goals (English)' },
          innovation_alignment_ar: { type: 'string', description: 'How this supports national innovation goals (Arabic)' }
        },
        required: ['objective_index', 'objective_name_en', 'objective_name_ar', 'goal_code', 'target_code', 'innovation_alignment_en', 'innovation_alignment_ar']
      } 
    }
  },
  required: ['alignments']
};
