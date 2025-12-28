/**
 * RBAC Manager Hooks
 * 
 * React hooks for RBAC operations using the unified rbac-manager service.
 * These hooks provide:
 * - Automatic cache invalidation
 * - Loading/error states
 * - Toast notifications
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import rbacService from '@/services/rbac/rbacService';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

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
 * Assign a role to a user.
 * @typedef {Object} AssignRoleParams
 * @property {string} user_id
 * @property {string} role_id
 * @property {string} [municipality_id]
 * @property {string} [organization_id]
 * 
 * @returns {import('@/hooks/useAppQueryClient').UseMutationResult<any, Error, AssignRoleParams>}
 */
export function useAssignRole() {
  const queryClient = useAppQueryClient();

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
 * Assign a role to multiple users.
 * @typedef {Object} BulkAssignRoleParams
 * @property {string[]} user_ids
 * @property {string} role_id
 * @property {string} [municipality_id]
 * @property {string} [organization_id]
 * 
 * @returns {import('@/hooks/useAppQueryClient').UseMutationResult<any[], Error, BulkAssignRoleParams>}
 */
export function useBulkAssignRole() {
  const queryClient = useAppQueryClient();

  return useMutation({
    mutationFn: async ({ user_ids, ...rest }) => {
      const promises = user_ids.map(user_id => rbacService.assignRole({ user_id, ...rest }));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      toast.success('Roles assigned to all selected users');
    },
    onError: (error) => {
      toast.error(`Failed to assign roles: ${error.message}`);
    }
  });
}

/**
 * Revoke a role from a user
 */
export function useRevokeRole() {
  const queryClient = useAppQueryClient();

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
 * Approve a role request.
 * @typedef {Object} ApproveRoleRequestParams
 * @property {string} request_id
 * @property {string} user_id
 * @property {string} user_email
 * @property {string} role
 * @property {string} [municipality_id]
 * @property {string} [organization_id]
 * @property {string} approver_email
 * 
 * @returns {import('@/hooks/useAppQueryClient').UseMutationResult<any, Error, ApproveRoleRequestParams>}
 */
export function useApproveRoleRequest() {
  const queryClient = useAppQueryClient();

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
 * Reject a role request.
 * @typedef {Object} RejectRoleRequestParams
 * @property {string} request_id
 * @property {string} reason
 * @property {string} approver_email
 * 
 * @returns {import('@/hooks/useAppQueryClient').UseMutationResult<any, Error, RejectRoleRequestParams>}
 */
export function useRejectRoleRequest() {
  const queryClient = useAppQueryClient();

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
  const queryClient = useAppQueryClient();

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
  const queryClient = useAppQueryClient();

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


