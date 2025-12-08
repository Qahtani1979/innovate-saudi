import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_type, entity_id } = await req.json();

    if (!entity_type || !entity_id) {
      return Response.json({ error: 'Missing entity_type or entity_id' }, { status: 400 });
    }

    // Get all evaluations for this entity
    const allEvaluations = await base44.asServiceRole.entities.ExpertEvaluation.list();
    const evaluations = allEvaluations.filter(
      e => e.entity_type === entity_type && e.entity_id === entity_id && !e.is_deleted
    );

    if (evaluations.length === 0) {
      return Response.json({ 
        consensus_reached: false, 
        message: 'No evaluations found' 
      });
    }

    // Check consensus
    const recommendations = evaluations.map(e => e.recommendation);
    const consensusReached = recommendations.every(r => r === recommendations[0]);
    const avgScore = evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length;

    // Update entity if consensus reached
    if (consensusReached && evaluations.length >= 2) {
      const consensusRecommendation = recommendations[0];
      
      // Determine new status based on recommendation
      let newStatus = null;
      if (consensusRecommendation === 'approve') {
        newStatus = 'approved';
      } else if (consensusRecommendation === 'reject') {
        newStatus = 'rejected';
      } else if (consensusRecommendation === 'revise_and_resubmit') {
        newStatus = 'revisions_requested';
      }

      // Update entity based on type
      const entityMap = {
        'rd_proposal': 'RDProposal',
        'program_application': 'ProgramApplication',
        'matchmaker_application': 'MatchmakerApplication',
        'citizen_idea': 'CitizenIdea',
        'challenge': 'Challenge',
        'solution': 'Solution',
        'pilot': 'Pilot',
        'scaling_plan': 'ScalingPlan'
      };

      const entityName = entityMap[entity_type];
      
      if (entityName && newStatus) {
        await base44.asServiceRole.entities[entityName].update(entity_id, {
          status: newStatus,
          average_score: avgScore,
          consensus_date: new Date().toISOString()
        });
      }

      // Mark evaluations as consensus reached
      for (const evaluation of evaluations) {
        await base44.asServiceRole.entities.ExpertEvaluation.update(evaluation.id, {
          is_consensus_reached: true,
          consensus_notes: `Consensus: ${consensusRecommendation} (${evaluations.length} evaluators, avg: ${avgScore.toFixed(1)})`
        });
      }
    }

    return Response.json({
      consensus_reached: consensusReached,
      evaluator_count: evaluations.length,
      average_score: avgScore,
      consensus_recommendation: consensusReached ? recommendations[0] : null,
      evaluations: evaluations.map(e => ({
        expert_email: e.expert_email,
        score: e.overall_score,
        recommendation: e.recommendation
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});