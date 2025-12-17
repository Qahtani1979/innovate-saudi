/**
 * Fast-Track Eligibility Checker Prompt
 * Determines if a project qualifies for fast-track approval
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for fast-track eligibility check
 * @param {Object} params - Eligibility parameters
 * @param {Object} params.application - Sandbox application
 * @returns {string} Formatted prompt
 */
export function getFastTrackEligibilityPrompt({ application }) {
  return `${SAUDI_CONTEXT.COMPACT}

You are an AI system determining fast-track eligibility for Saudi sandbox projects.

Determine fast-track eligibility for this sandbox project:

PROJECT: ${application.project_name || 'Unknown Project'}
TECHNOLOGY: ${application.technology_description || 'Not specified'}
RISK PROFILE: ${application.risk_assessment || 'Not specified'}
SCOPE: ${application.project_scope || 'Not specified'}
REGULATORY NEEDS: ${application.regulatory_exemptions?.length || 0} exemptions requested

FAST-TRACK CRITERIA:
1. Proven technology (TRL 7+)
2. Limited geographic scope
3. Low-risk profile
4. <3 regulatory exemptions needed
5. Standard safety protocols apply

ASSESSMENT REQUIRED:
- Eligible for fast-track (yes/no)
- Which criteria are met/not met
- Estimated approval time (hours)
- Confidence level (0-100)
- Recommendations if not eligible

Fast-track approval target is 48 hours for qualified projects.`;
}

/**
 * Schema for fast-track eligibility
 */
export const fastTrackEligibilitySchema = createBilingualSchema({
  name: "fast_track_eligibility",
  description: "Fast-track eligibility assessment for sandbox projects",
  properties: {
    eligible: {
      type: "boolean",
      description: "Whether project is eligible for fast-track"
    },
    criteria_met: {
      type: "object",
      description: "Status of each eligibility criterion",
      properties: {
        proven_technology: { type: "boolean", description: "TRL 7+ proven technology" },
        limited_scope: { type: "boolean", description: "Limited geographic scope" },
        low_risk: { type: "boolean", description: "Low-risk profile" },
        minimal_exemptions: { type: "boolean", description: "Less than 3 exemptions needed" },
        standard_safety: { type: "boolean", description: "Standard safety protocols apply" }
      },
      required: ["proven_technology", "limited_scope", "low_risk", "minimal_exemptions", "standard_safety"]
    },
    approval_hours: {
      type: "number",
      description: "Estimated approval time in hours"
    },
    confidence: {
      type: "number",
      description: "Confidence level (0-100)"
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "Recommendations to qualify for fast-track"
    }
  },
  required: ["eligible", "criteria_met", "approval_hours", "confidence", "recommendations"]
});
