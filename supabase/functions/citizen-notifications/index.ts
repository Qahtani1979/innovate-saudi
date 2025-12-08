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
    const { user_id, user_email, notification_type, title, message, entity_type, entity_id, metadata } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!notification_type || !title) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "notification_type and title are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Creating citizen notification: ${notification_type} for ${user_email || user_id}`);

    // Insert notification
    const { data: notification, error: insertError } = await supabase
      .from('citizen_notifications')
      .insert({
        user_id,
        user_email,
        notification_type,
        title,
        message,
        entity_type,
        entity_id,
        metadata: metadata || {},
        is_read: false
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating notification:", insertError);
      throw new Error("Failed to create notification");
    }

    console.log(`Notification created: ${notification.id}`);

    return new Response(JSON.stringify({ 
      success: true,
      notification_id: notification.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in citizen-notifications:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
