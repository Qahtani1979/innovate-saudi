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
    const { provider_id, challenge_id, match_type, action } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Provider match notification: ${action} for provider ${provider_id}`);

    let result;

    switch (action) {
      case 'notify_match':
        // Get provider details
        const { data: provider } = await supabase
          .from('providers')
          .select('contact_email, name_en')
          .eq('id', provider_id)
          .single();

        // Get challenge details
        const { data: challenge } = await supabase
          .from('challenges')
          .select('title_en, code')
          .eq('id', challenge_id)
          .single();

        // Create notification
        const { data: notification, error: notifError } = await supabase
          .from('notifications')
          .insert({
            recipient_email: provider?.contact_email,
            notification_type: 'provider_match',
            title: `New Challenge Match: ${challenge?.title_en}`,
            message: `Your solutions have been matched with challenge ${challenge?.code}`,
            entity_type: 'challenge',
            entity_id: challenge_id,
            metadata: { provider_id, match_type },
            is_read: false
          })
          .select()
          .single();

        if (notifError) throw notifError;
        result = { notified: true, notification };
        break;

      case 'get_matches':
        // Get all matches for provider
        const { data: matches } = await supabase
          .from('challenge_solution_matches')
          .select('*, challenges(*), solutions(*)')
          .eq('solutions.provider_id', provider_id);

        result = { matches: matches || [] };
        break;

      case 'accept_match':
        // Accept a match
        const { error: acceptError } = await supabase
          .from('challenge_solution_matches')
          .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('challenge_id', challenge_id)
          .eq('solution_id', provider_id);

        if (acceptError) throw acceptError;
        result = { accepted: true };
        break;

      case 'decline_match':
        // Decline a match
        const { error: declineError } = await supabase
          .from('challenge_solution_matches')
          .update({ 
            status: 'declined',
            declined_at: new Date().toISOString()
          })
          .eq('challenge_id', challenge_id)
          .eq('solution_id', provider_id);

        if (declineError) throw declineError;
        result = { declined: true };
        break;

      default:
        result = { message: 'No action specified' };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in provider-match-notifications:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
