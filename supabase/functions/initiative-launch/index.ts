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
    const { action, entity_type, entity_id, comments, launcher_email } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!entity_type || !entity_id || !action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "entity_type, entity_id, and action are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Initiative launch: ${action} for ${entity_type}/${entity_id}`);

    const isLaunch = action === 'launch' || action === 'approve';
    const now = new Date().toISOString();

    // Get entity details
    const { data: entity, error: entityError } = await supabase
      .from(entity_type === 'pilot' ? 'pilots' : entity_type === 'program' ? 'programs' : 'rd_projects')
      .select('*')
      .eq('id', entity_id)
      .single();

    if (entityError || !entity) {
      throw new Error(`${entity_type} not found`);
    }

    // Update entity status
    const updateData: Record<string, unknown> = {
      updated_at: now,
      status: isLaunch ? 'active' : 'rejected'
    };

    if (isLaunch) {
      updateData.launch_date = now;
      updateData.launched_by = launcher_email;
    } else {
      updateData.rejection_reason = comments;
    }

    const tableName = entity_type === 'pilot' ? 'pilots' : entity_type === 'program' ? 'programs' : 'rd_projects';
    const { error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', entity_id);

    if (updateError) {
      console.error("Error updating entity:", updateError);
      throw new Error("Failed to update initiative status");
    }

    // Create approval request record
    await supabase
      .from('approval_requests')
      .insert({
        entity_type,
        entity_id,
        request_type: 'initiative_launch',
        requester_email: (entity as Record<string, unknown>).created_by as string || 'system',
        approver_email: launcher_email,
        approval_status: isLaunch ? 'approved' : 'rejected',
        approved_at: isLaunch ? now : null,
        rejection_reason: isLaunch ? null : comments,
        metadata: { action, comments }
      });

    // Log activity
    const entityTitle = (entity as Record<string, unknown>).title_en || (entity as Record<string, unknown>).name_en || entity_id;
    await supabase
      .from('system_activities')
      .insert({
        activity_type: isLaunch ? 'initiative_launched' : 'initiative_rejected',
        entity_type,
        entity_id,
        description: `${entity_type} ${isLaunch ? 'launched' : 'rejected'}: ${entityTitle}`,
        metadata: { comments, launcher: launcher_email }
      });

    console.log(`Initiative ${isLaunch ? 'launched' : 'rejected'}: ${entity_type}/${entity_id}`);

    return new Response(JSON.stringify({ 
      success: true,
      entity_type,
      entity_id,
      action,
      status: isLaunch ? 'launched' : 'rejected'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in initiative-launch:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
