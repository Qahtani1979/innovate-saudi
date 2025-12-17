/**
 * Regulatory Gap Analyzer Prompt
 * Analyzes regulatory compliance for sandbox applications
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for regulatory gap analysis
 * @param {Object} params - Analysis parameters
 * @param {Object} params.application - Sandbox application
 * @returns {string} Formatted prompt
 */
export function getRegulatoryGapAnalyzerPrompt({ application }) {
  return `${SAUDI_CONTEXT.COMPACT}

You are an AI system analyzing regulatory compliance for Saudi municipal sandbox applications.

Analyze regulatory compliance for this sandbox application:

PROJECT: ${application.project_name || 'Unknown Project'}
SECTOR: ${application.sector || 'Not specified'}
ACTIVITIES: ${application.project_description?.substring(0, 300) || 'Not described'}
LOCATION: ${application.sandbox_zone || 'Not specified'}

ANALYSIS REQUIRED:

1. REGULATORY CONFLICTS
   Identify potential conflicts with existing Saudi municipal regulations
   For each conflict: regulation name, description, severity (low/medium/high)

2. REQUIRED EXEMPTIONS
   List specific regulations requiring exemptions

3. PRECEDENT CASES
   Similar approved cases that could support this application

4. TIMELINE ESTIMATE
   Estimated weeks for approval based on complexity

5. RISK LEVEL
   Overall risk assessment (low/medium/high)

Consider Saudi Vision 2030 regulatory framework and municipal governance.`;
}

/**
 * Schema for regulatory gap analysis
 */
export const regulatoryGapAnalyzerSchema = createBilingualSchema({
  name: "regulatory_gap_analysis",
  description: "Regulatory compliance analysis for sandbox applications",
  properties: {
    conflicts: {
      type: "array",
      description: "Identified regulatory conflicts",
      items: {
        type: "object",
        properties: {
          regulation: { type: "string", description: "Regulation name" },
          conflict_description: { type: "string", description: "Description of conflict" },
          severity: { type: "string", description: "Severity: low, medium, or high" }
        },
        required: ["regulation", "conflict_description", "severity"]
      }
    },
    required_exemptions: {
      type: "array",
      items: { type: "string" },
      description: "List of required regulatory exemptions"
    },
    precedents: {
      type: "array",
      items: { type: "string" },
      description: "Similar approved precedent cases"
    },
    estimated_approval_weeks: {
      type: "number",
      description: "Estimated weeks for approval"
    },
    risk_level: {
      type: "string",
      description: "Overall risk level: low, medium, or high"
    }
  },
  required: ["conflicts", "required_exemptions", "precedents", "estimated_approval_weeks", "risk_level"]
});
