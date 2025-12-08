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
    const { user_email, user_id, organization_id, role, action } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Auto role assignment: ${action} - ${role} for ${user_email}`);

    let result;

    switch (action) {
      case 'assign':
        // Assign role to user
        const { data: assigned, error: assignError } = await supabase
          .from('user_roles')
          .upsert({
            user_id,
            user_email,
            role,
            organization_id,
            assigned_at: new Date().toISOString(),
            is_active: true
          })
          .select()
          .single();

        if (assignError) throw assignError;
        result = { assigned: true, role: assigned };
        break;

      case 'revoke':
        const { error: revokeError } = await supabase
          .from('user_roles')
          .update({ 
            is_active: false, 
            revoked_at: new Date().toISOString() 
          })
          .eq('user_email', user_email)
          .eq('role', role);

        if (revokeError) throw revokeError;
        result = { revoked: true };
        break;

      case 'auto_assign':
        // Auto-assign based on organization membership
        const { data: org } = await supabase
          .from('organization_members')
          .select('organization_id, role')
          .eq('user_email', user_email)
          .single();

        if (org) {
          const defaultRole = org.role === 'admin' ? 'org_admin' : 'org_member';
          await supabase.from('user_roles').upsert({
            user_email,
            role: defaultRole,
            organization_id: org.organization_id,
            assigned_at: new Date().toISOString(),
            is_active: true
          });
          result = { auto_assigned: true, role: defaultRole };
        } else {
          result = { auto_assigned: false, message: 'No organization membership found' };
        }
        break;

      default:
        // Get user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_email', user_email)
          .eq('is_active', true);

        result = { roles: roles || [] };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in auto-role-assignment:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
