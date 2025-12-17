/**
 * Step 17: Change Management
 * AI prompt and schema for generating change management plan
 */

export const getStep17Prompt = (context, wizardData) => {
  return `You are a change management expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation & Technology adoption change.

## MoMAH CHANGE CONTEXT:
- Workforce: Municipal staff across 13 regions, varying digital literacy
- Technology Changes: AI/ML adoption, IoT deployment, digital service transformation
- Cultural Factors: Government hierarchy, consensus-building, Saudization, Vision 2030 alignment
- Training Partners: MCIT, SDAIA, universities, tech vendors

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Timeline: ${wizardData.start_year}-${wizardData.end_year}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'AI_ML, IOT, DIGITAL_TWINS'}
- Objectives: ${(wizardData.objectives || []).length} defined

## KEY STAKEHOLDERS (from Step 3):
${(wizardData.stakeholders || []).filter(s => s.type === 'INTERNAL' || s.type === 'GOVERNMENT').slice(0, 5).map(s => '- ' + (s.name_en || s.name_ar)).join('\n') || 'Municipal leadership and staff'}

---

## REQUIREMENTS:
Generate comprehensive change management plan for INNOVATION/TECHNOLOGY adoption.

### PART 1: READINESS ASSESSMENT (Bilingual)
- readiness_assessment_en / readiness_assessment_ar: 3-4 paragraphs assessing:
  * Current digital maturity and innovation culture
  * Staff readiness for technology adoption (AI, IoT, etc.)
  * Leadership support for innovation initiatives
  * Infrastructure and resource readiness
  * Key readiness gaps and risks

**MUST address Innovation-specific readiness:**
- AI/ML literacy and data culture
- Pilot experimentation mindset vs. risk aversion
- Technology vendor collaboration experience
- R&D partnership engagement capability

### PART 2: CHANGE APPROACH (Bilingual)
- change_approach_en / change_approach_ar: 3-4 paragraphs describing:
  * Overall change philosophy (innovation-led transformation)
  * Phased approach aligned with pilot cycles
  * Leadership engagement and sponsorship model
  * Communication and engagement strategy
  * Quick wins and momentum building

**MUST include Innovation Change elements:**
- Innovation Champions program
- Pilot-first approach (test before scale)
- Learning from failure culture
- Technology adoption lifecycle management

### PART 3: RESISTANCE MANAGEMENT (Bilingual)
- resistance_management_en / resistance_management_ar: 3-4 paragraphs covering:
  * Expected resistance sources and causes
  * Specific strategies to address technology fears
  * Stakeholder-specific interventions
  * Escalation and support mechanisms

**MUST address Innovation-specific resistance:**
- Fear of AI/automation replacing jobs
- Skepticism about new technology effectiveness
- Comfort with legacy systems and processes
- Concerns about pilot failures and accountability
- Data privacy and AI ethics concerns

### PART 4: TRAINING PLAN (Generate 8-12 training programs)
For EACH training, provide:
- name_en / name_ar: Training program name
- type: "workshop" | "elearning" | "coaching" | "certification" | "onthejob" | "mentoring"
- category: "technical" | "leadership" | "process" | "soft" | "compliance" | "culture"
- target_audience_en / target_audience_ar: Who should attend
- duration_en / duration_ar: Length of training
- timeline_en / timeline_ar: When in the plan timeline
- priority: "critical" | "high" | "medium" | "low"

**MANDATORY Innovation Training Programs:**
- "AI/ML Foundations for Municipal Leaders" - Executive awareness (1 day)
- "Data Literacy & Analytics" - All staff (2-3 days)
- "Digital Tools Mastery" - Operational staff (1-2 days)
- "Innovation Champion Certification" - Selected change agents (5 days)
- "Pilot Program Management" - Project managers (3 days)
- "SDAIA AI Ethics & Governance" - Tech staff and managers (2 days)
- "Technology Vendor Collaboration" - Procurement and IT staff (1 day)
- "R&D Partnership Engagement" - Research liaisons (2 days)
- "Smart City Technologies Workshop" - Technical teams (3 days)
- "Design Thinking & Innovation Methods" - Cross-functional teams (2 days)

### PART 5: STAKEHOLDER IMPACTS (Generate 5-8 impact assessments)
For EACH stakeholder group, provide:
- group_en / group_ar: Stakeholder group name
- impact_level: "transformational" | "significant" | "moderate" | "minor" | "minimal"
- readiness: "ready" | "preparing" | "at_risk" | "not_ready"
- description_en / description_ar: How this group will be impacted
- support_needs_en / support_needs_ar: What support they need

### PART 6: CHANGE ACTIVITIES (Generate 10-15 activities)
For EACH activity, provide (BILINGUAL):
- phase: "awareness" | "desire" | "knowledge" | "ability" | "reinforcement" (ADKAR model)
- name_en / name_ar: Activity name
- owner_en / owner_ar: Role responsible (e.g., "Change Manager" / "مدير التغيير")
- timeline_en / timeline_ar: When it occurs (e.g., "Q1 2025" / "الربع الأول 2025")
- status: "planned" | "in_progress" | "completed"

### PART 7: RESISTANCE STRATEGIES (Generate 5-8 strategies)
For EACH resistance type, provide (BILINGUAL):
- type: "fear_unknown" | "loss_control" | "skill_gaps" | "past_failures" | "poor_communication" | "lack_trust"
- mitigation_en / mitigation_ar: How to address this resistance
- owner_en / owner_ar: Role responsible
- timeline_en / timeline_ar: When to implement

Partner with MCIT, SDAIA, and university partners for specialized training.

Be specific to Saudi government context. Reference actual training programs and partners.`;
};

export const step17Schema = {
  type: 'object',
  required: ['readiness_assessment_en', 'readiness_assessment_ar', 'change_approach_en', 'change_approach_ar', 'resistance_management_en', 'resistance_management_ar', 'training_plan'],
  properties: {
    readiness_assessment_en: { type: 'string' },
    readiness_assessment_ar: { type: 'string' },
    change_approach_en: { type: 'string' },
    change_approach_ar: { type: 'string' },
    resistance_management_en: { type: 'string' },
    resistance_management_ar: { type: 'string' },
    training_plan: { 
      type: 'array', 
      items: { 
        type: 'object', 
        required: ['name_en', 'name_ar', 'type', 'category', 'target_audience_en', 'target_audience_ar', 'duration_en', 'duration_ar', 'timeline_en', 'timeline_ar', 'priority'],
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' },
          type: { type: 'string', enum: ['workshop', 'elearning', 'coaching', 'certification', 'onthejob', 'mentoring'] },
          category: { type: 'string', enum: ['technical', 'leadership', 'process', 'soft', 'compliance', 'culture'] },
          target_audience_en: { type: 'string' }, 
          target_audience_ar: { type: 'string' }, 
          duration_en: { type: 'string' }, 
          duration_ar: { type: 'string' }, 
          timeline_en: { type: 'string' }, 
          timeline_ar: { type: 'string' },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
        } 
      } 
    },
    stakeholder_impacts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['group_en', 'group_ar', 'impact_level', 'readiness', 'description_en', 'description_ar', 'support_needs_en', 'support_needs_ar'],
        properties: {
          group_en: { type: 'string' },
          group_ar: { type: 'string' },
          impact_level: { type: 'string', enum: ['transformational', 'significant', 'moderate', 'minor', 'minimal'] },
          readiness: { type: 'string', enum: ['ready', 'preparing', 'at_risk', 'not_ready'] },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          support_needs_en: { type: 'string' },
          support_needs_ar: { type: 'string' }
        }
      }
    },
    change_activities: {
      type: 'array',
      items: {
        type: 'object',
        required: ['phase', 'name_en', 'name_ar', 'owner_en', 'owner_ar', 'timeline_en', 'timeline_ar', 'status'],
        properties: {
          phase: { type: 'string', enum: ['awareness', 'desire', 'knowledge', 'ability', 'reinforcement'] },
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          owner_en: { type: 'string' },
          owner_ar: { type: 'string' },
          timeline_en: { type: 'string' },
          timeline_ar: { type: 'string' },
          status: { type: 'string', enum: ['planned', 'in_progress', 'completed'] }
        }
      }
    },
    resistance_strategies: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'mitigation_en', 'mitigation_ar', 'owner_en', 'owner_ar', 'timeline_en', 'timeline_ar'],
        properties: {
          type: { type: 'string', enum: ['fear_unknown', 'loss_control', 'skill_gaps', 'past_failures', 'poor_communication', 'lack_trust'] },
          mitigation_en: { type: 'string' },
          mitigation_ar: { type: 'string' },
          owner_en: { type: 'string' },
          owner_ar: { type: 'string' },
          timeline_en: { type: 'string' },
          timeline_ar: { type: 'string' }
        }
      }
    }
  }
};
