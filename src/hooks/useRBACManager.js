/**
 * RBAC Manager Hooks
 * 
 * React hooks for RBAC operations using the unified rbac-manager service.
 * These hooks provide:
 * - Automatic cache invalidation
 * - Loading/error states
 * - Toast notifications
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import rbacService from '@/services/rbac/rbacService';
import { toast } from 'sonner';

/**
 * Fetch user roles
 */
export function useUserRoles(userId, userEmail) {
  return useQuery({
    queryKey: ['rbac-roles', userId || userEmail],
    queryFn: () => rbacService.getUserRoles({ user_id: userId, user_email: userEmail }),
    enabled: !!(userId || userEmail),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Assign a role to a user
 */
export function useAssignRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params) => rbacService.assignRole(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles', variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign role: ${error.message}`);
    }
  });
}

/**
 * Revoke a role from a user
 */
export function useRevokeRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params) => rbacService.revokeRole(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      toast.success('Role revoked successfully');
    },
    onError: (error) => {
      toast.error(`Failed to revoke role: ${error.message}`);
    }
  });
}

/**
 * Check auto-approval for a user
 */
export function useCheckAutoApproval() {
  return useMutation({
    mutationFn: (params) => rbacService.checkAutoApproval(params),
  });
}

/**
 * Approve a role request
 * CRITICAL: This writes to user_roles table (not user_functional_roles)
 */
export function useApproveRoleRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params) => rbacService.approveRoleRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-functional-roles'] });
      toast.success('Role request approved - user now has access');
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    }
  });
}

/**
 * Reject a role request
 */
export function useRejectRoleRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params) => rbacService.rejectRoleRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      toast.success('Role request rejected');
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    }
  });
}

/**
 * Validate user permission
 */
export function useValidatePermission() {
  return useMutation({
    mutationFn: (params) => rbacService.validatePermission(params)
  });
}

/**
 * Approve a delegation
 */
export function useApproveDelegation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (delegationId) => rbacService.approveDelegation(delegationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] });
      queryClient.invalidateQueries({ queryKey: ['pending-delegations'] });
      toast.success('Delegation approved');
    },
    onError: (error) => {
      toast.error(`Failed to approve delegation: ${error.message}`);
    }
  });
}

/**
 * Reject a delegation
 */
export function useRejectDelegation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ delegationId, reason }) => rbacService.rejectDelegation(delegationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegations'] });
      queryClient.invalidateQueries({ queryKey: ['pending-delegations'] });
      toast.success('Delegation rejected');
    },
    onError: (error) => {
      toast.error(`Failed to reject delegation: ${error.message}`);
    }
  });
}

/**
 * Send role notification
 */
export function useSendRoleNotification() {
  return useMutation({
    mutationFn: (params) => rbacService.sendRoleNotification(params),
    onError: (error) => {
      console.error('Failed to send notification:', error);
    }
  });
}

/**
 * Run RBAC security audit
 */
export function useSecurityAudit() {
  return useMutation({
    mutationFn: (params) => rbacService.runSecurityAudit(params),
    onSuccess: (data) => {
      if (data.security_score >= 80) {
        toast.success(`Security audit complete. Score: ${data.security_score}/100`);
      } else if (data.security_score >= 50) {
        toast.warning(`Security audit complete. Score: ${data.security_score}/100 - Review recommended`);
      } else {
        toast.error(`Security audit complete. Score: ${data.security_score}/100 - Immediate action required`);
      }
    },
    onError: (error) => {
      toast.error(`Audit failed: ${error.message}`);
    }
  });
}

export default {
  useUserRoles,
  useAssignRole,
  useRevokeRole,
  useCheckAutoApproval,
  useApproveRoleRequest,
  useRejectRoleRequest,
  useValidatePermission,
  useApproveDelegation,
  useRejectDelegation,
  useSendRoleNotification,
  useSecurityAudit
};