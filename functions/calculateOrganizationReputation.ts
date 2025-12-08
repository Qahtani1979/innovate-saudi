import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all organizations
    const organizations = await base44.asServiceRole.entities.Organization.list();

    // Get all solutions, pilots, partnerships
    const [solutions, pilots, reviews, partnerships] = await Promise.all([
      base44.asServiceRole.entities.Solution.list(),
      base44.asServiceRole.entities.Pilot.list(),
      base44.asServiceRole.entities.SolutionReview.list(),
      base44.asServiceRole.entities.OrganizationPartnership.list()
    ]);

    const updates = [];

    for (const org of organizations) {
      // Calculate performance metrics
      const orgSolutions = solutions.filter(s => s.provider_id === org.id || s.provider_name === org.name_en);
      const orgPilots = pilots.filter(p => 
        orgSolutions.some(s => s.id === p.solution_id) ||
        p.provider_id === org.id
      );
      const orgReviews = reviews.filter(r => orgSolutions.some(s => s.id === r.solution_id));
      const orgPartnerships = partnerships.filter(p => 
        p.partner_a_id === org.id || p.partner_b_id === org.id
      );

      // Calculate reputation factors
      const deliveryQuality = orgReviews.length > 0
        ? orgReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / orgReviews.length * 20
        : 50;

      const timeliness = orgPilots.length > 0
        ? (orgPilots.filter(p => 
            !p.timeline?.actual_end_date || 
            new Date(p.timeline.actual_end_date) <= new Date(p.timeline.pilot_end)
          ).length / orgPilots.length) * 100
        : 50;

      const innovationScore = orgSolutions.reduce((sum, s) => sum + (s.trl || 0), 0) / Math.max(orgSolutions.length, 1) * 10;

      const stakeholderSatisfaction = orgReviews.length > 0
        ? (orgReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / orgReviews.length / 5) * 100
        : 50;

      const impactAchievement = orgPilots.length > 0
        ? (orgPilots.filter(p => p.stage === 'completed' && p.recommendation === 'scale').length / orgPilots.length) * 100
        : 50;

      // Calculate overall reputation score (weighted average)
      const reputationScore = Math.round(
        deliveryQuality * 0.25 +
        timeliness * 0.20 +
        innovationScore * 0.15 +
        stakeholderSatisfaction * 0.25 +
        impactAchievement * 0.15
      );

      // Update organization
      updates.push({
        id: org.id,
        reputation_score: reputationScore,
        reputation_factors: {
          delivery_quality: Math.round(deliveryQuality),
          timeliness: Math.round(timeliness),
          innovation_score: Math.round(innovationScore),
          stakeholder_satisfaction: Math.round(stakeholderSatisfaction),
          impact_achievement: Math.round(impactAchievement)
        },
        performance_metrics: {
          solution_count: orgSolutions.length,
          pilot_count: orgPilots.length,
          rd_project_count: org.performance_metrics?.rd_project_count || 0,
          program_participation_count: org.performance_metrics?.program_participation_count || 0,
          success_rate: orgPilots.length > 0 
            ? Math.round((orgPilots.filter(p => p.stage === 'completed').length / orgPilots.length) * 100)
            : 0,
          average_pilot_score: orgPilots.length > 0
            ? orgPilots.reduce((sum, p) => sum + (p.success_score || 0), 0) / orgPilots.length
            : 0,
          deployment_wins: orgPilots.filter(p => p.recommendation === 'scale').length,
          total_impact_score: orgPilots.reduce((sum, p) => sum + (p.impact_score || 0), 0)
        }
      });
    }

    // Batch update all organizations
    for (const update of updates) {
      await base44.asServiceRole.entities.Organization.update(update.id, {
        reputation_score: update.reputation_score,
        reputation_factors: update.reputation_factors,
        performance_metrics: update.performance_metrics
      });
    }

    return Response.json({ 
      success: true, 
      updated: updates.length,
      message: `Calculated reputation for ${updates.length} organizations`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});