/**
 * AI Proposal Scorer Prompts
 * For scoring R&D proposals on multiple quality dimensions
 */

import { getSystemPrompt } from '@/lib/saudiContext';
import { buildBilingualSchema } from '../../bilingualSchemaBuilder';

export const PROPOSAL_SCORER_PROMPTS = {
  systemPrompt: getSystemPrompt('rd_proposal_scorer'),
  
  buildPrompt: (proposal) => `Score this R&D proposal comprehensively:

TITLE: ${proposal.title_en}
TITLE (AR): ${proposal.title_ar || 'N/A'}
ABSTRACT: ${proposal.abstract_en}
ABSTRACT (AR): ${proposal.abstract_ar || 'N/A'}
METHODOLOGY: ${proposal.methodology_en || 'Not provided'}
TEAM SIZE: ${proposal.team_members?.length || 0}
BUDGET REQUESTED: ${proposal.budget_requested} SAR
RESEARCH AREA: ${proposal.research_area_en || 'General'}

EVALUATION CRITERIA (Score 0-100 each):

1. TECHNICAL MERIT
   - Scientific novelty and originality
   - Methodological rigor
   - Technical feasibility

2. INNOVATION LEVEL
   - How groundbreaking is the approach
   - Potential for patents/IP
   - Advancement over existing solutions

3. TEAM CAPABILITY
   - Researcher experience and track record
   - Team composition and complementarity
   - Access to required resources

4. FEASIBILITY
   - Realistic timeline
   - Resource availability
   - Risk mitigation approach

5. BUDGET JUSTIFICATION
   - Appropriate allocation across categories
   - Value for money
   - Alignment with scope

Identify weak sections and provide actionable improvement suggestions.
Consider Saudi Arabia's Vision 2030 research priorities.`,

  schema: buildBilingualSchema({
    type: "object",
    properties: {
      overall_score: { 
        type: "number",
        description: "Overall quality score 0-100"
      },
      scores: {
        type: "object",
        properties: {
          technical_merit: { type: "number" },
          innovation: { type: "number" },
          team_capability: { type: "number" },
          feasibility: { type: "number" },
          budget_justification: { type: "number" }
        },
        required: ["technical_merit", "innovation", "team_capability", "feasibility", "budget_justification"]
      },
      weak_sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            section: { type: "string" },
            score: { type: "number" },
            issue: { type: "string" },
            suggestion: { type: "string" }
          },
          required: ["section", "score", "issue", "suggestion"]
        }
      },
      recommendation: { 
        type: "string",
        description: "Final recommendation: approve, fast-track, needs improvement, or reject"
      }
    },
    required: ["overall_score", "scores", "weak_sections", "recommendation"]
  })
};

export default PROPOSAL_SCORER_PROMPTS;
