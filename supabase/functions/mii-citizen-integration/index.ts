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
    const { action, user_email, data } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`MII Citizen Integration: ${action} for ${user_email}`);

    let result;

    switch (action) {
      case 'sync_profile':
        // Sync citizen profile with MII data
        const { data: profile, error: profileError } = await supabase
          .from('citizen_profiles')
          .upsert({
            user_email,
            ...data,
            synced_at: new Date().toISOString(),
            source: 'mii'
          })
          .select()
          .single();

        if (profileError) throw profileError;
        result = { synced: true, profile };
        break;

      case 'verify_identity':
        // Verify citizen identity
        const verified = data?.national_id && data?.national_id.length === 10;
        
        if (verified) {
          await supabase
            .from('citizen_profiles')
            .update({ 
              is_verified: true, 
              verified_at: new Date().toISOString() 
            })
            .eq('user_email', user_email);
        }

        result = { verified };
        break;

      case 'get_services':
        // Get available MII services for citizen
        const { data: services } = await supabase
          .from('mii_services')
          .select('*')
          .eq('is_active', true);

        result = { services: services || [] };
        break;

      case 'submit_request':
        // Submit a service request
        const { data: request, error: requestError } = await supabase
          .from('mii_service_requests')
          .insert({
            user_email,
            service_id: data?.service_id,
            request_data: data?.request_data,
            status: 'pending',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (requestError) throw requestError;
        result = { submitted: true, request };
        break;

      default:
        // Get citizen status
        const { data: citizen } = await supabase
          .from('citizen_profiles')
          .select('*')
          .eq('user_email', user_email)
          .single();

        result = { citizen };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in mii-citizen-integration:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
