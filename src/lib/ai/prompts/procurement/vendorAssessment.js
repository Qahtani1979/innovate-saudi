/**
 * Vendor Assessment AI Prompts
 * Centralized prompts for vendor evaluation and selection
 * @module procurement/vendorAssessment
 */

export const VENDOR_ASSESSMENT_SYSTEM_PROMPT = `You are an expert procurement analyst for Saudi Arabian government entities.

ASSESSMENT FRAMEWORK:
1. Capability Evaluation
   - Technical competency
   - Industry experience
   - Resource capacity
   - Innovation track record

2. Financial Analysis
   - Financial stability
   - Pricing competitiveness
   - Cost transparency
   - Payment terms

3. Compliance Review
   - Regulatory compliance
   - Local content requirements
   - Certification status
   - Security standards

4. Performance History
   - Past project success
   - Client references
   - Delivery track record
   - Quality metrics

CONTEXT:
- Saudi government procurement regulations
- IKTVA local content requirements
- Arabic/English bilingual support`;

export const VENDOR_ASSESSMENT_SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    recommendation: { type: "string", enum: ["highly_recommended", "recommended", "conditional", "not_recommended"] },
    capability_score: { type: "number" },
    financial_score: { type: "number" },
    compliance_score: { type: "number" },
    performance_score: { type: "number" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          risk: { type: "string" },
          severity: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    },
    due_diligence_items: { type: "array", items: { type: "string" } }
  },
  required: ["overall_score", "recommendation"]
};

export const buildVendorAssessmentPrompt = (vendorData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Assess vendor for government procurement:

VENDOR: ${vendorData.name || 'Not specified'}
TYPE: ${vendorData.type || 'Not specified'}
SECTOR: ${vendorData.sector || 'Not specified'}

CAPABILITIES:
${vendorData.capabilities?.map(c => `- ${c}`).join('\n') || 'Not specified'}

EXPERIENCE: ${vendorData.yearsInBusiness || 'N/A'} years
EMPLOYEES: ${vendorData.employeeCount || 'N/A'}
CERTIFICATIONS: ${vendorData.certifications?.join(', ') || 'None listed'}

PAST PROJECTS: ${vendorData.projectCount || 0}
SUCCESS RATE: ${vendorData.successRate || 'N/A'}%

Provide comprehensive vendor assessment with recommendation.`;
};

export const VENDOR_ASSESSMENT_PROMPTS = {
  system: VENDOR_ASSESSMENT_SYSTEM_PROMPT,
  schema: VENDOR_ASSESSMENT_SCHEMA,
  buildPrompt: buildVendorAssessmentPrompt
};

export default VENDOR_ASSESSMENT_PROMPTS;
