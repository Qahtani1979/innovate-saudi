/**
 * Step 14: Timeline & Milestones
 * AI prompt and schema for generating implementation timeline
 */

export const getStep14Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation & R&D program implementation.

## MoMAH INNOVATION TIMELINE CONTEXT:
- Vision 2030 Milestones: 2025 interim review, 2030 final targets
- Innovation Cycles: Pilot phases (3-6 months), Scale phases (12-18 months)
- R&D Timelines: Research partnerships (2-3 years), Technology transfer (6-12 months)
- Digital Gov Milestones: MCIT digital transformation targets, SDAIA AI adoption timeline

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Duration: ${wizardData.start_year}-${wizardData.end_year} (${(wizardData.end_year || 2030) - (wizardData.start_year || 2025)} years)
- Objectives: ${context.objectives.length} defined
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'AI_ML, IOT, DIGITAL_TWINS'}
- Budget Range: ${wizardData.budget_range || 'Not specified'}

## OBJECTIVES (from Step 9):
${(wizardData.objectives || []).map((o, i) => (i + 1) + '. ' + (o.name_en || o.name_ar || 'Objective ' + (i + 1))).join('\n') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate implementation timeline with PHASES and MILESTONES that include Innovation/R&D activities.

### PART 1: PHASES (Generate 4-5 phases)
For EACH phase, provide ALL fields in BOTH English and Arabic:
- name_en / name_ar: Phase name (must reflect innovation stage)
- category: One of "foundation" | "pilot" | "evaluation" | "scale" | "optimization"
- start_date / end_date: ISO format dates within ${wizardData.start_year}-${wizardData.end_year}
- description_en / description_ar: What happens in this phase (2-3 sentences, include innovation activities)
- objectives_covered: Array of objective indices (0-based) covered in this phase
- key_deliverables_en / key_deliverables_ar: Main outputs of this phase (2-3 bullet points)
- success_metrics_en / success_metrics_ar: How success will be measured (1-2 sentences)

**MANDATORY PHASE STRUCTURE for Innovation Plans:**

1. **Foundation & R&D Setup** (category: "foundation", 6-9 months)
   - Establish innovation governance, hire key tech talent
   - Sign R&D partnerships with KACST/universities
   - Deploy innovation lab/sandbox infrastructure
   - Complete technology assessments and PoC planning

2. **Pilot Development** (category: "pilot", 9-12 months)
   - Launch 3-5 pilot programs for focus technologies
   - Execute initial R&D projects with partners
   - Build data infrastructure and analytics platforms
   - Train core team on emerging technologies

3. **Pilot Evaluation & Iteration** (category: "evaluation", 6-9 months)
   - Assess pilot outcomes and gather lessons learned
   - Iterate on successful pilots, sunset failures
   - Expand R&D partnerships based on results
   - Document knowledge and best practices

4. **Scale & Integration** (category: "scale", 12-18 months)
   - Scale successful pilots to production
   - Integrate new systems with Balady/national platforms
   - Establish ongoing R&D program structure
   - Build sustainable innovation capabilities

5. **Optimization & Institutionalization** (category: "optimization", remaining time)
   - Continuous improvement and optimization
   - Knowledge transfer and capability institutionalization
   - Advanced R&D and next-generation pilots
   - Measure and report on innovation ROI

### PART 2: MILESTONES (Generate 15-20 milestones)
For EACH milestone, provide ALL fields in BOTH English and Arabic:
- name_en / name_ar: Milestone name
- date: ISO format date
- type: One of "milestone" | "launch" | "review" | "gate" | "deliverable" | "certification" | "decision"
- criticality: One of "critical" | "high" | "medium" | "low" (at least 4-5 should be "critical" or "high")
- linked_phase: Index of the phase this milestone belongs to (0-based, e.g., 0 for first phase)
- description_en / description_ar: What this milestone represents
- success_criteria_en / success_criteria_ar: How completion will be verified

**MANDATORY Innovation Milestones (include at least 6):**
- "Innovation Lab Operational" (type: "launch", criticality: "critical") - R&D infrastructure ready
- "First R&D Partnership MoU Signed" (type: "deliverable", criticality: "high") - KACST/university agreement
- "Pilot Portfolio Approved" (type: "gate", criticality: "critical") - 3-5 pilots defined and funded
- "First Pilot Launch" (type: "launch", criticality: "high") - Initial technology pilot goes live
- "Pilot Results Review" (type: "review", criticality: "critical") - Comprehensive pilot assessment
- "Scale Decision Point" (type: "gate", criticality: "critical") - Go/no-go for pilot scaling
- "AI/ML Model Deployment" (type: "launch", criticality: "high") - First production AI system
- "Innovation Dashboard Live" (type: "deliverable", criticality: "medium") - R&D KPI tracking operational
- "Technology Transfer Complete" (type: "milestone", criticality: "high") - Knowledge transferred from R&D partner
- "SDAIA Compliance Certification" (type: "certification", criticality: "critical") - AI governance approval

**Vision 2030 Alignment Milestones:**
- Align key milestones with 2025 interim and 2030 final Vision targets
- Include NTP and Quality of Life program milestones

Be specific with realistic dates. Space milestones appropriately across the timeline. Ensure each milestone has a linked_phase that corresponds to when it occurs.`;
};

export const step14Schema = {
  type: 'object',
  properties: {
    phases: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          category: { type: 'string', enum: ['foundation', 'pilot', 'evaluation', 'scale', 'optimization'] },
          start_date: { type: 'string' }, 
          end_date: { type: 'string' }, 
          description_en: { type: 'string' }, 
          description_ar: { type: 'string' }, 
          objectives_covered: { type: 'array', items: { type: 'number' } },
          key_deliverables_en: { type: 'string' },
          key_deliverables_ar: { type: 'string' },
          success_metrics_en: { type: 'string' },
          success_metrics_ar: { type: 'string' }
        } 
      } 
    },
    milestones: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' }, 
          date: { type: 'string' }, 
          type: { type: 'string', enum: ['milestone', 'launch', 'review', 'gate', 'deliverable', 'certification', 'decision'] },
          criticality: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          description_en: { type: 'string' }, 
          description_ar: { type: 'string' },
          linked_phase: { type: 'number' },
          success_criteria_en: { type: 'string' },
          success_criteria_ar: { type: 'string' }
        } 
      } 
    }
  }
};
