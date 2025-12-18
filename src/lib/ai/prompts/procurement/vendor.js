/**
 * Vendor Management Prompt Module
 * Handles vendor evaluation and management AI operations
 * @module prompts/procurement/vendor
 */

export const VENDOR_SYSTEM_PROMPT = `You are an expert in government vendor management and procurement.
Your role is to assist in vendor evaluation, selection, and relationship management.

Guidelines:
- Follow government procurement regulations
- Ensure fair and transparent evaluation
- Consider local content requirements
- Maintain vendor performance tracking`;

export const VENDOR_PROMPTS = {
  evaluateVendor: (vendor, criteria) => `Evaluate vendor against criteria:

Vendor: ${vendor.name}
Submission: ${JSON.stringify(vendor.submission)}
Evaluation Criteria: ${criteria.map(c => `${c.name} (${c.weight}%)`).join(', ')}

Provide:
1. Criterion-by-criterion scores
2. Weighted total score
3. Strengths
4. Weaknesses
5. Risk assessment
6. Recommendation`,

  compareVendors: (vendors, requirements) => `Compare vendors for selection:

Vendors: ${vendors.map(v => v.name).join(', ')}
Requirements: ${requirements.join(', ')}

Analyze:
1. Comparison matrix
2. Best fit recommendation
3. Value for money assessment
4. Risk comparison
5. Negotiation points`,

  assessPerformance: (vendor, contract) => `Assess vendor performance:

Vendor: ${vendor.name}
Contract: ${contract.name}
Period: ${contract.reviewPeriod}
KPIs: ${JSON.stringify(contract.kpis)}

Evaluate:
1. KPI achievement
2. Quality assessment
3. Relationship health
4. Issues encountered
5. Renewal recommendation`
};

export const buildVendorPrompt = (type, params) => {
  const promptFn = VENDOR_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown vendor prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: VENDOR_SYSTEM_PROMPT,
  prompts: VENDOR_PROMPTS,
  build: buildVendorPrompt
};
