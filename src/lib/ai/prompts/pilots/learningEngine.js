/**
 * Pilot Learning Engine Prompts
 * @module pilots/learningEngine
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PILOT_LEARNING_ENGINE_SYSTEM_PROMPT = getSystemPrompt('pilot_learning', `
You are a pilot analysis specialist for Saudi Arabia's municipal innovation platform.
Your role is to analyze successful pilots, identify patterns, and extract actionable lessons.
Consider Vision 2030 objectives and Saudi municipal context when providing recommendations.
`);

export function buildPilotLearningEnginePrompt({ pilot, completedPilots }) {
  return `Find similar pilots and extract learnings:

CURRENT PILOT: ${pilot.title_en}
SECTOR: ${pilot.sector}
OBJECTIVE: ${pilot.objective_en || 'N/A'}

COMPLETED PILOTS IN SECTOR (${completedPilots.length}):
${completedPilots.slice(0, 5).map(p => `
${p.title_en}
Success: ${p.recommendation}
KPIs: ${p.kpis?.map(k => `${k.name}: ${k.current}`).join(', ')}
Lessons: ${p.lessons_learned?.map(l => l.lesson).slice(0, 2).join('; ')}
`).join('\n')}

Provide:
1. Top 3 most similar pilots
2. Key lessons from each
3. Best practices to adopt
4. Pitfalls to avoid`;
}

export const PILOT_LEARNING_ENGINE_SCHEMA = {
  type: "object",
  properties: {
    similar_pilots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pilot_name: { type: "string" },
          similarity_score: { type: "number" },
          key_lessons: { type: "array", items: { type: "string" } },
          approach_used: { type: "string" }
        }
      }
    },
    best_practices: { type: "array", items: { type: "string" } },
    pitfalls_to_avoid: { type: "array", items: { type: "string" } }
  },
  required: ["similar_pilots", "best_practices", "pitfalls_to_avoid"]
};

export const PILOT_LEARNING_ENGINE_PROMPTS = {
  systemPrompt: PILOT_LEARNING_ENGINE_SYSTEM_PROMPT,
  buildPrompt: buildPilotLearningEnginePrompt,
  schema: PILOT_LEARNING_ENGINE_SCHEMA
};
