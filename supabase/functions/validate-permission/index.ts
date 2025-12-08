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
    const { user_id, user_email, permission, resource, action } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!user_id && !user_email) {
      return new Response(JSON.stringify({ 
        success: false,
        allowed: false, 
        error: "user_id or user_email is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Validating permission: ${permission || action} on ${resource} for ${user_email || user_id}`);

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id);

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    const roles = userRoles?.map(r => r.role) || [];
    
    // Admin has all permissions
    if (roles.includes('admin')) {
      return new Response(JSON.stringify({ 
        success: true,
        allowed: true,
        roles,
        reason: 'admin_role'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for active delegation
    if (user_email) {
      const now = new Date().toISOString();
      const { data: delegations } = await supabase
        .from('delegation_rules')
        .select('*')
        .eq('delegate_email', user_email)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .lte('start_date', now)
        .gte('end_date', now);

      if (delegations && delegations.length > 0) {
        // Check if any delegation covers this permission
        const matchingDelegation = delegations.find(d => 
          !d.permission_types || 
          d.permission_types.length === 0 || 
          d.permission_types.includes(permission) ||
          d.permission_types.includes(action) ||
          d.permission_types.includes('*')
        );

        if (matchingDelegation) {
          return new Response(JSON.stringify({ 
            success: true,
            allowed: true,
            roles,
            reason: 'delegation',
            delegated_from: matchingDelegation.delegator_email
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Default permission logic based on roles
    const permissionMap: Record<string, string[]> = {
      'viewer': ['read'],
      'user': ['read', 'create'],
      'editor': ['read', 'create', 'update'],
      'moderator': ['read', 'create', 'update', 'delete'],
      'admin': ['read', 'create', 'update', 'delete', 'admin']
    };

    const allowedActions = roles.flatMap(role => permissionMap[role] || []);
    const requestedAction = action || permission?.split('.').pop() || 'read';
    const allowed = allowedActions.includes(requestedAction) || allowedActions.includes('admin');

    console.log(`Permission ${allowed ? 'granted' : 'denied'} for ${requestedAction}`);

    return new Response(JSON.stringify({ 
      success: true,
      allowed,
      roles,
      reason: allowed ? 'role_permission' : 'insufficient_permission'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in validate-permission:", error);
    return new Response(JSON.stringify({ success: false, allowed: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
