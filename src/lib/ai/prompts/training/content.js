/**
 * Training Content Prompt Module
 * Handles training content generation AI operations
 * @module prompts/training/content
 */

export const TRAINING_CONTENT_SYSTEM_PROMPT = `You are an expert in creating government training content.
Your role is to develop effective training materials aligned with organizational needs.

Guidelines:
- Use adult learning principles
- Support bilingual content (Arabic/English)
- Include practical exercises
- Align with competency frameworks`;

export const TRAINING_CONTENT_PROMPTS = {
  generateModule: (topic, audience) => `Generate training module for:

Topic: ${topic.name}
Objectives: ${topic.objectives?.join(', ') || 'General understanding'}
Audience: ${audience}
Duration: ${topic.duration || '2 hours'}

Create:
1. Module outline
2. Learning objectives
3. Key concepts
4. Activities and exercises
5. Assessment questions`,

  createAssessment: (module, competencies) => `Create assessment for training module:

Module: ${module.name}
Competencies: ${competencies.join(', ')}
Assessment Type: ${module.assessmentType || 'Mixed'}

Provide:
1. Multiple choice questions (5)
2. Scenario-based questions (2)
3. Practical exercise
4. Passing criteria
5. Feedback templates`,

  adaptContent: (content, targetAudience) => `Adapt training content for target audience:

Original Content: ${content.summary}
Target Audience: ${targetAudience}
Language: ${content.language || 'English'}

Adapt:
1. Complexity level adjustment
2. Relevant examples
3. Cultural considerations
4. Terminology modifications
5. Engagement strategies`
};

export const buildTrainingContentPrompt = (type, params) => {
  const promptFn = TRAINING_CONTENT_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown training content prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: TRAINING_CONTENT_SYSTEM_PROMPT,
  prompts: TRAINING_CONTENT_PROMPTS,
  build: buildTrainingContentPrompt
};
