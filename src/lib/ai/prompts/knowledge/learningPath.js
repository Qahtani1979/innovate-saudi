/**
 * Learning Path Generator Prompts
 * @module knowledge/learningPath
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const LEARNING_PATH_SYSTEM_PROMPT = getSystemPrompt('learning_path', `
You are an educational content specialist for Saudi municipal innovation.
Your role is to create personalized learning paths based on user roles and goals.
Consider platform resources, skill levels, and Vision 2030 competencies.
`);

/**
 * Build learning path prompt
 * @param {Object} params - User profile and goals
 * @returns {string} Formatted prompt
 */
export function buildLearningPathPrompt({ userRole, goal, currentSkills }) {
  return `Create a learning path for:
User Role: ${userRole || 'Platform User'}
Goal: ${goal || 'Improve platform proficiency'}
Current Skills: ${currentSkills || 'Beginner'}

Design a structured learning journey with:
1. Prerequisite knowledge
2. Core modules (3-5)
3. Practical exercises
4. Assessment criteria
5. Estimated completion time`;
}

export const LEARNING_PATH_SCHEMA = {
  type: "object",
  properties: {
    path_title: { type: "string" },
    prerequisites: { type: "array", items: { type: "string" } },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          duration_hours: { type: "number" },
          resources: { type: "array", items: { type: "string" } }
        }
      }
    },
    exercises: { type: "array", items: { type: "string" } },
    assessment_criteria: { type: "array", items: { type: "string" } },
    total_hours: { type: "number" }
  }
};

export const LEARNING_PATH_PROMPTS = {
  systemPrompt: LEARNING_PATH_SYSTEM_PROMPT,
  buildPrompt: buildLearningPathPrompt,
  schema: LEARNING_PATH_SCHEMA
};
