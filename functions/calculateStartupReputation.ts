import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { startup_profile_id } = await req.json();

    if (!startup_profile_id) {
      return Response.json({ error: 'startup_profile_id required' }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.StartupProfile.filter({ id: startup_profile_id });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'Startup profile not found' }, { status: 404 });
    }

    // Get all solutions from this startup
    const solutions = await base44.asServiceRole.entities.Solution.filter({ provider_id: startup_profile_id });

    // Get all reviews for these solutions
    const solutionIds = solutions.map(s => s.id);
    const allReviews = await base44.asServiceRole.entities.SolutionReview.list();
    const reviews = allReviews.filter(r => solutionIds.includes(r.solution_id));

    // Get all pilots
    const allPilots = await base44.asServiceRole.entities.Pilot.list();
    const pilots = allPilots.filter(p => solutionIds.includes(p.solution_id));

    // Calculate reputation factors
    const avgSolutionRating = solutions.length > 0
      ? solutions.reduce((sum, s) => sum + (s.average_rating || 0), 0) / solutions.length
      : 0;

    const deploymentSuccessRate = pilots.length > 0
      ? (pilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length / pilots.length) * 100
      : 0;

    const clientSatisfaction = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length) * 20
      : 0;

    const onTimeDeliveryRate = pilots.length > 0
      ? (pilots.filter(p => {
          if (!p.timeline?.pilot_end) return true;
          const endDate = new Date(p.timeline.pilot_end);
          const actualEnd = new Date(p.timeline.evaluation_end || new Date());
          return actualEnd <= endDate;
        }).length / pilots.length) * 100
      : 0;

    // Overall reputation score (weighted average)
    const overallScore = Math.round(
      (avgSolutionRating * 20 * 0.3) +
      (deploymentSuccessRate * 0.3) +
      (clientSatisfaction * 0.25) +
      (onTimeDeliveryRate * 0.15)
    );

    // Update startup profile
    await base44.asServiceRole.entities.StartupProfile.update(startup_profile_id, {
      overall_reputation_score: overallScore,
      reputation_factors: {
        avg_solution_rating: avgSolutionRating,
        deployment_success_rate: deploymentSuccessRate,
        client_satisfaction: clientSatisfaction / 20,
        on_time_delivery_rate: onTimeDeliveryRate
      },
      pilot_success_rate: deploymentSuccessRate,
      municipal_clients_count: new Set(pilots.map(p => p.municipality_id)).size
    });

    return Response.json({
      success: true,
      overall_score: overallScore,
      factors: {
        avg_solution_rating: avgSolutionRating,
        deployment_success_rate: deploymentSuccessRate,
        client_satisfaction: clientSatisfaction / 20,
        on_time_delivery_rate: onTimeDeliveryRate
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});