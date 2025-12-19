/**
 * Challenge Delegation Hook
 * Implements: del-1 to del-8 (Delegation & Escalation checks)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

// Permission types for challenges
export const CHALLENGE_PERMISSIONS = {
  VIEW: 'challenge_view',
  EDIT: 'challenge_edit',
  APPROVE: 'challenge_approve',
  DELETE: 'challenge_delete',
  ASSIGN: 'challenge_assign',
  PUBLISH: 'challenge_publish'
};

export function useChallengeDelegation(challengeId = null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logAuditEvent } = useAuditLogger();

  // del-1: Check if user has delegated access to this challenge
  const { data: delegatedAccess, isLoading: accessLoading } = useQuery({
    queryKey: ['challenge-delegation-access', challengeId, user?.email],
    queryFn: async () => {
      if (!user?.email) return { hasAccess: false, permissions: [], delegations: [] };

      const now = new Date().toISOString();
      
      // Query delegation rules for current user
      const { data, error } = await supabase
        .from('delegation_rules')
        .select('*')
        .eq('delegate_email', user.email)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (error) {
        console.error('[ChallengeDelegation] Error fetching delegations:', error);
        return { hasAccess: false, permissions: [], delegations: [] };
      }

      // Filter for challenge-related permissions
      const challengeDelegations = (data || []).filter(d => 
        d.permission_types?.some(p => p.startsWith('challenge_')) ||
        (d.entity_type === 'challenge' && (!challengeId || d.entity_id === challengeId))
      );

      const permissions = [...new Set(
        challengeDelegations.flatMap(d => d.permission_types || [])
      )];

      return {
        hasAccess: challengeDelegations.length > 0,
        permissions,
        delegations: challengeDelegations
      };
    },
    enabled: !!user?.email
  });

  // del-2: Get delegations created by current user (for management)
  const { data: myDelegations, isLoading: delegationsLoading } = useQuery({
    queryKey: ['challenge-delegations-by-me', challengeId, user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      let query = supabase
        .from('delegation_rules')
        .select('*')
        .eq('delegator_email', user.email)
        .order('created_at', { ascending: false });

      if (challengeId) {
        query = query.or(`entity_id.eq.${challengeId},entity_type.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[ChallengeDelegation] Error fetching my delegations:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.email
  });

  // del-2: Create delegation
  const createDelegation = useMutation({
    mutationFn: async ({ 
      delegateEmail, 
      permissions, 
      startDate, 
      endDate, 
      reason,
      entityId = challengeId 
    }) => {
      if (!user?.email) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('delegation_rules')
        .insert({
          delegator_email: user.email,
          delegate_email: delegateEmail,
          permission_types: permissions,
          start_date: startDate || new Date().toISOString(),
          end_date: endDate,
          reason,
          entity_type: entityId ? 'challenge' : null,
          entity_id: entityId,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // del-6: Audit log delegation creation
      await logAuditEvent({
        action: 'delegation_created',
        entityType: ENTITY_TYPES.CHALLENGE,
        entityId: entityId || 'global',
        metadata: {
          delegate_email: delegateEmail,
          permissions,
          start_date: startDate,
          end_date: endDate
        }
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-delegation'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-delegations-by-me'] });
      toast.success('Delegation created successfully');
    },
    onError: (error) => {
      console.error('[ChallengeDelegation] Create error:', error);
      toast.error('Failed to create delegation');
    }
  });

  // del-4: Revoke delegation
  const revokeDelegation = useMutation({
    mutationFn: async (delegationId) => {
      const { data: delegation } = await supabase
        .from('delegation_rules')
        .select('*')
        .eq('id', delegationId)
        .single();

      const { error } = await supabase
        .from('delegation_rules')
        .update({ 
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_by: user?.email
        })
        .eq('id', delegationId);

      if (error) throw error;

      // Audit log revocation
      await logAuditEvent({
        action: 'delegation_revoked',
        entityType: ENTITY_TYPES.CHALLENGE,
        entityId: delegation?.entity_id || 'global',
        metadata: {
          delegation_id: delegationId,
          delegate_email: delegation?.delegate_email
        }
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-delegation'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-delegations-by-me'] });
      toast.success('Delegation revoked');
    },
    onError: (error) => {
      console.error('[ChallengeDelegation] Revoke error:', error);
      toast.error('Failed to revoke delegation');
    }
  });

  // del-3: Extend delegation
  const extendDelegation = useMutation({
    mutationFn: async ({ delegationId, newEndDate }) => {
      const { error } = await supabase
        .from('delegation_rules')
        .update({ 
          end_date: newEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', delegationId);

      if (error) throw error;

      await logAuditEvent({
        action: 'delegation_extended',
        entityType: ENTITY_TYPES.CHALLENGE,
        entityId: challengeId || 'global',
        metadata: { delegation_id: delegationId, new_end_date: newEndDate }
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-delegation'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-delegations-by-me'] });
      toast.success('Delegation extended');
    }
  });

  // del-5: Check specific permission via delegation
  const hasDelegatedPermission = (permission) => {
    return delegatedAccess?.permissions?.includes(permission) || false;
  };

  // del-7 & del-8: Get escalation chain for challenge
  const { data: escalationChain } = useQuery({
    queryKey: ['challenge-escalation-chain', challengeId],
    queryFn: async () => {
      if (!challengeId) return [];

      // Get challenge owner and municipality hierarchy
      const { data: challenge } = await supabase
        .from('challenges')
        .select(`
          challenge_owner_email,
          municipality_id,
          review_assigned_to
        `)
        .eq('id', challengeId)
        .single();

      if (!challenge) return [];

      // Build escalation chain
      const chain = [];
      
      // Level 1: Assigned reviewer
      if (challenge.review_assigned_to) {
        chain.push({
          level: 1,
          role: 'Assigned Reviewer',
          email: challenge.review_assigned_to
        });
      }

      // Level 2: Challenge owner
      if (challenge.challenge_owner_email) {
        chain.push({
          level: 2,
          role: 'Challenge Owner',
          email: challenge.challenge_owner_email
        });
      }

      // Level 3: Municipality admin (if applicable)
      if (challenge.municipality_id) {
        const { data: municipalityAdmins } = await supabase
          .from('user_roles')
          .select('user_email')
          .eq('municipality_id', challenge.municipality_id)
          .eq('is_active', true);

        if (municipalityAdmins?.length > 0) {
          chain.push({
            level: 3,
            role: 'Municipality Admin',
            emails: municipalityAdmins.map(a => a.user_email)
          });
        }
      }

      return chain;
    },
    enabled: !!challengeId
  });

  return {
    // Access state
    delegatedAccess,
    hasDelegatedAccess: delegatedAccess?.hasAccess || false,
    delegatedPermissions: delegatedAccess?.permissions || [],
    accessLoading,

    // Permission check
    hasDelegatedPermission,
    canView: hasDelegatedPermission(CHALLENGE_PERMISSIONS.VIEW),
    canEdit: hasDelegatedPermission(CHALLENGE_PERMISSIONS.EDIT),
    canApprove: hasDelegatedPermission(CHALLENGE_PERMISSIONS.APPROVE),

    // My delegations
    myDelegations: myDelegations || [],
    delegationsLoading,

    // Mutations
    createDelegation: createDelegation.mutate,
    createDelegationAsync: createDelegation.mutateAsync,
    revokeDelegation: revokeDelegation.mutate,
    extendDelegation: extendDelegation.mutate,

    // Loading states
    isCreating: createDelegation.isPending,
    isRevoking: revokeDelegation.isPending,
    isExtending: extendDelegation.isPending,

    // Escalation
    escalationChain: escalationChain || [],

    // Constants
    PERMISSIONS: CHALLENGE_PERMISSIONS
  };
}

export default useChallengeDelegation;
