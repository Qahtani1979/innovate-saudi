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
    const { startup_id } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Calculating reputation for startup: ${startup_id}`);

    // Fetch startup data
    const { data: startup } = await supabase
      .from('startups')
      .select('*')
      .eq('id', startup_id)
      .single();

    if (!startup) {
      throw new Error('Startup not found');
    }

    // Calculate reputation components
    let reputation_score = 0;
    const breakdown: Record<string, number> = {};

    // 1. Funding score (0-25 points)
    const fundingScore = Math.min(25, (startup.funding_amount || 0) / 100000);
    breakdown.funding = fundingScore;
    reputation_score += fundingScore;

    // 2. Team score (0-20 points)
    const teamSize = startup.team_size || 1;
    const teamScore = Math.min(20, teamSize * 2);
    breakdown.team = teamScore;
    reputation_score += teamScore;

    // 3. Pilot participation (0-20 points)
    const { count: pilotCount } = await supabase
      .from('pilot_participants')
      .select('*', { count: 'exact', head: true })
      .eq('startup_id', startup_id);
    
    const pilotScore = Math.min(20, (pilotCount || 0) * 5);
    breakdown.pilots = pilotScore;
    reputation_score += pilotScore;

    // 4. Awards/Recognition (0-15 points)
    const { count: awardCount } = await supabase
      .from('startup_awards')
      .select('*', { count: 'exact', head: true })
      .eq('startup_id', startup_id);
    
    const awardScore = Math.min(15, (awardCount || 0) * 5);
    breakdown.awards = awardScore;
    reputation_score += awardScore;

    // 5. Profile completeness (0-10 points)
    const fields = ['description_en', 'logo_url', 'website', 'founding_date', 'sector_id'];
    const completedFields = fields.filter(f => startup[f]).length;
    const completenessScore = (completedFields / fields.length) * 10;
    breakdown.profile_completeness = completenessScore;
    reputation_score += completenessScore;

    // 6. Activity score (0-10 points)
    const { count: activityCount } = await supabase
      .from('startup_activities')
      .select('*', { count: 'exact', head: true })
      .eq('startup_id', startup_id)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    
    const activityScore = Math.min(10, (activityCount || 0) * 2);
    breakdown.activity = activityScore;
    reputation_score += activityScore;

    // Update startup reputation
    await supabase
      .from('startups')
      .update({ 
        reputation_score: Math.round(reputation_score),
        reputation_breakdown: breakdown,
        reputation_updated_at: new Date().toISOString()
      })
      .eq('id', startup_id);

    return new Response(JSON.stringify({ 
      success: true, 
      startup_id,
      reputation_score: Math.round(reputation_score),
      breakdown
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in calculate-startup-reputation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
