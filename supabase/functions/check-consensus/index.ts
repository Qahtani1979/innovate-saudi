import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entity_type, entity_id, required_approvals = 2, threshold = 0.7 } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!entity_type || !entity_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "entity_type and entity_id are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Checking consensus for ${entity_type}/${entity_id}`);

    // Get all evaluations for this entity
    const { data: evaluations, error: evalError } = await supabase
      .from('expert_evaluations')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .eq('status', 'submitted');

    if (evalError) {
      console.error("Error fetching evaluations:", evalError);
      throw new Error("Failed to fetch evaluations");
    }

    const totalEvaluations = evaluations?.length || 0;
    
    if (totalEvaluations < required_approvals) {
      return new Response(JSON.stringify({ 
        success: true,
        consensus_reached: false,
        reason: 'insufficient_evaluations',
        current_count: totalEvaluations,
        required_count: required_approvals,
        evaluations: evaluations || []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate consensus metrics
    const scores = evaluations!.map(e => e.score || 0);
    const recommendations = evaluations!.map(e => e.recommendation);
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const scoreVariance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
    const scoreStdDev = Math.sqrt(scoreVariance);
    
    // Check recommendation consensus
    const approvalCount = recommendations.filter(r => r === 'approve' || r === 'accept').length;
    const rejectionCount = recommendations.filter(r => r === 'reject' || r === 'decline').length;
    const revisionCount = recommendations.filter(r => r === 'revise' || r === 'needs_work').length;
    
    const approvalRate = approvalCount / totalEvaluations;
    const rejectionRate = rejectionCount / totalEvaluations;
    
    // Determine consensus
    let consensusReached = false;
    let consensusDecision = 'pending';
    let consensusStrength = 0;
    
    if (approvalRate >= threshold) {
      consensusReached = true;
      consensusDecision = 'approved';
      consensusStrength = approvalRate;
    } else if (rejectionRate >= threshold) {
      consensusReached = true;
      consensusDecision = 'rejected';
      consensusStrength = rejectionRate;
    } else if (scoreStdDev < 15 && totalEvaluations >= required_approvals) {
      // Low variance in scores indicates agreement
      consensusReached = true;
      consensusDecision = avgScore >= 70 ? 'approved' : avgScore < 50 ? 'rejected' : 'needs_revision';
      consensusStrength = 1 - (scoreStdDev / 50);
    }

    const result = {
      success: true,
      consensus_reached: consensusReached,
      consensus_decision: consensusDecision,
      consensus_strength: Math.round(consensusStrength * 100) / 100,
      metrics: {
        total_evaluations: totalEvaluations,
        required_approvals,
        average_score: Math.round(avgScore * 10) / 10,
        score_std_dev: Math.round(scoreStdDev * 10) / 10,
        approval_count: approvalCount,
        rejection_count: rejectionCount,
        revision_count: revisionCount,
        approval_rate: Math.round(approvalRate * 100) / 100,
        rejection_rate: Math.round(rejectionRate * 100) / 100
      },
      evaluations: evaluations
    };

    console.log(`Consensus check complete: ${consensusDecision} (strength: ${consensusStrength})`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in check-consensus:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
