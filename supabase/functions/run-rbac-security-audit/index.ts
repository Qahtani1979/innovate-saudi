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
    const { organization_id, scope } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Running RBAC security audit for organization: ${organization_id}`);

    const findings: Array<{
      severity: string;
      category: string;
      message: string;
      recommendation: string;
    }> = [];

    // 1. Check for users with excessive permissions
    const { data: adminUsers } = await supabase
      .from('user_roles')
      .select('user_email, role')
      .eq('organization_id', organization_id)
      .eq('role', 'admin');

    if ((adminUsers?.length || 0) > 5) {
      findings.push({
        severity: 'warning',
        category: 'excessive_admins',
        message: `Organization has ${adminUsers?.length} admin users`,
        recommendation: 'Consider reducing the number of admin users to minimize security risk'
      });
    }

    // 2. Check for inactive users with active roles
    const { data: inactiveUsers } = await supabase
      .from('user_roles')
      .select('user_email, role, last_activity')
      .eq('organization_id', organization_id)
      .eq('is_active', true);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const staleUsers = inactiveUsers?.filter((u: { last_activity?: string }) => 
      !u.last_activity || new Date(u.last_activity) < thirtyDaysAgo
    ) || [];

    if (staleUsers.length > 0) {
      findings.push({
        severity: 'warning',
        category: 'inactive_users',
        message: `${staleUsers.length} users have not been active in 30+ days`,
        recommendation: 'Review and potentially revoke access for inactive users'
      });
    }

    // 3. Check for orphaned permissions
    const { data: orphanedRoles } = await supabase
      .from('user_roles')
      .select('id, user_email, role')
      .eq('organization_id', organization_id)
      .is('user_id', null);

    if ((orphanedRoles?.length || 0) > 0) {
      findings.push({
        severity: 'high',
        category: 'orphaned_permissions',
        message: `${orphanedRoles?.length} role assignments without valid user IDs`,
        recommendation: 'Clean up orphaned role assignments immediately'
      });
    }

    // 4. Check for sensitive data access
    const { data: sensitiveAccess } = await supabase
      .from('access_logs')
      .select('user_email, action, entity_type')
      .eq('entity_type', 'sensitive_data')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if ((sensitiveAccess?.length || 0) > 100) {
      findings.push({
        severity: 'info',
        category: 'high_sensitive_access',
        message: `${sensitiveAccess?.length} sensitive data accesses in the last 7 days`,
        recommendation: 'Review access patterns for anomalies'
      });
    }

    // Calculate overall score
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const warningCount = findings.filter(f => f.severity === 'warning').length;

    const securityScore = Math.max(0, 100 - (criticalCount * 25) - (highCount * 15) - (warningCount * 5));

    // Save audit result
    const { data: audit, error: auditError } = await supabase
      .from('security_audits')
      .insert({
        organization_id,
        audit_type: 'rbac',
        scope,
        findings,
        security_score: securityScore,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (auditError) {
      console.warn('Could not save audit result:', auditError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      audit_id: audit?.id,
      security_score: securityScore,
      findings,
      summary: {
        critical: criticalCount,
        high: highCount,
        warning: warningCount,
        info: findings.filter(f => f.severity === 'info').length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in run-rbac-security-audit:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
