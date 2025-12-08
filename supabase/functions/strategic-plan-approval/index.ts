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
    const { plan_id, approver_email, action, comments } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Strategic plan approval: ${action} for plan ${plan_id}`);

    let result;

    switch (action) {
      case 'approve':
        const { data: approved, error: approveError } = await supabase
          .from('strategic_plans')
          .update({
            approval_status: 'approved',
            approved_by: approver_email,
            approved_at: new Date().toISOString(),
            approval_comments: comments
          })
          .eq('id', plan_id)
          .select()
          .single();

        if (approveError) throw approveError;
        result = { approved: true, plan: approved };
        break;

      case 'reject':
        const { data: rejected, error: rejectError } = await supabase
          .from('strategic_plans')
          .update({
            approval_status: 'rejected',
            rejected_by: approver_email,
            rejected_at: new Date().toISOString(),
            rejection_reason: comments
          })
          .eq('id', plan_id)
          .select()
          .single();

        if (rejectError) throw rejectError;
        result = { rejected: true, plan: rejected };
        break;

      case 'request_changes':
        const { data: changes, error: changesError } = await supabase
          .from('strategic_plans')
          .update({
            approval_status: 'changes_requested',
            changes_requested_by: approver_email,
            changes_requested_at: new Date().toISOString(),
            requested_changes: comments
          })
          .eq('id', plan_id)
          .select()
          .single();

        if (changesError) throw changesError;
        result = { changes_requested: true, plan: changes };
        break;

      case 'submit_for_approval':
        const { data: submitted, error: submitError } = await supabase
          .from('strategic_plans')
          .update({
            approval_status: 'pending',
            submitted_at: new Date().toISOString(),
            submitted_by: approver_email
          })
          .eq('id', plan_id)
          .select()
          .single();

        if (submitError) throw submitError;
        result = { submitted: true, plan: submitted };
        break;

      default:
        // Get approval status
        const { data: plan } = await supabase
          .from('strategic_plans')
          .select('id, title_en, approval_status, approved_by, approved_at')
          .eq('id', plan_id)
          .single();

        result = { plan };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategic-plan-approval:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
