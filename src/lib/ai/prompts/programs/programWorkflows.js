/**
 * Program Workflow AI prompts
 * For program-to-solution and graduation workflows
 */

export const PROGRAM_TO_SOLUTION_SYSTEM_PROMPT = `You are an innovation program advisor helping graduates launch solutions.
Guide the transition from program completion to market-ready solution entry.
Provide practical, actionable guidance for Saudi municipal innovation context.
All responses must be in valid JSON format.`;

export function buildProgramToSolutionPrompt(program, graduate) {
  return `A graduate from program "${program.name_en}" wants to launch their solution:

Program Focus: ${program.focus_areas?.join(', ') || 'Innovation'}
Graduate Project: ${graduate?.project_title || 'Not specified'}
Skills Acquired: ${graduate?.skills?.join(', ') || 'Various innovation skills'}

Generate a solution entry framework with:
1. Suggested solution name and positioning
2. Target sectors and use cases
3. Go-to-market recommendations
4. Success metrics to track`;
}

export const PROGRAM_TO_SOLUTION_SCHEMA = {
  type: "object",
  properties: {
    solution_name_en: { type: "string" },
    solution_name_ar: { type: "string" },
    tagline_en: { type: "string" },
    tagline_ar: { type: "string" },
    description_en: { type: "string" },
    description_ar: { type: "string" },
    target_sectors: { type: "array", items: { type: "string" } },
    use_cases: { type: "array", items: { type: "string" } },
    go_to_market: {
      type: "array",
      items: {
        type: "object",
        properties: {
          phase: { type: "string" },
          activities: { type: "array", items: { type: "string" } },
          timeline: { type: "string" }
        }
      }
    },
    success_metrics: { type: "array", items: { type: "string" } },
    recommended_pilots: { type: "array", items: { type: "string" } }
  },
  required: ["solution_name_en", "description_en", "target_sectors", "go_to_market"]
};

export const DROPOUT_PREDICTOR_SYSTEM_PROMPT = `You are a program analytics expert specializing in participant retention.
Analyze participant data to predict dropout risk and recommend interventions.
Focus on actionable insights that program managers can implement.`;

export function buildDropoutPredictorPrompt(program, participants) {
  return `Predict dropout risk for program participants:

PROGRAM: ${program.name_en}
Duration: ${program.duration_months || 6} months
Current Phase: ${program.current_phase || 'Active'}

PARTICIPANTS SUMMARY:
${participants?.map(p => `- ${p.name}: Attendance ${p.attendance}%, Engagement ${p.engagement}/10`).join('\n') || 'No participant data'}

Identify at-risk participants and recommend retention interventions.`;
}

export const DROPOUT_PREDICTOR_SCHEMA = {
  type: "object",
  properties: {
    overall_risk_level: { type: "string", enum: ["low", "medium", "high"] },
    at_risk_participants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          participant_id: { type: "string" },
          risk_score: { type: "number" },
          risk_factors: { type: "array", items: { type: "string" } },
          recommended_intervention: { type: "string" }
        }
      }
    },
    program_recommendations: { type: "array", items: { type: "string" } },
    early_warning_signs: { type: "array", items: { type: "string" } }
  },
  required: ["overall_risk_level", "at_risk_participants"]
};

export const LEARNING_PATH_SYSTEM_PROMPT = `You are an educational technology specialist for innovation programs.
Design personalized learning paths based on participant goals and program objectives.
Optimize for skill development and practical application.`;

export function buildLearningPathPrompt(participant, program) {
  return `Design personalized learning path:

PARTICIPANT:
Name: ${participant.name}
Background: ${participant.background || 'Not specified'}
Goals: ${participant.goals?.join(', ') || 'General innovation skills'}
Current Skills: ${participant.skills?.join(', ') || 'Various'}

PROGRAM: ${program.name_en}
Focus: ${program.focus_areas?.join(', ')}
Modules Available: ${program.modules?.map(m => m.name).join(', ') || 'Standard curriculum'}

Create an optimized learning path with milestones and resources.`;
}

export const LEARNING_PATH_SCHEMA = {
  type: "object",
  properties: {
    path_name: { type: "string" },
    duration_weeks: { type: "number" },
    phases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          phase_name: { type: "string" },
          weeks: { type: "number" },
          modules: { type: "array", items: { type: "string" } },
          deliverables: { type: "array", items: { type: "string" } },
          resources: { type: "array", items: { type: "string" } }
        }
      }
    },
    milestones: { type: "array", items: { type: "string" } },
    success_criteria: { type: "array", items: { type: "string" } }
  },
  required: ["path_name", "phases", "milestones"]
};
