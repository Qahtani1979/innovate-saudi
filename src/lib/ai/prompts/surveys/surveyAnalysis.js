/**
 * Survey Analysis AI Prompts
 * Centralized prompts for survey response analysis
 * @module surveys/surveyAnalysis
 */

export const SURVEY_ANALYSIS_SYSTEM_PROMPT = `You are an expert survey analyst for Saudi Arabian government entities.

ANALYSIS FRAMEWORK:
1. Response Analysis
   - Response rates
   - Completion patterns
   - Demographic breakdown
   - Statistical significance

2. Sentiment Extraction
   - Overall sentiment
   - Theme identification
   - Concern areas
   - Positive highlights

3. Trend Analysis
   - Historical comparison
   - Benchmark analysis
   - Improvement tracking
   - Regression detection

4. Recommendations
   - Priority actions
   - Quick wins
   - Long-term improvements
   - Follow-up needs

CONTEXT:
- Saudi cultural considerations
- Government survey standards
- Arabic/English bilingual support`;

export const SURVEY_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    response_rate: { type: "number" },
    sentiment_summary: {
      type: "object",
      properties: {
        positive: { type: "number" },
        neutral: { type: "number" },
        negative: { type: "number" },
        overall_sentiment: { type: "string" }
      }
    },
    key_themes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          theme: { type: "string" },
          frequency: { type: "number" },
          sentiment: { type: "string" },
          sample_responses: { type: "array", items: { type: "string" } }
        }
      }
    },
    concerns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          concern: { type: "string" },
          severity: { type: "string" },
          frequency: { type: "number" }
        }
      }
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          recommendation: { type: "string" },
          priority: { type: "string" },
          expected_impact: { type: "string" }
        }
      }
    }
  },
  required: ["overall_score", "response_rate", "sentiment_summary"]
};

export const buildSurveyAnalysisPrompt = (surveyData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze survey responses:

SURVEY: ${surveyData.name || 'Not specified'}
TYPE: ${surveyData.type || 'General'}
RESPONSES: ${surveyData.responseCount || 0}
RESPONSE RATE: ${surveyData.responseRate || 'N/A'}%

QUESTION SUMMARY:
${surveyData.questions?.map(q => `- ${q.question}: Avg ${q.avgScore}/5`).join('\n') || 'Not specified'}

OPEN-ENDED RESPONSES (sample):
${surveyData.openResponses?.slice(0, 10).map(r => `- "${r}"`).join('\n') || 'None provided'}

Provide comprehensive analysis with actionable recommendations.`;
};

export const SURVEY_ANALYSIS_PROMPTS = {
  system: SURVEY_ANALYSIS_SYSTEM_PROMPT,
  schema: SURVEY_ANALYSIS_SCHEMA,
  buildPrompt: buildSurveyAnalysisPrompt
};

export default SURVEY_ANALYSIS_PROMPTS;
