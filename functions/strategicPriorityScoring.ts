import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityType, entityId } = await req.json();

    // Fetch entity and its strategic linkages
    const entity = await base44.asServiceRole.entities[entityType].get(entityId);
    
    if (!entity) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Calculate strategic priority score
    let priorityScore = 0;
    let priorityLevel = 'tier_4';
    const factors = [];

    // Factor 1: Direct strategic plan linkage (40 points)
    if (entity.strategic_plan_ids?.length) {
      priorityScore += 40;
      factors.push({ factor: 'Strategic plan alignment', points: 40, detail: `Linked to ${entity.strategic_plan_ids.length} plans` });
    }

    // Factor 2: Strategic pillar alignment (30 points)
    if (entity.strategic_pillar_id) {
      priorityScore += 30;
      factors.push({ factor: 'Strategic pillar alignment', points: 30 });
    }

    // Factor 3: Strategic objectives count (20 points max)
    if (entity.strategic_objective_ids?.length) {
      const objectivePoints = Math.min(entity.strategic_objective_ids.length * 5, 20);
      priorityScore += objectivePoints;
      factors.push({ factor: 'Strategic objectives', points: objectivePoints, detail: `${entity.strategic_objective_ids.length} objectives` });
    }

    // Factor 4: MII dimension targets (10 points)
    if (entity.mii_dimension_targets?.length) {
      priorityScore += 10;
      factors.push({ factor: 'MII impact', points: 10, detail: `${entity.mii_dimension_targets.length} dimensions` });
    }

    // Determine priority tier based on score
    if (priorityScore >= 70) priorityLevel = 'tier_1';
    else if (priorityScore >= 50) priorityLevel = 'tier_2';
    else if (priorityScore >= 30) priorityLevel = 'tier_3';

    // Update entity with calculated priority
    await base44.asServiceRole.entities[entityType].update(entityId, {
      strategic_priority_level: priorityLevel,
      strategic_priority_score: priorityScore,
      strategic_priority_factors: factors,
      strategic_priority_calculated_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      entityId,
      priorityLevel,
      priorityScore,
      factors
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});