/**
 * Citizen ideas analytics prompts
 * @module citizen/ideasAnalytics
 */

export const IDEAS_ANALYTICS_SYSTEM_PROMPT = `You are an expert in analyzing citizen innovation ideas for Saudi municipal services. Provide insights on trends, patterns, and strategic recommendations.`;

export const createIdeasAnalyticsPrompt = (ideas, stats) => `Analyze citizen ideas data:

Total Ideas: ${ideas?.length || 0}
Status Distribution: ${JSON.stringify(stats?.statusDistribution || {})}
Category Distribution: ${JSON.stringify(stats?.categoryDistribution || {})}
Top Voted Ideas: ${stats?.topVoted?.map(i => i.title).join(', ') || 'N/A'}
Recent Submissions: ${stats?.recentCount || 0} (last 30 days)

Provide analysis in BOTH English AND Arabic:
1. Trend Analysis
2. Category Insights
3. Citizen Engagement Patterns
4. High-Potential Ideas Identification
5. Recommendations for Municipal Response
6. Innovation Opportunity Areas`;

export const IDEAS_ANALYTICS_SCHEMA = {
  type: 'object',
  properties: {
    trend_analysis_en: { type: 'string' },
    trend_analysis_ar: { type: 'string' },
    category_insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          insight_en: { type: 'string' },
          insight_ar: { type: 'string' }
        }
      }
    },
    engagement_patterns_en: { type: 'string' },
    engagement_patterns_ar: { type: 'string' },
    high_potential_ideas: { type: 'array', items: { type: 'string' } },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    opportunity_areas_en: { type: 'array', items: { type: 'string' } },
    opportunity_areas_ar: { type: 'array', items: { type: 'string' } }
  }
};

export const createIdeaToRDPrompt = (idea) => `Convert this citizen idea into an R&D project proposal:

Idea: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Votes: ${idea.votes_count || 0}
Municipality: ${idea.municipality_name || 'N/A'}

Generate R&D proposal with:
1. Project Title (bilingual)
2. Research Objectives
3. Methodology
4. Expected Outcomes
5. Resource Requirements
6. Timeline
7. Success Metrics`;

export const IDEA_TO_RD_SCHEMA = {
  type: 'object',
  properties: {
    project_title_en: { type: 'string' },
    project_title_ar: { type: 'string' },
    objectives_en: { type: 'array', items: { type: 'string' } },
    objectives_ar: { type: 'array', items: { type: 'string' } },
    methodology_en: { type: 'string' },
    methodology_ar: { type: 'string' },
    expected_outcomes_en: { type: 'array', items: { type: 'string' } },
    expected_outcomes_ar: { type: 'array', items: { type: 'string' } },
    resources: {
      type: 'object',
      properties: {
        budget_estimate: { type: 'number' },
        team_size: { type: 'number' },
        duration_months: { type: 'number' }
      }
    },
    success_metrics: { type: 'array', items: { type: 'string' } }
  }
};
