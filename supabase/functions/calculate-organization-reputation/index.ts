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
    const { organization_id, calculate_all = false } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Calculating reputation for ${organization_id || 'all organizations'}`);

    let organizations;
    if (calculate_all) {
      const { data } = await supabase.from('organizations').select('id');
      organizations = data || [];
    } else if (organization_id) {
      organizations = [{ id: organization_id }];
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "organization_id or calculate_all required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const org of organizations) {
      // Get solutions by this organization
      const { data: solutions } = await supabase
        .from('solutions')
        .select('id, status, rating, review_count')
        .eq('provider_id', org.id)
        .eq('is_deleted', false);

      // Get pilots involving this organization
      const { data: pilots } = await supabase
        .from('pilots')
        .select('id, status, success_metrics')
        .eq('provider_id', org.id)
        .eq('is_deleted', false);

      // Get contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, status, contract_value')
        .eq('provider_id', org.id)
        .eq('is_deleted', false);

      // Calculate metrics
      const totalSolutions = solutions?.length || 0;
      const verifiedSolutions = solutions?.filter(s => s.status === 'verified').length || 0;
      const avgRating = (solutions || []).reduce((sum, s) => sum + (s.rating || 0), 0) / Math.max(totalSolutions, 1);
      
      const totalPilots = pilots?.length || 0;
      const successfulPilots = pilots?.filter(p => p.status === 'completed' || p.status === 'scaled').length || 0;
      
      const totalContracts = contracts?.length || 0;
      const activeContracts = contracts?.filter(c => c.status === 'active').length || 0;
      const contractValue = contracts?.reduce((sum, c) => sum + (c.contract_value || 0), 0) || 0;

      // Calculate reputation score (0-100)
      const solutionScore = Math.min(30, verifiedSolutions * 5);
      const ratingScore = Math.min(25, avgRating * 5);
      const pilotScore = Math.min(25, (successfulPilots / Math.max(totalPilots, 1)) * 25);
      const contractScore = Math.min(20, activeContracts * 5);

      const reputationScore = Math.round(solutionScore + ratingScore + pilotScore + contractScore);

      // Update organization
      await supabase
        .from('organizations')
        .update({
          reputation_score: reputationScore,
          reputation_factors: {
            solution_score: solutionScore,
            rating_score: ratingScore,
            pilot_score: pilotScore,
            contract_score: contractScore,
            total_solutions: totalSolutions,
            verified_solutions: verifiedSolutions,
            avg_rating: Math.round(avgRating * 10) / 10,
            total_pilots: totalPilots,
            successful_pilots: successfulPilots,
            active_contracts: activeContracts,
            contract_value: contractValue
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', org.id);

      results.push({ organization_id: org.id, reputation_score: reputationScore });
    }

    console.log(`Updated reputation for ${results.length} organizations`);

    return new Response(JSON.stringify({ 
      success: true,
      updated: results.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in calculate-organization-reputation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
