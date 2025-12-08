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
    const { action, pilot_id, phase, amount, comments, approver_email } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!pilot_id || !action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "pilot_id and action are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Budget approval: ${action} for pilot ${pilot_id}, phase: ${phase}, amount: ${amount}`);

    // Get pilot details
    const { data: pilot, error: pilotError } = await supabase
      .from('pilots')
      .select('*')
      .eq('id', pilot_id)
      .single();

    if (pilotError || !pilot) {
      throw new Error("Pilot not found");
    }

    const isApproved = action === 'approve';
    const now = new Date().toISOString();

    // Update pilot budget status
    const updateData: Record<string, unknown> = {
      updated_at: now
    };

    if (isApproved) {
      updateData.budget_approved = true;
      updateData.budget_approved_date = now;
      updateData.budget_approved_by = approver_email;
      if (amount) {
        updateData.approved_budget = amount;
      }
    } else {
      updateData.budget_approved = false;
      updateData.budget_rejection_reason = comments;
    }

    const { error: updateError } = await supabase
      .from('pilots')
      .update(updateData)
      .eq('id', pilot_id);

    if (updateError) {
      console.error("Error updating pilot:", updateError);
      throw new Error("Failed to update pilot budget status");
    }

    // Create approval request record
    const { error: requestError } = await supabase
      .from('approval_requests')
      .insert({
        entity_type: 'pilot',
        entity_id: pilot_id,
        request_type: 'budget_approval',
        requester_email: pilot.created_by || 'system',
        approver_email,
        approval_status: isApproved ? 'approved' : 'rejected',
        approved_at: isApproved ? now : null,
        rejection_reason: isApproved ? null : comments,
        metadata: { phase, amount, comments }
      });

    if (requestError) {
      console.error("Error creating approval request:", requestError);
    }

    // Log activity
    await supabase
      .from('system_activities')
      .insert({
        activity_type: isApproved ? 'budget_approved' : 'budget_rejected',
        entity_type: 'pilot',
        entity_id: pilot_id,
        description: `Budget ${isApproved ? 'approved' : 'rejected'} for pilot: ${pilot.title_en}`,
        metadata: { phase, amount, comments, approver: approver_email }
      });

    console.log(`Budget ${isApproved ? 'approved' : 'rejected'} for pilot ${pilot_id}`);

    return new Response(JSON.stringify({ 
      success: true,
      pilot_id,
      action,
      status: isApproved ? 'approved' : 'rejected'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in budget-approval:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
