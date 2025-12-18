/**
 * Risk Management AI Prompts
 * Centralized prompts for risk analysis and mitigation
 * @module risk/riskAnalysis
 */

export const RISK_ANALYSIS_SYSTEM_PROMPT = `You are an expert risk analyst for Saudi Arabian government innovation initiatives.

RISK FRAMEWORK:
1. Risk Identification
   - Strategic risks
   - Operational risks
   - Financial risks
   - Compliance risks

2. Risk Assessment
   - Probability analysis
   - Impact evaluation
   - Risk scoring
   - Priority ranking

3. Mitigation Planning
   - Control measures
   - Response strategies
   - Contingency plans
   - Escalation paths

4. Monitoring
   - Risk indicators
   - Trigger events
   - Review schedules
   - Reporting requirements

CONTEXT:
- Saudi regulatory environment
- Vision 2030 governance standards
- Arabic/English bilingual support`;

export const RISK_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    overall_risk_score: { type: "number" },
    risk_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: { type: "string" },
          description: { type: "string" },
          probability: { type: "string" },
          impact: { type: "string" },
          score: { type: "number" },
          mitigation: { type: "string" },
          owner: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    risk_matrix: {
      type: "object",
      properties: {
        critical: { type: "number" },
        high: { type: "number" },
        medium: { type: "number" },
        low: { type: "number" }
      }
    },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["overall_risk_score", "risk_level", "risks"]
};

export const buildRiskAnalysisPrompt = (entityData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze risks for:

ENTITY: ${entityData.name || 'Not specified'}
TYPE: ${entityData.type || 'Project'}
STATUS: ${entityData.status || 'Active'}
BUDGET: ${entityData.budget || 'N/A'} SAR

KNOWN RISKS:
${entityData.risks?.map(r => `- ${r.description} (${r.category})`).join('\n') || 'None identified'}

DEPENDENCIES:
${entityData.dependencies?.map(d => `- ${d}`).join('\n') || 'None specified'}

CONSTRAINTS:
${entityData.constraints?.map(c => `- ${c}`).join('\n') || 'None specified'}

Provide comprehensive risk analysis with mitigation recommendations.`;
};

export const RISK_ANALYSIS_PROMPTS = {
  system: RISK_ANALYSIS_SYSTEM_PROMPT,
  schema: RISK_ANALYSIS_SCHEMA,
  buildPrompt: buildRiskAnalysisPrompt
};

export default RISK_ANALYSIS_PROMPTS;
