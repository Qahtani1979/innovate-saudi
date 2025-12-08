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
    const { solution_id, challenge_id, auto_match = true } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!solution_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "solution_id is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Auto matchmaker enrollment for solution: ${solution_id}`);

    // Get solution details
    const { data: solution, error: solutionError } = await supabase
      .from('solutions')
      .select('*')
      .eq('id', solution_id)
      .single();

    if (solutionError || !solution) {
      throw new Error("Solution not found");
    }

    // If specific challenge provided, create direct match
    if (challenge_id) {
      const { data: match, error: matchError } = await supabase
        .from('challenge_solution_matches')
        .insert({
          challenge_id,
          solution_id,
          match_type: 'manual',
          status: 'pending',
          matched_at: new Date().toISOString()
        })
        .select()
        .single();

      if (matchError) {
        console.error("Error creating match:", matchError);
      }

      return new Response(JSON.stringify({ 
        success: true,
        solution_id,
        matches: match ? [match] : [],
        match_count: match ? 1 : 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auto-match: Find challenges in the same sector/category
    if (auto_match) {
      const { data: challenges } = await supabase
        .from('challenges')
        .select('id, title_en, sector_id, category, keywords')
        .eq('status', 'open')
        .eq('is_deleted', false);

      const matches = [];
      const solutionKeywords = (solution as Record<string, unknown>).keywords as string[] || [];
      const solutionCategory = (solution as Record<string, unknown>).category;
      const solutionSector = (solution as Record<string, unknown>).sector_id;

      for (const challenge of challenges || []) {
        let score = 0;
        
        // Sector match
        if (solutionSector && challenge.sector_id === solutionSector) {
          score += 0.4;
        }
        
        // Category match
        if (solutionCategory && challenge.category === solutionCategory) {
          score += 0.3;
        }
        
        // Keyword overlap
        const challengeKeywords = challenge.keywords || [];
        const overlap = solutionKeywords.filter(k => 
          challengeKeywords.some((ck: string) => ck.toLowerCase().includes(k.toLowerCase()))
        ).length;
        if (overlap > 0) {
          score += Math.min(0.3, overlap * 0.1);
        }

        if (score >= 0.3) {
          // Check if match already exists
          const { data: existing } = await supabase
            .from('challenge_solution_matches')
            .select('id')
            .eq('challenge_id', challenge.id)
            .eq('solution_id', solution_id)
            .single();

          if (!existing) {
            const { data: newMatch } = await supabase
              .from('challenge_solution_matches')
              .insert({
                challenge_id: challenge.id,
                solution_id,
                match_type: 'auto',
                match_score: Math.round(score * 100),
                status: 'suggested',
                matched_at: new Date().toISOString()
              })
              .select()
              .single();

            if (newMatch) {
              matches.push(newMatch);
            }
          }
        }
      }

      console.log(`Created ${matches.length} auto-matches for solution ${solution_id}`);

      return new Response(JSON.stringify({ 
        success: true,
        solution_id,
        matches,
        match_count: matches.length
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      solution_id,
      matches: [],
      match_count: 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in auto-matchmaker-enrollment:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
