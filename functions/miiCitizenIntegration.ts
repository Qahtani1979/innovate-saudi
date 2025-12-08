import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { municipality_id } = await req.json();

    if (!municipality_id) {
      return Response.json({ error: 'Municipality ID required' }, { status: 400 });
    }

    // Fetch citizen engagement metrics
    const [ideas, votes, feedback, points] = await Promise.all([
      base44.asServiceRole.entities.CitizenIdea.filter({ municipality_id }),
      base44.asServiceRole.entities.CitizenVote.list(),
      base44.asServiceRole.entities.CitizenFeedback.filter({ municipality_id }),
      base44.asServiceRole.entities.CitizenPoints.list()
    ]);

    // Calculate engagement score (0-100)
    const metrics = {
      ideas_count: ideas.length,
      ideas_converted: ideas.filter(i => i.status === 'converted_to_challenge').length,
      votes_count: votes.length,
      feedback_count: feedback.length,
      active_citizens: new Set(ideas.map(i => i.submitter_email).filter(Boolean)).size,
      avg_response_time_days: calculateAvgResponseTime(ideas),
      conversion_rate: ideas.length > 0 ? (ideas.filter(i => i.status === 'converted_to_challenge').length / ideas.length) * 100 : 0,
      engagement_score: 0
    };

    // Calculate weighted engagement score
    const weights = {
      participation: 0.3,  // Number of active citizens
      quality: 0.25,       // Conversion rate
      responsiveness: 0.25, // Response time
      volume: 0.2          // Total submissions
    };

    const participation_score = Math.min((metrics.active_citizens / 100) * 100, 100);
    const quality_score = metrics.conversion_rate;
    const responsiveness_score = Math.max(100 - (metrics.avg_response_time_days * 2), 0);
    const volume_score = Math.min((metrics.ideas_count / 50) * 100, 100);

    metrics.engagement_score = (
      participation_score * weights.participation +
      quality_score * weights.quality +
      responsiveness_score * weights.responsiveness +
      volume_score * weights.volume
    );

    // Update municipality MII with citizen engagement component
    const municipality = (await base44.asServiceRole.entities.Municipality.filter({ id: municipality_id }))[0];
    
    if (municipality) {
      const currentMII = municipality.mii_score || 0;
      // Citizen engagement contributes 15% to total MII
      const newMII = (currentMII * 0.85) + (metrics.engagement_score * 0.15);

      await base44.asServiceRole.entities.Municipality.update(municipality_id, {
        mii_score: newMII,
        citizen_engagement_score: metrics.engagement_score
      });
    }

    return Response.json({ 
      success: true,
      metrics,
      mii_contribution: metrics.engagement_score * 0.15
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateAvgResponseTime(ideas) {
  const reviewedIdeas = ideas.filter(i => i.review_date && i.created_date);
  if (reviewedIdeas.length === 0) return 0;

  const totalDays = reviewedIdeas.reduce((sum, idea) => {
    const created = new Date(idea.created_date);
    const reviewed = new Date(idea.review_date);
    const days = (reviewed - created) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return totalDays / reviewedIdeas.length;
}