import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Strategy Scheduled Analysis
 * 
 * Runs automated gap analysis on active strategic plans on a schedule.
 * Can be triggered by cron or manual invocation.
 * 
 * Features:
 * - Analyzes all active plans or specific plan
 * - Auto-generates queue when gaps exceed threshold
 * - Sends notifications for items needing review
 * - Logs automation runs
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { 
      strategic_plan_id,
      auto_generate_queue = true,
      queue_threshold = 5,
      notify_on_review = true,
      trigger_source = 'manual'
    } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting scheduled analysis...', { 
      strategic_plan_id, 
      trigger_source,
      timestamp: new Date().toISOString() 
    });

    // Get active strategic plans
    let plansQuery = supabase
      .from('strategic_plans')
      .select('id, name_en, status, cascade_config, objectives')
      .eq('status', 'active');

    if (strategic_plan_id) {
      plansQuery = plansQuery.eq('id', strategic_plan_id);
    }

    const { data: plans, error: plansError } = await plansQuery;
    if (plansError) throw plansError;

    if (!plans || plans.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No active strategic plans found',
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results: any[] = [];

    for (const plan of plans) {
      try {
        // Run gap analysis
        const { data: analysis, error: analysisError } = await supabase.functions.invoke('strategy-gap-analysis', {
          body: { 
            strategic_plan_id: plan.id, 
            analysis_depth: 'comprehensive' 
          }
        });

        if (analysisError) throw analysisError;

        // Save coverage snapshot
        const snapshotDate = new Date().toISOString().split('T')[0];
        await supabase
          .from('coverage_snapshots')
          .upsert({
            strategic_plan_id: plan.id,
            snapshot_date: snapshotDate,
            objective_coverage: analysis.objectives || [],
            entity_coverage: analysis.entity_coverage || {},
            gap_analysis: analysis.gaps || {},
            overall_coverage_pct: analysis.overall_coverage_pct,
            total_objectives: analysis.total_objectives,
            fully_covered_objectives: analysis.fully_covered_objectives,
            total_gap_items: analysis.total_generation_needed?.total || 0,
            trigger_source
          }, {
            onConflict: 'strategic_plan_id,snapshot_date'
          });

        let queueGenerated = false;
        let itemsCreated = 0;

        // Auto-generate queue if gaps exceed threshold
        if (auto_generate_queue && analysis.total_generation_needed?.total >= queue_threshold) {
          const { data: queueResult, error: queueError } = await supabase.functions.invoke('strategy-demand-queue-generator', {
            body: { 
              strategic_plan_id: plan.id,
              gap_analysis: analysis,
              max_items: 20
            }
          });

          if (!queueError && queueResult) {
            queueGenerated = true;
            itemsCreated = queueResult.items_created || 0;
          }
        }

        // Check for items needing review and notify
        if (notify_on_review) {
          const { data: reviewItems } = await supabase
            .from('demand_queue')
            .select('id, entity_type, prefilled_spec, quality_score')
            .eq('strategic_plan_id', plan.id)
            .eq('status', 'review');

          if (reviewItems && reviewItems.length > 0) {
            // Create notification for strategy managers
            await supabase
              .from('citizen_notifications')
              .insert({
                notification_type: 'strategy_review_needed',
                title: `${reviewItems.length} items need review for ${plan.name_en}`,
                message: `There are ${reviewItems.length} generated items requiring manual review for strategic plan "${plan.name_en}".`,
                entity_type: 'strategic_plan',
                entity_id: plan.id,
                metadata: {
                  review_count: reviewItems.length,
                  entity_types: [...new Set(reviewItems.map(i => i.entity_type))],
                  trigger_source
                }
              });

            console.log(`Created review notification for ${reviewItems.length} items`);
          }
        }

        results.push({
          plan_id: plan.id,
          plan_name: plan.name_en,
          coverage_pct: analysis.overall_coverage_pct,
          total_gaps: analysis.total_generation_needed?.total || 0,
          queue_generated: queueGenerated,
          items_created: itemsCreated,
          status: 'success'
        });

        console.log(`Analyzed plan ${plan.name_en}: ${analysis.overall_coverage_pct}% coverage`);

      } catch (planError: unknown) {
        const errorMessage = planError instanceof Error ? planError.message : 'Unknown error';
        console.error(`Error analyzing plan ${plan.id}:`, planError);
        
        results.push({
          plan_id: plan.id,
          plan_name: plan.name_en,
          status: 'error',
          error: errorMessage
        });
      }
    }

    // Log automation run (best effort)
    try {
      await supabase
        .from('automation_logs')
        .insert({
          automation_type: 'strategy_gap_analysis',
          trigger_source,
          status: 'completed',
          results_summary: {
            plans_analyzed: results.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length
          },
          detailed_results: results
        });
    } catch {
      console.log('Note: automation_logs table may not exist');
    }

    return new Response(JSON.stringify({
      success: true,
      analyzed_at: new Date().toISOString(),
      trigger_source,
      plans_analyzed: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Scheduled analysis error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
