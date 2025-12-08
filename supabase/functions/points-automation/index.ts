import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Points configuration
const POINTS_CONFIG: Record<string, number> = {
  idea_submitted: 10,
  idea_approved: 25,
  idea_converted_challenge: 50,
  idea_converted_pilot: 100,
  vote_cast: 2,
  vote_received: 5,
  comment_posted: 3,
  feedback_submitted: 5,
  challenge_resolved: 100,
  pilot_completed: 200,
  badge_earned: 50
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_email, action, points_override, metadata } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "action is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pointsToAward = points_override || POINTS_CONFIG[action] || 0;

    if (pointsToAward === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        points_awarded: 0,
        message: "No points for this action"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Points automation: ${action} = ${pointsToAward} points for ${user_email || user_id}`);

    // Get or create citizen points record
    let { data: citizenPoints, error: fetchError } = await supabase
      .from('citizen_points')
      .select('*')
      .or(`user_id.eq.${user_id},user_email.eq.${user_email}`)
      .single();

    if (fetchError || !citizenPoints) {
      // Create new record
      const { data: newRecord, error: createError } = await supabase
        .from('citizen_points')
        .insert({
          user_id,
          user_email,
          points: pointsToAward,
          total_earned: pointsToAward,
          total_spent: 0,
          level: 1,
          last_activity_date: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating points record:", createError);
        throw new Error("Failed to create points record");
      }

      citizenPoints = newRecord;
    } else {
      // Update existing record
      const newTotal = (citizenPoints.points || 0) + pointsToAward;
      const newTotalEarned = (citizenPoints.total_earned || 0) + pointsToAward;
      const newLevel = Math.floor(newTotalEarned / 100) + 1;

      const { error: updateError } = await supabase
        .from('citizen_points')
        .update({
          points: newTotal,
          total_earned: newTotalEarned,
          level: newLevel,
          last_activity_date: new Date().toISOString()
        })
        .eq('id', citizenPoints.id);

      if (updateError) {
        console.error("Error updating points:", updateError);
        throw new Error("Failed to update points");
      }

      citizenPoints.points = newTotal;
      citizenPoints.total_earned = newTotalEarned;
      citizenPoints.level = newLevel;
    }

    // Check for badge unlocks
    const badgeThresholds = [
      { points: 100, badge: 'Bronze Contributor' },
      { points: 500, badge: 'Silver Innovator' },
      { points: 1000, badge: 'Gold Champion' },
      { points: 5000, badge: 'Platinum Pioneer' }
    ];

    for (const threshold of badgeThresholds) {
      if (citizenPoints.total_earned >= threshold.points) {
        // Check if badge already exists
        const { data: existingBadge } = await supabase
          .from('citizen_badges')
          .select('id')
          .eq('user_email', user_email)
          .eq('badge_name', threshold.badge)
          .single();

        if (!existingBadge) {
          await supabase
            .from('citizen_badges')
            .insert({
              user_id,
              user_email,
              badge_type: 'points',
              badge_name: threshold.badge,
              earned_at: new Date().toISOString()
            });
        }
      }
    }

    console.log(`Awarded ${pointsToAward} points. New total: ${citizenPoints.points}`);

    return new Response(JSON.stringify({ 
      success: true,
      points_awarded: pointsToAward,
      total_points: citizenPoints.points,
      total_earned: citizenPoints.total_earned,
      level: citizenPoints.level
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in points-automation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
