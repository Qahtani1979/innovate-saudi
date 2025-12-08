import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Analyze sector gaps from strategic plans
 * Identifies which sectors lack innovation pipeline activity
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [strategicPlans, sectors, challenges, pilots, solutions] = await Promise.all([
      base44.entities.StrategicPlan.filter({ is_active: true }),
      base44.entities.Sector.list(),
      base44.entities.Challenge.list(),
      base44.entities.Pilot.list(),
      base44.entities.Solution.list()
    ]);

    const sectorAnalysis = sectors.map(sector => {
      const sectorChallenges = challenges.filter(c => c.sector === sector.code || c.sector_id === sector.id);
      const sectorPilots = pilots.filter(p => p.sector === sector.code);
      const sectorSolutions = solutions.filter(s => s.sectors?.includes(sector.code));

      // Check if sector appears in strategic plans
      const strategicPriority = strategicPlans.some(plan => 
        plan.sector_id === sector.id || 
        plan.focus_sectors?.includes(sector.code)
      );

      const gapScore = strategicPriority ? (
        (sectorChallenges.length === 0 ? 30 : 0) +
        (sectorPilots.length === 0 ? 40 : 0) +
        (sectorSolutions.length === 0 ? 30 : 0)
      ) : 0;

      return {
        sector: language === 'ar' ? sector.name_ar : sector.name_en,
        sector_id: sector.id,
        sector_code: sector.code,
        strategicPriority,
        challengeCount: sectorChallenges.length,
        pilotCount: sectorPilots.length,
        solutionCount: sectorSolutions.length,
        gapScore,
        recommendations: gapScore > 50 ? [
          'Launch targeted challenge discovery campaign',
          'Identify existing solutions in this sector',
          'Create innovation program for this sector'
        ] : []
      };
    }).filter(s => s.gapScore > 30)
      .sort((a, b) => b.gapScore - a.gapScore);

    return Response.json({ 
      success: true,
      gapAnalysis: sectorAnalysis,
      summary: {
        totalSectors: sectors.length,
        sectorsWithGaps: sectorAnalysis.length,
        highPriorityGaps: sectorAnalysis.filter(s => s.gapScore >= 70).length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});