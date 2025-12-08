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
    const { entity_type, entity_id, notification_type, recipients, evaluation_data } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Evaluation notification: ${notification_type} for ${entity_type}/${entity_id}`);

    const templates: Record<string, { title: string; message: string }> = {
      evaluation_assigned: {
        title: 'New Evaluation Assignment',
        message: 'You have been assigned to evaluate a new submission. Please review at your earliest convenience.'
      },
      evaluation_completed: {
        title: 'Evaluation Completed',
        message: 'An evaluation has been completed for your submission.'
      },
      evaluation_approved: {
        title: 'Submission Approved',
        message: 'Congratulations! Your submission has been approved after evaluation.'
      },
      evaluation_rejected: {
        title: 'Evaluation Decision',
        message: 'Your submission has been reviewed. Please check the feedback provided.'
      },
      consensus_reached: {
        title: 'Consensus Reached',
        message: 'The evaluation panel has reached consensus on a submission.'
      }
    };

    const template = templates[notification_type] || {
      title: 'Evaluation Update',
      message: 'There is an update regarding an evaluation.'
    };

    const notifications = [];
    for (const recipient of recipients || []) {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_email: recipient,
          title: template.title,
          message: template.message,
          notification_type: 'evaluation',
          entity_type,
          entity_id,
          metadata: { notification_type, ...evaluation_data },
          is_read: false
        })
        .select()
        .single();

      if (!error && notification) {
        notifications.push(notification);
      }
    }

    console.log(`Created ${notifications.length} evaluation notifications`);

    return new Response(JSON.stringify({ 
      success: true,
      notifications_created: notifications.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in evaluation-notifications:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
