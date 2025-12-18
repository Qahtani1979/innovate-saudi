/**
 * Training Recommendations AI Prompts
 * Centralized prompts for learning path and training analysis
 * @module training/trainingRecommendations
 */

export const TRAINING_RECOMMENDATIONS_SYSTEM_PROMPT = `You are an expert learning and development advisor for Saudi Arabian government entities.

TRAINING FRAMEWORK:
1. Skills Assessment
   - Current competencies
   - Gap identification
   - Priority skills
   - Career alignment

2. Learning Path Design
   - Course recommendations
   - Sequence optimization
   - Duration planning
   - Format selection

3. Effectiveness Metrics
   - Completion rates
   - Knowledge retention
   - Skill application
   - Performance impact

4. Development Planning
   - Short-term goals
   - Long-term trajectory
   - Certification paths
   - Mentorship needs

CONTEXT:
- Saudi workforce development
- Vision 2030 human capital goals
- Arabic/English bilingual support`;

export const TRAINING_RECOMMENDATIONS_SCHEMA = {
  type: "object",
  properties: {
    readiness_score: { type: "number" },
    skill_gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          current_level: { type: "string" },
          target_level: { type: "string" },
          priority: { type: "string" }
        }
      }
    },
    recommended_courses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          course: { type: "string" },
          provider: { type: "string" },
          duration: { type: "string" },
          format: { type: "string" },
          priority: { type: "number" }
        }
      }
    },
    learning_path: {
      type: "object",
      properties: {
        total_duration: { type: "string" },
        phases: { type: "array", items: { type: "string" } },
        milestones: { type: "array", items: { type: "string" } }
      }
    },
    certifications: { type: "array", items: { type: "string" } }
  },
  required: ["readiness_score", "skill_gaps", "recommended_courses"]
};

export const buildTrainingRecommendationsPrompt = (userData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Generate training recommendations for:

ROLE: ${userData.role || 'Not specified'}
DEPARTMENT: ${userData.department || 'Not specified'}
EXPERIENCE: ${userData.experience || 'N/A'} years

CURRENT SKILLS:
${userData.skills?.map(s => `- ${s.name}: ${s.level}`).join('\n') || 'Not specified'}

CAREER GOALS:
${userData.goals?.map(g => `- ${g}`).join('\n') || 'Not specified'}

COMPLETED TRAINING:
${userData.completedTraining?.map(t => `- ${t}`).join('\n') || 'None recorded'}

Provide personalized training recommendations with learning path.`;
};

export const TRAINING_RECOMMENDATIONS_PROMPTS = {
  system: TRAINING_RECOMMENDATIONS_SYSTEM_PROMPT,
  schema: TRAINING_RECOMMENDATIONS_SCHEMA,
  buildPrompt: buildTrainingRecommendationsPrompt
};

export default TRAINING_RECOMMENDATIONS_PROMPTS;
