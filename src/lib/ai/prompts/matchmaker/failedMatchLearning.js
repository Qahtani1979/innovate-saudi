/**
 * Failed Match Learning Engine Prompt
 * Analyzes failed matches to improve matching algorithm
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for failed match analysis
 * @param {Object} params - Analysis parameters
 * @param {Array} params.failedMatches - List of failed matches
 * @returns {string} Formatted prompt
 */
export function getFailedMatchLearningPrompt({ failedMatches }) {
  const sampleReasons = failedMatches
    .slice(0, 10)
    .map(m => m.failure_reason || 'Not specified')
    .join(', ');

  return `${SAUDI_CONTEXT.COMPACT}

You are an AI system analyzing failed municipal innovation matches to improve future success rates.

FAILED MATCHES DATA:
- Total Failures: ${failedMatches.length}
- Sample Failure Reasons: ${sampleReasons}

ANALYSIS REQUIRED:

1. FAILURE CATEGORIES
   Identify top 5 failure categories with percentages
   Examples: capability mismatch, budget issues, timeline conflicts, etc.

2. ROOT CAUSE ANALYSIS
   Identify the most common underlying root cause

3. PREVENTABILITY ASSESSMENT
   What percentage of failures were preventable with better matching?

4. ALGORITHM IMPROVEMENTS
   Suggest specific improvements to the matching algorithm

5. PRE-ENGAGEMENT VALIDATION
   Recommend validation checks to prevent future failures

Consider Saudi municipal context and typical challenges in public-private partnerships.`;
}

/**
 * Schema for failed match learning insights
 */
export const failedMatchLearningSchema = createBilingualSchema({
  name: "failed_match_learning_insights",
  description: "Insights from analyzing failed matches",
  properties: {
    failure_categories: {
      type: "array",
      description: "Top failure categories with percentages",
      items: {
        type: "object",
        properties: {
          category: { type: "string", description: "Failure category name" },
          percentage: { type: "number", description: "Percentage of failures (0-100)" },
          examples: { 
            type: "array", 
            items: { type: "string" },
            description: "Example instances of this failure type"
          }
        },
        required: ["category", "percentage"]
      }
    },
    root_cause: {
      type: "string",
      description: "Primary root cause of failures"
    },
    preventable_rate: {
      type: "number",
      description: "Percentage of failures that were preventable (0-100)"
    },
    algorithm_improvements: {
      type: "array",
      items: { type: "string" },
      description: "Suggested algorithm improvements"
    },
    validation_checks: {
      type: "array",
      items: { type: "string" },
      description: "Pre-engagement validation checks to add"
    }
  },
  required: ["failure_categories", "root_cause", "preventable_rate", "algorithm_improvements", "validation_checks"]
});
