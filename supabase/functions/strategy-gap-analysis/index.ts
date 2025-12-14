import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ObjectiveCoverage {
  id: string;
  title: string;
  weight: number;
  current: Record<string, number>;
  target: Record<string, number>;
  gaps: Record<string, number>;
  coverage_pct: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategic_plan_id, analysis_depth = 'quick' } = await req.json();

    if (!strategic_plan_id) {
      throw new Error('strategic_plan_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan with cascade config
    const { data: plan, error: planError } = await supabase
      .from('strategic_plans')
      .select('*')
      .eq('id', strategic_plan_id)
      .single();

    if (planError) throw planError;
    if (!plan) throw new Error('Strategic plan not found');

    const objectives = plan.objectives || [];
    const cascadeConfig = plan.cascade_config || {
      targets: {
        challenges_per_objective: 5,
        pilots_per_challenge: 2,
        solutions_per_challenge: 3,
        campaigns_per_objective: 2,
        events_per_objective: 3
      }
    };

    // Count existing entities linked to this plan
    const [
      { count: challengeCount },
      { count: pilotCount },
      { count: campaignCount },
      { count: eventCount }
    ] = await Promise.all([
      supabase.from('challenges')
        .select('id', { count: 'exact', head: true })
        .contains('strategic_plan_ids', [strategic_plan_id])
        .eq('is_deleted', false),
      supabase.from('pilots')
        .select('id', { count: 'exact', head: true })
        .contains('strategic_plan_ids', [strategic_plan_id])
        .eq('is_deleted', false),
      supabase.from('programs')
        .select('id', { count: 'exact', head: true })
        .eq('strategic_plan_id', strategic_plan_id)
        .eq('is_deleted', false),
      supabase.from('events')
        .select('id', { count: 'exact', head: true })
        .eq('strategic_plan_id', strategic_plan_id)
        .eq('is_deleted', false)
    ]);

    // Calculate targets based on objectives count
    const objectiveCount = objectives.length || 1;
    const targets = {
      challenges: objectiveCount * (cascadeConfig.targets?.challenges_per_objective || 5),
      pilots: (challengeCount || 0) * (cascadeConfig.targets?.pilots_per_challenge || 2),
      campaigns: objectiveCount * (cascadeConfig.targets?.campaigns_per_objective || 2),
      events: objectiveCount * (cascadeConfig.targets?.events_per_objective || 3)
    };

    // Calculate current counts
    const current = {
      challenges: challengeCount || 0,
      pilots: pilotCount || 0,
      campaigns: campaignCount || 0,
      events: eventCount || 0
    };

    // Calculate gaps
    const gaps = {
      challenges: Math.max(0, targets.challenges - current.challenges),
      pilots: Math.max(0, targets.pilots - current.pilots),
      campaigns: Math.max(0, targets.campaigns - current.campaigns),
      events: Math.max(0, targets.events - current.events)
    };

    // Calculate per-objective coverage (simplified)
    const objectiveCoverage: ObjectiveCoverage[] = objectives.map((obj: any, index: number) => {
      const objId = obj.id || `obj-${index}`;
      const perObjTarget = {
        challenges: cascadeConfig.targets?.challenges_per_objective || 5,
        pilots: cascadeConfig.targets?.pilots_per_challenge || 2,
        campaigns: cascadeConfig.targets?.campaigns_per_objective || 2,
        events: cascadeConfig.targets?.events_per_objective || 3
      };
      
      // Distribute current counts evenly across objectives for simplification
      const perObjCurrent = {
        challenges: Math.floor(current.challenges / objectiveCount),
        pilots: Math.floor(current.pilots / objectiveCount),
        campaigns: Math.floor(current.campaigns / objectiveCount),
        events: Math.floor(current.events / objectiveCount)
      };
      
      const perObjGaps = {
        challenges: Math.max(0, perObjTarget.challenges - perObjCurrent.challenges),
        pilots: Math.max(0, perObjTarget.pilots - perObjCurrent.pilots),
        campaigns: Math.max(0, perObjTarget.campaigns - perObjCurrent.campaigns),
        events: Math.max(0, perObjTarget.events - perObjCurrent.events)
      };

      const totalTarget = Object.values(perObjTarget).reduce((a, b) => a + b, 0);
      const totalCurrent = Object.values(perObjCurrent).reduce((a, b) => a + b, 0);
      const coverage_pct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 100;

      return {
        id: objId,
        title: obj.title_en || obj.title || `Objective ${index + 1}`,
        weight: obj.weight || 1,
        current: perObjCurrent,
        target: perObjTarget,
        gaps: perObjGaps,
        coverage_pct
      };
    });

    // Calculate overall coverage
    const totalTarget = Object.values(targets).reduce((a, b) => a + b, 0);
    const totalCurrent = Object.values(current).reduce((a, b) => a + b, 0);
    const overallCoveragePct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 100;
    const fullyCoveredCount = objectiveCoverage.filter(o => o.coverage_pct >= 100).length;

    // Total generation needed
    const totalGenerationNeeded = {
      challenges: gaps.challenges,
      pilots: gaps.pilots,
      campaigns: gaps.campaigns,
      events: gaps.events,
      total: gaps.challenges + gaps.pilots + gaps.campaigns + gaps.events
    };

    const result = {
      plan_id: strategic_plan_id,
      plan_name: plan.name_en,
      analyzed_at: new Date().toISOString(),
      analysis_depth,
      
      // Summary metrics
      overall_coverage_pct: overallCoveragePct,
      total_objectives: objectiveCount,
      fully_covered_objectives: fullyCoveredCount,
      
      // Entity-level coverage
      entity_coverage: {
        challenges: { current: current.challenges, target: targets.challenges, coverage_pct: targets.challenges > 0 ? Math.round((current.challenges / targets.challenges) * 100) : 100 },
        pilots: { current: current.pilots, target: targets.pilots, coverage_pct: targets.pilots > 0 ? Math.round((current.pilots / targets.pilots) * 100) : 100 },
        campaigns: { current: current.campaigns, target: targets.campaigns, coverage_pct: targets.campaigns > 0 ? Math.round((current.campaigns / targets.campaigns) * 100) : 100 },
        events: { current: current.events, target: targets.events, coverage_pct: targets.events > 0 ? Math.round((current.events / targets.events) * 100) : 100 }
      },
      
      // Per-objective breakdown
      objectives: objectiveCoverage,
      
      // Gaps
      gaps: {
        quantity_gaps: gaps,
        priority_order: Object.entries(gaps)
          .filter(([_, v]) => v > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([k]) => k)
      },
      
      // What needs to be generated
      total_generation_needed: totalGenerationNeeded,
      
      // Cascade config used
      cascade_config: cascadeConfig
    };

    console.log('Gap analysis completed:', {
      plan_id: strategic_plan_id,
      overall_coverage: overallCoveragePct,
      total_needed: totalGenerationNeeded.total
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Gap analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
