/**
 * Pilot Policy AI prompts
 * For pilot-to-policy and learning workflows
 */

export const PILOT_TO_POLICY_SYSTEM_PROMPT = `You are a policy development expert for government innovation.
Transform pilot results into actionable policy recommendations.
Consider Saudi regulatory context and Vision 2030 alignment.
All responses must be in valid JSON format.`;

export function buildPilotToPolicyPrompt(pilot) {
  return `Based on this pilot's results, generate policy recommendations:

Pilot: ${pilot.title_en}
Sector: ${pilot.sector}
Duration: ${pilot.duration_months || 'N/A'} months
Status: ${pilot.status}
Results: ${pilot.results_summary || 'Pending final assessment'}
Impact Score: ${pilot.impact_score || 'N/A'}
Key Metrics: ${JSON.stringify(pilot.kpis || {})}

Generate comprehensive policy recommendations including regulatory changes, implementation guidelines, and scaling considerations.`;
}

export const PILOT_TO_POLICY_SCHEMA = {
  type: "object",
  properties: {
    policy_brief_title: { type: "string" },
    executive_summary: { type: "string" },
    key_findings: { type: "array", items: { type: "string" } },
    policy_recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          recommendation: { type: "string" },
          rationale: { type: "string" },
          implementation_steps: { type: "array", items: { type: "string" } },
          stakeholders: { type: "array", items: { type: "string" } },
          timeline: { type: "string" }
        }
      }
    },
    regulatory_considerations: { type: "array", items: { type: "string" } },
    scaling_pathway: { type: "string" },
    risk_mitigation: { type: "array", items: { type: "string" } }
  },
  required: ["policy_brief_title", "executive_summary", "policy_recommendations"]
};

export const PILOT_RETROSPECTIVE_SYSTEM_PROMPT = `You are a pilot evaluation specialist.
Capture lessons learned and generate comprehensive report cards.
Focus on actionable insights for future pilots.`;

export function buildPilotRetrospectivePrompt(pilot) {
  return `Generate Pilot Report Card:

PILOT: ${pilot.title_en}
Municipality: ${pilot.municipality}
Solution: ${pilot.solution_name}
Duration: ${pilot.start_date} to ${pilot.end_date}
Status: ${pilot.status}

METRICS:
${Object.entries(pilot.metrics || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n') || 'No metrics recorded'}

FEEDBACK:
${pilot.feedback?.join('\n') || 'No feedback collected'}

Generate comprehensive retrospective with grades, learnings, and recommendations.`;
}

export const PILOT_RETROSPECTIVE_SCHEMA = {
  type: "object",
  properties: {
    overall_grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
    grade_breakdown: {
      type: "object",
      properties: {
        execution: { type: "string" },
        impact: { type: "string" },
        innovation: { type: "string" },
        sustainability: { type: "string" }
      }
    },
    key_achievements: { type: "array", items: { type: "string" } },
    challenges_faced: { type: "array", items: { type: "string" } },
    lessons_learned: { type: "array", items: { type: "string" } },
    recommendations_for_future: { type: "array", items: { type: "string" } },
    scaling_readiness: { type: "string" }
  },
  required: ["overall_grade", "key_achievements", "lessons_learned"]
};

export const PILOT_LEARNING_SYSTEM_PROMPT = `You are a knowledge management specialist for innovation pilots.
Find patterns across pilots and extract transferable learnings.
Connect similar experiences to accelerate future implementations.`;

export function buildPilotLearningPrompt(pilot, similarPilots) {
  return `Find similar pilots and extract learnings:

CURRENT PILOT: ${pilot.title_en}
Sector: ${pilot.sector}
Challenge: ${pilot.challenge_description || 'Not specified'}
Status: ${pilot.status}

SIMILAR PILOTS:
${similarPilots?.map(p => `- ${p.title_en} (${p.status}): ${p.lessons_summary || 'No lessons recorded'}`).join('\n') || 'No similar pilots found'}

Identify patterns, transferable learnings, and actionable recommendations.`;
}

export const PILOT_LEARNING_SCHEMA = {
  type: "object",
  properties: {
    pattern_analysis: { type: "string" },
    common_success_factors: { type: "array", items: { type: "string" } },
    common_pitfalls: { type: "array", items: { type: "string" } },
    transferable_learnings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          learning: { type: "string" },
          source_pilot: { type: "string" },
          applicability: { type: "string" }
        }
      }
    },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["pattern_analysis", "transferable_learnings"]
};
