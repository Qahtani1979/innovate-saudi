/**
 * Scaling to Program Converter Prompts
 * For converting scaling plan lessons into training programs
 * @module prompts/scaling/programConverter
 */

export const PROGRAM_CONVERTER_SYSTEM_PROMPT = `You are a training program designer for Saudi government innovation initiatives.
Convert scaling plan lessons into structured training programs for municipal teams.
Focus on practical knowledge transfer and replicable best practices.
Generate bilingual content (English and Arabic).`;

export const buildProgramConverterPrompt = ({ scalingPlan }) => {
  return `Design a knowledge transfer training program from scaling initiative lessons.

SCALING PLAN:
Title: ${scalingPlan.title_en || 'Untitled'}
Deployed Cities: ${scalingPlan.deployed_count || 0}
Success Factors: ${scalingPlan.success_factors?.join(', ') || 'None specified'}
Lessons Learned: ${JSON.stringify(scalingPlan.lessons_learned || {})}

Generate training program:
- Program name (bilingual) - focus on "Knowledge Transfer" or "Best Practices"
- Objectives (bilingual) - transfer learning from scaling
- 6-8 training modules with topics, activities, duration
- Target participants: municipal teams
- Success metrics

Extract best practices and common challenges from scaling data.`;
};

export const PROGRAM_CONVERTER_SCHEMA = {
  type: "object",
  properties: {
    name_en: { type: "string", description: "Program name in English" },
    name_ar: { type: "string", description: "Program name in Arabic" },
    tagline_en: { type: "string", description: "Short tagline in English" },
    tagline_ar: { type: "string", description: "Short tagline in Arabic" },
    objectives_en: { type: "string", description: "Program objectives in English" },
    objectives_ar: { type: "string", description: "Program objectives in Arabic" },
    curriculum: {
      type: "array",
      items: {
        type: "object",
        properties: {
          week: { type: "number", description: "Week number" },
          topic_en: { type: "string", description: "Topic in English" },
          topic_ar: { type: "string", description: "Topic in Arabic" },
          activities: { 
            type: "array", 
            items: { type: "string" },
            description: "Learning activities"
          }
        },
        required: ["week", "topic_en", "activities"]
      },
      description: "Training curriculum modules"
    }
  },
  required: ["name_en", "name_ar", "objectives_en", "objectives_ar", "curriculum"]
};

export default {
  system: PROGRAM_CONVERTER_SYSTEM_PROMPT,
  buildPrompt: buildProgramConverterPrompt,
  schema: PROGRAM_CONVERTER_SCHEMA
};
