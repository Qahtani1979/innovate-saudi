import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueuedEmail {
  id: string;
  template_key: string;
  recipient_email: string;
  recipient_user_id?: string;
  variables: Record<string, string>;
  language: string;
  priority: number;
  scheduled_for: string;
  status: string;
  attempts: number;
  max_attempts: number;
  source_type?: string;
  entity_type?: string;
  entity_id?: string;
  triggered_by?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 50;
    const maxRetries = body.max_retries || 3;
    
    console.log(`[queue-processor] Starting processing, batch size: ${batchSize}`);
    
    // Fetch pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', maxRetries)
      .order('priority', { ascending: true })
      .order('scheduled_for', { ascending: true })
      .limit(batchSize);
    
    if (fetchError) {
      throw new Error(`Failed to fetch queue: ${fetchError.message}`);
    }
    
    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('[queue-processor] No pending emails to process');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending emails' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[queue-processor] Processing ${pendingEmails.length} emails`);
    
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as { id: string; error: string }[]
    };
    
    for (const email of pendingEmails as QueuedEmail[]) {
      try {
        // Mark as processing
        await supabase
          .from('email_queue')
          .update({ 
            status: 'processing',
            last_attempt_at: new Date().toISOString(),
            attempts: email.attempts + 1
          })
          .eq('id', email.id);
        
        // Call the send-email function
        const sendResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_key: email.template_key,
            recipient_email: email.recipient_email,
            recipient_user_id: email.recipient_user_id,
            variables: email.variables,
            language: email.language,
            entity_type: email.entity_type,
            entity_id: email.entity_id,
            triggered_by: email.triggered_by || 'queue-processor'
          })
        });
        
        const sendResult = await sendResponse.json();
        
        if (sendResult.success) {
          // Mark as sent and delete from queue
          await supabase
            .from('email_queue')
            .update({ status: 'sent' })
            .eq('id', email.id);
          
          results.sent++;
          console.log(`[queue-processor] Sent: ${email.recipient_email}`);
        } else if (sendResult.skipped) {
          // User opted out - mark as skipped
          await supabase
            .from('email_queue')
            .update({ 
              status: 'skipped',
              error_message: sendResult.reason
            })
            .eq('id', email.id);
          
          results.skipped++;
          console.log(`[queue-processor] Skipped: ${email.recipient_email} - ${sendResult.reason}`);
        } else {
          // Failed - check if should retry
          const newAttempts = email.attempts + 1;
          const shouldRetry = newAttempts < email.max_attempts;
          
          await supabase
            .from('email_queue')
            .update({ 
              status: shouldRetry ? 'pending' : 'failed',
              error_message: sendResult.error,
              // If retrying, add exponential backoff (5min, 15min, 45min)
              scheduled_for: shouldRetry 
                ? new Date(Date.now() + Math.pow(3, newAttempts) * 5 * 60 * 1000).toISOString()
                : undefined
            })
            .eq('id', email.id);
          
          if (!shouldRetry) {
            results.failed++;
            results.errors.push({ id: email.id, error: sendResult.error });
          }
          console.log(`[queue-processor] ${shouldRetry ? 'Retry scheduled' : 'Failed'}: ${email.recipient_email}`);
        }
        
        results.processed++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[queue-processor] Error processing ${email.id}:`, errorMessage);
        
        // Mark as failed or pending for retry
        const newAttempts = email.attempts + 1;
        const shouldRetry = newAttempts < email.max_attempts;
        
        await supabase
          .from('email_queue')
          .update({ 
            status: shouldRetry ? 'pending' : 'failed',
            error_message: errorMessage,
            scheduled_for: shouldRetry 
              ? new Date(Date.now() + Math.pow(3, newAttempts) * 5 * 60 * 1000).toISOString()
              : undefined
          })
          .eq('id', email.id);
        
        if (!shouldRetry) {
          results.failed++;
          results.errors.push({ id: email.id, error: errorMessage });
        }
        results.processed++;
      }
    }
    
    console.log(`[queue-processor] Completed: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed`);
    
    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[queue-processor] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
