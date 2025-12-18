/**
 * Policy Generator Prompts
 * AI assistance for policy creation and regulatory framework development
 * @version 1.0.0
 */

export const POLICY_GENERATOR_SYSTEM_PROMPT = `You are a senior public policy expert specializing in Saudi municipal governance and regulatory frameworks.

EXPERTISE AREAS:
- Saudi municipal law and regulations
- Policy development and implementation
- Regulatory compliance and governance
- Stakeholder engagement in policy-making
- Impact assessment and evaluation
- Vision 2030 alignment

GUIDELINES:
- Generate content in both Arabic and English
- Align with Saudi Vision 2030 objectives
- Consider practical implementation challenges
- Include measurable success metrics
- Reference relevant regulatory frameworks
- Consider stakeholder impact and involvement`;

export const POLICY_GENERATOR_PROMPT_TEMPLATE = ({
  initialThoughts,
  formData,
  linkedEntities = []
}) => {
  let contextPrompt = `${POLICY_GENERATOR_SYSTEM_PROMPT}

USER'S INPUT AND CURRENT FORM DATA (ARABIC):
Initial Thoughts: ${initialThoughts || 'N/A'}
Title AR (current): ${formData?.title_ar || 'Not provided - please generate'}
Recommendation AR (current): ${formData?.recommendation_text_ar || 'Not provided - please generate'}
Regulatory Framework (current): ${formData?.regulatory_framework || 'Not provided - please suggest'}
Implementation Steps (current): ${formData?.implementation_steps?.length > 0 ? JSON.stringify(formData.implementation_steps) : 'Not provided - please generate'}
Success Metrics (current): ${formData?.success_metrics?.length > 0 ? JSON.stringify(formData.success_metrics) : 'Not provided - please generate'}
Stakeholder Involvement AR (current): ${formData?.stakeholder_involvement_ar || 'Not provided - please generate'}

INSTRUCTIONS: 
- If user has provided content for a field, KEEP and ENHANCE it, do NOT replace it completely.
- If a field is empty or says "Not provided", generate new content.
- Preserve user edits and build upon them.

LINKED ENTITY CONTEXT (${linkedEntities.length} entities):
`;

  return contextPrompt;
};

export const POLICY_GENERATION_INSTRUCTIONS = `
As a PUBLIC POLICY EXPERT, develop a comprehensive, actionable policy recommendation IN ARABIC:

1. POLICY TITLE (ARABIC): Clear, official policy/regulation title in Arabic

2. POLICY RECOMMENDATION TEXT (ARABIC, 300+ words):
   - Identify the regulatory gap or governance issue
   - Propose specific policy intervention (regulation/amendment/guideline/bylaw)
   - Explain expected policy outcomes and public benefit
   - Align with Saudi Vision 2030 and municipal modernization
   - Use formal policy language suitable for government gazette

3. REGULATORY FRAMEWORK: Cite specific Saudi laws (e.g., "Municipalities Law 1397H, Article 12", "Municipal Services Regulation 2020, Section 4")

4. REGULATORY CHANGE NEEDED: true if legislative amendment required, false if administrative

5. POLICY TYPE: new_regulation, amendment, guideline, standard, bylaw, or other

6. IMPLEMENTATION STEPS (5-7 steps following POLICY DEVELOPMENT LIFECYCLE):
   Each bilingual (EN + AR), following:
   - Policy drafting & legal review by municipal legal team
   - Inter-agency consultation (Ministry of Municipalities and Housing, relevant authorities)
   - Public consultation period (30-60 days if applicable)
   - Municipal council or ministerial approval
   - Official gazette publication and communication
   - Grace period for compliance transition
   - Monitoring, compliance verification, and enforcement

7. STAKEHOLDER INVOLVEMENT (bilingual EN+AR): Key government entities required

8. AFFECTED STAKEHOLDERS (array of 4-6): Groups impacted

9. SUCCESS METRICS (3-5 POLICY OUTCOME metrics - BILINGUAL OBJECTS)

10. TIMELINE (months): Realistic from drafting to full implementation

11. PRIORITY: low/medium/high/critical based on public urgency

12. IMPACT SCORE (0-100): Population/services benefiting

13. IMPLEMENTATION COMPLEXITY: low/medium/high/very_high

CRITICAL: All text fields must be in ARABIC. This is for Saudi government use.`;

export const POLICY_LINKED_ENTITY_TEMPLATES = {
  challenge: (challenge, idx) => `
[${idx + 1}] Challenge: ${challenge.code || ''} - ${challenge.title_en}
Problem Statement EN: ${challenge.problem_statement_en || challenge.description_en || 'N/A'}
Problem Statement AR: ${challenge.problem_statement_ar || challenge.description_ar || 'N/A'}
Sector: ${challenge.sector || 'N/A'}
Municipality: ${challenge.municipality_id || 'N/A'}
Affected Population: ${challenge.affected_population_size || 'N/A'}
Root Causes: ${challenge.root_causes?.join(', ') || 'N/A'}
`,
  
  pilot: (pilot, idx) => `
[${idx + 1}] Pilot: ${pilot.code} - ${pilot.title_en}
Objective: ${pilot.objective_en || 'N/A'}
Stage: ${pilot.stage || 'N/A'}
Success Factors: ${pilot.success_factors?.join(', ') || 'N/A'}
`,
  
  rd_project: (rd, idx) => `
[${idx + 1}] R&D Project: ${rd.code} - ${rd.title_en}
Research Area: ${rd.research_area_en || 'N/A'}
TRL: ${rd.trl_current || rd.trl_start || 'N/A'}
`,
  
  program: (prog, idx) => `
[${idx + 1}] Program: ${prog.code} - ${prog.name_en}
Type: ${prog.program_type || 'N/A'}
Focus Areas: ${prog.focus_areas?.join(', ') || 'N/A'}
`
};

export default {
  POLICY_GENERATOR_SYSTEM_PROMPT,
  POLICY_GENERATOR_PROMPT_TEMPLATE,
  POLICY_GENERATION_INSTRUCTIONS,
  POLICY_LINKED_ENTITY_TEMPLATES
};
