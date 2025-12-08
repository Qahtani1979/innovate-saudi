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
    const { entity_type, entity_id, criteria } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Strategic priority scoring for ${entity_type}: ${entity_id}`);

    // Default scoring weights
    const weights = {
      strategic_alignment: 0.25,
      impact_potential: 0.20,
      feasibility: 0.20,
      resource_efficiency: 0.15,
      innovation_level: 0.10,
      stakeholder_support: 0.10
    };

    // Calculate scores
    const scores: Record<string, number> = {};
    let totalScore = 0;

    for (const [criterion, weight] of Object.entries(weights)) {
      const score = criteria?.[criterion] || 50; // Default to 50 if not provided
      scores[criterion] = score;
      totalScore += score * weight;
    }

    // Determine priority level
    let priorityLevel: string;
    if (totalScore >= 80) {
      priorityLevel = 'critical';
    } else if (totalScore >= 65) {
      priorityLevel = 'high';
    } else if (totalScore >= 50) {
      priorityLevel = 'medium';
    } else {
      priorityLevel = 'low';
    }

    // Save priority score
    const { data: priority, error: priorityError } = await supabase
      .from('strategic_priorities')
      .upsert({
        entity_type,
        entity_id,
        priority_score: Math.round(totalScore),
        priority_level: priorityLevel,
        criteria_scores: scores,
        calculated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (priorityError) {
      console.warn('Could not save priority score:', priorityError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      entity_type,
      entity_id,
      priority_score: Math.round(totalScore),
      priority_level: priorityLevel,
      criteria_scores: scores,
      weights
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategic-priority-scoring:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
