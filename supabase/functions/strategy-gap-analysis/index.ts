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

/**
 * Strategy Gap Analysis
 * 
 * Analyzes coverage across ALL 9 entity types:
 * - challenges
 * - pilots
 * - programs
 * - campaigns (marketing_campaigns table)
 * - events
 * - policies (policy_documents table)
 * - rd_calls
 * - partnerships
 * - living_labs
 */
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
        programs_per_objective: 2,
        campaigns_per_objective: 2,
        events_per_objective: 3,
        policies_per_objective: 1,
        rd_calls_per_objective: 1,
        partnerships_per_objective: 2,
        living_labs_per_objective: 1
      }
    };

    // Count existing entities linked to this plan - ALL 9 ENTITY TYPES
    // Note: Some tables may not exist or have different column structures
    
    const challengeResult = await supabase.from('challenges')
      .select('id', { count: 'exact', head: true })
      .contains('strategic_plan_ids', [strategic_plan_id])
      .eq('is_deleted', false);
    const challengeCount = challengeResult.count || 0;

    const pilotResult = await supabase.from('pilots')
      .select('id', { count: 'exact', head: true })
      .contains('strategic_plan_ids', [strategic_plan_id])
      .eq('is_deleted', false);
    const pilotCount = pilotResult.count || 0;

    const programResult = await supabase.from('programs')
      .select('id', { count: 'exact', head: true })
      .contains('strategic_plan_ids', [strategic_plan_id])
      .eq('is_deleted', false);
    const programCount = programResult.count || 0;

    // Campaigns - count from events with campaign type as proxy
    const campaignResult = await supabase.from('events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'campaign')
      .eq('is_deleted', false);
    const campaignCount = campaignResult.count || 0;

    const eventResult = await supabase.from('events')
      .select('id', { count: 'exact', head: true })
      .contains('strategic_plan_ids', [strategic_plan_id])
      .eq('is_deleted', false);
    const eventCount = eventResult.count || 0;

    // Policy documents - may use different column name
    let policyCount = 0;
    try {
      const policyResult = await supabase.from('policy_documents')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false);
      policyCount = policyResult.count || 0;
    } catch (e) {
      console.log('policy_documents table not accessible:', e);
    }

    const rdCallResult = await supabase.from('rd_calls')
      .select('id', { count: 'exact', head: true })
      .contains('strategic_plan_ids', [strategic_plan_id])
      .eq('is_deleted', false);
    const rdCallCount = rdCallResult.count || 0;

    const partnershipResult = await supabase.from('partnerships')
      .select('id', { count: 'exact', head: true })
      .contains('strategic_plan_ids', [strategic_plan_id])
      .eq('is_deleted', false);
    const partnershipCount = partnershipResult.count || 0;

    const livingLabResult = await supabase.from('living_labs')
      .select('id', { count: 'exact', head: true })
      .contains('strategic_plan_ids', [strategic_plan_id])
      .eq('is_deleted', false);
    const livingLabCount = livingLabResult.count || 0;

    // Calculate targets based on objectives count
    const objectiveCount = objectives.length || 1;
    const targets = {
      challenges: objectiveCount * (cascadeConfig.targets?.challenges_per_objective || 5),
      pilots: (challengeCount || 0) * (cascadeConfig.targets?.pilots_per_challenge || 2),
      programs: objectiveCount * (cascadeConfig.targets?.programs_per_objective || 2),
      campaigns: objectiveCount * (cascadeConfig.targets?.campaigns_per_objective || 2),
      events: objectiveCount * (cascadeConfig.targets?.events_per_objective || 3),
      policies: objectiveCount * (cascadeConfig.targets?.policies_per_objective || 1),
      rd_calls: objectiveCount * (cascadeConfig.targets?.rd_calls_per_objective || 1),
      partnerships: objectiveCount * (cascadeConfig.targets?.partnerships_per_objective || 2),
      living_labs: objectiveCount * (cascadeConfig.targets?.living_labs_per_objective || 1)
    };

    // Calculate current counts
    const current = {
      challenges: challengeCount || 0,
      pilots: pilotCount || 0,
      programs: programCount || 0,
      campaigns: campaignCount || 0,
      events: eventCount || 0,
      policies: policyCount || 0,
      rd_calls: rdCallCount || 0,
      partnerships: partnershipCount || 0,
      living_labs: livingLabCount || 0
    };

    // Calculate gaps
    const gaps = {
      challenges: Math.max(0, targets.challenges - current.challenges),
      pilots: Math.max(0, targets.pilots - current.pilots),
      programs: Math.max(0, targets.programs - current.programs),
      campaigns: Math.max(0, targets.campaigns - current.campaigns),
      events: Math.max(0, targets.events - current.events),
      policies: Math.max(0, targets.policies - current.policies),
      rd_calls: Math.max(0, targets.rd_calls - current.rd_calls),
      partnerships: Math.max(0, targets.partnerships - current.partnerships),
      living_labs: Math.max(0, targets.living_labs - current.living_labs)
    };

    // Calculate per-objective coverage
    const objectiveCoverage: ObjectiveCoverage[] = objectives.map((obj: any, index: number) => {
      const objId = obj.id || `obj-${index}`;
      const perObjTarget = {
        challenges: cascadeConfig.targets?.challenges_per_objective || 5,
        pilots: cascadeConfig.targets?.pilots_per_challenge || 2,
        programs: cascadeConfig.targets?.programs_per_objective || 2,
        campaigns: cascadeConfig.targets?.campaigns_per_objective || 2,
        events: cascadeConfig.targets?.events_per_objective || 3,
        policies: cascadeConfig.targets?.policies_per_objective || 1,
        rd_calls: cascadeConfig.targets?.rd_calls_per_objective || 1,
        partnerships: cascadeConfig.targets?.partnerships_per_objective || 2,
        living_labs: cascadeConfig.targets?.living_labs_per_objective || 1
      };
      
      // Distribute current counts evenly across objectives for simplification
      const perObjCurrent = {
        challenges: Math.floor(current.challenges / objectiveCount),
        pilots: Math.floor(current.pilots / objectiveCount),
        programs: Math.floor(current.programs / objectiveCount),
        campaigns: Math.floor(current.campaigns / objectiveCount),
        events: Math.floor(current.events / objectiveCount),
        policies: Math.floor(current.policies / objectiveCount),
        rd_calls: Math.floor(current.rd_calls / objectiveCount),
        partnerships: Math.floor(current.partnerships / objectiveCount),
        living_labs: Math.floor(current.living_labs / objectiveCount)
      };
      
      const perObjGaps = {
        challenges: Math.max(0, perObjTarget.challenges - perObjCurrent.challenges),
        pilots: Math.max(0, perObjTarget.pilots - perObjCurrent.pilots),
        programs: Math.max(0, perObjTarget.programs - perObjCurrent.programs),
        campaigns: Math.max(0, perObjTarget.campaigns - perObjCurrent.campaigns),
        events: Math.max(0, perObjTarget.events - perObjCurrent.events),
        policies: Math.max(0, perObjTarget.policies - perObjCurrent.policies),
        rd_calls: Math.max(0, perObjTarget.rd_calls - perObjCurrent.rd_calls),
        partnerships: Math.max(0, perObjTarget.partnerships - perObjCurrent.partnerships),
        living_labs: Math.max(0, perObjTarget.living_labs - perObjCurrent.living_labs)
      };

      const totalTarget = Object.values(perObjTarget).reduce((a, b) => a + b, 0);
      const totalCurrent = Object.values(perObjCurrent).reduce((a, b) => a + b, 0);
      const coverage_pct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 100;

      return {
        id: objId,
        title: obj.title_en || obj.title || obj.name_en || `Objective ${index + 1}`,
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
      programs: gaps.programs,
      campaigns: gaps.campaigns,
      events: gaps.events,
      policies: gaps.policies,
      rd_calls: gaps.rd_calls,
      partnerships: gaps.partnerships,
      living_labs: gaps.living_labs,
      total: Object.values(gaps).reduce((a, b) => a + b, 0)
    };

    // Calculate coverage percentage for each entity type
    const entityCoverage: Record<string, { current: number; target: number; coverage_pct: number }> = {};
    for (const [key, targetValue] of Object.entries(targets)) {
      const currentValue = current[key as keyof typeof current] || 0;
      entityCoverage[key] = {
        current: currentValue,
        target: targetValue,
        coverage_pct: targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 100
      };
    }

    const result = {
      plan_id: strategic_plan_id,
      plan_name: plan.name_en,
      analyzed_at: new Date().toISOString(),
      analysis_depth,
      
      // Summary metrics
      overall_coverage_pct: overallCoveragePct,
      total_objectives: objectiveCount,
      fully_covered_objectives: fullyCoveredCount,
      
      // Entity-level coverage - ALL 9 TYPES
      entity_coverage: entityCoverage,
      
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
      total_needed: totalGenerationNeeded.total,
      entity_counts: current
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
