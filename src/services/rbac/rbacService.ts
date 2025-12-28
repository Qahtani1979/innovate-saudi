/**
 * RBAC Service - Unified interface for all RBAC operations
 * 
 * This service provides a clean API for:
 * - Role assignment/revocation
 * - Role request approval/rejection  
 * - Permission validation
 * - Delegation management
 * - Security audits
 * 
 * All operations go through the unified 'rbac-manager' edge function.
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export type RBACAction =
  | 'role.assign'
  | 'role.revoke'
  | 'role.check_auto_approve'
  | 'role.get_user_roles'
  | 'role.request.approve'
  | 'role.request.reject'
  | 'permission.validate'
  | 'delegation.approve'
  | 'delegation.reject'
  | 'notification.role_request'
  | 'notification.role_approved'
  | 'notification.role_rejected'
  | 'audit.run_security_audit';

interface RBACResponse<T = unknown> {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

interface RoleData {
  id: string;
  user_id: string;
  user_email: string;
  role: string;
  municipality_id?: string;
  organization_id?: string;
  is_active: boolean;
  assigned_at: string;
}

interface AuditResult {
  security_score: number;
  findings: Array<{
    severity: string;
    category: string;
    message: string;
    recommendation: string;
  }>;
  summary: {
    critical: number;
    high: number;
    warning: number;
    info: number;
  };
}

// Core invoke function
async function invokeRBAC<T = unknown>(action: RBACAction, payload: Record<string, unknown> = {}): Promise<T & RBACResponse> {


  const { data, error } = await supabase.functions.invoke('rbac-manager', {
    body: { action, payload }
  });

  if (error) {
    console.error(`[rbacService] Error:`, error);
    throw new Error(error.message || 'RBAC operation failed');
  }

  if (!data.success) {
    throw new Error(data.error || 'RBAC operation failed');
  }

  return data as T & RBACResponse;
}

// ========== Role Operations ==========

export async function assignRole(params: {
  user_id: string;
  user_email: string;
  role: string;
  organization_id?: string;
  municipality_id?: string;
}): Promise<{ assigned: boolean; role: RoleData }> {
  return invokeRBAC('role.assign', params);
}

export async function revokeRole(params: {
  user_email: string;
  role: string;
}): Promise<{ revoked: boolean }> {
  return invokeRBAC('role.revoke', params);
}

export async function checkAutoApproval(params: {
  user_email: string;
  user_id: string;
  persona_type: string;
  municipality_id?: string;
  organization_id?: string;
  institution_domain?: string;
}): Promise<{
  auto_approved: boolean;
  role?: string;
  role_data?: RoleData;
  requires_approval?: boolean;
  suggested_role?: string;
}> {
  return invokeRBAC('role.check_auto_approve', params);
}

export async function getUserRoles(params: {
  user_id?: string;
  user_email?: string;
}): Promise<{ roles: RoleData[] }> {
  return invokeRBAC('role.get_user_roles', params);
}

// ========== Role Request Operations (CRITICAL FIX) ==========

/**
 * Approve a role request - writes to user_roles table
 * This fixes the critical bug where approvals were going to wrong table
 */
export async function approveRoleRequest(params: {
  request_id: string;
  user_id: string;
  user_email: string;
  role: string;
  municipality_id?: string;
  organization_id?: string;
  approver_email?: string;
}): Promise<{ approved: boolean; request_id: string; role: RoleData }> {
  return invokeRBAC('role.request.approve', params);
}

export async function rejectRoleRequest(params: {
  request_id: string;
  reason?: string;
  approver_email?: string;
}): Promise<{ rejected: boolean; request_id: string }> {
  return invokeRBAC('role.request.reject', params);
}

// ========== Permission Operations ==========

export async function validatePermission(params: {
  user_id: string;
  user_email?: string;
  permission: string;
  resource?: string;
  action?: string;
}): Promise<{
  allowed: boolean;
  reason: string;
  roles?: string[];
  delegated_from?: string;
}> {
  return invokeRBAC('permission.validate', params);
}

// ========== Delegation Operations ==========

export async function approveDelegation(delegation_id: string): Promise<{
  approved: boolean;
  delegation: unknown
}> {
  return invokeRBAC('delegation.approve', { delegation_id });
}

export async function rejectDelegation(
  delegation_id: string,
  reason?: string
): Promise<{ rejected: boolean; delegation: unknown }> {
  return invokeRBAC('delegation.reject', { delegation_id, reason });
}

// ========== Notification Operations ==========

export async function sendRoleNotification(params: {
  type: 'submitted' | 'approved' | 'rejected';
  user_id: string;
  user_email: string;
  user_name: string;
  requested_role: string;
  justification?: string;
  rejection_reason?: string;
  language?: string;
  notify_admins?: boolean;
}): Promise<{ notified: boolean; type: string }> {
  const actionMap = {
    submitted: 'notification.role_request',
    approved: 'notification.role_approved',
    rejected: 'notification.role_rejected'
  };
  return invokeRBAC(actionMap[params.type] as RBACAction, params);
}

// ========== Audit Operations ==========

export async function runSecurityAudit(params: {
  organization_id?: string;
  scope?: string;
}): Promise<AuditResult & RBACResponse> {
  return invokeRBAC('audit.run_security_audit', params);
}

// ========== Field Security Operations ==========

export async function validateFieldAccess(params: {
  entity_type: string;
  field_name: string;
  operation: string;
}): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const { data, error } = await supabase.functions.invoke('check-field-security', {
    body: params
  });

  if (error) throw error;
  return data;
}

// Default export as object for convenience
const rbacService = {
  assignRole,
  revokeRole,
  checkAutoApproval,
  getUserRoles,
  approveRoleRequest,
  rejectRoleRequest,
  validatePermission,
  approveDelegation,
  rejectDelegation,
  sendRoleNotification,
  runSecurityAudit,
  validateFieldAccess
};

export default rbacService;