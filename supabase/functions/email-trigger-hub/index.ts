import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TriggerRequest {
  // Trigger identification
  trigger: string; // e.g., 'challenge.approved', 'pilot.created'
  
  // Entity context
  entity_type?: string;
  entity_id?: string;
  entity_data?: Record<string, any>; // Full entity data for variable extraction
  
  // Recipient override (optional - auto-detected if not provided)
  recipient_email?: string;
  recipient_user_id?: string;
  additional_recipients?: string[];
  
  // Variable override (optional - auto-extracted from entity_data)
  variables?: Record<string, string>;
  
  // Options
  language?: 'en' | 'ar';
  skip_preferences?: boolean;
  priority?: number; // 1-10, lower = higher priority
  delay_seconds?: number;
  triggered_by?: string;
}

interface TriggerConfig {
  trigger_key: string;
  template_key: string;
  is_active: boolean;
  recipient_field: string;
  additional_recipients_field?: string;
  variable_mapping: Record<string, string>;
  respect_preferences: boolean;
  priority: number;
  delay_seconds: number;
}

// Extract value from nested object using dot notation
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return null;
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Map entity data to template variables using config mapping
function mapVariables(
  entityData: Record<string, any>,
  mapping: Record<string, string>,
  overrides?: Record<string, string>
): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Apply mapping
  for (const [templateVar, entityField] of Object.entries(mapping)) {
    const value = getNestedValue(entityData, entityField);
    if (value !== null && value !== undefined) {
      variables[templateVar] = String(value);
    }
  }
  
  // Apply overrides
  if (overrides) {
    Object.assign(variables, overrides);
  }
  
  return variables;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const request: TriggerRequest = await req.json();
    
    console.log(`[email-trigger-hub] Received trigger: ${request.trigger}`);
    
    if (!request.trigger) {
      return new Response(
        JSON.stringify({ success: false, error: "trigger is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch trigger configuration
    const { data: config, error: configError } = await supabase
      .from('email_trigger_config')
      .select('*')
      .eq('trigger_key', request.trigger)
      .eq('is_active', true)
      .single();
    
    if (configError || !config) {
      console.log(`[email-trigger-hub] No active config for trigger: ${request.trigger}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `No active trigger configuration found for: ${request.trigger}`,
          skipped: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const triggerConfig = config as TriggerConfig;
    console.log(`[email-trigger-hub] Using template: ${triggerConfig.template_key}`);
    
    // Determine recipients
    let recipients: string[] = [];
    
    if (request.recipient_email) {
      recipients.push(request.recipient_email);
    } else if (request.entity_data && triggerConfig.recipient_field) {
      const recipientValue = getNestedValue(request.entity_data, triggerConfig.recipient_field);
      if (recipientValue) {
        if (Array.isArray(recipientValue)) {
          recipients.push(...recipientValue);
        } else {
          recipients.push(String(recipientValue));
        }
      }
    }
    
    // Add additional recipients from config
    if (request.entity_data && triggerConfig.additional_recipients_field) {
      const additionalValue = getNestedValue(request.entity_data, triggerConfig.additional_recipients_field);
      if (additionalValue) {
        if (Array.isArray(additionalValue)) {
          recipients.push(...additionalValue);
        } else {
          recipients.push(String(additionalValue));
        }
      }
    }
    
    // Add explicit additional recipients
    if (request.additional_recipients) {
      recipients.push(...request.additional_recipients);
    }
    
    // Deduplicate and filter valid emails
    recipients = [...new Set(recipients)].filter(email => 
      email && email.includes('@') && email.length > 3
    );
    
    if (recipients.length === 0) {
      console.log(`[email-trigger-hub] No valid recipients for trigger: ${request.trigger}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No valid recipients found",
          skipped: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[email-trigger-hub] Recipients: ${recipients.join(', ')}`);
    
    // Map variables
    const variableMapping = triggerConfig.variable_mapping as Record<string, string> || {};
    const variables = mapVariables(
      request.entity_data || {},
      variableMapping,
      request.variables
    );
    
    console.log(`[email-trigger-hub] Variables:`, variables);
    
    // Calculate scheduled time
    const delaySeconds = request.delay_seconds ?? triggerConfig.delay_seconds ?? 0;
    const scheduledFor = new Date(Date.now() + delaySeconds * 1000);
    
    // Queue emails for each recipient
    const queuedEmails = [];
    const errors = [];
    
    for (const recipientEmail of recipients) {
      // Get user ID if available
      let recipientUserId = request.recipient_user_id;
      if (!recipientUserId) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_email', recipientEmail)
          .single();
        recipientUserId = profile?.user_id;
      }
      
      // If delay is 0, send immediately via send-email function
      if (delaySeconds === 0) {
        try {
          const sendResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template_key: triggerConfig.template_key,
              recipient_email: recipientEmail,
              recipient_user_id: recipientUserId,
              variables,
              language: request.language,
              force_send: request.skip_preferences || !triggerConfig.respect_preferences,
              entity_type: request.entity_type,
              entity_id: request.entity_id,
              triggered_by: request.triggered_by || `trigger:${request.trigger}`
            })
          });
          
          const sendResult = await sendResponse.json();
          
          if (sendResult.success) {
            queuedEmails.push({ recipient: recipientEmail, status: 'sent' });
          } else if (sendResult.skipped) {
            queuedEmails.push({ recipient: recipientEmail, status: 'skipped', reason: sendResult.reason });
          } else {
            errors.push({ recipient: recipientEmail, error: sendResult.error });
          }
        } catch (err) {
          errors.push({ recipient: recipientEmail, error: String(err) });
        }
      } else {
        // Queue for later sending
        const { error: queueError } = await supabase
          .from('email_queue')
          .insert({
            template_key: triggerConfig.template_key,
            recipient_email: recipientEmail,
            recipient_user_id: recipientUserId,
            variables,
            language: request.language || 'en',
            priority: request.priority ?? triggerConfig.priority ?? 5,
            scheduled_for: scheduledFor.toISOString(),
            source_type: 'trigger',
            entity_type: request.entity_type,
            entity_id: request.entity_id,
            triggered_by: request.triggered_by || `trigger:${request.trigger}`
          });
        
        if (queueError) {
          errors.push({ recipient: recipientEmail, error: queueError.message });
        } else {
          queuedEmails.push({ recipient: recipientEmail, status: 'queued', scheduled_for: scheduledFor });
        }
      }
    }
    
    console.log(`[email-trigger-hub] Completed: ${queuedEmails.length} processed, ${errors.length} errors`);
    
    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        trigger: request.trigger,
        template: triggerConfig.template_key,
        processed: queuedEmails,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total_recipients: recipients.length,
          sent: queuedEmails.filter(e => e.status === 'sent').length,
          queued: queuedEmails.filter(e => e.status === 'queued').length,
          skipped: queuedEmails.filter(e => e.status === 'skipped').length,
          failed: errors.length
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[email-trigger-hub] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
