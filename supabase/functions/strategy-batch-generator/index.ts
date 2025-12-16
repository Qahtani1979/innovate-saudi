import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Strategy Batch Generator
 * 
 * Processes multiple queue items in batch, calling appropriate generators
 * and tracking results. Used for automated mass generation.
 * 
 * SUPPORTED ENTITY TYPES:
 * - challenge → strategy-challenge-generator → challenges table
 * - pilot → strategy-pilot-generator → pilots table
 * - program → strategy-program-generator → programs table
 * - campaign → strategy-campaign-generator → marketing_campaigns table
 * - event → strategy-event-planner → events table
 * - policy → strategy-policy-generator → policy_documents table
 * - partnership → strategy-partnership-matcher → partnerships table
 * - rd_call → strategy-rd-call-generator → rd_calls table
 * - living_lab → strategy-lab-research-generator → living_labs table
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      strategic_plan_id, 
      entity_type,
      batch_size = 5,
      auto_approve = false,
      min_quality_score = 70 
    } = await req.json();

    if (!strategic_plan_id) {
      throw new Error('strategic_plan_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch pending queue items
    let query = supabase
      .from('demand_queue')
      .select('*')
      .eq('strategic_plan_id', strategic_plan_id)
      .eq('status', 'pending')
      .order('priority_score', { ascending: false })
      .limit(batch_size);

    if (entity_type && entity_type !== 'all') {
      query = query.eq('entity_type', entity_type);
    }

    const { data: queueItems, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    if (!queueItems || queueItems.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending items in queue',
        processed: 0,
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];
    const batchId = crypto.randomUUID();

    // Complete generator function mapping for all 9 entity types
    const generatorMap: Record<string, string> = {
      challenge: 'strategy-challenge-generator',
      pilot: 'strategy-pilot-generator',
      program: 'strategy-program-theme-generator', // Programs use theme generator
      campaign: 'strategy-campaign-generator',
      event: 'strategy-event-planner',
      policy: 'strategy-policy-generator',
      partnership: 'strategy-partnership-matcher',
      rd_call: 'strategy-rd-call-generator',
      living_lab: 'strategy-lab-research-generator', // FIXED: was incorrectly using challenge-generator
      // Legacy/alias mappings
      solution: 'strategy-challenge-generator', // Solutions derive from challenges
    };

    // Table mapping for entity types
    const tableMap: Record<string, string> = {
      challenge: 'challenges',
      pilot: 'pilots',
      program: 'programs',
      campaign: 'marketing_campaigns',
      event: 'events',
      policy: 'policy_documents',
      partnership: 'partnerships',
      rd_call: 'rd_calls',
      living_lab: 'living_labs',
      solution: 'solutions'
    };

    for (const item of queueItems) {
      try {
        console.log(`Processing queue item ${item.id}, type: ${item.entity_type}`);
        
        // Mark as in progress
        await supabase
          .from('demand_queue')
          .update({ 
            status: 'in_progress', 
            last_attempt_at: new Date().toISOString(),
            batch_id: batchId 
          })
          .eq('id', item.id);

        // Call appropriate generator
        const generatorFn = generatorMap[item.entity_type] || 'strategy-challenge-generator';
        console.log(`Using generator: ${generatorFn} for entity type: ${item.entity_type}`);
        
        const { data: generated, error: genError } = await supabase.functions.invoke(generatorFn, {
          body: {
            strategic_plan_id,
            queue_item_id: item.id,
            prefilled_spec: item.prefilled_spec,
            auto_mode: true,
            // Pass objective context for better generation
            objective_id: item.objective_id,
            entity_type: item.entity_type
          }
        });

        if (genError) throw genError;

        // Extract entity ID from various generator response formats
        let entityId = generated?.id;
        if (!entityId) {
          // Try to get ID from array responses
          const entityKey = item.entity_type + 's'; // pluralize
          if (generated?.[entityKey]?.[0]?.id) {
            entityId = generated[entityKey][0].id;
          } else if (generated?.[item.entity_type]?.id) {
            entityId = generated[item.entity_type].id;
          }
        }

        // Get quality assessment
        const { data: assessment } = await supabase.functions.invoke('strategy-quality-assessor', {
          body: {
            entity_type: item.entity_type,
            entity_data: generated,
            queue_item: item,
            mode: 'quick'
          }
        });

        const qualityScore = assessment?.overall_score || 75;
        const status = auto_approve && qualityScore >= min_quality_score ? 'accepted' : 'review';

        // Update queue item
        await supabase
          .from('demand_queue')
          .update({
            status,
            generated_entity_id: entityId,
            generated_entity_type: item.entity_type,
            quality_score: qualityScore,
            quality_feedback: assessment,
            attempts: item.attempts + 1
          })
          .eq('id', item.id);

        // Log to generation history
        await supabase
          .from('generation_history')
          .insert({
            queue_item_id: item.id,
            strategic_plan_id,
            entity_type: item.entity_type,
            entity_id: entityId,
            attempt_number: item.attempts + 1,
            input_spec: item.prefilled_spec,
            output_entity: generated,
            quality_assessment: assessment,
            overall_score: qualityScore,
            outcome: status === 'accepted' ? 'accepted' : 'manual_edit'
          });

        results.push({
          queue_item_id: item.id,
          entity_type: item.entity_type,
          status,
          quality_score: qualityScore,
          generated_id: entityId,
          generator_used: generatorFn
        });

        console.log(`Successfully processed ${item.id}, entity_id: ${entityId}, score: ${qualityScore}`);

      } catch (itemError: unknown) {
        const errorMessage = itemError instanceof Error ? itemError.message : 'Unknown error';
        console.error(`Error processing item ${item.id}:`, itemError);
        
        // Mark as failed but keep pending for retry
        await supabase
          .from('demand_queue')
          .update({
            status: 'pending',
            attempts: item.attempts + 1,
            quality_feedback: { 
              error: errorMessage, 
              failed_at: new Date().toISOString() 
            }
          })
          .eq('id', item.id);

        results.push({
          queue_item_id: item.id,
          entity_type: item.entity_type,
          status: 'error',
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.status !== 'error').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`Batch complete: ${successCount} succeeded, ${errorCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      batch_id: batchId,
      processed: queueItems.length,
      succeeded: successCount,
      failed: errorCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Batch generation error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
