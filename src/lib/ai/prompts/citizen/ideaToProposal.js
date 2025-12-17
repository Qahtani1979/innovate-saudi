/**
 * Idea to Proposal Converter Prompts
 * AI-powered citizen idea conversion
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IDEA_TO_PROPOSAL_SYSTEM_PROMPT = getSystemPrompt('idea_to_proposal', `
You are an innovation proposal specialist for Saudi municipal platforms.

CONVERSION GUIDELINES:
1. Transform citizen ideas into structured proposals
2. Generate bilingual content (English and Arabic)
3. Create realistic budgets and timelines
4. Define measurable success metrics
`);

export function buildIdeaToProposalPrompt(idea) {
  return `Convert this citizen idea into a structured innovation proposal.

IDEA:
Title: ${idea.title || idea.title_en || idea.title_ar}
Description: ${idea.description || idea.description_en || idea.description_ar}
Category: ${idea.category || 'Not specified'}
Municipality: ${idea.municipality_id || 'Not specified'}

Generate a structured innovation proposal with:
1. Title (both Arabic and English)
2. Description (both Arabic and English) - expand on the idea
3. Implementation plan (both Arabic and English) - concrete steps
4. Budget estimate (realistic number in SAR)
5. Timeline (weeks)
6. Team requirements (roles needed)
7. Success metrics (3-5 measurable outcomes)

Be specific and actionable. Make it implementation-ready.`;
}

export const IDEA_TO_PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    title_en: { type: "string" },
    title_ar: { type: "string" },
    description_en: { type: "string" },
    description_ar: { type: "string" },
    implementation_plan_en: { type: "string" },
    implementation_plan_ar: { type: "string" },
    budget_estimate: { type: "number" },
    duration_weeks: { type: "number" },
    team_composition: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string" },
          skills: { type: "string" },
          count: { type: "number" }
        }
      }
    },
    success_metrics_proposed: {
      type: "array",
      items: {
        type: "object",
        properties: {
          metric_name_en: { type: "string" },
          metric_name_ar: { type: "string" },
          target_value: { type: "string" },
          measurement_method: { type: "string" }
        }
      }
    }
  }
};
