/**
 * Step 9: Strategic Objectives
 * AI prompt and schema for generating strategic objectives
 */

export const getStep9Prompt = (context, wizardData) => {
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
- Plan Name: ${context.planName}${context.planNameAr ? ` (${context.planNameAr})` : ''}
- Vision: ${context.vision || 'Not specified'}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Description: ${context.description || 'Not specified'}
- Target Sectors: ${context.sectors.length > 0 ? context.sectors.join(', ') : 'General municipal services'}
- Strategic Themes: ${context.themes.length > 0 ? context.themes.join(', ') : 'General improvement'}
- Timeline: ${context.startYear} - ${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Vision 2030 Programs: ${(wizardData.vision_2030_programs || []).join(', ') || 'Not specified'}
- Target Regions: ${(wizardData.target_regions || []).join(', ') || 'Kingdom-wide'}

## STRATEGIC PILLARS (from Step 2):
${(wizardData.strategic_pillars || []).map((p, i) => `${i + 1}. ${p.name_en || p.name_ar}`).join('\n') || 'Not defined yet'}

## KEY STAKEHOLDERS (from Step 3):
${(wizardData.stakeholders || []).filter(s => s.power === 'high').slice(0, 5).map(s => `- ${s.name_en || s.name_ar} (${s.type})`).join('\n') || 'Not defined yet'}

## SWOT SUMMARY (from Step 5):
- Key Strengths: ${(wizardData.swot?.strengths || []).filter(s => s.priority === 'high').slice(0, 2).map(s => s.text_en).join('; ') || 'Not analyzed yet'}
- Key Opportunities: ${(wizardData.swot?.opportunities || []).filter(o => o.priority === 'high').slice(0, 2).map(o => o.text_en).join('; ') || 'Not analyzed yet'}
- Key Challenges: ${(wizardData.swot?.weaknesses || []).filter(w => w.priority === 'high').slice(0, 2).map(w => w.text_en).join('; ') || 'Not analyzed yet'}

## KEY RISKS (from Step 7):
${(wizardData.risks || []).filter(r => r.impact === 'high' || r.likelihood === 'high').slice(0, 3).map(r => `- ${r.title_en || r.title_ar} (${r.category})`).join('\n') || 'Not assessed yet'}

## DISCOVERY INPUTS (from Step 1):
- Key Challenges: ${wizardData.key_challenges_en || 'Not specified'}
- Available Resources: ${wizardData.available_resources_en || 'Not specified'}
- Initial Constraints: ${wizardData.initial_constraints_en || 'Not specified'}

---

## REQUIREMENTS:
Generate 6-10 Strategic Objectives for this municipal strategic plan.

Each objective MUST have ALL fields in BOTH English and Arabic:
- name_en / name_ar: Clear, action-oriented objective title (5-12 words)
- description_en / description_ar: Detailed description explaining the objective's scope, expected outcomes, and alignment (3-5 sentences)
- sector_code: EXACTLY ONE sector from (${context.sectors.join(' | ') || 'URBAN_PLANNING | HOUSING | INFRASTRUCTURE | ENVIRONMENT | SMART_CITIES | DIGITAL_SERVICES | CITIZEN_SERVICES | RURAL_DEVELOPMENT | PUBLIC_SPACES | WATER_RESOURCES | TRANSPORTATION | HERITAGE'})
- priority: "high" | "medium" | "low"

---

## CRITICAL: SINGLE-SECTOR FOCUS RULE

**EACH OBJECTIVE MUST BELONG TO EXACTLY ONE SECTOR:**
- DO NOT create objectives that span multiple sectors (e.g., "Improve housing AND transportation")
- DO NOT mix sector concerns in the same objective name or description
- If an initiative naturally spans sectors, create SEPARATE objectives for each sector
- The objective title, description, and outcomes must ALL relate to the SAME sector_code

**BAD EXAMPLES (AVOID):**
- ❌ "Integrate smart housing with urban transportation systems" (mixes HOUSING + TRANSPORTATION)
- ❌ "Develop sustainable infrastructure and environmental protection" (mixes INFRASTRUCTURE + ENVIRONMENT)
- ❌ "Digital transformation for citizen services and smart cities" (mixes DIGITAL_SERVICES + SMART_CITIES)

**GOOD EXAMPLES (FOLLOW):**
- ✅ "Achieve 95% digital service adoption on Balady platform" (DIGITAL_SERVICES only)
- ✅ "Develop 50,000 new housing units under Sakani program" (HOUSING only)
- ✅ "Deploy IoT sensors across 5 major city command centers" (SMART_CITIES only)
- ✅ "Reduce municipal carbon footprint by 30%" (ENVIRONMENT only)

---

## OBJECTIVE DESIGN PRINCIPLES:

**1. SMART Criteria:**
- Specific: Clear scope and boundaries within ONE sector
- Measurable: Quantifiable outcomes possible
- Achievable: Realistic within budget and timeline
- Relevant: Aligned with Vision 2030 and MoMAH mandate
- Time-bound: Achievable within ${context.endYear - context.startYear} years

**2. Alignment Requirements:**
- Each objective MUST directly support at least one Strategic Pillar
- Each objective MUST align with at least one Vision 2030 program
- Each objective MUST focus on EXACTLY ONE sector
- Objectives MUST collectively address the key challenges identified
- Objectives MUST leverage the focus technologies where relevant

**3. Distribution Requirements:**
- At least 2-3 objectives should be HIGH priority
- At least 2 objectives should be MEDIUM priority
- Maximum 1-2 objectives LOW priority
- Cover at least 4 different target sectors (via separate objectives)
- Balance between operational excellence and transformation goals

---

## MoMAH-SPECIFIC OBJECTIVE EXAMPLES:

**Digital Transformation & Smart Cities:**
- "Implement Integrated Smart City Command Center" - Deploy IoT-based urban management platform across major cities
- "Achieve 95% Digital Service Adoption" - Migrate all municipal services to Balady digital platform
- "Deploy AI-Powered Municipal Decision Support" - Implement SDAIA-compliant AI for urban planning

**Citizen Experience:**
- "Enhance Municipal Service Satisfaction to 85%+" - Improve citizen-facing services across all Amanats
- "Reduce Service Delivery Time by 50%" - Streamline permit and approval processes

**Infrastructure & Urban Development:**
- "Develop 50,000 Housing Units" - Support Sakani program housing targets in target regions
- "Achieve 100% ANSA Coverage" - Complete National Address integration for all properties
- "Upgrade Municipal Infrastructure in 5 Cities" - Modernize water, sewage, and roads

**Sustainability & Environment:**
- "Reduce Municipal Carbon Footprint by 30%" - Align with Saudi Green Initiative targets
- "Achieve Zero-Waste for 3 Major Cities" - Implement comprehensive waste management

**Governance & Capacity:**
- "Build Digital Competency Across 80% of Staff" - MCIT-certified training program
- "Establish Regional Innovation Hubs in 5 Regions" - Foster municipal innovation ecosystem

---

## CRITICAL GUIDELINES:

1. **Use Formal Arabic (فصحى)** for all Arabic content - appropriate for government documents
2. **Be Specific to Plan Context** - Reference the actual sectors, technologies, and programs selected
3. **Avoid Generic Language** - No vague objectives like "improve efficiency" without specifics
4. **Include Measurable Elements** - Even in descriptions, hint at how success will be measured
5. **Consider Dependencies** - Objectives should be achievable given the constraints identified
6. **Balance Ambition and Realism** - Stretch goals but achievable within timeline and budget

Return objectives as an array under the "objectives" key.`;
};

export const step9Schema = {
  type: 'object',
  properties: {
    objectives: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          description_en: { type: 'string' }, 
          description_ar: { type: 'string' }, 
          sector_code: { type: 'string' }, 
          priority: { type: 'string' } 
        } 
      } 
    }
  }
};
