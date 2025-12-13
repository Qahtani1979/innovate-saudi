import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // For bounce events
    bounce?: {
      message: string;
      code?: string;
    };
    // For delivery events
    delivered_at?: string;
    // For open events
    opened_at?: string;
    // For click events
    clicked_at?: string;
    click?: {
      link: string;
    };
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const payload: ResendWebhookPayload = await req.json();
    
    console.log(`[resend-webhook] Received event: ${payload.type}`);
    console.log(`[resend-webhook] Email ID: ${payload.data.email_id}`);
    
    const recipientEmail = payload.data.to?.[0];
    
    if (!recipientEmail) {
      console.log("[resend-webhook] No recipient email found");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Find the email log entry by subject and recipient (since we don't store Resend email_id)
    // In production, you'd want to store the Resend email_id when sending
    const { data: emailLog, error: findError } = await supabase
      .from('email_logs')
      .select('id, status')
      .eq('recipient_email', recipientEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (findError || !emailLog) {
      console.log(`[resend-webhook] No matching email log found for ${recipientEmail}`);
      // Still return success to Resend
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`[resend-webhook] Found email log: ${emailLog.id}`);
    
    // Update based on event type
    let updateData: Record<string, any> = {};
    
    switch (payload.type) {
      case 'email.delivered':
        updateData = {
          status: 'delivered',
          delivered_at: payload.data.delivered_at || new Date().toISOString()
        };
        break;
        
      case 'email.opened':
        updateData = {
          status: 'opened',
          opened_at: payload.data.opened_at || new Date().toISOString()
        };
        break;
        
      case 'email.clicked':
        updateData = {
          status: 'clicked',
          clicked_at: new Date().toISOString()
        };
        break;
        
      case 'email.bounced':
        updateData = {
          status: 'bounced',
          bounced_at: new Date().toISOString(),
          error_message: payload.data.bounce?.message || 'Email bounced'
        };
        
        // Also mark user's email as problematic for future sends
        console.log(`[resend-webhook] Marking email as bounced: ${recipientEmail}`);
        
        // Optionally disable email notifications for bounced addresses
        // await supabase
        //   .from('user_notification_preferences')
        //   .update({ email_notifications: false })
        //   .eq('user_email', recipientEmail);
        break;
        
      case 'email.complained':
        updateData = {
          status: 'complained',
          error_message: 'User marked as spam'
        };
        
        // Disable marketing emails for this user
        await supabase
          .from('user_notification_preferences')
          .update({
            email_categories: supabase.rpc('jsonb_set', {
              target: 'email_categories',
              path: '{marketing}',
              new_value: 'false'
            })
          })
          .eq('user_email', recipientEmail);
        break;
        
      default:
        console.log(`[resend-webhook] Unhandled event type: ${payload.type}`);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
    
    // Update the email log
    const { error: updateError } = await supabase
      .from('email_logs')
      .update(updateData)
      .eq('id', emailLog.id);
    
    if (updateError) {
      console.error(`[resend-webhook] Failed to update email log:`, updateError);
    } else {
      console.log(`[resend-webhook] Updated email log ${emailLog.id} with status: ${updateData.status}`);
    }
    
    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: true,
        event_type: payload.type,
        email_log_id: emailLog.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[resend-webhook] Error:", error);
    
    // Still return 200 to Resend to prevent retries
    return new Response(
      JSON.stringify({ received: true, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
