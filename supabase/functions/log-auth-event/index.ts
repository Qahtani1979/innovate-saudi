import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: log-auth-event
 * Logs authentication events including failed login attempts
 * Addresses: audit-8 (Failed login attempts logged)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthEventPayload {
  event_type: 'login_success' | 'login_failed' | 'logout' | 'password_change' | 'password_reset' | 'signup';
  email: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: AuthEventPayload = await req.json();
    const { event_type, email, error_message, metadata = {} } = payload;

    // Validate required fields
    if (!event_type || !email) {
      console.error('[log-auth-event] Missing required fields:', { event_type, email });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: event_type and email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client info from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Build the log entry
    const logEntry = {
      user_id: null, // Will be null for failed logins
      user_email: email,
      action: event_type,
      entity_type: 'authentication',
      entity_id: null,
      ip_address: clientIP.split(',')[0].trim(), // Get first IP if multiple
      user_agent: userAgent,
      metadata: {
        ...metadata,
        error_message,
        timestamp: new Date().toISOString(),
        event_source: 'auth_event_logger'
      }
    };

    console.log('[log-auth-event] Logging auth event:', {
      event_type,
      email: email.substring(0, 3) + '***', // Mask email in logs
      ip: clientIP
    });

    // Insert the log entry
    const { error } = await supabase
      .from('access_logs')
      .insert(logEntry);

    if (error) {
      console.error('[log-auth-event] Failed to insert log:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to log event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For failed login attempts, check for brute force patterns
    if (event_type === 'login_failed') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { count, error: countError } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', email)
        .eq('action', 'login_failed')
        .gte('created_at', oneHourAgo);

      if (!countError && count && count >= 5) {
        console.warn('[log-auth-event] SECURITY ALERT: Multiple failed login attempts for:', email.substring(0, 3) + '***');
        
        // Log security alert
        await supabase
          .from('access_logs')
          .insert({
            user_email: 'system',
            action: 'security_alert',
            entity_type: 'authentication',
            metadata: {
              alert_type: 'brute_force_suspected',
              target_email: email,
              failed_attempts: count,
              time_window: '1 hour',
              client_ip: clientIP
            }
          });
      }
    }

    console.log('[log-auth-event] Successfully logged auth event');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[log-auth-event] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
