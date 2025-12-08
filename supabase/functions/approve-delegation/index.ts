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
    const { delegation_id, delegationId, action, approved, comments } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Support both parameter styles
    const id = delegation_id || delegationId;
    const isApproved = approved !== undefined ? approved : action === 'approve';

    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "delegation_id is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing delegation ${id}: ${isApproved ? 'approve' : 'reject'}`);

    // Update delegation status
    const updateData: Record<string, unknown> = {
      approval_status: isApproved ? 'approved' : 'rejected',
      approval_date: new Date().toISOString(),
    };

    const { data: delegation, error: updateError } = await supabase
      .from('delegation_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating delegation:", updateError);
      throw new Error("Failed to update delegation");
    }

    // If approved, activate the delegation
    if (isApproved) {
      await supabase
        .from('delegation_rules')
        .update({ is_active: true })
        .eq('id', id);
    }

    console.log(`Delegation ${id} ${isApproved ? 'approved' : 'rejected'}`);

    return new Response(JSON.stringify({ 
      success: true,
      delegation_id: id,
      status: isApproved ? 'approved' : 'rejected'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in approve-delegation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
