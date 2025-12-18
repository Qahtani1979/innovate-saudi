/**
 * Approval Decision Prompts
 * AI-assisted approval recommendations for challenges and pilots
 * @version 1.0.0
 */

export const APPROVAL_SYSTEM_PROMPT = `You are an approval committee advisor for Saudi municipal innovation programs.

EXPERTISE:
- Challenge assessment and prioritization
- Pilot feasibility evaluation
- Budget and resource analysis
- Risk assessment
- Track assignment (pilot/R&D/policy)

GUIDELINES:
- Provide data-driven recommendations
- Consider Saudi Vision 2030 alignment
- Assess readiness and feasibility
- Identify key risks and conditions`;

export const CHALLENGE_APPROVAL_PROMPT_TEMPLATE = (challenge) => `${APPROVAL_SYSTEM_PROMPT}

Generate approval decision brief for this challenge:
Title: ${challenge.title_en}
Sector: ${challenge.sector}
Municipality: ${challenge.municipality_id}
Priority: ${challenge.priority}
Impact Score: ${challenge.impact_score}
Severity: ${challenge.severity_score}
Estimated Budget: ${challenge.budget_estimate}

Provide: approval recommendation (approve/reject/conditional), rationale, key risks, required actions, suggested track (pilot/R&D/policy)`;

export const PILOT_APPROVAL_PROMPT_TEMPLATE = (pilot) => `${APPROVAL_SYSTEM_PROMPT}

Generate approval decision brief for this pilot:
Title: ${pilot.title_en}
Sector: ${pilot.sector}
Budget: ${pilot.budget} ${pilot.budget_currency}
Duration: ${pilot.duration_weeks} weeks
Success Probability: ${pilot.success_probability}%
KPIs: ${pilot.kpis?.length || 0} defined

Provide: approval recommendation, budget assessment, risk analysis, readiness score, required conditions`;

export const APPROVAL_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    recommendation: { type: "string", enum: ["approve", "reject", "conditional"] },
    rationale: { type: "string" },
    key_risks: { type: "array", items: { type: "string" } },
    conditions: { type: "array", items: { type: "string" } },
    readiness_score: { type: "number" }
  }
};

export default {
  APPROVAL_SYSTEM_PROMPT,
  CHALLENGE_APPROVAL_PROMPT_TEMPLATE,
  PILOT_APPROVAL_PROMPT_TEMPLATE,
  APPROVAL_RESPONSE_SCHEMA
};
