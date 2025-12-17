/**
 * AI Exemption Suggester Prompt
 * Used by: AIExemptionSuggester.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '../../saudiContext';

export const buildExemptionSuggesterPrompt = (projectData, sandbox, availableExemptions) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing regulatory exemptions for a sandbox project in Saudi Arabia's Ministry of Municipalities and Housing innovation ecosystem.

## PROJECT DETAILS
- Title: ${projectData.project_title}
- Description: ${projectData.project_description}
- Domain: ${sandbox.domain}
- Duration: ${projectData.duration_months} months
- Risk Assessment: ${projectData.risk_assessment}

## AVAILABLE EXEMPTIONS IN THIS DOMAIN
${JSON.stringify(availableExemptions.map(e => ({
  code: e.exemption_code,
  title: e.title_en,
  category: e.category,
  conditions: e.conditions,
  risk_level: e.risk_level
})), null, 2)}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Analyze the project and provide:
1. Recommended exemptions with priority levels
2. Reasoning for each recommendation (bilingual)
3. Risk assessment per exemption
4. Compliance requirements
5. Overall compliance score
6. Additional notes and guidance`;
};

export const exemptionSuggesterSchema = {
  type: "object",
  required: ["recommended_exemptions", "overall_compliance_score"],
  properties: {
    recommended_exemptions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          exemption_code: { type: "string" },
          priority: { type: "string", enum: ["essential", "recommended", "optional"] },
          reasoning_en: { type: "string" },
          reasoning_ar: { type: "string" },
          risk_notes_en: { type: "string" },
          risk_notes_ar: { type: "string" },
          compliance_requirements_en: { type: "array", items: { type: "string" } },
          compliance_requirements_ar: { type: "array", items: { type: "string" } }
        }
      }
    },
    overall_compliance_score: { type: "number", minimum: 0, maximum: 100 },
    additional_notes_en: { type: "string" },
    additional_notes_ar: { type: "string" }
  }
};

export const EXEMPTION_SUGGESTER_SYSTEM_PROMPT = `You are a regulatory compliance specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) sandbox program. You analyze innovation projects and recommend appropriate regulatory exemptions while ensuring proper risk management and compliance requirements are met.`;
