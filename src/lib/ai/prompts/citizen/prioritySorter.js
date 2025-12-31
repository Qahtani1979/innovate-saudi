/**
 * AI Priority Sorter Prompts
 * Provides intelligent priority scoring for citizen ideas
 * @module citizen/prioritySorter
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Priority scoring weights configuration
 */
export const PRIORITY_WEIGHTS = {
  votes: 0.3,
  ai_priority: 0.25,
  recency: 0.2,
  conversion_potential: 0.15,
  engagement: 0.1
};

/**
 * Calculate priority score for an idea
 */
export function calculatePriorityScore(idea, weights = PRIORITY_WEIGHTS) {
  const voteScore = Math.min((idea.vote_count || 0) / 50 * 100, 100);
  const aiScore = idea.ai_classification?.priority_score || 50;
  const daysSince = (Date.now() - new Date(idea.created_date)) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(100 - daysSince * 2, 0);
  const conversionScore = idea.status === 'approved' ? 80 : idea.status === 'under_review' ? 50 : 20;
  const engagementScore = Math.min((idea.comment_count || 0) * 10, 100);

  return (
    voteScore * weights.votes +
    aiScore * weights.ai_priority +
    recencyScore * weights.recency +
    conversionScore * weights.conversion_potential +
    engagementScore * weights.engagement
  );
}

/**
 * Generate batch priority analysis prompt
 */
export function generateBatchPriorityPrompt(ideas = []) {
  return `Analyze and prioritize these citizen ideas for municipal action:

IDEAS (${ideas.length} total):
${ideas.slice(0, 20).map((idea, i) => 
  `${i+1}. "${idea.title}" - Votes: ${idea.vote_count || 0}, Status: ${idea.status || 'new'}, Sector: ${idea.sector || 'unknown'}`
).join('\n')}

Provide:
1. Ranked priority order (by ID)
2. Priority reasoning for top 5
3. Quick wins (high impact, low effort)
4. Strategic initiatives (high impact, high effort)
5. Clustering recommendations (similar ideas to merge)`;
}

/**
 * Get batch priority schema
 */
export function getBatchPrioritySchema() {
  return {
    type: "object",
    properties: {
      ranked_ideas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            idea_index: { type: "number" },
            priority_score: { type: "number" },
            reasoning: { type: "string" }
          }
        }
      },
      quick_wins: { type: "array", items: { type: "number" } },
      strategic_initiatives: { type: "array", items: { type: "number" } },
      merge_recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            idea_indices: { type: "array", items: { type: "number" } },
            reason: { type: "string" }
          }
        }
      }
    }
  };
}

/**
 * Get system prompt for priority analysis
 */
export function getPriorityAnalysisSystemPrompt() {
  return getSystemPrompt('MUNICIPAL', true) + `

You are a priority analyst for Saudi municipal citizen ideas.
Evaluate and rank ideas based on impact, feasibility, and strategic alignment.
`;
}

export const PRIORITY_SORTER_CONFIG = {
  name: 'priority-sorter',
  version: '1.0.0',
  description: 'AI-enhanced priority scoring for citizen ideas'
};
