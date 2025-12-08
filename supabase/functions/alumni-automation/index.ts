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
    const { program_id, user_email, action } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Alumni automation: ${action} for program ${program_id}`);

    let result;

    switch (action) {
      case 'graduate':
        // Mark user as alumni
        const { data: enrollment, error: enrollError } = await supabase
          .from('program_enrollments')
          .update({ 
            status: 'graduated',
            graduation_date: new Date().toISOString()
          })
          .eq('program_id', program_id)
          .eq('user_email', user_email)
          .select()
          .single();

        if (enrollError) throw enrollError;

        // Add to alumni network
        await supabase.from('alumni_network').insert({
          user_email,
          program_id,
          graduation_date: new Date().toISOString(),
          status: 'active'
        });

        result = { graduated: true, enrollment };
        break;

      case 'send_newsletter':
        // Get all alumni for program
        const { data: alumni } = await supabase
          .from('alumni_network')
          .select('user_email')
          .eq('program_id', program_id)
          .eq('status', 'active');

        result = { 
          alumni_count: alumni?.length || 0,
          emails: alumni?.map(a => a.user_email) || []
        };
        break;

      case 'track_success':
        // Track alumni success stories
        const { data: stories } = await supabase
          .from('success_stories')
          .select('*')
          .eq('program_id', program_id);

        result = { stories: stories || [] };
        break;

      default:
        result = { message: 'No action specified' };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in alumni-automation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
