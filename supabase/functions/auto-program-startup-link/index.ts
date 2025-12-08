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
    const { program_id, startup_id, action } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Program-Startup link: ${action} - Program ${program_id}, Startup ${startup_id}`);

    let result;

    switch (action) {
      case 'link':
        const { data: link, error: linkError } = await supabase
          .from('program_startup_links')
          .insert({
            program_id,
            startup_id,
            linked_at: new Date().toISOString(),
            status: 'active'
          })
          .select()
          .single();

        if (linkError) throw linkError;
        result = { linked: true, link };
        break;

      case 'unlink':
        const { error: unlinkError } = await supabase
          .from('program_startup_links')
          .update({ status: 'inactive', unlinked_at: new Date().toISOString() })
          .eq('program_id', program_id)
          .eq('startup_id', startup_id);

        if (unlinkError) throw unlinkError;
        result = { unlinked: true };
        break;

      case 'auto_match':
        // Get program details
        const { data: program } = await supabase
          .from('programs')
          .select('sector_id, focus_areas, target_audience')
          .eq('id', program_id)
          .single();

        // Find matching startups
        const { data: startups } = await supabase
          .from('startups')
          .select('id, name_en, sector_id, stage')
          .eq('sector_id', program?.sector_id)
          .limit(10);

        result = { 
          potential_matches: startups || [],
          match_count: startups?.length || 0
        };
        break;

      default:
        // Get existing links
        const { data: links } = await supabase
          .from('program_startup_links')
          .select('*')
          .eq('program_id', program_id)
          .eq('status', 'active');

        result = { links: links || [] };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in auto-program-startup-link:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
