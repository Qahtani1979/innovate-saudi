import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface RBACRequest {
  action: string;
  payload: Record<string, unknown>;
}

// Role display names for emails
const ROLE_DISPLAY_NAMES: Record<string, { en: string; ar: string }> = {
  admin: { en: 'Administrator', ar: 'مدير النظام' },
  municipality_staff: { en: 'Municipality Staff', ar: 'موظف بلدية' },
  municipality_admin: { en: 'Municipality Admin', ar: 'مدير البلدية' },
  municipality_coordinator: { en: 'Municipality Coordinator', ar: 'منسق البلدية' },
  deputyship_admin: { en: 'Deputyship Director', ar: 'مدير الوكالة' },
  deputyship_staff: { en: 'Deputyship Staff', ar: 'موظف الوكالة' },
  provider: { en: 'Solution Provider', ar: 'مزود حلول' },
  researcher: { en: 'Researcher', ar: 'باحث' },
  expert: { en: 'Expert Evaluator', ar: 'خبير مُقيّم' },
  citizen: { en: 'Citizen', ar: 'مواطن' },
  viewer: { en: 'Explorer', ar: 'مستكشف' }
};

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseKey);
}

// Initialize Resend
function getResendClient() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// ========== ROLE HANDLERS ==========

// Helper: Get role_id from role name/enum using database function
async function lookupRoleId(supabase: ReturnType<typeof getSupabaseClient>, roleName: string): Promise<string | null> {
  // First try direct name match
  const { data: directMatch } = await supabase
    .from('roles')
    .select('id')
    .ilike('name', roleName.replace(/_/g, ' '))
    .limit(1)
    .single();
  
  if (directMatch?.id) return directMatch.id;
  
  // Fallback to mapping function
  const { data: mappedId } = await supabase.rpc('map_enum_to_role_id', { _enum_role: roleName });
  return mappedId || null;
}

async function handleRoleAssign(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { user_id, user_email, role, organization_id, municipality_id } = payload;
  
  // Validation guards
  if (!user_id) throw new Error('user_id is required');
  if (!role) throw new Error('role is required');
  
  console.log(`[rbac-manager] Assigning role '${role}' to ${user_email}`);
  
  // PHASE 2: Lookup role_id for dual-mode operation
  const roleId = await lookupRoleId(supabase, role as string);
  if (roleId) {
    console.log(`[rbac-manager] Found role_id: ${roleId} for role '${role}'`);
  } else {
    console.warn(`[rbac-manager] No role_id found for role '${role}', continuing with enum only`);
  }
  
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id,
      user_email,
      role,                              // Keep enum (backward compat)
      role_id: roleId,                   // NEW: FK to roles table
      organization_id: organization_id || null,
      municipality_id: municipality_id || null,
      assigned_at: new Date().toISOString(),
      is_active: true
    }, { onConflict: 'user_id,role' })
    .select()
    .single();

  if (error) throw error;
  
  console.log(`[rbac-manager] Role assigned successfully with role_id: ${roleId}`);
  return { assigned: true, role: data };
}

async function handleRoleRevoke(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { user_email, role } = payload;
  
  console.log(`[rbac-manager] Revoking role '${role}' from ${user_email}`);
  
  const { error } = await supabase
    .from('user_roles')
    .update({ 
      is_active: false, 
      revoked_at: new Date().toISOString() 
    })
    .eq('user_email', user_email)
    .eq('role', role);

  if (error) throw error;
  
  return { revoked: true };
}

async function handleCheckAutoApprove(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { user_email, user_id, persona_type, municipality_id, organization_id, institution_domain } = payload;
  
  console.log(`[rbac-manager] Checking auto-approval for ${user_email}, persona: ${persona_type}`);
  
  const emailDomain = (user_email as string)?.split('@')[1]?.toLowerCase();
  
  // Get applicable rules
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
        if (rule.municipality_id && municipality_id !== rule.municipality_id) continue;
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

  // Check municipality-specific approved domains
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
    // PHASE 2: Lookup role_id for the assigned role
    const roleId = await lookupRoleId(supabase, assignedRole);
    if (roleId) {
      console.log(`[rbac-manager] Auto-approve: Found role_id ${roleId} for '${assignedRole}'`);
    }
    
    // Auto-assign the role to user_roles table with role_id
    const { data: autoAssigned, error: autoAssignError } = await supabase
      .from('user_roles')
      .upsert({
        user_id,
        user_email,
        role: assignedRole,              // Keep enum (backward compat)
        role_id: roleId,                 // NEW: FK to roles table
        organization_id: organization_id || null,
        municipality_id: municipality_id || null,
        assigned_at: new Date().toISOString(),
        is_active: true
      }, { onConflict: 'user_id,role' })
      .select()
      .single();

    if (autoAssignError) {
      console.error('[rbac-manager] Auto-assign error:', autoAssignError);
    }

    console.log(`[rbac-manager] Auto-approved with role: ${assignedRole}, role_id: ${roleId}`);
    return { 
      auto_approved: true, 
      role: assignedRole,
      role_id: roleId,
      role_data: autoAssigned
    };
  }

  console.log(`[rbac-manager] Not auto-approved, requires manual review`);
  return { 
    auto_approved: false, 
    requires_approval: true,
    suggested_role: persona_type
  };
}

async function handleGetUserRoles(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { user_id, user_email } = payload;
  
  let query = supabase.from('user_roles').select('*').eq('is_active', true);
  
  if (user_id) {
    query = query.eq('user_id', user_id);
  } else if (user_email) {
    query = query.eq('user_email', user_email);
  } else {
    throw new Error('user_id or user_email is required');
  }

  const { data: roles, error } = await query;
  if (error) throw error;
  
  return { roles: roles || [] };
}

// ========== ROLE REQUEST HANDLERS (FIXES CRITICAL BUG) ==========

async function handleApproveRoleRequest(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { request_id, user_id, user_email, role, municipality_id, organization_id, approver_email } = payload;
  
  // Validation guards
  if (!request_id) throw new Error('request_id is required');
  if (!user_id) throw new Error('user_id is required - cannot assign role without user_id');
  if (!user_email) throw new Error('user_email is required');
  if (!role) throw new Error('role is required');
  
  console.log(`[rbac-manager] Approving role request ${request_id} for ${user_email}`);
  
  // 1. Update request status
  const { error: updateError } = await supabase
    .from('role_requests')
    .update({
      status: 'approved',
      reviewed_by: approver_email,
      reviewed_date: new Date().toISOString()
    })
    .eq('id', request_id);
  
  if (updateError) throw updateError;
  
  // PHASE 2: Lookup role_id for the approved role
  const roleId = await lookupRoleId(supabase, role as string);
  if (roleId) {
    console.log(`[rbac-manager] Approve: Found role_id ${roleId} for '${role}'`);
  }
  
  // 2. CRITICAL: Write to user_roles table with role_id
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id,
      user_email,
      role,                              // Keep enum (backward compat)
      role_id: roleId,                   // NEW: FK to roles table
      municipality_id: municipality_id || null,
      organization_id: organization_id || null,
      is_active: true,
      assigned_at: new Date().toISOString()
    }, { 
      onConflict: 'user_id,role' 
    })
    .select()
    .single();
  
  if (roleError) {
    console.error('[rbac-manager] Failed to assign role:', roleError);
    throw roleError;
  }
  
  console.log(`[rbac-manager] Role '${role}' assigned with role_id: ${roleId} to ${user_email}`);
  
  return { 
    approved: true, 
    request_id,
    role: roleData,
    role_id: roleId
  };
}

async function handleRejectRoleRequest(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { request_id, reason, approver_email } = payload;
  
  console.log(`[rbac-manager] Rejecting role request ${request_id}`);
  
  const { error } = await supabase
    .from('role_requests')
    .update({
      status: 'rejected',
      reviewed_by: approver_email,
      reviewed_date: new Date().toISOString(),
      rejection_reason: reason || null
    })
    .eq('id', request_id);
  
  if (error) throw error;
  
  return { rejected: true, request_id };
}

// ========== PERMISSION HANDLERS ==========

async function handleValidatePermission(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { user_id, user_email, permission, resource, action } = payload;
  
  if (!user_id && !user_email) {
    throw new Error('user_id or user_email is required');
  }

  console.log(`[rbac-manager] Validating permission: ${permission || action} for ${user_email || user_id}`);

  // Get user roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user_id)
    .eq('is_active', true);

  const roles = userRoles?.map(r => r.role) || [];
  
  // Admin has all permissions
  if (roles.includes('admin')) {
    return { allowed: true, roles, reason: 'admin_role' };
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
      const matchingDelegation = delegations.find(d => 
        !d.permission_types || 
        d.permission_types.length === 0 || 
        d.permission_types.includes(permission) ||
        d.permission_types.includes(action) ||
        d.permission_types.includes('*')
      );

      if (matchingDelegation) {
        return { 
          allowed: true, 
          roles, 
          reason: 'delegation',
          delegated_from: matchingDelegation.delegator_email
        };
      }
    }
  }

  // Default permission logic
  const permissionMap: Record<string, string[]> = {
    'viewer': ['read'],
    'user': ['read', 'create'],
    'editor': ['read', 'create', 'update'],
    'moderator': ['read', 'create', 'update', 'delete'],
    'admin': ['read', 'create', 'update', 'delete', 'admin']
  };

  const allowedActions = roles.flatMap(role => permissionMap[role] || []);
  const requestedAction = action || (permission as string)?.split('.').pop() || 'read';
  const allowed = allowedActions.includes(requestedAction as string) || allowedActions.includes('admin');

  return { 
    allowed, 
    roles, 
    reason: allowed ? 'role_permission' : 'insufficient_permission'
  };
}

// ========== DELEGATION HANDLERS ==========

async function handleApproveDelegation(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { delegation_id, approver_email } = payload;
  
  console.log(`[rbac-manager] Approving delegation ${delegation_id}`);
  
  const { data, error } = await supabase
    .from('delegation_rules')
    .update({
      is_active: true,
      approved_by: approver_email || 'admin',
      approval_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', delegation_id)
    .select()
    .single();

  if (error) throw error;
  
  return { approved: true, delegation: data };
}

async function handleRejectDelegation(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { delegation_id, reason, approver_email } = payload;
  
  console.log(`[rbac-manager] Rejecting delegation ${delegation_id}`);
  
  // For rejection, we keep is_active = false and set approved_by to mark it as processed
  // The reason is stored in the 'reason' column which already exists
  const { data, error } = await supabase
    .from('delegation_rules')
    .update({
      is_active: false,
      approved_by: approver_email || 'admin',
      approval_date: new Date().toISOString(),
      reason: reason || 'Rejected by administrator',
      updated_at: new Date().toISOString()
    })
    .eq('id', delegation_id)
    .select()
    .single();

  if (error) throw error;
  
  return { rejected: true, delegation: data };
}

// ========== NOTIFICATION HANDLERS ==========

async function handleRoleNotification(
  supabase: ReturnType<typeof getSupabaseClient>, 
  resend: Resend | null,
  payload: Record<string, unknown>,
  type: 'submitted' | 'approved' | 'rejected'
) {
  const { user_id, user_email, user_name, requested_role, justification, rejection_reason, language = 'en', notify_admins = true } = payload;
  
  console.log(`[rbac-manager] Sending ${type} notification for ${user_email}`);
  
  const isArabic = language === 'ar';
  const roleName = ROLE_DISPLAY_NAMES[requested_role as string]?.[language as 'en' | 'ar'] || requested_role;
  
  // Create in-app notification
  await supabase.from('citizen_notifications').insert({
    user_id,
    user_email,
    notification_type: `role_request_${type}`,
    title: type === 'submitted' 
      ? (isArabic ? 'تم استلام طلب الدور' : 'Role Request Received')
      : type === 'approved'
        ? (isArabic ? 'تمت الموافقة على طلب الدور' : 'Role Request Approved')
        : (isArabic ? 'تحديث طلب الدور' : 'Role Request Update'),
    message: type === 'approved'
      ? (isArabic ? `تمت الموافقة على دور ${roleName}` : `Your ${roleName} role has been approved`)
      : type === 'rejected'
        ? (isArabic ? `طلب دور ${roleName} يحتاج مراجعة` : `Your ${roleName} role request needs attention`)
        : (isArabic ? `طلب دور ${roleName} قيد المراجعة` : `Your ${roleName} role request is under review`),
    entity_type: 'role_request',
    metadata: { role: requested_role, status: type }
  });

  // Send email if Resend is configured
  if (resend) {
    const emailContent = getRoleEmailContent(type, user_name as string, roleName as string, language as string, rejection_reason as string);
    
    try {
      await resend.emails.send({
        from: "Saudi Innovates <onboarding@resend.dev>",
        to: [user_email as string],
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error('[rbac-manager] Email send error:', emailError);
    }

    // Notify admins for submissions
    if (type === 'submitted' && notify_admins) {
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .eq('is_active', true);

      if (admins?.length) {
        const { data: adminProfiles } = await supabase
          .from('user_profiles')
          .select('user_email')
          .in('user_id', admins.map(a => a.user_id));

        for (const admin of adminProfiles || []) {
          if (admin.user_email) {
            try {
              await resend.emails.send({
                from: "Saudi Innovates <onboarding@resend.dev>",
                to: [admin.user_email],
                subject: `🔔 New Role Request: ${roleName} - ${user_name}`,
                html: getAdminNotificationHtml(user_name as string, user_email as string, roleName as string, justification as string)
              });
            } catch (e) {
              console.error('[rbac-manager] Admin notification error:', e);
            }
          }
        }
      }
    }
  }

  return { notified: true, type };
}

// ========== SECURITY AUDIT HANDLER ==========

async function handleRunSecurityAudit(supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>) {
  const { organization_id, scope } = payload;
  
  console.log(`[rbac-manager] Running RBAC security audit for organization: ${organization_id}`);

  const findings: Array<{
    severity: string;
    category: string;
    message: string;
    recommendation: string;
  }> = [];

  // 1. Check for excessive admins
  const { data: adminUsers } = await supabase
    .from('user_roles')
    .select('user_email, role')
    .eq('organization_id', organization_id)
    .eq('role', 'admin')
    .eq('is_active', true);

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

  // Calculate score
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const securityScore = Math.max(0, 100 - (criticalCount * 25) - (highCount * 15) - (warningCount * 5));

  return { 
    security_score: securityScore,
    findings,
    summary: {
      critical: criticalCount,
      high: highCount,
      warning: warningCount,
      info: findings.filter(f => f.severity === 'info').length
    }
  };
}

// ========== EMAIL TEMPLATES ==========

function getRoleEmailContent(type: string, userName: string, roleName: string, lang: string, rejectionReason?: string) {
  const isArabic = lang === 'ar';
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || '';
  
  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 15px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 16px 16px; }
  `;

  if (type === 'submitted') {
    return {
      subject: isArabic ? `تم استلام طلب الدور - ${roleName}` : `Role Request Received - ${roleName}`,
      html: `<!DOCTYPE html><html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lang}"><head><meta charset="UTF-8"><style>${styles}.header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }.status-badge { background: #fef3c7; color: #d97706; }</style></head><body><div class="container"><div class="header"><h1>${isArabic ? '⏳ طلب الدور قيد المراجعة' : '⏳ Role Request Under Review'}</h1></div><div class="content"><p>${isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}</p><span class="status-badge">${isArabic ? 'قيد المراجعة' : 'Pending Review'}</span><p>${isArabic ? `تم استلام طلبك للحصول على دور "${roleName}".` : `Your request for the "${roleName}" role has been received.`}</p></div><div class="footer"><p>© 2024 Saudi Innovation Platform</p></div></div></body></html>`
    };
  }

  if (type === 'approved') {
    return {
      subject: isArabic ? `🎉 تمت الموافقة على طلب الدور - ${roleName}` : `🎉 Role Request Approved - ${roleName}`,
      html: `<!DOCTYPE html><html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lang}"><head><meta charset="UTF-8"><style>${styles}.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }.status-badge { background: #d1fae5; color: #059669; }.cta-button { display: block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-align: center; font-weight: 600; margin: 20px 0; }</style></head><body><div class="container"><div class="header"><h1>${isArabic ? '🎉 تمت الموافقة!' : '🎉 Approved!'}</h1></div><div class="content"><p>${isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}</p><span class="status-badge">${isArabic ? 'تمت الموافقة' : 'Approved'}</span><p>${isArabic ? `تهانينا! تمت الموافقة على طلبك للحصول على دور "${roleName}".` : `Congratulations! Your request for the "${roleName}" role has been approved.`}</p><a href="${baseUrl}" class="cta-button">${isArabic ? '🚀 الذهاب إلى لوحة التحكم' : '🚀 Go to Dashboard'}</a></div><div class="footer"><p>© 2024 Saudi Innovation Platform</p></div></div></body></html>`
    };
  }

  // rejected
  return {
    subject: isArabic ? `طلب الدور يحتاج مراجعة - ${roleName}` : `Role Request Needs Attention - ${roleName}`,
    html: `<!DOCTYPE html><html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lang}"><head><meta charset="UTF-8"><style>${styles}.header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }.status-badge { background: #fee2e2; color: #dc2626; }.reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 15px 0; }</style></head><body><div class="container"><div class="header"><h1>${isArabic ? 'طلب الدور' : 'Role Request Update'}</h1></div><div class="content"><p>${isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}</p><span class="status-badge">${isArabic ? 'يحتاج مراجعة' : 'Needs Review'}</span><p>${isArabic ? `للأسف، لم نتمكن من الموافقة على طلبك للحصول على دور "${roleName}".` : `Unfortunately, we were unable to approve your request for the "${roleName}" role.`}</p>${rejectionReason ? `<div class="reason-box"><strong>${isArabic ? 'السبب:' : 'Reason:'}</strong><p>${rejectionReason}</p></div>` : ''}</div><div class="footer"><p>© 2024 Saudi Innovation Platform</p></div></div></body></html>`
  };
}

function getAdminNotificationHtml(userName: string, userEmail: string, roleName: string, justification: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; }.container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }.header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }.header h1 { color: white; margin: 0; font-size: 24px; }.content { padding: 30px; }.info-box { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; }.footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 16px 16px; }</style></head><body><div class="container"><div class="header"><h1>🔔 New Role Request</h1></div><div class="content"><p>A new role request requires your review:</p><div class="info-box"><p><strong>User:</strong> ${userName}</p><p><strong>Email:</strong> ${userEmail}</p><p><strong>Requested Role:</strong> ${roleName}</p><p><strong>Justification:</strong></p><p style="font-style: italic;">${justification || 'No justification provided'}</p></div></div><div class="footer"><p>Saudi Innovation Platform - Admin Notification</p></div></div></body></html>`;
}

// ========== ACTION ROUTER ==========

const ACTION_HANDLERS: Record<string, (supabase: ReturnType<typeof getSupabaseClient>, payload: Record<string, unknown>, resend?: Resend | null) => Promise<unknown>> = {
  // Role Management
  'role.assign': handleRoleAssign,
  'role.revoke': handleRoleRevoke,
  'role.check_auto_approve': handleCheckAutoApprove,
  'role.get_user_roles': handleGetUserRoles,
  'role.request.approve': handleApproveRoleRequest,
  'role.request.reject': handleRejectRoleRequest,
  
  // Permission
  'permission.validate': handleValidatePermission,
  
  // Delegation
  'delegation.approve': handleApproveDelegation,
  'delegation.reject': handleRejectDelegation,
  
  // Audit
  'audit.run_security_audit': handleRunSecurityAudit,
};

// ========== MAIN HANDLER ==========

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload = {} }: RBACRequest = await req.json();
    
    console.log(`[rbac-manager] Action: ${action}`);
    
    const supabase = getSupabaseClient();
    const resend = getResendClient();
    
    // Handle notification actions separately
    if (action.startsWith('notification.')) {
      const type = action.replace('notification.', '').replace('role_', '') as 'submitted' | 'approved' | 'rejected';
      const result = await handleRoleNotification(supabase, resend, payload, type);
      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Handle standard actions
    const handler = ACTION_HANDLERS[action];
    if (!handler) {
      console.error(`[rbac-manager] Unknown action: ${action}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Unknown action: ${action}`,
        available_actions: Object.keys(ACTION_HANDLERS)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const result = await handler(supabase, payload) as Record<string, unknown>;
    
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[rbac-manager] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});