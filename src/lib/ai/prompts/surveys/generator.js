/**
 * Survey and questionnaire prompts
 * @module surveys/generator
 */

export const SURVEY_SYSTEM_PROMPT = `You are an expert in designing surveys and questionnaires for Saudi municipal citizen engagement and feedback collection.`;

export const createSurveyGeneratorPrompt = (topic, audience, objectives) => `Design a survey for:

Topic: ${topic}
Target Audience: ${audience}
Objectives: ${objectives}

Generate survey in BOTH English AND Arabic:
1. Survey title and introduction
2. Questions (mix of types)
3. Response options
4. Closing message`;

export const SURVEY_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    introduction_en: { type: 'string' },
    introduction_ar: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question_en: { type: 'string' },
          question_ar: { type: 'string' },
          type: { type: 'string', enum: ['multiple_choice', 'rating', 'open_text', 'yes_no'] },
          options: { type: 'array', items: { type: 'string' } },
          required: { type: 'boolean' }
        }
      }
    },
    closing_message_en: { type: 'string' },
    closing_message_ar: { type: 'string' }
  }
};

export const createSurveyAnalysisPrompt = (responses, surveyMeta) => `Analyze survey responses:

Survey: ${surveyMeta.title}
Total Responses: ${responses.length}
Response Data: ${JSON.stringify(responses.slice(0, 50))}

Provide analysis:
1. Key findings
2. Sentiment overview
3. Common themes
4. Recommendations
5. Action items`;

export const SURVEY_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    key_findings_en: { type: 'array', items: { type: 'string' } },
    key_findings_ar: { type: 'array', items: { type: 'string' } },
    sentiment_overview: {
      type: 'object',
      properties: {
        positive_pct: { type: 'number' },
        neutral_pct: { type: 'number' },
        negative_pct: { type: 'number' }
      }
    },
    common_themes_en: { type: 'array', items: { type: 'string' } },
    common_themes_ar: { type: 'array', items: { type: 'string' } },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    action_items: { type: 'array', items: { type: 'string' } }
  }
};
