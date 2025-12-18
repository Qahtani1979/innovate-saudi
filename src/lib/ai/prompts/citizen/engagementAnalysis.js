/**
 * Citizen Engagement AI Prompts
 * Centralized prompts for citizen participation and feedback analysis
 * @module citizen/engagementAnalysis
 */

export const CITIZEN_ENGAGEMENT_SYSTEM_PROMPT = `You are an expert in citizen engagement and public participation for Saudi Arabian municipalities.

ENGAGEMENT FRAMEWORK:
1. Participation Analysis
   - Voting patterns and trends
   - Feedback sentiment analysis
   - Demographic representation
   - Geographic distribution

2. Sentiment Assessment
   - Public opinion tracking
   - Issue prioritization by citizens
   - Satisfaction metrics
   - Concern identification

3. Engagement Optimization
   - Channel effectiveness
   - Outreach recommendations
   - Accessibility improvements
   - Incentive strategies

4. Impact Measurement
   - Citizen influence on decisions
   - Response rate tracking
   - Action implementation
   - Feedback loop closure

CONTEXT:
- Saudi cultural considerations
- Arabic/English bilingual support
- Municipal governance requirements
- Vision 2030 citizen engagement goals`;

export const CITIZEN_ENGAGEMENT_SCHEMA = {
  type: "object",
  properties: {
    engagement_score: {
      type: "number",
      description: "Overall citizen engagement score (0-100)"
    },
    participation_metrics: {
      type: "object",
      properties: {
        total_participants: { type: "number" },
        active_users: { type: "number" },
        voting_rate: { type: "number" },
        feedback_submissions: { type: "number" }
      }
    },
    sentiment_analysis: {
      type: "object",
      properties: {
        overall_sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
        sentiment_score: { type: "number" },
        key_themes: { type: "array", items: { type: "string" } },
        concerns: { type: "array", items: { type: "string" } }
      }
    },
    demographic_insights: {
      type: "object",
      properties: {
        age_distribution: { type: "object" },
        geographic_spread: { type: "object" },
        underrepresented_groups: { type: "array", items: { type: "string" } }
      }
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          recommendation: { type: "string" },
          priority: { type: "string" },
          expected_impact: { type: "string" }
        }
      }
    },
    trending_topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          mentions: { type: "number" },
          sentiment: { type: "string" },
          trend: { type: "string" }
        }
      }
    }
  },
  required: ["engagement_score", "participation_metrics", "sentiment_analysis"]
};

export const buildCitizenEngagementPrompt = (engagementData, language = 'en') => {
  const langInstruction = language === 'ar' 
    ? 'Respond in Arabic.' 
    : 'Respond in English.';

  return `${langInstruction}

Analyze citizen engagement for:

MUNICIPALITY: ${engagementData.municipality || 'Not specified'}
PERIOD: ${engagementData.period || 'Current month'}

PARTICIPATION DATA:
- Total registered citizens: ${engagementData.totalCitizens || 'N/A'}
- Active participants: ${engagementData.activeParticipants || 'N/A'}
- Ideas submitted: ${engagementData.ideasSubmitted || 0}
- Votes cast: ${engagementData.votesCast || 0}
- Feedback received: ${engagementData.feedbackCount || 0}

RECENT FEEDBACK SAMPLES:
${engagementData.recentFeedback?.slice(0, 10).map(f => `- ${f}`).join('\n') || 'No recent feedback'}

TOP VOTED TOPICS:
${engagementData.topTopics?.map(t => `- ${t.topic}: ${t.votes} votes`).join('\n') || 'Not available'}

Provide comprehensive engagement analysis with actionable recommendations.`;
};

export const CITIZEN_ENGAGEMENT_PROMPTS = {
  system: CITIZEN_ENGAGEMENT_SYSTEM_PROMPT,
  schema: CITIZEN_ENGAGEMENT_SCHEMA,
  buildPrompt: buildCitizenEngagementPrompt
};

export default CITIZEN_ENGAGEMENT_PROMPTS;
