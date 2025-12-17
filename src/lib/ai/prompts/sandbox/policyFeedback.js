/**
 * Policy Feedback Workflow Prompt
 * Generates policy recommendations from sandbox learnings
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for policy recommendation
 * @param {Object} params - Policy parameters
 * @param {Object} params.sandbox - Sandbox with learnings
 * @returns {string} Formatted prompt
 */
export function getPolicyFeedbackPrompt({ sandbox }) {
  return `${SAUDI_CONTEXT.FULL}

You are an AI system generating policy reform recommendations from Saudi sandbox learnings.

Analyze this regulatory sandbox's findings and generate a policy reform recommendation:

SANDBOX: ${sandbox.name_en || 'Unknown Sandbox'}
DESCRIPTION: ${sandbox.description_en || 'Not provided'}
SECTOR: ${sandbox.sector || 'Not specified'}
REGULATORY FRAMEWORK TESTED: ${sandbox.regulatory_framework_tested || 'N/A'}
KEY FINDINGS: ${sandbox.key_findings?.join(', ') || 'N/A'}
REGULATORY CHALLENGES: ${sandbox.regulatory_challenges_identified?.join(', ') || 'N/A'}
SUCCESS METRICS: ${JSON.stringify(sandbox.success_metrics) || 'N/A'}

GENERATE POLICY RECOMMENDATION:

1. POLICY TITLE (bilingual EN + AR)

2. PROBLEM STATEMENT (bilingual)
   Current regulatory gap identified

3. CURRENT BARRIERS
   List of existing regulatory barriers

4. PROPOSED CHANGES
   Specific regulatory changes recommended

5. EXPECTED IMPACT (bilingual)
   Anticipated outcomes of the policy change

6. IMPLEMENTATION APPROACH
   How to implement the changes

7. STAKEHOLDERS
   Affected parties and their roles

8. RISKS
   Potential risks of the policy change

Align with Saudi Vision 2030 municipal reform objectives.`;
}

/**
 * Schema for policy recommendation
 */
export const policyFeedbackSchema = createBilingualSchema({
  name: "policy_recommendation",
  description: "Policy reform recommendation from sandbox learnings",
  properties: {
    title_en: { type: "string", description: "Policy title in English" },
    title_ar: { type: "string", description: "Policy title in Arabic" },
    problem_statement_en: { type: "string", description: "Problem statement in English" },
    problem_statement_ar: { type: "string", description: "Problem statement in Arabic" },
    current_barriers: {
      type: "array",
      items: { type: "string" },
      description: "List of current regulatory barriers"
    },
    proposed_changes: {
      type: "array",
      items: { type: "string" },
      description: "Proposed regulatory changes"
    },
    expected_impact_en: { type: "string", description: "Expected impact in English" },
    expected_impact_ar: { type: "string", description: "Expected impact in Arabic" },
    implementation_approach: { type: "string", description: "Implementation approach" },
    stakeholders: {
      type: "array",
      items: { type: "string" },
      description: "Affected stakeholders"
    },
    risks: {
      type: "array",
      items: { type: "string" },
      description: "Potential risks"
    }
  },
  required: ["title_en", "title_ar", "problem_statement_en", "current_barriers", "proposed_changes", "expected_impact_en", "implementation_approach", "stakeholders", "risks"]
});
