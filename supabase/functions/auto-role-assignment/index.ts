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
    const { 
      user_email, 
      user_id, 
      organization_id, 
      municipality_id,
      role, 
      action,
      persona_type,
      institution_domain
    } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Auto role assignment: ${action} - ${role || persona_type} for ${user_email}`);

    let result;

    switch (action) {
      case 'assign':
        // Direct role assignment
        const { data: assigned, error: assignError } = await supabase
          .from('user_roles')
          .upsert({
            user_id,
            user_email,
            role,
            organization_id: organization_id || null,
            municipality_id: municipality_id || null,
            assigned_at: new Date().toISOString(),
            is_active: true
          }, { onConflict: 'user_id,role' })
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

      case 'check_auto_approve':
        // Check auto-approval rules for any persona type
        const emailDomain = user_email?.split('@')[1]?.toLowerCase();
        
        // Get applicable rules for this persona type
        const { data: rules } = await supabase
          .from('auto_approval_rules')
          .select('*')
          .eq('persona_type', persona_type)
          .eq('is_active', true)
          .order('priority', { ascending: false });

        let autoApproved = false;
        let assignedRole = null;

        for (const rule of rules || []) {
          let matches = false;

          switch (rule.rule_type) {
            case 'always':
              matches = true;
              break;
            case 'never':
              matches = false;
              break;
            case 'email_domain':
              if (rule.municipality_id && municipality_id !== rule.municipality_id) {
                continue; // Skip if municipality-specific rule doesn't match
              }
              matches = emailDomain === rule.rule_value?.toLowerCase() || 
                        emailDomain?.endsWith('.' + rule.rule_value?.toLowerCase());
              break;
            case 'organization':
              matches = organization_id === rule.organization_id;
              break;
            case 'institution':
              matches = emailDomain === rule.rule_value?.toLowerCase() ||
                        institution_domain === rule.rule_value?.toLowerCase();
              break;
          }

          if (matches) {
            autoApproved = true;
            assignedRole = rule.role_to_assign;
            break;
          }
        }

        // Also check municipality-specific approved domains if applicable
        if (!autoApproved && municipality_id && persona_type === 'municipality_staff') {
          const { data: municipality } = await supabase
            .from('municipalities')
            .select('approved_email_domains')
            .eq('id', municipality_id)
            .single();

          const approvedDomains = municipality?.approved_email_domains || [];
          const domainMatch = approvedDomains.some((d: string) => 
            emailDomain === d.toLowerCase() || emailDomain?.endsWith('.' + d.toLowerCase())
          );

          if (domainMatch) {
            autoApproved = true;
            assignedRole = 'municipality_staff';
          }
        }

        if (autoApproved && assignedRole) {
          // Auto-assign the role
          const { data: autoAssigned, error: autoAssignError } = await supabase
            .from('user_roles')
            .upsert({
              user_id,
              user_email,
              role: assignedRole,
              organization_id: organization_id || null,
              municipality_id: municipality_id || null,
              assigned_at: new Date().toISOString(),
              is_active: true
            }, { onConflict: 'user_id,role' })
            .select()
            .single();

          if (autoAssignError) {
            console.error('Auto-assign error:', autoAssignError);
          }

          result = { 
            auto_approved: true, 
            role: assignedRole,
            role_data: autoAssigned
          };
        } else {
          result = { 
            auto_approved: false, 
            requires_approval: true,
            suggested_role: role || persona_type
          };
        }
        break;

      case 'auto_assign':
        // Legacy: Auto-assign based on organization membership
        const { data: org } = await supabase
          .from('organization_members')
          .select('organization_id, role')
          .eq('user_email', user_email)
          .single();

        if (org) {
          const defaultRole = org.role === 'admin' ? 'org_admin' : 'org_member';
          await supabase.from('user_roles').upsert({
            user_email,
            user_id,
            role: defaultRole,
            organization_id: org.organization_id,
            assigned_at: new Date().toISOString(),
            is_active: true
          }, { onConflict: 'user_id,role' });
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
