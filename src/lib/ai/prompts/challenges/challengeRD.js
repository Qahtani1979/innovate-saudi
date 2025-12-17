/**
 * Challenge R&D AI prompts
 * For challenge-to-RD and analysis workflows
 */

export const CHALLENGE_TO_RD_SYSTEM_PROMPT = `You are a research program manager for municipal innovation.
Generate R&D calls from municipal challenges that attract quality research proposals.
Align with Saudi research priorities and Vision 2030.
All responses must be in valid JSON format.`;

export function buildChallengeToRDPrompt(challenge) {
  return `Generate an R&D call from this municipal challenge:

Challenge Title: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}
Affected Population: ${challenge.affected_population_size || 'Not specified'}
Current Situation: ${challenge.current_situation_en || 'Not documented'}
Desired Outcome: ${challenge.desired_outcome_en || 'Not specified'}

Create a comprehensive R&D call with objectives, scope, and evaluation criteria.`;
}

export const CHALLENGE_TO_RD_SCHEMA = {
  type: "object",
  properties: {
    call_title_en: { type: "string" },
    call_title_ar: { type: "string" },
    research_objectives: { type: "array", items: { type: "string" } },
    scope_of_work: { type: "string" },
    expected_outputs: { type: "array", items: { type: "string" } },
    evaluation_criteria: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion: { type: "string" },
          weight: { type: "number" },
          description: { type: "string" }
        }
      }
    },
    timeline: { type: "string" },
    budget_range: { type: "string" },
    eligibility: { type: "array", items: { type: "string" } }
  },
  required: ["call_title_en", "research_objectives", "scope_of_work"]
};

export const ROOT_CAUSE_SYSTEM_PROMPT = `You are a root cause analysis expert.
Conduct deep analysis of challenge root causes using proven methodologies.
Identify systemic issues and interdependencies.`;

export function buildRootCausePrompt(challenge) {
  return `Conduct deep root cause analysis:

CHALLENGE: ${challenge.title_en}
Symptoms: ${challenge.symptoms?.join(', ') || challenge.description_en}
Current Understanding: ${challenge.root_cause_en || 'Not documented'}
Stakeholders Affected: ${challenge.stakeholders?.join(', ') || 'Various'}

Use 5 Whys and Fishbone analysis to identify root causes.`;
}

export const ROOT_CAUSE_SCHEMA = {
  type: "object",
  properties: {
    primary_root_cause: { type: "string" },
    five_whys_analysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          level: { type: "number" },
          question: { type: "string" },
          answer: { type: "string" }
        }
      }
    },
    fishbone_categories: {
      type: "object",
      properties: {
        people: { type: "array", items: { type: "string" } },
        process: { type: "array", items: { type: "string" } },
        technology: { type: "array", items: { type: "string" } },
        policy: { type: "array", items: { type: "string" } },
        resources: { type: "array", items: { type: "string" } }
      }
    },
    systemic_issues: { type: "array", items: { type: "string" } },
    recommended_interventions: { type: "array", items: { type: "string" } }
  },
  required: ["primary_root_cause", "five_whys_analysis"]
};

export const CHALLENGE_CLUSTER_SYSTEM_PROMPT = `You are a pattern recognition specialist for municipal challenges.
Identify clusters and relationships between challenges.
Find opportunities for coordinated solutions.`;

export function buildChallengeClusterPrompt(challenges) {
  return `Analyze challenges for clustering patterns:

CHALLENGES:
${challenges?.map(c => `- ${c.title_en} (${c.sector}): ${c.description_en?.substring(0, 100)}...`).join('\n') || 'No challenges'}

Identify clusters, themes, and opportunities for coordinated solutions.`;
}

export const CHALLENGE_CLUSTER_SCHEMA = {
  type: "object",
  properties: {
    clusters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          cluster_name: { type: "string" },
          theme: { type: "string" },
          challenges: { type: "array", items: { type: "string" } },
          common_factors: { type: "array", items: { type: "string" } },
          coordinated_solution: { type: "string" }
        }
      }
    },
    cross_cutting_themes: { type: "array", items: { type: "string" } },
    priority_clusters: { type: "array", items: { type: "string" } }
  },
  required: ["clusters"]
};
