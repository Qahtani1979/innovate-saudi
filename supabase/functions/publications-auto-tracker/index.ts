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
    const { entity_type, entity_id, action } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Publications tracker: ${action} for ${entity_type} ${entity_id}`);

    let result;

    switch (action) {
      case 'track_publication':
        // Track a new publication
        const { data: publication, error: pubError } = await supabase
          .from('publications')
          .insert({
            entity_type,
            entity_id,
            status: 'published',
            published_at: new Date().toISOString()
          })
          .select()
          .single();

        if (pubError) throw pubError;
        result = { tracked: true, publication };
        break;

      case 'update_metrics':
        // Update publication metrics
        const { data: metrics } = await supabase
          .from('publication_metrics')
          .select('views, downloads, shares')
          .eq('entity_type', entity_type)
          .eq('entity_id', entity_id)
          .single();

        result = { metrics: metrics || { views: 0, downloads: 0, shares: 0 } };
        break;

      case 'increment_views':
        await supabase.rpc('increment_publication_views', { 
          p_entity_type: entity_type, 
          p_entity_id: entity_id 
        });
        result = { incremented: true };
        break;

      case 'get_report':
        // Generate publication report
        const { data: publications } = await supabase
          .from('publications')
          .select('*, publication_metrics(*)')
          .eq('entity_type', entity_type)
          .order('published_at', { ascending: false });

        const totalViews = publications?.reduce((sum, p) => 
          sum + (p.publication_metrics?.views || 0), 0) || 0;
        const totalDownloads = publications?.reduce((sum, p) => 
          sum + (p.publication_metrics?.downloads || 0), 0) || 0;

        result = {
          publications: publications || [],
          total_publications: publications?.length || 0,
          total_views: totalViews,
          total_downloads: totalDownloads
        };
        break;

      default:
        // Get publications for entity
        const { data: allPubs } = await supabase
          .from('publications')
          .select('*')
          .eq('entity_type', entity_type)
          .eq('entity_id', entity_id);

        result = { publications: allPubs || [] };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in publications-auto-tracker:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
