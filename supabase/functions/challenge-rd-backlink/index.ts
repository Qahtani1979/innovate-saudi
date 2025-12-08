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
    const { challenge_id, rd_project_id, sync_all = false } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Challenge-R&D backlink: ${sync_all ? 'sync all' : `${challenge_id} <-> ${rd_project_id}`}`);

    const results = {
      challenges_updated: 0,
      rd_projects_processed: 0,
      links_created: 0
    };

    if (sync_all) {
      // Get all R&D projects with challenge links
      const { data: rdProjects } = await supabase
        .from('rd_projects')
        .select('id, challenge_ids')
        .not('challenge_ids', 'is', null);

      // Build a map of challenge -> rd_project_ids
      const challengeRdMap: Record<string, string[]> = {};

      for (const project of rdProjects || []) {
        const challengeIds = project.challenge_ids || [];
        for (const cid of challengeIds) {
          if (!challengeRdMap[cid]) {
            challengeRdMap[cid] = [];
          }
          if (!challengeRdMap[cid].includes(project.id)) {
            challengeRdMap[cid].push(project.id);
          }
        }
        results.rd_projects_processed++;
      }

      // Update each challenge with linked_rd_ids
      for (const [challengeId, rdIds] of Object.entries(challengeRdMap)) {
        const { error } = await supabase
          .from('challenges')
          .update({ linked_rd_ids: rdIds })
          .eq('id', challengeId);

        if (!error) {
          results.challenges_updated++;
          results.links_created += rdIds.length;
        }
      }
    } else if (challenge_id && rd_project_id) {
      // Single link operation
      const { data: challenge } = await supabase
        .from('challenges')
        .select('linked_rd_ids')
        .eq('id', challenge_id)
        .single();

      const currentLinks = challenge?.linked_rd_ids || [];
      if (!currentLinks.includes(rd_project_id)) {
        await supabase
          .from('challenges')
          .update({ linked_rd_ids: [...currentLinks, rd_project_id] })
          .eq('id', challenge_id);

        results.challenges_updated = 1;
        results.links_created = 1;
      }

      // Also update R&D project
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('challenge_ids')
        .eq('id', rd_project_id)
        .single();

      const currentChallengeLinks = rdProject?.challenge_ids || [];
      if (!currentChallengeLinks.includes(challenge_id)) {
        await supabase
          .from('rd_projects')
          .update({ challenge_ids: [...currentChallengeLinks, challenge_id] })
          .eq('id', rd_project_id);

        results.rd_projects_processed = 1;
      }
    }

    console.log(`Backlink complete: ${results.challenges_updated} challenges, ${results.links_created} links`);

    return new Response(JSON.stringify({ 
      success: true,
      ...results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in challenge-rd-backlink:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
