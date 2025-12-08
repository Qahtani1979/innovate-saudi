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
    const { trigger_type, entity_type, entity_id, recipients, data } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!trigger_type) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "trigger_type is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Auto notification trigger: ${trigger_type} for ${entity_type}/${entity_id}`);

    // Define notification templates
    const templates: Record<string, { title: string; message: string; type: string }> = {
      idea_approved: {
        title: 'Your idea has been approved!',
        message: 'Congratulations! Your submitted idea has been reviewed and approved.',
        type: 'success'
      },
      idea_rejected: {
        title: 'Idea review completed',
        message: 'Your submitted idea has been reviewed. Please check the feedback.',
        type: 'info'
      },
      pilot_started: {
        title: 'Pilot project launched',
        message: 'A new pilot project you are following has started.',
        type: 'info'
      },
      pilot_completed: {
        title: 'Pilot project completed',
        message: 'A pilot project you are following has been completed.',
        type: 'success'
      },
      solution_matched: {
        title: 'New solution match found',
        message: 'A solution has been matched to a challenge you are following.',
        type: 'info'
      },
      evaluation_required: {
        title: 'Evaluation required',
        message: 'You have been assigned to evaluate a submission.',
        type: 'action'
      },
      deadline_reminder: {
        title: 'Upcoming deadline',
        message: 'You have an upcoming deadline. Please review your tasks.',
        type: 'warning'
      },
      status_change: {
        title: 'Status updated',
        message: 'The status of an item you are following has been updated.',
        type: 'info'
      }
    };

    const template = templates[trigger_type] || {
      title: 'Notification',
      message: data?.message || 'You have a new notification.',
      type: 'info'
    };

    // Determine recipients
    let targetRecipients = recipients || [];
    
    if (!targetRecipients.length && entity_type && entity_id) {
      // Get followers of this entity
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_email')
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .eq('notify_on_updates', true);
      
      targetRecipients = followers?.map(f => f.follower_email) || [];
    }

    // Create notifications for each recipient
    const notifications = [];
    for (const recipient of targetRecipients) {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_email: recipient,
          title: template.title,
          message: template.message,
          notification_type: template.type,
          entity_type,
          entity_id,
          metadata: { trigger_type, ...data },
          is_read: false
        })
        .select()
        .single();

      if (!error && notification) {
        notifications.push(notification);
      }
    }

    console.log(`Created ${notifications.length} notifications for trigger: ${trigger_type}`);

    return new Response(JSON.stringify({ 
      success: true,
      trigger_type,
      notifications_created: notifications.length,
      recipients: targetRecipients
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in auto-notification-triggers:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
