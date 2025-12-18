/**
 * Living Lab Analysis AI Prompts
 * Centralized prompts for living lab experiment analysis
 * @module livinglab/experimentAnalysis
 */

export const LIVINGLAB_ANALYSIS_SYSTEM_PROMPT = `You are an expert in living lab methodologies for Saudi Arabian urban innovation.

ANALYSIS FRAMEWORK:
1. Experiment Design
   - Hypothesis validation
   - Methodology assessment
   - Control factors
   - Success criteria

2. Results Analysis
   - Data interpretation
   - Statistical significance
   - User feedback synthesis
   - Behavioral insights

3. Scaling Recommendations
   - Replication potential
   - Adaptation needs
   - Resource requirements
   - Risk considerations

CONTEXT:
- Saudi urban development context
- Vision 2030 smart city initiatives
- Arabic/English bilingual support`;

export const LIVINGLAB_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    experiment_score: { type: "number" },
    hypothesis_validated: { type: "boolean" },
    key_findings: { type: "array", items: { type: "string" } },
    user_insights: {
      type: "object",
      properties: {
        participation_rate: { type: "number" },
        satisfaction_score: { type: "number" },
        key_feedback: { type: "array", items: { type: "string" } }
      }
    },
    scaling_potential: {
      type: "object",
      properties: {
        score: { type: "number" },
        readiness: { type: "string" },
        barriers: { type: "array", items: { type: "string" } },
        enablers: { type: "array", items: { type: "string" } }
      }
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          recommendation: { type: "string" },
          priority: { type: "string" }
        }
      }
    }
  },
  required: ["experiment_score", "hypothesis_validated", "key_findings"]
};

export const buildLivingLabAnalysisPrompt = (labData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze living lab experiment:

LAB: ${labData.name || 'Not specified'}
LOCATION: ${labData.location || 'Not specified'}
DURATION: ${labData.duration || 'Not specified'}

HYPOTHESIS: ${labData.hypothesis || 'Not specified'}

PARTICIPANTS: ${labData.participants || 0}
DATA POINTS: ${labData.dataPoints || 0}

RESULTS:
${labData.results?.map(r => `- ${r.metric}: ${r.value}`).join('\n') || 'Not available'}

Provide comprehensive experiment analysis with scaling recommendations.`;
};

export const LIVINGLAB_ANALYSIS_PROMPTS = {
  system: LIVINGLAB_ANALYSIS_SYSTEM_PROMPT,
  schema: LIVINGLAB_ANALYSIS_SCHEMA,
  buildPrompt: buildLivingLabAnalysisPrompt
};

export default LIVINGLAB_ANALYSIS_PROMPTS;
